const { setUnfoundResourceGroup } = require("./store.utils");
const { setKmsFromKeyOnStoreUpdate } = require("./utils");

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

module.exports = {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete,
};
