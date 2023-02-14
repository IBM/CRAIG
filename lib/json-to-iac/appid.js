const { getObjectFromArray } = require("lazy-z");
const { endComment } = require("./constants");
const {
  rgIdRef,
  buildTitleComment,
  kebabName,
  useData,
  resourceRef,
  jsonToTf,
  dataResourceName,
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
  return jsonToTf(
    "ibm_resource_key",
    `${key.appid} key ${key.name}`,
    {
      name: kebabName(config, [key.appid, key.name]),
      resource_instance_id: resourceRef(
        key.appid,
        "id",
        getObjectFromArray(config.appid, "name", key.appid).use_data
      ),
      role: '"Writer"',
      tags: true,
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
  return jsonToTf(
    "ibm_resource_instance",
    instance.name,
    {
      name: dataResourceName(instance, config),
      resource_group_id: rgIdRef(instance.resource_group, config),
      _new: {
        tags: true,
        service: '"appid"',
        plan: '"graduated-tier"',
        location: "region",
      },
    },
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
  return jsonToTf(
    "ibm_appid_redirect_urls",
    resourceName ? resourceName : `${appid.name} urls`,
    {
      tenant_id: resourceRef(appid.name, "guid", useData(appid.use_data)),
      urls: JSON.stringify(urls),
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
  config.appid.forEach((instance) => {
    tf += buildTitleComment(instance.name, "Resources");
    tf += formatAppId(instance, config);
    instance.keys.forEach((key) => {
      tf += formatAppIdKey(key, config);
    });
    tf += endComment + "\n";
  });
  return tf.replace(/\n\n$/g, "\n");
}

module.exports = {
  formatAppIdKey,
  formatAppId,
  formatAppIdRedirectUrls,
  appidTf,
};
