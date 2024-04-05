const {
  contains,
  allFieldsNull,
  validPortRange,
  splat,
  isNullOrEmptyString,
  nestedSplat,
  revision,
  transpose,
} = require("lazy-z");
const { newResourceNameExp, datacenters } = require("../constants");
const { getAllSecrets } = require("../forms/utils");
const { RegexButWithWords } = require("regex-but-with-words");

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
 * shortcut for field is null or empty string
 * @param {*} fieldName
 * @param {boolean} lazy  true if field cannot be undefined
 * @returns {Function}
 */
function fieldIsNullOrEmptyString(fieldName, lazy) {
  return function (stateData) {
    return stateData.use_data && !lazy
      ? false
      : isNullOrEmptyString(stateData[fieldName], lazy);
  };
}

/**
 * check to see if a resource has a valid name
 * @param {string} str name
 * @returns {boolean} true if name is invalid
 */
function invalidNewResourceName(str) {
  return str ? str.match(newResourceNameExp) === null : true;
}

/**
 * check for duplicate name
 * @param {string} field name of the field within store json to check
 * @param {Object} stateData
 * @param {string} stateData.name
 * @param {Object} componentProps
 * @param {Object} componentProps.craig
 * @param {Object} componentProps.craig.store
 * @param {Object} componentProps.craig.store.json
 * @param {Object} componentProps.data
 * @param {string} componentProps.data.name
 * @returns {boolean} true if has duplicate name
 */
function hasDuplicateName(field, stateData, componentProps, overrideField) {
  let allOtherNames = [];
  let stateField = overrideField || "name";
  if (field === "connections") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.vpn_gateways,
      "connections",
      "name"
    );
  } else if (field === "origins" || field === "health_checks") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.cis_glbs,
      field,
      "name"
    );
  } else if (field === "profile_attachments") {
    allOtherNames = splat(
      componentProps.craig.store.json.scc_v2.profile_attachments,
      "name"
    );
  } else if (field === "cis") {
    allOtherNames = splat(componentProps.craig.store.json.cis, "name");
  } else if (field === "cis_dns_record") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.cis,
      "dns_records",
      "name"
    );
  } else if (field === "prefix_filters") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.transit_gateways,
      "prefix_filters",
      "name"
    );
  } else if (field === "appid_key") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.appid,
      "keys",
      "name"
    );
  } else if (field === "encryption_keys") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.key_management,
      "keys",
      "name"
    );
  } else if (field === "volume") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.vsi,
      "volumes",
      "name"
    );
  } else if (field === "worker_pools") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.clusters,
      "worker_pools",
      "name"
    );
  } else if (field === "opaque_secrets") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.clusters,
      "opaque_secrets",
      "name"
    );
  } else if (field === "secrets_group") {
    componentProps.craig.store.json.clusters.forEach((cluster) => {
      cluster.opaque_secrets.forEach((secret) => {
        allOtherNames.push(secret.secrets_group);
      });
    });
  } else if (
    field === "arbitrary_secret_name" ||
    field === "username_password_secret_name"
  ) {
    allOtherNames = getAllSecrets(stateData, componentProps, field);
  } else if (field === "access_groups") {
    allOtherNames = splat(
      componentProps.craig.store.json.access_groups,
      "name"
    );
  } else if (field === "policies" || field === "dynamic_policies") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.access_groups,
      field,
      "name"
    );
  } else if (field === "buckets" || field === "cos_keys") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.object_storage,
      field === "cos_keys" ? "keys" : "buckets",
      "name"
    );
  } else if (field === "acls") {
    // all of the extra ifs and elses here are to prevent order card from
    // triggering disable save when it has no props
    if (!componentProps.id && !componentProps.parent_name) {
      componentProps.craig.store.json.vpcs.forEach((network) => {
        allOtherNames = allOtherNames.concat(splat(network.acls, "name"));
        if (!isNullOrEmptyString(network.default_network_acl_name)) {
          allOtherNames.push(network.default_network_acl_name);
        }
      });
    }
  } else if (field === "security_groups") {
    allOtherNames = splat(
      componentProps.craig.store.json.security_groups,
      "name"
    );
    componentProps.craig.store.json.vpcs.forEach((network) => {
      if (!isNullOrEmptyString(network.default_security_group_name)) {
        allOtherNames.push(network.default_security_group_name);
      }
    });
  } else if (field === "routing_tables") {
    componentProps.craig.store.json.vpcs.forEach((network) => {
      if (!isNullOrEmptyString(network.default_routing_table_name)) {
        allOtherNames.push(network.default_routing_table_name);
      }
    });
    if (componentProps.craig.store.json.routing_tables)
      allOtherNames = allOtherNames.concat(
        splat(componentProps.craig.store.json.routing_tables, "name")
      );
  } else if (field === "acl_rules") {
    let craigRef =
      componentProps.isModal || !componentProps.innerFormProps
        ? componentProps.craig
        : componentProps.innerFormProps.craig;
    craigRef.store.json.vpcs.forEach((network) => {
      network.acls.forEach((acl) => {
        if (acl.name === componentProps.parent_name) {
          allOtherNames = splat(acl.rules, "name");
        }
      });
    });
  } else if (field === "vsi") {
    allOtherNames = splat(componentProps.craig.store.json.vsi, "name");
  } else if (field === "routes") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.routing_tables,
      "routes",
      "name"
    );
  } else if (field === "load_balancers") {
    allOtherNames = splat(
      componentProps.craig.store.json.load_balancers,
      "name"
    );
  } else if (field === "subnet_name") {
    new revision(componentProps.craig.store.json)
      .child("vpcs", componentProps.vpc_name, "name")
      .then((data) => {
        allOtherNames = splat(data.subnets, "name");
      });
  } else if (field === "cbr_rules") {
    allOtherNames = splat(componentProps.craig.store.json.cbr_rules, "name");
  } else if (field === "contexts") {
    componentProps.craig.store.json.cbr_rules.forEach((rule) =>
      rule.contexts.forEach((context) => {
        allOtherNames.push(context.name);
      })
    );
  } else if (field === "resource_attributes") {
    componentProps.craig.store.json.cbr_rules.forEach((rule) =>
      rule.resource_attributes.forEach((attribute) => {
        allOtherNames.push(attribute.name);
      })
    );
  } else if (field === "tags") {
    componentProps.craig.store.json.cbr_rules.forEach((rule) =>
      rule.tags.forEach((tag) => {
        allOtherNames.push(tag.name);
      })
    );
  } else if (field === "cbr_zones") {
    allOtherNames = splat(componentProps.craig.store.json.cbr_zones, "name");
  } else if (field === "exclusions") {
    componentProps.craig.store.json.cbr_zones.forEach((zone) =>
      zone.exclusions.forEach((exclusion) => {
        allOtherNames.push(exclusion.name);
      })
    );
  } else if (field === "addresses") {
    componentProps.craig.store.json.cbr_zones.forEach((zone) =>
      zone.addresses.forEach((address) => {
        allOtherNames.push(address.name);
      })
    );
  } else if (field === "vpn_server_routes") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.vpn_servers,
      "routes",
      "name"
    );
  } else if (field === "dns") {
    allOtherNames = splat(componentProps.craig.store.json.dns, "name");
  } else if (field === "zones") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.dns,
      "zones",
      "name"
    );
  } else if (field === "records") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.dns,
      "records",
      "name"
    );
  } else if (field === "custom_resolvers") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.dns,
      "custom_resolvers",
      "name"
    );
  } else if (field === "power_vs_ssh_keys") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.power,
      "ssh_keys",
      "name"
    );
  } else if (field === "network") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.power,
      "network",
      "name"
    );
  } else if (field === "cloud_connections") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.power,
      "cloud_connections",
      "name"
    );
  } else if (field === "classic_sg_rules") {
    allOtherNames = splat(
      new revision(componentProps.craig.store.json).child(
        "classic_security_groups",
        componentProps.arrayParentName
      ).data.classic_sg_rules,
      "name"
    );
  } else if (componentProps) {
    allOtherNames = splat(
      componentProps.craig.store.json[field === "vpc_name" ? "vpcs" : field],
      "name"
    );
  }

  if (stateData && componentProps) {
    if (
      // component props.data is not available on load, this line
      // allows for disable save function to be passed directly into
      // force open
      componentProps.data &&
      contains(allOtherNames, componentProps.data[stateField])
    )
      allOtherNames.splice(
        allOtherNames.indexOf(componentProps.data[stateField]),
        1
      );
    return contains(allOtherNames, stateData[stateField]);
  } else return false; // prevent order card from crashing
}

/**
 * create invalid bool for resource
 * @param {string} field json field name
 * @param {*} craig subnet craig data
 * @returns {Function} text should be invalid function
 */
function invalidName(field, craig) {
  /**
   * create invalid for resource
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @param {string=} overrideField field to override
   * @returns {string} invalid text
   */
  function nameCheck(stateData, componentProps, overrideField) {
    let stateField = overrideField || "name";
    if (!stateData.name) {
      return true;
    } else {
      return (
        hasDuplicateName(field, stateData, componentProps, overrideField) ||
        // prevent classic vlans with names that include prefix longer than 20 characters
        (field === "classic_vlans" &&
          stateData.name &&
          stateData.name.length +
            1 +
            componentProps.craig.store.json._options.prefix.length >
            20) ||
        stateData[stateField] === "" ||
        (!stateData.use_data && invalidNewResourceName(stateData[stateField]))
      );
    }
  }

  if (field === "vpcs") {
    /**
     * invalid vpc field check
     * @param {string} field name
     * @param {Object} stateData
     * @param {Object} componentProps
     */
    return function (field, stateData, componentProps) {
      if (field === "name") {
        return invalidName("vpc_name")(stateData, componentProps);
      } else if (isNullOrEmptyString(stateData[field])) {
        return false;
      } else if (field === "default_network_acl_name") {
        return invalidName("acls")(stateData, componentProps, field);
      } else if (field === "default_security_group_name") {
        return invalidName("security_groups")(stateData, componentProps, field);
      } else {
        return invalidName("routing_tables")(stateData, componentProps, field);
      }
    };
  } else if (field === "subnet") {
    return function (stateData, componentProps) {
      let propsCopy = { craig: craig };
      transpose(componentProps, propsCopy);
      if (componentProps.vpc_name)
        return invalidName("subnet_name")(stateData, propsCopy);
      else return false;
    };
  } else return nameCheck;
}

/**
 * create generic callback for duplicate name
 * @param {string} name resource name
 * @returns {string} invalid message
 */
function duplicateNameCallback(name) {
  return `Name "${name}" already in use`;
}

/**
 * create generic name callback for most use cases
 * @return {string} invalid message
 */
function genericNameCallback() {
  return `Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s`;
}

/**
 * create invalid text
 * @param {string} field json field name
 * @param {*=} craig used for subnet
 * @returns {Function} text should be invalid function
 */
function invalidNameText(field, craig) {
  /**
   * create invalid text for name
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @returns {string} invalid text
   */
  function nameText(stateData, componentProps, overrideField) {
    if (hasDuplicateName(field, stateData, componentProps, overrideField)) {
      return duplicateNameCallback(stateData[overrideField || "name"]);
    } else if (
      field === "classic_vlans" &&
      stateData.name &&
      stateData.name.length +
        1 +
        componentProps.craig.store.json._options.prefix.length >
        20
    ) {
      return "Classic VLAN names must be 20 or fewer characters including the environment prefix";
    } else return genericNameCallback();
  }
  if (field === "vpcs") {
    /**
     * invalid vpc field check
     * @param {string} field name
     * @param {Object} stateData
     * @param {Object} componentProps
     */
    return function (field, stateData, componentProps) {
      if (field === "name") {
        return invalidNameText("vpc_name")(stateData, componentProps);
      } else if (field === "default_network_acl_name") {
        return invalidNameText("acls")(stateData, componentProps, field);
      } else if (field === "default_security_group_name") {
        return invalidNameText("security_groups")(
          stateData,
          componentProps,
          field
        );
      } else {
        return invalidNameText("routing_tables")(
          stateData,
          componentProps,
          field
        );
      }
    };
  } else if (field === "subnet") {
    return function (stateData, componentProps) {
      let propsCopy = { craig: craig };
      transpose(componentProps, propsCopy);
      return invalidNameText("subnet_name")(stateData, propsCopy);
    };
  } else return nameText;
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
 * name field
 * @param {*} jsonField
 * @returns {Object} name field
 */
function nameField(jsonField, options) {
  return {
    default: "",
    invalid: options?.invalid ? options.invalid : invalidName(jsonField),
    invalidText: invalidNameText(jsonField),
    helperText: options?.helperText ? options.helperText : nameHelperText,
    size: options?.size,
    hideWhen: options?.hideWhen,
    onRender: options?.onRender,
    readOnly: options?.readOnly,
    tooltip: options?.tooltip,
    disabledText: options?.invalidText,
  };
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
 * hide when rule has protocol is not tcp or udp
 * @param {*} stateData
 * @returns {boolean} true if should be hidden
 */
function hideWhenNotAllIcmp(stateData) {
  return stateData.ruleProtocol === "all"
    ? true
    : stateData.ruleProtocol === "icmp";
}

/**
 * hide when rule has protocol is tcp or udp
 * @param {*} stateData
 * @returns {boolean} true if should be hidden
 */
function hideWhenTcpOrUdp(stateData) {
  return stateData.ruleProtocol === "all"
    ? true
    : contains(["tcp", "udp"], stateData.ruleProtocol);
}

/**
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
      // check for rule[type] for craig form rule[rule]
      let value = rule.rule ? rule.rule[type] : rule[type];
      if (value && !hasInvalidPort) {
        hasInvalidPort =
          value.match && value.match(/\D/g) !== null
            ? true
            : !validPortRange(type, value);
      }
    });
  }
  return hasInvalidPort;
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
 * get which rule protocol is being used
 * @param {string} rule
 * @returns {string} protocol
 */
function getRuleProtocol(rule) {
  let protocol = "all";
  // for each possible protocol
  ["icmp", "tcp", "udp"].forEach((field) => {
    // set protocol to that field if not all fields are null
    if (rule[field] && allFieldsNull(rule[field]) === false) {
      protocol = field;
    }
  });
  return protocol;
}

/**
 * handle input change for rule field
 * @param {*} stateData
 */
function onRuleFieldInputChange(field) {
  return function (stateData) {
    if (!stateData.rule) {
      stateData.rule = {
        port_max: null,
        port_min: null,
        source_port_max: null,
        source_port_min: null,
        type: null,
        code: null,
      };
    }
    stateData.rule[field] = stateData[field];
    return stateData[field];
  };
}

/**
 * networking rule protocol field
 * @returns {Object} form field object
 */
function networkingRuleProtocolField(isAcl) {
  return {
    size: "small",
    type: "select",
    default: "all",
    groups: ["All", "TCP", "UDP", "ICMP"],
    invalid: fieldIsNullOrEmptyString("ruleProtocol"),
    invalidText: selectInvalidText("protocol"),
    onInputChange: function (stateData) {
      stateData.rule = {
        port_max: null,
        port_min: null,
        source_port_max: null,
        source_port_min: null,
        type: null,
        code: null,
      };
      stateData.tcp = {
        port_min: null,
        port_max: null,
      };
      stateData.udp = {
        port_min: null,
        port_max: null,
      };
      stateData.icmp = {
        type: null,
        code: null,
      };
      if (isAcl) {
        stateData.tcp.source_port_max = null;
        stateData.tcp.source_port_min = null;
        stateData.udp.source_port_max = null;
        stateData.udp.source_port_min = null;
      }
      return stateData.ruleProtocol.toLowerCase();
    },
    onRender: function (stateData) {
      return contains(["icmp", "udp", "tcp", "all"], stateData.ruleProtocol)
        ? stateData.ruleProtocol.toUpperCase()
        : "";
    },
  };
}

/**
 * build networking form port field
 * @param {boolean} max true if port max
 * @param {boolean} source true if source port
 * @returns {Object} form field object
 */
function networkingRulePortField(max, source) {
  return {
    default: "",
    invalid: invalidTcpOrUdpPort,
    size: "small",
    invalidText: unconditionalInvalidText(
      "Enter a whole number between 1 and 65536"
    ),
    hideWhen: hideWhenNotAllIcmp,
    onInputChange: onRuleFieldInputChange(
      max && source
        ? "source_port_max"
        : source
        ? "source_port_min"
        : max
        ? "port_max"
        : "port_min"
    ),
    helperText: unconditionalInvalidText(""),
    onRender: function (stateData) {
      let ruleType = getRuleProtocol(stateData);
      let ruleField =
        max && source
          ? "source_port_max"
          : source
          ? "source_port_min"
          : max
          ? "port_max"
          : "port_min";
      if (
        stateData[ruleType] &&
        stateData[ruleType][ruleField] &&
        !stateData[ruleField]
      ) {
        return stateData[ruleType][ruleField];
      } else return stateData[ruleField];
    },
  };
}

/**
 * build networking form type field
 * @returns {Object} form field object
 */
function networkingRuleTypeField() {
  return {
    size: "small",
    default: "",
    invalid: invalidIcmpCodeOrType,
    invalidText: unconditionalInvalidText(
      "Enter a whole number between 0 and 254"
    ),
    hideWhen: hideWhenTcpOrUdp,
    onInputChange: onRuleFieldInputChange("type"),
    helperText: unconditionalInvalidText(""),
    onRender: function (stateData) {
      if (stateData.icmp && stateData.icmp.type && !stateData.type) {
        return stateData.icmp.type === "null" ? "" : stateData.icmp.type;
      } else return stateData.type;
    },
  };
}

/**
 * build networking form code field
 * @returns {Object} form field object
 */
function networkingRuleCodeField() {
  return {
    size: "small",
    default: "",
    invalid: invalidIcmpCodeOrType,
    invalidText: unconditionalInvalidText(
      "Enter a whole number between 0 and 255"
    ),
    hideWhen: hideWhenTcpOrUdp,
    onInputChange: onRuleFieldInputChange("code"),
    helperText: unconditionalInvalidText(""),
    onRender: function (stateData) {
      if (stateData.icmp && stateData.icmp.code && !stateData.code) {
        return stateData.icmp.code === "null" ? "" : stateData.icmp.code;
      } else return stateData.code;
    },
  };
}

/**
 * shortcut for domain field
 */
function domainField() {
  return {
    default: "",
    invalid: function (stateData) {
      return (
        // prevent returning error
        (stateData.domain || "").match(
          new RegexButWithWords()
            .stringBegin()
            .set("a-z")
            .oneOrMore()
            .literal(".")
            .set("a-z")
            .oneOrMore()
            .stringEnd()
            .done("g")
        ) === null
      );
    },
    invalidText: unconditionalInvalidText("Enter a valid domain"),
    size: "small",
  };
}

/**
 * create field for classic datacenters
 * @returns {Object} field object for classic datacenters
 */
function classicDatacenterField() {
  return {
    default: "",
    type: "select",
    invalid: fieldIsNullOrEmptyString("datacenter"),
    invalidText: selectInvalidText("datacenter"),
    onStateChange: function (stateData) {
      stateData.private_vlan = "";
      stateData.public_vlan = "";
    },
    groups: datacenters,
    size: "small",
  };
}

/**
 * classic vlan filter function
 * @param {string} type
 * @returns {Function} groups function
 */
function classicVlanFilter(type) {
  return function (stateData, componentProps) {
    return splat(
      componentProps.craig.store.json.classic_vlans.filter((vlan) => {
        if (vlan.datacenter === stateData.datacenter && vlan.type === type)
          return vlan;
      }),
      "name"
    );
  };
}

/**
 * create field for classic private vlan
 * @returns {Object} field object for classic private vlan
 */
function classicPrivateVlan() {
  return {
    labelText: "Private VLAN",
    default: "",
    type: "select",
    invalid: fieldIsNullOrEmptyString("private_vlan"),
    invalidText: selectInvalidText("private VLAN"),
    groups: classicVlanFilter("PRIVATE"),
    size: "small",
  };
}

/**
 * create field for classic public vlan
 * @returns {Object} field object for classic public vlan
 */
function classicPublicVlan() {
  return {
    labelText: "Public VLAN",
    default: "",
    type: "select",
    invalid: function (stateData) {
      return stateData.private_network_only
        ? false
        : fieldIsNullOrEmptyString("public_vlan")(stateData);
    },
    invalidText: selectInvalidText("public VLAN"),
    groups: classicVlanFilter("PUBLIC"),
    size: "small",
    hideWhen: function (stateData) {
      return stateData.private_network_only;
    },
  };
}

/**
 * classic private network toggle
 * @returns {Object} field object
 */
function classicPrivateNetworkOnly() {
  return {
    type: "toggle",
    labelText: "Private Network Only",
    default: false,
    onStateChange: function (stateData) {
      if (stateData.private_network_only !== true) {
        stateData.private_network_only = true;
        stateData.public_vlan = "";
      } else stateData.private_network_only = false;
    },
    size: "small",
  };
}

module.exports = {
  networkingRuleProtocolField,
  networkingRulePortField,
  networkingRuleTypeField,
  networkingRuleCodeField,
  getRuleProtocol,
  hideWhenTcpOrUdp,
  hideWhenNotAllIcmp,
  onRuleFieldInputChange,
  invalidPort,
  nameField,
  invalidName,
  invalidNameText,
  hasDuplicateName,
  nameHelperText,
  unconditionalInvalidText,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  genericNameCallback,
  duplicateNameCallback,
  nameHelperText,
  domainField,
  classicDatacenterField,
  classicPrivateVlan,
  classicPublicVlan,
  classicPrivateNetworkOnly,
};
