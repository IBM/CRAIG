const { lazyZstate } = require("lazy-z/lib/store");
const { contains } = require("lazy-z");
const { optionsInit, optionsSave } = require("./options");
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
const {
  cosInit,
  cosOnStoreUpdate,
  cosCreate,
  cosSave,
  cosDelete,
  cosBucketCreate,
  cosBucketSave,
  cosBucketDelete,
  cosKeyCreate,
  cosKeySave,
  cosKeyDelete
} = require("./cos");
const {
  atrackerInit,
  atrackerOnStoreUpdate,
  atrackerSave
} = require("./atracker");
const {
  appidCreate,
  appidOnStoreUpdate,
  appidSave,
  appidDelete
} = require("./appid");
const {
  vpcCreate,
  vpcDelete,
  vpcInit,
  vpcOnStoreUpdate,
  vpcSave,
  subnetCreate,
  subnetSave,
  subnetDelete,
  subnetTierCreate,
  subnetTierSave,
  subnetTierDelete,
  naclCreate,
  naclSave,
  naclDelete,
  naclRuleCreate,
  naclRuleSave,
  naclRuleDelete
} = require("./vpc");

const state = function() {
  let store = new lazyZstate({
    _defaults: {
      json: {},
      cosBuckets: [],
      cosKeys: []
    },
    _no_default: []
  });

  /**
   * update unfound value from store
   * @param {string} listName name of the list within the store
   * @param {Object} obj arbitrary object
   * @param {string} field name of the field on the object to update
   */
  store.updateUnfound = function(listName, obj, field) {
    if (!contains(store.store[listName], obj[field])) {
      obj[field] = null;
    }
  };

  store.newField("options", {
    init: optionsInit,
    save: optionsSave
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

  // next, update cos
  store.newField("cos", {
    init: cosInit,
    onStoreUpdate: cosOnStoreUpdate,
    create: cosCreate,
    save: cosSave,
    delete: cosDelete,
    subComponents: {
      buckets: {
        create: cosBucketCreate,
        save: cosBucketSave,
        delete: cosBucketDelete
      },
      keys: {
        create: cosKeyCreate,
        save: cosKeySave,
        delete: cosKeyDelete
      }
    }
  });

  store.newField("vpcs", {
    init: vpcInit,
    onStoreUpdate: vpcOnStoreUpdate,
    create: vpcCreate,
    save: vpcSave,
    delete: vpcDelete,
    subComponents: {
      acls: {
        create: naclCreate,
        save: naclSave,
        delete: naclDelete,
        subComponents: {
          rules: {
            create: naclRuleCreate,
            save: naclRuleSave,
            delete: naclRuleDelete
          }
        }
      },
      subnets: {
        create: subnetCreate,
        save: subnetSave,
        delete: subnetDelete
      },
      subnetTiers: {
        create: subnetTierCreate,
        save: subnetTierSave,
        delete: subnetTierDelete
      }
    }
  });

  store.newField("atracker", {
    init: atrackerInit,
    onStoreUpdate: atrackerOnStoreUpdate,
    save: atrackerSave
  });

  store.newField("appid", {
    init: config => {
      config.store.json.appid = [];
    },
    onStoreUpdate: appidOnStoreUpdate,
    create: appidCreate,
    save: appidSave,
    delete: appidDelete
  });

  return store;
};

module.exports = state;
