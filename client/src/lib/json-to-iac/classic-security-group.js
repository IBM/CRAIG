const { snakeCase } = require("lazy-z");
const { jsonToTfPrint, tfBlock, kebabName } = require("./utils");

/**
 * format classic security group rule
 * @param {*} rule
 * @param {string} rule.classic_sg
 * @param {string} rule.name
 * @param {string} rule.direction
 * @param {string} rule.ruleProtocol
 * @param {string} rule.port_range_max
 * @param {string} rule.port_range_min
 * @returns {string} terraform formatted rule
 */
function formatClassicSgRule(rule) {
  return jsonToTfPrint(
    "resource",
    "ibm_security_group_rule",
    `classic security group ${rule.classic_sg} rule ${rule.name}`,
    {
      security_group_id: `\${ibm_security_group.classic_security_group_${snakeCase(
        rule.classic_sg
      )}.id}`,
      direction: rule.direction === "inbound" ? "ingress" : "egress",
      port_range_min:
        rule.port_range_min && rule.ruleProtocol !== "all"
          ? Number(rule.port_range_min)
          : undefined,
      port_range_max:
        rule.port_range_max && rule.ruleProtocol !== "all"
          ? Number(rule.port_range_max)
          : undefined,
      protocol:
        rule.ruleProtocol && rule.ruleProtocol !== "all"
          ? rule.ruleProtocol
          : undefined,
    }
  );
}

/**
 * format classic security group
 * @param {*} group
 * @param {string} group.name
 * @param {string} group.description
 * @param {Array} group.rules
 * @returns {string} terraform formatted data
 */
function formatClassicSg(group) {
  let ruleTf = "";
  group.classic_sg_rules.forEach((rule) => {
    ruleTf += formatClassicSgRule(rule);
  });

  return tfBlock(
    `${group.name} classic security group`,
    jsonToTfPrint(
      "resource",
      "ibm_security_group",
      "classic_security_group_" + group.name,
      {
        name: kebabName([group.name]),
        description: group.description,
      }
    ) + ruleTf
  );
}

/**
 * create classic security group terraform
 * @param {*} config
 * @returns {string} terraform string
 */
function classicSecurityGroupTf(config) {
  let tf = "";
  if (config.classic_security_groups) {
    config.classic_security_groups.forEach((sg, sgIndex) => {
      tf += formatClassicSg(sg);
      if (sgIndex + 1 < config.classic_security_groups.length) {
        tf += "\n";
      }
    });
  }
  return tf.length === 0 ? null : tf;
}

module.exports = {
  formatClassicSg,
  formatClassicSgRule,
  classicSecurityGroupTf,
};
