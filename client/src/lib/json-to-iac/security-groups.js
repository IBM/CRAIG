const { snakeCase, allFieldsNull } = require("lazy-z");
const {
  rgIdRef,
  kebabName,
  vpcRef,
  jsonToIac,
  tfRef,
  tfBlock,
  tfDone,
  getTags
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
 * @returns {string} terraform string
 */
function formatSecurityGroup(sg, config) {
  return jsonToIac(
    "ibm_is_security_group",
    `${sg.vpc} vpc ${sg.name} sg`,
    {
      name: kebabName(config, [sg.vpc, sg.name, "sg"]),
      vpc: vpcRef(sg.vpc),
      resource_group: rgIdRef(sg.resource_group, config),
      tags: getTags(config)
    },
    config
  );
}

/**
 * create network acl rule
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
 * @returns {string} terraform formatted acl rule
 */
function formatSgRule(rule) {
  let sgAddress = `${rule.vpc} vpc ${rule.sg} sg`;
  let sgRule = {
    group: tfRef("ibm_is_security_group", snakeCase(sgAddress), "id"),
    remote: `^${rule.source}`,
    direction: `^${rule.direction}`
  };
  ["icmp", "tcp", "udp"].forEach(protocol => {
    let ruleHasProtocolData = !allFieldsNull(rule[protocol]);
    if (ruleHasProtocolData && protocol === "icmp") {
      sgRule._icmp = {
        type: rule.icmp.type,
        code: rule.icmp.code
      };
    } else if (ruleHasProtocolData) {
      sgRule[`_${protocol}`] = {
        port_min: rule[protocol].port_min,
        port_max: rule[protocol].port_max
      };
    }
  });
  return jsonToIac(
    "ibm_is_security_group_rule",
    `${sgAddress} rule ${rule.name}`,
    sgRule
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
  config.security_groups.forEach(group => {
    let blockData = formatSecurityGroup(group, config);
    group.rules.forEach(rule => (blockData += formatSgRule(rule)));
    tf += tfBlock("Security Group " + group.name, blockData) + "\n";
  });
  return tfDone(tf);
}

module.exports = {
  formatSecurityGroup,
  formatSgRule,
  sgTf
};
