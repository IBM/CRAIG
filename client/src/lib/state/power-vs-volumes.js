const { splatContains, isInRange } = require("lazy-z");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
} = require("./utils");
const { invalidName, invalidNameText } = require("../forms");

/**
 * initialize power vs volumes
 * @param {*} config
 */
function powerVsVolumesInit(config) {
  config.store.json.power_volumes = [];
}

/**
 * on store update power vs volumes
 * @param {*} config
 */
function powerVsVolumesOnStoreUpdate(config) {
  if (!config.store.json.power_volumes) {
    config.store.json.power_volumes = [];
  }
  config.store.json.power_volumes.forEach((volume) => {
    if (
      !splatContains(config.store.json.power, "name", volume.workspace) &&
      !volume.sap
    ) {
      volume.workspace = null;
      volume.attachments = [];
    } else if (!volume.sap) {
      let newAttachments = [];
      volume.attachments.forEach((attachment) => {
        if (
          splatContains(config.store.json.power_instances, "name", attachment)
        ) {
          newAttachments.push(attachment);
        }
      });
      volume.attachments = newAttachments;
    }
  });
}

/**
 * create a power vs volume
 * @param {*} config
 * @param {*} stateData
 */
function powerVsVolumeCreate(config, stateData) {
  if (!stateData.attachments) stateData.attachments = [];
  config.push(["json", "power_volumes"], stateData);
}

/**
 * save a power vs volume
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function powerVsVolumeSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "power_volumes"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete a power vs volume
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function powerVsVolumeDelete(config, stateData, componentProps) {
  config.carve(["json", "power_volumes"], componentProps.data.name);
}

/**
 * init power vs volume store
 * @param {*} store
 */
function initPowerVsVolumeStore(store) {
  store.newField("power_volumes", {
    init: powerVsVolumesInit,
    onStoreUpdate: powerVsVolumesOnStoreUpdate,
    create: powerVsVolumeCreate,
    save: powerVsVolumeSave,
    delete: powerVsVolumeDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "workspace", "pi_volume_size"],
      "power_volumes"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("power_volumes"),
        invalidText: invalidNameText("power_volumes"),
      },
      workspace: {
        default: "",
        invalid: fieldIsNullOrEmptyString("workspace"),
      },
      pi_volume_size: {
        default: null,
        invalid: function (stateData, componentProps) {
          return !isInRange(parseInt(stateData.pi_volume_size), 1, 2000);
        },
      },
    },
  });
}

module.exports = {
  powerVsVolumesInit,
  powerVsVolumesOnStoreUpdate,
  powerVsVolumeCreate,
  powerVsVolumeSave,
  powerVsVolumeDelete,
  initPowerVsVolumeStore,
};
