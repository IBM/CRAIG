const { snakeCase, splat, distinct } = require("lazy-z");
const {
  rgIdRef,
  kebabName,
  tfRef,
  encryptionKeyRef,
  dataResourceName,
  tfBlock,
  tfDone,
  getTags,
  composedKmsId,
  jsonToTfPrint,
  cdktfRef,
  getResourceOrData
} = require("./utils");
const { varDotRegion } = require("../constants");

/**
 * format a key management resource terraform code
 * @param {Object} kms key management instance Object
 * @param {Object} config json data template
 * @param {Array<Object>} config.resource_groups
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {object}
 */

function ibmResourceInstanceKms(kms, config) {
  let instance = {
    name: dataResourceName(kms),
    resource_group_id: rgIdRef(kms.resource_group, config),
    service: kms.use_hs_crypto ? "hs-crypto" : "kms"
  };
  if (!kms.use_data) {
    instance.plan = "tiered-pricing";
    instance.location = varDotRegion;
    instance.tags = getTags(config);
  }
  return {
    name: kms.name,
    data: instance
  };
}

/**
 * format a key management resource terraform code
 * @param {Object} kms key management instance Object
 * @param {Object} config json data template
 * @param {Array<Object>} config.resource_groups
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} string formatted terraform code
 */
function formatKmsInstance(kms, config) {
  let instance = ibmResourceInstanceKms(kms, config);
  return jsonToTfPrint(
    getResourceOrData(kms),
    "ibm_resource_instance",
    instance.name,
    instance.data
  );
}

/**
 * format kms auth policy
 * @param {Object} kms key management instance Object
 * @returns {object} terraform
 */

function ibmIamAuthorizationPolicyKms(kms, isBlockStorage) {
  let data = {
    source_service_name: isBlockStorage ? "is" : "server-protect",
    target_service_name: kms.use_hs_crypto ? "hs-crypto" : "kms",
    target_resource_instance_id: composedKmsId(kms),
    roles: ["Reader"],
    description:
      "Allow block storage volumes to be encrypted by Key Management instance."
  };
  if (isBlockStorage) {
    data.roles.push("Authorization Delegator");
    data.source_resource_type = "share";
  }
  return {
    data: data,
    name:
      kms.name +
      (isBlockStorage ? " block_storage_policy" : " server protect policy")
  };
}

/**
 * format kms auth policy
 * @param {Object} kms key management instance Object
 * @returns {string} string formatted terraform code
 */
function formatKmsAuthPolicy(kms, isBlockStorage) {
  let auth = ibmIamAuthorizationPolicyKms(kms, isBlockStorage);
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    auth.name,
    auth.data
  );
}

/**
 * create a key ring
 * @param {string} name ring name
 * @param {Object} kms key management instance
 * @param {string} kms.name name of instance
 * @param {Object} config options
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {object} key ring terraform
 */

function ibmKmsKeyRings(name, kms, config) {
  return {
    name: `${kms.name} ${name} ring`,
    data: {
      key_ring_id: kebabName([kms.name, name]),
      instance_id: composedKmsId(kms)
    }
  };
}

/**
 * create a key ring
 * @param {string} name ring name
 * @param {Object} kms key management instance
 * @param {string} kms.name name of instance
 * @param {Object} config options
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} key ring terraform
 */
function formatKeyRing(name, kms, config) {
  let ring = ibmKmsKeyRings(name, kms, config);
  return jsonToTfPrint("resource", "ibm_kms_key_rings", ring.name, ring.data);
}

/**
 * format a terraform block for an encryption key
 * @param {Object} key encryption key Object
 * @param {string} key.name
 * @param {boolean} key.root_key
 * @param {string} key.key_ring
 * @param {boolean} key.force_delete
 * @param {string} key.endpoint can be public or private
 * @param {Object} kms key management instance
 * @param {string} kms.name name of instance
 * @param {Object} config options
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {boolean} cdktf
 * @returns {object} key terraform code
 */

function ibmKmsKey(key, kms, config, cdktf) {
  let keyValues = {
    instance_id: composedKmsId(kms),
    key_name: kebabName([kms.name, key.name]),
    standard_key: !key.root_key,
    key_ring_id: tfRef(
      "ibm_kms_key_rings",
      `${kms.name} ${key.key_ring} ring`,
      "key_ring_id"
    ),
    force_delete: key.force_delete,
    endpoint_type: key.endpoint
  };

  if (kms.authorize_vpc_reader_role) {
    keyValues.depends_on = [];
    [
      `ibm_iam_authorization_policy.${snakeCase(
        kms.name
      )}_server_protect_policy`,
      `ibm_iam_authorization_policy.${snakeCase(kms.name)}_block_storage_policy`
    ].forEach(ref => {
      keyValues.depends_on.push(cdktf ? ref : cdktfRef(ref));
    });
  }
  return {
    name: `${kms.name}-${key.name}-key`,
    data: keyValues
  };
}

/**
 * format a terraform block for an encryption key
 * @param {Object} key encryption key Object
 * @param {string} key.name
 * @param {boolean} key.root_key
 * @param {string} key.key_ring
 * @param {boolean} key.force_delete
 * @param {string} key.endpoint can be public or private
 * @param {Object} kms key management instance
 * @param {string} kms.name name of instance
 * @param {Object} config options
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} key terraform code
 */
function formatKmsKey(key, kms, config) {
  let tf = ibmKmsKey(key, kms, config);
  return jsonToTfPrint("resource", "ibm_kms_key", tf.name, tf.data);
}

/**
 * create a key policy
 * @param {Object} key encryption key Object
 * @param {string} key.name
 * @param {string} key.endpoint can be public or private
 * @param {number} key.rotation rotation interval can be 1-12
 * @param {boolean} key.dual_auth_delete
 * @param {Object} kms key management instance
 * @param {string} kms.name name of instance
 * @returns {string} key policy terraform
 */
function ibmKmsKeyPolicy(key, kms) {
  return {
    name: `${kms.name}-${key.name}-key-policy`,
    data: {
      instance_id: composedKmsId(kms),
      endpoint_type: key.endpoint,
      key_id: encryptionKeyRef(kms.name, key.name),
      rotation: [
        {
          interval_month: key.rotation
        }
      ],
      dual_auth_delete: [
        {
          enabled: key.dual_auth_delete
        }
      ]
    }
  };
}

/**
 * create a key policy
 * @param {Object} key encryption key Object
 * @param {string} key.name
 * @param {string} key.endpoint can be public or private
 * @param {number} key.rotation rotation interval can be 1-12
 * @param {boolean} key.dual_auth_delete
 * @param {Object} kms key management instance
 * @param {string} kms.name name of instance
 * @returns {string} key policy terraform
 */
function formatKmsKeyPolicy(key, kms) {
  let policy = ibmKmsKeyPolicy(key, kms);
  return jsonToTfPrint(
    "resource",
    "ibm_kms_key_policies",
    policy.name,
    policy.data
  );
}

/**
 * create terraform for a single key managamenet instance
 * @param {Object} kms key management instance
 * @param {Array<Object>} kms.keys encryption keys
 * @param {string} kms.keys.key_ring key ring name
 * @param {boolean} kms.authorize_vpc_reader_role
 * @param {Object} config environment config
 * @param {Object} globalOptions global options
 * @returns {string} terraform string
 */
function kmsInstanceTf(kms, config) {
  let instanceTf = formatKmsInstance(kms, config);
  let keyRings = distinct(splat(kms.keys, "key_ring"));
  if (kms.authorize_vpc_reader_role) {
    instanceTf += formatKmsAuthPolicy(kms) + formatKmsAuthPolicy(kms, true);
  }
  keyRings.forEach(ring => {
    instanceTf += formatKeyRing(ring, kms, config);
  });
  kms.keys.forEach(key => {
    instanceTf += formatKmsKey(key, kms, config) + formatKmsKeyPolicy(key, kms);
  });
  return tfBlock("Key Management Instance " + kms.name, instanceTf);
}

/**
 * create key management terraform file with multiple instances
 * @param {Object} config configuration object
 * @param {Array<Object>} config.key_management list of key management instances
 * @param {Object} config._options global options for key management
 * @returns {string} key management terraform code as string
 */
function kmsTf(config) {
  let kmsTerraform = "";
  let names = splat(config.key_management, "name");
  config.key_management.forEach(instance => {
    kmsTerraform += kmsInstanceTf(instance, config, config);
    if (names.length > 1 && names.indexOf(instance.name) !== names.length - 1) {
      kmsTerraform += "\n";
    }
  });
  return tfDone(kmsTerraform);
}

module.exports = {
  formatKmsInstance,
  formatKmsAuthPolicy,
  formatKeyRing,
  formatKmsKey,
  formatKmsKeyPolicy,
  kmsInstanceTf,
  kmsTf,
  ibmResourceInstanceKms,
  ibmKmsKeyPolicy,
  ibmKmsKey,
  ibmKmsKeyRings,
  ibmIamAuthorizationPolicyKms
};
