const { revision, carve, contains } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");

/**
 * set unfound resource group to null
 * @param {lazyZstate} state store
 * @param {object} obj arbitrary object
 */
function setUnfoundResourceGroup(config, obj) {
  config.setUnfound("resourceGroups", obj, "resource_group");
}

/**
 * set unfound encryption key to null
 * @param {lazyZstate} state store
 * @param {object} obj arbitrary object
 * @param {string=} overrideField use key other than "kms_key"
 */
function setUnfoundEncryptionKey(config, obj, overrideField) {
  config.setUnfound("encryptionKeys", obj, overrideField || "kms_key");
}

/**
 * update an object within an array of objects in an array of objects
 * @param {lazyZstate} config state store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child is stored
 * @param {object} componentProps.data object data before update
 * @param {string} componentProps.data.name name of object
 * @param {Function=} callback callback for config data to run after object update
 */
function updateSubChild(
  config,
  field,
  subField,
  stateData,
  componentProps,
  callback
) {
  new revision(config.store.json)
    .child(field, componentProps.arrayParentName)
    .updateChild(subField, componentProps.data.name, stateData)
    .then(() => {
      if (callback) callback(config);
    });
}

/**
 * push to an array of objects within an array of objects
 * @param {lazyZstate} config state store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child will be stored
 */
function pushToChildField(config, field, subField, stateData, componentProps) {
  new revision(config.store.json)
    .child(field, componentProps.arrayParentName)
    .data[subField].push(stateData);
}

/**
 * push to an array of objects within an array of objects
 * @param {lazyZstate} config state store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child will be stored
 */
function pushToChildFieldModal(
  config,
  field,
  subField,
  stateData,
  componentProps
) {
  let parentName = componentProps.innerFormProps.arrayParentName;
  pushToChildField(config, field, subField, stateData, {
    arrayParentName: parentName,
  });
}

/**
 * delete an object from an array of objects within an array of objects
 * @param {lazyZstate} config state store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child is stored
 * @param {object} componentProps.data object data
 * @param {string} componentProps.data.name name of object
 */
function deleteSubChild(config, field, subField, componentProps) {
  new revision(config.store.json)
    .child(field, componentProps.arrayParentName)
    .child(subField)
    .deleteArrChild(componentProps.data.name);
}

/**
 * check if a component has an unfound vpc
 * @param {lazyZState} config state store
 * @param {object} config.store
 * @param {Array<string>} config.store.vpcList list of vpcs
 * @param {object} obj arbitrary object
 * @param {string} obj.vpc name of vpc
 * @returns {boolean} true if not found
 */
function hasUnfoundVpc(config, obj) {
  return contains(config.store.vpcList, obj.vpc) === false;
}

/**
 * set object ssh keys value to remove all invalid keys
 * @param {lazyZstate} config  state store
 * @param {object} config.store
 * @param {Array<string>} config.store.sshKeys list of ssh keys
 * @param {object} obj arbitrary object
 * @param {Array<string>} obj.ssh_keys list of ssh keys
 */
function setValidSshKeys(config, obj) {
  let sshKeys = [];
  obj.ssh_keys.forEach((key) => {
    if (contains(config.store.sshKeys, key)) sshKeys.push(key);
  });
  obj.ssh_keys = sshKeys;
}

module.exports = {
  setValidSshKeys,
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey,
  updateSubChild,
  pushToChildField,
  deleteSubChild,
  hasUnfoundVpc,
  pushToChildFieldModal,
};
