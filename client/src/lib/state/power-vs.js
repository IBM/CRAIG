const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  setUnfoundResourceGroup,
} = require("./store.utils");
const {
  splatContains,
  revision,
  getObjectFromArray,
  contains,
} = require("lazy-z");
const powerImages = require("../docs/power-image-map.json");
const { edgeRouterEnabledZones } = require("../constants");

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
    config.store.json._options.power_vs_zones = [];
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
        item.zone = workspace.zone;
      });
    });
    workspace.images = [];
    let zoneImages = powerImages[workspace.zone];
    // convert image names to list
    workspace.imageNames.forEach((name) => {
      workspace.images.push({
        name: name,
        workspace: workspace.name,
        zone: workspace.zone,
        pi_image_id: getObjectFromArray(zoneImages, "name", name).imageID,
      });
    });
    // add unfound networks to attachments
    workspace.network.forEach((nw) => {
      if (!splatContains(workspace.attachments, "network", nw.name)) {
        workspace.attachments.push({
          network: nw.name,
          workspace: workspace.name,
          zone: workspace.zone,
          connections: [],
        });
      }
    });
    if (contains(edgeRouterEnabledZones, workspace.zone)) {
      workspace.cloud_connections = [];
      workspace.attachments = [];
    }
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
  if (stateData.name !== componentProps.data.name) {
    // update attachment name on network change
    new revision(config.store.json)
      .child("power", componentProps.arrayParentName)
      .child("attachments", componentProps.data.name, "network")
      .then((data) => {
        data.network = stateData.name;
      });
  }
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

/**
 * create new workspace connection
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsCloudConnectionCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "power",
    "cloud_connections",
    stateData,
    componentProps
  );
}

/**
 * update workspace connection
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsCloudConnectionSave(config, stateData, componentProps) {
  updateSubChild(
    config,
    "power",
    "cloud_connections",
    stateData,
    componentProps
  );
}

/**
 * delete a workspace connection
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function powerVsCloudConnectionDelete(config, stateData, componentProps) {
  deleteSubChild(config, "power", "cloud_connections", componentProps);
}

/**
 * save power vs network attachment
 * @param {lazyZstate} config
 * @param {object} stateData
 * @param {object} componentProps
 */
function powerVsNetworkAttachmentSave(config, stateData, componentProps) {
  // subchild not used here as it points to name and attachments
  // use network as key
  new revision(config.store.json)
    .child("power", componentProps.arrayParentName)
    .child("attachments", stateData.network, "network")
    .update(stateData)
    .then(() => {
      config.update();
    });
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
  powerVsCloudConnectionCreate,
  powerVsCloudConnectionDelete,
  powerVsCloudConnectionSave,
  powerVsNetworkAttachmentSave,
};
