const { kebabName, jsonToTfPrint, tfBlock, tfDone } = require("./utils");

/**
 * create terraform for cbr zone addresses/excluded block
 * @param {object} item
 * @returns {object} terraform formatted code
 */
function ibmCbrZoneAddressAndExclusion(item, type) {
  let zone = {};
  ["type", "value"].forEach(field => {
    if (item[field] !== undefined) zone[field] = String(item[field]);
  });
  if (type === "address") {
    zone.ref = [{}];
    [
      "account_id",
      "location",
      "service_instance",
      "service_name",
      "service_type"
    ].forEach(field => {
      if (item[field] !== undefined) zone.ref[0][field] = String(item[field]);
    });
  }
  return zone;
}

/**
 * create terraform for cbr zone
 * @param {object} zone
 * @param {object} config
 * @returns {object} terraform formatted code
 */
function ibmCbrZone(zone, config) {
  let data = {
    name: `${config._options.prefix} ${zone.name} zone`
  };
  let cbrZoneData = {
    name: kebabName(config, ["zone", zone.name]),
    account_id: `${zone.account_id}`,
    description: `${zone.description}`,
    addresses: [],
    excluded: []
  };

  // add addresses
  zone.addresses.forEach(address => {
    cbrZoneData.addresses.push(
      ibmCbrZoneAddressAndExclusion(address, "address")
    );
  });

  // add excluded
  zone.exclusions.forEach(exclude => {
    cbrZoneData.excluded.push(
      ibmCbrZoneAddressAndExclusion(exclude, "exclude")
    );
  });

  data.data = cbrZoneData;
  return data;
}

/**
 * create tf for cbr zone
 * @param {object} zone
 * @param {object} config
 * @returns {string} cbr zone terraform code
 */
function formatCbrZone(zone, config) {
  let data = ibmCbrZone(zone, config);
  return jsonToTfPrint("resource", "ibm_cbr_zone", data.name, data.data);
}

/**
 * create terraform for resource attributes
 * @param {Array} item
 * @returns {object} terraform formatted code
 */
function ibmCbrRuleAttributes(item) {
  return { name: `${item.name}`, value: `${item.value}` };
}

/**
 * create terraform code for cbr rule
 * @param {object} rule
 * @param {object} config
 * @returns terraform formatted code
 */
function ibmCbrRule(rule, config) {
  let data = {
    name: `${config._options.prefix} cbr rule`
  };
  let cbrRuleData = {
    description: `${rule.description}`,
    enforcement_mode: `${rule.enforcement_mode}`,
    contexts: [{ attributes: [] }],
    resources: [{ attributes: [], tags: [] }],
    operations: [{ api_types: [{ api_type_id: `${rule.api_type_id}` }] }]
  };

  // add contexts
  rule.contexts.forEach(context => {
    cbrRuleData.contexts[0].attributes.push(ibmCbrRuleAttributes(context));
  });

  // add resources
  rule.resource_attributes.forEach(resource => {
    cbrRuleData.resources[0].attributes.push(ibmCbrRuleAttributes(resource));
  });

  // add tags
  rule.tags.forEach(tag => {
    cbrRuleData.resources[0].tags.push(ibmCbrRuleAttributes(tag));
  });

  data.data = cbrRuleData;
  return data;
}

/**
 * create tf for cbr rule
 * @param {object} rule
 * @param {object} config
 * @returns {string} cbr rule terraform code
 */
function formatCbrRule(rule, config) {
  let data = ibmCbrRule(rule, config);
  return jsonToTfPrint("resource", "ibm_cbr_rule", data.name, data.data);
}

/**
 * cbr tf file
 * @param {object} config
 * @param {Array<object>} config.cbr_zones
 * @param {Array<object>} config.cbr_rules
 * @returns {string} terraform string
 */
function cbrTf(config) {
  let tf = "";
  config.cbr_zones.forEach(zone => {
    let zoneData = formatCbrZone(zone, config);
    tf += tfBlock(zone.name + " Zone", zoneData) + "\n";
  });
  config.cbr_rules.forEach(rule => {
    let ruleData = formatCbrRule(rule, config);
    tf += tfBlock(rule.name + " Rule", ruleData) + "\n";
  });
  return tfDone(tf);
}

module.exports = {
  formatCbrZone,
  formatCbrRule,
  ibmCbrZone,
  ibmCbrRule,
  cbrTf
};
