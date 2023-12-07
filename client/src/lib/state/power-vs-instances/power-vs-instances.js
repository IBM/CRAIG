const { contains, splatContains, getObjectFromArray } = require("lazy-z");
const { shouldDisableComponentSave } = require("../utils");
const { getSapVolumeList } = require("../../forms/sap");
const { RegexButWithWords } = require("regex-but-with-words");
const { powerVsInstanceSchema } = require("./power-instances-schema");

/**
 * init store for power instances
 * @param {boolean=} vtl
 * @returns {Function} function to set power vs
 */

function powerVsInstanceInit(vtl) {
  return function (config) {
    config.store.json[vtl ? "vtl" : "power_instances"] = [];
  };
}

/**
 * init store for power instances
 * @param {boolean=} vtl
 * @returns {Function} return function
 */
function powerVsInstanceOnStoreUpdate(vtl) {
  /**
   * on store update for power vs instances
   * @param {lazyZstate} config
   */
  return function (config) {
    let field = vtl ? "vtl" : "power_instances";
    // update existing stores to add power instaces to prevent crash
    if (!config.store.json[field]) {
      config.store.json[field] = [];
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

    config.store.json[field].forEach((instance) => {
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
  };
}

/**
 * add sap volumes
 * @param {*} config
 * @param {*} stateData
 */
function addSapVolumes(config, stateData) {
  if (stateData.sap) {
    config.store.json.power_volumes = config.store.json.power_volumes.concat(
      getSapVolumeList(
        stateData.sap_profile,
        stateData.workspace,
        stateData.name,
        stateData.zone
      )
    );
  }
}

/**
 * delete sap volumes
 * @param {*} config
 * @param {*} componentProps
 */
function deleteSapVolumes(config, componentProps) {
  if (componentProps.data.sap) {
    let newVolumes = [];
    config.store.json.power_volumes.forEach((volume) => {
      if (
        volume.name.match(
          new RegexButWithWords()
            .stringBegin()
            .literal(componentProps.data.name)
            .literal("-sap-")
            .group((exp) => {
              exp.literal("shared");
            })
            .or()
            .group((exp) => {
              exp
                .group((exp) => exp.literal("log").or().literal("data"))
                .literal("-")
                .set("1-4");
            })
            .stringEnd()
            .done("g")
        ) === null
      ) {
        newVolumes.push(volume);
      }
    });
    config.store.json.power_volumes = newVolumes;
  }
}

/**
 * create power vs instance
 * @param {*} vtl
 * @returns {Function} function that returns function for creation
 */
function powerVsInstanceCreate(vtl) {
  /**
   * on power vs instance create
   * @param {lazyZstate} config
   * @param {*} stateData
   */
  return function (config, stateData) {
    addSapVolumes(config, stateData);
    config.push(["json", vtl ? "vtl" : "power_instances"], stateData);
  };
}

/**
 * create function for saving power vs instances
 * @param {boolean=} vtl true if vtl
 * @returns {Function}
 */
function powerVsInstanceSave(vtl) {
  /**
   * on power vs instance save
   * @param {lazyZstate} config
   * @param {*} stateData
   * @param {*} componentProps
   */
  return function (config, stateData, componentProps) {
    if (
      componentProps.data.sap &&
      stateData.sap &&
      (stateData.sap_profile !== componentProps.data.sap_profile ||
        stateData.workspace !== componentProps.workspace)
    ) {
      let newVolumes = getSapVolumeList(
        stateData.sap_profile,
        stateData.workspace,
        stateData.name,
        stateData.zone
      );
      newVolumes.forEach((volume) => {
        let volumeData = getObjectFromArray(
          config.store.json.power_volumes,
          "name",
          volume.name.replace(stateData.name, componentProps.data.name)
        );
        volumeData.name = volume.name;
        volumeData.pi_volume_size = volume.pi_volume_size;
        volumeData.workspace = volume.workspace;
        volumeData.attachments = [stateData.name];
      });
    } else if (componentProps.data.sap !== true && stateData.sap) {
      addSapVolumes(config, stateData);
    } else if (componentProps.data.sap && !stateData.sap) {
      deleteSapVolumes(config, componentProps);
    } else if (stateData.sap) {
      config.store.json.power_volumes.forEach((volume) => {
        if (
          volume.name.match(
            new RegexButWithWords()
              .stringBegin()
              .literal(componentProps.data.name)
              .literal("-sap-")
              .group((exp) => {
                exp.literal("shared");
              })
              .or()
              .group((exp) => {
                exp
                  .group((exp) => exp.literal("log").or().literal("data"))
                  .literal("-")
                  .set("1-4");
              })
              .stringEnd()
              .done("g")
          ) !== null
        ) {
          volume.name = volume.name.replace(
            componentProps.data.name,
            stateData.name
          );
          volume.zone = stateData.zone;
          volume.attachments = [stateData.name];
        }
      });
    }
    config.updateChild(
      ["json", vtl ? "vtl" : "power_instances"],
      componentProps.data.name,
      stateData
    );
  };
}

/**
 * power vs instance delete
 * @param {boolean} vtl true when vtl
 * @returns {Function}
 */
function powerVsInstanceDelete(vtl) {
  /**
   * on power vs instance delete
   * @param {lazyZstate} config
   * @param {*} stateData
   * @param {*} componentProps
   */
  return function (config, stateData, componentProps) {
    deleteSapVolumes(config, componentProps);
    config.carve(
      ["json", vtl ? "vtl" : "power_instances"],
      componentProps.data.name
    );
  };
}

/**
 * initialize powerVs instance
 * @param {*} config
 */
function initPowerVsInstance(store) {
  store.newField("power_instances", {
    init: powerVsInstanceInit(),
    onStoreUpdate: powerVsInstanceOnStoreUpdate(),
    create: powerVsInstanceCreate(),
    save: powerVsInstanceSave(),
    delete: powerVsInstanceDelete(),
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "sap",
        "sap_profile",
        "workspace",
        "network",
        "ssh_key",
        "image",
        "pi_sys_type",
        "pi_proc_type",
        "pi_processors",
        "pi_memory",
        "pi_storage_type",
        "pi_storage_pool",
        "pi_affinity_volume",
        "pi_affinity_instance",
        "pi_anti_affinity_instance",
        "pi_anti_affinity_volume",
        "storage_option",
      ],
      "power_instances"
    ),
    schema: powerVsInstanceSchema(),
  });
}

module.exports = {
  powerVsInstanceInit,
  powerVsInstanceOnStoreUpdate,
  powerVsInstanceSave,
  powerVsInstanceCreate,
  powerVsInstanceDelete,
  initPowerVsInstance,
};
