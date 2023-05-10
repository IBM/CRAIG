import React from "react";
import { FolderAdd, Download, Copy } from "@carbon/icons-react";
import { Tile, Button, TextArea } from "@carbon/react";
import { IcseToggle } from "icse-react-assets";
import { downloadContent } from "../../page-template";
import { formatConfig, validate } from "../../../lib";
import "./summary.css";
import {
  SaveProjectAsModal,
  SummaryErrorText,
  SummaryText
} from "./SummaryContent";

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
        <SaveProjectAsModal
          open={this.state.showSaveModal}
          onClose={this.toggleShowSaveModal}
          onProjectSave={this.props.onProjectSave}
        />
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
            {!this.props.craig.store.project_name && (
              <Button
                kind="tertiary"
                onClick={this.toggleShowSaveModal}
                disabled={Boolean(this.state.error)}
                renderIcon={FolderAdd}
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
