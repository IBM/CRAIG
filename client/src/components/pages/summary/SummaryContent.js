import React from "react";
import { CheckmarkFilled, ErrorFilled } from "@carbon/icons-react";
import {
  IcseFormGroup,
  IcseNameInput,
  IcseModal,
  IcseTextInput
} from "icse-react-assets";
import {
  genericNameCallback,
  invalidNewResourceName,
  invalidProjectDescription
} from "../../../lib";
import { projectDescriptionRegex } from "../../../lib/constants";

export const SummaryErrorText = props => {
  return (
    <>
      <div className="displayFlex">
        <ErrorFilled
          size="16"
          className="marginTopXs marginRightSmall redFill"
        />
        <h4 className="marginBottomSmall">Invalid Configuration</h4>
      </div>
      <p className="leftTextAlign marginBottomSmall">
        We found an error in your configuration: ({props.error}). Please go back
        to the previous steps to fix it.
      </p>
    </>
  );
};

export const SummaryText = () => {
  return (
    <>
      <div className="displayFlex">
        <CheckmarkFilled
          size="16"
          className="marginTopXs marginRightSmall greenFill"
        />
        <h4 className="marginBottomSmall">Congratulations!</h4>
      </div>
      <div className="leftTextAlign">
        <p className="marginBottomSmall">
          You have completed the customization of CRAIG.
        </p>
        <ul>
          <p className="marginBottomSmall">
            • You can view the JSON configuration and download your{" "}
            <em>craig.zip</em> file below.
          </p>
          <p className="marginBottomSmall">
            • To get a stringified copy of the JSON, use the{" "}
            <em>Copy to Clipboard</em> button below.
          </p>
        </ul>
      </div>
    </>
  );
};

export class SaveProjectAsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: ""
    };
    this.setEventValue = this.setEventValue.bind(this);
  }

  setEventValue(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    let invalidName = invalidNewResourceName(this.state.name);
    let invalidDescription = invalidProjectDescription(this.state.description);
    return (
      <IcseModal
        open={this.props.open}
        heading="Save as Project"
        primaryButtonText="Save Project"
        onRequestClose={this.props.onClose}
        onRequestSubmit={() => {
          this.props.onProjectSave(this.state.name, this.state.description);
          this.props.onClose();
        }}
        primaryButtonDisabled={invalidName || invalidDescription}
      >
        <div>
          <p className="marginBottomSmall">
            Save your CRAIG JSON as a project in local browser storage. You will
            be able to access this project from the home page.
          </p>
          <IcseFormGroup>
            <IcseNameInput
              hideHelperText
              invalid={invalidName}
              invalidText={genericNameCallback()}
              id="project-name"
              componentName="project"
              value={this.state.name}
              onChange={this.setEventValue}
            />
          </IcseFormGroup>
          <IcseFormGroup noMarginBottom>
            <IcseTextInput
              invalid={invalidDescription}
              invalidText={
                "Project description must follow the regex pattern: " +
                projectDescriptionRegex
              }
              componentName="project"
              field="description"
              placeholder="(Optional) Brief project description"
              id="project-description"
              onChange={this.setEventValue}
              value={this.state.description}
              className="textInputWide"
            />
          </IcseFormGroup>
        </div>
      </IcseModal>
    );
  }
}
