const { getObjectFromArray, splat, distinct } = require("lazy-z");
const {
  rgIdRef,
  kebabName,
  useData,
  resourceRef,
  dataResourceName,
  tfBlock,
  tfDone,
  jsonToTfPrint,
  getResourceOrData,
  encryptionKeyRef,
  cdktfRef,
  getKmsInstanceData,
} = require("./utils");
const { varDotRegion } = require("../constants");

/**
 * create authorization policy to allow for appid to be encrypted
 * @param {string} kmsName
 * @param {Object} config configuration
 * @returns {string} terraform code
 */
function ibmIamAuthorizationPolicyAppid(kmsName, config) {
  let kmsInstance = getKmsInstanceData(kmsName, config);
  return {
    name: `appid to ${kmsName} kms policy`,
    data: {
      source_service_name: "appid",
      roles: ["Reader"],
      description: "Allow AppID instance to read from KMS instance",
      target_service_name: kmsInstance.type,
      target_resource_instance_id: cdktfRef(kmsInstance.guid),
    },
  };
}

/**
 * format auth for appid to kms. appid authorization needs to be
 * created prior to instance to allow for the appid service to be encrypted
 * with keys from kms
 * @param {string} kmsName
 * @param {Object} config configuration
 * @returns {string} terraform code
 */
function formatAppidToKmsAuth(kmsName, config) {
  let auth = ibmIamAuthorizationPolicyAppid(kmsName, config);
  return jsonToTfPrint(
    "resource",
    "ibm_iam_authorization_policy",
    auth.name,
    auth.data
  );
}

/**
 * create terraform for appid key
 * @param {Object} key
 * @param {string} key.appid
 * @param {string} key.name
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {object} terraform formatted code
 */
function ibmResourceKeyAppId(key, config) {
  return {
    name: `${key.appid} key ${key.name}`,
    data: {
      name: kebabName([key.appid, key.name]),
      resource_instance_id: resourceRef(
        key.appid,
        "id",
        getObjectFromArray(config.appid, "name", key.appid).use_data
      ),
      role: "Writer",
      tags: config._options.tags,
    },
  };
}

/**
 * create terraform for appid key
 * @param {Object} key
 * @returns {string} terraform formatted code
 */
function formatAppIdKey(key, config) {
  let data = ibmResourceKeyAppId(key, config);
  return jsonToTfPrint("resource", "ibm_resource_key", data.name, data.data);
}

/**
 * create terraform for appid
 * @param {Object} instance
 * @param {string} instance.name
 * @param {string} instance.resource_group
 * @param {boolean} instance.use_data
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {Object} terraform formatted code
 */
function ibmResourceInstanceAppId(instance, config) {
  let appIdValues = {
    name: dataResourceName(instance),
    resource_group_id: rgIdRef(instance.resource_group, config),
  };
  // add needed values when new instance is created
  if (!instance.use_data) {
    appIdValues.service = "appid";
    appIdValues.plan = "graduated-tier";
    appIdValues.location = varDotRegion;
  }
  if (instance.kms) {
    appIdValues.parameters = {
      // paramters kms info need to be stringified json to work
      kms_info: `{\\"id\\": \\"${cdktfRef(
        getKmsInstanceData(instance.kms, config).guid
      )}\\"}`,
      tek_id: encryptionKeyRef(instance.kms, instance.encryption_key, "crn"),
    };
  }
  if (!instance.use_data) appIdValues.tags = config._options.tags;
  return {
    name: instance.name,
    data: appIdValues,
  };
}

/**
 * create terraform for appid
 * @param {Object} instance
 * @param {Object} config
 * @returns {string} terraform formatted code
 */
function formatAppId(instance, config) {
  let appid = ibmResourceInstanceAppId(instance, config);
  return jsonToTfPrint(
    getResourceOrData(instance),
    "ibm_resource_instance",
    appid.name,
    appid.data
  );
}

/**
 * create terraform for appid urls
 * @param {Object} appid
 * @param {Array<string>} urls
 * @returns {object} terraform appid redirect urls
 */

function ibmAppIdRedirectUrls(appid, urls) {
  return {
    name: `${appid.name} urls`,
    data: {
      tenant_id: resourceRef(appid.name, "guid", useData(appid.use_data)),
      urls: urls,
    },
  };
}

/**
 * create terraform for appid urls
 * @param {Object} appid
 * @param {Array<string>} urls
 * @param {string} resourceName name if not appid name
 * @returns {string} terraform appid redirect urls
 */
function formatAppIdRedirectUrls(appid, urls, resourceName) {
  let tf = ibmAppIdRedirectUrls(appid, urls, resourceName);
  return jsonToTfPrint("resource", "ibm_appid_redirect_urls", tf.name, tf.data);
}

/**
 * create terraform data for appid
 * @param {Object} config
 * @param {Array<Object>} config.appid
 * @returns {string} terraform formatted appid
 */
function appidTf(config) {
  let tf = "";
  let appidKmsInstances = distinct(splat(config.appid, "kms")).filter((kms) => {
    // remove when undefined
    if (kms) return kms;
  });
  let appidAuthPolicies = "";
  appidKmsInstances.forEach((instance) => {
    appidAuthPolicies += formatAppidToKmsAuth(instance, config);
  });
  if (appidAuthPolicies.length > 0)
    tf += tfBlock(`Appid Authorization Policies`, appidAuthPolicies) + "\n";
  config.appid.forEach((instance) => {
    let str = formatAppId(instance, config);
    instance.keys.forEach((key) => {
      str += formatAppIdKey(key, config);
    });
    tf += tfBlock(`${instance.name} Resources`, str);
  });
  return tfDone(tf);
}

module.exports = {
  formatAppIdKey,
  formatAppId,
  formatAppIdRedirectUrls,
  appidTf,
  ibmResourceKeyAppId,
  ibmResourceInstanceAppId,
  ibmAppIdRedirectUrls,
};
