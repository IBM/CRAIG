const { snakeCase, kebabCase, isNullOrEmptyString } = require("lazy-z");
const { rgIdRef, tfBlock, jsonToTfPrint } = require("./utils");
/**
 * format vpn server
 * @param {Object} server
 * @param {string} server.name
 * @param {string} server.certificate_crn
 * @param {string} server.method
 * @param {string} server.client_ca_crn
 * @param {string} server.client_ip_pool
 * @param {string} server.client_dns_server_ips
 * @param {number} server.client_idle_timeout
 * @param {boolean} server.enable_split_tunneling
 * @param {number} server.port
 * @param {string} server.protocol
 * @param {string} server.resource_group
 * @param {Array<string>} server.security_groups
 * @param {Array<string>} server.subnets
 * @param {string} server.vpc
 * @param {Object} craig
 * @param {string} craig._options.prefix
 * @returns {Object} terraform formatted server
 */

function ibmIsVpnServer(server, craig) {
  let serverData = {
    certificate_crn: server.certificate_crn,
    client_authentication: [{ method: server.method }],
    client_dns_server_ips: isNullOrEmptyString(server.client_dns_server_ips)
      ? null
      : server.client_dns_server_ips.split(","),
    client_idle_timeout: isNullOrEmptyString(server.client_idle_timeout)
      ? null
      : server.client_idle_timeout,
    client_ip_pool: server.client_ip_pool,
    enable_split_tunneling: server.enable_split_tunneling,
    name: kebabCase(
      `${craig._options.prefix} ${server.vpc} ${server.name} server`
    ),
    port: server.port,
    protocol: server.protocol,
    resource_group: rgIdRef(server.resource_group, craig),
    subnets: [],
    security_groups: [],
  };
  server.subnets.forEach((subnet) => {
    serverData["subnets"].push(
      `\${module.${snakeCase(server.vpc)}_vpc.${snakeCase(subnet)}_id}`
    );
  });
  server.security_groups.forEach((group) => {
    serverData["security_groups"].push(
      `\${module.${snakeCase(server.vpc)}_vpc.${snakeCase(group)}_id}`
    );
  });
  if (server.method === "certificate") {
    serverData.client_authentication[0].client_ca_crn = server.client_ca_crn;
  } else {
    serverData.client_authentication[0].identity_provider = "iam";
  }
  return {
    name: snakeCase(`${server.vpc} vpn server ${server.name}`),
    data: serverData,
  };
}

/**
 * format vpn server
 * @param {Object} server
 * @param {string} server.name
 * @param {Object} route
 * @param {string} route.name
 * @param {string} route.action
 * @param {string} route.destination
 * @param {string} server.vpc
 * @param {Object} craig
 * @param {string} craig._options.prefix
 * @returns {Object} terraform formatted server
 */
function ibmIsVpnServerRoute(server, route, craig) {
  let routeData = {
    name: `${craig._options.prefix}-${kebabCase(server.vpc)}-${kebabCase(
      route.name
    )}-route`,
    action: route.action,
    destination: route.destination,
    vpn_server: `\${ibm_is_vpn_server.${snakeCase(
      server.vpc
    )}_vpn_server_${snakeCase(server.name)}.id}`,
  };
  return {
    name: snakeCase(`${server.vpc} vpn server route ${route.name}`),
    data: routeData,
  };
}

/**
 * format vpn server
 * @param {Object} server
 * @param {Object} config
 * @returns {string} terraform formatted vsi
 */
function formatVpnServer(server, config) {
  let data = ibmIsVpnServer(server, config);
  return jsonToTfPrint("resource", "ibm_is_vpn_server", data.name, data.data);
}

/**
 * format vpn server route
 * @param {Object} server
 * @param {Object} config
 * @param {Object} route
 * @returns {string} terraform formatted vsi
 */
function formatVpnServerRoute(server, route, config) {
  let data = ibmIsVpnServerRoute(server, route, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_vpn_server_route",
    data.name,
    data.data
  );
}

/**
 * build vpn server tf
 * @param {Object} config
 * @param {Array<Object>} config.vpn_servers
 * @returns {string} terraform formatted vpn server code
 */
function vpnServerTf(config) {
  let tf = "";
  config.vpn_servers.forEach((server) => {
    tf += formatVpnServer(server, config);
    server.routes.forEach((route) => {
      tf += formatVpnServerRoute(server, route, config);
    });
  });
  return tf === "" ? "" : tfBlock("vpn servers", tf);
}

module.exports = {
  formatVpnServer,
  formatVpnServerRoute,
  vpnServerTf,
  ibmIsVpnServer,
  ibmIsVpnServerRoute,
};
