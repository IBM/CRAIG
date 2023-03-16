const { snakeCase, getObjectFromArray, distinct, splat } = require("lazy-z");
const {
  rgIdRef,
  getCosId,
  bucketRef,
  kebabName,
  vpcRef,
  jsonToIac,
  tfBlock,
  getTags
} = require("./utils");

/**
 * format flow logs collector tf
 * @param {Object} vpc
 * @param {string} vpc.name
 * @param {string} vpc.cos
 * @param {string} vpc.bucket
 * @param {string} vpc.resource_group
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform string
 */
function formatFlowLogs(vpc, config) {
  return jsonToIac(
    "ibm_is_flow_log",
    `${vpc.name}-flow-log-collector`,
    {
      name: kebabName(config, [vpc.name, "vpc-logs"]),
      target: vpcRef(vpc.name),
      active: true,
      storage_bucket: bucketRef(vpc.cos, vpc.bucket),
      resource_group: rgIdRef(vpc.resource_group, config),
      tags: getTags(config),
      depends_on: [
        `ibm_iam_authorization_policy.flow_logs_to_${snakeCase(
          vpc.cos
        )}_object_storage_policy`
      ]
    },
    config
  );
}

/**
 * format flow logs auth policy tf
 * @param {Object} vpc
 * @param {string} vpc.name
 * @param {string} vpc.cos
 * @param {Object} config
 * @param {Object} config._options
 * @param {Array<Object>} config.cos
 * @returns {string} terraform string
 */

function formatFlowLogsPolicy(cosName, config) {
  return jsonToIac(
    "ibm_iam_authorization_policy",
    `flow_logs_to_${snakeCase(cosName)}_object_storage_policy`,
    {
      source_service_name: "^is",
      source_resource_type: "^flow-log-collector",
      description:
        "^Allow flow logs write access cloud object storage instance",
      roles: '["Writer"]',
      target_service_name: "^cloud-object-storage",
      target_resource_instance_id: `split(":", ${getCosId(
        getObjectFromArray(config.object_storage, "name", cosName)
      )})[7]`
    }
  );
}

/**
 * format flow logs tf
 * @param {Object} config
 * @param {Array<Object>} config.vpcs
 * @returns {string} terraform
 */
function flowLogsTf(config) {
  let allFlowLogsCos = distinct(splat(config.vpcs, "cos"));
  let blockData = "";
  allFlowLogsCos.forEach(cos => (blockData += formatFlowLogsPolicy(cos, config)));
  config.vpcs.forEach(instance => (blockData += formatFlowLogs(instance, config)));
  return tfBlock("Flow Logs Resources", blockData);
}

module.exports = {
  formatFlowLogs,
  formatFlowLogsPolicy,
  flowLogsTf
};
