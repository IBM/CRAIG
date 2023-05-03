const { contains, splat } = require("lazy-z");
const { resourceGroupForms, vpcForms } = require("../constants");
const { disableSave, forceShowForm } = require("./disable-save");
const { invalidName } = require("./invalid-callbacks");
const { invalidNameText } = require("./text-callbacks");
const { propsMatchState } = require("./props-match-state");

/**
 * get default form field template
 * @param {*} formFields form fields object
 * @param {string} formFields.name name of form
 * @param {string} formFields.addText add text for form
 * @param {string} jsonField name of field for form render
 * @param {*} craig craig object
 * @returns {object} default form template
 */
function defaultFormTemplate(formFields, jsonField, craig) {
  return {
    craig: craig,
    name: formFields.name,
    addText: formFields.addText,
    innerForm: formFields.innerForm,
    disableSave: disableSave,
    propsMatchState: propsMatchState,
    arrayData: craig.store.json[jsonField],
    onDelete: craig[jsonField].delete,
    onSave: craig[jsonField].save,
    onSubmit: craig[jsonField].create,
    forceOpen: forceShowForm,
    innerFormProps: {
      craig: craig,
      disableSave: disableSave,
      invalidCallback: invalidName(jsonField),
      invalidTextCallback: invalidNameText(jsonField)
    },
    toggleFormProps: {
      craig: craig,
      disableSave: disableSave,
      hideName: true,
      submissionFieldName: jsonField,
      hide: true
    }
  };
}

/**
 * set resource group list for forms
 * @param {string} form form name
 * @param {*} craig craig object
 */
function setFormRgList(form, formTemplate, craig) {
  if (contains(resourceGroupForms, form)) {
    formTemplate.innerFormProps.resourceGroups = splat(
      craig.store.json.resource_groups,
      "name"
    );
  }
}

/**
 * set resource group list for forms
 * @param {string} form form name
 * @param {*} craig craig object
 */
function setFormVpcList(form, formTemplate, craig) {
  if (contains(vpcForms, form)) {
    formTemplate.innerFormProps.vpcList = craig.store.vpcList;
  }
}

module.exports = {
  setFormRgList,
  defaultFormTemplate,
  setFormVpcList
};
