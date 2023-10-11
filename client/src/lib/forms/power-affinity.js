const { containsKeys, contains } = require("lazy-z");

/**
 * check to see if storage for a power vs instance or volume should be disabled
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if disabled
 */
function storageChangeDisabledCallback(stateData, componentProps) {
  let isInUse = false;
  ["power_instances", "power_volumes"].forEach((field) => {
    componentProps[field].forEach((item) => {
      // get test items, for instance tests check for network field
      let testItems = containsKeys(stateData, "network")
        ? [item.pi_anti_affinity_instance, item.pi_affinity_instance]
        : [item.pi_affinity_volume, item.pi_anti_affinity_volume];
      if (contains(testItems, componentProps.data.name)) {
        isInUse = true;
      }
    });
  });
  return isInUse;
}

module.exports = {
  storageChangeDisabledCallback,
};
