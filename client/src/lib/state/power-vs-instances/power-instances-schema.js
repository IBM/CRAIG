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
  carve,
} = require("lazy-z");
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
const { nameField, hideWhenFieldFalse } = require("../reusable-fields");

/**
 * hide field for vtl forms when no workspace is selected
 * @param {*} vtl
 * @returns {Function} hideWhen function
 */
function hideWhenNoWorkspaceAndVtl(vtl) {
  return function (stateData, componentProps) {
    return (
      vtl &&
      (isNullOrEmptyString(stateData.workspace, true) ||
        isEmpty(
          componentProps.craig.vtl.image.groups(stateData, componentProps)
        ))
    );
  };
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
 * hide field when not ibm i
 * @param {*} stateData
 * @returns {boolean} true when should be hidden
 */
function hideWhenNotIbmi(stateData) {
  return !contains(stateData.image || "", "IBMi");
}

/**
 * create power vs instance schema
 * @param {bool} vtl true when vtl
 * @returns {object} schema object
 */
function powerVsInstanceSchema(vtl) {
  return {
    name: nameField("power_instances", {
      size: "small",
      helperText: function (stateData, componentProps) {
        return componentProps.craig.store.json._options.manual_power_vsi_naming
          ? stateData.name
          : `${componentProps.craig.store.json._options.prefix}-${stateData.name}`;
      },
    }),
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
      hideWhen: hideWhenFieldFalse("sap"),
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
        (stateData.primary_subnet = ""), (stateData.ssh_key = "");
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
      invalid: function (stateData) {
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
      },
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
      onStateChange: function (stateData, componentProps, value) {
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
        stateData.network = newItems;
        stateData.primary_subnet = newItems[0]?.name || "";
      },
      forceUpdateKey: function (stateData) {
        return stateData.workspace;
      },
      hideWhen: hideWhenNoWorkspaceAndVtl(vtl),
    },
    primary_subnet: {
      labelText: "Primary Subnet",
      type: "select",
      default: "",
      invalid: fieldIsNullOrEmptyString("primary_subnet"),
      invalidText: powerVsInstanceInvalidText("at least one subnet"),
      groups: function (stateData, componentProps) {
        if (isEmpty(stateData.network)) {
          return [];
        } else {
          return splat(stateData.network, "name");
        }
      },
      onRender: function (stateData) {
        if (isNullOrEmptyString(stateData.primary_subnet)) {
          let primarySubnet = stateData.network[0]?.name || "";
          stateData.primary_subnet = primarySubnet;
        }
        return stateData.primary_subnet;
      },
      onStateChange: function (stateData, componentProps, value) {
        if (!isEmpty(stateData.network)) {
          let newNetwork = [...stateData.network];
          let primarySubnet = carve(newNetwork, "name", value);
          newNetwork.unshift(primarySubnet[0]);
          stateData.network = newNetwork;
          stateData.primary_subnet = value;
        } else stateData.primary_subnet = "";
      },
      size: "small",
      hideWhen: hideWhenNoWorkspaceAndVtl(vtl),
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
      hideWhen: hideWhenNoWorkspaceAndVtl(vtl),
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
      hideWhen: hideWhenNoWorkspaceAndVtl(vtl),
    },
    pi_sys_type: {
      size: "small",
      labelText: "System Type",
      type: "fetchSelect",
      apiEndpoint: function (stateData, componentProps) {
        return `/api/power/${stateData.zone}/system_pools`;
      },
      default: "",
      invalid: fieldIsNullOrEmptyString("pi_sys_type"),
      invalidText: selectInvalidText("system type"),
      groups: systemTypes,
      hideWhen: function (stateData, componentProps) {
        return (
          isNullOrEmptyString(stateData.workspace, true) ||
          hideWhenNoWorkspaceAndVtl(vtl)(stateData, componentProps)
        );
      },
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
      hideWhen: hideWhenNoWorkspaceAndVtl(vtl),
    },
    pi_processors: {
      labelText: "Processors",
      placeholder: vtl ? 1 : "0.25",
      hideWhen: function (stateData, componentProps) {
        return (
          stateData.sap === true ||
          hideWhenNoWorkspaceAndVtl(vtl)(stateData, componentProps)
        );
      },
      size: "small",
      default: "",
      invalid: function (stateData) {
        if (stateData.sap) return false;
        let isDedicated = stateData.pi_proc_type === "dedicated";
        let coreMax =
          stateData.pi_sys_type === "e980" ? 17 : isDedicated ? 13 : 13.75;
        let coreMin = isDedicated ? 1 : 0.25;
        let processorsFloat = parseFloat(stateData.pi_processors);
        return (
          stateData.pi_processors === "" ||
          (isDedicated && !isWholeNumber(processorsFloat)) ||
          processorsFloat < coreMin ||
          processorsFloat > coreMax
        );
      },
      invalidText: function (stateData) {
        let isDedicated = stateData.pi_proc_type === "dedicated";
        let coreMin = isDedicated ? 1 : 0.25;
        let coreMax =
          stateData.pi_sys_type === "e980" ? 17 : isDedicated ? 13 : 13.75;
        return `Must be a ${
          isDedicated ? "whole " : ""
        }number between ${coreMin} and ${coreMax}.`;
      },
    },
    pi_memory: {
      hideWhen: function (stateData, componentProps) {
        return (
          stateData.sap === true ||
          hideWhenNoWorkspaceAndVtl(vtl)(stateData, componentProps)
        );
      },
      labelText: "Memory (GB)",
      placeholder: "4",
      size: "small",
      default: "",
      invalid: function (stateData) {
        if (stateData.sap) return false;
        let memoryFloat = parseFloat(stateData.pi_memory);
        let memoryMax = stateData.pi_sys_type === "e980" ? 15400 : 934;
        let vtlMemMin = 2;
        if (stateData.pi_license_repository_capacity) {
          vtlMemMin = 16 + 2 * stateData.pi_license_repository_capacity;
        }
        return (
          !isWholeNumber(memoryFloat) ||
          !isInRange(
            memoryFloat,
            stateData.pi_license_repository_capacity ? vtlMemMin : 2,
            memoryMax
          )
        );
      },
      invalidText: function (stateData) {
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
      },
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
      hideWhen: hideWhenNoWorkspaceAndVtl(vtl),
    },
    pi_storage_pool: powerStoragePoolSelect(),
    storage_option: powerVsStorageOptions(
      false,
      hideWhenNoWorkspaceAndVtl(vtl)
    ),
    pi_storage_type: powerVsStorageType(false, hideWhenNoWorkspaceAndVtl(vtl)),
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
      invalid: function (stateData) {
        return isNullOrEmptyString(
          stateData.pi_license_repository_capacity,
          true
        ) || stateData.pi_license_repository_capacity.match(/^\d+$/g) === null
          ? true
          : !isWholeNumber(parseInt(stateData.pi_license_repository_capacity));
      },
      invalidText: unconditionalInvalidText("Enter a whole number"),
      hideWhen: hideWhenNoWorkspaceAndVtl(vtl),
    },
    pi_ibmi_css: {
      size: "small",
      type: "toggle",
      default: false,
      hideWhen: hideWhenNotIbmi,
      labelText: "IBM i Cloud Storage Solution License",
    },
    pi_ibmi_pha: {
      size: "small",
      type: "toggle",
      default: false,
      hideWhen: hideWhenNotIbmi,
      labelText: "IBM i Power High Availability",
    },
    pi_ibmi_rds_users: {
      size: "small",
      labelText: "IBM i Rational Dev Studio Number of User Licenses",
      optional: true,
      invalid: function (stateData) {
        if (isNullOrEmptyString(stateData?.pi_ibmi_rds_users, true)) {
          return false;
        } else return !isInRange(Number(stateData.pi_ibmi_rds_users), 1, 500);
      },
      invalidText: unconditionalInvalidText(
        "Enter a whole number between 1 and 500"
      ),
      placeholder: "1",
      hideWhen: hideWhenNotIbmi,
    },
    pi_user_data: {
      type: "textArea",
      optional: "true",
      default: null,
      labelText: "User Data",
      placeholder: "Cloud init data",
    },
    pi_pin_policy: {
      labelText: "Pin Policy",
      type: "select",
      size: "small",
      groups: ["Soft", "Hard", "None"],
      default: "none",
      onRender: titleCaseRender("pi_pin_policy"),
      onInputChange: kebabCaseInput("pi_pin_policy"),
      tooltip: {
        content:
          "When you soft pin an instance for high availability, the instance automatically migrates back to the original host once the host is back to its operating state. If the instance has a licensing restriction with the host, the hard pin option restricts the movement of the instance during remote restart, automated remote restart, DRO, and live partition migration. The default pinning policy is none",
      },
    },
    pi_health_status: {
      labelText: "Health Status",
      type: "select",
      size: "small",
      groups: ["OK", "WARNING"],
      default: "OK",
    },
  };
}

module.exports = {
  powerVsInstanceSchema,
};
