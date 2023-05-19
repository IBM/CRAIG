const { snakeCase } = require("lazy-z");
const {
  rgIdRef,
  kebabName,
  tfRef,
  vpcRef,
  tfBlock,
  tfDone,
  timeouts,
  jsonToTfPrint,
} = require("./utils");
const { varDotRegion } = require("../constants");

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
 * @returns {object} terraform string
 */
function ibmTgGateway(tgw, config) {
  return {
    name: tgw.name,
    data: {
      name: kebabName([tgw.name]),
      location: varDotRegion,
      global: tgw.global,
      resource_group: rgIdRef(tgw.resource_group, config),
      timeouts: timeouts("30m", "", "30m"),
    },
  };
}

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
  let tf = ibmTgGateway(tgw, config);
  return jsonToTfPrint("resource", "ibm_tg_gateway", tf.name, tf.data);
}

/**
 * configure transit gateway connection
 * @param {Object} connection
 * @param {Object} config
 * @returns {string} terraform string
 */

function ibmTgConnection(connection, config) {
  let vpcName = connection.crn
    ? connection.crn.replace(/.+vpc:/g, "")
    : connection.vpc;
  return {
    name: `${connection.tgw} to ${vpcName} connection`,
    data: {
      gateway: tfRef("ibm_tg_gateway", snakeCase(connection.tgw)),
      network_type: "vpc",
      name: kebabName([connection.tgw, vpcName, "hub-connection"]),
      network_id: connection.vpc
        ? vpcRef(connection.vpc, "crn", true)
        : connection.crn,
      timeouts: timeouts("30m", "", "30m"),
    },
  };
}
/**
 * configure transit gateway connection
 * @param {Object} connection
 * @param {Object} config
 * @returns {string} terraform string
 */
function formatTgwConnection(connection, config) {
  let tf = ibmTgConnection(connection, config);
  return jsonToTfPrint("resource", "ibm_tg_connection", tf.name, tf.data);
}

/**
 * create transit gateway terraform
 * @param {Object} config
 * @param {Array<Object>} config.transit_gateways
 * @returns {string} terraform string
 */
function tgwTf(config) {
  let tf = "";
  config.transit_gateways.forEach((gw, index) => {
    let blockData = formatTgw(gw, config);
    gw.connections.forEach(
      (connection) => (blockData += formatTgwConnection(connection, config))
    );
    tf += tfBlock(gw.name + " Transit Gateway", blockData);
    if (index !== config.transit_gateways.length - 1) {
      tf += "\n";
    }
  });
  return tfDone(tf);
}

module.exports = {
  formatTgw,
  formatTgwConnection,
  tgwTf,
  ibmTgConnection,
  ibmTgGateway,
};
