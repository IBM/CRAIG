const { newResourceNameExp } = require("../constants");
const { hasDuplicateName } = require("./duplicate-name");

/**
 * check to see if a resource has a valid name
 * @param {string} str name
 * @returns {boolean} true if name is invalid
 */
function validNewResourceName(str) {
  return str.match(newResourceNameExp) === null;
}

/**
 * create invalid bool for resource group
 * @param {Object} stateData
 * @param {boolean} stateData.use_data
 * @param {string} stateData.name
 * @param {Object} componentProps
 * @returns {boolean} text should be invalid
 */
function invalidResourceGroupNameCallback(stateData, componentProps) {
  return (
    hasDuplicateName("resource_groups", stateData, componentProps) ||
    stateData.name === "" ||
    (stateData.use_data === false && validNewResourceName(stateData.name))
  );
}

module.exports = {
  invalidResourceGroupNameCallback
};
