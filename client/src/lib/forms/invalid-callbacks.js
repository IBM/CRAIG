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
 * create invalid bool for resource
 * @param {string} field json field name
 * @returns {Function} text should be invalid function
 */
function invalidName(field) {
  /**
   * create invalid for resource
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @returns {string} invalid text
   */
  return function(stateData, componentProps) {
    return (
      hasDuplicateName(field, stateData, componentProps) ||
      stateData.name === "" ||
      (stateData.use_data === false && validNewResourceName(stateData.name))
    );
  };
}

/**
 * invalid encryption key ring name
 * @param {Object} stateData
 * @param {string} stateData.key_ring
 * @return {boolean} true if invalid
 */
function invalidEncryptionKeyRing(stateData) {
  return (
    stateData.key_ring !== "" &&
    validNewResourceName(stateData.key_ring)
  );
}

module.exports = {
  invalidName,
  validNewResourceName,
  invalidEncryptionKeyRing
};
