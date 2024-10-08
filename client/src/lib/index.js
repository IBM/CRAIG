const {
  propsMatchState,
  disableSave,
  validSshKey,
  invalidSubnetTierName,
  formatConfig,
  getSubnetTierStateData,
  getTierSubnets,
  invalidNewResourceName,
  invalidIpCommaList,
  copyAclModalContent,
  copyRuleCodeMirrorData,
  copySgModalContent,
  forceShowForm,
  disableSshKeyDelete,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidProjectName,
  invalidProjectNameText,
  invalidProjectDescription,
  invalidCidrBlock,
  invalidCrnList,
  invalidCrns,
  wizard,
  classicGatewaysFilter,
  classicBareMetalFilter,
  routingTableFilter,
  classicVsiFilter,
  classicSubnetsFilter,
  getDisplaySubnetTiers,
  getDisplayTierSubnetList,
  shouldDisplayService,
  dynamicToolTipWrapperProps,
  dynamicCraigFormGroupsProps,
  dynamicHeadingProps,
  dynamicTextAreaProps,
  dynamicSelectProps,
  dynamicMultiSelectProps,
  dynamicToggleProps,
  fieldFunctionReturnsBooleanCheck,
  disabledReturnsBooleanCheck,
  invalidReturnsBooleanCheck,
  fieldFunctionReturnsStringCheck,
  groupsEvaluatesToArrayCheck,
  dynamicFieldId,
  addClassName,
  dynamicTextInputProps,
  dynamicPasswordInputProps,
  powerSubnetFilter,
  powerMapFilter,
  aclMapFilter,
  dynamicFetchSelectDataToGroups,
} = require("./forms");
const { slzToCraig } = require("./slz-to-craig");
const validate = require("./validate");
const { docsToMd, allDocs } = require("./docs-to-md");
const { buildSubnet, newF5Vsi } = require("./builders");
const changelogToMarkdown = require("./changelog-to-markdown");
const constants = require("./constants");
const {
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
  tgwTf,
  vpcTf,
  vpeTf,
  vpnTf,
  vsiTf,
  configToFilesJson,
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
  codeMirrorGetDisplay,
  buildTitleComment,
  formatRoutingTable,
  ibmIsVpcRoutingTable,
  ibmIsVpcRoutingTableRoute,
  formatRoutingTableRoute,
  routingTableTf,
  formatCbrZone,
  ibmCbrZone,
  formatCbrRule,
  ibmCbrRule,
  cbrTf,
  vpcModuleJson,
  vpcModuleOutputs,
  formatSecretsManagerSecret,
  formatDnsService,
  formatDnsZone,
  formatDnsRecord,
  formatDnsPermittedNetwork,
  formatDnsCustomResolver,
  dnsTf,
  formatLogdnaInstance,
  formatLogdnaKey,
  formatLogdnaArchive,
  formatLogdnaProvider,
  formatSysdigKey,
  formatSysdigInstance,
  loggingMonitoringTf,
  formatAtrackerInstance,
  formatAtrackerKey,
  formatAtrackerArchive,
  calculateNeededSubnetIps,
  getNextCidr,
  powerVsTf,
  formatClassicSshKey,
  formatClassicNetworkVlan,
  classicInfraTf,
  outputsTf,
  formatClassicSgRule,
  formatClassicSg,
  classicSecurityGroupTf,
  classicVsiTf,
  classicBareMetalTf,
  formatCloudLogs,
  formatCosToCloudLogsAuth,
  cloudLogsTf,
} = require("./json-to-iac");
const releaseNotes = require("./docs/release-notes.json");
const docs = require("./docs/docs.json");
const { state } = require("./state");
const { invalidForms } = require("./invalid-forms");
const { allDocText, filterDocs } = require("./docs");
const {
  dynamicPrimaryButtonProps,
  dynamicSecondaryButtonProps,
  primaryButtonClass,
  statelessWrapperProps,
  tabPanelProps,
  copyRuleFormName,
  docTextFieldParams,
} = require("./components");

module.exports = {
  cloudLogsTf,
  formatCosToCloudLogsAuth,
  formatCloudLogs,
  dynamicPasswordInputProps,
  dynamicToolTipWrapperProps,
  dynamicCraigFormGroupsProps,
  dynamicHeadingProps,
  dynamicTextAreaProps,
  dynamicSelectProps,
  dynamicMultiSelectProps,
  dynamicToggleProps,
  fieldFunctionReturnsBooleanCheck,
  disabledReturnsBooleanCheck,
  invalidReturnsBooleanCheck,
  fieldFunctionReturnsStringCheck,
  groupsEvaluatesToArrayCheck,
  dynamicFieldId,
  addClassName,
  dynamicTextInputProps,
  classicVsiTf,
  classicBareMetalTf,
  classicSecurityGroupTf,
  formatClassicSgRule,
  formatClassicSg,
  outputsTf,
  allDocText,
  filterDocs,
  shouldDisplayService,
  getDisplaySubnetTiers,
  formatClassicSshKey,
  formatClassicNetworkVlan,
  classicInfraTf,
  wizard,
  invalidCrnList,
  formatAtrackerArchive,
  formatAtrackerKey,
  formatAtrackerInstance,
  loggingMonitoringTf,
  formatSysdigInstance,
  formatSysdigKey,
  formatLogdnaInstance,
  formatLogdnaKey,
  formatLogdnaArchive,
  formatLogdnaProvider,
  state,
  buildTitleComment,
  slzToCraig,
  copyRuleCodeMirrorData,
  copyAclModalContent,
  copySgModalContent,
  validate,
  docsToMd,
  allDocs,
  buildSubnet,
  newF5Vsi,
  changelogToMarkdown,
  constants,
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
  tgwTf,
  vpcTf,
  vpeTf,
  vpnTf,
  vsiTf,
  configToFilesJson,
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
  codeMirrorGetDisplay,
  propsMatchState,
  disableSave,
  validSshKey,
  invalidSubnetTierName,
  formatConfig,
  getSubnetTierStateData,
  getTierSubnets,
  invalidNewResourceName,
  invalidIpCommaList,
  docs,
  releaseNotes,
  forceShowForm,
  formatRoutingTable,
  ibmIsVpcRoutingTable,
  ibmIsVpcRoutingTableRoute,
  formatRoutingTableRoute,
  routingTableTf,
  disableSshKeyDelete,
  formatCbrZone,
  ibmCbrZone,
  formatCbrRule,
  ibmCbrRule,
  cbrTf,
  vpcModuleJson,
  vpcModuleOutputs,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidProjectName,
  invalidProjectNameText,
  invalidProjectDescription,
  formatSecretsManagerSecret,
  formatDnsService,
  formatDnsZone,
  formatDnsRecord,
  formatDnsPermittedNetwork,
  formatDnsCustomResolver,
  dnsTf,
  invalidCidrBlock,
  calculateNeededSubnetIps,
  getNextCidr,
  invalidForms,
  invalidCrns,
  powerVsTf,
  getDisplayTierSubnetList,
  classicGatewaysFilter,
  classicBareMetalFilter,
  powerSubnetFilter,
  powerMapFilter,
  aclMapFilter,
  dynamicPrimaryButtonProps,
  dynamicSecondaryButtonProps,
  primaryButtonClass,
  statelessWrapperProps,
  tabPanelProps,
  copyRuleFormName,
  dynamicFetchSelectDataToGroups,
  docTextFieldParams,
  routingTableFilter,
  classicVsiFilter,
  classicSubnetsFilter,
};
