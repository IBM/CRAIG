const { lazyZstate } = require("lazy-z/lib/store");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  setUnfoundResourceGroup,
} = require("./store.utils");

/**
 * initialize power-vs workspace
 * @param {lazyZState} config state store
 */
function powerVsInit(config) {
  config.store.json.power = [];
}

/**
 * on update function for power-vs workspace
 * @param {lazyZState} config state store
 */
function powerVsOnStoreUpdate(config) {
  if (!config.store.json.power) {
    config.store.json.power = [];
  }
  config.store.json.power.forEach((workspace) => {
    setUnfoundResourceGroup(config, workspace);
    [
      "ssh_keys",
      "cloud_connections",
      "network",
      "images",
      "attachments",
    ].forEach((field) => {
      workspace[field].forEach((item) => {
        item.workspace = workspace.name;
      });
    });
  });
}

/**
 * create new power-vs workspace
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 */
function powerVsCreate(config, stateData) {
  stateData.ssh_keys = [];
  stateData.network = [];
  stateData.cloud_connections = [];
  stateData.images = [];
  stateData.attachments = [];
  config.push(["json", "power"], stateData);
}

/**
 * save power-vs workspace
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.power
 * @param {object} stateData component state data
 */
function powerVsSave(config, stateData, componentProps) {
  config.updateChild(["json", "power"], componentProps.data.name, stateData);
}

/**
 * delete power-vs workspace
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsDelete(config, stateData, componentProps) {
  config.carve(["json", "power"], componentProps.data.name);
}

/**
 * create new workspace ssh key
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsSshKeysCreate(config, stateData, componentProps) {
  pushToChildFieldModal(config, "power", "ssh_keys", stateData, componentProps);
}

/**
 * update workspace ssh key
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsSshKeysSave(config, stateData, componentProps) {
  updateSubChild(config, "power", "ssh_keys", stateData, componentProps);
}

/**
 * delete a workspace ssh key
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsSshKeysDelete(config, stateData, componentProps) {
  deleteSubChild(config, "power", "ssh_keys", componentProps);
}

/**
 * create new workspace network interface
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsNetworkCreate(config, stateData, componentProps) {
  pushToChildFieldModal(config, "power", "network", stateData, componentProps);
}

/**
 * update workspace network interface
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsNetworkSave(config, stateData, componentProps) {
  updateSubChild(config, "power", "network", stateData, componentProps);
}

/**
 * delete a workspace network interface
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsNetworkDelete(config, stateData, componentProps) {
  deleteSubChild(config, "power", "network", componentProps);
}

module.exports = {
  powerVsInit,
  powerVsOnStoreUpdate,
  powerVsCreate,
  powerVsSave,
  powerVsDelete,
  powerVsSshKeysCreate,
  powerVsSshKeysSave,
  powerVsSshKeysDelete,
  powerVsNetworkCreate,
  powerVsNetworkSave,
  powerVsNetworkDelete,
};
