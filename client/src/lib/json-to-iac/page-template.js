const { tfDone, tfBlock } = require("./utils");
const { formatSubnet, formatVpc, formatAcl, formatPgw } = require("./vpc");
const { formatFlowLogs } = require("./flow-logs");
const { eventStreamsTf } = require("./event-streams");
const { formatIamAccountSettings } = require("./iam");
const {
  maskFieldsExpStep1ReplacePublicKey,
  maskFieldsExpStep2ReplaceTmosAdminPassword,
  maskFieldsExpStep3ReplaceLicensePassword,
  maskFieldsExpStep4HideValue,
  maskFieldsExpStep5CleanUp,
} = require("../constants");
const { prettyJSON } = require("lazy-z");

/**
 * code mirror display function for vpc
 * @param {*} config
 * @returns vpc terraform data
 */
function codeMirrorVpcTf(config) {
  let tf = "";
  config.vpcs.forEach((vpc) => {
    let blockData = formatVpc(vpc, config);
    if (vpc.publicGateways.length !== 0) {
      vpc.public_gateways.forEach((gateway) => {
        blockData += formatPgw(gateway, config);
      });
    }
    tf +=
      tfBlock(vpc.name + " VPC", blockData) +
      "\n" +
      (vpc.bucket === "$disabled"
        ? ""
        : tfBlock(vpc.name + " flow logs", formatFlowLogs(vpc, config)) + "\n");
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
  config.vpcs.forEach((vpc) => {
    let blockData = "";
    vpc.acls.forEach((acl) => {
      blockData += formatAcl(acl, config, true);
    });
    tf += tfBlock(vpc.name + " VPC", blockData) + "\n";
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
  config.vpcs.forEach((vpc) => {
    let blockData = "";
    vpc.subnets.forEach((subnet) => {
      blockData += formatSubnet(subnet, config);
    });
    tf += tfBlock(vpc.name + " VPC", blockData) + "\n";
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

/**
 * format codeMirror tf
 * @param {JSON} json
 * @param {boolean} jsonInCodeMirror
 * @param {string} path
 * @param {function} toTf
 * @param {string} jsonField
 * @returns codeMirror terraform data
 */
function codeMirrorGetDisplay(json, jsonInCodeMirror, path, toTf, jsonField) {
  if (jsonInCodeMirror) {
    if (path === "/form/nacls") {
      let allAcls = [];
      json.vpcs.forEach((nw) => {
        allAcls = allAcls.concat(nw.acls);
      });
      return prettyJSON(allAcls);
    } else if (path === "/form/subnets") {
      let allSubnets = [];
      json.vpcs.forEach((nw) => {
        allSubnets = allSubnets.concat(nw.subnets);
      });
      return prettyJSON(allSubnets);
    } else if (path === "/form/cbr") {
      let allCbr = [];
      allCbr = allCbr.concat({ cbr_zones: json.cbr_zones });
      allCbr = allCbr.concat({ cbr_rules: json.cbr_rules });
      return prettyJSON(allCbr);
    } else if (path === "/form/observability") {
      let obsrv = {};
      obsrv.logdna = json.logdna;
      obsrv.sysdig = json.sysdig;
      return prettyJSON(obsrv);
    }
    return prettyJSON(json[jsonField] || json) // if pageObj.jsonField is undefined - aka, home page
      .replace(maskFieldsExpStep1ReplacePublicKey, "public_key%%%%")
      .replace(
        maskFieldsExpStep2ReplaceTmosAdminPassword,
        json.f5_vsi[0]?.tmos_admin_password
          ? "tmos_admin_password%%%%"
          : "tmos_admin_password"
      )
      .replace(
        maskFieldsExpStep3ReplaceLicensePassword,
        json.f5_vsi[0]?.license_password !== "null"
          ? "license_password%%%%"
          : "license_password"
      )
      .replace(maskFieldsExpStep4HideValue, '": "****************************')
      .replace(maskFieldsExpStep5CleanUp, "public_key"); // remove any extraneous %%%% from setting fields to null
  } else if (toTf) {
    return toTf(json).replace(/\[\n\s*\]/g, "[]");
  } else return prettyJSON(json);
}

module.exports = {
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
  codeMirrorGetDisplay,
};
