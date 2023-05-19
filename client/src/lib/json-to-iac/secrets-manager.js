const { snakeCase, splat, getObjectFromArray } = require("lazy-z");
const {
  rgIdRef,
  getKmsInstanceData,
  kebabName,
  encryptionKeyRef,
  tfBlock,
  timeouts,
  jsonToTfPrint,
  cdktfRef
} = require("./utils");
const { varDotRegion } = require("../constants");

/**
 * format auth for secrets manager to kms. secrets manager authorization needs to be
 * created prior to instance to allow for the secrets manager service to be encrypted
 * with keys from kms
 * @param {string} kmsName
 * @param {Object} config configuration
 * @returns {string} terraform code
 */
function ibmIamAuthorizationPolicySecretsManager(kmsName, config) {
  let kmsInstance = getKmsInstanceData(kmsName, config);
  return {
    name: `secrets manager to ${kmsName} kms policy`,
    data: {
      source_service_name: "secrets-manager",
      roles: ["Reader"],
      description: "Allow Secets Manager instance to read from KMS instance",
      target_service_name: kmsInstance.type,
      target_resource_instance_id: cdktfRef(kmsInstance.guid)
    }
  };
}

/**
 * format auth for secrets manager to kms. secrets manager authorization needs to be
 * created prior to instance to allow for the secrets manager service to be encrypted
 * with keys from kms
 * @param {string} kmsName
 * @param {Object} config configuration
 * @returns {string} terraform code
 */
function formatSecretsManagerToKmsAuth(kmsName, config) {
  let auth = ibmIamAuthorizationPolicySecretsManager(kmsName, config);
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    auth.name,
    auth.data
  );
}
/**
 * create secrets manager instance terraform
 * @param {Object} secretsManager
 * @param {string} secretsManager.name
 * @param {string} secretsManager.kms
 * @param {string} secretsManager.encryption_key
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {object} terraform
 */
function ibmResourceInstanceSecretsManager(secretsManager, config) {
  let kmsInstance = secretsManager.kms
    ? getObjectFromArray(config.key_management, "name", secretsManager.kms)
    : null;
  let instance = {
    name: kebabName([secretsManager.name]),
    location: varDotRegion,
    plan: "standard",
    service: "secrets-manager",
    resource_group_id: rgIdRef(secretsManager.resource_group, config),
    parameters: {
      kms_key: !kmsInstance
        ? "ERROR: Unfound Reference"
        : encryptionKeyRef(
            secretsManager.kms,
            secretsManager.encryption_key,
            "crn"
          )
    },
    timeouts: timeouts("1h", "", "1h"),
    tags: config._options.tags
  };
  if (kmsInstance && kmsInstance.has_secrets_manager_auth !== true) {
    instance.depends_on = [
      cdktfRef(
        `ibm_iam_authorization_policy.secrets_manager_to_${snakeCase(
          secretsManager.kms
        )}_kms_policy`
      )
    ];
  }
  return {
    name: secretsManager.name + "-secrets-manager",
    data: instance
  };
}

/**
 * create secrets manager instance terraform
 * @param {Object} secretsManager
 * @param {string} secretsManager.name
 * @param {string} secretsManager.kms
 * @param {string} secretsManager.encryption_key
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {string} terraform string
 */
function formatSecretsManagerInstance(secretsManager, config) {
  let instance = ibmResourceInstanceSecretsManager(secretsManager, config);
  return jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    instance.name,
    instance.data
  );
}

/**
 * format a secrets manager secret
 * @param {*} secret secret object
 * @param {string} secret.secrets_manager name of instance where secret will be provisioned
 * @param {string} secret.name name of secret
 * @param {string} secret.description description of secret
 * @param {string} secret.credentials name of cred
 * @param {string} secret.credential_instance instance, currently only cos supported
 * @returns {string} terraform object
 */
function ibmSmKvSecret(secret) {
  let data = {
    name: snakeCase(secret.secrets_manager + " " + secret.name),
    data: {
      name: kebabName([secret.secrets_manager, secret.name]),
      instance_id: `\${ibm_resource_instance.${snakeCase(
        secret.secrets_manager
      )}_secrets_manager.guid}`,
      region: varDotRegion,
      data: {
        credentials: `\${ibm_resource_key.${snakeCase(
          secret.credential_instance +
            " object storage key " +
            secret.credentials
        )}.credentials}`
      },
      description: secret.description
    }
  };
  return data;
}

/**
 * format a secrets manager secret
 * @param {*} secret secret object
 * @param {string} secret.secrets_manager name of instance where secret will be provisioned
 * @param {string} secret.name name of secret
 * @param {string} secret.description description of secret
 * @param {string} secret.credentials name of cred
 * @param {string} secret.credential_instance instance, currently only cos supported
 * @param {*} config config object
 * @returns {string} terraform string
 */
function formatSecretsManagerSecret(secret, config) {
  let data = ibmSmKvSecret(secret, config);
  return jsonToTfPrint("resource", "ibm_sm_kv_secret", data.name, data.data);
}

/**
 * create secrets manager terraform
 * @param {Object} config
 * @param {Array<Object>} config.secrets_manager
 * @param {Array<Object>} config.key_management
 * @param {boolean} config.key_management.has_secrets_manager_auth
 * @returns {string} terraform string
 */
function secretsManagerTf(config) {
  let tf = ``;
  let allKmsServices = splat(config.secrets_manager, "kms");
  let kmstf = "";
  let totalKmsInstances = 0;
  allKmsServices.forEach(service => {
    if (service) {
      if (
        // if service doesn't already have auth
        (getObjectFromArray(config.key_management, "name", service)
          .has_secrets_manager_auth || false) !== true
      ) {
        kmstf += formatSecretsManagerToKmsAuth(service, config);
        totalKmsInstances++;
      }
    }
  });
  if (totalKmsInstances !== 0) {
    tf += tfBlock("Key Management Authorizations", kmstf) + "\n";
  }
  let secretsManagerData = "";
  config.secrets_manager.forEach(instance => {
    secretsManagerData += formatSecretsManagerInstance(instance, config);
    if (instance.kv_secrets) {
      instance.kv_secrets.forEach(secret => {
        secretsManagerData += formatSecretsManagerSecret(secret, config);
      });
    }
  });
  if (secretsManagerData.length > 0)
    tf += tfBlock("Secrets Manager Instances", secretsManagerData);
  return tf;
}

module.exports = {
  formatSecretsManagerToKmsAuth,
  formatSecretsManagerInstance,
  secretsManagerTf,
  ibmResourceInstanceSecretsManager,
  ibmIamAuthorizationPolicySecretsManager,
  formatSecretsManagerSecret
};
