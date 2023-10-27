const {
  contains,
  splatContains,
  getObjectFromArray,
  splat,
} = require("lazy-z");
const { getSapVolumeList } = require("../forms/sap");
const { RegexButWithWords } = require("regex-but-with-words");

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
 * on power vs instance create
 * @param {lazyZstate} config
 * @param {*} stateData
 */
function powerVsInstanceCreate(config, stateData) {
  addSapVolumes(config, stateData);
  config.push(["json", "power_instances"], stateData);
}

/**
 * on power vs instance save
 * @param {lazyZstate} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function powerVsInstanceSave(config, stateData, componentProps) {
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
  deleteSapVolumes(config, componentProps);
  config.carve(["json", "power_instances"], componentProps.data.name);
}

module.exports = {
  powerVsInstanceInit,
  powerVsInstanceOnStoreUpdate,
  powerVsInstanceSave,
  powerVsInstanceCreate,
  powerVsInstanceDelete,
};
