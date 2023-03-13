import React from "react";
import {
  IcseFormTemplate,
  ResourceGroupForm,
  KeyManagementForm
} from "icse-react-assets";
import {
  resourceGroupHelperTextCallback,
  invalidNameText,
  propsMatchState,
  disableSave,
  invalidName,
  invalidEncryptionKeyRing
} from "../lib/forms";
import PropTypes from "prop-types";
import { splat } from "lazy-z";

/**
 * create form template props for form page
 * @param {lazyZstate} craig
 * @returns {Object} form template props
 */
function formTemplateProps(form, craig) {
  if (form === "resourceGroups")
    return {
      name: "Resource Groups",
      addText: "Create a Resource Group",
      arrayData: craig.store.json.resource_groups,
      innerForm: ResourceGroupForm,
      disableSave: disableSave,
      onDelete: craig.resource_groups.delete,
      onSave: craig.resource_groups.save,
      onSubmit: craig.resource_groups.create,
      propsMatchState: propsMatchState,
      deleteDisabled: () => {
        return craig.store.json.resource_groups.length === 1;
      },
      deleteDisabledMessage: "Cannot delete only resource group",
      innerFormProps: {
        craig: craig,
        disableSave: invalidName("resource_groups"),
        invalidCallback: invalidName("resource_groups"),
        invalidTextCallback: invalidNameText("resource_groups"),
        helperTextCallback: resourceGroupHelperTextCallback
      },
      toggleFormProps: {
        disableSave: disableSave,
        hideName: true,
        submissionFieldName: "resource_groups"
      }
    };
  if (form === "keyManagement")
    return {
      name: "Key Management",
      addText: "Create a Key Management Service",
      arrayData: craig.store.json.key_management,
      innerForm: KeyManagementForm,
      disableSave: disableSave,
      onDelete: craig.key_management.delete,
      onSave: craig.key_management.save,
      onSubmit: craig.key_management.create,
      resourceGroups: splat(craig.store.json.resource_groups, "name"),
      propsMatchState: propsMatchState,
      deleteDisabled: () => {
        return craig.store.json.key_management.length === 1;
      },
      deleteDisabledMessage: "Cannot delete only Key Management instance",
      innerFormProps: {
        craig: craig,
        disableSave: invalidName("key_management"),
        invalidCallback: invalidName("key_management"),
        invalidTextCallback: invalidNameText("key_management"),
        invalidKeyCallback: invalidName("encryption_keys"),
        invalidKeyTextCallback: invalidNameText("encryption_keys"),
        invalidRingCallback: invalidEncryptionKeyRing,
        invalidRingText:
          "Invalid Key Ring Name. Must match the regular expression: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        propsMatchState: propsMatchState,
        encryptionKeyProps: {
          onSave: craig.key_management.keys.save,
          onDelete: craig.key_management.keys.delete,
          onSubmit: craig.key_management.keys.create,
          disableSave: disableSave,
          craig: craig
        }
      },
      toggleFormProps: {
        hideName: true,
        submissionFieldName: "key_management"
      }
    };
}

export const FormPage = props => {
  return <IcseFormTemplate {...formTemplateProps(props.form, props.craig)} />;
};

FormPage.propTypes = {
  form: PropTypes.string.isRequired
};
