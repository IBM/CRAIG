const { splat, contains } = require("lazy-z");

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
function hasDuplicateName(field, stateData, componentProps) {
  let allOtherNames = splat(componentProps.craig.store.json[field], "name");
  allOtherNames.splice(allOtherNames.indexOf(componentProps.data.name), 1);
  return contains(allOtherNames, stateData.name);
}

module.exports = {
  hasDuplicateName
};
