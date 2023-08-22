const { splatContains } = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const { setKmsFromKeyOnStoreUpdate } = require("./utils");

/**
 * icd on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.icd
 */
function icdOnStoreUpdate(config) {
  if(!config.store.json.icd) {
    config.store.json.icd = [];
  }
  config.store.json.icd.forEach((icd) => {
    setUnfoundResourceGroup(config, icd);
    setKmsFromKeyOnStoreUpdate(icd, config);
  });
}

/**
 * create a new icd instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function icdCreate(config, stateData) {
  config.push(["json", "icd"], stateData);
}

/**
 * update existing icd
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function icdSave(config, stateData, componentProps) {
  config.updateChild(["json", "icd"], componentProps.data.name, stateData);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function icdDelete(config, stateData, componentProps) {
  config.carve(["json", "icd"], componentProps.data.name);
}

module.exports = {
  icdOnStoreUpdate,
  icdCreate,
  icdSave,
  icdDelete,
};
