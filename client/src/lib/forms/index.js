const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  aclHelperTextCallback,
  invalidSubnetTierText,
  iamAccountSettingInvalidText,
  invalidSecurityGroupRuleText,
  clusterHelperTestCallback,
  accessGroupPolicyHelperTextCallback
} = require("./text-callbacks");
const {
  invalidName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  validSshKey,
  invalidIamAccountSettings,
  invalidTagList,
  invalidSubnetTierName,
  invalidSecurityGroupRuleName,
  invalidNewResourceName,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  invalidF5Vsi,
  isValidUrl
} = require("./invalid-callbacks");
const { propsMatchState } = require("./props-match-state");
const {
  disableSave,
  invalidPort,
  forceShowForm,
  disableSshKeyDelete
} = require("./disable-save");
const { hasDuplicateName } = require("./duplicate-name");
const { getSubnetTierStateData, getTierSubnets } = require("./state-data");

const {
  formatConfig,
  copyAclModalContent,
  copyRuleCodeMirrorData,
  copySgModalContent
} = require("./format-json");

module.exports = {
  hasDuplicateName,
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidName,
  propsMatchState,
  disableSave,
  clusterHelperTestCallback,
  invalidNameText,
  invalidEncryptionKeyRing,
  cosResourceHelperTextCallback,
  invalidSshPublicKey,
  validSshKey,
  invalidPort,
  invalidTagList,
  aclHelperTextCallback,
  invalidSubnetTierName,
  invalidSubnetTierText,
  formatConfig,
  getSubnetTierStateData,
  getTierSubnets,
  iamAccountSettingInvalidText,
  invalidIamAccountSettings,
  invalidSecurityGroupRuleName,
  invalidSecurityGroupRuleText,
  invalidNewResourceName,
  invalidIpCommaList,
  copyAclModalContent,
  copyRuleCodeMirrorData,
  copySgModalContent,
  forceShowForm,
  accessGroupPolicyHelperTextCallback,
  invalidIdentityProviderURI,
  invalidF5Vsi,
  isValidUrl,
  disableSshKeyDelete
};
