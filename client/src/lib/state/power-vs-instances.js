const {
  contains,
  splatContains,
  getObjectFromArray,
  splat,
  isEmpty,
  isIpv4CidrOrAddress,
  isNullOrEmptyString,
  isWholeNumber,
  isInRange,
} = require("lazy-z");
const { invalidNameText, invalidName } = require("../forms");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
} = require("./utils");
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

/**
 * Processor invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerVsCoresInvalid(stateData) {
  let isDedicated = stateData.pi_proc_type === "dedicated";
  let coreMax =
    stateData.pi_sys_type === "e980" ? 17 : isDedicated ? 13 : 13.75;
  let coreMin = isDedicated ? 1 : 0.25;
  let processorsFloat = parseFloat(stateData.pi_processors);
  return (
    stateData.pi_processors === "" ||
    (coreMin === 1 && !isWholeNumber(processorsFloat)) ||
    (!stateData.sap && (processorsFloat < coreMin || processorsFloat > coreMax))
  );
}

/**
 * Memory invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerVsMemoryInvalid(stateData) {
  let memoryFloat = parseFloat(stateData.pi_memory);
  let memoryMax = stateData.pi_sys_type === "e980" ? 15400 : 934;
  return (
    !isWholeNumber(memoryFloat) ||
    (!stateData.sap && !isInRange(memoryFloat, 2, memoryMax))
  );
}

/**
 * return power_instances processor input invalid text
 * @param {Object} stateData
 * @returns {string} invalid text
 */
function invalidPowerVsProcessorTextCallback(stateData) {
  let isDedicated = stateData.pi_proc_type === "dedicated";
  let coreMin = isDedicated ? 1 : 0.25;
  let coreMax =
    stateData.pi_sys_type === "e980" ? 17 : isDedicated ? 13 : 13.75;
  return `Must be a ${
    isDedicated ? "whole " : ""
  }number between ${coreMin} and ${coreMax}.`;
}

/**
 * return power_instances memory input invalid text
 * @param {Object} stateData
 * @returns {string} invalid text
 */
function invalidPowerVsMemoryTextCallback(stateData) {
  let memMin = 2;
  let memMax = stateData.pi_sys_type === "e980" ? 15400 : 934;
  return `Must be a whole number between ${memMin} and ${memMax}.`;
}

/**
 * Network invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerVsNetworkInvalid(stateData) {
  let hasInvalidNetwork = false;
  if (stateData.network && !isEmpty(stateData.network)) {
    stateData.network.forEach((nw) => {
      if (
        (!isNullOrEmptyString(nw.ip_address) &&
          !isIpv4CidrOrAddress(nw.ip_address)) ||
        contains(nw.ip_address, "/")
      )
        hasInvalidNetwork = true;
    });
  }
  return hasInvalidNetwork;
}

/**
 * Affinity invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerAffinityInvalid(stateData, option, type, field) {
  return (
    (stateData.storage_option === option && !stateData.affinity_type) ||
    (stateData.storage_option === option &&
      stateData.affinity_type &&
      stateData.affinity_type === type &&
      isNullOrEmptyString(stateData[field]))
  );
}

/**
 * initialize powerVs instance
 * @param {*} config
 */
function initPowerVsInstance(store) {
  store.newField("power_instances", {
    init: powerVsInstanceInit,
    onStoreUpdate: powerVsInstanceOnStoreUpdate,
    create: powerVsInstanceCreate,
    save: powerVsInstanceSave,
    delete: powerVsInstanceDelete,
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
        "pi_health_status",
        "pi_storage_type",
        "pi_storage_pool",
        "pi_affinity_volume",
        "pi_affinity_instance",
        "pi_anti_affinity_instance",
        "pi_anti_affinity_volume",
      ],
      "power_instances"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("power_instances"),
        invalidText: invalidNameText("power_instances"),
      },
      sap: {
        default: false,
      },
      sap_profile: {
        default: "",
        invalid: function (stateData) {
          return stateData.sap && isNullOrEmptyString(stateData.sap_profile);
        },
      },
      workspace: {
        default: "",
        invalid: fieldIsNullOrEmptyString("workspace"),
      },
      network: {
        default: null,
        invalid: powerVsNetworkInvalid,
      },
      ssh_key: {
        default: "",
        invalid: fieldIsNullOrEmptyString("ssh_key"),
      },
      image: {
        default: "",
        invalid: fieldIsNullOrEmptyString("image"),
      },
      pi_sys_type: {
        default: "",
        invalid: fieldIsNullOrEmptyString("pi_sys_type"),
      },
      pi_proc_type: {
        default: "",
        invalid: fieldIsNullOrEmptyString("pi_proc_type"),
      },
      pi_processors: {
        default: "",
        invalid: powerVsCoresInvalid,
        invalidText: invalidPowerVsProcessorTextCallback,
      },
      pi_memory: {
        default: "",
        invalid: powerVsMemoryInvalid,
        invalidText: invalidPowerVsMemoryTextCallback,
      },
      pi_health_status: {
        default: "",
        invalid: fieldIsNullOrEmptyString("pi_health_status"),
      },
      pi_storage_pool_affinity: {
        default: false,
      },
      storage_option: {
        default: "",
      },
      pi_storage_type: {
        default: "",
        invalid: function (stateData) {
          return (
            stateData.storage_option === "Storage Type" &&
            isNullOrEmptyString(stateData.pi_storage_type)
          );
        },
      },
      pi_storage_pool: {
        default: "",
        invalid: function (stateData) {
          return (
            stateData.storage_option === "Storage Pool" &&
            (!stateData.pi_storage_pool ||
              isNullOrEmptyString(stateData.pi_storage_pool))
          );
        },
      },
      affinity_type: {
        default: null,
      },
      pi_affinity_policy: {
        default: null,
      },
      pi_affinity_volume: {
        default: null,
        invalid: function (stateData) {
          return powerAffinityInvalid(
            stateData,
            "Affinity",
            "Volume",
            "pi_affinity_volume"
          );
        },
      },
      pi_affinity_instance: {
        default: null,
        invalid: function (stateData) {
          return powerAffinityInvalid(
            stateData,
            "Affinity",
            "Instance",
            "pi_affinity_instance"
          );
        },
      },
      pi_anti_affinity_volume: {
        default: null,
        invalid: function (stateData) {
          return powerAffinityInvalid(
            stateData,
            "Anti-Affinity",
            "Volume",
            "pi_anti_affinity_volume"
          );
        },
      },
      pi_anti_affinity_instance: {
        default: null,
        invalid: function (stateData) {
          return powerAffinityInvalid(
            stateData,
            "Anti-Affinity",
            "Instance",
            "pi_anti_affinity_instance"
          );
        },
      },
    },
  });
}

module.exports = {
  powerVsInstanceInit,
  powerVsInstanceOnStoreUpdate,
  powerVsInstanceSave,
  powerVsInstanceCreate,
  powerVsInstanceDelete,
  invalidPowerVsProcessorTextCallback,
  invalidPowerVsMemoryTextCallback,
  initPowerVsInstance,
};
