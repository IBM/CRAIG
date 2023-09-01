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
    pi_cloud_instance_id: tfRef(
      "ibm_resource_instance",
      snakeCase(`power vs workspace ${key.workspace}`),
      "guid"
    ),
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

module.exports = {
  formatPowerVsWorkspace,
  formatPowerVsSshKey,
};
