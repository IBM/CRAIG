const {
  jsonToIac,
  dataResourceName,
  tfBlock,
  getTags,
  jsonToTfPrint,
  getResourceOrData
} = require("./utils");

/**
 * format a resource group
 * @param {object} group resource group
 * @param {string} group.name resource group bane
 * @param {Object} config
 * @param {Object} config._options
 * @param {Array<string>=} config._options.tags list of tags
 * @param {string} config._options.prefix prefix
 * @returns {string} string formatted terraform code
 */
function formatResourceGroup(group, config) {
  let rgValues = {
    name: dataResourceName(group)
  };
  if (!group.use_data) rgValues.tags = getTags(config);
  return jsonToTfPrint(
    getResourceOrData(group),
    "ibm_resource_group",
    group.name,
    rgValues
  );
}

/**
 * format a resource group terraform code
 * @param {Object} config
 * @returns {string} string formatted terraform code
 */
function resourceGroupTf(config) {
  let text = "";
  config.resource_groups.forEach(group => {
    text += formatResourceGroup(group, config);
  });
  return tfBlock("Resource Groups", text);
}

module.exports = resourceGroupTf;
