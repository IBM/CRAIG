const { deepEqual } = require("lazy-z");

/**
 * props match state placeholder
 * @param {string} field field name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if match
 */
function propsMatchState(field, stateData, componentProps) {
  return deepEqual(stateData, componentProps.data);
}

module.exports = {
  propsMatchState
};
