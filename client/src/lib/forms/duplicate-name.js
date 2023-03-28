const { splat, contains, isNullOrEmptyString, nestedSplat } = require("lazy-z");

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
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.appid,
      "keys",
      "name"
    );
  } else if (field === "encryption_keys") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.key_management,
      "keys",
      "name"
    );
  } else if (field === "worker_pools") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.clusters,
      "worker_pools",
      "name"
    );
  } else if (field === "buckets" || field === "cos_keys") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.object_storage,
      field === "cos_keys" ? "keys" : "buckets",
      "name"
    );
  } else if (field === "acls") {
    // all of the extra ifs and elses here are to prevent order card from
    // triggering disable save when it has no props
    if (!componentProps.id && !componentProps.parent_name) {
      componentProps.craig.store.json.vpcs.forEach(network => {
        allOtherNames = allOtherNames.concat(splat(network.acls, "name"));
        if (!isNullOrEmptyString(network.default_network_acl_name)) {
          allOtherNames.push(network.default_network_acl_name);
        }
      });
    }
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
  } else if (field === "acl_rules") {
    let craigRef = componentProps.isModal
      ? componentProps.craig
      : componentProps.innerFormProps.craig;
    craigRef.store.json.vpcs.forEach(network => {
      network.acls.forEach(acl => {
        if (acl.name === componentProps.parent_name) {
          allOtherNames = splat(acl.rules, "name");
        }
      });
    });
  } else if (componentProps) {
    allOtherNames = splat(
      componentProps.craig.store.json[field === "vpc_name" ? "vpcs" : field],
      "name"
    );
  }
  if (stateData && componentProps) {
    if (contains(allOtherNames, componentProps.data[stateField]))
      allOtherNames.splice(
        allOtherNames.indexOf(componentProps.data[stateField]),
        1
      );

    return contains(allOtherNames, stateData[stateField]);
  } else return false; // prevent order card from crashing
}

module.exports = {
  hasDuplicateName
};
