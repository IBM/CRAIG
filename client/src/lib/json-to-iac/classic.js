const { snakeCase, distinct, splat, azsort } = require("lazy-z");
const { jsonToTfPrint, getTags, kebabName, tfBlock } = require("./utils");

/**
 * format classic ssh key
 * @param {*} sshKey
 * @returns {string} terraform formtted string
 */
function formatClassicSshKey(sshKey) {
  return jsonToTfPrint(
    "resource",
    "ibm_compute_ssh_key",
    `classic ssh key ${sshKey.name}`,
    {
      provider: `\${ibm.classic}`,
      label: sshKey.name,
      public_key: snakeCase(`\${var.classic_${sshKey.name}_public_key}`),
    }
  );
}

/**
 * format classic vlan
 * @param {*} vlan
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function formatClassicNetworkVlan(vlan, config) {
  return jsonToTfPrint(
    "resource",
    "ibm_network_vlan",
    `classic vlan ${vlan.name}`,
    {
      provider: `\${ibm.classic}`,
      name: kebabName([vlan.name]),
      datacenter: vlan.datacenter,
      type: vlan.type,
      tags: getTags(config),
    }
  );
}

/**
 * create classic infra page
 * @param {*} config
 * @returns {string} terraform formatted classic code
 */
function classicInfraTf(config) {
  // get list of distinct alphabetically sorted zones
  let classicZones = distinct(
    splat(config.classic_ssh_keys, "datacenter").concat(
      splat(config.classic_vlans, "datacenter")
    )
  ).sort(azsort);
  let tf = "";

  classicZones.forEach((zone) => {
    let sshKeyTf = "";
    config.classic_ssh_keys.forEach((key) => {
      if (key.datacenter === zone) {
        sshKeyTf += formatClassicSshKey(key);
      }
    });
    if (sshKeyTf !== "") tf += tfBlock(zone + " SSH Keys", sshKeyTf) + "\n";
    let vlanTf = "";
    config.classic_vlans.forEach((vlan) => {
      if (vlan.datacenter === zone) {
        vlanTf += formatClassicNetworkVlan(vlan, config);
      }
    });
    if (vlanTf !== "") tf += tfBlock(zone + " VLANs", vlanTf) + "\n";
  });

  return tf.replace(/\n$/, "");
}

module.exports = {
  formatClassicSshKey,
  formatClassicNetworkVlan,
  classicInfraTf,
};
