const { newResourceNameExp } = require("../constants");
const { hasDuplicateName } = require("./duplicate-name");

/**
 * create helper text for resource group name
 * @param {Object} stateData
 * @param {boolean} stateData.use_prefix
 * @param {Object} componentProps
 * @param {Object} componentProps.craig
 * @param {Object} componentProps.craig.store
 * @param {Object} componentProps.craig.store.json
 * @param {Object} componentProps.craig.store.json._options
 * @param {string} componentProps.craig.store.json._options.prefix
 * @returns {string} composed resource group name
 */
function resourceGroupHelperTextCallback(stateData, componentProps) {
  return (
    (stateData.use_prefix
      ? componentProps.craig.store.json._options.prefix + "-"
      : "") + stateData.name
  );
}

/**
 * create generic name callback for most use cases
 * @return {string} invalid message
 */
function genericNameCallback() {
  return `Name must follow the regex pattern: ${newResourceNameExp}`;
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
 * create invalid text
 * @param {string} field json field name
 * @returns {Function} text should be invalid function
 */
function invalidNameText(field) {
  /**
   * create invalid text for name
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @returns {string} invalid text
   */
  return function(stateData, componentProps) {
    if (hasDuplicateName(field, stateData, componentProps)) {
      return duplicateNameCallback(stateData.name);
    } else return genericNameCallback();
  };
}

module.exports = {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  duplicateNameCallback,
  invalidNameText,
};
