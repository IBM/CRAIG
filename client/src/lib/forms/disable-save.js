const { isNullOrEmptyString, isEmpty } = require("lazy-z");
const {
  invalidName,
  invalidEncryptionKeyRing,
  validSshKey,
  invalidSshPublicKey
} = require("./invalid-callbacks");

/**
 * disable save
 * @param {string} field field name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if match
 */
function disableSave(field, stateData, componentProps) {
  if (field === "scc") {
    return (
      stateData.collector_description.match(/^[A-z][a-zA-Z0-9-\._,\s]*$/i) ===
        null ||
      stateData.scope_description.match(/^[A-z][a-zA-Z0-9-\._,\s]*$/i) === null
    );
  } else if (field === "atracker") {
    return (
      isNullOrEmptyString(stateData.bucket) ||
      isNullOrEmptyString(stateData.cos_key) ||
      isEmpty(stateData.locations)
    );
  } else if (field === "object_storage") {
    return (
      invalidName("object_storage")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.kms) ||
      isNullOrEmptyString(stateData.resource_group)
    );
  } else if (field === "appid") {
    return (
      invalidName("appid")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group)
    );
  } else if (field === "appid_key") {
    return invalidName("appid_keys")(stateData, componentProps);
  } else if (field === "buckets") {
    return (
      invalidName("buckets")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.kms_key)
    );
  } else if (field === "cos_keys") {
    return invalidName("cos_keys")(stateData, componentProps);
  } else if (field === "encryption_keys") {
    return (
      invalidName("encryption_keys")(stateData, componentProps) ||
      invalidEncryptionKeyRing(stateData)
    );
  } else if (field === "key_management") {
    return (
      invalidName("key_management")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group)
    );
  } else if (field === "secrets_manager") {
    return (
      invalidName("secrets_manager")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      isNullOrEmptyString(stateData.encryption_key)
    );
  } else if (field === "resource_groups") {
    return invalidName("resource_groups")(stateData, componentProps);
  } else if (field === "vpcs") {
    return (
      isNullOrEmptyString(stateData.resource_group) ||
      isNullOrEmptyString(stateData.bucket) ||
      invalidName("vpcs")("name", stateData, componentProps) ||
      invalidName("vpcs")(
        "default_network_acl_name",
        stateData,
        componentProps
      ) ||
      invalidName("vpcs")(
        "default_security_group_name",
        stateData,
        componentProps
      ) ||
      invalidName("vpcs")(
        "default_routing_table_name",
        stateData,
        componentProps
      )
    );
  } else if (field === "ssh_keys") {
    return (
      invalidName("ssh_keys")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      (stateData.use_data
        ? false // do not check invalid public key if using data, return false
        : invalidSshPublicKey(stateData, componentProps).invalid)
    );
  } else if (field === "transit_gateways") {
    return (
      invalidName("transit_gateways")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      isEmpty(stateData.connections)
    );
  } else return false;
}

module.exports = { disableSave };
