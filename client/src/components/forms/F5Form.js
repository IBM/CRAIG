import React from "react";
import PropTypes from "prop-types";
import { F5VsiForm, F5VsiTemplateForm, ToggleForm } from "icse-react-assets";

const F5Form = (props) => {
  return (
    <div>
      <ToggleForm
        name="F5 Big IP Template Configuration"
        submissionFieldName="f5_vsi_template"
        noDeleteButton
        hideName
        onSave={props.craig.f5.template.save}
        disableSave={props.disableSave}
        type="formInSubForm"
        innerForm={F5VsiTemplateForm}
        tabPanel={{ hideAbout: true }}
        craig={props.craig}
        innerFormProps={props.templateInnerFormProps}
        propsMatchState={props.propsMatchState}
      />
      <ToggleForm
        name="F5 VSI Deployment Configuration"
        submissionFieldName="f5_vsi"
        noDeleteButton
        hideName
        tabPanel={{ hideAbout: true }}
        onSave={props.craig.f5.vsi.save}
        disableSave={props.disableSave}
        type="formInSubForm"
        innerForm={F5VsiForm}
        innerFormProps={props.deploymentInnerFormProps}
        craig={props.craig}
        propsMatchState={props.propsMatchState}
      />
    </div>
  );
};

export default F5Form;

F5Form.propTypes = {
  craig: PropTypes.shape({
    f5: PropTypes.shape({
      template: PropTypes.shape({ save: PropTypes.func.isRequired }),
      vsi: PropTypes.shape({ save: PropTypes.func.isRequired }),
    }),
  }),
  propsMatchState: PropTypes.func.isRequired,
  disableSave: PropTypes.func.isRequired,
  templateInnerFormProps: PropTypes.shape({}).isRequired,
  deploymentInnerFormProps: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}),
};
