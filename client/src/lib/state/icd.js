const { isNullOrEmptyString, isWholeNumber, isInRange } = require("lazy-z");
const {
  invalidName,
  invalidCpuCallback,
  invalidNameText,
  invalidCpuTextCallback,
} = require("../forms");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
} = require("./utils");

/**
 * reduct unit test writing check for number input invalidation
 * @param {*} value
 * @param {*} minRange
 * @param {*} maxRange
 * @returns {boolean} true if any invalid number/range
 */
function invalidNumberCheck(value, minRange, maxRange) {
  let isInvalidNumber = false;
  if (!isNullOrEmptyString(value)) {
    if (!isWholeNumber(value) || !isInRange(value, minRange, maxRange)) {
      isInvalidNumber = true;
    }
  }
  return isInvalidNumber;
}

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
      name: {
        default: "",
        invalid: invalidName("icd"),
        invalidText: invalidNameText("icd"),
      },
      service: {
        default: "",
        invalid: fieldIsNullOrEmptyString("service"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_group"),
      },
      memory: {
        default: null,
        invalid: function (stateData, componentProps) {
          return invalidNumberCheck(
            stateData.memory,
            componentProps.memoryMin,
            componentProps.memoryMax
          );
        },
      },
      disk: {
        default: null,
        invalid: function (stateData, componentProps) {
          return invalidNumberCheck(
            stateData.disk,
            componentProps.diskMin,
            componentProps.diskMax
          );
        },
      },
      cpu: {
        default: null,
        invalid: invalidCpuCallback,
        invalidText: invalidCpuTextCallback,
      },
    },
  });
}

module.exports = {
  icdOnStoreUpdate,
  icdCreate,
  icdSave,
  icdDelete,
  initIcdStore,
};
