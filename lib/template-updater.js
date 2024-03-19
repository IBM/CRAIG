const fs = require("fs");
const { state } = require("../client/src/lib");
const {
  eachKey,
  isBoolean,
  contains,
  isFunction,
  isArray,
  azsort,
} = require("lazy-z");
/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

let craigState = newState();

// fields not to add to craig json sub object
const doNotRenderFields = [
  "heading",
  "vsi_tiles",
  "vpc_connections",
  "power_connections",
  "hideWhen",
  "pgw_zone_1",
  "pgw_zone_2",
  "pgw_zone_3",
  "ip_address",
];

// reserved field names for lazy-z state methods
const reservedStateFields = ["create", "save", "delete", "shouldDisableSave"];

/**
 * get a list of form fields
 * @param {string} craigField field string
 * @param {*} craigRef reference to CRAIG or sub component
 * @returns {Array<string>} list of fields
 */
function getFormFields(craigField, craigRef) {
  return Object.keys(craigRef[craigField]).filter((key) => {
    if (
      // if is not reserved
      !contains(reservedStateFields, key) &&
      // and is not a function
      !isFunction(craigRef[craigField][key]) &&
      // and does not have save
      !craigRef[craigField][key].save
    )
      // then it is a schema field and should be returned
      return key;
  });
}

/**
 * setup a form object as though it were part of a dynamic form
 * @param {*} originalItem object to check
 * @param {string} jsonField field to check
 * @param {*} craigRef reference to craig / subcomponent parent
 * @param {string} parent name of parent resource
 * @returns {Object} update item
 */
function dynamicFormSetup(originalItem, jsonField, craigRef, parentName) {
  let craig = craigRef; // ref to craig state, needs to be ref for sub components
  let item = { ...originalItem }; // copy
  let selectFields = {}; // fields that are created using a select

  // for each field item that isn't a subcomponent or reserved state field
  getFormFields(jsonField, craig).forEach((field) => {
    if (
      // field on item is not defined
      !item[field] &&
      // is not a boolean value
      !isBoolean(item[field]) &&
      // and field should be rendered
      !contains(doNotRenderFields, field)
    ) {
      if (craig[jsonField][field]?.type === "select") {
        // add to select fields
        selectFields[field] = craig[jsonField][field];
      }

      // set value to default
      item[field] = isBoolean(craig[jsonField][field].default)
        ? craig[jsonField][field].default
        : craig[jsonField][field].default === null &&
          field !== "router_hostname"
        ? null
        : craig[jsonField][field].default || "";
    }
  });

  // for each selected field
  eachKey(selectFields, (field) => {
    // if groups is function evaluate
    let groups = isFunction(selectFields[field].groups)
      ? selectFields[field].groups(item, {
          // mock componentProps object
          craig: craigState,
          vpc_name: parentName,
          arrayParentName: parentName,
        })
      : selectFields[field].groups;
    // if only one option set state value to value
    if (groups.length === 1 && item[field] !== null) {
      item[field] = groups[0];
    }
  });
  return item;
}

// for each template
fs.readdirSync("./client/src/lib/docs/templates").forEach((template) => {
  // composed path
  let templatePath = "./client/src/lib/docs/templates/" + template;
  // read data
  let templateData = fs.readFileSync(templatePath, "utf-8");
  // parse data
  let parsedData = JSON.parse(templateData);
  // set to store json
  craigState.hardSetJson(parsedData, true);
  eachKey(parsedData, (jsonField) => {
    if (isArray(parsedData[jsonField])) {
      // if the item is an array, check each item
      parsedData[jsonField].forEach((item, itemIndex) => {
        // get list of sub components for that field
        let subComponents = Object.keys(craigState[jsonField]).filter((key) => {
          if (
            !contains(reservedStateFields, key) &&
            !isFunction(craigState[jsonField][key]) &&
            craigState[jsonField][key].save
          )
            return key;
        });
        // set item value to be updated value
        parsedData[jsonField][itemIndex] = dynamicFormSetup(
          item,
          jsonField,
          craigState
        );
        // if there are subcomponents
        if (subComponents.length > 0) {
          // for each sub component
          subComponents.forEach((subComponent) => {
            // for each subcomponent as part of the updated item
            item[subComponent].forEach((subItem) => {
              // update sub item
              subItem = dynamicFormSetup(
                subItem,
                subComponent,
                craigState[jsonField],
                item.name
              );
            });
          });
        }
      });
    } else {
      // update object field
      parsedData[jsonField] = dynamicFormSetup(
        parsedData[jsonField],
        jsonField === "_options" ? "options" : jsonField,
        craigState
      );
    }
  });

  // reorder fields in alphabetical order
  let azTemplate = {};
  Object.keys(parsedData)
    .sort(azsort)
    .forEach((key) => {
      azTemplate[key] = parsedData[key];
    });

  // write file to template path
  fs.writeFileSync(templatePath, JSON.stringify(azTemplate, null, 2));
});
