import React from "react";
import { IcseFormTemplate } from "icse-react-assets";
import PropTypes from "prop-types";
import formProps from "./FormPageProps";

export const FormPage = props => {
  return <IcseFormTemplate {...formProps(props.form, props.craig)} />;
};

FormPage.propTypes = {
  form: PropTypes.string.isRequired
};
