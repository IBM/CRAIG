const { splatContains } = require("lazy-z");

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
    if (!splatContains(config.store.json.power, "name", volume.workspace)) {
      volume.workspace = null;
      volume.attachments = [];
    } else {
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

module.exports = {
  powerVsVolumesInit,
  powerVsVolumesOnStoreUpdate,
  powerVsVolumeCreate,
  powerVsVolumeSave,
  powerVsVolumeDelete,
};
