const { deepEqual, isNullOrEmptyString, contains } = require("lazy-z");

/**
 * props match state placeholder
 * @param {string} field field name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if match
 */
function propsMatchState(field, stateData, componentProps) {
  if (field === "vpcs") {
    [
      "default_network_acl_name",
      "default_routing_table_name",
      "default_security_group_name",
    ].forEach((field) => {
      if (isNullOrEmptyString(stateData[field])) {
        if (componentProps.data[field] === "") {
          stateData[field] = "";
        }
        if (componentProps.data[field] === null) {
          stateData[field] = null;
        }
      }
    });
    // add array items from component props to state data to prevent an issue where
    // unchanged referenced the following arrays would create a case where
    // propsMatchState would always be false on the VPC page
    stateData.address_prefixes = componentProps.data.address_prefixes;
    stateData.subnets = componentProps.data.subnets;
    stateData.acls = componentProps.data.acls;
  } else if (
    stateData.zone &&
    stateData.zone !== componentProps.data.zone &&
    !contains(["subnet", "public_gateway", "power"], field)
  ) {
    // prevent open nested power workspace forms from being invalid when open and
    // parent zone is changed
    // props are updated but state is not
    stateData.zone = componentProps.data.zone;
  }
  if (field === "subnetTier") {
    componentProps.data.hide = stateData.hide;
    if (componentProps.formName) {
      // add advanced to data when using dynamic form
      componentProps.data.advanced = stateData.advanced;
    } else {
      // don't add props when using dynamic form
      componentProps.data.select_zones = stateData.select_zones;
      componentProps.data.advancedSave = stateData.advancedSave;
    }
    if (stateData.showUnsavedChangesModal !== undefined)
      componentProps.data.showUnsavedChangesModal =
        stateData.showUnsavedChangesModal;

    if (
      stateData.subnets &&
      stateData.advanced &&
      stateData.select_zones.length !== stateData.subnets.length
    ) {
      return false;
    }
  } else if (field === "security_groups") {
    // this is here to prevent dynamic subnet form from always showing save
    // button as disabled. as we move towards dynamic forms this should
    // be removed
    if (stateData.show !== undefined) componentProps.data.show = stateData.show;
  }
  if (field === "power") {
    if (
      stateData.name === componentProps.data.name &&
      stateData.resource_group === componentProps.data.resource_group &&
      stateData.zone === componentProps.data.zone &&
      deepEqual(stateData.imageNames, componentProps.data.imageNames)
    ) {
      return true;
    } else return false;
  }
  if (field === "options") {
    return deepEqual(stateData, componentProps.craig.store.json._options);
  }
  return deepEqual(stateData, componentProps.data);
}

module.exports = {
  propsMatchState,
};
