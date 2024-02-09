import React from "react";
import PropTypes from "prop-types";
import { formatConfig, validate } from "../../../lib";
import { InlineNotification, Modal, TextInput } from "@carbon/react";
import { deepEqual } from "lazy-z";
import { JSONTextArea } from "../../utils/JSONTextArea";
import { onRequestSubmitJSONModal } from "../../../lib/craig-app";
import { CraigFormGroup, StatefulTabs } from "../../forms";
import { state } from "../../../lib/state";
import { Overview } from "../diagrams/Overview";

export class JSONModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.props.data,
      usePrettyJson: true,
      readOnlyJSON: this.props.import ? false : true,
      error: "",
    };

    if (this.props.import) {
      this.state.name = "";
    } else if (this.state.json) {
      try {
        validate(this.state.json);
        this.state.isValid = true;
      } catch (error) {
        this.state.error = error.message;
        this.state.isValid = false;
      }
    }

    this.toggleUsePrettyJson = this.toggleUsePrettyJson.bind(this);
    this.onEditJSONClick = this.onEditJSONClick.bind(this);
    this.handleJSONChange = this.handleJSONChange.bind(this);
  }

  toggleUsePrettyJson() {
    this.setState({ usePrettyJson: !this.state.usePrettyJson });
  }

  onEditJSONClick() {
    this.setState({ readOnlyJSON: !this.state.readOnlyJSON });
  }

  handleJSONChange(event) {
    if (this.state.readOnlyJSON) {
      return;
    }

    let textData = event.target.value;
    let isValid, json, error;

    try {
      // validation adds optional fields to needed components to ensure that
      // it is compatible with terraform. data will be stored here
      json = validate(JSON.parse(textData));
      isValid = true;
    } catch (err) {
      console.error(err);
      error = err.message;
      isValid = false;
    }

    this.setState({
      textData,
      isValid,
      json,
      error,
    });
  }

  render() {
    let tempCraig = new state();
    if (!this.props.import) {
      tempCraig.setUpdateCallback(() => {});
      tempCraig.hardSetJson(this.props.data.json, true);
    }
    let textAreaDidChange =
      this.state.json === undefined
        ? true
        : this.props.data && !deepEqual(this.props.data.json, this.state.json);

    return (
      <Modal
        size="lg"
        open={this.props.open}
        className="leftTextAlign"
        modalHeading={
          this.props.import
            ? "Import as New Project"
            : this.state.readOnlyJSON
            ? `Preview Configuration`
            : `Override Configuration`
        }
        primaryButtonText={this.props.import ? "Create Project" : "Done"}
        primaryButtonDisabled={
          this.state.readOnlyJSON ? false : !this.state.isValid
        }
        secondaryButtonText="Back"
        id="json-modal"
        onRequestClose={this.props.onClose}
        onRequestSubmit={(event) => {
          onRequestSubmitJSONModal(
            event,
            this.state,
            this.props,
            (shouldClose) => {
              if (shouldClose) {
                this.props.onClose();
              }
            }
          );
        }}
      >
        {!this.props.import && (
          <CraigFormGroup className="marginBottomSmall">
            <TextInput
              labelText="Project Name"
              id="project-name"
              name="name"
              componentName="project"
              value={this.state.name}
              onChange={() => {}}
              helperTextCallback={() => {}}
              readOnly
            />
          </CraigFormGroup>
        )}
        {this.props.import ? (
          <JSONTextArea
            json={this.state.json}
            projectName={this.state.name}
            override={!this.props.import && !this.state.readOnlyJSON}
            readOnly={this.state.readOnlyJSON}
            wrapped={this.state.usePrettyJson}
            import={this.props.import}
            value={
              this.state.readOnlyJSON && !textAreaDidChange
                ? formatConfig(this.state.json, !this.state.usePrettyJson)
                : this.state.textData
            }
            invalid={!this.state.isValid}
            invalidText={this.state.error}
            onChange={this.handleJSONChange}
            onClickWrapJSON={this.toggleUsePrettyJson}
            onEditJSONClick={this.onEditJSONClick}
          />
        ) : (
          <StatefulTabs
            hideHeading
            formName="Preview Diagram"
            secondTabName="Preview JSON"
            form={
              <div
                className="textAreaWithButtons formInSubForm"
                style={{
                  maxHeight: "60vh",
                  overflowY: "scroll",
                  borderBottom: "0.5rem solid white",
                }}
              >
                <center>
                  <Overview craig={tempCraig} small />
                </center>
              </div>
            }
            about={
              <JSONTextArea
                big
                json={this.state.json}
                projectName={this.state.name}
                override={!this.props.import && !this.state.readOnlyJSON}
                readOnly
                import={this.props.import}
                value={
                  this.state.readOnlyJSON && !textAreaDidChange
                    ? formatConfig(this.state.json, !this.state.usePrettyJson)
                    : this.state.textData
                }
                invalid={!this.state.isValid}
                invalidText={this.state.error}
                onChange={this.handleJSONChange}
                onClickWrapJSON={this.toggleUsePrettyJson}
                onEditJSONClick={this.onEditJSONClick}
              />
            }
          />
        )}
      </Modal>
    );
  }
}

JSONModal.defaultProps = {
  open: false,
};

JSONModal.propTypes = {
  open: PropTypes.bool.isRequired,
  data: PropTypes.shape({}),
  import: PropTypes.bool,
  current_project: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onProjectSave: PropTypes.func.isRequired,
};
