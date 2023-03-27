import React from "react";
import { IcseFormTemplate } from "icse-react-assets";
import PropTypes from "prop-types";
import formProps from "./FormPageProps";
import CopyRuleForm from "./forms/CopyRuleForm";

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
