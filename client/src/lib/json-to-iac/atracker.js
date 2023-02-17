const { endComment } = require("./constants");
const {
  buildTitleComment,
  kebabName,
  tfRef,
  cosRef,
  bucketRef,
  jsonToTf,
  tfArrRef,
} = require("./utils");

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
 * @returns {string} terraform atracker target
 */
function formatAtrackerTarget(config) {
  let targetValues = {
    name: kebabName(config, [config.atracker.name, config.atracker.type]),
    target_type: '"cloud_object_storage"',
    region: "$region",
  };
  // if (config.atracker.type === "cos")
  targetValues._cos_endpoint = {
    endpoint: `"s3.private.${config._options.region}.cloud-object-storage.appdomain.cloud"`,
    target_crn: cosRef(config.atracker.target_name),
    bucket: bucketRef(config.atracker.target_name, config.atracker.bucket),
    api_key: tfRef(
      "ibm_resource_key",
      `${config.atracker.target_name + " object storage"} key ${
        config.atracker.cos_key
      }`,
      "credentials.apikey"
    ),
  };
  return jsonToTf(
    "ibm_atracker_target",
    `${config.atracker.name} ${config.atracker.type} target`,
    targetValues,
    config
  );
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
 * @returns {string} terraform atracker target
 */
function formatAtrackerRoute(config) {
  return jsonToTf(
    "ibm_atracker_route",
    `${config.atracker.name} ${config.atracker.type} route`,
    {
      name: kebabName(config, [
        config.atracker.name,
        config.atracker.type,
        "route",
      ]),
      _rules: {
        target_ids: tfArrRef(
          "ibm_atracker_target",
          `${config.atracker.name} ${config.atracker.type} target`
        ),
        locations: JSON.stringify(config.atracker.locations),
      },
    }
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
  let tf = buildTitleComment("Atracker", "Resources");
  tf += formatAtrackerTarget(config);
  if (config.atracker.add_route) {
    tf += formatAtrackerRoute(config);
  }
  return tf + endComment;
}

module.exports = {
  formatAtrackerTarget,
  formatAtrackerRoute,
  atrackerTf,
};
