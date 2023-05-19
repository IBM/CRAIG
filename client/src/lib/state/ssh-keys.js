const { splat } = require("lazy-z");

/**
 * set config store ssh keys
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.ssh_keys
 */
function setSshKeys(config) {
  config.store.sshKeys = splat(config.store.json.ssh_keys, "name");
}

/**
 * ini config store ssh keys
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function sshKeyInit(config) {
  config.store.json.ssh_keys = [
    {
      name: "ssh-key",
      public_key: "<user-determined-value>",
      resource_group: "management-rg",
      use_data: false
    }
  ];
  setSshKeys(config);
}

/**
 * on store update ssh keys
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.ssh_keys
 */
function sshKeyOnStoreUpdate(config) {
  setSshKeys(config);
  config.store.json.ssh_keys.forEach(key => {
    config.setUnfound("resourceGroups", key, "resource_group");
  });
}

/**
 * create a new ssh key
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 */
function sshKeyCreate(config, stateData) {
  config.push(["json", "ssh_keys"], stateData);
}

/**
 * save an ssh key
 * @param {configState} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vsi
 * @param {string} config.store.json.vsi.ssh_keys
 * @param {object} stateData component state data
 * @param {boolean} stateData.show
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name
 */
function sshKeySave(config, stateData, componentProps) {
  delete stateData.show;
  if (stateData.use_data) {
    // if using data, public key null
    stateData.public_key = null;
  }
  // if ssh key has new name
  if (stateData.name !== componentProps.data.name) {
    // for each vsi
    config.store.json.vsi?.forEach(instance => {
      // if old key is found
      let newSshKeys = []; // list of ssh keys
      // for each key in the instance
      instance.ssh_keys.forEach(key => {
        newSshKeys.push(
          // add either the key name or the new key name
          stateData.name
        );
      });
      // set ssh keys
      instance.ssh_keys = newSshKeys;
    });
  }
  config.updateChild(["json", "ssh_keys"], componentProps.data.name, stateData);
}

/**
 * delete ssh key
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function sshKeyDelete(config, stateData, componentProps) {
  config.carve(
    ["json", "ssh_keys"],
    componentProps.data.name
  );
}

module.exports = {
  sshKeyCreate,
  sshKeyDelete,
  sshKeySave,
  sshKeyInit,
  sshKeyOnStoreUpdate
};
