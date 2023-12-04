const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
} = require("./store.utils");
const { shouldDisableComponentSave } = require("./utils");
const { invalidCbrRule } = require("../forms/invalid-callbacks");
const { invalidCbrRuleText } = require("../forms/text-callbacks");
const { invalidName, invalidNameText } = require("../forms");

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

function initCbrRules(store) {
  store.newField("cbr_rules", {
    init: cbrRulesInit,
    create: cbrRuleCreate,
    save: cbrRuleSave,
    delete: cbrRuleDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "description", "api_type_id"],
      "cbr_rules"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("cbr_rules"),
        invalidText: invalidNameText("cbr_rules"),
      },
      description: {
        default: "",
        invalid: function (stateData) {
          return invalidCbrRule("description", stateData);
        },
        invalidText: invalidCbrRuleText("description"),
      },
      api_type_id: {
        default: "",
        invalid: function (stateData) {
          return invalidCbrRule("api_type_id", stateData);
        },
        invalidText: invalidCbrRuleText("api_type_id"),
      },
      enforcement_mode: {
        default: "Enabled",
      },
    },
    subComponents: {
      contexts: {
        create: cbrRuleContextCreate,
        delete: cbrRuleContextDelete,
        save: cbrRuleContextSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "value"],
          "cbr_rules",
          "contexts"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("contexts"),
            invalidText: invalidNameText("contexts"),
          },
          value: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrRule("value", stateData);
            },
            invalidText: invalidCbrRuleText("value"),
          },
        },
      },
      resource_attributes: {
        create: cbrRuleAttributeCreate,
        delete: cbrRuleAttributeDelete,
        save: cbrRuleAttributeSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "value"],
          "cbr_rules",
          "resource_attributes"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("resource_attributes"),
            invalidText: invalidNameText("resource_attributes"),
          },
          value: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrRule("value", stateData);
            },
            invalidText: invalidCbrRuleText("value"),
          },
        },
      },
      tags: {
        create: cbrRuleTagCreate,
        delete: cbrRuleTagDelete,
        save: cbrRuleTagSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "value", "operator"],
          "cbr_rules",
          "tags"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("tags"),
            invalidText: invalidNameText("tags"),
          },
          value: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrRule("value", stateData);
            },
            invalidText: invalidCbrRuleText("value"),
          },
          operator: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrRule("operator", stateData);
            },
            invalidText: invalidCbrRuleText("operator"),
          },
        },
      },
    },
  });
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
  cbrRuleTagDelete,
  initCbrRules,
};
