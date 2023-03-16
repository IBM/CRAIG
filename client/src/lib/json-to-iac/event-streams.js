const {
  jsonToIac,
  kebabName,
  rgIdRef,
  tfBlock
} = require("./utils");

/**
 * create event streams terraform
 * @param {Object} eventStreams
 * @param {string} eventStreams.name
 * @param {string} eventStreams.plan
 * @param {string} eventStreams.resource_group
 * @param {string} eventStreams.endpoints can be public private or public-and-private
 * @param {Array<string>} eventStreams.private_ip_allowlist
 * @param {string} eventStreams.throughput
 * @param {string} eventStreams.storage_size
 * @param {Object} config
 * @returns {string} terraform formatted string
 */
function formatEventStreams(eventStreams, config) {
  let eventStreamsValues = {
    name: kebabName(config, [eventStreams.name]),
    service: "^messagehub",
    plan: `"${eventStreams.plan}"`,
    location: "$region",
    resource_group_id: rgIdRef(eventStreams.resource_group, config),
    "^parameters": {
      "service-endpoints": `"${eventStreams.endpoints}"`
    },
    timeouts: {
      create: "3h",
      update: "1h",
      delete: "1h"
    }
  };
  if (eventStreams.private_ip_allowlist) {
    eventStreamsValues["^parameters"].private_ip_allowlist = `"${JSON.stringify(
      eventStreams.private_ip_allowlist
    ).replace(/\"/g, "")}"`; // remove quotes to match intended params
  }
  ["throughput", "storage_size"].forEach(field => {
    if (eventStreams[field]) {
      eventStreamsValues["^parameters"][field] = `"${eventStreams[field]}"`;
    }
  });
  return jsonToIac(
    "ibm_resource_instance",
    `${eventStreams.name} es`,
    eventStreamsValues,
    config
  );
}
/**
 * format event streams tf
 * @param {Object} config
 * @param {Array<Object>} config.event_streams
 * @returns {string} terraform
 */
function eventStreamsTf(config) {
  let blockData = "";
  config.event_streams.forEach(instance => {
    blockData += formatEventStreams(instance, config);
  });
  return tfBlock("Event Streams", blockData);
}

module.exports = {
  formatEventStreams,
  eventStreamsTf
};
