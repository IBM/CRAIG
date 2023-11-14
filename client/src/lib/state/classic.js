/**
 * init store
 * @param {*} config
 */
function classicSshKeyInit(config) {
  config.store.json.classic_ssh_keys = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicSshKeyOnStoreUpdate(config) {
  if (!config.store.json.classic_ssh_keys) {
    config.store.json.classic_ssh_keys = [];
  }
}

/**
 * create ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyCreate(config, stateData, componentProps) {
  config.push(["json", "classic_ssh_keys"], stateData);
}

/**
 * update ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyUpdate(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_ssh_keys"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete ssh ket
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_ssh_keys"], componentProps.data.name);
}

/**
 * init store
 * @param {*} config
 */
function classicVlanInit(config) {
  config.store.json.classic_vlans = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicVlanOnStoreUpdate(config) {
  if (!config.store.json.classic_vlans) {
    config.store.json.classic_vlans = [];
  }
}

/**
 * create ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanCreate(config, stateData, componentProps) {
  config.push(["json", "classic_vlans"], stateData);
}

/**
 * update ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanUpdate(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_vlans"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete ssh ket
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_vlans"], componentProps.data.name);
}

module.exports = {
  classicSshKeyOnStoreUpdate,
  classicSshKeyInit,
  classicSshKeyCreate,
  classicSshKeyUpdate,
  classicSshKeyDelete,
  classicVlanInit,
  classicVlanOnStoreUpdate,
  classicVlanCreate,
  classicVlanUpdate,
  classicVlanDelete,
};
