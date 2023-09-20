const {
  snakeCase,
  splat,
  getObjectFromArray,
  kebabCase,
  distinct,
} = require("lazy-z");
const {
  rgIdRef,
  getKmsInstanceData,
  kebabName,
  encryptionKeyRef,
  tfBlock,
  timeouts,
  jsonToTfPrint,
  cdktfRef,
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
      target_resource_instance_id: cdktfRef(kmsInstance.guid),
    },
  };
}

/**
 * format auth for kubernetes to secrets manager
 * @param {Object} secretsManager secrets manager object
 * @returns {object} terraform code
 */
function ibmIamAuthorizationPolicyK8sToSecretsManager(secretsManager) {
  return {
    name: `secrets manager ${secretsManager.name} to containers policy`,
    data: {
      target_service_name: "secrets-manager",
      roles: ["Manager"],
      description: `Allow Secets Manager instance ${secretsManager.name} to encrypt kubernetes service`,
      target_resource_instance_id: `\${ibm_resource_instance.${snakeCase(
        secretsManager.name
      )}_secrets_manager.guid}`,
      source_service_name: "containers-kubernetes",
    },
  };
}

/**
 * format auth for kubernetes to secrets manager
 * @param {Object} secretsManager secrets manager object
 * @returns {object} terraform code
 */
function formatK8sToSecretsManagerAuth(secretsManager) {
  let data = ibmIamAuthorizationPolicyK8sToSecretsManager(secretsManager);
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    data.name,
    data.data
  );
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
          ),
    },
    timeouts: timeouts("1h", "", "1h"),
    tags: config._options.tags,
  };
  if (kmsInstance && kmsInstance.has_secrets_manager_auth !== true) {
    instance.depends_on = [
      cdktfRef(
        `ibm_iam_authorization_policy.secrets_manager_to_${snakeCase(
          secretsManager.kms
        )}_kms_policy`
      ),
    ];
  }
  return {
    name: secretsManager.name + "-secrets-manager",
    data: instance,
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
  let secretName = secret?.appid
    ? kebabCase(`appid ${secret.appid} key ${secret.key}`)
    : secret.key
    ? secret.key
    : secret.name;
  let data = {
    name: snakeCase(secret.secrets_manager + " " + secretName),
    data: {
      name: kebabName([secret.secrets_manager, secretName]),
      instance_id: `\${ibm_resource_instance.${snakeCase(
        secret.secrets_manager
      )}_secrets_manager.guid}`,
      region: varDotRegion,
      description: secret.description,
    },
  };
  if (secret.type === "imported") {
    data.data.certificate = `\${var.${data.name}_data}`;
  } else if (secret.ref) {
    data.data.description = `Credentials for ${
      secret?.cos ? "COS" : "AppID"
    } instance`;
    if (secret.ref === "ibm_resource_key.logdna_key") {
      data.name = kebabCase(secret.secrets_manager + " logdna key");
      data.data.description = "LogDNA Credentials";
      data.data.name = kebabName([secret.secrets_manager, "logdna_key"]);
    }
    if (secret.ref === "ibm_resource_key.sysdig_key") {
      data.name = kebabCase(secret.secrets_manager + " sysdig key");
      data.data.description = "Sysdig Credentials";
      data.data.name = kebabName([secret.secrets_manager, "sysdig_key"]);
    }
    data.data.data = {
      credentials: `\${${secret.ref}.credentials}`,
    };
  } else {
    data.data.data = {
      credentials: `\${ibm_resource_key.${snakeCase(
        secret.credential_instance + " object storage key " + secret.credentials
      )}.credentials}`,
    };
  }
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
 * format a secrets manager secret group
 * @param {*} secret secret object
 * @param {string} secret.secrets_manager name of instance where secret will be provisioned
 * @param {string} secret.name name of secret group
 * @param {string} secret.description description of secret group
 * @returns {object} terraform string
 */
function ibmSmSecretGroup(group) {
  return {
    name: snakeCase(group.secrets_manager + "_group_" + group.name),
    data: {
      name:
        "${var.prefix}-" + kebabCase(group.secrets_manager + " " + group.name),
      instance_id: `\${ibm_resource_instance.${snakeCase(
        group.secrets_manager
      )}_secrets_manager.guid}`,
      description: group.description,
      region: varDotRegion,
    },
  };
}

/**
 * format a secrets manager secret group
 * @param {*} secret secret object
 * @param {string} secret.secrets_manager name of instance where secret will be provisioned
 * @param {string} secret.name name of secret group
 * @param {string} secret.description description of secret group
 * @returns {string} terraform string
 */
function formatSecretsManagerSecretGroup(group) {
  let data = ibmSmSecretGroup(group);
  return jsonToTfPrint("resource", "ibm_sm_secret_group", data.name, data.data);
}

/**
 * create a secret for integration with kubernetes ingress
 * @param {*} secret
 * @param {*} config
 * @returns {string} terraform for secrets
 */
function formatSecretsManagerK8sSecret(secret, config) {
  /**
   * function to create ref for variable
   * @param {string} ref
   * @returns {string} formatted string
   */
  function formatSecretVariableRef(ref) {
    return `\${var.${snakeCase(
      `${secret.secrets_manager} ${secret.name} secret ${ref}`
    )}}`;
  }

  let arbitrarySecretData = {
    name: kebabCase(
      "${var.prefix}-" +
        secret.secrets_manager +
        "-" +
        secret.arbitrary_secret_name
    ),
    instance_id: `\${ibm_resource_instance.${snakeCase(
      secret.secrets_manager
    )}_secrets_manager.guid}`,
    secret_group_id: cdktfRef(
      "ibm_sm_secret_group." +
        snakeCase(secret.secrets_manager + "_group_" + secret.secrets_group) +
        ".secret_group_id"
    ),
    region: varDotRegion,
    endpoint_type: config._options.endpoints,
    description: secret.arbitrary_secret_description,
    expiration_date: secret.expiration_date,
    labels: secret.labels,
    payload: formatSecretVariableRef("arbitrary_secret_data"),
  };

  let usernamePasswordSecret = {
    name: kebabCase(
      "${var.prefix}-" +
        secret.secrets_manager +
        "-" +
        secret.username_password_secret_name
    ),
    instance_id: `\${ibm_resource_instance.${snakeCase(
      secret.secrets_manager
    )}_secrets_manager.guid}`,
    secret_group_id: cdktfRef(
      "ibm_sm_secret_group." +
        snakeCase(secret.secrets_manager + "_group_" + secret.secrets_group) +
        ".secret_group_id"
    ),
    region: varDotRegion,
    endpoint_type: config._options.endpoints,
    description: secret.username_password_secret_description,
    expiration_date: secret.expiration_date,
    labels: secret.labels,
    username: formatSecretVariableRef("username"),
    password: formatSecretVariableRef("password"),
    rotation: [
      {
        auto_rotate: secret.auto_rotate,
        interval: secret.interval,
        unit: secret.unit,
      },
    ],
  };

  return (
    jsonToTfPrint(
      "resource",
      "ibm_sm_arbitrary_secret",
      snakeCase(
        `${secret.secrets_manager} ${secret.arbitrary_secret_name} secret`
      ),
      arbitrarySecretData
    ) +
    jsonToTfPrint(
      "resource",
      "ibm_sm_username_password_secret",
      snakeCase(
        `${secret.secrets_manager} ${secret.username_password_secret_name} secret`
      ),
      usernamePasswordSecret
    )
  );
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
  let allKmsServices = distinct(splat(config.secrets_manager, "kms"));
  let kmstf = "";
  let totalKmsInstances = 0;
  allKmsServices.forEach((service) => {
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
  config.secrets_manager.forEach((instance) => {
    secretsManagerData += formatSecretsManagerInstance(instance, config);
    if (instance.secrets) {
      instance.secrets.forEach((secret) => {
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
  formatSecretsManagerSecret,
  formatSecretsManagerSecretGroup,
  formatK8sToSecretsManagerAuth,
  formatSecretsManagerK8sSecret,
};
