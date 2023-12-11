const { isNullOrEmptyString, titleCase } = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  fieldIsNullOrEmptyString,
  isIpStringInvalid,
  shouldDisableComponentSave,
  resourceGroupsField,
  selectInvalidText,
  titleCaseRender,
  kebabCaseInput,
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
 * hideWhen function
 * @param {object} stateData component state data
 * @returns {boolean} returns true if plan is not enterprise
 */
function hideWhenNotEnterprise(stateData) {
    return stateData.plan !== "enterprise";
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
        size: "small",
        type: "select",
        default: "lite",
        invalid: fieldIsNullOrEmptyString("plan"),
        invalidText: selectInvalidText("a plan"),
        groups: ["Lite", "Standard", "Enterprise"],

        onRender: titleCaseRender("plan"),
        onInputChange: kebabCaseInput("plan"),
      },
      resource_group: resourceGroupsField(false, true),
      throughput: {
        size: "small",
        type: "select",
        default: "",
        invalid: function (stateData) {
          if (stateData.plan === "enterprise") {
            return isNullOrEmptyString(stateData.throughput);
          }
          return false;
        },
        invalidText: selectInvalidText("a throughput"),
        groups: ["150MB/s", "300MB/s", "450MB/s"],
        hideWhen: hideWhenNotEnterprise,
      },
      storage_size: {
        size: "small",
        type: "select",
        default: "",
        invalid: function (stateData) {
          if (stateData.plan === "enterprise") {
            return isNullOrEmptyString(stateData.storage_size);
          }
          return false;
        },
        invalidText: selectInvalidText("a throughput"),
        groups: ["2TB", "4TB", "6TB", "8TB", "10TB", "12TB"],
        hideWhen: hideWhenNotEnterprise,
      },
      private_ip_allowlist: {
        labelText: "Allowed Private IPs",
        type: "textArea",
        default: "",
        invalid: function (stateData) {
          if (stateData.plan === "enterprise") {
            return isIpStringInvalid(stateData.private_ip_allowlist);
          }
          return false;
        },
        hideWhen: hideWhenNotEnterprise,

        placeholder: "X.X.X.X, X.X.X.X/X, ...",
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
