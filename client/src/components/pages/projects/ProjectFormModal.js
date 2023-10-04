import React from "react";
import {
  IcseFormGroup,
  IcseNameInput,
  IcseTextInput,
  IcseModal,
  IcseSelect,
  IcseToggle,
} from "icse-react-assets";
import {
  invalidProjectName,
  invalidProjectDescription,
  invalidProjectNameText,
} from "../../../lib";
import { TemplateAbout } from "../../forms/OptionsForm";
import MixedPattern from "../../../images/mixed.png";
import VsiPattern from "../../../images/VsiPattern.png";
import VsiEdgePattern from "../../../images/VsiEdgePattern.png";
import PowerSAP_HanaPattern from "../../../images/PowerSAP_HanaPattern.png";

const constants = require("../../../lib/constants");
const templateImages = {
  Mixed: MixedPattern,
  VSI: VsiPattern,
  "VSI Edge": VsiEdgePattern,
  "Power VS SAP Hana": PowerSAP_HanaPattern,
};

constants.templates.forEach((template) => {
  constants.template_dropdown_map[template].image = templateImages[template];
});

export class ProjectFormModal extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.data) {
      this.state = { ...this.props.data };
    }

    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleTextInput(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleToggle(name) {
    this.setState({ [name]: !this.state[name] });
  }

  render() {
    let invalidName = invalidProjectName(this.state, this.props);
    let invalidDescription = invalidProjectDescription(this.state.description);
    return (
      <IcseModal
        size={this.state.use_template ? "lg" : "md"}
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
              constants.projectDescriptionRegex
            }
            componentName="project"
            field="description"
            placeholder="(Optional) Brief project description"
            id="project-description"
            onChange={this.handleTextInput}
            value={this.state.description || ""}
            className="textInputWide"
          />
          {this.props.data.name === "" && (
            <IcseToggle
              labelText="Use a Project Template"
              defaultToggled={this.state.use_template}
              onToggle={() => this.handleToggle("use_template")}
              id="use-template"
              toggleFieldName="use_template"
              value={this.state.use_template}
              tooltip={{
                content:
                  "Create a new project based on a preconfigured quick start template",
              }}
            />
          )}
        </IcseFormGroup>
        {this.state.use_template && (
          <>
            <IcseFormGroup>
              <IcseSelect
                name="template"
                formName="project"
                labelText="Select a Project Template"
                groups={this.props.templates}
                value={this.state.template || "Mixed"}
                handleInputChange={this.handleTextInput}
              />
            </IcseFormGroup>
            <IcseFormGroup>
              <TemplateAbout
                smallImage
                template={constants.template_dropdown_map[this.state.template]}
              />
            </IcseFormGroup>
          </>
        )}
      </IcseModal>
    );
  }
}
