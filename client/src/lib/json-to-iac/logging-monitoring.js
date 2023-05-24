const {
  rgIdRef,
  bucketRef,
  cosRef,
  jsonToTfPrint,
  tfBlock,
} = require("./utils");
const { jsonToTf } = require("json-to-tf");

/**
 * format logdna instance terraform
 * @param {*} config
 * @param {object} config.logdna
 * @param {string} config.logdna.resource_group
 * @param {string} config.logdna.plan
 * @param {boolean} config.logdna.platform_logs
 * @param {string} config.logdna.endpoints
 * @returns {object} terraform
 */

function ibmResourceInstanceLogdna(config) {
  let instance = {
    name: "logdna",
    data: {
      name: "${var.prefix}-logdna",
      resource_group_id: rgIdRef(config.logdna.resource_group, config),
      service: "logdna",
      plan: config.logdna.plan,
      location: "${var.region}",
      service_endpoints: config._options.endpoints,
      tags: config._options.tags,
    },
  };
  if (config.logdna.platform_logs) {
    instance.data.parameters = {
      default_receiver: true,
    };
  }
  return instance;
}

/**
 * format sysdig instance terraform
 * @param {*} config
 * @param {object} config.sysdig
 * @param {string} config.sysdig.resource_group
 * @param {string} config.sysdig.plan
 * @param {boolean} config.sysdig.platform_logs
 * @param {string} config.sysdig.endpoints
 * @returns {object} terraform
 */

function ibmResourceInstanceSysdig(config) {
  let instance = {
    name: "sysdig",
    data: {
      name: "${var.prefix}-sysdig",
      resource_group_id: rgIdRef(config.sysdig.resource_group, config),
      service: "sysdig-monitor",
      plan: config.sysdig.plan,
      location: "${var.region}",
      service_endpoints: config._options.endpoints,
      tags: config._options.tags,
    },
  };
  if (config.sysdig.platform_logs) {
    instance.data.parameters = {
      default_receiver: true,
    };
  }
  return instance;
}

/**
 * format atracker instance terraform
 * @param {*} config
 * @param {object} config.atracker
 * @param {string} config.atracker.resource_group
 * @param {string} config.atracker.plan
 * @returns {object} terraform
 */

function ibmResourceInstanceAtracker(config) {
  let instance = {
    name: "atracker",
    data: {
      name: "${var.prefix}-${var.region}-atracker",
      resource_group_id: rgIdRef(config.atracker.resource_group, config),
      service: "logdnaat",
      plan: config.atracker.plan,
      location: "${var.region}",
      service_endpoints: config._options.endpoints,
      tags: config._options.tags,
    },
  };
  return instance;
}

/**
 * format atracker instance terraform
 * @param {*} config
 * @param {object} config.atracker
 * @returns {string} terraform
 */
function formatAtrackerInstance(config) {
  let instance = ibmResourceInstanceAtracker(config);
  return jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    instance.name,
    instance.data
  );
}

/**
 * format logdna instance terraform
 * @param {*} config
 * @param {object} config.logdna
 * @param {string} config.logdna.resource_group
 * @param {string} config.logdna.plan
 * @param {boolean} config.logdna.platform_logs
 * @param {string} config.logdna.endpoints
 * @returns {string} terraform
 */
function formatLogdnaInstance(config) {
  let instance = ibmResourceInstanceLogdna(config);
  return jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    instance.name,
    instance.data
  );
}

/**
 * format sysdig instance terraform
 * @param {*} config
 * @param {object} config.sysdig
 * @param {string} config.sysdig.resource_group
 * @param {string} config.sysdig.plan
 * @param {boolean} config.sysdig.platform_logs
 * @param {string} config.sysdig.endpoints
 * @returns {string} terraform
 */
function formatSysdigInstance(config) {
  let instance = ibmResourceInstanceSysdig(config);
  return jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    instance.name,
    instance.data
  );
}

/**
 * format logdna key terraform
 * @param {*} config
 * @param {object} config.logdna
 * @param {string} config.logdna.role
 * @returns {string} terraform
 */
function formatLogdnaKey(config) {
  return jsonToTfPrint("resource", "ibm_resource_key", "logdna_key", {
    name: "${var.prefix}-logdna-key",
    resource_instance_id: "${ibm_resource_instance.logdna.id}",
    role: config.logdna.role,
    tags: config._options.tags,
  });
}

/**
 * format logdna archive terraform
 * @param {*} config
 * @param {object} config.logdna
 * @param {string} config.logdna.cos
 * @param {string} config.logdna.bucket
 * @returns {string} terraform
 */
function formatLogdnaArchive(config) {
  return jsonToTfPrint("resource", "logdna_archive", "logdna_archive", {
    provider: "${logdna.logdna}",
    integration: "ibm",
    ibm_config: [
      {
        apikey: "${var.ibmcloud_api_key}",
        bucket: bucketRef(
          config.logdna.cos,
          config.logdna.bucket,
          "bucket_name"
        ),
        endpoint: bucketRef(
          config.logdna.cos,
          config.logdna.bucket,
          `s3_endpoint_${config._options.endpoints}`
        ),
        resourceinstanceid: cosRef(config.logdna.cos),
      },
    ],
  });
}

/**
 * format atracker archive terraform
 * @param {*} config
 * @returns {string} terraform
 */
function formatAtrackerArchive(config) {
  return jsonToTfPrint("resource", "logdna_archive", "atracker_archive", {
    provider: "${logdna.atracker}",
    integration: "ibm",
    ibm_config: [
      {
        apikey: "${var.ibmcloud_api_key}",
        bucket: bucketRef(
          config.atracker.target_name,
          config.atracker.bucket,
          "bucket_name"
        ),
        endpoint: bucketRef(
          config.atracker.target_name,
          config.atracker.bucket,
          `s3_endpoint_${config._options.endpoints}`
        ),
        resourceinstanceid: cosRef(config.atracker.target_name),
      },
    ],
  });
}

/**
 * create logdna provider
 * @param {*} alias
 * @returns {string} terraform
 */
function formatLogdnaProvider(alias) {
  return (
    "\n" +
    jsonToTf(
      JSON.stringify({
        provider: {
          logdna: [
            {
              alias: alias,
              servicekey: `\${ibm_resource_key.${alias}_key.credentials["service_key"]}`,
              url: "https://api.${var.region}.logging.cloud.ibm.com",
            },
          ],
        },
      })
    ) +
    "\n"
  );
}

/**
 * format sysdig key terraform
 * @param {*} config
 * @returns {string} terraform
 */
function formatSysdigKey(config) {
  return jsonToTfPrint("resource", "ibm_resource_key", "sysdig_key", {
    name: "${var.prefix}-sysdig-key",
    resource_instance_id: "${ibm_resource_instance.sysdig.id}",
    role: "Manager",
    tags: config._options.tags,
  });
}

/**
 * format atracker key terraform
 * @param {*} config
 * @returns {string} terraform
 */
function formatAtrackerKey(config) {
  return jsonToTfPrint("resource", "ibm_resource_key", "atracker_key", {
    name: "${var.prefix}-${var.region}-atracker-key",
    resource_instance_id: "${ibm_resource_instance.atracker.id}",
    role: "Manager",
    tags: config._options.tags,
  });
}

/**
 * create logging and monitoring terraform
 * @param {*} config
 * @returns {string} terraform code
 */
function loggingMonitoringTf(config) {
  let tf = "";
  // if atracker is enabled and an instance will be created create instance and key
  if (config?.atracker?.enabled && config?.atracker?.instance) {
    let atrackerTf = formatAtrackerInstance(config) + formatAtrackerKey(config);
    tf += tfBlock("Atracker Instance", atrackerTf);
  }
  if (config?.logdna?.enabled) {
    if (tf.length > 0) tf += "\n"; // if atracker add space
    let logdnaTf = formatLogdnaInstance(config) + formatLogdnaKey(config);
    tf += tfBlock("LogDNA Instance", logdnaTf);
    if (config.logdna.archive) {
      let logdnaProviderTf =
        formatLogdnaProvider("logdna") + formatLogdnaArchive(config);
      // if atracker is enabled and has archive add code
      if (config?.atracker?.archive && config?.atracker.enabled) {
        logdnaProviderTf +=
          formatLogdnaProvider("atracker") + formatAtrackerArchive(config);
      }
      tf += "\n" + tfBlock("LogDNA Resources", logdnaProviderTf);
    }
  }
  if (config?.sysdig?.enabled) {
    if (tf.length > 0) tf += "\n"; // if atracker or logdna add newline
    let sysdigTf = formatSysdigInstance(config) + formatSysdigKey(config);
    tf += tfBlock("Sysdig Instance", sysdigTf);
  }
  return tf.replace(/ D N A/g, "DNA");
}

module.exports = {
  formatLogdnaInstance,
  formatLogdnaKey,
  formatLogdnaArchive,
  formatLogdnaProvider,
  formatSysdigKey,
  formatSysdigInstance,
  loggingMonitoringTf,
  formatAtrackerInstance,
  formatAtrackerKey,
  formatAtrackerArchive,
};
