const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal
} = require("./store.utils");

/**
 * initialize cbr rules in store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function cbrRulesInit(config) {
  config.store.json.cbr_rules = [];
}

/**
 * save cbr rules
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps component props
 * @param {string} componentProps.data.name name
 */
function cbrRuleSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "cbr_rules"],
    componentProps.data.name,
    stateData
  );
}

/**
 * create a new cbr rule
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function cbrRuleCreate(config, stateData) {
  config.push(["json", "cbr_rules"], stateData);
}

/**
 * delete cbr rule
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cbrRuleDelete(config, stateData, componentProps) {
  config.carve(["json", "cbr_rules"], componentProps.data.name);
}

/**
 * create new cbr rule context
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.contexts
 * @param {object} stateData component state data
 */
function cbrRuleContextCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "cbr_rules",
    "contexts",
    stateData,
    componentProps
  );
}

/**
 * update cbr rule context
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.contexts
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrRuleContextSave(config, stateData, componentProps) {
  updateSubChild(config, "cbr_rules", "contexts", stateData, componentProps);
}

/**
 * delete a cbr rule context
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.contexts
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrRuleContextDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cbr_rules", "contexts", componentProps);
}

/**
 * create new cbr rule attribute
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.resource_attributes
 * @param {object} stateData component state data
 */
function cbrRuleAttributeCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "cbr_rules",
    "resource_attributes",
    stateData,
    componentProps
  );
}

/**
 * update cbr rule attribute
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.resource_attributes
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrRuleAttributeSave(config, stateData, componentProps) {
  updateSubChild(
    config,
    "cbr_rules",
    "resource_attributes",
    stateData,
    componentProps
  );
}

/**
 * delete a cbr rule attribute
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.resource_attributes
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrRuleAttributeDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cbr_rules", "resource_attributes", componentProps);
}

/**
 * create new cbr rule tag
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.tags
 * @param {object} stateData component state data
 */
function cbrRuleTagCreate(config, stateData, componentProps) {
  pushToChildFieldModal(config, "cbr_rules", "tags", stateData, componentProps);
}

/**
 * update cbr rule tag
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.contexts
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrRuleTagSave(config, stateData, componentProps) {
  updateSubChild(config, "cbr_rules", "tags", stateData, componentProps);
}

/**
 * delete a cbr rule tag
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_rules
 * @param {Array<string>} config.store.json.cbr_rules.tags
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrRuleTagDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cbr_rules", "tags", componentProps);
}

module.exports = {
  cbrRulesInit,
  cbrRuleCreate,
  cbrRuleSave,
  cbrRuleDelete,
  cbrRuleContextCreate,
  cbrRuleContextSave,
  cbrRuleContextDelete,
  cbrRuleAttributeCreate,
  cbrRuleAttributeSave,
  cbrRuleAttributeDelete,
  cbrRuleTagCreate,
  cbrRuleTagSave,
  cbrRuleTagDelete
};
