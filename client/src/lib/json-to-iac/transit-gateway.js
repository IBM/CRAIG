const { snakeCase, isNullOrEmptyString } = require("lazy-z");
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
  let data = tgw.use_data
    ? {
        name: tgw.name,
      }
    : {
        name: kebabName([tgw.name]),
        location: varDotRegion,
        global: tgw.global,
        resource_group: rgIdRef(tgw.resource_group, config),
        timeouts: timeouts("30m", "", "30m"),
      };
  return {
    name: (tgw.use_data ? "data_" : "") + tgw.name,
    data: data,
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
  return jsonToTfPrint(
    tgw.use_data ? "data" : "resource",
    "ibm_tg_gateway",
    tf.name,
    tf.data
  );
}

/**
 * configure transit gateway connection
 * @param {Object} connection
 * @param {Object} config
 * @returns {string} terraform string
 */

function ibmTgConnection(connection, tgw) {
  let connectionName = connection.power
    ? connection.power
    : connection.gateway
    ? connection.gateway + " unbound gre"
    : connection.crn
    ? connection.crn.replace(/.+vpc:/g, "")
    : connection.vpc;
  let connectionResourceName = kebabName(
    [connection.tgw]
      .concat(connection.power ? "power" : [])
      .concat([connectionName, "hub-connection"])
  );
  let networkId = connection.power
    ? `\${ibm_resource_instance.power_vs_workspace_${snakeCase(
        connection.power
      )}.resource_crn}`
    : connection.vpc
    ? vpcRef(connection.vpc, "crn", true)
    : connection.crn;
  let connectionData = {
    name: `${connection.tgw} to ${
      (connection.power ? "power_workspace_" : "") + connectionName
    } connection`,
    data: {
      gateway: tfRef(
        "ibm_tg_gateway",
        snakeCase((tgw.use_data ? "data_" : "") + connection.tgw),
        "id",
        tgw.use_data
      ),
      network_type: connection.gateway
        ? "unbound_gre_tunnel"
        : connection.power
        ? "power_virtual_server"
        : "vpc",
      name: connectionResourceName,
      network_id: networkId,
      timeouts: timeouts("30m", "", "30m"),
    },
  };
  if (connection.gateway) {
    connectionData.data.base_network_type = "classic";
    connectionData.data.remote_bgp_asn = isNullOrEmptyString(
      connection.remote_bgp_asn,
      true
    )
      ? undefined
      : connection.remote_bgp_asn;
    connectionData.data.zone = "${var.region}-" + connection.zone;
    ["local_gateway_ip", "remote_gateway_ip"].forEach((field) => {
      connectionData.data[
        field
      ] = `\${ibm_network_gateway.classic_gateway_${snakeCase(
        connection.gateway
      )}.${field === "local_gateway_ip" ? "private" : "public"}_ipv4_address}`;
    });
    connectionData.data.local_tunnel_ip = connection.local_tunnel_ip;
    connectionData.data.remote_tunnel_ip = connection.remote_tunnel_ip;
  }
  return connectionData;
}
/**
 * configure transit gateway connection
 * @param {Object} connection
 * @param {Object} tgw
 * @returns {string} terraform string
 */
function formatTgwConnection(connection, tgw) {
  let tf = ibmTgConnection(connection, tgw);
  return jsonToTfPrint("resource", "ibm_tg_connection", tf.name, tf.data);
}

/**
 * create prefix filter
 * @param {*} filter
 * @param {*} tgw
 * @returns {string} filter terraform
 */
function formatTgwPrefixFilter(filter, tgw) {
  return jsonToTfPrint(
    "resource",
    "ibm_tg_connection_prefix_filter",
    `${filter.name} ${filter.tgw} to ${
      filter.connection_type === "power" ? "power workspace " : ""
    }${filter.target} ${
      filter.connection_type === "gre" ? "unbound gre " : ""
    }connection filter`,
    {
      gateway: tfRef(
        "ibm_tg_gateway",
        snakeCase((tgw.use_data ? "data_" : "") + filter.tgw),
        "id",
        tgw.use_data
      ),
      connection_id: tfRef(
        "ibm_tg_connection",
        `${filter.tgw} to ${
          filter.connection_type === "power" ? "power workspace " : ""
        }${filter.target} ${
          filter.connection_type === "gre" ? "unbound gre " : ""
        }connection`,
        "connection_id"
      ),
      action: filter.action,
      prefix: filter.prefix,
      le: filter.le,
      ge: filter.ge,
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
  config.transit_gateways.forEach((gw, index) => {
    let blockData = formatTgw(gw, config);
    gw.connections.forEach(
      (connection) => (blockData += formatTgwConnection(connection, gw))
    );
    if (gw.gre_tunnels) {
      gw.gre_tunnels.forEach(
        (tunnel) => (blockData += formatTgwConnection(tunnel, gw))
      );
    }
    if (gw.prefix_filters) {
      gw.prefix_filters.forEach((filter) => {
        blockData += formatTgwPrefixFilter(filter, gw);
      });
    }
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
  formatTgwPrefixFilter,
};
