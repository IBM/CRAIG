const { splatContains } = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");

/**
 * event streams on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.secrets_manager
 */
function secretsManagerOnStoreUpdate(config) {
  config.store.json.secrets_manager.forEach(secretsManager => {
    setUnfoundResourceGroup(config, secretsManager);
    secretsManager.kms = null;
    config.store.json.key_management.forEach(instance => {
      if (splatContains(instance.keys, "name", secretsManager.encryption_key)) {
        secretsManager.kms = instance.name;
      }
    });
    if (!secretsManager.kms) {
      secretsManager.kms = null;
      secretsManager.encryption_key = null;
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
  config.updateChild(
    ["json", "secrets_manager"],
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
function secretsManagerDelete(config, stateData, componentProps) {
  config.carve(["json", "secrets_manager"], componentProps.data.name);
}

module.exports = {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete
};
