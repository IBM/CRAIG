const { getObjectFromArray } = require("lazy-z");
const {
  rgIdRef,
  kebabName,
  useData,
  resourceRef,
  dataResourceName,
  tfBlock,
  tfDone,
  jsonToTfPrint,
  getResourceOrData
} = require("./utils");
const { varDotRegion } = require("../constants");

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
      name: kebabName(config, [key.appid, key.name]),
      resource_instance_id: resourceRef(
        key.appid,
        "id",
        getObjectFromArray(config.appid, "name", key.appid).use_data
      ),
      role: "Writer",
      tags: config._options.tags
    }
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
    name: dataResourceName(instance, config),
    resource_group_id: rgIdRef(instance.resource_group, config)
  };
  // add needed values when new instance is created
  if (!instance.use_data) {
    appIdValues.tags = config._options.tags;
    appIdValues.service = "appid";
    appIdValues.plan = "graduated-tier";
    appIdValues.location = varDotRegion
  }
  return {
    name: instance.name,
    data: appIdValues
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
    name:`${appid.name} urls`,
    data: {
      tenant_id: resourceRef(appid.name, "guid", useData(appid.use_data)),
      urls: urls
    }
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
  config.appid.forEach(instance => {
    let str = formatAppId(instance, config);
    instance.keys.forEach(key => {
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
  ibmAppIdRedirectUrls
};
