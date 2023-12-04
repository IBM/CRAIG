const {
  isNullOrEmptyString,
  splat,
  isEmpty,
  isIpv4CidrOrAddress,
  contains,
  isWholeNumber,
  isInRange,
  revision,
  splatContains,
  capitalize,
} = require("lazy-z");
const {
  invalidName,
  invalidNameText,
  storageChangeDisabledCallback,
} = require("../../forms");
const {
  fieldIsNullOrEmptyString,
  selectInvalidText,
  titleCaseRender,
  kebabCaseInput,
} = require("../utils");
const { sapProfiles, systemTypes } = require("../../constants");

/**
 * Network invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerVsNetworkInvalid(stateData) {
  let hasInvalidNetwork = isEmpty(stateData.network || []);
  if (!hasInvalidNetwork) {
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
 * generate a function to handle invalid text
 * @param {string} text text to add to invalid text
 */
function powerVsInstanceInvalidText(text) {
  return function (stateData) {
    if (isNullOrEmptyString(stateData.workspace)) {
      return "Select a workspace";
    } else return "Select " + text;
  };
}

/**
 * filter function to get affinity volumes based on instance policy
 * @param {*} volume
 * @returns {string} volume name
 */
function powerVsAffinityVolumesFilter(stateData, componentProps) {
  return splat(
    componentProps.craig.store.json.power_volumes.filter((volume) => {
      if (
        isNullOrEmptyString(volume.pi_affinity_policy, true) &&
        isNullOrEmptyString(volume.pi_anti_affinity_policy, true) &&
        volume.workspace === stateData.workspace
      )
        return volume;
    }),
    "name"
  );
}

/**
 * filter function to get affinity instances based on instance policy
 * @param {*} volume
 * @returns {string} volume name
 */
function powerVsAffinityInstancesFilter(stateData, componentProps) {
  return splat(
    componentProps.craig.store.json.power_instances.filter((instance) => {
      if (
        isNullOrEmptyString(instance.pi_affinity_policy, true) &&
        isNullOrEmptyString(instance.pi_anti_affinity_policy, true) &&
        instance.workspace === stateData.workspace &&
        instance.name !== componentProps.data.name
      )
        return instance;
    }),
    "name"
  );
}

/**
 * generate function to handle hide/show affinity volumes
 * @param {string} option volume or instance
 * @param {string} type affinity or anti-affinity
 */
function hidePowerAffinityOption(option, type) {
  return function (stateData) {
    return (
      stateData.storage_option !== option || stateData.affinity_type !== type
    );
  };
}

function powerVsInstanceSchema() {
  return {
    name: {
      default: "",
      invalid: invalidName("power_instances"),
      invalidText: invalidNameText("power_instances"),
      size: "small",
    },
    sap: {
      default: false,
      type: "toggle",
      labelText: "SAP Instance",
      tooltip: {
        align: "bottom-left",
        alignModal: "bottom-right",
        content:
          "Select from a supported SAP profile. Enabling SAP will automatically provision needed Power VS Volumes",
      },
      size: "small",
    },
    sap_profile: {
      hideWhen: function (stateData) {
        return stateData.sap !== true;
      },
      default: "",
      invalid: function (stateData) {
        return stateData.sap && isNullOrEmptyString(stateData.sap_profile);
      },
      invalidText: selectInvalidText("profile"),
      groups: sapProfiles,
      type: "select",
      size: "small",
      tooltip: {
        content: "This is a list of supported SAP instance profiles",
        link: "https://cloud.ibm.com/docs/sap?topic=sap-hana-iaas-offerings-profiles-power-vs",
        align: "bottom-right",
      },
      labelText: "SAP Instance Profile",
    },
    workspace: {
      type: "select",
      size: "small",
      default: "",
      invalid: fieldIsNullOrEmptyString("workspace"),
      invalidText: selectInvalidText("workspace"),
      groups: function (stateData, componentProps) {
        return splat(componentProps.craig.store.json.power, "name");
      },
      onStateChange: function (stateData, componentProps) {
        let powerWorkspaceZone = new revision(
          componentProps.craig.store.json
        ).child("power", stateData.workspace).data.zone;
        stateData.zone = powerWorkspaceZone;
        stateData.network = [];
        stateData.ssh_key = "";
        stateData.image = "";
      },
    },
    ip_address: {
      default: "",
      labelText: "IP Address",
      placeholder: "X.X.X.X",
      invalid: function (stateData, componentProps, index) {
        let targetIp = stateData.network[index].ip_address;
        return isNullOrEmptyString(targetIp)
          ? false
          : !isIpv4CidrOrAddress(targetIp) || contains(targetIp, "/");
      },
      invalidText: function () {
        return "Invalid IP address";
      },
    },
    network: {
      size: "small",
      default: [],
      invalid: powerVsNetworkInvalid,
      invalidText: powerVsInstanceInvalidText("at least one subnet"),
      type: "multiselect",
      groups: function (stateData, componentProps) {
        if (isNullOrEmptyString(stateData.workspace)) {
          return [];
        } else {
          return splat(
            new revision(componentProps.craig.store.json).child(
              "power",
              stateData.workspace
            ).data.network,
            "name"
          );
        }
      },
      onRender: function (stateData) {
        return splat(stateData.network, "name");
      },
      onInputChange: function (stateData, value) {
        let newItems = [];
        let oldItems = [...stateData.network];
        oldItems.forEach((item) => {
          if (contains(value, item.name)) {
            newItems.push(item);
          }
        });
        value.forEach((item) => {
          if (!splatContains(newItems, "name", item)) {
            newItems.push({
              name: item,
              ip_address: "",
            });
          }
        });
        return newItems;
      },
    },
    ssh_key: {
      labelText: "SSH Key",
      type: "select",
      default: "",
      invalid: fieldIsNullOrEmptyString("ssh_key"),
      invalidText: powerVsInstanceInvalidText("an SSH Key"),
      groups: function (stateData, componentProps) {
        if (isNullOrEmptyString(stateData.workspace)) {
          return [];
        } else {
          return splat(
            new revision(componentProps.craig.store.json).child(
              "power",
              stateData.workspace
            ).data.ssh_keys,
            "name"
          );
        }
      },
      size: "small",
    },
    image: {
      size: "small",
      type: "select",
      default: "",
      invalid: fieldIsNullOrEmptyString("image"),
      invalidText: powerVsInstanceInvalidText("an image"),
      groups: function (stateData, componentProps) {
        if (isNullOrEmptyString(stateData.workspace)) {
          return [];
        } else {
          return new revision(componentProps.craig.store.json).child(
            "power",
            stateData.workspace
          ).data.imageNames;
        }
      },
    },
    pi_sys_type: {
      size: "small",
      labelText: "System Type",
      default: "",
      invalid: fieldIsNullOrEmptyString("pi_sys_type"),
      invalidText: selectInvalidText("systen type"),
      groups: systemTypes,
      type: "select",
    },
    pi_proc_type: {
      default: "",
      labelText: "Processor Type",
      invalid: fieldIsNullOrEmptyString("pi_proc_type"),
      groups: ["Shared", "Capped", "Dedicated"],
      size: "small",
      type: "select",
      onRender: titleCaseRender("pi_proc_type"),
      onInputChange: kebabCaseInput("pi_proc_type"),
    },
    pi_processors: {
      labelText: "Processors",
      placeholder: "0.25",
      hideWhen: function (stateData) {
        return stateData.sap === true;
      },
      size: "small",
      default: "",
      invalid: powerVsCoresInvalid,
      invalidText: invalidPowerVsProcessorTextCallback,
    },
    pi_memory: {
      hideWhen: function (stateData) {
        return stateData.sap === true;
      },
      labelText: "Memory (GB)",
      placeholder: "1024",
      size: "small",
      default: "",
      invalid: powerVsMemoryInvalid,
      invalidText: invalidPowerVsMemoryTextCallback,
    },
    pi_storage_pool_affinity: {
      default: false,
      type: "toggle",
      labelText: "Enable Storage Pool Affinity",
      size: "small",
      tooltip: {
        align: "bottom-left",
        alignModal: "right",
        content:
          "To attach data volumes from different storage pools, set to false. When this is set to false it cannot be set to true without re-creation of instance.",
      },
    },
    pi_storage_pool: {
      size: "small",
      type: "select",
      default: "",
      labelText: "Storage Pool",
      hideWhen: function (stateData) {
        return stateData.storage_option !== "Storage Pool";
      },
      invalid: function (stateData) {
        return (
          stateData.storage_option === "Storage Pool" &&
          (!stateData.pi_storage_pool ||
            isNullOrEmptyString(stateData.pi_storage_pool))
        );
      },
      invalidText: selectInvalidText("storage pool"),
      groups: function (stateData, componentProps) {
        return componentProps.powerStoragePoolMap &&
          stateData.zone &&
          componentProps.powerStoragePoolMap[stateData.zone]
          ? componentProps.powerStoragePoolMap[stateData.zone]
          : [];
      },
      disabled: storageChangeDisabledCallback,
    },
    storage_option: {
      size: "small",
      default: "",
      type: "select",
      groups: ["Storage Type", "Storage Pool", "Affinity", "Anti-Affinity"],
      disabled: storageChangeDisabledCallback,
      invalidText: selectInvalidText("storage option"),
      onStateChange: function (stateData) {
        if (stateData.storage_option !== "Storage Type") {
          stateData.pi_storage_type = null;
        }
        if (stateData.storage_option !== "Storage Pool") {
          stateData.pi_storage_pool = null;
        }
        if (stateData.storage_option !== "Affinity") {
          stateData.pi_affinity_policy = null;
          stateData.pi_affinity_volume = null;
          stateData.pi_affinity_instance = null;
        }
        if (stateData.storage_option !== "Anti-Affinity") {
          stateData.pi_anti_affinity_volume = null;
          stateData.pi_anti_affinity_instance = null;
        }
        if (contains(["Affinity", "Anti-Affinity"], stateData.storage_option)) {
          stateData.pi_affinity_policy = stateData.storage_option.toLowerCase();
        } else {
          stateData.pi_affinity_policy = null;
        }
        stateData.affinity_type = null;
      },
    },
    pi_storage_type: {
      size: "small",
      default: null,
      type: "select",
      labelText: "Storage Type",
      hideWhen: function (stateData, componentProps) {
        return stateData.storage_option !== "Storage Type";
      },
      groups: ["Tier-1", "Tier-3"],
      disabled: storageChangeDisabledCallback,
      invalid: function (stateData) {
        return (
          stateData.storage_option === "Storage Type" &&
          isNullOrEmptyString(stateData.pi_storage_type)
        );
      },
      invalidText: selectInvalidText("Storage Type"),
      onRender: function (stateData) {
        return isNullOrEmptyString(stateData.pi_storage_type)
          ? ""
          : capitalize(stateData.pi_storage_type.split(/(?=\d)/).join("-"));
      },
      onInputChange: function (stateData) {
        return stateData.pi_storage_type.toLowerCase().replace(/-/, "");
      },
    },
    affinity_type: {
      default: null,
      hideWhen: function (stateData) {
        return !contains(
          ["Affinity", "Anti-Affinity"],
          stateData.storage_option
        );
      },
      type: "select",
      size: "small",
      onRender: function (stateData) {
        return isNullOrEmptyString(stateData.affinity_type)
          ? ""
          : stateData.affinity_type;
      },
      groups: ["Instance", "Volume"],
      invalid: function (stateData) {
        return (
          contains(["Affinity", "Anti-Affinity"], stateData.storage_option) &&
          isNullOrEmptyString(stateData.affinity_type, true)
        );
      },
      invalidText: function (stateData) {
        return `Select an ${stateData.storage_option} option`;
      },
    },
    pi_affinity_policy: {
      default: null,
    },
    pi_affinity_volume: {
      invalid: function (stateData) {
        return powerAffinityInvalid(
          stateData,
          "Affinity",
          "Volume",
          "pi_affinity_volume"
        );
      },
      labelText: "Affinity Volume",
      invalidText: powerVsInstanceInvalidText("an affinity volume"),
      default: null,
      size: "small",
      hideWhen: hidePowerAffinityOption("Affinity", "Volume"),
      type: "select",
      groups: powerVsAffinityVolumesFilter,
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
      labelText: "Affinity Instance",
      invalidText: powerVsInstanceInvalidText("an affinity instance"),
      size: "small",
      hideWhen: hidePowerAffinityOption("Affinity", "Instance"),
      type: "select",
      groups: powerVsAffinityInstancesFilter,
    },
    pi_anti_affinity_volume: {
      labelText: "Anti-Affinity Volume",
      hideWhen: hidePowerAffinityOption("Anti-Affinity", "Volume"),
      default: null,
      invalid: function (stateData) {
        return powerAffinityInvalid(
          stateData,
          "Anti-Affinity",
          "Volume",
          "pi_anti_affinity_volume"
        );
      },
      invalidText: powerVsInstanceInvalidText("an anti affinity volume"),
      type: "select",
      groups: powerVsAffinityVolumesFilter,
      size: "small",
    },
    pi_anti_affinity_instance: {
      labelText: "Anti-Affinity Instance",
      default: null,
      invalid: function (stateData) {
        return powerAffinityInvalid(
          stateData,
          "Anti-Affinity",
          "Instance",
          "pi_anti_affinity_instance"
        );
      },
      invalidText: powerVsInstanceInvalidText("an anti affinity instance"),
      size: "small",
      hideWhen: hidePowerAffinityOption("Anti-Affinity", "Instance"),
      type: "select",
      groups: powerVsAffinityInstancesFilter,
    },
  };
}

module.exports = {
  powerVsInstanceSchema,
  invalidPowerVsMemoryTextCallback,
  invalidPowerVsProcessorTextCallback,
};
