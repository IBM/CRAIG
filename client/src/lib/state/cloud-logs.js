const {
  splatContains,
  transpose,
  splat,
  getObjectFromArray,
  contains,
} = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  resourceGroupsField,
  fieldIsNullOrEmptyStringEnabled,
  selectInvalidText,
  unconditionalInvalidText,
  shouldDisableComponentSave,
} = require("./utils");

/**
 * init cloud logs store
 * @param {*} store
 */
function initCloudLogs(store) {
  store.newField("cloud_logs", {
    init: function (config) {
      config.store.json.cloud_logs = {
        enabled: false,
        cos: null,
        logs_bucket: null,
        metrics_bucket: null,
        resource_group: null,
      };
    },
    onStoreUpdate: function (config) {
      if (
        !splatContains(
          config.store.json.object_storage,
          "name",
          config.store.json.cloud_logs?.cos,
        ) &&
        config.store.json.cloud_logs
      ) {
        config.store.json.cloud_logs.cos = null;
        config.store.json.cloud_logs.logs_bucket = null;
        config.store.json.cloud_logs.metrics_bucket = null;
      } else if (config.store.json.cloud_logs) {
        config.updateUnfound(
          "cosBuckets",
          config.store.json.cloud_logs,
          "logs_bucket",
        );
        config.updateUnfound(
          "cosBuckets",
          config.store.json.cloud_logs,
          "metrics_bucket",
        );
      }
      if (config.store.json.cloud_logs)
        setUnfoundResourceGroup(config, config.store.json.cloud_logs);
      else
        config.store.json.cloud_logs = {
          enabled: false,
          cos: null,
          logs_bucket: null,
          metrics_bucket: null,
          resource_group: null,
        };
    },
    save: function (config, stateData) {
      transpose(stateData, config.store.json.cloud_logs);
    },
    shouldDisableSave: shouldDisableComponentSave(
      ["resource_group", "cos", "logs_bucket", "metrics_bucket"],
      "cloud_logs",
    ),
    schema: {
      name: {
        readOnly: true,
        labelText: "Name",
        default: "cloud-logs",
        helperText: function (stateData, componentProps) {
          return `${componentProps.craig.store.json._options.prefix}-cloud-logs`;
        },
      },
      enabled: {
        type: "toggle",
        labelText: "Enabled",
        default: false,
        size: "small",
        tooltip: {
          content:
            "When Cloud Logs is enabled, Terraform code for Activity Tracker and LogDNA will not be generated",
        },
      },
      resource_group: resourceGroupsField(false, {
        invalid: function (stateData) {
          return fieldIsNullOrEmptyStringEnabled("resource_group")(stateData);
        },
      }),
      cos: {
        default: "(Disabled)",
        type: "select",
        invalidText: unconditionalInvalidText(
          "Select an Object Storage Instance",
        ),
        invalid: fieldIsNullOrEmptyStringEnabled("cloud_logs"),
        groups: function (stateData, componentProps) {
          return ["(Disabled)"].concat(
            splat(componentProps.craig.store.json.object_storage, "name"),
          );
        },
        labelText: "Object Storage",
      },
      logs_bucket: {
        default: "(Disabled)",
        type: "select",
        invalidText: selectInvalidText("Logs Storage Bucket"),
        invalid: fieldIsNullOrEmptyStringEnabled("logs_bucket"),
        groups: function (stateData, componentProps) {
          if (contains(["(Disabled)", null], stateData.cos)) {
            return ["(Disabled)"];
          }
          let selectedCos = getObjectFromArray(
            componentProps.craig.store.json.object_storage,
            "name",
            stateData.cos,
          );
          return ["(Disabled)"].concat(splat(selectedCos.buckets, "name"));
        },
      },
      metrics_bucket: {
        default: "(Disabled)",
        type: "select",
        invalidText: selectInvalidText("Metrics Storage Bucket"),
        invalid: fieldIsNullOrEmptyStringEnabled("metrics_bucket"),
        groups: function (stateData, componentProps) {
          if (contains(["(Disabled)", null], stateData.cos)) {
            return ["(Disabled)"];
          }
          let selectedCos = getObjectFromArray(
            componentProps.craig.store.json.object_storage,
            "name",
            stateData.cos,
          );
          return ["(Disabled)"].concat(splat(selectedCos.buckets, "name"));
        },
      },
    },
  });
}

module.exports = {
  initCloudLogs,
};
