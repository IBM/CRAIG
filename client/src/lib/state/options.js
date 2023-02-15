const { updateChild } = require("./store.utils");

/**
 * initialize options
 * @param {lazyZstate} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function optionsInit(config) {
  config.store.json._options = {
    prefix: "iac",
    region: "us-south",
    tags: ["hello", "world"]
  };
}

/**
 * update existing options
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function optionsSave(config, stateData, componentProps) {
  updateChild(config, "_options", stateData, componentProps);
}

module.exports = {
  optionsInit,
  optionsSave
};
