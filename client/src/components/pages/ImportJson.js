import React from "react";
import { Button, Modal } from "@carbon/react";
import { CheckmarkFilled, Misuse } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { IcseTextInput } from "icse-react-assets";
import { contains, isInRange } from "lazy-z";
import { slzToCraig, validate } from "../../lib";
import { JSONTextArea } from "../utils/JSONTextArea";
import "./import-json.css";
import { CraigFormGroup } from "../forms";

const constants = require("../../lib/constants");

class ImportJson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textData: "",
      errorList: "",
      isValid: false,
      showModal: false,
      validJson: null,
      prefix: "",
      hasInvalidPrefix: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handlePrefix = this.handlePrefix.bind(this);
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
      if (this.props.slz) {
        validatedConfigJson = slzToCraig(JSON.parse(data), this.state.prefix);
      } else {
        validatedConfigJson = validate(JSON.parse(data));
      }
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
      validJson: isValid ? validatedConfigJson : null,
    });
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleSubmit() {
    this.props.craig.hardSetJson(this.state.validJson, this.props.slz);
    this.toggleModal();
    window.location.pathname = contains(window.location.pathname, "/beta")
      ? "/beta/services"
      : this.props.slz
      ? "/"
      : "/form/resourceGroups";
  }

  handlePrefix(event) {
    let prefix = event.target.value;
    this.setState({
      prefix,
      hasInvalidPrefix: prefix.match(constants.newResourceNameExp) === null,
    });
  }

  render() {
    let canBeSubmitted = this.props.slz
      ? this.state.isValid && !this.state.hasInvalidPrefix
      : this.state.isValid;

    return (
      <div>
        <div className="smallerText">
          {this.props.slz
            ? "Import resource configuration from SLZ override.json file."
            : "Import existing CRAIG.json data for terraform deployment."}
        </div>
        <div className="subForm">
          {this.props.slz && (
            <CraigFormGroup>
              <IcseTextInput
                id="slz-prefix"
                labelText="Secure Landing Zone Prefix"
                field="prefix"
                value={this.state.prefix}
                invalid={
                  isInRange(this.state.prefix.length, 2, 16) === false ||
                  this.state.prefix.match(constants.newResourceNameExp) === null
                }
                invalidText="Invalid prefix. Must match the regular expression: /[a-z][a-z0-9-]*[a-z0-9]/"
                onChange={this.handlePrefix}
              />
            </CraigFormGroup>
          )}
          <JSONTextArea
            import
            override={this.props.slz ? true : false}
            value={this.state.textData}
            onChange={this.handleChange}
            invalid={!this.state.isValid}
            invalidText={
              this.props.slz && this.state.hasInvalidPrefix
                ? "Enter a valid prefix to submit"
                : this.state.errorList
            }
            link={
              this.props.slz
                ? "https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone"
                : undefined
            }
          />
          <CraigFormGroup noMarginBottom>
            <Button
              kind="tertiary"
              disabled={!canBeSubmitted}
              onClick={this.toggleModal}
              aria-label="json-submit"
              className="import-btn"
            >
              {canBeSubmitted ? (
                <CheckmarkFilled className="marginRightSmall" />
              ) : (
                <Misuse className="marginRightSmall" />
              )}
              Submit JSON
            </Button>
          </CraigFormGroup>
        </div>
        <div className="smallerText">
          <p>{"For more information, visit: "}</p>
        </div>
        <div className="marginBottomSmall">
          <a
            href={
              this.props.slz
                ? "https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone"
                : "/docs/json"
            }
            target="_blank"
            className="smallerText"
            rel="noreferrer"
          >
            {this.props.slz
              ? "Secure Landing Zone Documentation"
              : "CRAIG JSON Documentation"}
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
            <br />
            <strong className="slz-warn">
              Imported SLZ data may not return a valid configuration immediately
              and may require editing.
            </strong>
          </Modal>
        )}
      </div>
    );
  }
}

ImportJson.defaultProps = {
  slz: false,
};

ImportJson.propTypes = {
  craig: PropTypes.shape({
    hardSetJson: PropTypes.func.isRequired,
  }).isRequired,
  slz: PropTypes.bool.isRequired,
};

export default ImportJson;
