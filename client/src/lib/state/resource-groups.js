const { splat } = require("lazy-z");
const { pushAndUpdate, updateChild, carveChild } = require("./store.utils");

/**
 * initialize resource groups
 * @param {lazyZstate} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function resourceGroupInit(config) {
  config.store.json.resource_groups = [
    {
      use_prefix: true,
      name: "service-rg",
      use_data: false
    },
    {
      use_prefix: true,
      name: "management-rg",
      use_data: false
    },
    {
      use_prefix: true,
      name: "workload-rg",
      use_data: false
    }
  ];
  resourceGroupOnStoreUpdate(config);
}

/**
 * on store update
 * @param {lazyZstate} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function resourceGroupOnStoreUpdate(config) {
  config.store.resourceGroups = splat(
    config.store.json.resource_groups,
    "name"
  );
}

/**
 * create a new resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function resourceGroupCreate(config, stateData) {
  pushAndUpdate(config, "resource_groups", stateData);
}

/**
 * update existing resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function resourceGroupSave(config, stateData, componentProps) {
  updateChild(config, "resource_groups", stateData, componentProps);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function resourceGroupDelete(config, stateData, componentProps) {
  carveChild(config, "resource_groups", componentProps);
}

module.exports = {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete
};
