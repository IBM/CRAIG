const { snakeCase, titleCase } = require("lazy-z");
const { appidTf } = require("./appid");
const { atrackerTf } = require("./atracker");
const { clusterTf } = require("./clusters");
const { versionsTf, mainTf, variablesTf } = require("./constants");
const { eventStreamsTf } = require("./event-streams");
const { f5Tf, f5CloudInitYaml } = require("./f5");
const { flowLogsTf } = require("./flow-logs");
const { kmsTf } = require("./key-management");
const { cosTf } = require("./object-storage");
const resourceGroupTf = require("./resource-groups");
const { sccTf } = require("./scc");
const { secretsManagerTf } = require("./secrets-manager");
const { sgTf } = require("./security-groups");
const { sshKeyTf } = require("./ssh-keys");
const { teleportTf, teleportCloudInit } = require("./teleport");
const { tgwTf } = require("./transit-gateway");
const { vpcTf } = require("./vpc");
const { vpeTf } = require("./vpe");
const { vpnTf } = require("./vpn");
const { vsiTf, lbTf } = require("./vsi");

/**
 * create a json document with file names as keys and text as value
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @returns {JSON} json data
 */
function configToFilesJson(config) {
  let additionalVariables = "";
  let useF5 = config.f5_vsi && config.f5_vsi.length > 0;
  if (config.ssh_keys.length > 0) {
    config.ssh_keys.forEach(key => {
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
    if (useF5) {
      additionalVariables += `
variable "tmos_admin_password" {
  description = "F5 TMOS Admin Password"
  type        = string
  sensitive   = true
  default     = "${config.f5_vsi[0].template.tmos_admin_password}"
}
`;
    }
  }

  let useTeleport = config.teleport_vsi.length > 0;
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
    "teleport_vsi.tf": useTeleport ? teleportTf(config) : null,
    "cloud-init.tpl": useTeleport ? teleportCloudInit() : null,
    "scc.tf": config.scc.name === "" ? null : sccTf(config),
    "event_streams.tf":
      config.event_streams && config.event_streams.length > 0
        ? eventStreamsTf(config)
        : null,
    "load_balancers.tf":
      config.load_balancers && config.load_balancers.length > 0
        ? lbTf(config)
        : null,
    "f5_big_ip.tf": useF5 ? f5Tf(config) : null,
    "f5_user_data.yaml": useF5 ? f5CloudInitYaml() : null
  };
  return files;
}

module.exports = {
  configToFilesJson
};
