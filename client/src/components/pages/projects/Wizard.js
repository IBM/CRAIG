import React from "react";
import {
  FilterableMultiSelect,
  Modal,
  Select,
  SelectItem,
  TextInput,
  Toggle,
} from "@carbon/react";
import PropTypes from "prop-types";
import {
  kebabCase,
  azsort,
  contains,
  isEmpty,
  isNullOrEmptyString,
  buildNumberDropdownList,
} from "lazy-z";
import {
  invalidProjectName,
  invalidProjectNameText,
  releaseNotes,
  wizard,
} from "../../../lib";
import { CraigFormGroup, CraigFormHeading } from "../../forms";
import { ToolTipWrapper } from "../../forms/utils/ToolTip";
const mixedTemplate = require("../../../lib/docs/templates/slz-mixed.json");

class Wizard extends React.Component {
  constructor(props) {
    super(props);
    let now = new Date();
    let date = now.toLocaleDateString().replaceAll("/", "-");
    let time = now.toLocaleTimeString().replace(":", "-");
    time = time.split(":")[0] + "-" + time.split(" ")[1];
    this.state = {
      vpc_networks: ["Management VPC", "Workload VPC"],
      use_tgw: true,
      region: "us-south",
      power_vs_zones: [],
      use_atracker: false,
      cos_vpe: true,
      use_f5: false,
      name: "new-wizard-project-" + date + "-" + time.toLowerCase(),
      json: { ...mixedTemplate },
      craig_version: releaseNotes[0].version,
      key_management_service: "",
      template: "Empty Project",
      enable_power_vs: false,
      power_vs_high_availability: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handlePowerZonesChange = this.handlePowerZonesChange.bind(this);
    this.onRequestSubmit = this.onRequestSubmit.bind(this);
    this.modalShouldBeDisabled = this.modalShouldBeDisabled.bind(this);
  }

  modalShouldBeDisabled() {
    return (
      // if project name is invalid
      invalidProjectName(this.state, this.props) ||
      // if is power vs and no zones
      (this.state.enable_power_vs && isEmpty(this.state.power_vs_zones)) ||
      // or is fs cloud and no key management service
      (this.state.fs_cloud &&
        isNullOrEmptyString(this.state.key_management_service))
    );
  }

  onRequestSubmit() {
    let stateCopy = { ...this.state };
    stateCopy.project_name = stateCopy.name;
    stateCopy.json = wizard(stateCopy, stateCopy.json);
    this.props.onProjectSave(stateCopy, this.props, true).then(() => {
      this.props.onRequestClose();
      if (contains(window.location.pathname, "/v2"))
        window.location.pathname = "/v2/settings";
      else window.location.pathname = "/";
    });
  }

  handleChange(event) {
    let { name, value } = event.target;
    if (name === "vpc_networks" && value.length === 0) {
      this.setState({
        [name]: value,
        cos_vpe: false,
      });
    } else if (name === "endpoints") {
      value = kebabCase(value);
    }
    if (name === "region") {
      this.setState({
        region: value,
      });
    }
    if (name === "ha_power_zone_site_1" && value !== "") {
      let powerHaMap = {
        mad02: "eu-de-1",
        mad04: "eu-de-2",
        syd04: "syd05",
        tok04: "osa21",
        "us-east": "us-south",
        wdc06: "dal12",
        wdc07: "dal10",
      };
      this.setState({ power_vs_zones: [value].concat([powerHaMap[value]]) });
    } else this.setState({ [name]: value });
  }

  handleToggle(name) {
    if (name === "use_power_vs") {
      this.setState({
        [name]: !this.state[name],
        power_vs_zones: [],
      });
    } else if (name === "power_vs_high_availability" && !this.state[name]) {
      this.setState({
        [name]: !this.state[name],
        power_vs_zones: [],
      });
    } else this.setState({ [name]: !this.state[name] });
  }

  handlePowerZonesChange(items) {
    this.setState({ power_vs_zones: items.selectedItems });
  }

  render() {
    let vpcRegionSelectGroup = [
      "us-south",
      "us-east",
      "eu-de",
      "eu-gb",
      "eu-es",
    ]
      .concat(
        this.state.fs_cloud
          ? []
          : ["jp-tok", "jp-osa", "au-syd", "ca-tor", "br-sao"],
      )
      .sort(azsort);

    return (
      <Modal
        open={this.props.show}
        heading="Project Setup Wizard"
        primaryButtonText="Get Started"
        onRequestClose={this.props.onRequestClose}
        onRequestSubmit={this.onRequestSubmit}
        primaryButtonDisabled={this.modalShouldBeDisabled()}
        size="lg"
        className="leftTextAlign"
      >
        <div className="formInSubForm">
          <CraigFormGroup>
            <TextInput
              id="project-name"
              labelText="Project Name"
              value={this.state.name}
              invalid={invalidProjectName(this.state, this.props)}
              invalidText={invalidProjectNameText(this.state, this.props)}
              onChange={this.handleChange}
              className="fieldWidth"
            />
          </CraigFormGroup>
          <CraigFormHeading type="subHeading" name="Financial Services Cloud" />
          <p className="marginBottomSmall">
            Show only Financial Services Cloud validated regions.
          </p>
          <CraigFormGroup>
            <Toggle
              labelA="False"
              labelB="True"
              id="use-fs-cloud"
              labelText="Use FS Cloud"
              defaultToggled={this.state.fs_cloud}
              onToggle={() => this.handleToggle("fs_cloud")}
              value={this.state.fs_cloud}
              className="fieldWidth leftTextAlign fitContent cds--form-item"
            />
            {this.state.fs_cloud && (
              <Select
                id="key_management_service"
                labelText="Select a Key Management Service"
                name="key_management_service"
                value={this.state.key_management_service || undefined}
                onChange={this.handleChange}
                className="fieldWidth"
              >
                {["Key Protect", "Bring Your Own HPCS"].map((value) => (
                  <SelectItem
                    key={`key_management_service-${value}`}
                    text={value}
                    value={value}
                  />
                ))}
              </Select>
            )}
          </CraigFormGroup>
          <CraigFormHeading
            type="subHeading"
            name="Virtual Private Cloud (VPC)"
          />
          <p className="marginBottomSmall">
            Choose your VPC region & availability zones
          </p>
          <CraigFormGroup>
            <Select
              id="region"
              name="region"
              labelText="VPC Region"
              value={this.state.region}
              onChange={this.handleChange}
              className="fieldWidth"
            >
              {vpcRegionSelectGroup.map((value) => (
                <SelectItem
                  key={`vpc_region-${value}`}
                  text={value}
                  value={value}
                />
              ))}
            </Select>
            <ToolTipWrapper
              id="availability_zones"
              labelText="Availability Zones"
              tooltip={{
                content:
                  "The number of availability zones for VPCs in your template",
              }}
            >
              <Select
                id="zones"
                name="zones"
                labelText=" "
                value={this.state.zones || "3"}
                onChange={this.handleChange}
                className="fieldWidth tooltip"
              >
                {buildNumberDropdownList(3, 1).map((value) => (
                  <SelectItem
                    key={`zones-${value}`}
                    text={value}
                    value={value}
                  />
                ))}
              </Select>
            </ToolTipWrapper>
          </CraigFormGroup>
          <CraigFormGroup>
            <FilterableMultiSelect
              id="wizard-vpcs"
              titleText="Select VPC Networks"
              initialSelectedItems={this.state.vpc_networks}
              items={["Management VPC", "Workload VPC"]}
              itemToString={(item) => (item ? item : "")}
              onChange={(event) => {
                let vpcNetworkData = {
                  target: {
                    name: "vpc_networks",
                    value: event.selectedItems,
                  },
                };
                this.handleChange(vpcNetworkData);
              }}
              className="fieldWidth leftTextAlign"
            />
            <ToolTipWrapper
              id="use_tgw"
              labelText="Use Transit Gateway"
              tooltip={{
                content:
                  "Create a Transit Gateway to allow for connectivity between VPCs",
              }}
            >
              <Toggle
                labelA="False"
                labelB="True"
                id="wizard-use-tgw"
                labelText=" "
                defaultToggled={this.state.use_tgw}
                onToggle={() => {
                  this.handleToggle("use_tgw");
                }}
                value={this.state.use_tgw}
                className="fieldWidth leftTextAlign fitContent cds--form-item tooltip"
              />
            </ToolTipWrapper>
          </CraigFormGroup>
          <CraigFormGroup>
            <ToolTipWrapper
              id="wizard-use-atracker"
              labelText="Use Activity Tracker"
              tooltip={{
                content:
                  "Use Activity Tracker with Cloud Object Storage to captue and monitor IBM Cloud activity.",
              }}
            >
              <Toggle
                labelA="False"
                labelB="True"
                id="wizard-use-atracker"
                labelText=" "
                defaultToggled={this.state.use_atracker}
                onToggle={() => {
                  this.handleToggle("use_atracker");
                }}
                value={this.state.use_atracker}
                className="fieldWidth leftTextAlign fitContent cds--form-item tooltip"
              />
            </ToolTipWrapper>
            <ToolTipWrapper
              id="wizard-cos-vpe"
              labelText="Object Storage Connectivity"
              tooltip={{
                content:
                  "Create Virtual Private Endpoint Gateways for IBM Cloud Object storage in your VPC networks.",
              }}
            >
              <Toggle
                labelA="False"
                labelB="True"
                id="wizard-cos-vpe"
                labelText=" "
                defaultToggled={this.state.cos_vpe}
                disabled={this.state.vpc_networks.length === 0}
                onToggle={() => {
                  this.handleToggle("cos_vpe");
                }}
                value={this.state.cos_vpe}
                className="fieldWidth leftTextAlign fitContent cds--form-item tooltip"
              />
            </ToolTipWrapper>
          </CraigFormGroup>
          <CraigFormGroup>
            <ToolTipWrapper
              id="wizard-use-f5"
              labelText="Use F5 Big IP"
              tooltip={{
                content:
                  "Create F5 Big IP instances and networking components on an Edge VPC.",
                align: "top-left",
              }}
            >
              <Toggle
                labelA="False"
                labelB="True"
                id="wizard-cos-vpe"
                labelText=" "
                defaultToggled={this.state.use_f5}
                onToggle={() => {
                  this.handleToggle("use_f5");
                }}
                value={this.state.use_f5}
                className="fieldWidth leftTextAlign fitContent cds--form-item tooltip"
              />
            </ToolTipWrapper>
          </CraigFormGroup>
          <CraigFormHeading type="subHeading" name="Power Virtual Servers" />
          <p className="marginBottomSmall">
            Choose your VPC region & availability zones
          </p>
          <CraigFormGroup>
            <Toggle
              labelA="False"
              labelB="True"
              id="use-power-vs"
              labelText="Enable Power Virtual Servers"
              defaultToggled={this.state.enable_power_vs}
              onToggle={() => this.handleToggle("enable_power_vs")}
              value={this.state.enable_power_vs}
              className="fieldWidth leftTextAlign fitContent cds--form-item"
            />
            {this.state.enable_power_vs && (
              <ToolTipWrapper
                id="wizard-use-f5"
                labelText="High Availability"
                tooltip={{
                  content:
                    "Enable High Availability and Disaster Recovery for Power VS by using enabled zones Dallas 12 and Washington DC 6.",
                }}
              >
                <Toggle
                  labelA="False"
                  labelB="True"
                  id="use-power-vs-hadr"
                  labelText=" "
                  defaultToggled={this.state.power_vs_high_availability}
                  onToggle={() =>
                    this.handleToggle("power_vs_high_availability")
                  }
                  value={this.state.power_vs_high_availability}
                  className="fieldWidth leftTextAlign fitContent cds--form-item tooltip"
                />
              </ToolTipWrapper>
            )}
          </CraigFormGroup>
          {this.state.enable_power_vs &&
            !this.state.power_vs_high_availability && (
              <CraigFormGroup>
                <FilterableMultiSelect
                  className="fieldWidth leftTextAlign"
                  id="options-power-zones"
                  titleText="Power VS Zone"
                  onChange={this.handlePowerZonesChange}
                  initialSelectedItems={this.state.power_vs_zones || []}
                  key={JSON.stringify(this.state.power_vs_zones)}
                  items={
                    {
                      "au-syd": ["syd04", "syd05"],
                      "eu-de": ["eu-de-1", "eu-de-2"],
                      "eu-gb": ["lon04", "lon06"],
                      "eu-es": ["mad02", "mad04"],
                      "us-east": ["us-east", "wdc06", "wdc07"],
                      "us-south": ["us-south", "dal10", "dal12"],
                      "jp-tok": ["tok04"],
                      "br-sao": ["sao01", "sao04"],
                      "ca-tor": ["tor01"],
                      "jp-osa": ["osa21"],
                    }[this.state.region]
                  }
                  itemToString={(item) => (item ? item : "")}
                  invalid={
                    !contains(
                      [
                        "au-syd",
                        "us-south",
                        "eu-de",
                        "eu-gb",
                        "eu-es",
                        "us-east",
                        "br-sao",
                        "jp-tok",
                        "ca-tor",
                        "jp-osa",
                      ],
                      this.state.region,
                    ) || isEmpty(this.state.power_vs_zones)
                  }
                  invalidText={
                    !contains(
                      [
                        "au-syd",
                        "us-south",
                        "eu-de",
                        "eu-gb",
                        "eu-es",
                        "us-east",
                        "br-sao",
                        "jp-tok",
                        "ca-tor",
                        "jp-osa",
                      ],
                      this.state.region,
                    )
                      ? `The region ${this.state.region} does not have any available Power VS zones`
                      : "Select at least one Availability Zone"
                  }
                />
              </CraigFormGroup>
            )}
          {this.state.power_vs_high_availability && (
            <CraigFormGroup>
              <Select
                className="fieldWidth leftTextAlign"
                id="ha_power_zone_site_1"
                name="ha_power_zone_site_1"
                labelText="Power VS Site 1"
                onChange={this.handleChange}
                value={this.state.power_vs_zones[0] || ""}
                invalid={isEmpty(this.state.power_vs_zones)}
                invalidText="Select an Availability Zone"
              >
                {[
                  "",
                  "mad02",
                  "mad04",
                  "syd04",
                  "tok04",
                  "us-east",
                  "wdc06",
                  "wdc07",
                ].map((value) => (
                  <SelectItem
                    key={`ha_power_zone_site_1-${value}`}
                    text={value}
                    value={value}
                  />
                ))}
              </Select>
              <Select
                className="fieldWidth leftTextAlign"
                id="ha_power_zone_site_2"
                name="ha_power_zone_site_2"
                labelText="Power VS Site 2"
                value={this.state.power_vs_zones[1] || ""}
                readOnly
              >
                {[
                  "",
                  "eu-de-1",
                  "eu-de-2",
                  "osa21",
                  "syd05",
                  "us-south",
                  "dal10",
                  "dal12",
                ].map((value) => (
                  <SelectItem
                    key={`ha_power_zone_site_2-${value}`}
                    text={value}
                    value={value}
                  />
                ))}
              </Select>
            </CraigFormGroup>
          )}
        </div>
      </Modal>
    );
  }
}

Wizard.defaultProps = {
  show: false,
  data: {
    name: "",
  },
};

Wizard.propTypes = {
  show: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  projects: PropTypes.shape({}).isRequired,
  onProjectSave: PropTypes.func.isRequired,
};

export default Wizard;
