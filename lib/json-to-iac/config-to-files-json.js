const { snakeCase, titleCase } = require("lazy-z");
const { appidTf } = require("./appid");
const { atrackerTf } = require("./atracker");
const { clusterTf } = require("./clusters");
const { versionsTf, mainTf, variablesTf } = require("./constants");
const { flowLogsTf } = require("./flow-logs");
const { kmsTf } = require("./key-management");
const { cosTf } = require("./object-storage");
const resourceGroupTf = require("./resource-groups");
const { sccTf } = require("./scc");
const { secretsManagerTf } = require("./secrets-manager");
const { sgTf } = require("./security-groups");
const { sshKeyTf } = require("./ssh-keys");
const { teleportTf } = require("./teleport");
const { tgwTf } = require("./transit-gateway");
const { vpcTf } = require("./vpc");
const { vpeTf } = require("./vpe");
const { vpnTf } = require("./vpn");
const { vsiTf } = require("./vsi");

/**
 * create a json document with file names as keys and text as value
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @returns {JSON} json data
 */
function configToFilesJson(config) {
  let additionalVariables = "";
  if (config.ssh_keys.length > 0) {
    config.ssh_keys.forEach((key) => {
      additionalVariables += `
variable "${snakeCase(key.name)}_public_key" {
  description = "Public SSH Key Value for ${titleCase(key.name).replace(
    /Ssh/g,
    "SSH"
  )}"
  type        = string
  sensitive   = true
  default     = "${key.public_key}"
}
`;
    });
  }
  let files = {
    "versions.tf": versionsTf,
    "main.tf": mainTf.replace("$REGION", `"${config._options.region}"`),
    "variables.tf": variablesTf.replace(
      "$ADDITIONAL_VALUES",
      additionalVariables
    ),
    "vpc.tf": vpcTf(config) + "\n",
    "key_management.tf": kmsTf(config) + "\n",
    "object_storage.tf": cosTf(config) + "\n",

    "atracker.tf": atrackerTf(config),
    "resource_groups.tf": resourceGroupTf(config),
    "flow_logs.tf": flowLogsTf(config),
    "virtual_private_endpoints.tf": vpeTf(config),
    "security_groups.tf": sgTf(config),
    "vpn_gateways.tf": vpnTf(config),
    "ssh_keys.tf": sshKeyTf(config),
    "transit_gateways.tf": tgwTf(config),
    "clusters.tf": clusterTf(config),
    "virtual_servers.tf": vsiTf(config),
    "secrets_manager.tf":
      config.secrets_manager.length > 0 ? secretsManagerTf(config) : null,
    "appid.tf": config.appid.length > 0 ? appidTf(config) : null,
    "teleport_vsi.tf": config.teleport_vsi.length > 0 ? teleportTf(config) : null,
    "scc.tf": config.scc.name === "" ? null : sccTf(config)
  };
  return files;
}

module.exports = {
  configToFilesJson,
};
