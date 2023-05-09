const { transpose, eachKey } = require("lazy-z");

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
    scope_description: null,
    enable: false
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
  if (stateData.enable === false && stateData.scope_description) {
    stateData.enable = true;
  }
  transpose(stateData, config.store.json.scc);
}

/**
 * delete scc
 * @param {lazyZState} config state
 */
function sccDelete(config) {
  eachKey(config.store.json.scc, key => {
    if (key !== "enable" && key !== "is_public")
      config.store.json.scc[key] = null;
    else config.store.json.scc[key] = false;
  });
}

module.exports = {
  sccInit,
  sccSave,
  sccDelete
};
