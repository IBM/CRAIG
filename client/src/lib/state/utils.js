const {
  eachKey,
  transpose,
  contains,
  allFieldsNull,
  splatContains,
  arraySplatIndex
} = require("lazy-z");

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
          code: null
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null
        }
      }
    : // security group rule style
      {
        icmp: {
          type: null,
          code: null
        },
        tcp: {
          port_min: null,
          port_max: null
        },
        udp: {
          port_min: null,
          port_max: null
        }
      };
  eachKey(params, key => {
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
      eachKey(rule[params.ruleProtocol], key => {
        if (rule[params.ruleProtocol][key] !== null) {
          rule[params.ruleProtocol][key] = parseInt(
            rule[params.ruleProtocol][key]
          );
        } else if (allTargetFieldsNull && params.ruleProtocol === "icmp") {
          rule[params.ruleProtocol][key] = 0;
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
  ["icmp", "tcp", "udp"].forEach(protocol => {
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

  // for each subnet
  vpcObject.subnets.forEach(subnet => {
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
        zones: 1
      });
    } else {
      // otherwise, increase number of zones
      let tierIndex = arraySplatIndex(subnetTiers, "name", tierName);
      subnetTiers[tierIndex].zones++;
    }
  });
  return subnetTiers;
}

module.exports = {
  formatNetworkingRule,
  updateNetworkingRule,
  eachRuleProtocol,
  buildSubnetTiers
};
