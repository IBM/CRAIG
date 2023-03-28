const { eachKey, transpose, contains, allFieldsNull } = require("lazy-z");

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


module.exports = {
  formatNetworkingRule,
  updateNetworkingRule,
};
