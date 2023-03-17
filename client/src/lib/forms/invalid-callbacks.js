const {
  splat,
  getObjectFromArray,
  isNullOrEmptyString,
  contains,
  containsKeys
} = require("lazy-z");
const { newResourceNameExp, sshKeyValidationExp } = require("../constants");
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

/**
 * validate sshKey
 * @param {string} str
 * @returns {boolean} true if it is a valid sshKey
 */
function validSshKey(str) {
  if (str === null) {
    return false;
  } else {
    return str.match(sshKeyValidationExp) !== null;
  }
}

/**
 * check if ssh key is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Object} invalid boolean invalidText string
 */
function invalidSshPublicKey(stateData, componentProps) {
  let invalid = {
    invalid: false,
    invalidText:
      "Provide a unique SSH public key that does not exist in the IBM Cloud account in your region"
  };
  if (!validSshKey(stateData.public_key)) {
    invalid.invalid = true;
  } else if (
    // if public key already used
    contains(
      splat(componentProps.craig.store.json.ssh_keys, "public_key"),
      stateData.public_key
    )
  ) {
    let key = getObjectFromArray(
      componentProps.craig.store.json.ssh_keys,
      "public_key",
      stateData.public_key
    );
    if (componentProps.data.name === key.name) {
      return invalid; // This is the current key, escape
    } else {
      // duplicate key
      invalid.invalid = true;
      invalid.invalidText = "SSH Public Key in use";
    }
  }
  return invalid;
}

module.exports = {
  invalidName,
  validNewResourceName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  validSshKey
};
