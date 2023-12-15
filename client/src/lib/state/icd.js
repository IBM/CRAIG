const { invalidName, invalidNameText } = require("../forms");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  resourceGroupsField,
  titleCaseRender,
  unconditionalInvalidText,
  kebabCaseInput,
} = require("./utils");
const {
  titleCase,
  kebabCase,
  isInRange,
  isNullOrEmptyString,
  isWholeNumber,
} = require("lazy-z");

/**
 * icd on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.icd
 */
function icdOnStoreUpdate(config) {
  if (!config.store.json.icd) {
    config.store.json.icd = [];
  }
  config.store.json.icd.forEach((icd) => {
    setUnfoundResourceGroup(config, icd);
    setKmsFromKeyOnStoreUpdate(icd, config);
  });
}

/**
 * create a new icd instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function icdCreate(config, stateData) {
  config.push(["json", "icd"], stateData);
}

/**
 * update existing icd
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function icdSave(config, stateData, componentProps) {
  config.updateChild(["json", "icd"], componentProps.data.name, stateData);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function icdDelete(config, stateData, componentProps) {
  config.carve(["json", "icd"], componentProps.data.name);
}

/**
 * check if service is mongoDb
 * @param {object} stateData component state data
 */
function mongoDbDisableCheck(stateData) {
  return stateData.service !== "databases-for-mongodb";
}

/**
 * reduct unit test writing check for number input invalidation
 * @param {*} value
 * @param {*} minRange
 * @param {*} maxRange
 * @returns {boolean} true if any invalid number/range
 */
function invalidNumberCheck(value, minRange, maxRange) {
  let isInvalidNumber = false;
  if (!isNullOrEmptyString(value, true)) {
    isNaN(parseFloat(value))
      ? (isInvalidNumber = true)
      : (isInvalidNumber =
          !isWholeNumber(parseFloat(value)) ||
          !isInRange(parseFloat(value), minRange, maxRange));
  }
  return isInvalidNumber;
}

/**
 * init icd store
 * @param {*} store
 */
function initIcdStore(store) {
  store.newField("icd", {
    init: function (config) {
      config.store.json.icd = [];
    },
    onStoreUpdate: icdOnStoreUpdate,
    save: icdSave,
    create: icdCreate,
    delete: icdDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "service", "resource_group", "memory", "disk", "cpu"],
      "icd"
    ),
    schema: {
      use_data: {
        default: false,
        type: "toggle",
        labelText: "Use Existing Instance",
        size: "small",
      },
      name: {
        size: "small",
        default: "",
        invalid: invalidName("icd"),
        invalidText: invalidNameText("icd"),
      },
      service: {
        size: "small",
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("service"),
        groups: [
          "databases-for-postgresql",
          "databases-for-etcd",
          "databases-for-redis",
          "databases-for-mongodb",
          "databases-for-mysql",
        ].map(titleCase),
        onRender: titleCaseRender("service"),
        onInputChange: function (stateData) {
          if (stateData.service !== "databases-for-mongodb") {
            stateData.plan = "standard";
            stateData.group_id = "member";
          }
          return kebabCase(stateData.service);
        },
      },
      resource_group: resourceGroupsField(true),
      plan: {
        size: "small",
        type: "select",
        default: "standard",
        invalid: fieldIsNullOrEmptyString("plan"),
        groups: function (stateData) {
          return stateData.service === "databases-for-mongodb"
            ? ["Standard", "Enterprise"]
            : ["Standard"];
        },
        disabled: mongoDbDisableCheck,
        onRender: titleCaseRender("plan"),
        onInputChange: kebabCaseInput("plan"),
      },
      group_id: {
        labelText: "Group ID",
        size: "small",
        type: "select",
        default: "member",
        tooltip: {
          content:
            "The ID of the scaling group. Read more about analytics and bi_connector for MongoDB down below.",
          align: "bottom-left",
          link: "https://cloud.ibm.com/docs/databases-for-mongodb?topic=databases-for-mongodb-mongodbee-analytics&interface=api",
        },
        invalid: fieldIsNullOrEmptyString("group_id"),
        groups: function (stateData) {
          return stateData.service === "databases-for-mongodb"
            ? ["member", "analytics", "bi_connector"].map(titleCase)
            : ["Member"];
        },
        disabled: mongoDbDisableCheck,
        onRender: titleCaseRender("group_id"),
        onInputChange: kebabCaseInput("group_id"),
      },
      memory: {
        size: "small",
        labelText: "Memory (GB)",
        default: null,
        invalid: function (stateData, componentProps) {
          return invalidNumberCheck(stateData.memory, 1, 112);
        },
        invalidText: unconditionalInvalidText(
          "RAM must be a whole number with minimum of 1GB and a maximum 112GB per member"
        ),
      },
      disk: {
        size: "small",
        labelText: "Disk (GB)",
        default: null,
        invalid: function (stateData, componentProps) {
          return invalidNumberCheck(stateData.disk, 5, 4096);
        },
        invalidText: unconditionalInvalidText(
          "Disk must be a whole number with minimum of 5GB and a maximum 4096GB per member"
        ),
      },
      cpu: {
        size: "small",
        labelText: "CPU",
        default: null,
        invalid: function (stateData, componentProps) {
          return invalidNumberCheck(stateData.cpu, 0, 28);
        },
        invalidText: unconditionalInvalidText(
          "Using dedicated cores requires a minimum of 0 cores and a maximum of 28 cores per member. For shared CPU, select 0 cores."
        ),
      },
      encryption_key: {
        labelText: "(Optional) Encryption Key",
        optional: true,
        type: "select",
        size: "small",
        default: null,
        groups: function (stateData, componentProps) {
          return componentProps.craig.store.encryptionKeys;
        },
      },
    },
  });
}

module.exports = {
  initIcdStore,
};
