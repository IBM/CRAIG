const { appidTf } = require("./appid");
const { atrackerTf } = require("./atracker");
const { clusterTf } = require("./clusters");
const { eventStreamsTf } = require("./event-streams");
const { f5Tf, f5CloudInitYaml } = require("./f5");
const { flowLogsTf } = require("./flow-logs");
const { formatIamAccountSettings, iamTf } = require("./iam");
const { kmsTf } = require("./key-management");
const { cosTf } = require("./object-storage");
const resourceGroupTf = require("./resource-groups");
const { sccTf } = require("./scc");
const { secretsManagerTf } = require("./secrets-manager");
const { sgTf } = require("./security-groups");
const { sshKeyTf } = require("./ssh-keys");
const { teleportTf, teleportCloudInit } = require("./teleport");
const { tgwTf } = require("./transit-gateway");
const { tfBlock, tfDone } = require("./utils");
const {
  vpcTf,
  formatVpc,
  formatAcl,
  formatAclRule,
  formatPgw,
  formatSubnet
} = require("./vpc");
const { vpeTf } = require("./vpe");
const { vpnTf } = require("./vpn");
const { vsiTf, lbTf } = require("./vsi");

module.exports = {
  formatPgw,
  formatSubnet,
  formatAcl,
  formatAclRule,
  tfDone,
  formatVpc,
  tfBlock,
  iamTf,
  formatIamAccountSettings,
  resourceGroupTf,
  lbTf,
  teleportCloudInit,
  appidTf,
  atrackerTf,
  clusterTf,
  eventStreamsTf,
  f5Tf,
  f5CloudInitYaml,
  flowLogsTf,
  kmsTf,
  cosTf,
  sccTf,
  secretsManagerTf,
  sgTf,
  sshKeyTf,
  teleportTf,
  tgwTf,
  vpcTf,
  vpeTf,
  vpnTf,
  vsiTf
};
