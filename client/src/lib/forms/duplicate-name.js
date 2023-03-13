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
  let allOtherNames = [];
  if (field === "encryption_keys") {
    componentProps.craig.store.json.key_management.forEach(instance => {
      allOtherNames = allOtherNames.concat(splat(instance.keys, "name"));
    });
  } else if (field === "buckets" || field === "cos_keys") {
    componentProps.craig.store.json.object_storage.forEach(instance => {
      allOtherNames = allOtherNames.concat(
        splat(instance[field === "cos_keys" ? "keys" : "buckets"], "name")
      );
    });
  } else allOtherNames = splat(componentProps.craig.store.json[field], "name");
  if (contains(allOtherNames, componentProps.data.name))
    allOtherNames.splice(allOtherNames.indexOf(componentProps.data.name), 1);
  return contains(allOtherNames, stateData.name);
}

module.exports = {
  hasDuplicateName
};
