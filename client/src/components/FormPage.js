import React from "react";
import { IcseFormTemplate, ResourceGroupForm } from "icse-react-assets";
import {
  resourceGroupHelperTextCallback,
  invalidResourceGroupNameCallback,
  resourceGroupInvalidTextCallback,
  propsMatchState,
  disableSave
} from "../lib/forms";
import PropTypes from "prop-types";
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
      innerFormProps: {
        craig: craig,
        disableSave: invalidResourceGroupNameCallback,
        invalidCallback: invalidResourceGroupNameCallback,
        invalidTextCallback: resourceGroupInvalidTextCallback,
        helperTextCallback: resourceGroupHelperTextCallback
      },
      toggleFormProps: {
        disableSave: disableSave,
        hideName: true,
        propsMatchState: propsMatchState,
        submissionFieldName: "resource_groups",
        disableDeleteMessage: () => {
          return "Cannot delete only resource group";
        }
      }
    };
}

export const FormPage = props => {
  return <IcseFormTemplate {...formTemplateProps(props.form, props.craig)} />;
};

FormPage.propTypes = {
  form: PropTypes.string.isRequired
};
