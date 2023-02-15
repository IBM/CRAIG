const { lazyZstate } = require("lazy-z/lib/store");
const {
  keyManagementInit,
  keyManagementOnStoreUpdate,
  keyManagementSave,
  kmsKeyCreate,
  kmsKeyDelete,
  kmsKeySave,
  keyManagementCreate,
  keyManagementDelete
} = require("./key-management");
const {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete
} = require("./resource-groups");

const state = function() {
  let store = new lazyZstate({
    _defaults: {
      json: {
        _options: {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"]
        }
      }
    },
    _no_default: []
  });

  store.newField("resource_groups", {
    init: resourceGroupInit,
    onStoreUpdate: resourceGroupOnStoreUpdate,
    create: resourceGroupCreate,
    save: resourceGroupSave,
    delete: resourceGroupDelete
  });

  // components must check for key management second
  store.newField("key_management", {
    init: keyManagementInit,
    onStoreUpdate: keyManagementOnStoreUpdate,
    save: keyManagementSave,
    create: keyManagementCreate,
    delete: keyManagementDelete,
    subComponents: {
      keys: {
        create: kmsKeyCreate,
        delete: kmsKeyDelete,
        save: kmsKeySave
      }
    }
  });

  return store;
};

module.exports = state;
