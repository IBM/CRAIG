const { deepEqual, isNullOrEmptyString } = require("lazy-z");

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
        stateData[field] = null;
      }
    });
    stateData.address_prefixes = componentProps.data.address_prefixes;
    stateData.subnets = componentProps.data.subnets;
    stateData.acls = componentProps.data.acls;
  }
  if (field === "subnetTier") {
    componentProps.data.hide = stateData.hide;
    componentProps.data.select_zones = stateData.select_zones;
    componentProps.data.advancedSave = stateData.advancedSave;
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
    componentProps.data.show = stateData.show;
  }
  return deepEqual(stateData, componentProps.data);
}

module.exports = {
  propsMatchState,
};
