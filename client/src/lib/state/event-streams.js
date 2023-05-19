const { setUnfoundResourceGroup } = require("./store.utils");

/**
 * event streams on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.event_streams
 */
function eventStreamsOnStoreUpdate(config) {
  config.store.json.event_streams.forEach(eventStreams => {
    setUnfoundResourceGroup(config, eventStreams);
  });
}

/**
 * create a new eventStreams instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function eventStreamsCreate(config, stateData) {
  config.push(["json", "event_streams"], stateData);
}

/**
 * update existing eventStreams
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function eventStreamsSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "event_streams"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function eventStreamsDelete(config, stateData, componentProps) {
  config.carve(["json", "event_streams"], componentProps.data.name);
}

module.exports = {
  eventStreamsOnStoreUpdate,
  eventStreamsCreate,
  eventStreamsSave,
  eventStreamsDelete
};
