import React from "react";

import { IcseModal, IcseToggle, IcseFormGroup } from "icse-react-assets";
import { formatConfig } from "../../../lib";
import { Download, Copy } from "@carbon/icons-react";
import { downloadContent } from "../../page-template";
import { TextArea, Button } from "@carbon/react";

export class JSONModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...this.props.data, usePrettyJson: true };

    this.toggleUsePrettyJson = this.toggleUsePrettyJson.bind(this);
  }

  toggleUsePrettyJson() {
    this.setState({ usePrettyJson: !this.state.usePrettyJson });
  }

  render() {
    return (
      <IcseModal
        open={this.props.open}
        heading={`View JSON for Project "${this.state.name}"`}
        primaryButtonText={"Done"}
        primaryButtonDisabled={false}
        secondaryButtonText={"Back"}
        onRequestClose={this.props.onClose}
        onRequestSubmit={() => {
          this.props.onClose();
        }}
      >
        <IcseFormGroup noMarginBottom>
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
        </IcseFormGroup>
        <IcseFormGroup>
          <TextArea
            labelText="Preview CRAIG JSON"
            rows={15}
            cols={75}
            className="marginBottomSmall fitContent rightTextAlign codeFont"
            value={formatConfig(this.state.json, !this.state.usePrettyJson)}
            readOnly={true}
            invalid={false}
          />
        </IcseFormGroup>
        <div className="marginBottomXs fitContent">
          <Button
            kind="tertiary"
            className="marginRightMed"
            onClick={() => downloadContent(this.state.json)}
            disabled={Boolean(this.state.error)}
            renderIcon={Download}
            iconDescription="Download craig.zip Terraform code"
          >
            Download Terraform
          </Button>
          <Button
            kind="tertiary"
            onClick={() =>
              navigator.clipboard.writeText(formatConfig(this.state.json, true))
            }
            renderIcon={Copy}
            iconDescription="Copy JSON to clipboard"
            disabled={Boolean(this.state.error)}
            tooltipAlignment="end"
          >
            Copy JSON
          </Button>
        </div>
      </IcseModal>
    );
  }
}
