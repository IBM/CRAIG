import React from "react";
import { Tile } from "@carbon/react";
import { formatConfig, validate } from "../../../lib";
import { SummaryErrorText, SummaryText } from "./SummaryContent";
import { ProjectFormModal } from "../projects/ProjectFormModal";
import { JSONTextArea } from "../../utils/JSONTextArea";
import "./summary.css";

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usePrettyJson: true,
      error: "",
      fileDownloadUrl: "",
      showSaveModal: false,
    };
    try {
      validate(this.props.craig.store.json);
    } catch (error) {
      this.state.error = error.message;
    }
    this.toggleUsePrettyJson = this.toggleUsePrettyJson.bind(this);
    this.toggleShowSaveModal = this.toggleShowSaveModal.bind(this);
  }

  toggleUsePrettyJson() {
    this.setState({ usePrettyJson: !this.state.usePrettyJson });
  }

  toggleShowSaveModal() {
    this.setState({ showSaveModal: !this.state.showSaveModal });
  }

  render() {
    let json = formatConfig(
      this.props.craig.store.json,
      !this.state.usePrettyJson,
    );
    return (
      <>
        <h4 className="leftTextAlign marginBottomSmall">Summary</h4>
        {this.state.showSaveModal && (
          <ProjectFormModal
            open={this.state.showSaveModal}
            data={{
              name: "",
              description: "",
              json: this.props.craig.store.json,
            }}
            onClose={this.toggleShowSaveModal}
            onSubmit={this.props.onProjectSave}
            projects={this.props.projects}
            nav={this.props.nav}
          />
        )}
        <Tile className="widthOneHundredPercent">
          {this.state.error ? (
            <SummaryErrorText error={this.state.error} />
          ) : (
            <SummaryText />
          )}
          <JSONTextArea
            projectName={this.props.craig.store.project_name}
            json={this.props.craig.store.json}
            value={json}
            readOnly
            noEditButton
            invalid={Boolean(this.state.error)}
            wrapped={this.state.usePrettyJson}
            invalidText={this.state.error}
            onClickWrapJSON={this.toggleUsePrettyJson}
          />
          {/*
            
            content here is from a version where projects were not implemented first
            code is retained here for removal and removal of references

            this.props.craig.store.project_name ? (
              <Button
                kind="tertiary"
                onClick={() => {
                  let project =
                    this.props.projects[this.props.craig.store.project_name];
                  let newProject = { ...project };
                  newProject.json = this.props.craig.store.json;
                  this.props.onProjectSave(newProject, { data: project }, true);
                }}
                disabled={Boolean(this.state.error)}
                renderIcon={Save}
                className="marginRightMed"
                iconDescription="Save Project"
              >
                Save
              </Button>
            ) : (
              <Button
                kind="tertiary"
                onClick={this.toggleShowSaveModal}
                disabled={Boolean(this.state.error)}
                renderIcon={FolderAdd}
                className="marginRightMed"
                iconDescription="Save as Project"
              >
                Save as Project
              </Button>
            )*/}
        </Tile>
      </>
    );
  }
}

export default Summary;
