const { snakeCase } = require("lazy-z");
const { endComment } = require("./constants");
const {
  rgIdRef,
  buildTitleComment,
  kebabName,
  jsonToTf,
  tfRef,
  vpcRef,
} = require("./utils");

/**
 * configure transit gateway
 * @param {Object} tgw
 * @param {string} tgw.name
 * @param {string} tgw.resource_group
 * @param {boolean} tgw.global
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {string} config._options.prefix
 * @returns {string} terraform string
 */
function formatTgw(tgw, config) {
  return jsonToTf(
    "ibm_tg_gateway",
    tgw.name,
    {
      name: kebabName(config, [tgw.name]),
      location: "$region",
      global: tgw.global,
      resource_group: rgIdRef(tgw.resource_group, config),
      _timeouts: {
        create: '"30m"',
        delete: '"30m"',
      },
    },
    config
  );
}

/**
 * configure transit gateway connection
 * @param {Object} connection
 * @param {string} connection.vpc
 * @param {string} connection.tfw
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform string
 */
function formatTgwConnection(connection, config) {
  return jsonToTf(
    "ibm_tg_connection",
    `${connection.tgw} to ${connection.vpc} connection`,
    {
      gateway: tfRef("ibm_tg_gateway", snakeCase(connection.tgw)),
      network_type: '"vpc"',
      name: kebabName(config, [
        connection.tgw,
        connection.vpc,
        "hub-connection",
      ]),
      network_id: vpcRef(connection.vpc, "crn"),
      _timeouts: {
        create: '"30m"',
        delete: '"30m"',
      },
    }
  );
}

/**
 * create transit gateway terraform
 * @param {Object} config
 * @param {Array<Object>} config.transit_gateways
 * @returns {string} terraform string
 */
function tgwTf(config) {
  let tf = "";
  config.transit_gateways.forEach((gw) => {
    tf += buildTitleComment("Transit Gateway", gw.name);
    tf += formatTgw(gw, config);
    gw.connections.forEach(
      (connection) => (tf += formatTgwConnection(connection, config))
    );
    tf += endComment + "\n\n";
  });
  return tf.replace(/\n\n$/g, "\n");
}

module.exports = {
  formatTgw,
  formatTgwConnection,
  tgwTf,
};
