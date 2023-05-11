const {
  splat,
  contains,
  isNullOrEmptyString,
  nestedSplat,
  revision
} = require("lazy-z");

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
  } else if (field === "volume") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.vsi,
      "volumes",
      "name"
    );
  } else if (field === "worker_pools") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.clusters,
      "worker_pools",
      "name"
    );
  } else if (field === "access_groups") {
    allOtherNames = splat(
      componentProps.craig.store.json.access_groups,
      "name"
    );
  } else if (field === "policies" || field === "dynamic_policies") {
    allOtherNames = nestedSplat(
      componentProps.craig.store.json.access_groups,
      field,
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
    if (componentProps.craig.store.json.routing_tables)
      allOtherNames = allOtherNames.concat(
        splat(componentProps.craig.store.json.routing_tables, "name")
      );
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
  } else if (field === "vsi") {
    allOtherNames = splat(componentProps.craig.store.json.vsi, "name");
  } else if (field === "routes") {
    allOtherNames = splat(componentProps.route.routes, "name");
  } else if (field === "load_balancers") {
    allOtherNames = splat(
      componentProps.craig.store.json.load_balancers,
      "name"
    );
  } else if (field === "subnet_name") {
    new revision(componentProps.craig.store.json)
      .child("vpcs", componentProps.vpc_name, "name")
      .then(data => {
        allOtherNames = splat(data.subnets, "name");
      });
  } else if (field === "cbr_rules") {
    allOtherNames = splat(componentProps.craig.store.json.cbr_rules, "name");
  } else if (field === "contexts") {
    componentProps.craig.store.json.cbr_rules.forEach(rule =>
      rule.contexts.forEach(context => {
        allOtherNames.push(context.name);
      })
    );
  } else if (field === "resource_attributes") {
    componentProps.craig.store.json.cbr_rules.forEach(rule =>
      rule.resource_attributes.forEach(attribute => {
        allOtherNames.push(attribute.name);
      })
    );
  } else if (field === "tags") {
    componentProps.craig.store.json.cbr_rules.forEach(rule =>
      rule.tags.forEach(tag => {
        allOtherNames.push(tag.name);
      })
    );
  } else if (field === "cbr_zones") {
    allOtherNames = splat(componentProps.craig.store.json.cbr_zones, "name");
  } else if (field === "exclusions") {
    componentProps.craig.store.json.cbr_zones.forEach(zone =>
      zone.exclusions.forEach(exclusion => {
        allOtherNames.push(exclusion.name);
      })
    );
  } else if (field === "addresses") {
    componentProps.craig.store.json.cbr_zones.forEach(zone =>
      zone.addresses.forEach(address => {
        allOtherNames.push(address.name);
      })
    );
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
