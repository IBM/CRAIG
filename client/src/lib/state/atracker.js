const { transpose, isEmpty, isNullOrEmptyString, contains } = require("lazy-z");
const {
  shouldDisableComponentSave,
  titleCaseRender,
  kebabCaseInput,
} = require("./utils");
const { splatContains, nestedSplat, splat } = require("lazy-z");

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

/**
 * Returns true if atracker is disabled
 * @param {object} stateData
 * @returns {boolean} true when should be hidden
 */
function hideWhenDisabled(stateData) {
  return !stateData.enabled;
}

/**
 * Returns true if no atracker instance is created
 * @param {object} stateData
 * @returns {boolean} true when should be hidden
 */
function hideWhenNoInstance(stateData) {
  return !(stateData.enabled && stateData.instance);
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
        type: "toggle",
        size: "small",
        labelText: "Enable",
        tooltip: {
          content:
            "Enable or Disable routing in your Activity Tracker Instance",
          align: "right",
        },
      },
      name: {
        default: "",
        size: "small",
        readOnly: true,
        hideWhen: hideWhenDisabled,
        onRender: function (stateData, componentProps) {
          return `${componentProps.craig.store.json._options.prefix}-atracker`;
        },
      },
      resource_group: {
        size: "small",
        default: "",
        type: "select",
        hideWhen: hideWhenNoInstance,
        groups: function (stateData, componentProps) {
          return splat(componentProps.craig.store.json.resource_groups, "name");
        },
        invalidText: function () {
          return "Select a Resource Group";
        },
        invalid: function (stateData) {
          return stateData.instance && stateData.enabled
            ? isNullOrEmptyString(stateData.resource_group, true)
            : false;
        },
      },
      type: {
        default: "",
      },
      target_name: {
        default: "",
      },
      bucket: {
        size: "small",
        default: "",
        type: "select",
        labelText: "Object Storage Log Bucket",
        hideWhen: hideWhenDisabled,
        tooltip: {
          content:
            "The bucket name under the Cloud Object Storage instance where Activity Tracker logs will be stored",
          align: "top",
        },
        groups: function (stateData, componentProps) {
          return nestedSplat(
            componentProps.craig.store.json.object_storage,
            "buckets",
            "name"
          );
        },
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
        size: "small",
        default: "",
        type: "select",
        labelText: "Privileged IAM Object Storage Key",
        hideWhen: hideWhenDisabled,
        tooltip: {
          content:
            "The IAM API key that has writer access to the Cloud Object Storage instance",
          align: "top",
        },
        groups: function (stateData, componentProps) {
          return nestedSplat(
            componentProps.craig.store.json.object_storage,
            "keys",
            "name"
          );
        },
        invalid: function (stateData) {
          return stateData.enabled ? !stateData.cos_key : false;
        },
        invalidText: function () {
          return "Select an Object Storage key.";
        },
      },
      add_route: {
        size: "small",
        default: false,
        type: "toggle",
        hideWhen: hideWhenDisabled,
        labelText: "Create Route",
        tooltip: {
          content:
            "Must be enabled in order to forward all logs to the Cloud Object Storage bucket",
          align: "right",
        },
      },
      locations: {
        size: "small",
        default: [],
        type: "multiselect",
        groups: function (stateData, componentProps) {
          return ["global"].concat(
            componentProps?.craig?.store?.json?._options?.region || ""
          );
        },
        hideWhen: hideWhenDisabled,
        invalid: function (stateData) {
          return stateData.enabled === true
            ? isEmpty(stateData.locations)
            : false;
        },
        invalidText: function () {
          return "Select at least one location.";
        },
      },
      instance: {
        default: false,
        type: "toggle",
        size: "small",
        labelText: "Create Activity Tracker Instance",
        tooltip: {
          content:
            "Only one instance of Activity Tracker can be created per region.",
          align: "right",
        },
      },
      plan: {
        size: "small",
        default: "lite",
        type: "select",
        groups: ["Lite", "7 Day", "14 Day", "30 Day"],
        onRender: titleCaseRender("plan"),
        onInputChange: kebabCaseInput("plan"),
        hideWhen: hideWhenNoInstance,
        invalidText: function () {
          return "Select a plan.";
        },
        invalid: function (stateData) {
          return stateData.instance && stateData.enabled
            ? !stateData.plan
            : false;
        },
      },
      archive: {
        size: "small",
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
