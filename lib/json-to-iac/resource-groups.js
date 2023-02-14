const { endComment } = require("./constants");
const {
  buildTitleComment,
  jsonToTf,
  dataResourceName,
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
    name: dataResourceName(group, config),
  };
  if (!group.use_data) rgValues.tags = true;
  return jsonToTf(
    "ibm_resource_group",
    group.name,
    rgValues,
    config,
    group.use_data
  );
}

/**
 * format a resource group terraform code
 * @param {Object} config
 * @returns {string} string formatted terraform code
 */
function resourceGroupTf(config) {
  let text = buildTitleComment("Resource", "Groups");
  config.resource_groups.forEach((group) => {
    text += formatResourceGroup(group, config);
  });
  return text + endComment;
}

module.exports = resourceGroupTf;
