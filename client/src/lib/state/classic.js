const {
  invalidNameText,
  invalidName,
  invalidSshPublicKey,
} = require("../forms");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
} = require("./utils");

/**
 * init store
 * @param {*} config
 */
function classicSshKeyInit(config) {
  config.store.json.classic_ssh_keys = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicSshKeyOnStoreUpdate(config) {
  if (!config.store.json.classic_ssh_keys) {
    config.store.json.classic_ssh_keys = [];
  }
}

/**
 * create ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyCreate(config, stateData, componentProps) {
  config.push(["json", "classic_ssh_keys"], stateData);
}

/**
 * update ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyUpdate(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_ssh_keys"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete ssh ket
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_ssh_keys"], componentProps.data.name);
}

/**
 * init store
 * @param {*} config
 */
function classicVlanInit(config) {
  config.store.json.classic_vlans = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicVlanOnStoreUpdate(config) {
  if (!config.store.json.classic_vlans) {
    config.store.json.classic_vlans = [];
  }
}

/**
 * create ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanCreate(config, stateData, componentProps) {
  config.push(["json", "classic_vlans"], stateData);
}

/**
 * update ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanUpdate(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_vlans"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete ssh ket
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_vlans"], componentProps.data.name);
}

/**
 * initialize classic ssh keys and vlans
 * @param {*} store
 */
function intiClassicInfrastructure(store) {
  store.newField("classic_ssh_keys", {
    init: classicSshKeyInit,
    onStoreUpdate: classicSshKeyOnStoreUpdate,
    create: classicSshKeyCreate,
    save: classicSshKeyUpdate,
    delete: classicSshKeyDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "public_key"],
      "classic_ssh_keys"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("classic_ssh_keys"),
        invalidText: invalidNameText("classic_ssh_keys"),
      },
      public_key: {
        default: "",
        invalid: function (stateData, componentProps) {
          return invalidSshPublicKey(stateData, componentProps).invalid;
        },
        invalidText: function (stateData, componentProps) {
          return invalidSshPublicKey(stateData, componentProps).invalidText;
        },
      },
    },
  });

  store.newField("classic_vlans", {
    init: classicVlanInit,
    onStoreUpdate: classicVlanOnStoreUpdate,
    create: classicVlanCreate,
    save: classicVlanUpdate,
    delete: classicVlanDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "datacenter", "type"],
      "classic_vlans"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("classic_vlans"),
        invalidText: invalidNameText("classic_vlans"),
      },
      type: {
        default: "",
        invalid: fieldIsNullOrEmptyString("type"),
      },
      datacenter: {
        default: "",
        invalid: fieldIsNullOrEmptyString("datacenter"),
      },
    },
  });
}

module.exports = {
  classicSshKeyOnStoreUpdate,
  classicSshKeyInit,
  classicSshKeyCreate,
  classicSshKeyUpdate,
  classicSshKeyDelete,
  classicVlanInit,
  classicVlanOnStoreUpdate,
  classicVlanCreate,
  classicVlanUpdate,
  classicVlanDelete,
  intiClassicInfrastructure,
};
