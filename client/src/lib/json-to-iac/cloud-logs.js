const {
  contains,
  isEmpty,
  keys,
  titleCase,
  getObjectFromArray,
  snakeCase,
} = require("lazy-z");
const {
  jsonToTfPrint,
  bucketRef,
  cosRef,
  tfBlock,
  rgIdRef,
} = require("./utils");

/**
 * format cloud logs
 * @param {*} config
 * @returns {string} terraform
 */
function formatCloudLogs(config) {
  let logsData = {
    name: "${var.prefix}-cloud-logs",
    service: "logs",
    plan: "standard",
    location: "${var.region}",
    resource_group_id: rgIdRef(config.cloud_logs.resource_group, config),
    parameters: {},
  };

  if (!contains([null, "(Disabled)"], config.cloud_logs.logs_bucket)) {
    logsData.parameters.logs_bucket_crn = bucketRef(
      config.cloud_logs.cos,
      config.cloud_logs.logs_bucket,
      "crn"
    );
    logsData.parameters.logs_bucket_endpoint = bucketRef(
      config.cloud_logs.cos,
      config.cloud_logs.logs_bucket,
      `s3_endpoint_${config._options.endpoints}`
    );
  }

  if (!contains([null, "(Disabled)"], config.cloud_logs.metrics_bucket)) {
    logsData.parameters.metrics_bucket_crn = bucketRef(
      config.cloud_logs.cos,
      config.cloud_logs.metrics_bucket,
      "crn"
    );
    logsData.parameters.metrics_bucket_endpoint = bucketRef(
      config.cloud_logs.cos,
      config.cloud_logs.metrics_bucket,
      `s3_endpoint_${config._options.endpoints}`
    );
  }

  if (isEmpty(keys(logsData.parameters))) {
    delete logsData.parameters;
  } else {
    logsData.depends_on = [
      `\${ibm_iam_authorization_policy.${snakeCase(
        config.cloud_logs.cos
      )}_object_storage_to_cloud_logs}`,
    ];
  }

  return jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    "cloud_logs",
    logsData
  );
}

/**
 * format authorization from cos to cloud logs
 * @param {*} config
 * @returns {string} terraform
 */
function formatCosToCloudLogsAuth(config) {
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    `${config.cloud_logs.cos}_object_storage_to_cloud_logs`,
    {
      source_service_name: "logs",
      description: `Allow Cloud Logs to access ${titleCase(
        config.cloud_logs.cos
      )} Object Storage`,
      target_service_name: "cloud-object-storage",
      target_resource_instance_id: cosRef(
        config.cloud_logs.cos,
        "guid",
        getObjectFromArray(config.object_storage, "name", config.cloud_logs.cos)
          .use_data
      ),
      roles: ["Writer"],
    }
  );
}

/**
 * format cloud logs terraform
 * @param {*} config craig json
 * @returns {string} terraform code
 */
function cloudLogsTf(config) {
  let tf = "";
  if (
    config?.cloud_logs?.enabled &&
    (!contains([null, "(Disabled)"], config?.cloud_logs?.logs_bucket) ||
      !contains([null, "(Disabled)"], config?.cloud_logs?.metrics_bucket))
  ) {
    tf += formatCosToCloudLogsAuth(config);
  }
  if (config?.cloud_logs?.enabled) {
    tf += formatCloudLogs(config);
  }
  return tf === "" ? null : tfBlock("Cloud Logs Resources", tf);
}

module.exports = {
  formatCloudLogs,
  formatCosToCloudLogsAuth,
  cloudLogsTf,
};
