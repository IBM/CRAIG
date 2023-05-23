import React from "react";
import { FolderAdd, Save } from "@carbon/icons-react";
import { Tile, Button, TextArea } from "@carbon/react";
import { IcseToggle } from "icse-react-assets";
import { formatConfig, validate } from "../../../lib";
import { SummaryErrorText, SummaryText } from "./SummaryContent";
import { ProjectFormModal } from "../projects/ProjectFormModal";
import { DownloadCopyButtonSet } from "../../utils";
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
              json: this.props.craig.store.json,
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
            <DownloadCopyButtonSet
              disabled={Boolean(this.state.error)}
              json={this.props.craig.store.json}
            />
            {this.props.craig.store.project_name ? (
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
            )}
          </div>
        </Tile>
      </>
    );
  }
}

export default Summary;
