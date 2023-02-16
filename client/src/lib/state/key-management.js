const { splat, revision, carve } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { buildNewEncryptionKey } = require("../builders");
const { newDefaultKms } = require("./defaults");
const {
  setUnfoundResourceGroup,
  carveChild,
  updateChild,
  pushAndUpdate,
  updateSubChild,
  pushToChildField,
  deleteSubChild
} = require("./store.utils");

/**
 * initialize key management in slz store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function keyManagementInit(config) {
  config.store.json.key_management = newDefaultKms();
  // push roks key
  config.store.json.key_management[0].keys.push({
    key_ring: "ring",
    name: "roks-key",
    root_key: true,
    force_delete: null,
    endpoint: null,
    rotation: 12,
    dual_auth_delete: false
  });
  setEncryptionKeys(config);
}

/**
 * update key management store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 */
function keyManagementOnStoreUpdate(config) {
  setEncryptionKeys(config);
  config.store.json.key_management.forEach(kms => {
    setUnfoundResourceGroup(config, kms);
  });
}

/**
 * save key management
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {object} stateData component state data
 * @param {boolean} stateData.use_hs_crypto
 * @param {boolean} stateData.use_data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 */
function keyManagementSave(config, stateData, componentProps) {
  let keyManagementData = {
    // set to true if use hs crypto
    name: stateData.name,
    resource_group: stateData.resource_group,
    use_hs_crypto: stateData.use_hs_crypto || false,
    authorize_vpc_reader_role: stateData.authorize_vpc_reader_role,
    use_data: stateData.use_hs_crypto ? true : stateData.use_data || false
  };
  updateChild(config, "key_management", keyManagementData, componentProps);
}

/**
 * create a new key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function keyManagementCreate(config, stateData) {
  pushAndUpdate(config, "key_management", stateData);
}

/**
 * delete key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function keyManagementDelete(config, stateData, componentProps) {
  carveChild(config, "key_management", componentProps);
}

/**
 * set encryption keys for slz store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<object>} config.store.key_management.keys
 */
function setEncryptionKeys(config) {
  if (config.store.json.key_management.length > 0) {
    // if there is a kms service
    config.store.encryptionKeys = [];
    config.store.json.key_management.forEach(kms => {
      config.store.encryptionKeys = config.store.encryptionKeys.concat(
        splat(kms.keys, "name")
      );
    });
  } else {
    config.store.encryptionKeys = [];
  }
}

/**
 * create new kms key
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<string>} config.store.json.key_management.keys
 * @param {object} stateData component state data
 */
function kmsKeyCreate(config, stateData, componentProps) {
  let newKey = buildNewEncryptionKey(stateData);
  // this needs to know which key management instance - in array
  pushToChildField(config, "key_management", "keys", newKey, componentProps);
}

/**
 * update kms key
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<string>} config.store.json.key_management.keys
 * @param {object} stateData component state data
 * @param {number} stateData.interval_month rotation interval
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function kmsKeySave(config, stateData, componentProps) {
  updateSubChild(config, "key_management", "keys", stateData, componentProps);
}

/**
 * delete a kms key
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<string>} config.store.json.key_management.keys
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function kmsKeyDelete(config, stateData, componentProps) {
  deleteSubChild(config, "key_management", "keys", componentProps);
}

module.exports = {
  keyManagementInit,
  keyManagementOnStoreUpdate,
  keyManagementSave,
  keyManagementCreate,
  keyManagementDelete,
  kmsKeyCreate,
  kmsKeySave,
  kmsKeyDelete
};
