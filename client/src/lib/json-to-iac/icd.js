const { contains, eachKey, isNullOrEmptyString } = require("lazy-z");
const {
  rgIdRef,
  dataResourceName,
  tfBlock,
  jsonToTfPrint,
  getResourceOrData,
  encryptionKeyRef,
  cdktfRef,
  getKmsInstanceData,
  timeouts,
} = require("./utils");
const { varDotRegion } = require("../constants");

// supported databases
// ["databases-for-postgresql", "databases-for-etcd", "databases-for-redis", "databases-for-mongodb", "databases-for-mysql"]
// supported group ids
// ["member", "analytcs", "bi_connector", "search"]

/**
 * create authorization policy to allow for icd to be encrypted
 * @param {string} kmsName
 * @param {string} service database service name
 * @param {Object} config configuration
 * @returns {string} terraform code
 */
function ibmIamAuthorizationPolicyIcd(kmsName, service, config) {
  let kmsInstance = getKmsInstanceData(kmsName, config);
  return {
    name: `icd to ${kmsName} kms policy`,
    data: {
      source_service_name: service,
      roles: ["Reader"],
      description: "Allow ICD service instance to read from KMS instance",
      target_service_name: kmsInstance.type,
      target_resource_instance_id: cdktfRef(kmsInstance.guid),
    },
  };
}

/**
 * format auth for icd to kms. icd authorization needs to be
 * created prior to instance to allow for the icd service to be encrypted
 * with keys from kms
 * @param {string} kmsName
 * @param {Object} config configuration
 * @returns {string} terraform code
 */
function formatIcdToKmsAuth(kmsName, service, config) {
  let auth = ibmIamAuthorizationPolicyIcd(kmsName, service, config);
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    auth.name,
    auth.data
  );
}

/**
 * create icd resource instance
 * @param {*} instance
 * @param {string} instance.name
 * @param {boolean} instance.use_data
 * @param {string} instance.resource_group
 * @param {string} instance.kms
 * @param {string} instance.encryption_key
 * @param {string} instance.version
 * @param {string} instance.group_id
 * @param {string} instance.memory
 * @param {string} instance.disk
 * @param {string} instance.cpu
 * @param {*} config
 * @returns {object} Terraform object
 */
function ibmResourceInstanceIcd(instance, config) {
  let values = {
    name: dataResourceName(instance),
    resource_group_id: rgIdRef(instance.resource_group, config),
    service: instance.service,
  };
  // add needed values when new instance is created
  if (!instance.use_data) {
    values.plan = "standard"; // dbs only use standard
    values.location = varDotRegion;
    if (!isNullOrEmptyString(instance.kms)) {
      values.key_protect_key = encryptionKeyRef(
        instance.kms,
        instance.encryption_key,
        "crn"
      );
    }
    values.version = instance.version;
    values.service_endpoints = config._options.endpoints;
    values.group = [
      {
        group_id: instance.group_id,
        memory: [
          {
            allocation_mb: instance.memory,
          },
        ],
        disk: [
          {
            allocation_mb: instance.disk,
          },
        ],
        cpu: [
          {
            allocation_count: instance.cpu,
          },
        ],
      },
    ];
    values.tags = config._options.tags;
    values.timeouts = timeouts("120m", "120m", "15m");
  }
  return {
    name: instance.name,
    data: values,
  };
}

/**
 * create terraform for icd
 * @param {Object} instance
 * @param {Object} config
 * @returns {string} terraform formatted code
 */
function formatIcd(instance, config) {
  let icd = ibmResourceInstanceIcd(instance, config);
  return jsonToTfPrint(
    getResourceOrData(instance),
    "ibm_resource_instance",
    icd.name,
    icd.data
  );
}

/**
 * create icd terraform
 * @param {*} config
 * @returns {string} terraform string
 */
function icdTf(config) {
  let tf = "";
  let icdServiceToKmsMap = {
    "databases-for-postgresql": [],
    "databases-for-etcd": [],
    "databases-for-redis": [],
    "databases-for-mongodb": [],
    "databases-for-mysql": [],
  };
  config.icd.forEach((instance) => {
    if (
      !contains(icdServiceToKmsMap[instance.service], instance.kms) &&
      !instance.use_data
    ) {
      if (!isNullOrEmptyString(instance.kms)) {
        icdServiceToKmsMap[instance.service].push(instance.kms);
      }
    }
  });
  let authTf = "";
  eachKey(icdServiceToKmsMap, (service) => {
    icdServiceToKmsMap[service].forEach((kms) => {
      authTf += formatIcdToKmsAuth(kms, service, config);
    });
  });
  if (authTf !== "") {
    tf += tfBlock("Database Authorizations", authTf) + "\n";
  }
  let instanceTf = "";
  config.icd.forEach((instance) => {
    instanceTf += formatIcd(instance, config);
  });
  tf += tfBlock("Database Services", instanceTf);
  return tf;
}

module.exports = {
  formatIcdToKmsAuth,
  formatIcd,
  icdTf,
};
