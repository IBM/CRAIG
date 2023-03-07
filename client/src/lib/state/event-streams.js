const {
  pushAndUpdate,
  updateChild,
  carveChild,
  setUnfoundResourceGroup
} = require("./store.utils");

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
  pushAndUpdate(config, "event_streams", stateData);
}

/**
 * update existing eventStreams
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function eventStreamsSave(config, stateData, componentProps) {
  updateChild(config, "event_streams", stateData, componentProps);
}

/**
 * delete resource group
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function eventStreamsDelete(config, stateData, componentProps) {
  carveChild(config, "event_streams", componentProps);
}

module.exports = {
  eventStreamsOnStoreUpdate,
  eventStreamsCreate,
  eventStreamsSave,
  eventStreamsDelete
};
