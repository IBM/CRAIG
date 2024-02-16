const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  setUnfoundResourceGroup,
} = require("../store.utils");
const {
  splatContains,
  revision,
  getObjectFromArray,
  contains,
  splat,
} = require("lazy-z");
const { edgeRouterEnabledZones } = require("../../constants");
const { shouldDisableComponentSave, sshKeySchema } = require("../utils");
const { powerVsWorkspaceSchema } = require("./power-vs-workspace-schema");
const { powerVsNetworkSchema } = require("./power-vs-network-schema");
const {
  powerVsCloudConnectionsSchema,
} = require("./power-vs-cloud-connections-schema");

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
        item.workspace_use_data = workspace.use_data || false;
      });
    });

    let selectedImages = [];
    workspace.images.forEach((image) => {
      if (contains(workspace.imageNames, image.name)) {
        selectedImages.push(image);
      }
    });
    workspace.images = selectedImages;
    // add unfound networks to attachments
    workspace.network.forEach((nw) => {
      if (nw.pi_network_jumbo && !nw.pi_network_mtu) {
        nw.pi_network_mtu = "9000";
      } else if (!nw.pi_network_mtu && nw.pi_network_jumbo === false) {
        nw.pi_network_mtu = "1500";
      } else if (!nw.pi_network_mtu) nw.pi_network_mtu = "";
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
  if (stateData.images && stateData.imageNames) {
    stateData.images = stateData.images.filter((image) => {
      if (contains(stateData.imageNames, image.name)) return image;
    });
  } else {
    stateData.images = [];
    stateData.imageNames = [];
  }
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
  config.store.json.transit_gateways.forEach((tgw) => {
    tgw.connections.forEach((connection) => {
      if (connection.power === componentProps.data.name) {
        connection.power = stateData.name;
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
        if (data)
          // per zones don't have attachments
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
 * hide when workspace does uses data
 * @param {*} stateData
 * @returns {boolean} true if use data
 */
function hideWhenWorkspaceUseData(stateData) {
  return stateData.workspace_use_data === true;
}

/**
 * hide when workspace does not use data
 * @param {*} stateData
 * @returns {boolean} true if not use data
 */
function hideWhenWorkspaceNotUseData(stateData) {
  return !hideWhenWorkspaceUseData(stateData);
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
      ["name", "imageNames", "resource_group", "zone"],
      "power"
    ),
    schema: powerVsWorkspaceSchema(),
    subComponents: {
      ssh_keys: {
        create: powerVsSshKeysCreate,
        delete: powerVsSshKeysDelete,
        save: powerVsSshKeysSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "public_key"],
          "power",
          "ssh_keys"
        ),
        schema: sshKeySchema("power_vs_ssh_keys"),
      },
      network: {
        create: powerVsNetworkCreate,
        delete: powerVsNetworkDelete,
        save: powerVsNetworkSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "pi_cidr", "pi_dns", "pi_network_type", "pi_network_mtu"],
          "power",
          "network"
        ),
        schema: powerVsNetworkSchema(),
      },
      cloud_connections: {
        create: powerVsCloudConnectionCreate,
        delete: powerVsCloudConnectionDelete,
        save: powerVsCloudConnectionSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "transit_gateways", "pi_cloud_connection_speed"],
          "power",
          "cloud_connections"
        ),
        schema: powerVsCloudConnectionsSchema(),
      },
      attachments: {
        save: powerVsNetworkAttachmentSave,
        schema: {
          connections: {
            type: "multiselect",
            groups: function (stateData, componentProps) {
              let parentConnections = getObjectFromArray(
                componentProps.craig.store.json.power,
                "name",
                componentProps.arrayParentName
              ).cloud_connections;
              return splat(parentConnections, "name");
            },
            invalid: function () {
              // any number of cloud connections is valid
              return false;
            },
          },
        },
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
  hideWhenWorkspaceNotUseData,
};
