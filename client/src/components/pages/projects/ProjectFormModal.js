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
import { invalidNewResourceName } from "../../../lib/forms";
import { azsort, isNullOrEmptyString, keys } from "lazy-z";
import { Launch } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { templates, TemplateAbout } from "../../utils";
import { projectDescriptionRegex } from "../../../lib/constants";
import PropTypes from "prop-types";

export class ProjectFormModal extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.data) {
      this.state = { ...this.props.data, use_template: true };
    }

    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleTextInput(event) {
    let { name, value } = event.target;
    if (name === "template") {
      this.setState({
        template: value,
        json: templates[value].template,
      });
    } else if (name === "name") {
      this.setState({
        project_name: value,
        name: value,
      });
    } else this.setState({ [name]: value });
  }

  handleToggle(name) {
    this.setState({ [name]: !this.state[name] });
  }

  render() {
    let invalidProjectNameVal = invalidProjectName(this.state, this.props);
    let invalidDescription = invalidProjectDescription(this.state.description);
    let invalidSchematicsName = this.state.use_schematics
      ? invalidNewResourceName(this.state.workspace_name)
      : false;
    let primaryButtonDisabled =
      invalidProjectNameVal || invalidDescription || invalidSchematicsName;
    return (
      <IcseModal
        size="lg" // template no longer optional
        open={this.props.open}
        heading={
          this.state.last_save === undefined
            ? "Create a New Project"
            : "Edit Project Details"
        }
        primaryButtonText={
          this.state.last_save === undefined
            ? "Create Project"
            : "Save Project" + (this.state.use_schematics ? " & Workspace" : "")
        }
        onRequestClose={this.props.onClose}
        onRequestSubmit={() => {
          this.props.onSubmit(this.state, this.props, true);
          this.props.onClose();

          if (this.props.nav !== undefined) {
            this.props.nav("/projects");
          }
        }}
        primaryButtonDisabled={primaryButtonDisabled}
      >
        <IcseFormGroup>
          <IcseNameInput
            invalid={invalidProjectNameVal}
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
            invalid={invalidDescription}
            invalidText={
              "Project description must follow the regex pattern: " +
              projectDescriptionRegex
            }
            componentName="project"
            field="description"
            placeholder="Brief project description"
            id="project-description"
            onChange={this.handleTextInput}
            value={this.state.description || ""}
            className="textInputWide"
            optional={true}
          />
        </IcseFormGroup>
        <IcseFormGroup className="formInSubForm">
          <IcseSelect
            name="template"
            formName="project"
            labelText="Select a Project Template"
            groups={keys(this.props.templates)}
            value={this.state.template || "Mixed"}
            handleInputChange={this.handleTextInput}
            disabled={
              this.props.data.use_template &&
              !isNullOrEmptyString(this.props.data.last_save) &&
              !isNullOrEmptyString(this.props.data.template)
            } // do not allow removal of template once saved with template
            className="projectSelectMarginBottom"
          />
          <TemplateAbout smallImage template={templates[this.state.template]} />
        </IcseFormGroup>
        <>
          <IcseFormGroup>
            <IcseToggle
              labelText="Integrate with Schematics"
              defaultToggled={this.state.use_schematics}
              onToggle={() => this.handleToggle("use_schematics")}
              id="use-schematics"
              toggleFieldName="use_schematics"
              value={this.state.use_schematics}
            />
          </IcseFormGroup>
          {this.state.use_schematics && (
            <div className="formInSubForm">
              <IcseFormGroup>
                <IcseTextInput
                  invalid={invalidNewResourceName(this.state.workspace_name)}
                  invalidText={"Invalid Name"}
                  componentName="workspace"
                  field="workspace_name"
                  id="workspace-name"
                  onChange={this.handleTextInput}
                  value={this.state.workspace_name || ""}
                />
              </IcseFormGroup>
              <IcseFormGroup>
                <IcseTextInput
                  invalid={false}
                  componentName="workspace"
                  field="workspace_resource_group"
                  id="workspace-resource-group"
                  onChange={this.handleTextInput}
                  value={this.state.workspace_resource_group}
                  placeholder={"default"}
                  optional={true}
                  tooltip={{
                    content: `Must correspond to an existing resource group. If not provided, the workspace will be deployed to the "default" resource group in the account.`,
                    link: "https://cloud.ibm.com/docs/account?topic=account-rgs&interface=ui",
                  }}
                />
              </IcseFormGroup>
              <IcseFormGroup>
                <IcseSelect
                  name="workspace_region"
                  labelText={"Workspace Region"}
                  formName={"projects"}
                  value={this.state.workspace_region || "us-south"}
                  groups={["us-south", "eu-de", "eu-gb"].sort(azsort)}
                  handleInputChange={this.handleTextInput}
                />
              </IcseFormGroup>
              {this.state.workspace_url && (
                <div className="displayFlex alignItemsEnd">
                  <IcseTextInput
                    invalid={false}
                    readOnly={true}
                    componentName="project"
                    field="workspace_url"
                    id="workspace-url"
                    value={this.state.workspace_url || ""}
                    className="textInputWide marginRightSmall"
                  />
                  <Button
                    kind="ghost"
                    onClick={() => {
                      window.open(this.state.workspace_url, "_blank");
                    }}
                    renderIcon={Launch}
                    iconDescription="Launch workspace in new tab"
                  ></Button>
                </div>
              )}
            </div>
          )}
        </>
      </IcseModal>
    );
  }
}

ProjectFormModal.propTypes = {
  data: PropTypes.shape({
    last_save: PropTypes.string,
    template: PropTypes.string,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  nav: PropTypes.func,
  templates: PropTypes.shape({}).isRequired,
};
