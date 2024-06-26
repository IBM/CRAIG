const { snakeCase, allFieldsNull, getObjectFromArray } = require("lazy-z");
const {
  kebabName,
  vpcRef,
  tfRef,
  tfBlock,
  tfDone,
  getTags,
  jsonToTfPrint,
} = require("./utils");

/**
 * format tf for security group
 * @param {Object} sg security group
 * @param {string} sg.vpc
 * @param {string} sg.resource_group
 * @param {string} sg.name
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {object} terraform string
 */

function ibmIsSecurityGroup(sg, config) {
  return {
    name: `${sg.vpc} vpc ${sg.name} sg`,
    data: sg.use_data
      ? {
          name: sg.name,
        }
      : {
          name: kebabName([sg.vpc, sg.name, "sg"]),
          vpc: vpcRef(sg.vpc).replace(
            "${",
            getObjectFromArray(config.vpcs, "name", sg.vpc).use_data
              ? "${data."
              : "${"
          ),
          resource_group: `\${var.${snakeCase(sg.resource_group)}_id}`,
          tags: getTags(config),
        },
  };
}

/**
 * format tf for security group
 * @param {Object} sg security group
 * @param {string} sg.vpc
 * @param {string} sg.resource_group
 * @param {string} sg.name
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform string
 */
function formatSecurityGroup(sg, config) {
  let group = ibmIsSecurityGroup(sg, config);
  return jsonToTfPrint(
    sg.use_data ? "data" : "resource",
    "ibm_is_security_group",
    group.name,
    group.data
  );
}

/** create sg rule
 * @param {Object} rule
 * @param {string} rule.acl
 * @param {string} rule.vpc
 * @param {string} rule.direction
 * @param {string} rule.name
 * @param {string} rule.source
 * @param {Object} rule.icmp
 * @param {number} rule.icmp.type
 * @param {number} rule.icmp.code
 * @param {Object} rule.tcp
 * @param {number} rule.tcp.port_min
 * @param {number} rule.tcp.port_max
 * @param {number} rule.tcp.source_port_min
 * @param {number} rule.tcp.source_port_max
 * @param {Object} rule.udp
 * @param {number} rule.udp.port_min
 * @param {number} rule.udp.port_max
 * @param {number} rule.udp.source_port_min
 * @param {number} rule.udp.source_port_max
 * @param {object} config
 * @returns {object} terraform formatted sg rule
 */

function ibmIsSecurityGroupRule(rule, config) {
  let sgAddress = `${rule.vpc} vpc ${rule.sg} sg`;
  let sgRule = {
    group: tfRef(
      "ibm_is_security_group",
      snakeCase(sgAddress),
      "id",
      config?.security_groups &&
        getObjectFromArray(config.security_groups, "name", rule.sg).use_data
    ),
    remote: rule.source,
    direction: rule.direction,
  };
  ["icmp", "tcp", "udp"].forEach((protocol) => {
    let ruleHasProtocolData = rule[protocol] && !allFieldsNull(rule[protocol]);
    if (ruleHasProtocolData && protocol === "icmp") {
      sgRule.icmp = [
        {
          type: rule.icmp.type === "null" ? null : rule.icmp.type,
          code: rule.icmp.code === "null" ? null : rule.icmp.code,
        },
      ];
    } else if (ruleHasProtocolData) {
      sgRule[protocol] = [
        {
          port_min: rule[protocol].port_min,
          port_max: rule[protocol].port_max,
        },
      ];
    }
  });
  return {
    name: `${sgAddress} rule ${rule.name}`,
    data: sgRule,
  };
}

/**
 * create network sg rule
 * @param {Object} rule
 * @param {Object} config
 * @returns {string} terraform formatted sg rule
 */
function formatSgRule(rule, config) {
  let data = ibmIsSecurityGroupRule(rule, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_security_group_rule",
    data.name,
    data.data
  );
}

/**
 * create terraform for security groups
 * @param {Object} config
 * @param {Array<Object>} config.security_groups
 * @param {Array<Object>} config.security_groups.rules
 * @returns {string} terraform code
 */
function sgTf(config) {
  let tf = "";
  config.security_groups.forEach((group) => {
    let blockData = formatSecurityGroup(group, config);
    group.rules.forEach((rule) => (blockData += formatSgRule(rule)));
    tf += tfBlock("Security Group " + group.name, blockData) + "\n";
  });
  return tfDone(tf);
}

module.exports = {
  formatSecurityGroup,
  formatSgRule,
  sgTf,
  ibmIsSecurityGroupRule,
  ibmIsSecurityGroup,
};
