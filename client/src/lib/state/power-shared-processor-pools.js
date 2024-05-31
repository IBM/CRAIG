const {
  splatContains,
  isNullOrEmptyString,
  revision,
  isInRange,
  contains,
} = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  selectInvalidText,
  nameField,
  unconditionalInvalidText,
  invalidName,
} = require("./reusable-fields");
const {
  powerVsWorkspaceGroups,
  shouldDisableComponentSave,
} = require("./utils");

function initSharedProcessorPoolStore(store) {
  store.newField("power_shared_processor_pools", {
    init: function (config) {
      config.store.json.power_shared_processor_pools = [];
    },
    create: function (config, stateData) {
      config.push(["json", "power_shared_processor_pools"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(
        ["json", "power_shared_processor_pools"],
        componentProps.data.name,
        stateData
      );
    },
    delete: function (config, stateData, componentProps) {
      config.carve(
        ["json", "power_shared_processor_pools"],
        componentProps.data.name
      );
    },
    onStoreUpdate: function (config) {
      if (config.store.json.power_shared_processor_pools)
        config.store.json.power_shared_processor_pools.forEach((pool) => {
          if (!splatContains(config.store.json.power, "name", pool.workspace)) {
            pool.workspace = null;
            pool.zone = null;
            pool.pi_shared_processor_pool_host_group = null;
          }
        });
      else config.store.json.power_shared_processor_pools = [];
    },
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "workspace",
        "pi_shared_processor_pool_host_group",
        "pi_shared_processor_pool_reserved_cores",
      ],
      "power_shared_processor_pools"
    ),
    schema: {
      pi_shared_processor_pool_host_group: {
        labelText: "System Type",
        type: "fetchSelect",
        apiEndpoint: function (stateData, componentProps) {
          return `/api/power/${stateData.zone}/system_pools`;
        },
        default: "",
        invalid: fieldIsNullOrEmptyString(
          "pi_shared_processor_pool_host_group"
        ),
        invalidText: selectInvalidText("system type"),
        groups: ["e880", "e980", "s922", "s1022"],
        hideWhen: function (stateData, componentProps) {
          return isNullOrEmptyString(stateData.workspace, true);
        },
      },
      workspace: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("workspace"),
        invalidText: selectInvalidText("workspace"),
        groups: powerVsWorkspaceGroups,
        onStateChange: function (stateData, componentProps) {
          let powerWorkspaceZone = new revision(
            componentProps.craig.store.json
          ).child("power", stateData.workspace).data.zone;
          stateData.zone = powerWorkspaceZone;
        },
      },
      name: nameField("power_shared_processor_pools", {
        invalid: function (stateData, componentProps) {
          return !isInRange(stateData?.name?.length || 0, 2, 12) ||
            contains(stateData?.name, "-")
            ? true
            : invalidName("power_shared_processor_pools", componentProps.craig)(
                stateData,
                componentProps
              );
        },
        invalidText: function (stateData) {
          return !isInRange(stateData?.name?.length || 0, 2, 12) ||
            stateData.name.match(/^[A-z]([a-z0-9]*[a-z0-9])*$/s) === null
            ? "Name must be between 2 and 12 characters and follow the regex pattern: /^[A-z]([a-z0-9]*[a-z0-9])*$/s"
            : `Name "${stateData.name}" in use`;
        },
      }),
      pi_shared_processor_pool_reserved_cores: {
        labelText: "Reserved Cores",
        default: "",
        invalid: function (stateData) {
          return !isInRange(
            parseInt(stateData.pi_shared_processor_pool_reserved_cores),
            0,
            1000
          );
        },
        invalidText: unconditionalInvalidText(
          "Must be a whole number greater than 0"
        ),
      },
    },
  });
}

module.exports = {
  initSharedProcessorPoolStore,
};
