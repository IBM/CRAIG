const { snakeCase } = require("lazy-z");
const {
  rgIdRef,
  dataResourceName,
  tfBlock,
  getTags,
  jsonToTfPrint,
  cdktfRef,
  getResourceOrData
} = require("./utils");

/**
 * create ssh key terraform
 * @param {Object} key
 * @param {string} key.name
 * @param {string} key.resource_group
 * @param {boolean} key.use_data
 * @param {Object} config
 * @returns {object} terraform string
 */

function ibmIsSshKey(key, config) {
  let sshKey = {
    name: key.name,
    data: {
      name: dataResourceName(key)
    }
  };
  if (!key.use_data) {
    sshKey.data.public_key = cdktfRef(`var.${snakeCase(key.name)}_public_key`);
    sshKey.data.resource_group = rgIdRef(key.resource_group, config);
    sshKey.data.tags = getTags(config);
  }
  return sshKey;
}

/**
 * create ssh key terraform
 * @param {Object} key
 * @param {Object} config
 * @returns {string} terraform string
 */
function formatSshKey(key, config) {
  let sshKey = ibmIsSshKey(key, config);
  return jsonToTfPrint(
    getResourceOrData(key),
    "ibm_is_ssh_key",
    sshKey.name,
    sshKey.data
  );
}

/**
 * build ssh key terraform
 * @param {Object} config
 * @param {Array<Object>} config.ssh_keys
 * @returns {string} terraform code
 */
function sshKeyTf(config) {
  let tf = "";
  config.ssh_keys.forEach(key => (tf += formatSshKey(key, config)));
  return tfBlock("ssh keys", tf);
}

module.exports = {
  formatSshKey,
  sshKeyTf,
  ibmIsSshKey
};
