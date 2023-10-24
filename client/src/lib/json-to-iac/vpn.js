const {
  rgIdRef,
  kebabName,
  tfBlock,
  timeouts,
  jsonToTfPrint,
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
  return {
    name: `${gw.vpc} ${gw.name} vpn gw`,
    data: {
      name: kebabName([gw.vpc, gw.name, "vpn-gw"]),
      subnet: `\${module.${snakeCase(gw.vpc)}_vpc.${snakeCase(gw.subnet)}_id}`,
      resource_group: rgIdRef(gw.resource_group, config),
      tags: config._options.tags,
      timeouts: timeouts("", "", "1h"),
    },
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
 * build vpn gw tf
 * @param {Object} config
 * @param {Array<Object>} config.vpn_gateways
 * @returns {string} terraform formatted gw code
 */
function vpnTf(config) {
  let tf = "";
  config.vpn_gateways.forEach((gw) => {
    tf += formatVpn(gw, config);
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
