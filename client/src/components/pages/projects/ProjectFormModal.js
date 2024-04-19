import React from "react";
import {
  invalidProjectName,
  invalidProjectDescription,
  invalidProjectNameText,
} from "../../../lib";
import { invalidNewResourceName } from "../../../lib/forms";
import { azsort, isNullOrEmptyString, keys } from "lazy-z";
import { Launch } from "@carbon/icons-react";
import { Button, Modal, TextInput, Toggle } from "@carbon/react";
import { templates, TemplateAbout } from "../../utils";
import {
  projectDescriptionRegex,
  template_dropdown_map,
} from "../../../lib/constants";
import PropTypes from "prop-types";
import { CraigFormGroup, ToolTipWrapper } from "../../forms";
import {
  DynamicFormSelect,
  DynamicToolTipWrapper,
} from "../../forms/dynamic-form";
import { dynamicToolTipWrapperProps } from "../../../lib/forms/dynamic-form-fields";

export class ProjectFormModal extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.data) {
      let formModalState = {
        ...this.props.data,
        json: !this.props.data.json
          ? template_dropdown_map["Empty Project"].template
          : this.props.data.json,
        use_template: true,
      };
      if (!formModalState.template) {
        formModalState.template = "Empty Project";
      }
      this.state = formModalState;
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
    let invalidRegion = !this.state.workspace_region;
    let invalidSchematicsName = this.state.use_schematics
      ? invalidNewResourceName(this.state.workspace_name)
      : false;
    let primaryButtonDisabled =
      invalidProjectNameVal ||
      invalidDescription ||
      invalidSchematicsName ||
      (invalidRegion && this.state.use_schematics);
    let field = {
      labelText: "Choose an Initial Project Template",
      className: "projectSelectMarginBottom",
      groups: keys(this.props.templates),
      disabled: (stateData, componentProps) => {
        return (
          componentProps.data.use_template &&
          !isNullOrEmptyString(componentProps.data.last_save) &&
          !isNullOrEmptyString(componentProps.data.template)
        );
      },
      invalid: (stateData) => {
        return false;
      },
      invalidText: (stateData) => {
        return "";
      },
      tooltip: {
        content:
          "Choose a Project Template to initialize this Project with. Projects can be edited to deviate from the configuration of the Initial Project Template.",
      },
    };
    return (
      <Modal
        size="lg" // template no longer optional
        open={this.props.open}
        modalHeading={
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
        secondaryButtonText="Dismiss"
      >
        <CraigFormGroup>
          <TextInput
            invalid={invalidProjectNameVal}
            invalidText={invalidProjectNameText(this.state, this.props)}
            id="project-name"
            name="name"
            labelText="Project Name"
            componentName="project"
            value={this.state.name || ""}
            onChange={this.handleTextInput}
            helperText={
              this.state.last_save
                ? "Last Saved: " +
                  new Date(this.state.last_save).toLocaleString()
                : ""
            }
          />
        </CraigFormGroup>
        <CraigFormGroup>
          <TextInput
            invalid={invalidDescription}
            invalidText={
              "Project description must follow the regex pattern: " +
              projectDescriptionRegex
            }
            componentName="project"
            name="description"
            labelText="Project Description"
            placeholder="(Optional) Brief project description"
            id="project-description"
            onChange={this.handleTextInput}
            value={this.state.description || ""}
            className="textInputWide"
            optional={true}
          />
        </CraigFormGroup>
        <CraigFormGroup className="formInSubForm">
          <DynamicToolTipWrapper
            {...dynamicToolTipWrapperProps(this.props, "project", 0, field)}
          >
            <DynamicFormSelect
              name="template"
              propsName="project"
              keyIndex={0}
              value={this.state.template}
              field={field}
              parentProps={this.props}
              parentState={this.state}
              handleInputChange={this.handleTextInput}
            />
          </DynamicToolTipWrapper>
          <TemplateAbout smallImage template={templates[this.state.template]} />
        </CraigFormGroup>
        <>
          <CraigFormGroup>
            {this.props.noProjectSave === false && (
              <Toggle
                labelText="Integrate with Schematics"
                defaultToggled={this.state.use_schematics}
                onToggle={() => this.handleToggle("use_schematics")}
                id="use-schematics"
                toggleFieldName="use_schematics"
                value={this.state.use_schematics}
              />
            )}
          </CraigFormGroup>
          {this.state.use_schematics && (
            <div className="formInSubForm">
              <CraigFormGroup>
                <TextInput
                  name="workspace_name"
                  labelText="Workspace Name"
                  invalid={invalidNewResourceName(this.state.workspace_name)}
                  invalidText={"Invalid Name"}
                  disabled={this.state.workspace_url !== undefined}
                  componentName="workspace"
                  field="workspace_name"
                  id="workspace-name"
                  className="fieldWidth"
                  onChange={this.handleTextInput}
                  value={this.state.workspace_name || ""}
                  placeholder="my-workspace-name"
                />
              </CraigFormGroup>
              <CraigFormGroup>
                <ToolTipWrapper
                  tooltip={{
                    content: `Must correspond to an existing resource group. If not provided, the workspace will be deployed to the "default" resource group in the account.`,
                    link: "https://cloud.ibm.com/docs/account?topic=account-rgs&interface=ui",
                  }}
                  labelText="Workspace Resource Group"
                >
                  <TextInput
                    invalid={false}
                    labelText="Workspace Resource Group"
                    name="workspace_resource_group"
                    disabled={this.state.workspace_url !== undefined}
                    componentName="workspace"
                    field="workspace_resource_group"
                    id="workspace-resource-group"
                    onChange={this.handleTextInput}
                    className="fieldWidth"
                    value={this.state.workspace_resource_group}
                    placeholder={"default"}
                    optional={true}
                  />
                </ToolTipWrapper>
              </CraigFormGroup>
              <CraigFormGroup>
                <DynamicFormSelect
                  name="workspace_region"
                  propsName="projects"
                  keyIndex={0}
                  value={this.state.workspace_region || "us-south"}
                  field={{
                    labelText: "Workspace Region",
                    groups: ["us-south", "eu-de", "eu-gb"].sort(azsort),
                    disabled: (stateData) => {
                      return stateData.workspace_url !== undefined;
                    },
                    invalid: (stateData) => {
                      return !stateData.workspace_region;
                    },
                    invalidText: (stateData) => {
                      return "Select a region";
                    },
                  }}
                  parentProps={this.props}
                  parentState={this.state}
                  handleInputChange={this.handleTextInput}
                />
              </CraigFormGroup>
              {this.state.workspace_url && (
                <div className="displayFlex alignItemsEnd">
                  <TextInput
                    invalid={false}
                    readOnly={true}
                    labelText="Workspace URL"
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
                  />
                </div>
              )}
            </div>
          )}
        </>
      </Modal>
    );
  }
}

ProjectFormModal.defaultProps = {
  noProjectSave: false,
};

ProjectFormModal.propTypes = {
  data: PropTypes.shape({
    last_save: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    template: PropTypes.string,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  nav: PropTypes.func,
  templates: PropTypes.shape({}).isRequired,
  noProjectSave: PropTypes.bool.isRequired,
};
