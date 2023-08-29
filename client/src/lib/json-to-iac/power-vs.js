const { jsonToTfPrint, kebabName, timeouts, rgIdRef } = require("./utils");

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

module.exports = {
  formatPowerVsWorkspace,
};
