const { lazyZstate } = require("lazy-z/lib/store");
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

  return store;
};

module.exports = state;
