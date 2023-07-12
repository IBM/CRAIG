const { getObjectFromArray, splat } = require("lazy-z");

/**
 * filter encryption keys
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {array} keys
 */
function encryptionKeyFilter(_, componentProps) {
  let cosName = componentProps.isModal
    ? componentProps.parent_name
    : componentProps.arrayParentName;
  let { kms } = getObjectFromArray(
    componentProps.craig.store.json.object_storage,
    "name",
    cosName
  );
  let { keys } = kms
    ? getObjectFromArray(
        componentProps.craig.store.json.key_management,
        "name",
        kms
      )
    : [];
  return kms ? splat(keys, "name") : [];
}

module.exports = { encryptionKeyFilter };
