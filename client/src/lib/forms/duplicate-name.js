const { splat, contains, isNullOrEmptyString } = require("lazy-z");

/**
 * check for duplicate name
 * @param {string} field name of the field within store json to check
 * @param {Object} stateData
 * @param {string} stateData.name
 * @param {Object} componentProps
 * @param {Object} componentProps.craig
 * @param {Object} componentProps.craig.store
 * @param {Object} componentProps.craig.store.json
 * @param {Object} componentProps.data
 * @param {string} componentProps.data.name
 * @returns {boolean} true if has duplicate name
 */
function hasDuplicateName(field, stateData, componentProps, overrideField) {
  let allOtherNames = [];
  let stateField = overrideField || "name";
  if (field === "appid_keys") {
    componentProps.craig.store.json.appid.forEach(instance => {
      allOtherNames = allOtherNames.concat(splat(instance.keys, "name"));
    });
  } else if (field === "encryption_keys") {
    componentProps.craig.store.json.key_management.forEach(instance => {
      allOtherNames = allOtherNames.concat(splat(instance.keys, "name"));
    });
  } else if (field === "buckets" || field === "cos_keys") {
    componentProps.craig.store.json.object_storage.forEach(instance => {
      allOtherNames = allOtherNames.concat(
        splat(instance[field === "cos_keys" ? "keys" : "buckets"], "name")
      );
    });
  } else if (field === "acls") {
    componentProps.craig.store.json.vpcs.forEach(network => {
      allOtherNames = allOtherNames.concat(splat(network.acls, "name"));
      if (!isNullOrEmptyString(network.default_network_acl_name)) {
        allOtherNames.push(network.default_network_acl_name);
      }
    });
  } else if (field === "security_groups") {
    allOtherNames = splat(
      componentProps.craig.store.json.security_groups,
      "name"
    );
    componentProps.craig.store.json.vpcs.forEach(network => {
      if (!isNullOrEmptyString(network.default_security_group_name)) {
        allOtherNames.push(network.default_security_group_name);
      }
    });
  } else if (field === "routing_tables") {
    componentProps.craig.store.json.vpcs.forEach(network => {
      if (!isNullOrEmptyString(network.default_routing_table_name)) {
        allOtherNames.push(network.default_routing_table_name);
      }
    });
  } else {
    allOtherNames = splat(
      componentProps.craig.store.json[field === "vpc_name" ? "vpcs" : field],
      "name"
    );
  }
  if (contains(allOtherNames, componentProps.data[stateField]))
    allOtherNames.splice(
      allOtherNames.indexOf(componentProps.data[stateField]),
      1
    );
  return contains(allOtherNames, stateData[stateField]);
}

module.exports = {
  hasDuplicateName
};
