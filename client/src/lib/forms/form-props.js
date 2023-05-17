const { contains, splat } = require("lazy-z");
const {
  resourceGroupForms,
  vpcForms,
  encryptionKeyForms,
  subnetForms,
  securityGroupForms
} = require("../constants");
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
 * @param {*} formTemplate form template object
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
 * set vpc list for forms
 * @param {string} form form name
 * @param {*} formTemplate form template object
 * @param {*} craig craig object
 */
function setFormVpcList(form, formTemplate, craig) {
  if (contains(vpcForms, form)) {
    formTemplate.innerFormProps.vpcList = craig.store.vpcList;
  }
}

/**
 * set encryption key list for forms
 * @param {string} form form name
 * @param {*} formTemplate form template object
 * @param {*} craig craig object
 */
function setFormEncryptionKeyList(form, formTemplate, craig) {
  if (contains(encryptionKeyForms, form)) {
    formTemplate.innerFormProps.encryptionKeys = craig.store.encryptionKeys;
  }
}

/**
 * set subnet list for forms
 * @param {string} form form name
 * @param {*} formTemplate form template object
 * @param {*} craig craig object
 */
function setFormSubnetList(form, formTemplate, craig) {
  if (contains(subnetForms, form)) {
    formTemplate.innerFormProps.subnetList = craig.getAllSubnets();
  }
}

/**
 * set security group list for forms
 * @param {string} form form name
 * @param {*} formTemplate form template object
 * @param {*} craig craig object
 */
function setFormSgList(form, formTemplate, craig) {
  if (contains(securityGroupForms, form)) {
    formTemplate.innerFormProps.securityGroups =
      craig.store.json.security_groups;
  }
}

/**
 * set form delete disabled message
 * @param {*} form
 * @param {*} formTemplate
 */
function setDeleteDisabledMessage(form, formTemplate) {
  if (form === "sshKeys") {
    formTemplate.deleteDisabledMessage =
      "Cannot delete SSH Keys in use by Virtual Servers";
  } else if (form === "keyManagement") {
    formTemplate.deleteDisabledMessage =
      "Cannot delete only Key Management instance";
  } else if (form === "resourceGroups") {
    formTemplate.deleteDisabledMessage = "Cannot delete only resource group";
  }
}

module.exports = {
  setFormRgList,
  defaultFormTemplate,
  setFormVpcList,
  setFormEncryptionKeyList,
  setFormSubnetList,
  setDeleteDisabledMessage,
  setFormSgList
};
