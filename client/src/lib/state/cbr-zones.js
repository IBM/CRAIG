const { lazyZstate } = require("lazy-z/lib/store");
const {
  carveChild,
  updateChild,
  pushAndUpdate,
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal
} = require("./store.utils");

/**
 * initialize cbr zones in store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function cbrZonesInit(config) {
  config.store.json.cbr_zones = [];
}

/**
 * save cbr zones
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 */
function cbrZoneCreate(config, stateData, componentProps) {
  pushAndUpdate(config, "cbr_zones", stateData);
}

/**
 * create a new cbr zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function cbrZoneSave(config, stateData, componentProps) {
  updateChild(config, "cbr_zones", stateData, componentProps);
}

/**
 * delete cbr zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cbrZoneDelete(config, stateData, componentProps) {
  carveChild(config, "cbr_zones", componentProps);
}

/**
 * create new cbr zone address
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.addresses
 * @param {object} stateData component state data
 */
function cbrZoneAddressCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "cbr_zones",
    "addresses",
    stateData,
    componentProps
  );
}

/**
 * update cbr zone address
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.addresses
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneAddressSave(config, stateData, componentProps) {
  updateSubChild(config, "cbr_zones", "addresses", stateData, componentProps);
}

/**
 * delete a cbr zone address
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.addresses
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneAddressDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cbr_zones", "addresses", componentProps);
}

/**
 * create new cbr zone exclusion
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.exclusions
 * @param {object} stateData component state data
 */
function cbrZoneExclusionCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "cbr_zones",
    "exclusions",
    stateData,
    componentProps
  );
}

/**
 * update cbr zone exclusion
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.exclusions
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneExclusionSave(config, stateData, componentProps) {
  updateSubChild(config, "cbr_zones", "exclusions", stateData, componentProps);
}

/**
 * delete a cbr zone exclusion
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.exclusions
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneExclusionDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cbr_zones", "exclusions", componentProps);
}

module.exports = {
  cbrZonesInit,
  cbrZoneCreate,
  cbrZoneSave,
  cbrZoneDelete,
  cbrZoneAddressCreate,
  cbrZoneAddressSave,
  cbrZoneAddressDelete,
  cbrZoneExclusionCreate,
  cbrZoneExclusionSave,
  cbrZoneExclusionDelete
};
