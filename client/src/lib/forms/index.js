const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback
} = require("./text-callbacks");
const {
  invalidName,
  invalidEncryptionKeyRing
} = require("./invalid-callbacks");
const { propsMatchState } = require("./props-match-state");
const { disableSave } = require("./disable-save");

module.exports = {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidName,
  propsMatchState,
  disableSave,
  invalidNameText,
  invalidEncryptionKeyRing,
  cosResourceHelperTextCallback
};
