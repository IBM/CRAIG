import React from "react";
import {
  IcseFormGroup,
  IcseHeading,
  IcseSelect,
  SaveAddButton,
  StatelessToggleForm
} from "icse-react-assets";
import { contains, buildNumberDropdownList, kebabCase } from "lazy-z";
import { Modal, RadioButtonGroup, RadioButton, Tile } from "@carbon/react";
import { EdgeNetworkingDocs } from "../pages";
import edgeNetwork from "../../images/edge-network.png";
import PropTypes from "prop-types";
import "./edge-network.css";

const edgePatterns = [
  {
    id: "full-tunnel",
    name: "VPN"
  },
  {
    id: "waf",
    name: "Web Application Firewall (WAF)"
  },
  { id: "vpn-and-waf", name: "Both VPN and WAF" }
];

const edgeNetworks = [
  {
    id: "edge",
    name: "Create a new Edge VPC"
  },
  {
    id: "management",
    name: "Use existing Management VPC"
  }
];

const RadioGroup = props => {
  return (
    <RadioButtonGroup
      legendText={props.name}
      name={kebabCase(props.name)}
      onChange={name => props.handleRadioChange(props.type, name)}
      defaultSelected={props.defaultSelected}
      className="leftTextAlign marginBottom"
      disabled={props.disabled}
      orientation="vertical"
      invalid={props.invalid}
      invalidText={props.invalidText}
    >
      {props.groups.map(pattern => (
        <RadioButton
          labelText={pattern.name}
          value={pattern.id}
          id={pattern.id}
          key={pattern.id}
        />
      ))}
    </RadioButtonGroup>
  );
};

RadioGroup.defaultProps = {
  disabled: false
};

RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  groups: PropTypes.array.isRequired,
  invalid: PropTypes.bool.isRequired,
  invalidText: PropTypes.string.isRequired,
  handleRadioChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
};

class EdgeNetworkingForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideEdgeForm: true,
      edgeType: !this.props.craig.store.edge_pattern
        ? ""
        : this.props.craig.store.edge_vpc_name === "edge"
        ? "edge"
        : "management",
      pattern: this.props.craig.store.edge_pattern || "",
      zones: this.props.craig.store.edge_pattern
        ? String(this.props.craig.store.edge_zones)
        : "0",
      prevZones: this.props.craig.store.edge_pattern
        ? String(this.props.craig.store.edge_zones)
        : "0",
      hideModal: true
    };
    this.onToggle = this.onToggle.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onModalToggle = this.onModalToggle.bind(this);
  }

  onToggle() {
    this.setState({ hideEdgeForm: !this.state.hideEdgeForm });
  }

  onModalToggle() {
    if (this.props.craig.store.edge_vpc_name === undefined)
      this.setState({ hideModal: !this.state.hideModal });
    else this.onSubmit();
  }
  /**
   * handleRadioChange for radio buttons
   * @param {String} name selection
   */
  handleRadioChange(field, name) {
    this.setState({ [field]: name });
  }

  onChange(event) {
    let { name, value } = event.target;
    if (name === "zones") {
      this.setState({ zones: Number(value) });
    } else this.setState({ [name]: value });
  }

  onSubmit() {
    this.props.craig.createEdgeVpc(
      this.state.pattern,
      this.state.edgeType === "management",
      Number(this.state.zones)
    );
    this.props.craig.f5.vsi.create(this.state);
    this.setState({
      hideModal: true,
      hideEdgeForm: true,
      prevZones: this.state.zones
    });
  }

  render() {
    return (
      <div className="subForm">
        <StatelessToggleForm
          iconType={this.props.craig.store.edge_vpc_name ? "edit" : "add"}
          name="(Optional) Transit VPC and Edge Networking"
          onIconClick={this.onToggle}
          hide={this.state.hideEdgeForm}
        >
          <IcseFormGroup>
            <div>
              <EdgeNetworkingDocs />
              <div className="formInSubForm">
                <IcseHeading
                  name="Configure Edge Networking"
                  type="subHeading"
                  className="marginBottomSmall"
                  buttons={
                    <SaveAddButton
                      name="edge-networking"
                      disabled={
                        this.state.zones === this.state.prevZones
                          ? true
                          : this.props.craig.store.edge_vpc_name !== undefined
                          ? this.state.zones ===
                            String(this.props.craig.store.edge_zones)
                          : contains(
                              [this.state.edgeType, this.state.pattern],
                              ""
                            ) || this.state.zones === "0"
                      }
                      onClick={this.onModalToggle}
                    />
                  }
                />
                <IcseFormGroup noMarginBottom>
                  <RadioGroup
                    name="Edge Network"
                    type="edgeType"
                    defaultSelected={this.state.edgeType}
                    groups={edgeNetworks}
                    disabled={
                      this.props.craig.store.edge_vpc_name !== undefined
                    }
                    invalid={this.state.edgeType === ""}
                    invalidText="Select a VPC to create an edge network"
                    handleRadioChange={this.handleRadioChange}
                  />
                  <RadioGroup
                    name="Edge Networking Pattern"
                    type="pattern"
                    defaultSelected={this.state.pattern}
                    groups={edgePatterns}
                    disabled={
                      this.props.craig.store.edge_vpc_name !== undefined ||
                      this.state.edgeType === ""
                    }
                    invalid={
                      this.state.pattern === "" && this.state.edgeType !== ""
                    }
                    invalidText="Select a pattern to create an edge network"
                    handleRadioChange={this.handleRadioChange}
                  />
                </IcseFormGroup>
                <IcseFormGroup>
                  <IcseSelect
                    groups={
                      this.state.zones === "0"
                        ? buildNumberDropdownList(4)
                        : buildNumberDropdownList(3, 1)
                    }
                    formName="edge-network"
                    name="zones"
                    value={this.state.zones.toString()}
                    labelText="Edge Networking Zones"
                    handleInputChange={this.onChange}
                    disabled={this.state.edgeType === ""}
                    invalid={
                      this.state.edgeType === ""
                        ? false
                        : this.state.zones === "0"
                    }
                    invalidText="Select availability zones"
                  />
                </IcseFormGroup>
              </div>
            </div>
            <div className="edgeTileMargin">
              <a
                href={edgeNetwork}
                target="_blank"
                rel="noreferrer noopener"
                className="tile"
              >
                <Tile className="edgeTile borderGray">
                  <h4>Edge Network</h4>
                  <img
                    alt="Edge Networking Image"
                    src={edgeNetwork}
                    className="imageMargin edgeTileImage magnifier"
                  />
                </Tile>
              </a>
            </div>
          </IcseFormGroup>
        </StatelessToggleForm>
        {this.state.hideModal === false && (
          <Modal
            className="leftTextAlign"
            modalHeading={"Are you sure you want to create an edge network?"}
            open={this.state.hideModal === false}
            onRequestSubmit={this.onSubmit}
            onRequestClose={this.onModalToggle}
            primaryButtonText="Submit"
            secondaryButtonText="Cancel"
            danger
          >
            {this.state.edgeType === "management" ? (
              <p>
                Adding onto the management VPC cannot be undone without
                resetting your configuration.
              </p>
            ) : (
              <p>
                This action can not be undone and may require you to reset your
                configuration.
              </p>
            )}
          </Modal>
        )}
      </div>
    );
  }
}

export default EdgeNetworkingForm;
