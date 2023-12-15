const { splatContains, transpose } = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const { getCosFromBucket } = require("../forms/utils");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyStringEnabled,
} = require("./utils");

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

/**
 * intialize LogDna store
 * @param {*} store
 */
function initLogDna(store) {
  store.newField("logdna", {
    init: logdnaInit,
    onStoreUpdate: logdnaOnStoreUpdate,
    save: logdnaSave,
    shouldDisableSave: shouldDisableComponentSave(
      ["plan", "resource_group", "bucket"],
      "logdna"
    ),
    schema: {
      plan: {
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("plan"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("resource_group"),
      },
      bucket: {
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("bucket"),
      },
    },
  });
}

/**
 * intialize sysDig store
 * @param {*} store
 */
function initSysDig(store) {
  store.newField("sysdig", {
    init: sysdigInit,
    onStoreUpdate: sysdigOnStoreUpdate,
    save: sysdigSave,
    shouldDisableSave: shouldDisableComponentSave(
      ["resource_group", "plan"],
      "sysdig"
    ),
    schema: {
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("resource_group"),
      },
      plan: {
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("plan"),
      },
    },
  });
}

module.exports = {
  initLogDna,
  initSysDig,
};
