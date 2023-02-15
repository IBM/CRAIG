const {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete
} = require("./resource-groups");
const { optionsInit, optionsSave } = require("./options");
const state = require("./state");
const { pushAndUpdate, carveChild, updateChild } = require("./store.utils");

module.exports = {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete,
  state,
  pushAndUpdate,
  carveChild,
  updateChild,
  optionsInit,
  optionsSave
};
