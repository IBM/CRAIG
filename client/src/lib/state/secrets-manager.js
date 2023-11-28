const { invalidName, invalidNameText } = require("../forms");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
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
    if (cluster.opaque_secrets) {
      cluster.opaque_secrets.forEach((secret) => {
        if (secret.secrets_manager == componentProps.data.name) {
          secret.secrets_manager = stateData.name;
        }
      });
    }
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
      name: {
        default: "",
        invalid: invalidName("secrets_manager"),
        invalidText: invalidNameText("secrets_manager"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_group"),
      },
      encryption_key: {
        default: "",
        invalid: fieldIsNullOrEmptyString("encryption_key"),
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
