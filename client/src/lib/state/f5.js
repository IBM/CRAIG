const {
  contains,
  eachKey,
  isEmpty,
  eachZone,
  transpose,
  revision,
} = require("lazy-z");
const { addVsiEncryptionKey, newF5Vsi } = require("../builders");
const {
  hasUnfoundVpc,
  setValidSshKeys,
  setUnfoundEncryptionKey,
  setUnfoundResourceGroup,
} = require("./store.utils");

/**
 * initialize f5
 * @param {lazyZState} config landing zone store
 */
function f5Init(config) {
  config.store.json.f5_vsi = [];
}

/**
 * F5 On Store Update Function
 * @param {lazyZState} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {string} config.store.json.f5_vsi.vpc
 * @param {string} config.store.json.f5_vsi.subnet
 * @param {object} config.store.subnets map of vpc subnets
 */
function f5OnStoreUpdate(config) {
  config.store.json.f5_vsi.forEach((instance) => {
    if (hasUnfoundVpc(config, instance)) {
      // if vpc no longer exists reinitialize fields
      instance.vpc = null;
      instance.subnet = null;
      instance.template.vpc = null;
      instance.network_interfaces = [];
    }

    setUnfoundEncryptionKey(config, instance, "encryption_key");
    setValidSshKeys(config, instance);
    setUnfoundResourceGroup(config, instance);
  });
}

/**
 * create f5 vsi deployments across zones
 * @param {lazyZState} config landing zone store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.ssh_keys
 * @param {Array<string>} config.store.encryptionKeys
 * @param {string} config.store.edge_pattern pattern for edge network configuration
 * @param {object} stateData component state data
 * @param {boolean} stateData.useManagement use management vpc
 * @param {number} stateData.zones number of zones
 */
function f5VsiCreate(config, stateData) {
  let useManagement = stateData.edgeType === "management";
  let zones = stateData.zones;
  config.store.json.f5_vsi = [];
  config.store.f5_on_management = useManagement;
  // add encryption key if not
  if (!contains(config.store.encryptionKeys, "vsi-volume-key")) {
    addVsiEncryptionKey(config);
    config.store.encryptionKeys.push("vsi-volume-key");
  }
  if (isEmpty(config.store.json.ssh_keys)) {
    config.store.json.ssh_keys.push({
      name: "ssh-key",
      public_key: "<user-determined-value>",
    });
  }
  eachZone(zones || 3, (zone) => {
    config.store.json.f5_vsi.push(
      newF5Vsi(config.store.edge_pattern, zone, useManagement, stateData)
    );
  });
}

/**
 * save f5 vsi deployment configuration
 * @param {lazyZState} config landing zone store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {string} config.store.edge_pattern pattern for edge network configuration
 * @param {boolean} config.store.f5_on_management use management vpc
 * @param {object} stateData component state data
 * @param {number} stateData.zones number of zones
 */
function f5VsiSave(config, stateData) {
  config.store.json.f5_vsi = [];
  eachZone(stateData.zones, (zone) => {
    config.store.json.f5_vsi.push(
      newF5Vsi(
        config.store.edge_pattern,
        zone,
        config.store.f5_on_management,
        stateData
      )
    );
  });
}

/**
 * save a single f5 vsi instance
 * @param {lazyZState} config landing zone store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 * @param {string} stateData.boot_volume_encryption_key_name
 */
function f5TemplateSave(config, stateData, componentProps) {
  eachKey(stateData, (key) => {
    if (key === "tmos_admin_password" && stateData.tmos_admin_password === "") {
      stateData.tmos_admin_password = null;
    } else if (stateData[key] === "") {
      stateData[key] = "null";
    }
  });
  config.store.json.f5_vsi.forEach((vsi) => {
    transpose(stateData, vsi.template);
  });
}

/**
 * save a single f5 vsi instance
 * @param {lazyZState} config  store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 * @param {string} stateData.encryption_key
 */
function f5InstanceSave(config, stateData) {
  new revision(config.store.json)
    .child("f5_vsi", stateData.name)
    .then((data) => {
      data.resource_group = stateData.resource_group;
      data.encryption_key = stateData.encryption_key;
    });
}

module.exports = {
  f5Init,
  f5OnStoreUpdate,
  f5VsiCreate,
  f5VsiSave,
  f5InstanceSave,
  f5TemplateSave,
};
