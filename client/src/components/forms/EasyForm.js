import React from "react";
import PropTypes from "prop-types";
import {
  IcseFormGroup,
  IcseHeading,
  IcseTextInput,
  IcseSelect,
  IcseToggle,
  IcseNumberSelect,
  IcseMultiSelect,
} from "icse-react-assets";
import { invalidNewResourceName } from "../../lib";
import { titleCase, kebabCase, azsort, contains, isEmpty } from "lazy-z";

class EasyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vpc_networks: ["Management VPC", "Workload VPC"],
      use_tgw: true,
      region: "us-south",
      power_vs_zones: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handlePowerZonesChange = this.handlePowerZonesChange.bind(this);
  }

  handleChange(event) {
    let { name, value } = event.target;
    if (name === "endpoints") {
      value = kebabCase(value);
    }
    if (name === "region") {
      this.setState({
        region: value,
        power_vs_zones: [],
      });
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
        [name]: !this.state.name,
        power_vs_zones: ["dal12", "wdc06"],
      });
    } else this.setState({ [name]: !this.state[name] });
  }

  handlePowerZonesChange(items) {
    this.setState({ power_vs_zones: items.selectedItems });
  }

  render() {
    return (
      <>
        <IcseHeading type="subHeading" name="Financial Services Cloud" />
        <p className="marginBottomSmall">
          Show only Financial Services Cloud validated regions.
        </p>
        <IcseFormGroup>
          <IcseToggle
            labelText="Use FS Cloud"
            defaultToggled={this.state.fs_cloud}
            onToggle={() => this.handleToggle("fs_cloud")}
            id="use-fs-cloud"
            toggleFieldName="fs_cloud"
            value={this.state.fs_cloud}
          />
          {this.state.fs_cloud && (
            <IcseSelect
              labelText="Select a Key Management Service"
              name="key_management_service"
              formName="easy"
              groups={["Key Protect", "Bring Your Own HPCS"]}
              handleInputChange={this.handleChange}
              value={this.state.key_management_service}
            />
          )}
        </IcseFormGroup>
        <IcseHeading type="subHeading" name="Virtual Private Cloud (VPC)" />
        <p className="marginBottomSmall">
          Choose your VPC region & availability zones
        </p>
        <IcseFormGroup>
          <IcseSelect
            formName="easy"
            name="region"
            labelText="VPC Region"
            value={this.state.region}
            groups={["us-south", "us-east", "eu-de", "eu-gb"]
              .concat(
                this.state.fs_cloud
                  ? []
                  : ["jp-tok", "jp-osa", "au-syd", "ca-tor", "br-sao"]
              )
              .sort(azsort)}
            handleInputChange={this.handleChange}
          />
          <IcseNumberSelect
            max={3}
            formName="options"
            name="zones"
            labelText="Availability Zones"
            value={this.state.zones || 3}
            handleInputChange={this.handleChange}
            className="fieldWidth"
            tooltip={{
              content:
                "The number of availability zones for VPCs in your template",
            }}
          />
        </IcseFormGroup>
        <IcseFormGroup>
          <IcseMultiSelect
            id="easy-vpcs"
            titleText="Select VPC Networks"
            initialSelectedItems={this.state.vpc_networks}
            items={["Management VPC", "Workload VPC"]}
            onChange={(event) => {
              let vpcNetworkData = {
                target: {
                  name: "vpc_networks",
                  value: event.selectedItems,
                },
              };
              this.handleChange(vpcNetworkData);
            }}
          />
          <IcseToggle
            labelText="Use Transit Gateway"
            defaultToggled={this.state.use_tgw}
            onToggle={() => {
              this.handleToggle("use_tgw");
            }}
            id="easy-use-tgw"
            toggleFieldName="use_tgw"
            value={this.state.use_tgw}
            tooltip={{
              content:
                "Create a Transit Gateway to allow for connectivity between VPCs",
            }}
          />
        </IcseFormGroup>
        <IcseFormGroup>
          <IcseToggle
            labelText="Use Activity Tracker"
            defaultToggled={this.state.use_atracker}
            onToggle={() => {
              this.handleToggle("use_atracker");
            }}
            id="easy-use-atracker"
            toggleFieldName="use_atracker"
            value={this.state.use_atracker}
            tooltip={{
              content:
                "Use Activity Tracker with Cloud Object Storage to captue and monitor IBM Cloud activity.",
            }}
          />
          <IcseToggle
            labelText="Object Storage Connectivity"
            defaultToggled={this.state.cos_vpe}
            onToggle={() => {
              this.handleToggle("cos_vpe");
            }}
            id="easy-cos-vpe"
            toggleFieldName="cos_vpe"
            value={this.state.cos_vpe}
            tooltip={{
              content:
                "Create Virtual Private Endpoint Gateways for IBM Cloud Object storage in your VPC networks.",
            }}
          />
        </IcseFormGroup>
        <IcseFormGroup>
          <IcseToggle
            labelText="Use F5 Big IP"
            defaultToggled={this.state.use_f5}
            onToggle={() => {
              this.handleToggle("use_f5");
            }}
            id="easy-use-f5"
            toggleFieldName="use_f5"
            value={this.state.use_f5}
            tooltip={{
              content:
                "Crate F5 Big IP instances and networking components on an Edge VPC",
            }}
          />
        </IcseFormGroup>
        <IcseHeading type="subHeading" name="Power Virtual Servers" />
        <p className="marginBottomSmall">
          Choose your VPC region & availability zones
        </p>
        <IcseFormGroup>
          <IcseToggle
            labelText="Enable Power Virtual Servers"
            defaultToggled={this.state.enable_power_vs}
            onToggle={() => this.handleToggle("enable_power_vs")}
            id="use-power-vs"
            toggleFieldName="enable_power_vs"
            value={this.state.enable_power_vs}
          />
          {this.state.enable_power_vs && (
            <IcseToggle
              labelText="High Availability"
              defaultToggled={this.state.power_vs_high_availability}
              onToggle={() => this.handleToggle("power_vs_high_availability")}
              id="use-power-vs-hadr"
              toggleFieldName="power_vs_high_availability"
              value={this.state.power_vs_high_availability}
              tooltip={{
                content:
                  "Enable High Availability and Disaster Recovery for Power VS by using enabled zones Dallas 12 and Washington DC 6",
              }}
            />
          )}
        </IcseFormGroup>
        <IcseFormGroup>
          {this.state.enable_power_vs && (
            <IcseMultiSelect
              id="options-power-zones"
              titleText="Power VS Zone"
              onChange={this.handlePowerZonesChange}
              initialSelectedItems={this.state.power_vs_zones || []}
              key={JSON.stringify(this.state.power_vs_zones)}
              items={
                this.state.power_vs_high_availability
                  ? ["dal12", "wdc06"]
                  : {
                      "au-syd": ["syd04", "syd05"],
                      "eu-de": ["eu-de-1", "eu-de-2"],
                      "eu-gb": ["lon04", "lon06"],
                      "us-east": ["us-east", "wdc06", "wdc07"],
                      "us-south": ["us-south", "dal10", "dal12"],
                      "jp-tok": ["tok04"],
                      "br-sao": ["sao01"],
                      "ca-tor": ["tor01"],
                    }[this.state.region]
              }
              invalid={
                !contains(
                  [
                    "au-syd",
                    "us-south",
                    "eu-de",
                    "eu-gb",
                    "us-east",
                    "br-sao",
                    "jp-tok",
                    "ca-tor",
                  ],
                  this.state.region
                ) || isEmpty(this.state.power_vs_zones)
              }
              invalidText={
                !contains(
                  [
                    "au-syd",
                    "us-south",
                    "eu-de",
                    "eu-gb",
                    "us-east",
                    "br-sao",
                    "jp-osa",
                    "ca-tor",
                  ],
                  this.state.region
                )
                  ? `The region ${this.state.region} does not have any available Power VS zones`
                  : "Select at least one Availability Zone"
              }
            />
          )}
        </IcseFormGroup>
      </>
    );
  }
}

export default EasyForm;
