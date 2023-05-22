const { transpose } = require("lazy-z");

/**
 * initialize atracker
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 */
function atrackerInit(config) {
  // initialize config.json atracker for default patterns
  config.store.json.atracker = {
    enabled: true,
    type: "cos",
    name: "atracker",
    target_name: "atracker-cos",
    bucket: "atracker-bucket",
    add_route: true,
    cos_key: "cos-bind-key",
    locations: ["global", "us-south"],
  };
}

/**
 * atracker on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.atracker
 */
function atrackerOnStoreUpdate(config) {
  let atracker = config.store.json.atracker;
  config.updateUnfound("cosBuckets", atracker, "bucket");
  config.updateUnfound("cosKeys", atracker, "cos_key");
}

/**
 * save atracker
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.atracker
 * @param {object} stateData component state data
 * @param {string} stateData.atracker_key
 */
function atrackerSave(config, stateData) {
  transpose(stateData, config.store.json.atracker);
}

module.exports = {
  atrackerInit,
  atrackerOnStoreUpdate,
  atrackerSave,
};
