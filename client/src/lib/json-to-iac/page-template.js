const { tfDone, tfBlock } = require("./utils");
const {
  formatSubnet,
  formatVpc,
  formatAcl,
  formatAclRule,
  formatPgw
} = require("./vpc");
const { formatFlowLogs } = require("./flow-logs");
const { eventStreamsTf } = require("./event-streams");
const { formatIamAccountSettings } = require("./iam");

/**
 * code mirror display function for vpc
 * @param {*} config
 * @returns vpc terraform data
 */
function codeMirrorVpcTf(config) {
  let tf = "";
  config.vpcs.forEach(vpc => {
    let blockData = formatVpc(vpc, config);
    if (vpc.publicGateways.length !== 0) {
      vpc.public_gateways.forEach(gateway => {
        blockData += formatPgw(gateway, config);
      });
    }
    tf +=
      tfBlock(vpc.name + " vpc", blockData) +
      "\n" +
      tfBlock(vpc.name + " flow logs", formatFlowLogs(vpc, config)) +
      "\n";
  });
  return tfDone(tf);
}

/**
 * code mirror display function for vpc access control
 * @param {*} config
 * @returns vpc access control terraform data
 */
function codeMirrorAclTf(config) {
  let tf = "";
  config.vpcs.forEach(vpc => {
    let blockData = "";
    vpc.acls.forEach(acl => {
      blockData += formatAcl(acl, config);
      acl.rules.forEach(rule => {
        blockData += formatAclRule(rule);
      });
    });
    tf += tfBlock(vpc.name + " vpc", blockData) + "\n";
  });
  return tfDone(tf);
}

/**
 * code mirror display function for vpc subnets
 * @param {*} config
 * @returns vpc subnets terraform data
 */
function codeMirrorSubnetsTf(config) {
  let tf = "";
  config.vpcs.forEach(vpc => {
    let blockData = "";
    vpc.subnets.forEach(subnet => {
      blockData += formatSubnet(subnet, config);
    });
    tf += tfBlock(vpc.name + " vpc", blockData) + "\n";
  });
  return tfDone(tf);
}

/**
 * format event streams tf
 * @param {Object} config
 * @returns event streams terraform data
 */
function codeMirrorEventStreamsTf(config) {
  if (config.event_streams.length > 0) return eventStreamsTf(config);
  return "";
}

/**
 * format iam account settings tf
 * @param {JSON} config
 * @returns iam account settings terraform data
 */
function codeMirrorFormatIamAccountSettingsTf(config) {
  return formatIamAccountSettings(config.iam_account_settings);
}

module.exports = {
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf
};
