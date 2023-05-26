const { snakeCase, getObjectFromArray, distinct, splat } = require("lazy-z");
const {
  rgIdRef,
  getCosId,
  bucketRef,
  kebabName,
  vpcRef,
  jsonToIac,
  tfBlock,
  getTags,
  cdktfRef,
  jsonToTfPrint,
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
 * @param {boolean=} cdktf
 * @returns {string} terraform string
 */
function ibmIsFlowLog(vpc, config, cdktf) {
  let depends = `ibm_iam_authorization_policy.flow_logs_to_${snakeCase(
    vpc.cos
  )}_object_storage_policy`;
  let flowLogsData = {
    name: kebabName([vpc.name, "vpc-logs"]),
    target: vpcRef(vpc.name, "id", true),
    active: true,
    storage_bucket: bucketRef(vpc.cos, vpc.bucket),
    resource_group: rgIdRef(vpc.resource_group, config),
    tags: getTags(config),
    depends_on: [cdktf ? depends : cdktfRef(depends)],
  };
  if (!vpc.cos || !vpc.bucket) {
    delete flowLogsData.depends_on;
  }
  return {
    name: `${vpc.name}-flow-log-collector`,
    data: flowLogsData,
  };
}

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
  if (vpc.bucket === "$disabled") return "";
  return jsonToTfPrint(
    "resource",
    "ibm_is_flow_log",
    `${vpc.name}-flow-log-collector`,
    ibmIsFlowLog(vpc, config).data
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
 * @returns {object} terraform
 */

function ibmIamAuthorizationPolicyFlowLogs(cosName, config) {
  return {
    name: `flow_logs_to_${snakeCase(cosName)}_object_storage_policy`,
    data: {
      source_service_name: "is",
      source_resource_type: "flow-log-collector",
      description: "Allow flow logs write access cloud object storage instance",
      roles: ["Writer"],
      target_service_name: "cloud-object-storage",
      target_resource_instance_id: getCosId(
        getObjectFromArray(config.object_storage, "name", cosName),
        true
      ),
    },
  };
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
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    `flow_logs_to_${snakeCase(cosName)}_object_storage_policy`,
    ibmIamAuthorizationPolicyFlowLogs(cosName, config).data
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
  allFlowLogsCos.forEach(
    (cos) => (blockData += formatFlowLogsPolicy(cos, config))
  );
  config.vpcs.forEach(
    (instance) => (blockData += formatFlowLogs(instance, config))
  );
  return tfBlock("Flow Logs Resources", blockData);
}

module.exports = {
  formatFlowLogs,
  formatFlowLogsPolicy,
  flowLogsTf,
  ibmIsFlowLog,
  ibmIamAuthorizationPolicyFlowLogs,
};
