const {
  eachKey,
  transpose,
  contains,
  allFieldsNull,
  splatContains,
  arraySplatIndex,
  carve,
  revision,
  isNullOrEmptyString,
  isEmpty,
  splat,
  validPortRange,
  isIpv4CidrOrAddress,
  isWholeNumber,
  titleCase,
  kebabCase,
  isInRange,
} = require("lazy-z");
const { commaSeparatedIpListExp } = require("../constants");
const {
  invalidName,
  invalidSshPublicKey,
} = require("../forms/invalid-callbacks");
const { invalidNameText } = require("../forms/text-callbacks");
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
  if (networkRule.showDeleteModal !== undefined)
    delete networkRule.showDeleteModal;
  if (networkRule.ruleProtocol) {
    if (networkRule.ruleProtocol === "icmp") {
      delete networkRule.rule.port_max;
      delete networkRule.rule.port_min;
    } else if (networkRule.ruleProtocol !== "all") {
      delete networkRule.rule.type;
      delete networkRule.rule.code;
    }
    if (networkRule.ruleProtocol !== "all" && componentProps.isSecurityGroup) {
      delete networkRule.rule.source_port_max;
      delete networkRule.rule.source_port_min;
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
      transpose(params.rule, rule[params.ruleProtocol]);
      let allTargetFieldsNull = allFieldsNull(rule[params.ruleProtocol]);
      eachKey(rule[params.ruleProtocol], (key) => {
        if (rule[params.ruleProtocol][key] !== null) {
          rule[params.ruleProtocol][key] = parseInt(
            rule[params.ruleProtocol][key]
          );
        } else if (allTargetFieldsNull && params.ruleProtocol === "icmp") {
          rule[params.ruleProtocol][key] = "null";
        } else if (
          allTargetFieldsNull &&
          contains(["port_min", "source_port_min"], key)
        ) {
          rule[params.ruleProtocol][key] = 1;
        } else if (
          allTargetFieldsNull &&
          contains(["source_port_max", "port_max"], key)
        ) {
          rule[params.ruleProtocol][key] = 65535;
        }
      });
    } else if (key !== "rule") {
      // otherwise set value
      rule[key] = params[key];
    }
  });
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
    } else {
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
  tierData.select_zones = stateData.select_zones; // set select zone
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
        if (contains(stateData.select_zones, subnet.zone)) {
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
      if (tierData.subnets.length < stateData.select_zones.length) {
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
 * shortcut for field is null or empty string
 * @param {*} fieldName
 * @param {boolean} lazy  true if field cannot be undefined
 * @returns {Function}
 */
function fieldIsNullOrEmptyString(fieldName, lazy) {
  return function (stateData) {
    return stateData.use_data
      ? false
      : isNullOrEmptyString(stateData[fieldName], lazy);
  };
}

/**
 * shortcut for form field is empty
 * @param {*} fieldName
 * @returns {Function}
 */
function fieldIsEmpty(fieldName) {
  return function (stateData) {
    return isEmpty(stateData[fieldName]);
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
 * name helper text
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {string} composed name with prefix prepended
 */
function nameHelperText(stateData, componentProps) {
  return `${
    stateData.use_data
      ? ""
      : componentProps.craig.store.json._options.prefix + "-"
  }${stateData.name || ""}`;
}

/**
 * default for select
 * @param {*} field
 * @returns {string} select text
 */
function selectInvalidText(field) {
  return function () {
    return `Select a ${field}`;
  };
}

/**
 * name field
 * @param {*} jsonField
 * @returns {Object} name field
 */
function nameField(jsonField) {
  return {
    default: "",
    invalid: invalidName(jsonField),
    invalidText: invalidNameText(jsonField),
    helperText: nameHelperText,
  };
}

/**
 * resource group
 * @param {boolean=} small make small
 * @returns {object} object for resource groups page
 */
function resourceGroupsField(small) {
  return {
    default: "",
    invalid: fieldIsNullOrEmptyString("resource_group"),
    invalidText: selectInvalidText("resource_group"),
    type: "select",
    groups: function (stateData, componentProps) {
      return splat(componentProps.craig.store.json.resource_groups, "name");
    },
    hideWhen: hideWhenUseData,
    size: small ? "small" : undefined,
  };
}

/*
 * test if a rule has an invalid port
 * @param {*} rule
 * @param {boolean=} isSecurityGroup
 * @returns {boolean} true if port is invalid
 */
function invalidPort(rule, isSecurityGroup) {
  let hasInvalidPort = false;
  if (rule.ruleProtocol !== "all") {
    (rule.ruleProtocol === "icmp"
      ? ["type", "code"]
      : isSecurityGroup
      ? ["port_min", "port_max"]
      : ["port_min", "port_max", "source_port_min", "source_port_max"]
    ).forEach((type) => {
      if (rule.rule[type] && !hasInvalidPort) {
        hasInvalidPort = !validPortRange(type, rule.rule[type]);
      }
    });
  }
  return hasInvalidPort;
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
 * invalid tcp or udp callback function
 * @param {*} stateData
 * @returns {boolean} true if invalid
 */
function invalidTcpOrUdpPort(stateData) {
  return contains(["all", "icmp"], stateData.ruleProtocol)
    ? false
    : invalidPort(stateData);
}

/**
 * invalid icmp code or type callback
 * @param {*} stateData
 * @returns {boolean} true if invalid
 */
function invalidIcmpCodeOrType(stateData) {
  return contains(["all", "tcp", "udp"], stateData.ruleProtocol)
    ? false
    : invalidPort(stateData);
}

/**
 * return validation function if value is not a valid IPV4 IP address
 * @param {*} field
 */
function invalidIpv4Address(field) {
  return function (stateData) {
    return (
      !isIpv4CidrOrAddress(stateData[field]) || contains(stateData[field], "/")
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
        stateData[field].match(/\D/g) !== null
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
 * callback function for unconditional invalid text
 * @param {string} text
 * @returns {Function} function that return text
 */
function unconditionalInvalidText(text) {
  return function () {
    return text;
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
  let schema = {
    name: {
      default: "",
      invalid: invalidName(fieldName),
      invalidText: invalidNameText(fieldName),
    },
    public_key: {
      type: "public-key",
      default: null,
      invalid: function (stateData, componentProps) {
        return stateData.use_data
          ? false
          : invalidSshPublicKey(stateData, componentProps).invalid;
      },
      invalidText: function (stateData, componentProps) {
        return invalidSshPublicKey(stateData, componentProps).invalidText;
      },
      hideWhen: function (stateData) {
        return stateData.use_data;
      },
    },
  };
  if (fieldName === "ssh_keys") {
    schema.resource_group = resourceGroupsField();
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

module.exports = {
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
  nameHelperText,
  selectInvalidText,
  resourceGroupsField,
  nameField,
  invalidTcpOrUdpPort,
  invalidIcmpCodeOrType,
  invalidPort,
  wholeNumberField,
  wholeNumberText,
  titleCaseRender,
  kebabCaseInput,
  unconditionalInvalidText,
  isRangeInvalid,
  sshKeySchema,
  vpcGroups,
  hideWhenUseData,
};
