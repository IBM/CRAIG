import React from "react";

import { IcseModal, IcseToggle, IcseFormGroup } from "icse-react-assets";
import { formatConfig, validate } from "../../../lib";
import { DownloadCopyButtonSet } from "../../utils";
import { TextArea } from "@carbon/react";

export class JSONModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...this.props.data, usePrettyJson: true, error: "" };

    try {
      validate(this.state.json);
    } catch (error) {
      this.state.error = error.message;
    }

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
        <IcseFormGroup noMarginBottom>
          <TextArea
            labelText="Preview CRAIG JSON"
            rows={15}
            cols={75}
            className="marginBottomSmall fitContent rightTextAlign codeFont"
            value={formatConfig(this.state.json, !this.state.usePrettyJson)}
            readOnly={true}
            invalid={Boolean(this.state.error)}
            invalidText={this.state.error}
          />
        </IcseFormGroup>
          <DownloadCopyButtonSet
            disabled={Boolean(this.state.error)}
            json={this.state.json}
          />
      </IcseModal>
    );
  }
}
