const { snakeCase } = require("lazy-z");
const { jsonToTfPrint, kebabName, tfBlock } = require("./utils");

/**
 * format network gateway appliance
 * @param {*} gateway
 * @returns {string} terraform for
 */
function formatNetworkGateway(gateway) {
  let gatewayData = {
    name: kebabName([gateway.name]),
    members: [],
  };

  (gateway.hadr ? ["1", "2"] : ["1"]).forEach((member) => {
    let newGatewayMember = {
      hostname: kebabName([gateway.hostname, member]).replace(
        /\$\{var.prefix\}-/g,
        ""
      ),
      datacenter: gateway.datacenter,
      network_speed: gateway.network_speed,
      private_network_only: gateway.private_network_only,
      tcp_monitoring: gateway.tcp_monitoring,
      redundant_network: gateway.redundant_network,
      public_bandwidth: gateway.public_bandwidth,
      memory: gateway.memory,
      notes: gateway.notes,
      ipv6_enabled: gateway.ipv6_enabled,
      private_vlan: `\${ibm_network_vlan.classic_vlan_${snakeCase(
        gateway.private_vlan
      )}.id}`,
      public_vlan: `\${ibm_network_vlan.classic_vlan_${snakeCase(
        gateway.public_vlan
      )}.id}`,
      package_key_name: gateway.package_key_name,
      os_key_name: gateway.os_key_name,
      process_key_name: gateway.process_key_name,
      ssh_key_ids: [
        `\${ibm_compute_ssh_key.classic_ssh_key_${snakeCase(
          gateway.ssh_key
        )}.id}`,
      ],
      disk_key_names: gateway.disk_key_names,
    };
    gatewayData.members.push(newGatewayMember);
  });

  return jsonToTfPrint(
    "resource",
    "ibm_network_gateway",
    "classic_gateway_" + snakeCase(gateway.name),
    gatewayData
  );
}

/**
 * create terraform file for gateways
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function classicGatewayTf(config) {
  let gwTf = "";
  (config.classic_gateways || []).forEach((gateway) => {
    gwTf += tfBlock(
      gateway.name + " Classic Gateway",
      formatNetworkGateway(gateway)
    );
  });
  return gwTf === "" ? null : gwTf;
}

module.exports = {
  formatNetworkGateway,
  classicGatewayTf,
};
