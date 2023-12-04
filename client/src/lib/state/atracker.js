const { transpose, isEmpty, isNullOrEmptyString } = require("lazy-z");
const { shouldDisableComponentSave } = require("./utils");
const { splatContains } = require("lazy-z/lib/objects");

/**
 * initialize atracker
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 */
function atrackerInit(config) {
  // initialize config.json atracker for default patterns
  config.store.json.atracker = {
    enabled: true,
    type: "cos",
    name: "atracker",
    target_name: "atracker-cos",
    bucket: "atracker-bucket",
    add_route: true,
    cos_key: "cos-bind-key",
    locations: ["global", "us-south"],
  };
}

/**
 * atracker on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.atracker
 */
function atrackerOnStoreUpdate(config) {
  let atracker = config.store.json.atracker;
  config.updateUnfound("cosBuckets", atracker, "bucket");
  config.updateUnfound("cosKeys", atracker, "cos_key");
}

/**
 * save atracker
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.atracker
 * @param {object} stateData component state data
 * @param {string} stateData.atracker_key
 */
function atrackerSave(config, stateData) {
  config.store.json.object_storage.forEach((cos) => {
    if (splatContains(cos.buckets, "name", stateData.bucket)) {
      stateData.target_name = cos.name;
    }
  });

  transpose(stateData, config.store.json.atracker);
}

function initAtracker(store) {
  store.newField("atracker", {
    init: atrackerInit,
    onStoreUpdate: atrackerOnStoreUpdate,
    save: atrackerSave,
    shouldDisableSave: shouldDisableComponentSave(
      ["bucket", "cos_key", "locations", "plan", "resource_group"],
      "atracker"
    ),
    schema: {
      enabled: {
        default: true,
      },
      name: {
        default: "",
      },
      resource_group: {
        default: "",
        invalidText: function () {
          return "Select a Resource Group";
        },
        invalid: function (stateData) {
          return stateData.instance ? !stateData.resource_group : false;
        },
      },
      type: {
        default: "",
      },
      target_name: {
        default: "",
      },
      bucket: {
        default: "",
        invalid: function (stateData) {
          return stateData.enabled
            ? isNullOrEmptyString(stateData.bucket)
            : false;
        },
        invalidText: function () {
          return "Select an Object Storage bucket.";
        },
      },
      cos_key: {
        default: "",
        invalid: function (stateData) {
          return stateData.enabled ? !stateData.cos_key : false;
        },
        invalidText: function () {
          return "Select an Object Storage key.";
        },
      },
      add_route: {
        default: false,
      },
      locations: {
        default: [],
        invalid: function (stateData) {
          return stateData.enabled ? isEmpty(stateData.locations) : false;
        },
        invalidText: function () {
          return "Select at least one location.";
        },
      },
      instance: {
        default: false,
      },
      plan: {
        default: "lite",
        invalidText: function () {
          return "Select a plan.";
        },
        invalid: function (stateData) {
          return stateData.instance ? !stateData.plan : false;
        },
      },
      archive: {
        default: false,
      },
    },
  });
}

module.exports = {
  atrackerInit,
  atrackerOnStoreUpdate,
  atrackerSave,
  initAtracker,
};
