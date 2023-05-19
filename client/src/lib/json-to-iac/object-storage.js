const { snakeCase, splat, eachKey, containsKeys } = require("lazy-z");
const {
  rgIdRef,
  getCosId,
  getKmsInstanceData,
  kebabName,
  encryptionKeyRef,
  cosRef,
  resourceRef,
  dataResourceName,
  tfBlock,
  tfDone,
  getTags,
  randomSuffix,
  jsonToTfPrint,
  cdktfRef,
  getResourceOrData,
} = require("./utils");
const { varDotRegion } = require("../constants");

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
 * @returns {object} string for cos tf
 */

function ibmResourceInstanceCos(cos, config) {
  let instanceName = dataResourceName(
    cos,
    cos.use_data ? "" : "-object-storage" + randomSuffix(cos)
  );
  let cosInstance = {
    name: instanceName,
    resource_group_id: rgIdRef(cos.resource_group, config),
    service: "cloud-object-storage",
    location: "global",
  };
  if (!cos.use_data) {
    cosInstance.plan = cos.plan;
    cosInstance.tags = getTags(config);
  }
  return {
    name: `${cos.name} object storage`,
    data: cosInstance,
  };
}

/**
 * get random name block
 * @param {*} cosName
 * @returns {object} terraform
 */
function randomString(cosName) {
  return jsonToTfPrint(
    "resource",
    "random_string",
    `${cosName}_random_suffix`,
    {
      length: 8,
      special: false,
      upper: false,
    }
  );
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
  let data = ibmResourceInstanceCos(cos, config);
  return (
    (cos.use_random_suffix ? randomString(cos.name) : "") +
    jsonToTfPrint(
      getResourceOrData(cos),
      "ibm_resource_instance",
      data.name,
      data.data
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
 * @returns {object} tf
 */

function ibmIamAuthorizationPolicyCos(cos, config) {
  let kmsInstance = getKmsInstanceData(cos.kms, config);
  let cosRef = resourceRef(
    `${snakeCase(cos.name)} object storage`,
    "guid",
    cos.use_data
  );
  return {
    name: `${cos.name} cos to ${cos.kms} kms policy`,
    data: {
      source_service_name: `cloud-object-storage`,
      source_resource_instance_id: `\${${cosRef.replace(/\{|}|\$/g, "")}}`,
      roles: ["Reader"],
      description: "Allow COS instance to read from KMS instance",
      target_service_name: kmsInstance.type,
      target_resource_instance_id: cdktfRef(kmsInstance.guid),
    },
  };
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
  let auth = ibmIamAuthorizationPolicyCos(cos, config);
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    auth.name,
    auth.data
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
 * @param {boolean=} cdktf cdktf mode
 * @returns {object} data
 */

function ibmCosBucket(bucket, cos, config, cdktf) {
  let data = {
    name: cos.name + "-object-storage-" + bucket.name + "-bucket",
  };
  let bucketValues = {
    bucket_name: kebabName([cos.name, bucket.name], randomSuffix(cos)),
    resource_instance_id: cosRef(cos.name, "id", cos.use_data),
    storage_class: bucket.storage_class,
    endpoint_type: bucket.endpoint,
    force_delete: bucket.force_delete,
    region_location: varDotRegion,
    key_protect: encryptionKeyRef(cos.kms, bucket.kms_key, "crn"),
  };
  if (bucket.allowed_ip) {
    bucketValues.allowed_ip = JSON.stringify(bucket.allowed_ip).replace(
      /"/g,
      '"'
    );
  }
  if (bucket.atracker) {
    bucketValues.activity_tracking = [
      {
        read_data_events: bucket.read_data_events,
        write_data_events: bucket.write_data_events,
        activity_tracker_crn: bucket.atracker, // need logic to implement atracker, probably from data?
      },
    ];
  }
  if (bucket.metrics_monitoring) {
    bucketValues.metrics_monitoring = [
      {
        metrics_monitoring_crn: bucket.metrics_monitoring, // need logic to implement crn ref
        usage_metrics_enabled: bucket.usage_metrics_enabled,
        request_metrics_enabled: bucket.request_metrics_enabled,
      },
    ];
  }
  if (containsKeys(bucket, "object_versioning")) {
    bucketValues.object_versioning = [
      {
        enable: bucket.object_versioning,
      },
    ];
  }
  if (bucket.archive_rules) {
    bucketValues["archive_rule"] = [];
    bucket.archive_rules.forEach((rule) => {
      let stringifiedRule = {};
      eachKey(rule, (key) => {
        stringifiedRule[key] = rule[key];
      });
      bucketValues["archive_rule"].push(stringifiedRule);
    });
  }
  if (bucket.expire_rule) {
    bucketValues.expire_rule = [{}];
    eachKey(bucket.expire_rule, (key) => {
      bucketValues.expire_rule[0][key] = bucket.expire_rule[key];
    });
  }
  if (bucket.retention_rule) {
    bucketValues.retention_rule = [bucket.retention_rule];
  }
  let depends = `ibm_iam_authorization_policy.${snakeCase(
    cos.name + " cos to " + cos.kms + " kms policy"
  )}`;
  bucketValues.depends_on = [cdktf ? depends : cdktfRef(depends)];
  data.data = bucketValues;
  return data;
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
  let data = ibmCosBucket(bucket, cos, config);
  return jsonToTfPrint("resource", "ibm_cos_bucket", data.name, data.data);
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
 * @returns {object} data form cdk tf
 */

function ibmResourceKeyCos(key, cos, config) {
  let keyValues = {
    name: kebabName([cos.name, "key", key.name], randomSuffix(cos)),
    resource_instance_id: getCosId(cos),
    role: "Writer",
    tags: getTags(config),
  };
  if (key.enable_hmac) {
    keyValues.parameters = {
      HMAC: true,
    };
  }
  return {
    name: `${snakeCase(cos.name + "-object-storage-key-" + key.name)}`,
    data: keyValues,
  };
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
  let keyValues = ibmResourceKeyCos(key, cos, config);
  return jsonToTfPrint(
    "resource",
    "ibm_resource_key",
    keyValues.name,
    keyValues.data
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
    formatCosInstance(cos, config) + formatCosToKmsAuth(cos, config);
  cos.buckets.forEach(
    (bucket) => (instanceTf += formatCosBucket(bucket, cos, config))
  );
  cos.keys.forEach((key) => (instanceTf += formatCosKey(key, cos, config)));
  return tfBlock("Object Storage Instance " + cos.name, instanceTf);
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
      cosTerraform += "\n";
    }
  });
  return tfDone(cosTerraform);
}

module.exports = {
  formatCosInstance,
  formatCosToKmsAuth,
  formatCosBucket,
  formatCosKey,
  cosInstanceTf,
  cosTf,
  ibmResourceInstanceCos,
  ibmIamAuthorizationPolicyCos,
  ibmCosBucket,
  ibmResourceKeyCos,
};
