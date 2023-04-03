import React from "react";
import { Button, TextArea, Modal } from "@carbon/react";
import { CheckmarkFilled, Misuse } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { IcseFormGroup, IcseHeading } from "icse-react-assets";
import validate from "../../lib/validate";

class CustomJson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textData: "",
      errorList: "",
      isValid: false,
      showModal: false,
      validJson: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  /**
   * handle text change
   * @param {event} event
   */
  handleChange(event) {
    let data = event.target.value; // new data
    let errorText = ""; // errors
    let isValid = false; // submission valid
    let validatedConfigJson = null; // configuration

    // try to validate json
    try {
      // validation adds optional fields to needed components to ensure that
      // it is compatible with terraform. data will be stored here
      validatedConfigJson = validate(JSON.parse(data));
      errorText = "JSON Successfully Validated.";
      isValid = true;
    } catch (err) {
      // on error, set error text to message
      console.error(err);
      errorText = err.message;
    }

    // set state
    this.setState({
      textData: data,
      errorList: errorText,
      isValid: isValid,
      validJson: isValid ? validatedConfigJson : null
    });
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleSubmit() {
    this.props.craig.hardSetJson(this.state.validJson);
    this.toggleModal();
    window.location.pathname = "/form/resourceGroups";
  }

  render() {
    return (
      <div>
        <IcseHeading name="Import existing CRAIG.json data for terraform deployment." />
        <div className="subForm">
          <IcseFormGroup>
            <TextArea
              labelText="Custom CRAIG Data"
              rows={20}
              cols={75}
              value={this.state.textData}
              placeholder="Paste your override JSON here"
              onChange={this.handleChange}
              invalid={!this.state.isValid}
              invalidText={this.state.errorList}
              className="codeFont"
            />
          </IcseFormGroup>
          <IcseFormGroup noMarginBottom>
            <Button
              kind="tertiary"
              disabled={this.state.isValid === false ? true : false}
              onClick={this.toggleModal}
            >
              {this.state.isValid ? (
                <CheckmarkFilled className="marginRightSmall" />
              ) : (
                <Misuse className="marginRightSmall" />
              )}
              Submit JSON
            </Button>
          </IcseFormGroup>
        </div>
        <div className="smallerText">
          <p>{"For more information, visit: "}</p>
        </div>
        <div className="marginBottomSmall">
          <a
            href="/docs/json"
            target="_blank"
            className="smallerText"
            rel="noreferrer"
          >
            CRAIG JSON Documentation
          </a>
        </div>
        {this.state.showModal && (
          <Modal
            className="leftTextAlign"
            modalHeading="Are you sure you want to add custom JSON data?"
            open={this.state.showModal}
            onRequestSubmit={this.handleSubmit}
            onRequestClose={this.toggleModal}
            primaryButtonText="Submit"
            secondaryButtonText="Cancel"
            danger
          >
            <p>
              Importing custom data will overwrite any changes, these actions
              cannot be undone.
            </p>
          </Modal>
        )}
      </div>
    );
  }
}

CustomJson.propTypes = {
  craig: PropTypes.shape({
    hardSetJson: PropTypes.func.isRequired
  }).isRequired
};

export default CustomJson;
