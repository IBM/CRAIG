const { splatContains, transpose } = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const { getCosFromBucket } = require("../forms");

/**
 * initialize logdna
 * @param {lazyZstate} config
 */
function logdnaInit(config) {
  config.store.json.logdna = {
    enabled: false,
    plan: "lite",
    endpoints: "private",
    platform_logs: false,
    resource_group: "service-rg",
    cos: "atracker-cos",
    bucket: "atracker-bucket",
  };
}

/**
 * on store update
 * @param {lazyZstate} config
 */
function logdnaOnStoreUpdate(config) {
  if (
    !splatContains(
      config.store.json.object_storage,
      "name",
      config.store.json.logdna.cos
    )
  ) {
    config.store.json.logdna.cos = null;
    config.store.json.logdna.bucket = null;
  } else {
    config.updateUnfound("cosBuckets", config.store.json.logdna, "bucket");
  }
  setUnfoundResourceGroup(config, config.store.json.logdna);
}

/**
 * logdna save
 * @param {lazyZstate} config
 * @param {object} stateData
 */
function logdnaSave(config, stateData) {
  stateData.cos = getCosFromBucket(
    stateData.bucket,
    config.store.json.object_storage
  );
  transpose(stateData, config.store.json.logdna);
}

/**
 * initialize sydig
 * @param {lazyZstate} config
 */
function sysdigInit(config) {
  config.store.json.sysdig = {
    enabled: false,
    plan: "graduated-tier",
    resource_group: "service-rg",
  };
}

/**
 * sysdig save
 * @param {lazyZstate} config
 * @param {object} stateData
 */
function sysdigSave(config, stateData) {
  transpose(stateData, config.store.json.sysdig);
}

/**
 * sysdig on store update
 * @param {lazyZstate} config
 */
function sysdigOnStoreUpdate(config) {
  setUnfoundResourceGroup(config, config.store.json.sysdig);
}

module.exports = {
  logdnaInit,
  logdnaOnStoreUpdate,
  logdnaSave,
  sysdigInit,
  sysdigSave,
  sysdigOnStoreUpdate,
};
