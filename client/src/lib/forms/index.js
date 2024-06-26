const { invalidProjectNameText } = require("./text-callbacks");
const {
  validSshKey,
  invalidCrnList,
  invalidSubnetTierName,
  invalidNewResourceName,
  invalidIpCommaList,
  isValidUrl,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidProjectName,
  invalidProjectDescription,
  invalidCbrRule,
  invalidCbrZone,
  invalidCrns,
} = require("./invalid-callbacks");
const { propsMatchState } = require("./props-match-state");
const {
  disableSave,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
} = require("./disable-save");
const { getSubnetTierStateData, getTierSubnets } = require("./state-data");
const {
  formatConfig,
  copyAclModalContent,
  copyRuleCodeMirrorData,
  copySgModalContent,
} = require("./format-json");
const { leftNavItemClassName } = require("./class-names");
const { notificationText } = require("./utils");
const wizard = require("./wizard");
const {
  classicGatewaysFilter,
  classicBareMetalFilter,
  classicVsiFilter,
  classicSubnetsFilter,
  getDisplaySubnetTiers,
  getDisplayTierSubnetList,
  shouldDisplayService,
  powerSubnetFilter,
  powerMapFilter,
  routingTableFilter,
  aclMapFilter,
} = require("./diagrams");
const {
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
  dynamicFetchSelectDataToGroups,
} = require("./dynamic-form-fields");

module.exports = {
  powerSubnetFilter,
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
  shouldDisplayService,
  getDisplayTierSubnetList,
  getDisplaySubnetTiers,
  wizard,
  leftNavItemClassName,
  notificationText,
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
  isValidUrl,
  disableSshKeyDelete,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidCrnList,
  invalidProjectName,
  invalidProjectDescription,
  invalidCbrRule,
  invalidCbrZone,
  invalidCidrBlock,
  invalidProjectNameText,
  invalidCrns,
  classicGatewaysFilter,
  classicBareMetalFilter,
  classicVsiFilter,
  powerMapFilter,
  aclMapFilter,
  dynamicFetchSelectDataToGroups,
  routingTableFilter,
  classicSubnetsFilter,
};
