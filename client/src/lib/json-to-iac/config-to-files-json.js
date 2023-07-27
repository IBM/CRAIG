const { prettyJSON } = require("lazy-z");
const { appidTf } = require("./appid");
const { versionsTf, mainTf, logdnaProviders } = require("./constants");
const { atrackerTf } = require("./atracker");
const { clusterTf } = require("./clusters");
const { eventStreamsTf } = require("./event-streams");
const { f5Tf, f5CloudInitYaml } = require("./f5");
const { flowLogsTf } = require("./flow-logs");
const { kmsTf } = require("./key-management");
const { cosTf } = require("./object-storage");
const resourceGroupTf = require("./resource-groups");
const { sccTf } = require("./scc");
const { secretsManagerTf } = require("./secrets-manager");
const { sshKeyTf } = require("./ssh-keys");
const { tgwTf } = require("./transit-gateway");
const { vpcModuleTf } = require("./vpc");
const { vpeTf } = require("./vpe");
const { vpnTf } = require("./vpn");
const { vpnServerTf } = require("./vpn-server");
const { vsiTf, lbTf } = require("./vsi");
const { cbrTf } = require("./cbr");
const { dnsTf } = require("./dns");
const { loggingMonitoringTf } = require("./logging-monitoring");
const { variablesDotTf } = require("./variables");
const { icdTf } = require("./icd");

/**
 * create a json document with file names as keys and text as value
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @returns {JSON} json data
 */
function configToFilesJson(config) {
  try {
    let useF5 = config.f5_vsi && config.f5_vsi.length > 0;
    let files = {
      "main.tf": mainTf.replace("$REGION", `"${config._options.region}"`),
      "flow_logs.tf": flowLogsTf(config),
      "transit_gateways.tf":
        config.transit_gateways.length > 0 ? tgwTf(config) : null,
      "virtual_private_endpoints.tf": vpeTf(config),
      "virtual_servers.tf": config.vsi.length > 0 ? vsiTf(config) : null,
      "clusters.tf": clusterTf(config),
      "vpn_gateways.tf": config.vpn_gateways.length > 0 ? vpnTf(config) : null,
      "vpn_servers.tf":
        config.vpn_servers.length > 0 ? vpnServerTf(config) : null,
      "variables.tf": variablesDotTf(config, useF5),
      "key_management.tf": kmsTf(config) + "\n",
      "object_storage.tf": cosTf(config) + "\n",
      "resource_groups.tf": resourceGroupTf(config),
      "versions.tf": versionsTf.replace(
        /\$ADDITIONAL_PROVIDERS\n/g,
        config?.logdna?.archive
          ? logdnaProviders.replace(
              /\$ALIASES/g,
              config?.atracker?.archive && config?.atracker?.enabled
                ? "logdna.logdna, logdna.atracker"
                : "logdna.logdna"
            )
          : ""
      ),
      "secrets_manager.tf":
        config.secrets_manager.length > 0 ? secretsManagerTf(config) : null,
      "ssh_keys.tf": config.ssh_keys.length > 0 ? sshKeyTf(config) : null,
      "atracker.tf": atrackerTf(config),
      "craig.json": prettyJSON(config),
      "appid.tf": config.appid.length > 0 ? appidTf(config) : null,
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
      "f5_user_data.yaml": useF5 ? f5CloudInitYaml() : null,
      "cbr.tf":
        config.cbr_zones.length > 0 && config.cbr_rules.length > 0
          ? cbrTf(config)
          : null,
      "dns.tf": config.dns && config.dns.length > 0 ? dnsTf(config) : null,
      "observability.tf": loggingMonitoringTf(config),
      "icd.tf": icdTf(config),
    };
    vpcModuleTf(files, config);
    return files;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = {
  configToFilesJson,
};
