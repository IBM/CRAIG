const { revision, carve, contains } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");

/**
 * push to a top level array of object and update
 * @param {lazyZstate} config
 * @param {string} field name of array to update (ex. vpcs)
 * @param {object} data arbitrary data
 */
function pushAndUpdate(config, field, data) {
  config.store.json[field].push(data);
}

/**
 * update an object from an array of objects
 * @param {lazyZstate} config
 * @param {string} field top level field name (ex. vpcs)
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data object data before update
 * @param {string} componentProps.data.name name of object
 */
function updateChild(config, field, stateData, componentProps) {
  new revision(config.store.json).updateChild(
    field,
    componentProps.data.name,
    stateData
  );
}

/**
 * remove an array item from array of objects
 * @param {lazyZstate} config
 * @param {string} field top level field name (ex. vpcs)
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data object data
 * @param {string} componentProps.data.name name of object
 */
function carveChild(config, field, componentProps) {
  carve(config.store.json[field], "name", componentProps.data.name);
}

/**
 * set unfound data from store to null
 * @param {string} storeField name of field in store
 * @param {lazyZstate} state store
 * @param {object} obj arbitrary object
 * @param {string} objectField name of the field within object to check
 */
function setUnfound(storeField, config, obj, objectField) {
  if (!contains(config.store[storeField], obj[objectField])) {
    obj[objectField] = null;
  }
}

/**
 * set unfound resource group to null
 * @param {lazyZstate} state store
 * @param {object} obj arbitrary object
 */
function setUnfoundResourceGroup(config, obj) {
  setUnfound("resourceGroups", config, obj, "resource_group");
}

/**
 * update an object within an array of objects in an array of objects
 * @param {lazyZstate} config state store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child is stored
 * @param {object} componentProps.data object data before update
 * @param {string} componentProps.data.name name of object
 * @param {Function=} callback callback for slz data to run after object update
 */
function updateSubChild(
  config,
  field,
  subField,
  stateData,
  componentProps
  //callback -- commenting out callback until a callback is needed for unit test purposes
) {
  new revision(config.store.json)
    .child(field, componentProps.arrayParentName)
    .updateChild(subField, componentProps.data.name, stateData);
  // .then(() => {
  //   if (callback) callback(config);
  // });
}

/**
 * push to an array of objects within an array of objects
 * @param {lazyZstate} confistate store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child will be stored
 */
function pushToChildField(config, field, subField, stateData, componentProps) {
  new revision(config.store.json)
    .child(field, componentProps.arrayParentName)
    .data[subField].push(stateData);
}

/**
 * delete an object from an array of objects within an array of objects
 * @param {lazyZstate} config state store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child is stored
 * @param {object} componentProps.data object data
 * @param {string} componentProps.data.name name of object
 */
function deleteSubChild(config, field, subField, componentProps) {
  new revision(config.store.json)
    .child(field, componentProps.arrayParentName)
    .child(subField)
    .deleteArrChild(componentProps.data.name);
}

module.exports = {
  pushAndUpdate,
  updateChild,
  carveChild,
  setUnfound,
  setUnfoundResourceGroup,
  updateSubChild,
  pushToChildField,
  deleteSubChild
};
