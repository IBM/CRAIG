const {
  eachKey,
  transpose,
  contains,
  splatContains,
  arraySplatIndex,
  carve,
  revision,
  isNullOrEmptyString,
  isEmpty,
  splat,
  isIpv4CidrOrAddress,
  isWholeNumber,
  titleCase,
  kebabCase,
  isInRange,
  isFunction,
  isArray,
  capitalize,
  containsKeys,
} = require("lazy-z");
const { commaSeparatedIpListExp, newResourceNameExp } = require("../constants");
const { validSshKey } = require("../forms/invalid-callbacks");
const { nameField } = require("./reusable-fields");
const {
  unconditionalInvalidText,
  fieldIsNullOrEmptyString,
  selectInvalidText,
} = require("./reusable-fields");
const { replicationEnabledStoragePoolMap } = require("../constants");

/**
 * set kms from encryption key on store update
 * @param {*} instance
 * @param {*} config
 */
function setKmsFromKeyOnStoreUpdate(serviceInstance, config) {
  serviceInstance.kms = null;
  config.store.json.key_management.forEach((instance) => {
    if (splatContains(instance.keys, "name", serviceInstance.encryption_key)) {
      serviceInstance.kms = instance.name;
    }
  });
  if (!serviceInstance.kms) {
    serviceInstance.kms = null;
    serviceInstance.encryption_key = null;
  }
}

/**
 * validate rule
 * @param {Object} networkRule
 * @param {Object} componentProps
 */
function formatNetworkingRule(networkRule, componentProps, isSecurityGroup) {
  let ruleRef = networkRule.rule ? networkRule.rule : networkRule;
  if (networkRule.showDeleteModal !== undefined)
    delete networkRule.showDeleteModal;
  if (networkRule.ruleProtocol) {
    if (networkRule.ruleProtocol === "icmp") {
      delete ruleRef.port_max;
      delete ruleRef.port_min;
    } else if (networkRule.ruleProtocol !== "all") {
      delete ruleRef.type;
      delete ruleRef.code;
    }
    if (networkRule.ruleProtocol !== "all" && componentProps.isSecurityGroup) {
      delete ruleRef.source_port_max;
      delete ruleRef.source_port_min;
    }
  }
  if (isSecurityGroup) {
    delete networkRule.action;
    delete networkRule.show;
    delete networkRule.destination;
  }
}

/**
 * update networking rule
 * @param {boolean} isAcl true for acl, false for security group
 * @param {Object} rule rule object
 * @param {Object} params params object
 */
function updateNetworkingRule(isAcl, rule, params) {
  let defaultRuleStyle = isAcl
    ? // acl rule style
      {
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      }
    : // security group rule style
      {
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: null,
          port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
        },
      };
  rule.ruleProtocol = params.ruleProtocol;
  eachKey(params, (key) => {
    if (isAcl && key === "allow") {
      // set action
      rule.action = params[key] ? "allow" : "deny";
    } else if (key === "inbound") {
      // set direction
      rule.direction = params[key] ? "inbound" : "outbound";
    } else if (key === "ruleProtocol" && params[key] === "all") {
      // if all protocol, hard reset
      transpose(defaultRuleStyle, rule);
    } else if (key === "ruleProtocol") {
      // if key is rule protocol, transpose rule
      transpose(defaultRuleStyle, rule);
      //transpose(params.rule || {}, rule[params.ruleProtocol]);
    } else if (key !== "rule") {
      // otherwise set value
      rule[key] = params[key];
    }
  });
  if (contains(["tcp", "udp", "icmp"], params.ruleProtocol)) {
    (params.ruleProtocol === "icmp"
      ? ["type", "code"]
      : isAcl
      ? ["port_min", "port_max", "source_port_min", "source_port_max"]
      : ["port_min", "port_max"]
    ).forEach((field) => {
      if (params[field]) {
        rule[params.ruleProtocol][field] = parseInt(params[field]);
      } else if (params.rule[field]) {
        rule[params.ruleProtocol][field] = parseInt(params.rule[field]);
      } else if (params.ruleProtocol === "icmp") {
        rule[params.ruleProtocol][field] = "null";
      } else {
        rule[params.ruleProtocol][field] = contains(field, "min") ? 1 : 65535;
      }
    });
  }
}

/**
 * shortcut for ["icmp", "tcp", "udp"].forEach
 * @param {eachProtocolCallback} eachProtocolCallback
 */
function eachRuleProtocol(eachProtocolCallback) {
  ["icmp", "tcp", "udp"].forEach((protocol) => {
    eachProtocolCallback(protocol);
  });
}

/**
 * build subnet tiers for a vpc
 * @param {*} vpcObject vpc object
 * @returns {Array<Object>} list of subnet tiers in that vpc
 */
function buildSubnetTiers(vpcObject) {
  let subnetTiers = []; // list of tiers to return
  let smallestZoneCidr = 0; // smallest zone cidr used to order tiers
  let advancedTiers = {};
  // for each subnet
  vpcObject.subnets.forEach((subnet) => {
    if (subnet.tier) {
      // create advanced tier object
      if (!advancedTiers[subnet.tier]) {
        advancedTiers[subnet.tier] = {
          name: subnet.tier,
          zones: undefined,
          select_zones: [],
          advanced: true,
          subnets: [],
        };
      }
      // add zone and name
      advancedTiers[subnet.tier].select_zones.push(subnet.zone);
      advancedTiers[subnet.tier].subnets.push(subnet.name);
    } else if (!subnet.use_data) {
      let tierName = subnet.name.replace(/-zone-\d/g, ""); // get tier name by replacing zone
      let arrayMethod = "push";
      // in order to make sure that subnet tiers are translated to be in
      // the correct order, array method is set to add new tiers. `push` is used to add to the end
      // and `unshift` is used to add to the beginning
      let subnetOrderCidr = parseInt(
        // replace everything that is not the zone determined portion of the CIDR
        // and convert to number
        subnet.cidr.replace(/\.\d+\/\d+/g, "").replace(/10\.\d+\./g, "")
      );
      if (smallestZoneCidr === 0) {
        // if just initialized, set to subnet order cidr
        smallestZoneCidr = subnetOrderCidr;
      } else if (subnetOrderCidr < smallestZoneCidr) {
        // if the cidr block is less than the previous one, set array method to unshift
        arrayMethod = "unshift";
      }
      if (!splatContains(subnetTiers, "name", tierName)) {
        // if the subnet tier does not exist in the list, add to list
        subnetTiers[arrayMethod]({
          name: tierName,
          zones: 1,
        });
      } else {
        // otherwise, increase number of zones
        let tierIndex = arraySplatIndex(subnetTiers, "name", tierName);
        subnetTiers[tierIndex].zones++;
      }
    }
  });
  // add advanced tiers
  eachKey(advancedTiers, (key) => {
    subnetTiers.push(advancedTiers[key]);
  });
  return subnetTiers;
}

/**
 * save advanced subnet tier function
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs list of vpcs
 * @param {Object} stateData
 * @param {string} stateData.networkAcl
 * @param {number} stateData.zones
 * @param {boolean} stateData.addPublicGateway
 * @param {boolean} stateData.advanced
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name tier name
 * @param {boolean} componentProps.data.advanced
 * @param {string} oldTierName
 * @param {Object} tierData
 * @param {string} vpcName
 * @param {string} newTierName
 * @param {number} vpcIndex
 */
function saveAdvancedSubnetTier(
  config,
  stateData,
  componentProps,
  oldTierName,
  tierData,
  vpcName,
  newTierName,
  vpcIndex
) {
  tierData.networkAcl = "-";
  tierData.zones = undefined;
  tierData.select_zones = stateData.zones || stateData.select_zones; // set select zone
  tierData.subnets = []; // set individual subnet managament
  new revision(config.store.json)
    .child("vpcs", vpcName, "name")
    .then((data) => {
      // get subnets
      let foundSubnets = data.subnets.filter((subnet) =>
        componentProps.data.advanced
          ? subnet.tier === newTierName
          : subnet.name.startsWith(oldTierName)
      );
      let nextTierSubnets = [];
      // for each subnet
      foundSubnets.forEach((subnet) => {
        // if is in current zone
        if (
          contains(tierData.select_zones, subnet.zone) ||
          contains(tierData.select_zones, String(subnet.zone))
        ) {
          let newSubnetName = subnet.name.replace(oldTierName, stateData.name);
          tierData.subnets.push(newSubnetName);
          nextTierSubnets.push({
            zone: subnet.zone,
            name: newSubnetName,
          });
          new revision(data).child("subnets", subnet.name).then((data) => {
            data.name = newSubnetName;
            data.tier = stateData.name;
            [
              "vsi",
              "vpn_servers",
              "virtual_private_endpoints",
              "f5_vsi",
            ].forEach((item) => {
              config.store.json[item].forEach((resource) => {
                if (resource.subnets)
                  for (let i = 0; i < resource.subnets.length; i++) {
                    if (resource.subnets[i].startsWith(oldTierName)) {
                      resource.subnets[i] = resource.subnets[i].replace(
                        oldTierName,
                        stateData.name
                      );
                    }
                  }
              });
            });
            config.store.json.clusters.forEach((cluster) => {
              for (let i = 0; i < cluster.subnets.length; i++) {
                if (cluster.subnets[i].startsWith(oldTierName)) {
                  cluster.subnets[i] = cluster.subnets[i].replace(
                    oldTierName,
                    stateData.name
                  );
                }
              }
              cluster.worker_pools.forEach((pool) => {
                for (let i = 0; i < pool.subnets.length; i++) {
                  if (pool.subnets[i].startsWith(oldTierName)) {
                    pool.subnets[i] = pool.subnets[i].replace(
                      oldTierName,
                      stateData.name
                    );
                  }
                }
              });
            });
            config.store.json.dns.forEach((dns) => {
              dns.custom_resolvers.forEach((resolver) => {
                resolver.subnets.forEach((subnet, index) => {
                  if (subnet.startsWith(oldTierName)) {
                    resolver.subnets[index] = resolver.subnets[index].replace(
                      oldTierName,
                      stateData.name
                    );
                  }
                });
              });
            });
          });
        } else {
          // otherwise delete
          carve(data.subnets, "name", subnet.name);
        }
      });
      if (
        tierData.subnets.length <
        stateData[stateData.select_zones ? "select_zones" : "zones"].length
      ) {
        [1, 2, 3].forEach((zone) => {
          if (!splatContains(nextTierSubnets, "zone", zone)) {
            data.subnets.push({
              name: newTierName + "-zone-" + zone,
              cidr: "",
              network_acl: "",
              public_gateway: false,
              zone: zone,
              vpc: componentProps.vpc_name,
              resource_group: config.store.json.vpcs[vpcIndex].resource_group,
              has_prefix: true,
              tier: newTierName,
            });
            tierData.subnets.push(newTierName + "-zone-" + zone);
          }
        });
      }
    });
}

/**
 * shortcut for form field is empty
 * @param {*} fieldName
 * @returns {Function}
 */
function fieldIsEmpty(fieldName) {
  return function (stateData) {
    return isEmpty(stateData[fieldName] || []);
  };
}

/**
 * util function for component save to be disabled
 * @param {*} fields
 * @param {string} component
 * @param {string=} subComponent name of subcomponent
 * @returns {Function} should disable save function
 */
function shouldDisableComponentSave(fields, component, subComponent) {
  return function (config, stateData, componentProps) {
    let shouldBeDisabled = false;
    fields.forEach((field) => {
      if (!shouldBeDisabled) {
        shouldBeDisabled = (
          subComponent ? config[component][subComponent] : config[component]
        )[field].invalid(stateData, componentProps);
      }
    });
    return shouldBeDisabled;
  };
}

/**
 * test for invalid IP string/CIDR
 * @param {string} value
 * @returns {boolean} true if invalid
 */
function isIpStringInvalid(value) {
  if (
    !isNullOrEmptyString(value) &&
    value.match(commaSeparatedIpListExp) === null
  ) {
    return true;
  }
  return false;
}

/**
 * resource group
 * @param {boolean=} small make small
 * @param {object} options
 * @returns {object} object for resource groups page
 */
function resourceGroupsField(small, options) {
  return {
    default: "",
    invalid: options?.invalid
      ? options.invalid
      : fieldIsNullOrEmptyString("resource_group"),
    invalidText: selectInvalidText("resource group"),
    type: "select",
    groups: function (stateData, componentProps) {
      return splat(componentProps.craig.store.json.resource_groups, "name");
    },
    hideWhen: hideWhenUseData,
    size: small ? "small" : undefined,
    labelText: options?.labelText || undefined,
  };
}

/**
 * test for invalid range
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean} true if invalid
 */
function isRangeInvalid(value, min, max) {
  if (isNullOrEmptyString(value)) return false;
  value = parseFloat(value);
  if (!isWholeNumber(value) || !isInRange(value, min, max)) {
    return true;
  }
  return false;
}

/**
 * return validation function if value is not a valid IPV4 IP address
 * @param {*} field
 */
function invalidIpv4Address(field) {
  return function (stateData) {
    return (
      !stateData[field] ||
      !isIpv4CidrOrAddress(stateData[field]) ||
      contains(stateData[field], "/")
    );
  };
}

/**
 * invalid ipv4 address text
 * @returns {string} invalid text
 */
function invalidIpv4AddressText() {
  return "Enter a valid IP address";
}

/**
 * return a validation function to check if a value is a whole number
 * @param {*} field
 * @returns {Function} validation function
 */
function wholeNumberField(field, lazy) {
  return function (stateData) {
    if (isNullOrEmptyString(stateData[field], true) && lazy) {
      return false;
    } else
      return (
        !isWholeNumber(parseInt(stateData[field])) ||
        // parse numbers into string for checks
        String(stateData[field]).match(/\D/g) !== null
      );
  };
}

/**
 * return invalid text for not whole number
 */
function wholeNumberText() {
  return "Enter a whole number";
}

/**
 * render in title case
 * @param {*} field
 * @returns {string} render string
 */
function titleCaseRender(field) {
  return function (stateData) {
    return isNullOrEmptyString(stateData[field])
      ? ""
      : titleCase(stateData[field])
          .replace("1 2", "12")
          .replace("2 4", "24")
          .replace("4 8", "48")
          .replace("9 6", "96");
  };
}

/**
 * on input change stor as kebab case
 * @param {*} field
 * @returns {string} state string
 */
function kebabCaseInput(field) {
  return function (stateData) {
    return kebabCase(stateData[field]);
  };
}

/**
 * hide when use data
 * @param {*} stateData
 * @returns
 */
function hideWhenUseData(stateData) {
  return stateData.use_data;
}

/**
 * create schema for ssh key
 * @param {*} fieldName
 * @returns {object} object for schema
 */
function sshKeySchema(fieldName) {
  function invalidSshKey(stateData, componentProps) {
    if (stateData.use_data) {
      return false;
    } else if (
      // if key is not valud and is not NONE
      !validSshKey(stateData.public_key) &&
      stateData.public_key !== "NONE"
    ) {
      return true;
    } else if (fieldName === "power_vs_ssh_keys") {
      let otherPublicKeys = [];
      // for each power workspace
      componentProps.craig.store.json.power.forEach((workspace) => {
        // if the workspace matches the workspace
        if (workspace.name === componentProps.arrayParentName)
          // create a list of ssh keys that does not include NONE and
          // does not have the same name as the array parent
          otherPublicKeys = otherPublicKeys.concat(
            splat(
              workspace.ssh_keys.filter((sshKey) => {
                if (sshKey.name !== componentProps.data.name) {
                  return sshKey;
                }
              }),
              "public_key"
            ).filter((pubKey) => {
              if (pubKey !== "NONE") return pubKey;
            })
          );
      });
      return contains(otherPublicKeys, stateData.public_key);
    } else {
      let otherPublicKeys = [];
      otherPublicKeys = otherPublicKeys.concat(
        splat(
          // add keys that do not have the name of the current key
          componentProps.craig.store.json[fieldName].filter((sshKey) => {
            if (sshKey.name !== componentProps.data.name) {
              return sshKey;
            }
          }),
          "public_key"
        ).filter((pubKey) => {
          // remove none keys
          if (pubKey !== "NONE") return pubKey;
        })
      );
      return contains(otherPublicKeys, stateData.public_key);
    }
  }
  let schema = {
    name: nameField(fieldName),
    public_key: {
      type: "public-key",
      default: null,
      invalid: invalidSshKey,
      invalidText: function (stateData, componentProps) {
        return !validSshKey(stateData.public_key) &&
          stateData.public_key !== "NONE"
          ? "Provide a unique SSH public key that does not exist in the IBM Cloud account in your region"
          : invalidSshKey(stateData, componentProps)
          ? "SSH Public Key in use"
          : "";
      },
      hideWhen: function (stateData) {
        return stateData.use_data;
      },
    },
  };
  if (fieldName === "ssh_keys" || fieldName === "power_vs_ssh_keys") {
    if (fieldName === "ssh_keys")
      schema.resource_group = resourceGroupsField(false, {
        invalid: function (stateData) {
          return stateData.use_data
            ? false
            : fieldIsNullOrEmptyString("resource_group")(stateData);
        },
      });
    schema.use_data = {
      type: "toggle",
      labelText: "Use Existing SSH Key",
      default: false,
    };
  }
  return schema;
}

/**
 * get vpc groups
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Array<string>} list of vpcs
 */
function vpcGroups(stateData, componentProps) {
  return splat(componentProps.craig.store.json.vpcs, "name");
}

/**
 * force update on vpc change
 * @param {*} stateData
 * @returns {string} vpc name as key for multiselect to reset selected items
 */
function forceUpdateOnVpcChange(stateData) {
  return stateData.vpc;
}

/**
 * create a multiselect for subnet
 * @param {object=} options optional override params
 * @param {Function=} options.invalid replacement invalid function
 * @param {string=} options.invalidText replacement invalid text
 * @returns {object} schema for subnet field
 */
function subnetMultiSelect(options) {
  return {
    size: "small",
    type: "multiselect",
    forceUpdateKey: forceUpdateOnVpcChange,
    default: [],
    invalid: function (stateData) {
      return (
        !stateData.subnets ||
        isEmpty(stateData.subnets) ||
        (isFunction(options?.invalid) && options.invalid(stateData))
      );
    },
    invalidText: unconditionalInvalidText(
      options?.invalidText ? options.invalidText : "Select at least one subnet"
    ),
    groups: function (stateData, componentProps) {
      if (isNullOrEmptyString(stateData.vpc, true)) {
        return [];
      } else {
        return splat(
          new revision(componentProps.craig.store.json).child(
            "vpcs",
            stateData.vpc
          ).data.subnets,
          "name"
        );
      }
    },
  };
}

/**
 * sg multiselect
 * @returns {object} schema object
 */
function securityGroupsMultiselect() {
  return {
    type: "multiselect",
    size: "small",
    default: [],
    invalid: function (stateData) {
      return !stateData.security_groups || isEmpty(stateData.security_groups);
    },
    invalidText: unconditionalInvalidText("Select at least one security group"),
    groups: function (stateData, componentProps) {
      return splat(
        componentProps.craig.store.json.security_groups.filter((sg) => {
          if (sg.vpc === stateData.vpc) {
            return sg;
          }
        }),
        "name"
      );
    },
    forceUpdateKey: forceUpdateOnVpcChange,
  };
}

/**
 * shortcut for field is null or empty string if enabled is true
 * @param {*} field
 * @returns {Function}
 */
function fieldIsNullOrEmptyStringEnabled(field) {
  return function (stateData) {
    return stateData.enabled ? isNullOrEmptyString(stateData[field]) : false;
  };
}

/**
 * shortcut for field needs to be whole number
 * @param {*} field
 * @returns {Function}
 */
function fieldIsNotWholeNumber(field, min, max) {
  return function (stateData) {
    return Number(stateData[field]) % 1 !== 0
      ? true
      : !isNullOrEmptyString(stateData[field])
      ? !isInRange(Number(stateData[field]), min, max)
      : true;
  };
}

/**
 * shortcut for ttl
 * @returns {Function} function
 */
function timeToLive() {
  return {
    labelText: "Time to Live (Seconds)",
    default: "",
    optional: true,
    invalid: function (stateData) {
      return isNullOrEmptyString(stateData.ttl, true)
        ? false
        : fieldIsNotWholeNumber("ttl", 300, 2147483647)(stateData);
    },
    invalidText: unconditionalInvalidText(
      "Enter a whole number between 300 and 2147483647"
    ),
    placeholder: "300",
  };
}

/**
 * encryption key groups
 * @returns {Function} shortcut function
 */
function encryptionKeyGroups(stateData, componentProps) {
  return componentProps.craig.store.encryptionKeys;
}

/*
 * ip cidr list text area
 * @param {*} options
 * @returns {object} schema object
 */
function ipCidrListTextArea(field, options) {
  return {
    tooltip: options.tooltip || undefined,
    default: [],
    type: "textArea",
    labelText: options.labelText || "Additional Address Prefixes",
    placeholder: "X.X.X.X/X, X.X.X.X/X, ...",
    invalid: function (stateData) {
      return isNullOrEmptyString(stateData[field], true) && !options.strict
        ? false
        : // prevent empty array from passing regex
        options.strict && isEmpty(stateData[field])
        ? true
        : isIpStringInvalid(
            // when additional prefixes is not array, check as string
            isArray(stateData[field])
              ? stateData[field].join(",")
              : stateData[field]
          );
    },
    invalidText: unconditionalInvalidText(
      "Enter a valid comma separated list of IPV4 CIDR blocks"
    ),
    onRender: function (stateData) {
      return isNullOrEmptyString(stateData[field], true)
        ? ""
        : stateData[field].join(",");
    },
    onInputChange: function (stateData) {
      return isNullOrEmptyString(stateData[field], true)
        ? []
        : stateData[field].split(/,\s?/g);
    },
  };
}

/**
 * shortcut for array input change
 * @param {*} field
 * @returns {Function}
 */
function onArrayInputChange(field) {
  return function (stateData) {
    return isNullOrEmptyString(stateData[field], true)
      ? []
      : stateData[field]
          .replace(/\s\s+/g, "") // replace extra spaces
          .replace(/,(?=,)/g, "") // prevent null tags from
          .replace(/[^\w,-]/g, "")
          .split(",");
  };
}

/**
 * hide helper text shortcut
 * @returns null
 */
function hideHelperText() {
  return null;
}

/**
 * shortcut for vpc ssh keys
 * @returns {object} schema object
 */
function vpcSshKeyMultiselect(isF5) {
  return {
    labelText: "SSH Keys",
    size: "small",
    type: "multiselect",
    default: [],
    invalid: isF5
      ? function (stateData) {
          return stateData.zones === "0"
            ? false
            : fieldIsEmpty("ssh_keys")(stateData);
        }
      : fieldIsEmpty("ssh_keys"),
    invalidText: unconditionalInvalidText("Select at least one SSH Key"),
    groups: function (stateData, componentProps) {
      return splat(componentProps.craig.store.json.ssh_keys, "name");
    },
  };
}

/**
 * shortcut for workspaces
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Array<string>}
 */
function powerVsWorkspaceGroups(stateData, componentProps) {
  return splat(componentProps.craig.store.json.power, "name");
}

/**
 * get power vs storage options field
 * @param {boolean=} isVolume true if is volume
 * @param {Function=} hideWhen override hidewhen function
 * @returns {object} schema object
 */
function powerVsStorageOptions(isVolume, hideWhen) {
  return {
    size: "small",
    default: "",
    type: "select",
    groups: ["None", "Storage Pool", "Affinity", "Anti-Affinity"],
    /**
     * check to see if storage for a power vs instance or volume should be disabled
     * @param {*} stateData
     * @param {*} componentProps
     * @returns {boolean} true if disabled
     */
    disabled: function storageChangeDisabledCallback(
      stateData,
      componentProps
    ) {
      if (componentProps.isModal) return false;
      let isInUse = false;
      ["power_instances", "power_volumes"].forEach((field) => {
        (componentProps[field]
          ? componentProps[field]
          : // store is for refactored items
            componentProps.craig.store.json[field]
        ).forEach((item) => {
          // get test items, for instance tests check for network field
          let testItems = containsKeys(stateData, "network")
            ? [item.pi_anti_affinity_instance, item.pi_affinity_instance]
            : [item.pi_affinity_volume, item.pi_anti_affinity_volume];
          if (contains(testItems, componentProps.data.name)) {
            isInUse = true;
          }
        });
      });
      return isInUse;
    },
    invalid: function (stateData) {
      return (
        isNullOrEmptyString(stateData.storage_option, true) ||
        (stateData.storage_option === "Storage Pool" &&
          isNullOrEmptyString(stateData.workspace))
      );
    },
    invalidText: function (stateData, componentProps) {
      return isNullOrEmptyString(stateData.workspace, true)
        ? "Select a workspace"
        : "Select a storage option";
    },
    onStateChange: function (stateData) {
      if (stateData.storage_option !== "Storage Pool") {
        stateData[isVolume ? "pi_volume_pool" : "pi_storage_pool"] = null;
      }
      if (stateData.storage_option !== "Affinity") {
        stateData.pi_affinity_policy = null;
        stateData.pi_affinity_volume = null;
        stateData.pi_affinity_instance = null;
      }
      if (stateData.storage_option !== "Anti-Affinity") {
        stateData.pi_anti_affinity_volume = null;
        stateData.pi_anti_affinity_instance = null;
      }
      if (contains(["Affinity", "Anti-Affinity"], stateData.storage_option)) {
        stateData.pi_affinity_policy = stateData.storage_option.toLowerCase();
      } else {
        stateData.pi_affinity_policy = null;
      }
      stateData.affinity_type = null;
    },
    hideWhen: hideWhen,
  };
}

/**
 * get power vs storage type field
 * @param {boolean=} isVolume true if is volume
 * @returns {object} schema object
 */
function powerVsStorageType(isVolume, hideWhen) {
  let storageField = isVolume ? "pi_volume_type" : "pi_storage_type";
  return {
    size: "small",
    default: null,
    type: "fetchSelect",
    labelText: "Storage Tiers",
    groups: [],
    invalid: function (stateData) {
      return isNullOrEmptyString(stateData[storageField]);
    },
    invalidText: selectInvalidText("Storage Tier"),
    onRender: function (stateData) {
      return isNullOrEmptyString(stateData[storageField])
        ? ""
        : stateData[storageField] === "tier5k"
        ? "Fixed IOPs"
        : capitalize(stateData[storageField].split(/(?=\d)/).join("-"));
    },
    onInputChange: function (stateData) {
      return stateData[storageField] === "Fixed IOPs"
        ? "tier5k"
        : stateData[storageField].toLowerCase().replace(/-/, "");
    },
    apiEndpoint: function (stateData) {
      return `/api/power/${stateData.zone}/storage-tiers`;
    },
    hideWhen: function (stateData, componentProps) {
      return (
        (hideWhen && hideWhen(stateData, componentProps)) ||
        isNullOrEmptyString(stateData.zone, true)
      );
    },
  };
}

/**
 * shortcut for affinity type
 * @returns {Object} schema object
 */
function powerVsAffinityType() {
  return {
    default: null,
    hideWhen: function (stateData) {
      return !contains(["Affinity", "Anti-Affinity"], stateData.storage_option);
    },
    type: "select",
    size: "small",
    onRender: function (stateData) {
      return isNullOrEmptyString(stateData.affinity_type)
        ? ""
        : stateData.affinity_type;
    },
    groups: ["Instance", "Volume"],
    invalid: function (stateData) {
      return (
        contains(["Affinity", "Anti-Affinity"], stateData.storage_option) &&
        isNullOrEmptyString(stateData.affinity_type, true)
      );
    },
    invalidText: function (stateData) {
      return `Select an ${stateData.storage_option} option`;
    },
  };
}

/**
 * generate function to handle hide/show affinity volumes
 * @param {string} option volume or instance
 * @param {string} type affinity or anti-affinity
 */
function hidePowerAffinityOption(option, type) {
  return function (stateData) {
    return (
      stateData.storage_option !== option || stateData.affinity_type !== type
    );
  };
}

/**
 * Affinity invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerAffinityInvalid(stateData, option, type, field) {
  return (
    (stateData.storage_option === option && !stateData.affinity_type) ||
    (stateData.storage_option === option &&
      stateData.affinity_type &&
      stateData.affinity_type === type &&
      isNullOrEmptyString(stateData[field]))
  );
}

/**
 * generate a function to handle invalid text
 * @param {string} text text to add to invalid text
 */
function powerVsInstanceInvalidText(text) {
  return function (stateData) {
    if (isNullOrEmptyString(stateData.workspace)) {
      return "Select a workspace";
    } else return "Select " + text;
  };
}

/**
 * filter function to get affinity volumes based on instance policy
 * @param {*} volume
 * @returns {string} volume name
 */
function powerVsAffinityVolumesFilter(stateData, componentProps) {
  return splat(
    componentProps.craig.store.json.power_volumes.filter((volume) => {
      if (volume.workspace === stateData.workspace) return volume;
    }),
    "name"
  );
}

/**
 * filter function to get affinity instances based on instance policy
 * @param {*} volume
 * @returns {string} volume name
 */
function powerVsAffinityInstancesFilter(stateData, componentProps) {
  return splat(
    componentProps.craig.store.json.power_instances.filter((instance) => {
      if (instance.workspace === stateData.workspace) return instance;
    }),
    "name"
  );
}

/**
 * power affinity shortcut
 */
function powerAffinityVolume() {
  return {
    invalid: function (stateData) {
      return powerAffinityInvalid(
        stateData,
        "Affinity",
        "Volume",
        "pi_affinity_volume"
      );
    },
    labelText: "Affinity Volume",
    invalidText: powerVsInstanceInvalidText("an affinity volume"),
    default: null,
    size: "small",
    hideWhen: hidePowerAffinityOption("Affinity", "Volume"),
    type: "select",
    groups: powerVsAffinityVolumesFilter,
  };
}

/**
 * power affinity shortcut
 */
function powerAffinityInstance() {
  return {
    default: null,
    invalid: function (stateData) {
      return powerAffinityInvalid(
        stateData,
        "Affinity",
        "Instance",
        "pi_affinity_instance"
      );
    },
    labelText: "Affinity Instance",
    invalidText: powerVsInstanceInvalidText("an affinity instance"),
    size: "small",
    hideWhen: hidePowerAffinityOption("Affinity", "Instance"),
    type: "select",
    groups: powerVsAffinityInstancesFilter,
  };
}

/**
 * power affinity shortcut
 */

function powerAntiAffinityVolume() {
  return {
    labelText: "Anti-Affinity Volume",
    hideWhen: hidePowerAffinityOption("Anti-Affinity", "Volume"),
    default: null,
    invalid: function (stateData) {
      return powerAffinityInvalid(
        stateData,
        "Anti-Affinity",
        "Volume",
        "pi_anti_affinity_volume"
      );
    },
    invalidText: powerVsInstanceInvalidText("an anti affinity volume"),
    type: "select",
    groups: powerVsAffinityVolumesFilter,
    size: "small",
  };
}

/**
 * power affinity shortcut
 */

function powerAntiAffinityInstance() {
  return {
    labelText: "Anti-Affinity Instance",
    default: null,
    invalid: function (stateData) {
      return powerAffinityInvalid(
        stateData,
        "Anti-Affinity",
        "Instance",
        "pi_anti_affinity_instance"
      );
    },
    invalidText: powerVsInstanceInvalidText("an anti affinity instance"),
    size: "small",
    hideWhen: hidePowerAffinityOption("Anti-Affinity", "Instance"),
    type: "select",
    groups: powerVsAffinityInstancesFilter,
  };
}

/**
 * power storage pool select
 * @param {boolean=} isVolume
 * @returns {object} object
 */
function powerStoragePoolSelect(isVolume) {
  let field = isVolume ? "pi_volume_pool" : "pi_storage_pool";
  return {
    size: "small",
    type: "fetchSelect",
    default: "",
    labelText: "Storage Pool",
    hideWhen: function (stateData) {
      return (
        stateData.storage_option !== "Storage Pool" ||
        isNullOrEmptyString(stateData.workspace)
      );
    },
    invalid: function (stateData) {
      return (
        stateData.storage_option === "Storage Pool" &&
        (!stateData[field] || isNullOrEmptyString(stateData[field]))
      );
    },
    invalidText: function (stateData, componentProps) {
      return isNullOrEmptyString(stateData.workspace, true)
        ? "Select a workspace"
        : selectInvalidText("storage pool")(stateData, componentProps);
    },
    onInputChange: function (stateData) {
      let replicationEnabledPools =
        replicationEnabledStoragePoolMap[stateData.zone] || [];
      if (
        !contains(replicationEnabledPools, stateData[field]) &&
        !stateData[field].includes("(Replication Enabled)")
      ) {
        stateData.pi_replication_enabled = false;
      }

      return stateData[field];
    },
    apiEndpoint: function (stateData, componentProps) {
      return `/api/power/${stateData.zone}/storage-pools`;
    },
    groups: [],
  };
}

function cbrValuePlaceholder(type) {
  return type === "ipAddress"
    ? "x.x.x.x"
    : type === "ipRange"
    ? "x.x.x.x-x.x.x.x"
    : `my-cbr-zone-${type}`;
}

function cbrTitleCase(field) {
  return function (stateData) {
    return isNullOrEmptyString(stateData[field])
      ? ""
      : titleCase(stateData[field])
          .replace("Ipa", "IP A")
          .replace("Ip R", "IP R")
          .replace("Serviceref", "Service Ref");
  };
}

function cbrSaveType(field) {
  return function (stateData) {
    stateData.value = ""; // clear value on type change
    return stateData[field] === "IP Address"
      ? "ipAddress"
      : stateData[field] === "IP Range"
      ? "ipRange"
      : stateData[field] === "Service Ref"
      ? "serviceRef"
      : stateData[field] === "Subnet"
      ? "subnet"
      : stateData[field] === "Vpc"
      ? "vpc"
      : "";
  };
}

/**
 * invalid tags
 * @param {Array<string>} tags list of tags
 * @returns {boolean} true if any tags in list are invalid
 */
function invalidTagList(tags) {
  if (!tags || tags.length === 0) return false;
  let invalid = false;
  tags.forEach((tag) => {
    if (tag.match(newResourceNameExp) === null || tag.length > 128) {
      invalid = true;
    }
  });
  return invalid;
}

module.exports = {
  invalidTagList,
  hideHelperText,
  encryptionKeyGroups,
  invalidIpv4Address,
  invalidIpv4AddressText,
  formatNetworkingRule,
  updateNetworkingRule,
  eachRuleProtocol,
  buildSubnetTiers,
  saveAdvancedSubnetTier,
  setKmsFromKeyOnStoreUpdate,
  fieldIsNullOrEmptyString,
  fieldIsNullOrEmptyStringEnabled,
  shouldDisableComponentSave,
  isIpStringInvalid,
  fieldIsEmpty,
  selectInvalidText,
  resourceGroupsField,
  wholeNumberField,
  wholeNumberText,
  titleCaseRender,
  kebabCaseInput,
  unconditionalInvalidText,
  isRangeInvalid,
  sshKeySchema,
  vpcGroups,
  hideWhenUseData,
  subnetMultiSelect,
  forceUpdateOnVpcChange,
  fieldIsNotWholeNumber,
  timeToLive,
  securityGroupsMultiselect,
  ipCidrListTextArea,
  onArrayInputChange,
  vpcSshKeyMultiselect,
  powerVsWorkspaceGroups,
  powerVsStorageOptions,
  powerVsStorageType,
  powerVsAffinityType,
  powerAffinityVolume,
  powerAffinityInstance,
  powerAntiAffinityVolume,
  powerAntiAffinityInstance,
  powerStoragePoolSelect,
  cbrValuePlaceholder,
  cbrTitleCase,
  cbrSaveType,
  powerAffinityInvalid,
};
