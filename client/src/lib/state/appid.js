const { transpose } = require("lazy-z");
const {
  setUnfoundResourceGroup,
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal
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
    appid.keys.forEach(key => {
      key.appid = appid.name;
    });
  });
}

/**
 * create a new appid instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function appidCreate(config, stateData) {
  config.push(["json", "appid"], stateData);
}

/**
 * update existing appid
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function appidSave(config, stateData, componentProps) {
  config.updateChild(["json", "appid"], componentProps.data.name, stateData);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function appidDelete(config, stateData, componentProps) {
  config.carve(["json", "appid"], componentProps.data.name);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function appidKeyDelete(config, stateData, componentProps) {
  deleteSubChild(config, "appid", "keys", componentProps);
}

/**
 * create a new appid instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function appidKeyCreate(config, stateData, componentProps) {
  let newKey = {
    appid: componentProps.innerFormProps.arrayParentName
  };
  transpose(newKey, stateData);
  pushToChildFieldModal(config, "appid", "keys", stateData, componentProps);
}

/**
 * update existing appid
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function appidKeySave(config, stateData, componentProps) {
  updateSubChild(config, "appid", "keys", stateData, componentProps);
}

module.exports = {
  appidOnStoreUpdate,
  appidCreate,
  appidSave,
  appidDelete,
  appidKeyCreate,
  appidKeyDelete,
  appidKeySave
};
