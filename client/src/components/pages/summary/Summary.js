import React from "react";
import { FolderAdd, Download, Copy, Save } from "@carbon/icons-react";
import { Tile, Button, TextArea } from "@carbon/react";
import { IcseToggle } from "icse-react-assets";
import { downloadContent } from "../../page-template";
import { formatConfig, validate } from "../../../lib";
import { SummaryErrorText, SummaryText } from "./SummaryContent";
import { ProjectFormModal } from "../projects/ProjectFormModal";
import "./summary.css";

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usePrettyJson: true,
      error: "",
      fileDownloadUrl: "",
      showSaveModal: false
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
      !this.state.usePrettyJson
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
              json: this.props.craig.store.json
            }}
            onClose={this.toggleShowSaveModal}
            onSubmit={this.props.onProjectSave}
            setCurrentProject={true}
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
          <IcseToggle
            labelText="Use Pretty JSON"
            defaultToggled={this.state.usePrettyJson}
            onToggle={this.toggleUsePrettyJson}
            className="marginBottom displayFlex"
            id="use-pretty-json"
            disabled={false}
            toggleFieldName="usePrettyJson"
            value={this.state.usePrettyJson}
          />
          <TextArea
            labelText="craig.json"
            rows={20}
            cols={75}
            value={json}
            readOnly
            className="marginBottomSmall fitContent rightTextAlign codeFont"
            invalid={Boolean(this.state.error)}
            invalidText={this.state.error}
          />
          <div className="marginBottomXs fitContent">
            <Button
              className="marginRightMed"
              onClick={() => downloadContent(this.props.craig.store.json)}
              disabled={Boolean(this.state.error)}
              renderIcon={Download}
              iconDescription="Download craig.zip Terraform code"
            >
              Download Terraform
            </Button>
            <Button
              className="marginRightMed"
              kind="tertiary"
              onClick={() =>
                navigator.clipboard.writeText(
                  formatConfig(this.props.craig.store.json, true)
                )
              }
              renderIcon={Copy}
              iconDescription="Copy JSON to clipboard"
              disabled={Boolean(this.state.error)}
              tooltipAlignment="end"
            >
              Copy JSON
            </Button>
            {this.props.craig.store.project_name ? (
              <Button
                kind="tertiary"
                onClick={() => {
                  let project = this.props.projects[
                    this.props.craig.store.project_name
                  ];

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
            )}
          </div>
        </Tile>
      </>
    );
  }
}

export default Summary;
