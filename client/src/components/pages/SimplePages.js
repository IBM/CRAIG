import React from "react";
import { ToggleForm, IcseFormTemplate } from "icse-react-assets";
import PropTypes from "prop-types";
import toggleFormProps from "./ToggleFormPageProps";
import formProps from "./FormPageProps";
import CopyRuleForm from "../forms/CopyRuleForm";
import { Docs } from "icse-react-assets";
const docs = require("../../lib/docs/docs.json");

export const ToggleFormPage = props => {
  return <ToggleForm {...toggleFormProps(props.form, props.craig)} />;
};

ToggleFormPage.propTypes = {
  form: PropTypes.string.isRequired
};

export const FormPage = props => {
  return (
    <>
      <IcseFormTemplate {...formProps(props.form, props.craig)} />{" "}
      {props.form === "securityGroups" && (
        <CopyRuleForm craig={props.craig} isAclForm={false} />
      )}
    </>
  );
};

FormPage.propTypes = {
  form: PropTypes.string.isRequired
};

/**
 * return render docs function
 * @param {string} field json field name
 * @returns {Function} function to display docs
 */
export function RenderDocs(field) {
  return function() {
    return Docs(docs[field]);
  };
}
