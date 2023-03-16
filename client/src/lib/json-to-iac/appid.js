const { getObjectFromArray } = require("lazy-z");
const {
  rgIdRef,
  kebabName,
  useData,
  resourceRef,
  jsonToIac,
  dataResourceName,
  tfBlock,
  tfDone,
  getTags
} = require("./utils");

/**
 * create terraform for appid key
 * @param {Object} key
 * @param {string} key.appid
 * @param {string} key.name
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform formatted code
 */
function formatAppIdKey(key, config) {
  return jsonToIac(
    "ibm_resource_key",
    `${key.appid} key ${key.name}`,
    {
      name: kebabName(config, [key.appid, key.name]),
      resource_instance_id: resourceRef(
        key.appid,
        "id",
        getObjectFromArray(config.appid, "name", key.appid).use_data
      ),
      role: "^Writer",
      tags: getTags(config)
    },
    config
  );
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
 * @returns {string} terraform formatted code
 */
function formatAppId(instance, config) {
  let appIdValues = {
    name: dataResourceName(instance, config),
    resource_group_id: rgIdRef(instance.resource_group, config)
  };
  // add needed values when new instance is created
  if (!instance.use_data) {
    appIdValues.tags = getTags(config);
    appIdValues.service = "^appid";
    appIdValues.plan = "^graduated-tier";
    appIdValues.location = "$region";
  }
  return jsonToIac(
    "ibm_resource_instance",
    instance.name,
    appIdValues,
    config,
    instance.use_data
  );
}

/**
 * create terraform for appid urls
 * @param {Object} appid
 * @param {Array<string>} urls
 * @param {string} resourceName name if not appid name
 * @returns {string} terraform appid redirect urls
 */
function formatAppIdRedirectUrls(appid, urls, resourceName) {
  return jsonToIac(
    "ibm_appid_redirect_urls",
    resourceName ? resourceName : `${appid.name} urls`,
    {
      tenant_id: resourceRef(appid.name, "guid", useData(appid.use_data)),
      urls: JSON.stringify(urls)
    }
  );
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
  appidTf
};
