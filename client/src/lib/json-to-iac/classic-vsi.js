const { snakeCase } = require("lazy-z");
const { jsonToTfPrint, kebabName, tfBlock } = require("./utils");

/**
 * format classic vsi
 * @param {*} vsi
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function formatClassicVsi(vsi, config) {
  let vsiData = {
    hostname: kebabName([vsi.name]),
    datacenter: vsi.datacenter,
    domain: vsi.domain,
    cores: Number(vsi.cores),
    memory: Number(vsi.memory),
    image_id: vsi.image_id,
    local_disk: vsi.local_disk,
    network_speed: Number(vsi.network_speed),
    private_network_only: vsi.private_network_only,
    private_vlan_id: `\${ibm_network_vlan.classic_vlan_${snakeCase(
      vsi.private_vlan,
    )}.id}`,
    public_vlan_id: vsi.private_network_only
      ? undefined
      : `\${ibm_network_vlan.classic_vlan_${snakeCase(vsi.public_vlan)}.id}`,
    public_security_group_ids: vsi.private_network_only ? undefined : [],
    private_security_group_ids: [],
    ssh_key_ids: [],
  };
  vsi.private_security_groups.forEach((sg) => {
    vsiData.private_security_group_ids.push(
      `\${ibm_security_group.classic_securtiy_group_${snakeCase(sg)}.id}`,
    );
  });
  if (!vsi.private_network_only) {
    vsi.public_security_groups.forEach((sg) => {
      vsiData.public_security_group_ids.push(
        `\${ibm_security_group.classic_securtiy_group_${snakeCase(sg)}.id}`,
      );
    });
  }
  vsi.ssh_keys.forEach((key) => {
    vsiData.ssh_key_ids.push(
      `\${ibm_compute_ssh_key.classic_ssh_key_${snakeCase(key)}.id}`,
    );
  });
  vsiData.tags = config._options.tags;
  return jsonToTfPrint(
    "resource",
    "ibm_compute_vm_instance",
    `classic_vsi_${snakeCase(vsi.name)}`,
    vsiData,
  );
}

/**
 * create classic vsi tf
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function classicVsiTf(config) {
  let tf = "";
  if (config.classic_vsi) {
    config.classic_vsi.forEach((vsi) => {
      tf += formatClassicVsi(vsi, config);
    });
  }
  return tf.length === 0 ? null : tfBlock(`Classic VSI`, tf);
}

module.exports = {
  formatClassicVsi,
  classicVsiTf,
};
