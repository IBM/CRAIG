const { snakeCase } = require("lazy-z");
const { jsonToTfPrint, kebabName, tfBlock } = require("./utils");

/**
 * format classic bare metal servers
 * @param {*} vsi
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function formatClassicBareMetal(server, config) {
  let bareMetalData = {
    package_key_name: server.package_key_name,
    process_key_name: server.process_key_name,
    os_key_name: server.os_key_name,
    memory: server.memory || 64,
    hostname: kebabName([server.name]),
    domain: server.domain,
    datacenter: server.datacenter,
    network_speed: server.network_speed || 100,
    public_bandwidth: server.private_network_only
      ? undefined
      : server.public_bandwidth || 500,
    disk_key_names: server.disk_key_names,
    hourly_billing: false,
    private_network_only: server.private_network_only,
    private_vlan_id: `\${ibm_network_vlan.classic_vlan_${snakeCase(
      server.private_vlan
    )}.id}`,
    public_vlan_id: server.private_network_only
      ? undefined
      : `\${ibm_network_vlan.classic_vlan_${snakeCase(server.public_vlan)}.id}`,
  };

  return jsonToTfPrint(
    "resource",
    "ibm_compute_bare_metal",
    server.name,
    bareMetalData
  );
}

/**
 * create classic bare metal tf
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function classicBareMetalTf(config) {
  let tf = "";
  if (config.classic_bare_metal) {
    config.classic_bare_metal.forEach((server) => {
      tf += formatClassicBareMetal(server, config);
    });
  }
  return tf.length === 0 ? null : tfBlock(`Classic Bare Metal Servers`, tf);
}

module.exports = {
  formatClassicBareMetal,
  classicBareMetalTf,
};
