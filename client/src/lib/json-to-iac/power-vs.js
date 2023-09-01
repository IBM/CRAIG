const { snakeCase } = require("lazy-z");
const {
  jsonToTfPrint,
  kebabName,
  timeouts,
  rgIdRef,
  tfRef,
} = require("./utils");
const { RegexButWithWords } = require("regex-but-with-words");

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
 * format power vs cloud connection name
 * @param {*} connection
 * @returns {string} name for cloud connection
 */
function formatCloudConnectionName(connection) {
  return kebabName(["power-network", connection.name, "connection"]);
}

/**
 * format power vs cloud connection resource name
 * @param {*} connection
 * @returns {string} resource name for cloud connection
 */
function formatCloudConnectionResourceName(connection) {
  return snakeCase(
    `power network ${connection.workspace} connection ${connection.name}`
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
    formatCloudConnectionResourceName(connection),
    {
      provider: "${ibm.power_vs}",
      pi_cloud_instance_id: powerVsWorkspaceRef(connection.workspace),
      pi_cloud_connection_name: formatCloudConnectionName(connection),
      pi_cloud_connection_speed: connection.pi_cloud_connection_speed,
      pi_cloud_connection_global_routing:
        connection.pi_cloud_connection_global_routing,
      pi_cloud_connection_metered: connection.pi_cloud_connection_metered,
      pi_cloud_connection_transit_enabled:
        connection.pi_cloud_connection_transit_enabled,
    }
  );
}

/**
 * create power vs image
 * @param {*} image
 * @param {string} image.workspace
 * @param {string} image.pi_image_id 
 * @param {string} image.name
 * @returns {string} terraform formatted resource
 */
function formatPowerVsImage(image) {
  return jsonToTfPrint(
    "resource",
    "ibm_pi_image",
    snakeCase(
      `power image ${image.workspace} ${image.name}`
    ),
    {
      provider: "${ibm.power_vs}",
      pi_cloud_instance_id: powerVsWorkspaceRef(image.workspace),
      pi_image_id: image.pi_image_id,
      pi_image_name: image.name,
      timeouts: timeouts("9m"),
    }
  );
}

/**
 * create a data source for cloud connection
 * @param {*} connection
 * @returns {string} terraform formatted resource
 */
function formatCloudConnectionDataSource(connection) {
  let connectionResourceName = formatCloudConnectionResourceName(connection);
  let dlConnectionRef = `\${data.ibm_dl_gateway.${connectionResourceName}}`;
  return (
    jsonToTfPrint("data", "ibm_dl_gateway", connectionResourceName, {
      provider: "${ibm.power_vs}",
      name: formatCloudConnectionName(connection),
      depends_on: [`\${ibm_pi_cloud_connection.${connectionResourceName}}`],
    }) +
    jsonToTfPrint("resource", "time_sleep", connectionResourceName + "_sleep", {
      create_duration: "120s",
      triggers: {
        crn: dlConnectionRef.replace(
          new RegexButWithWords().literal("}").stringEnd().done("g"),
          ".crn}"
        ),
      },
      depends_on: [dlConnectionRef],
    })
  );
}

/**
 * create power vs to tgw connection terraform
 * @param {*} connection
 * @param {string} connection.gateway
 * @returns {string} terraform formatted code
 */
function formatPowerToTransitGatewayConnection(connection) {
  let connectionResourceName = formatCloudConnectionResourceName(connection);
  return jsonToTfPrint(
    "resource",
    "ibm_tg_connection",
    `${connection.gateway}_connection_${connectionResourceName}`,
    {
      provider: "${ibm.power_vs}",
      gateway: `\${ibm_tg_gateway.${snakeCase(connection.gateway)}.id}`,
      network_type: "directlink",
      name: kebabName([
        connection.gateway,
        "to",
        connection.name,
        "connection",
      ]),
      network_id: `\${time_sleep.${connectionResourceName}_sleep.triggers["crn"]}`,
      depends_on: [`\${ibm_pi_cloud_connection.${connectionResourceName}}`],
    }
  );
}

module.exports = {
  formatPowerVsWorkspace,
  formatPowerVsSshKey,
  formatPowerVsNetwork,
  formatPowerVsCloudConnection,
  formatPowerVsImage,
  formatCloudConnectionDataSource,
  formatPowerToTransitGatewayConnection,
};
