const { snakeCase, splat } = require("lazy-z");
const { endComment, cosRandomSuffix } = require("./constants");
const {
  rgIdRef,
  getCosId,
  buildTitleComment,
  getKmsInstanceData,
  fillTemplate,
  kebabName,
  encryptionKeyRef,
  cosRef,
  jsonToTf,
  resourceRef,
  dataResourceName,
} = require("./utils");

/**
 * create ref for random suffix
 * @param {Object} cos
 * @param {boolean} cos.use_random_suffix
 * @returns {string} cos
 */
function randomSuffix(cos) {
  return cos.use_random_suffix
    ? `-\${random_string.${snakeCase(cos.name)}_random_suffix.result}`
    : "";
}

/**
 * format tf block for object storage resource
 * @param {Object} cos
 * @param {boolean} cos.use_random_suffix
 * @param {boolean} cos.use_data
 * @param {string} cos.resource_group
 * @param {string} cos.plan
 * @param {string} cos.name
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {string} config._options.prefix
 * @returns {string} string for cos tf
 */
function formatCosInstance(cos, config) {
  let instanceName = dataResourceName(
    cos,
    config,
    cos.use_data ? "" : "-object-storage" + randomSuffix(cos)
  );
  let randomSuffixResource = cos.use_random_suffix
    ? fillTemplate(cosRandomSuffix, { cos_name: snakeCase(cos.name) })
    : "";
  let cosInstance = {
    name: instanceName,
    resource_group_id: rgIdRef(cos.resource_group, config),
    service: '"cloud-object-storage"',
    location: '"global"',
  };
  if (!cos.use_data) {
    cosInstance.plan = `"${cos.plan}"`;
    cosInstance.tags = true;
  }
  return (
    randomSuffixResource +
    jsonToTf(
      "ibm_resource_instance",
      `${cos.name} object storage`,
      cosInstance,
      config,
      cos.use_data
    )
  );
}

/**
 * format tf block for object storage resource
 * @param {Object} cos
 * @param {boolean} cos.use_data
 * @param {string} cos.name
 * @param {string} cos.kms
 * @param {Object} config
 * @param {Array<object>} config.key_management
 * @param {boolean} config.key_management.use_data
 * @param {string} config.key_management.name
 * @returns {string} string for cos tf
 */
function formatCosToKmsAuth(cos, config) {
  let kmsInstance = getKmsInstanceData(cos.kms, config);
  let cosRef = resourceRef(
    `${snakeCase(cos.name)} object storage`,
    "id",
    cos.use_data
  );
  return jsonToTf(
    "ibm_iam_authorization_policy",
    `${cos.name} cos to ${cos.kms} kms policy`,
    {
      source_service_name: `"cloud-object-storage"`,
      source_resource_instance_id: `split(":", ${cosRef})[7]`,
      roles: `["Reader"]`,
      description: '"Allow COS instance to read from KMS instance"',
      target_service_name: `"${kmsInstance.type}"`,
      target_resource_instance_id: kmsInstance.guid,
    }
  );
}

/**
 * format tf block for object storage bucket
 * @param {Object} bucket
 * @param {string} bucket.keyName
 * @param {string} bucket.storage_class
 * @param {string} bucket.endpoint
 * @param {boolean} bucket.force_delete
 * @param {string} bucket.kms_key
 * @param {Object} cos
 * @param {boolean} cos.use_data
 * @param {string} cos.name
 * @param {string} cos.kms
 * @param {Object} config
 * @param {Array<object>} config.key_management
 * @param {boolean} config.key_management.use_data
 * @param {string} config.key_management.name
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {string} string for cos tf
 */

function formatCosBucket(bucket, cos, config) {
  return jsonToTf(
    "ibm_cos_bucket",
    cos.name + "-object-storage-" + bucket.name + "-bucket",
    {
      bucket_name: kebabName(
        config,
        [cos.name, bucket.name],
        randomSuffix(cos)
      ),
      resource_instance_id: cosRef(cos.name, "id", cos.use_data),
      storage_class: `"${bucket.storage_class}"`,
      endpoint_type: `"${bucket.endpoint}"`,
      force_delete: bucket.force_delete,
      region_location: "region",
      key_protect: encryptionKeyRef(cos.kms, bucket.kms_key, "crn"),
      depends_on: `[ibm_iam_authorization_policy.${snakeCase(
        cos.name + " cos to " + cos.kms + " kms policy"
      )}]`,
    },
    config
  );
}

/**
 * format tf block for object storage key
 * @param {Object} key
 * @param {string} key.name
 * @param {string} key.role
 * @param {boolean} key.enable_hmac
 * @param {Object} cos
 * @param {boolean} cos.use_data
 * @param {string} cos.name
 * @param {string} cos.kms
 * @param {Object} config
 * @returns {string} string for cos tf
 */
function formatCosKey(key, cos, config) {
  let keyValues = {
    name: kebabName(config, [cos.name, "key", key.name], randomSuffix(cos)),
    resource_instance_id: getCosId(cos),
    role: '"Writer"',
    tags: true,
  };
  if (key.enable_hmac) {
    keyValues["_parameters ="] = {
      HMAC: true,
    };
  }
  return jsonToTf(
    "ibm_resource_key",
    `${snakeCase(cos.name + "-object-storage-key-" + key.name)}`,
    keyValues,
    config
  );
}

/**
 * create terraform for a single object storage instance
 * @param {Object} cos storage instance
 * @param {string} cos.name cos name
 * @param {Object} config config
 * @returns {string} terraform string
 */
function cosInstanceTf(cos, config) {
  let instanceTf =
    buildTitleComment("Object Storage Instance", cos.name) +
    formatCosInstance(cos, config) +
    formatCosToKmsAuth(cos, config);
  cos.buckets.forEach(
    (bucket) => (instanceTf += formatCosBucket(bucket, cos, config))
  );
  cos.keys.forEach((key) => (instanceTf += formatCosKey(key, cos, config)));
  return instanceTf + endComment;
}

/**
 * create cos terraform file with multiple instances
 * @param {Object} config configuration object
 * @param {Array<Object>} config.cos list of cos instances
 * @param {Object} config._options global options
 * @returns {string} cos terraform code as string
 */
function cosTf(config) {
  let cosTerraform = "";
  let cosNames = splat(config.object_storage, "name");
  config.object_storage.forEach((instance) => {
    cosTerraform += cosInstanceTf(instance, config);
    if (
      cosNames.length > 1 &&
      cosNames.indexOf(instance.name) !== cosNames.length - 1
    ) {
      cosTerraform += "\n\n";
    }
  });
  return cosTerraform.replace(/\n$/i, "");
}

module.exports = {
  formatCosInstance,
  formatCosToKmsAuth,
  formatCosBucket,
  formatCosKey,
  cosInstanceTf,
  cosTf,
};
