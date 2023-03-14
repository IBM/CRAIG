const { splatContains } = require("lazy-z");
const {
  pushAndUpdate,
  updateChild,
  carveChild,
  setUnfoundResourceGroup
} = require("./store.utils");

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
    if(!secretsManager.kms) {
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
  pushAndUpdate(config, "secrets_manager", stateData);
}

/**
 * update existing secretsManager
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerSave(config, stateData, componentProps) {
  updateChild(config, "secrets_manager", stateData, componentProps);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerDelete(config, stateData, componentProps) {
  carveChild(config, "secrets_manager", componentProps);
}

module.exports = {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete
};
