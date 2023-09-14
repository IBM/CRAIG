const {
  contains,
  splatContains,
  getObjectFromArray,
  splat,
} = require("lazy-z");

/**
 * init store for power instances
 * @param {lazyZstate} config
 */
function powerVsInstanceInit(config) {
  config.store.json.power_instances = [];
}

/**
 * on store update for power vs instances
 * @param {lazyZstate} config
 */
function powerVsInstanceOnStoreUpdate(config) {
  // update existing stores to add power instaces to prevent crash
  if (!config.store.json.power_instances) {
    config.store.json.power_instances = [];
  }

  /**
   * reset values for instance based on workspace
   * @param {*} instance
   */
  function resetWorkspaceValues(instance) {
    instance.network = [];
    instance.ssh_key = null;
    instance.workspace = null;
    instance.zone = null;
    instance.image = null;
  }

  config.store.json.power_instances.forEach((instance) => {
    if (config.store.json.power.length === 0) {
      resetWorkspaceValues(instance);
    } else if (
      !splatContains(config.store.json.power, "name", instance.workspace)
    ) {
      resetWorkspaceValues(instance);
    } else {
      let workspace = getObjectFromArray(
        config.store.json.power,
        "name",
        instance.workspace
      );
      instance.zone = workspace.zone;
      if (!contains(workspace.imageNames, instance.image))
        instance.image = null;
      if (!splatContains(workspace.ssh_keys, "name", instance.ssh_key))
        instance.ssh_key = null;
      let newNetworks = [];
      instance.network.forEach((nw) => {
        if (splatContains(workspace.network, "name", nw.name)) {
          newNetworks.push(nw);
        }
      });
      instance.network = newNetworks;
    }
  });
}

/**
 * on power vs instance create
 * @param {lazyZstate} config
 * @param {*} stateData
 */
function powerVsInstanceCreate(config, stateData) {
  config.push(["json", "power_instances"], stateData);
}

/**
 * on power vs instance save
 * @param {lazyZstate} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function powerVsInstanceSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "power_instances"],
    componentProps.data.name,
    stateData
  );
}

/**
 * on power vs instance delete
 * @param {lazyZstate} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function powerVsInstanceDelete(config, stateData, componentProps) {
  config.carve(["json", "power_instances"], componentProps.data.name);
}

module.exports = {
  powerVsInstanceInit,
  powerVsInstanceOnStoreUpdate,
  powerVsInstanceSave,
  powerVsInstanceCreate,
  powerVsInstanceDelete,
};
