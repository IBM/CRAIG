const {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete
} = require("./resource-groups");
const state = require("./store");
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
  updateChild
};
