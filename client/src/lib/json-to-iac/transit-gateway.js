const { snakeCase } = require("lazy-z");
const {
  rgIdRef,
  kebabName,
  jsonToIac,
  tfRef,
  vpcRef,
  tfBlock,
  tfDone
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
  return jsonToIac(
    "ibm_tg_gateway",
    tgw.name,
    {
      name: kebabName(config, [tgw.name]),
      location: "$region",
      global: tgw.global,
      resource_group: rgIdRef(tgw.resource_group, config),
      timeouts: {
        create: "30m",
        delete: "30m"
      }
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
  return jsonToIac(
    "ibm_tg_connection",
    `${connection.tgw} to ${connection.vpc} connection`,
    {
      gateway: tfRef("ibm_tg_gateway", snakeCase(connection.tgw)),
      network_type: '"vpc"',
      name: kebabName(config, [
        connection.tgw,
        connection.vpc,
        "hub-connection"
      ]),
      network_id: vpcRef(connection.vpc, "crn"),
      timeouts: {
        create: "30m",
        delete: "30m"
      }
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
  config.transit_gateways.forEach(gw => {
    let blockData = formatTgw(gw, config);
    gw.connections.forEach(
      connection => (blockData += formatTgwConnection(connection, config))
    );
    tf += tfBlock(gw.name + " Transit Gateway", blockData);
  });
  return tfDone(tf);
}

module.exports = {
  formatTgw,
  formatTgwConnection,
  tgwTf
};
