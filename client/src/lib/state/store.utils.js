const { revision, carve } = require("lazy-z");

/**
 * push to a top level array of object and update
 * @param {slzStateStore} slz
 * @param {string} field name of array to update (ex. vpcs)
 * @param {object} data arbitrary data
 */
function pushAndUpdate(slz, field, data) {
  slz.store.configDotJson[field].push(data);
}

/**
 * update an object from an array of objects
 * @param {slzStateStore} slz landing zone store
 * @param {string} field top level field name (ex. vpcs)
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data object data before update
 * @param {string} componentProps.data.name name of object
 */
function updateChild(slz, field, stateData, componentProps) {
  new revision(slz.store.configDotJson).updateChild(
    field,
    componentProps.data.name,
    stateData
  );
}

/**
 * remove an array item from array of objects
 * @param {slzStateStore} slz landing zone store
 * @param {string} field top level field name (ex. vpcs)
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data object data
 * @param {string} componentProps.data.name name of object
 */
function carveChild(slz, field, componentProps) {
  carve(slz.store.configDotJson[field], "name", componentProps.data.name);
}

module.exports = {
  pushAndUpdate,
  updateChild,
  carveChild
};
