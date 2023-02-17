const { endComment } = require("./constants");
const {
  rgIdRef,
  buildTitleComment,
  jsonToTf,
  kebabName,
  subnetRef
} = require("./utils");

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
 * @returns {string} terrafirn formatted string
 */
function formatVpn(gw, config) {
  return jsonToTf(
    "ibm_is_vpn_gateway",
    `${gw.vpc} ${gw.name} vpn gw`,
    {
      name: kebabName(config, [gw.vpc, gw.name, "vpn-gw"]),
      subnet: subnetRef(gw.vpc, gw.subnet),
      resource_group: rgIdRef(gw.resource_group, config),
      tags: true,
      _timeouts: {
        delete: '"1h"'
      }
    },
    config
  );
}

/**
 * build vpn gw tf
 * @param {Object} config
 * @param {Array<Object>} config.vpn_gateways
 * @returns {string} terraform formatted gw code
 */
function vpnTf(config) {
  let tf = buildTitleComment("Vpn", "gateways");
  config.vpn_gateways.forEach(gw => (tf += formatVpn(gw, config)));
  return tf + endComment + "\n";
}

module.exports = {
  formatVpn,
  vpnTf
};
