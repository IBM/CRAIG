const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  resourceGroupInvalidTextCallback
} = require("./text-callbacks");
const { invalidResourceGroupNameCallback } = require("./invalid-callbacks");
const { propsMatchState } = require("./props-match-state");
const { disableSave } = require("./disable-save");

module.exports = {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidResourceGroupNameCallback,
  resourceGroupInvalidTextCallback,
  propsMatchState,
  disableSave
};
