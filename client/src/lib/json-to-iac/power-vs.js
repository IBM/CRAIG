const { snakeCase } = require("lazy-z");
const {
  jsonToTfPrint,
  kebabName,
  timeouts,
  rgIdRef,
  tfRef,
} = require("./utils");

/**
 * create terraform for resource instance for power vs
 * @param {*} workspace
 * @param {string} workspace.name
 * @param {string} workspace.resource_group
 * @param {*} config
 * @returns {string} terraform formatted resource
 */
function formatPowerVsWorkspace(workspace, config) {
  let data = {
    provider: "${ibm.power_vs}",
    name: kebabName(["power-workspace", workspace.name]),
    service: "power-iaas",
    plan: "power-virtual-server-group",
    location: "${var.power_vs_zone}",
    resource_group_id: rgIdRef(workspace.resource_group, config),
    tags: config._options.tags,
    timeouts: timeouts("6m", "5m", "10m"),
  };
  return jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    "power vs workspace " + workspace.name,
    data
  );
}

/**
 * create a reference to power vs workspace
 * @param {*} workspaceName
 * @returns {string} reference to power vs
 */
function powerVsWorkspaceRef(workspaceName) {
  return tfRef(
    "ibm_resource_instance",
    snakeCase(`power vs workspace ${workspaceName}`),
    "guid"
  );
}

/**
 * create terraform for one power vs ssh key
 * @param {*} key
 * @param {string} key.workspace
 * @param {string} key.name ssh key name
 * @param {string} key.public_key ssh public key
 * @returns {string} terraform formatted resource
 */
function formatPowerVsSshKey(key) {
  let fullKeyName = snakeCase(`power ${key.workspace} ${key.name} key`);
  let data = {
    provider: "${ibm.power_vs}",
    pi_cloud_instance_id: powerVsWorkspaceRef(key.workspace),
    pi_key_name: kebabName([fullKeyName]),
    pi_ssh_key: `\${var.${fullKeyName}}`,
  };
  return jsonToTfPrint(
    "resource",
    "ibm_pi_key",
    snakeCase(`power vs ssh key ${key.name}`),
    data
  );
}

/**
 * format power vs network
 * @param {*} network
 * @param {string} network.name
 * @param {string} network.workspace
 * @param {string} network.pi_cidr
 * @param {Array<string>} network.pi_dns
 * @param {string} network.pi_network_type
 * @param {boolean} network.pi_network_jumbo
 * @returns {string} terrraform formatted resource
 */
function formatPowerVsNetwork(network) {
  return jsonToTfPrint(
    "resource",
    "ibm_pi_network",
    snakeCase(`power network ${network.workspace} ${network.name}`),
    {
      provider: "${ibm.power_vs}",
      pi_cloud_instance_id: powerVsWorkspaceRef(network.workspace),
      pi_network_name: kebabName(["power-network", network.name]),
      pi_cidr: network.pi_cidr,
      pi_network_type: network.pi_network_type,
      pi_network_jumbo: network.pi_network_jumbo,
      pi_dns: network.pi_dns,
    }
  );
}

/**
 * create power vs cloud connection
 * @param {*} connection
 * @param {string} connection.name
 * @param {string} connection.workspace
 * @param {number} connection.pi_cloud_connection_speed
 * @param {boolean} connection.pi_cloud_connection_global_routing
 * @param {boolean} connection.pi_cloud_connection_metered
 * @param {boolean} connection.pi_cloud_connection_transit_enabled
 * @returns {string} terraform formatted resource
 */
function formatPowerVsCloudConnection(connection) {
  return jsonToTfPrint(
    "resource",
    "ibm_pi_cloud_connection",
    snakeCase(
      `power network ${connection.workspace} connection ${connection.name}`
    ),
    {
      provider: "${ibm.power_vs}",
      pi_cloud_instance_id: powerVsWorkspaceRef(connection.workspace),
      pi_cloud_connection_name: kebabName([
        "power-network",
        connection.name,
        "connection",
      ]),
      pi_cloud_connection_speed: connection.pi_cloud_connection_speed,
      pi_cloud_connection_global_routing:
        connection.pi_cloud_connection_global_routing,
      pi_cloud_connection_metered: connection.pi_cloud_connection_metered,
      pi_cloud_connection_transit_enabled:
        connection.pi_cloud_connection_transit_enabled,
    }
  );
}

module.exports = {
  formatPowerVsWorkspace,
  formatPowerVsSshKey,
  formatPowerVsNetwork,
  formatPowerVsCloudConnection,
};
