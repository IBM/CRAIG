const { snakeCase } = require("lazy-z");
const { endComment } = require("./constants");
const {
  rgIdRef,
  buildTitleComment,
  jsonToTf,
  dataResourceName,
} = require("./utils");

/**
 * create ssh key terraform
 * @param {Object} key
 * @param {string} key.name
 * @param {string} key.resource_group
 * @param {boolean} key.use_data
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform string
 */
function formatSshKey(key, config) {
  let sshKey = {
    name: dataResourceName(key, config),
  };
  if (!key.use_data) {
    sshKey.public_key = `var.${snakeCase(key.name)}_public_key`;
    sshKey.resource_group = rgIdRef(key.resource_group, config);
    sshKey.tags = true;
  }
  return jsonToTf(`ibm_is_ssh_key`, key.name, sshKey, config, key.use_data);
}

/**
 * build ssh key terraform
 * @param {Object} config
 * @param {Array<Object>} config.ssh_keys
 * @returns {string} terraform code
 */
function sshKeyTf(config) {
  let tf = buildTitleComment("ssh", "keys").replace(/Ssh/g, "SSH");
  config.ssh_keys.forEach((key) => (tf += formatSshKey(key, config)));
  return tf + endComment + "\n";
}

module.exports = {
  formatSshKey,
  sshKeyTf,
};
