const { splat, revision, carve } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { buildNewEncryptionKey } = require("../builders");
const { newDefaultKms } = require("./defaults");
const { setUnfoundResourceGroup, carveChild } = require("./store.utils");

/**
 * set encryption keys for slz store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<object>} config.store.key_management.keys
 */
function setEncryptionKeys(config) {
  config.store.encryptionKeys = splat(
    config.store.json.key_management[0].keys,
    "name"
  );
}

/**
 * initialize key management in slz store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function keyManagementInit(config) {
  config.store.json.key_management = newDefaultKms(); // is key management supposed to be list?
  // push roks key
  config.store.json.key_management[0].keys.push({
    key_ring: "slz-slz-ring",
    name: "slz-roks-key",
    root_key: true,
    payload: null,
    force_delete: null,
    endpoint: null,
    iv_value: null,
    encrypted_nonce: null,
    policies: {
      rotation: {
        interval_month: 12
      }
    }
  });
  // push vsi key
  config.store.json.key_management[0].keys.push({
    key_ring: "slz-slz-ring",
    name: "slz-vsi-volume-key",
    root_key: true,
    payload: null,
    force_delete: null,
    endpoint: null,
    iv_value: null,
    encrypted_nonce: null,
    policies: {
      rotation: {
        interval_month: 12
      }
    }
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
  // setUnfoundResourceGroup(config, config.store.json.key_management); TODO add
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
function keyManagementSave(slz, stateData) {
  let keyManagementData = {
    // set to true if use hs crypto
    use_data: stateData.use_hs_crypto ? true : stateData.use_data || false,
    use_hs_crypto: stateData.use_hs_crypto || false,
    name: stateData.name,
    resource_group: stateData.resource_group
  };
  new revision(config.store.json.key_management).update(keyManagementData);
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
 * create new kms key
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<string>} config.store.json.key_management.keys
 * @param {object} stateData component state data
 */
function kmsKeyCreate(slz, stateData) {
  let newKey = buildNewEncryptionKey(stateData);
  config.store.json.key_management.keys.push(newKey);
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
  stateData["policies"] = {
    rotation: { interval_month: stateData.interval_month }
  };
  delete stateData.interval_month;
  new revision(config.store.json.key_management).updateChild(
    "keys",
    componentProps.data.name,
    stateData
  );
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
  carve(
    config.store.json.key_management.keys,
    "name",
    componentProps.data.name
  );
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
