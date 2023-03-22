const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  aclHelperTextCallback
} = require("./text-callbacks");
const {
  invalidName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  validSshKey
} = require("./invalid-callbacks");
const { propsMatchState } = require("./props-match-state");
const { disableSave, invalidPort } = require("./disable-save");
const { hasDuplicateName } = require("./duplicate-name");

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
  aclHelperTextCallback
};
