const { varDotRegion } = require("../constants");
const {
  kebabName,
  tfRef,
  cosRef,
  bucketRef,
  tfBlock,
  jsonToTfPrint
} = require("./utils");

/**
 * format atracker target
 * @param {Object} config
 * @returns {string} terraform atracker target
 */
function formatAtrackerTarget(config) {
  let data = ibmAtrackerTarget(config);
  return jsonToTfPrint("resource", "ibm_atracker_target", data.name, data.data);
}

/**
 * format atracker target
 * @param {Object} config
 * @param {Object} config.atracker
 * @param {string} config.atracker.name
 * @param {string} config.atracker.target_name
 * @param {string} config.atracker.bucket
 * @param {string} config.atracker.cos_key
 * @param {string} config.atracker.type
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {Object} terraform atracker target
 */
function ibmAtrackerTarget(config) {
  return {
    name: `${config.atracker.name} ${config.atracker.type} target`,
    data: {
      name: kebabName(config, [config.atracker.name, config.atracker.type]),
      cos_endpoint: [
        {
          endpoint: `s3.private.${varDotRegion}.cloud-object-storage.appdomain.cloud`,
          target_crn: cosRef(config.atracker.target_name),
          bucket: bucketRef(
            config.atracker.target_name,
            config.atracker.bucket
          ),
          api_key: tfRef(
            "ibm_resource_key",
            `${config.atracker.target_name + " object storage"} key ${
              config.atracker.cos_key
            }`,
            "credentials.apikey"
          )
        }
      ],
      region: varDotRegion,
      target_type: "cloud_object_storage"
    }
  };
}

/**
 * format atracker route
 * @param {Object} config
 * @param {Object} config.atracker
 * @param {string} config.atracker.name
 * @param {string} config.atracker.type
 * @param {Array<string>} config.atracker.locations
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {Object} terraform atracker target
 */
function ibmAtrackerRoute(config) {
  let routeData = {
    name: `${config.atracker.name} ${config.atracker.type} route`,
    data: {
      name: kebabName(config, [
        config.atracker.name,
        config.atracker.type,
        "route"
      ]),
      rules: [
        {
          locations: [],
          target_ids: [
            tfRef(
              "ibm_atracker_target",
              `${config.atracker.name} ${config.atracker.type} target`
            )
          ]
        }
      ]
    }
  };
  config.atracker.locations.forEach(location => {
    if (location === config._options.region) {
      routeData.data.rules[0].locations.push(varDotRegion);
    } else routeData.data.rules[0].locations.push(location);
  });
  return routeData;
}

/**
 * format atracker route
 * @param {Object} config
 * @returns {string} terraform atracker target
 */
function formatAtrackerRoute(config) {
  let route = ibmAtrackerRoute(config);
  return jsonToTfPrint(
    "resource",
    "ibm_atracker_route",
    route.name,
    route.data
  );
}

/**
 * atracker terraform
 * @param {Object} config
 * @param {Object} config.atracker
 * @param {string} config.atracker.name
 * @param {string} config.atracker.type
 * @param {Array<string>} config.atracker.locations
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform atracker
 */
function atrackerTf(config) {
  let str = formatAtrackerTarget(config);
  if (config.atracker.add_route) {
    str += formatAtrackerRoute(config);
  }
  return tfBlock("Atracker Resources", str);
}

module.exports = {
  formatAtrackerTarget,
  formatAtrackerRoute,
  atrackerTf,
  ibmAtrackerRoute,
  ibmAtrackerTarget
};
