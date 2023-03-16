const { isNullOrEmptyString } = require("lazy-z");
const { containsKeys } = require("regex-but-with-words/lib/utils");
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
  function nameCheck(stateData, componentProps, overrideField) {
    let stateField = overrideField || "name";
    if (containsKeys(stateData, "scope_description")) {
      // easiest way to get scc
      return (
        stateData[stateField] === "" ||
        validNewResourceName(stateData[stateField])
      );
    } else
      return (
        hasDuplicateName(field, stateData, componentProps, overrideField) ||
        stateData[stateField] === "" ||
        (!stateData.use_data && validNewResourceName(stateData[stateField]))
      );
  }

  if (field === "vpcs") {
    /**
     * invalid vpc field check
     * @param {string} field name
     * @param {Object} stateData
     * @param {Object} componentProps
     */
    return function(field, stateData, componentProps) {
      if (field === "name") {
        return invalidName("vpc_name")(stateData, componentProps);
      } else if (isNullOrEmptyString(stateData[field])) {
        return false;
      } else if (field === "default_network_acl_name") {
        return invalidName("acls")(stateData, componentProps, field);
      } else if (field === "default_security_group_name") {
        return invalidName("security_groups")(stateData, componentProps, field);
      } else {
        return invalidName("routing_tables")(stateData, componentProps, field);
      }
    };
  } else return nameCheck;
}

/**
 * invalid encryption key ring name
 * @param {Object} stateData
 * @param {string} stateData.key_ring
 * @return {boolean} true if invalid
 */
function invalidEncryptionKeyRing(stateData) {
  return stateData.key_ring !== "" && validNewResourceName(stateData.key_ring);
}

module.exports = {
  invalidName,
  validNewResourceName,
  invalidEncryptionKeyRing
};
