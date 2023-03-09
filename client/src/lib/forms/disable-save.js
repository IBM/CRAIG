const { invalidResourceGroupNameCallback } = require("./invalid-callbacks");

/**
 * disable save
 * @param {string} field field name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if match
 */
function disableSave(field, stateData, componentProps) {
  if (field === "resource_groups") {
    return invalidResourceGroupNameCallback(stateData, componentProps);
  } else return false;
}

module.exports = { disableSave };
