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
      "default_security_group_name"
    ].forEach(field => {
      if (isNullOrEmptyString(stateData[field])) {
        stateData[field] = null;
      }
    });
  } 
  return deepEqual(stateData, componentProps.data);
}

module.exports = {
  propsMatchState
};
