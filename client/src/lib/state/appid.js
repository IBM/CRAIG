const {
  pushAndUpdate,
  updateChild,
  carveChild,
  setUnfoundResourceGroup
} = require("./store.utils");

/**
 * atracker on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.appid
 */
function appidOnStoreUpdate(config) {
  config.store.json.appid.forEach(appid => {
    setUnfoundResourceGroup(config, appid);
  });
}

/**
 * create a new appid instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function appidCreate(config, stateData) {
  pushAndUpdate(config, "appid", stateData);
}

/**
 * update existing appid
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function appidSave(config, stateData, componentProps) {
  updateChild(config, "appid", stateData, componentProps);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function appidDelete(config, stateData, componentProps) {
    carveChild(config, "appid", componentProps);
  }

module.exports = {
  appidOnStoreUpdate,
  appidCreate,
  appidSave,
  appidDelete
};
