const { invalidName, invalidNameText } = require("../forms");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  resourceGroupsField,
  encryptionKeyGroups,
  hideWhenUseData,
  selectInvalidText,
} = require("./utils");

/**
 * secrets manager on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.secrets_manager
 */
function secretsManagerOnStoreUpdate(config) {
  config.store.json.secrets_manager.forEach((secretsManager) => {
    setUnfoundResourceGroup(config, secretsManager);
    setKmsFromKeyOnStoreUpdate(secretsManager, config);
    if (!secretsManager.secrets) {
      secretsManager.secrets = [];
    }
  });
}

/**
 * create a new secretsManager instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function secretsManagerCreate(config, stateData) {
  config.push(["json", "secrets_manager"], stateData);
}

/**
 * update existing secretsManager
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerSave(config, stateData, componentProps) {
  config.store.json.clusters.forEach((cluster) => {
    cluster.opaque_secrets.forEach((secret) => {
      if (secret.secrets_manager == componentProps.data.name) {
        secret.secrets_manager = stateData.name;
      }
    });
  });
  config.updateChild(
    ["json", "secrets_manager"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete secrets manager
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerDelete(config, stateData, componentProps) {
  config.carve(["json", "secrets_manager"], componentProps.data.name);
}

/**
 * create secrets manager store
 * @param {*} store
 */
function initSecretsManagerStore(store) {
  store.newField("secrets_manager", {
    init: (config) => {
      config.store.json.secrets_manager = [];
    },
    onStoreUpdate: secretsManagerOnStoreUpdate,
    create: secretsManagerCreate,
    save: secretsManagerSave,
    delete: secretsManagerDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group", "encryption_key"],
      "secrets_manager"
    ),
    schema: {
      use_data: {
        type: "toggle",
        default: false,
        labelText: "Use Existing Instance",
      },
      name: {
        default: "",
        invalid: invalidName("secrets_manager"),
        invalidText: invalidNameText("secrets_manager"),
        size: "small",
      },
      resource_group: resourceGroupsField(true),
      encryption_key: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("encryption_key"),
        invalidText: selectInvalidText("encryption key"),
        size: "small",
        groups: encryptionKeyGroups,
        hideWhen: hideWhenUseData,
      },
    },
  });
}

module.exports = {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete,
  initSecretsManagerStore,
};
