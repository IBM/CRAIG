const { splat, revision } = require("lazy-z");

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
      use_data: false,
    },
    {
      use_prefix: true,
      name: "management-rg",
      use_data: false,
    },
    {
      use_prefix: true,
      name: "workload-rg",
      use_data: false,
    },
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
  config.push(["json", "resource_groups"], stateData);
}

/**
 * update existing resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function resourceGroupSave(config, stateData, componentProps) {
  // update resource group name
  if (stateData.name !== componentProps.data.name) {
    [
      "appid",
      "clusters",
      "object_storage",
      "dns",
      "event_streams",
      "f5_vsi",
      "key_management",
      "load_balancers",
      "routing_tables",
      "secrets_manager",
      "security_groups",
      "ssh_keys",
      "vpcs",
      "transit_gateways",
      "vsi",
      "vpn_gateways",
      "vpn_servers",
      "virtual_private_endpoints",
    ].forEach((item) => {
      config.store.json[item].forEach((resource) => {
        if (resource.resource_group === componentProps.data.name) {
          resource.resource_group = stateData.name;
        }
      });
    });
    ["logdna", "sysdig", "atracker"].forEach((item) => {
      if (config.store.json[item].resource_group === componentProps.data.name) {
        config.store.json[item].resource_group = stateData.name;
      }
    });
  }
  config.updateChild(
    ["json", "resource_groups"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function resourceGroupDelete(config, stateData, componentProps) {
  config.carve(["json", "resource_groups"], componentProps.data.name);
}

module.exports = {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete,
};
