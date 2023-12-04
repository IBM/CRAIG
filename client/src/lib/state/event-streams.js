const { splatContains, isNullOrEmptyString } = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  fieldIsNullOrEmptyString,
  isIpStringInvalid,
  shouldDisableComponentSave,
} = require("./utils");
const { invalidName, invalidNameText } = require("../forms");

/**
 * event streams on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.event_streams
 */
function eventStreamsOnStoreUpdate(config) {
  config.store.json.event_streams.forEach((eventStreams) => {
    setUnfoundResourceGroup(config, eventStreams);
    setKmsFromKeyOnStoreUpdate(eventStreams, config);
  });
}

/**
 * create a new eventStreams instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function eventStreamsCreate(config, stateData) {
  config.push(["json", "event_streams"], stateData);
}

/**
 * update existing eventStreams
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function eventStreamsSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "event_streams"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function eventStreamsDelete(config, stateData, componentProps) {
  config.carve(["json", "event_streams"], componentProps.data.name);
}

/**
 * intialize appid store
 * @param {*} store
 */
function initEventStreams(store) {
  store.newField("event_streams", {
    init: (config) => {
      config.store.json.event_streams = [];
    },
    onStoreUpdate: eventStreamsOnStoreUpdate,
    create: eventStreamsCreate,
    save: eventStreamsSave,
    delete: eventStreamsDelete,
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "resource_group",
        "throughput",
        "storage_size",
        "private_ip_allowlist",
        "endpoints",
        "plan",
      ],
      "event_streams"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("event_streams"),
        invalidText: invalidNameText("event_streams"),
      },
      plan: {
        default: "lite",
        invalid: fieldIsNullOrEmptyString("plan"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_group"),
      },
      throughput: {
        default: "",
        invalid: function (stateData) {
          if (stateData.plan === "enterprise") {
            return isNullOrEmptyString(stateData.throughput);
          }
          return false;
        },
      },
      storage_size: {
        default: "",
        invalid: function (stateData) {
          if (stateData.plan === "enterprise") {
            return isNullOrEmptyString(stateData.storage_size);
          }
          return false;
        },
      },
      private_ip_allowlist: {
        default: "",
        invalid: function (stateData) {
          if (stateData.plan === "enterprise") {
            return isIpStringInvalid(stateData.private_ip_allowlist);
          }
          return false;
        },
      },
      endpoints: {
        default: "",
        invalid: function (stateData) {
          if (stateData.plan === "enterprise") {
            return isNullOrEmptyString(stateData.endpoints);
          }
          return false;
        },
      },
    },
  });
}

module.exports = {
  eventStreamsOnStoreUpdate,
  eventStreamsCreate,
  eventStreamsSave,
  eventStreamsDelete,
  initEventStreams,
};
