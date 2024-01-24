const {
  rgIdRef,
  kebabName,
  tfBlock,
  timeouts,
  jsonToTfPrint,
  tfRef,
} = require("./utils");
const { snakeCase, kebabCase } = require("lazy-z");
const { formatAddressPrefix } = require("./vpc");

/**
 * format vpn gateway terraform
 * @param {Object} gw
 * @param {string} gw.name
 * @param {string} gw.subnet
 * @param {string} gw.vpc
 * @param {string} gw.resource_group
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {object} terrafirn formatted string
 */

function ibmIsVpnGateway(gw, config) {
  let gwData = {
    name: kebabName([gw.vpc, gw.name, "vpn-gw"]),
    subnet: `\${module.${snakeCase(gw.vpc)}_vpc.${snakeCase(gw.subnet)}_id}`,
    resource_group: rgIdRef(gw.resource_group, config),
    mode: gw.policy_mode ? "policy" : undefined,
    tags: config._options.tags,
    timeouts: timeouts("", "", "1h"),
  };
  if (!gwData.mode) {
    delete gwData.mode;
  }
  return {
    name: `${gw.vpc} ${gw.name} vpn gw`,
    data: gwData,
  };
}

/**
 * format vpn gateway terraform
 * @param {Object} gw
 * @param {Object} config
 * @returns {string} terrafirn formatted string
 */
function formatVpn(gw, config) {
  let vpn = ibmIsVpnGateway(gw, config);
  return jsonToTfPrint("resource", "ibm_is_vpn_gateway", vpn.name, vpn.data);
}

/**
 * format vpn gw connection
 * @param {*} connection
 * @param {*} gw parent gateway
 * @returns {string} terraform formatted data
 */
function formatVpnGatewayConnection(connection, gw) {
  return jsonToTfPrint(
    "resource",
    "ibm_is_vpn_gateway_connection",
    `${gw.vpc} ${gw.name} vpn gw connection ${connection.name}`,
    {
      name: kebabName([gw.name, connection.name]),
      vpn_gateway: tfRef("ibm_is_vpn_gateway", `${gw.vpc} ${gw.name} vpn gw`),
      peer_address: connection.peer_address,
      preshared_key: `\${var.${snakeCase(
        gw.name + " " + connection.name
      )}_preshared_key}`,
      local_cidrs: connection.local_cidrs,
      peer_cidrs: connection.peer_cidrs,
    }
  );
}

/**
 * build vpn gw tf
 * @param {Object} config
 * @param {Array<Object>} config.vpn_gateways
 * @returns {string} terraform formatted gw code
 */
function vpnTf(config) {
  let tf = "";
  config.vpn_gateways.forEach((gw) => {
    tf += formatVpn(gw, config);
    if (gw.connections) {
      gw.connections.forEach((connection) => {
        tf += formatVpnGatewayConnection(connection, gw);
      });
    }
    if (gw.additional_prefixes) {
      gw.additional_prefixes.forEach((prefix) => {
        tf += formatAddressPrefix(
          {
            name: `${kebabCase(gw.name)}-on-prem-${prefix.replace(
              /\.|\//g,
              "-"
            )}`,
            vpc: gw.vpc,
            zone: gw.subnet.replace(/.+(?=\d$)/g, ""),
            cidr: prefix,
            prefix: prefix,
          },
          config,
          true
        );
      });
    }
  });
  return tfBlock("VPN gateways", tf);
}

module.exports = {
  formatVpn,
  vpnTf,
  ibmIsVpnGateway,
};
