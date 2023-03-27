const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  aclHelperTextCallback,
  invalidSubnetTierText,
  iamAccountSettingInvalidText,
  invalidSecurityGroupRuleText
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
  invalidNewResourceName
} = require("./invalid-callbacks");
const { propsMatchState } = require("./props-match-state");
const { disableSave, invalidPort } = require("./disable-save");
const { hasDuplicateName } = require("./duplicate-name");
const { getSubnetTierStateData, getTierSubnets } = require("./state-data");

module.exports = {
  hasDuplicateName,
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidName,
  propsMatchState,
  disableSave,
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
  getSubnetTierStateData,
  getTierSubnets,
  iamAccountSettingInvalidText,
  invalidIamAccountSettings,
  invalidSecurityGroupRuleName,
  invalidSecurityGroupRuleText,
  invalidNewResourceName
};
