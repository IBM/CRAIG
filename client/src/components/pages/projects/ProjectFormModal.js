import React from "react";

import {
  IcseFormGroup,
  IcseNameInput,
  IcseTextInput,
  IcseModal,
} from "icse-react-assets";
import { projectDescriptionRegex } from "../../../lib/constants";
import {
  invalidProjectName,
  invalidProjectDescription,
  invalidProjectNameText,
} from "../../../lib";

export class ProjectFormModal extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.data) {
      this.state = { ...this.props.data };
    }

    this.handleTextInput = this.handleTextInput.bind(this);
  }

  handleTextInput(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    let invalidName = invalidProjectName(this.state, this.props);
    let invalidDescription = invalidProjectDescription(this.state.description);

    return (
      <IcseModal
        open={this.props.open}
        heading={
          this.state.last_save === undefined
            ? "Create New Project"
            : "Edit Project Details"
        }
        primaryButtonText={
          this.state.last_save === undefined ? "Create Project" : "Save Project"
        }
        onRequestClose={this.props.onClose}
        onRequestSubmit={() => {
          this.props.onSubmit(
            this.state,
            this.props,
            this.props.setCurrentProject
          );
          this.props.onClose();

          if (this.props.nav !== undefined) {
            this.props.nav("/projects");
          }
        }}
        primaryButtonDisabled={invalidName || invalidDescription}
      >
        <IcseFormGroup>
          <IcseNameInput
            invalid={invalidName}
            invalidText={invalidProjectNameText(this.state, this.props)}
            id="project-name"
            componentName="project"
            value={this.state.name || ""}
            onChange={this.handleTextInput}
            helperTextCallback={() => {
              return this.state.last_save
                ? "Last Saved: " +
                    new Date(this.state.last_save).toLocaleString()
                : "";
            }}
          />
        </IcseFormGroup>
        <IcseFormGroup>
          <IcseTextInput
            invalid={invalidProjectDescription(this.state.description)}
            invalidText={
              "Project description must follow the regex pattern: " +
              projectDescriptionRegex
            }
            componentName="project"
            field="description"
            placeholder="(Optional) Brief project description"
            id="project-description"
            onChange={this.handleTextInput}
            value={this.state.description || ""}
            className="textInputWide"
          />
        </IcseFormGroup>
      </IcseModal>
    );
  }
}
