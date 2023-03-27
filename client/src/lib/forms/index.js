const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  aclHelperTextCallback,
  invalidSubnetTierText
} = require("./text-callbacks");
const {
  invalidName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  invalidSubnetTierName,
  invalidTagList,
  validSshKey
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
  getTierSubnets
};
