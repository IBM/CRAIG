const {
  splatContains,
  isInRange,
  contains,
  splat,
  revision,
  isNullOrEmptyString,
  getObjectFromArray,
} = require("lazy-z");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  powerVsWorkspaceGroups,
  unconditionalInvalidText,
  powerVsStorageOptions,
  powerVsStorageType,
  powerVsAffinityType,
  powerAffinityVolume,
  powerAffinityInstance,
  powerAntiAffinityVolume,
  powerAntiAffinityInstance,
  powerStoragePoolSelect,
  fieldIsNotWholeNumber,
} = require("./utils");
const { invalidName, invalidNameText } = require("../forms");
const { replicationEnabledStoragePoolMap } = require("../constants");

/**
 * initialize power vs volumes
 * @param {*} config
 */
function powerVsVolumesInit(config) {
  config.store.json.power_volumes = [];
}

/**
 * on store update power vs volumes
 * @param {*} config
 */
function powerVsVolumesOnStoreUpdate(config) {
  if (!config.store.json.power_volumes) {
    config.store.json.power_volumes = [];
  }
  config.store.json.power_volumes.forEach((volume) => {
    if (
      !splatContains(config.store.json.power, "name", volume.workspace) &&
      !volume.sap
    ) {
      volume.workspace = null;
      volume.attachments = [];
    } else if (!volume.sap) {
      let newAttachments = [];
      volume.attachments.forEach((attachment) => {
        if (
          splatContains(config.store.json.power_instances, "name", attachment)
        ) {
          newAttachments.push(attachment);
        }
      });
      volume.attachments = newAttachments;
    }

    if (
      volume.workspace &&
      splatContains(config.store.json.power, "name", volume.workspace)
    ) {
      let workspace = getObjectFromArray(
        config.store.json.power,
        "name",
        volume.workspace
      );
      if (volume.zone !== workspace.zone) {
        volume.pi_volume_type = null;
      }
      volume.zone = workspace.zone;
    }
  });
}

/**
 * create a power vs volume
 * @param {*} config
 * @param {*} stateData
 */
function powerVsVolumeCreate(config, stateData) {
  if (!stateData.attachments) stateData.attachments = [];
  config.push(["json", "power_volumes"], stateData);
}

/**
 * save a power vs volume
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function powerVsVolumeSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "power_volumes"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete a power vs volume
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function powerVsVolumeDelete(config, stateData, componentProps) {
  config.carve(["json", "power_volumes"], componentProps.data.name);
}

/**
 * disable when sap
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true when disabled
 */
function disableWhenSap(stateData, componentProps) {
  return componentProps?.data?.sap || false;
}

/**
 * init power vs volume store
 * @param {*} store
 */
function initPowerVsVolumeStore(store) {
  store.newField("power_volumes", {
    init: powerVsVolumesInit,
    onStoreUpdate: powerVsVolumesOnStoreUpdate,
    create: powerVsVolumeCreate,
    save: powerVsVolumeSave,
    delete: powerVsVolumeDelete,
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "workspace",
        "pi_volume_pool",
        "pi_volume_size",
        "pi_affinity_volume",
        "pi_affinity_instance",
        "pi_anti_affinity_volume",
        "pi_anti_affinity_instance",
        "storage_option",
        "pi_volume_type",
      ],
      "power_volumes"
    ),
    schema: {
      name: {
        size: "small",
        default: "",
        invalid: invalidName("power_volumes"),
        invalidText: invalidNameText("power_volumes"),
      },
      workspace: {
        size: "small",
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("workspace"),
        invalidText: selectInvalidText("workspace"),
        groups: powerVsWorkspaceGroups,
        disabled: disableWhenSap,
        onStateChange: function (stateData, componentProps, targetValue) {
          stateData.attachments = [];
          stateData.pi_affinity_volume = null;
          stateData.pi_affinity_instance = null;
          stateData.pi_anti_affinity_volume = null;
          stateData.pi_anti_affinity_instance = null;
          stateData.zone = new revision(componentProps.craig.store.json).child(
            "power",
            stateData.workspace
          ).data.zone;
          stateData.workspace = targetValue;
        },
      },
      pi_volume_size: {
        labelText: "Capacity (GB)",
        default: "",
        invalid: function (stateData, componentProps) {
          return !isInRange(parseInt(stateData.pi_volume_size), 1, 2000);
        },
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 1 and 2000"
        ),
        size: "small",
        disabled: function (stateData, componentProps) {
          if (stateData.sap === true && contains(stateData.name, "-sap-log-")) {
            return false;
          } else if (stateData.sap) {
            return true;
          } else return false;
        },
      },
      storage_option: powerVsStorageOptions(true),
      pi_volume_type: powerVsStorageType(true),
      affinity_type: powerVsAffinityType(),
      pi_volume_pool: powerStoragePoolSelect(true),
      pi_affinity_policy: {
        default: null,
      },
      pi_affinity_volume: powerAffinityVolume(),
      pi_affinity_instance: powerAffinityInstance(),
      pi_anti_affinity_volume: powerAntiAffinityVolume(),
      pi_anti_affinity_instance: powerAntiAffinityInstance(),
      pi_replication_enabled: {
        size: "small",
        labelText: "Enable Volume Replication",
        default: false,
        type: "toggle",
        disabled: function (stateData, componentProps) {
          let pool = stateData.pi_volume_pool;
          if (!stateData.zone) {
            return true;
          }
          let replicationEnabledPools =
            replicationEnabledStoragePoolMap[stateData.zone] || [];
          return !contains(replicationEnabledPools, pool);
        },
      },
      pi_volume_shareable: {
        size: "small",
        type: "toggle",
        default: false,
        tooltip: {
          content: "Enable sharing between multiple instances",
          align: "bottom-left",
          alignModal: "right",
        },
        labelText: "Enable Volume Sharing",
        disabled: disableWhenSap,
        onStateChange: function (stateData) {
          // reset attachments
          stateData.attachments = [];
          stateData.pi_volume_shareable = !stateData.pi_volume_shareable;
        },
      },
      attachments: {
        default: "",
        size: "small",
        labelText: "Instance Attachments",
        type: function (stateData) {
          return stateData.pi_volume_shareable ? "multiselect" : "select";
        },
        onInputChange: function (stateData) {
          return stateData.pi_volume_shareable
            ? stateData.attachments
            : [stateData.attachments];
        },
        invalid: function () {
          return false;
        },
        groups: function (stateData, componentProps) {
          return (stateData.pi_volume_shareable ? [] : [""]).concat(
            splat(
              componentProps.craig.store.json.power_instances.filter(
                (instance) => {
                  if (instance.workspace === stateData.workspace) {
                    return instance;
                  }
                }
              ),
              "name"
            )
          );
        },
      },
      count: {
        default: null,
        size: "small",
        optional: true,
        placeholder: "1",
        invalid: function (stateData, componentProps) {
          if (isNullOrEmptyString(stateData.count, true)) {
            return false;
          } else {
            return (
              Number(stateData.count) < 1 ||
              fieldIsNotWholeNumber("count", 1, 100)(stateData)
            );
          }
        },
        invalidText: unconditionalInvalidText(
          "Enter a whole number between 1 and 100"
        ),
        tooltip: {
          content: "Create multiple volumes with this configuration",
        },
      },
    },
  });
}

module.exports = {
  powerVsVolumesInit,
  powerVsVolumesOnStoreUpdate,
  powerVsVolumeCreate,
  powerVsVolumeSave,
  powerVsVolumeDelete,
  initPowerVsVolumeStore,
};
