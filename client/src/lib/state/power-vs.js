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
  isEmpty,
  isIpv4CidrOrAddress,
} = require("lazy-z");
const powerImages = require("../docs/power-image-map.json");
const { edgeRouterEnabledZones } = require("../constants");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
} = require("./utils");
const {
  invalidName,
  invalidNameText,
  invalidSshPublicKey,
  invalidCidrBlock,
  invalidCidrText,
} = require("../forms");

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
    if (!contains(config.store.json._options.power_vs_zones, workspace.zone)) {
      workspace.zone = null;
    }

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
        pi_image_id: workspace.zone
          ? getObjectFromArray(zoneImages, "name", name).imageID
          : "ERROR: ZONE UNDEFINED",
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
  ["power_volumes", "power_instances"].forEach((field) => {
    config.store.json[field].forEach((item) => {
      if (item.workspace === componentProps.data.name) {
        item.workspace = stateData.name;
      }
    });
  });
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

/**
 * init power vs store
 * @param {*} store
 */
function initPowerVsStore(store) {
  store.newField("power", {
    init: powerVsInit,
    onStoreUpdate: powerVsOnStoreUpdate,
    save: powerVsSave,
    create: powerVsCreate,
    delete: powerVsDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "imageNames"],
      "power"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("power"),
        invalidText: invalidNameText("power"),
      },
      imageNames: {
        default: [],
        invalid: function (stateData) {
          return isEmpty(stateData.imageNames || []);
        },
      },
    },
    subComponents: {
      ssh_keys: {
        create: powerVsSshKeysCreate,
        delete: powerVsSshKeysDelete,
        save: powerVsSshKeysSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "public_key", "resource_group"],
          "power",
          "ssh_keys"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("power_vs_ssh_keys"),
            invalidText: invalidNameText("power_vs_ssh_keys"),
          },
          resource_group: {
            default: "",
            invalid: fieldIsNullOrEmptyString("resource_group"),
          },
          public_key: {
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidSshPublicKey(stateData, componentProps).invalid;
            },
            invalidText: function (stateData, componentProps) {
              return invalidSshPublicKey(stateData, componentProps).invalidText;
            },
          },
        },
      },
      network: {
        create: powerVsNetworkCreate,
        delete: powerVsNetworkDelete,
        save: powerVsNetworkSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "pi_cidr", "pi_dns"],
          "power",
          "network"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("network"),
            invalidText: invalidNameText("network"),
          },
          pi_cidr: {
            default: "",
            invalid: function (stateData) {
              return invalidCidrBlock(stateData.pi_cidr);
            },
            invalidText: function (stateData, componentProps) {
              return invalidCidrText(store)(
                {
                  cidr: stateData.pi_cidr,
                },
                componentProps
              );
            },
          },
          pi_dns: {
            default: "",
            invalid: function (stateData) {
              return (
                contains(stateData.pi_dns[0], "/") ||
                !isIpv4CidrOrAddress(stateData.pi_dns[0])
              );
            },
            invalidText: function () {
              return "Invalid IP Address";
            },
          },
        },
      },
      cloud_connections: {
        create: powerVsCloudConnectionCreate,
        delete: powerVsCloudConnectionDelete,
        save: powerVsCloudConnectionSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "transit_gateways"],
          "power",
          "cloud_connections"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("cloud_connections"),
            invalidText: invalidNameText("cloud_connections"),
          },
          transit_gateways: {
            default: [],
            invalid: function (stateData) {
              return (
                stateData.pi_cloud_connection_transit_enabled &&
                isEmpty(stateData.transit_gateways)
              );
            },
          },
        },
      },
      attachments: {
        save: powerVsNetworkAttachmentSave,
      },
    },
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
  initPowerVsStore,
};
