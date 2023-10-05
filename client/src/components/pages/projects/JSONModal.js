import React from "react";
import {
  IcseModal,
  IcseToggle,
  IcseFormGroup,
  IcseNameInput,
} from "icse-react-assets";
import { formatConfig, validate } from "../../../lib";
import { DownloadCopyButtonSet } from "../../utils";
import { TextArea } from "@carbon/react";
import PropTypes from "prop-types";

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
        heading={`View Configuration`}
        primaryButtonText={"Done"}
        primaryButtonDisabled={false}
        secondaryButtonText={"Back"}
        onRequestClose={this.props.onClose}
        onRequestSubmit={() => {
          this.props.onClose();
        }}
      >
        {this.state.name && (
          <IcseFormGroup>
            <IcseNameInput
              labelText={"Project Name"}
              invalid={false}
              invalidText=""
              id="project-name"
              componentName="project"
              value={this.state.name}
              onChange={() => {}}
              helperTextCallback={() => {}}
              readOnly={true}
            />
          </IcseFormGroup>
        )}
        <IcseFormGroup className="noMarginBottom">
          <IcseToggle
            labelText="Use Pretty JSON"
            defaultToggled={this.state.usePrettyJson}
            onToggle={this.toggleUsePrettyJson}
            className="displayFlex"
            id="use-pretty-json"
            disabled={false}
            toggleFieldName="usePrettyJson"
            value={this.state.usePrettyJson}
          />
        </IcseFormGroup>
        <IcseFormGroup>
          <DownloadCopyButtonSet
            disabled={Boolean(this.state.error)}
            json={this.state.json}
            projectName={this.state.name}
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
      </IcseModal>
    );
  }
}

JSONModal.defaultProps = {
  open: false,
};

JSONModal.propTypes = {
  open: PropTypes.bool.isRequired,
};
