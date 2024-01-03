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
  unconditionalInvalidText,
  powerVsWorkspaceGroups,
  powerVsStorageOptions,
  powerVsStorageType,
  powerVsAffinityType,
  powerAffinityVolume,
  powerAffinityInstance,
  powerAntiAffinityVolume,
  powerAntiAffinityInstance,
  powerStoragePoolSelect,
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
 * Processor invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerVsCoresInvalid(vtl) {
  return function (stateData) {
    if (stateData.sap) return false;
    let isDedicated = stateData.pi_proc_type === "dedicated";
    let coreMax =
      stateData.pi_sys_type === "e980" ? 17 : isDedicated ? 13 : 13.75;
    let coreMin = isDedicated || vtl ? 1 : 0.25;
    let processorsFloat = parseFloat(stateData.pi_processors);
    return (
      stateData.pi_processors === "" ||
      (coreMin === 1 && !isWholeNumber(processorsFloat)) ||
      (!stateData.sap &&
        (processorsFloat < coreMin || processorsFloat > coreMax))
    );
  };
}

/**
 * Memory invalidation for powerVs instance
 * @returns {boolean} function will evaluate to true if should be disabled
 */
function powerVsMemoryInvalid(stateData) {
  if (stateData.sap) return false;
  let memoryFloat = parseFloat(stateData.pi_memory);
  let memoryMax = stateData.pi_sys_type === "e980" ? 15400 : 934;
  let vtlMemMin;
  if (stateData.pi_license_repository_capacity) {
    vtlMemMin = 16 + 2 * stateData.pi_license_repository_capacity;
  }
  return (
    !isWholeNumber(memoryFloat) ||
    (!stateData.sap && !isInRange(memoryFloat, 2, memoryMax)) ||
    (stateData.pi_license_repository_capacity !== undefined &&
      memoryFloat < vtlMemMin)
  );
}

/**
 * return power_instances processor input invalid text
 * @param {Object} stateData
 * @param {boolean=} vtl
 * @returns {string} invalid text
 */
function invalidPowerVsProcessorTextCallback(stateData, vtl) {
  let isDedicated = stateData.pi_proc_type === "dedicated";
  let coreMin = isDedicated || vtl ? 1 : 0.25;
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
  let vtlMemMin;
  if (stateData.pi_license_repository_capacity) {
    vtlMemMin = 16 + 2 * stateData.pi_license_repository_capacity;
  }
  let vtlText = stateData.pi_license_repository_capacity
    ? ` For FalconStor VTL Instances, memory must be greater than or equal to ${vtlMemMin}.`
    : ``;
  return `Must be a whole number between ${memMin} and ${memMax}.${vtlText}`;
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
 * create power vs instance schema
 * @param {bool} vtl true when vtl
 * @returns {object} schema object
 */
function powerVsInstanceSchema(vtl) {
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
      groups: powerVsWorkspaceGroups,
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
          return new revision(componentProps.craig.store.json)
            .child("power", stateData.workspace)
            .data.imageNames.filter((image) => {
              if (vtl && contains(image, "VTL")) {
                return image;
              } else if (!vtl && !contains(image, "VTL")) return image;
            });
        }
      },
    },
    pi_sys_type: {
      size: "small",
      labelText: "System Type",
      default: "",
      invalid: fieldIsNullOrEmptyString("pi_sys_type"),
      invalidText: selectInvalidText("systen type"),
      groups: vtl ? ["s922", "e980"] : systemTypes,
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
      placeholder: vtl ? 1 : "0.25",
      hideWhen: function (stateData) {
        return stateData.sap === true;
      },
      size: "small",
      default: "",
      invalid: powerVsCoresInvalid(vtl),
      invalidText: invalidPowerVsProcessorTextCallback(true),
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
    pi_storage_pool: powerStoragePoolSelect(),
    storage_option: powerVsStorageOptions(),
    pi_storage_type: powerVsStorageType(),
    affinity_type: powerVsAffinityType(),
    pi_affinity_policy: {
      default: null,
    },
    pi_affinity_volume: powerAffinityVolume(),
    pi_affinity_instance: powerAffinityInstance(),
    pi_anti_affinity_volume: powerAntiAffinityVolume(),
    pi_anti_affinity_instance: powerAntiAffinityInstance(),
    pi_license_repository_capacity: {
      labelText: "Repository Capacity (TB)",
      size: "small",
      default: "1",
      invalid: function (stateData) {
        return stateData.pi_license_repository_capacity === "" ||
          stateData.pi_license_repository_capacity.match(/^\d+$/g) === null
          ? true
          : !isWholeNumber(parseInt(stateData.pi_license_repository_capacity));
      },
      invalidText: unconditionalInvalidText("Enter a whole number"),
    },
    pi_user_data: {
      type: "textArea",
      optional: "true",
      default: null,
      labelText: "User Data",
      placeholder: "Cloud init data",
    },
  };
}

module.exports = {
  powerVsInstanceSchema,
  invalidPowerVsMemoryTextCallback,
  invalidPowerVsProcessorTextCallback,
};
