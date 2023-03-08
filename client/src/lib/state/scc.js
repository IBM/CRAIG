const { transpose } = require("lazy-z");

/**
 * init scc
 * @param {lazyZState} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 */
function sccInit(config) {
  config.store.json.scc = {
    credential_description: null,
    id: null,
    passphrase: null,
    name: "",
    location: "us",
    collector_description: null,
    is_public: false,
    scope_description: null
  };
}

/**
 * save scc data
 * @param {lazyZState} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.scc
 * @param {object} stateData component state data
 */
function sccSave(config, stateData) {
  transpose(stateData, config.store.json.scc);
}

module.exports = {
  sccInit,
  sccSave
};
