import React from "react";
import {
  IcseFormGroup,
  IcseSelect,
  IcseTextInput,
  buildFormFunctions,
  IcseHeading,
  SaveAddButton,
  IcseNumberSelect,
  IcseToggle,
  IcseMultiSelect,
  ToolTipWrapper,
} from "icse-react-assets";
import PropTypes from "prop-types";
import { Button, Tag, TextArea } from "@carbon/react";
import {
  deepEqual,
  kebabCase,
  azsort,
  titleCase,
  contains,
  isEmpty,
} from "lazy-z";
import { invalidNewResourceName, invalidTagList } from "../../lib";
import { Rocket } from "@carbon/icons-react";
import "./options.css";

const tagColors = ["red", "magenta", "purple", "blue", "cyan", "teal", "green"];

class OptionsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.data,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleTags = this.handleTags.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.disableSave = this.disableSave.bind(this);
    this.handlePowerZonesChange = this.handlePowerZonesChange.bind(this);
    buildFormFunctions(this);
  }

  handleTags(event) {
    let taglist = event.target.value
      ? event.target.value
          .replace(/\s\s+/g, "") // replace extra spaces
          .replace(/,(?=,)/g, "") // prevent null tags from
          .replace(/[^\w,-]/g, "")
          .split(",")
      : [];
    this.setState({ tags: taglist });
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

  disableSave() {
    return (
      deepEqual(this.state, this.props.craig.store.json._options) ||
      invalidNewResourceName(this.state.prefix) ||
      invalidTagList(this.state.tags) ||
      (this.state.enable_power_vs &&
        (!this.state.power_vs_zones || isEmpty(this.state.power_vs_zones)))
    );
  }

  handlePowerZonesChange(items) {
    this.setState({ power_vs_zones: items.selectedItems });
  }

  render() {
    return (
      <>
        <div className={"tab-panel subForm"}>
          <IcseHeading
            name="Environment Options"
            buttons={
              <SaveAddButton
                name="options"
                onClick={() =>
                  this.props.craig.options.save(this.state, this.props)
                }
                disabled={this.disableSave()}
                type="save"
              />
            }
            className="marginBottomSmall"
          />
          <IcseFormGroup>
            <IcseToggle
              labelText="Use FS Cloud"
              defaultToggled={this.state.fs_cloud}
              onToggle={() => this.handleToggle("fs_cloud")}
              id="use-fs-cloud"
              toggleFieldName="fs_cloud"
              value={this.state.fs_cloud}
              tooltip={{
                content:
                  "Show only Financial Services Cloud validated regions.",
              }}
            />
          </IcseFormGroup>
          <IcseFormGroup>
            <IcseTextInput
              id="prefix"
              field="prefix"
              labelText="Prefix"
              value={this.state.prefix}
              invalid={invalidNewResourceName(this.state.prefix)}
              invalidText="Invalid prefix"
              onChange={this.handleChange}
              maxLength={16}
              tooltip={{
                content:
                  "A prefix of up to 16 characters that will begin the name of each resource provisioned by this template",
                align: "right",
              }}
            />
            <IcseSelect
              formName="options"
              name="region"
              labelText={"Region"}
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
            <IcseSelect
              formName="options"
              name="endpoints"
              labelText="Service Endpoints"
              value={titleCase(this.state.endpoints).replace(/And/g, "and")}
              groups={["Private", "Public", "Public and Private"]}
              handleInputChange={this.handleChange}
              tooltip={{
                content: "Type of service endpoints to use for each service",
              }}
            />
            <IcseTextInput
              id="account_id"
              field="account_id"
              value={this.state.account_id}
              invalid={false}
              labelText="Account ID"
              invalidText="Invalid prefix"
              placeholder="(Optional) Account ID"
              onChange={this.handleChange}
              tooltip={{
                content:
                  "Account ID is used to create some resources, such as Virtual Private Endpoints for Secrets Manager",
              }}
            />
            <IcseToggle
              labelText="Enable Dynamic Scalable Subnets"
              field="dynamic_subnets"
              disabled={this.props.craig.store.json._options.advanced_subnets}
              defaultToggled={this.state.dynamic_subnets}
              onToggle={() => this.handleToggle("dynamic_subnets")}
              id="dynamic-subnets"
              tooltip={{
                content: this.props.craig.store.json._options.advanced_subnets
                  ? "Dynamic subnet addressing cannot be used with advanced subnet tiers"
                  : "Use this setting to minimize the number of provisioned IPs in your VPCs. When active, each subnet will be sized to the number of interfaces needed for provisioned resources. Turn off if you want to manage your address prefixes and subnet CIDR addresses manually.",
              }}
            />
          </IcseFormGroup>
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
            {this.state.enable_power_vs && (
              <IcseMultiSelect
                id="options-power-zones"
                titleText="Power VS Zone"
                key={JSON.stringify(this.state.power_vs_zones)}
                onChange={this.handlePowerZonesChange}
                initialSelectedItems={this.state.power_vs_zones || []}
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
          <IcseFormGroup>
            <ToolTipWrapper
              id="tags-wrapper"
              labelText="Tags"
              tooltip={{
                content:
                  "Tags are used to identify resources. These tags will be added to each resource in your configuration that supports tags",
                align: "right",
              }}
            >
              <TextArea
                className="wide"
                id="tags"
                labelText="Tags"
                placeholder="hello,world"
                value={String(this.state.tags)}
                onChange={this.handleTags}
                invalid={invalidTagList(this.state.tags)}
                invalidText="One or more tags are invalid"
                helperText="Enter a comma separated list of tags"
              />
            </ToolTipWrapper>
          </IcseFormGroup>
          <div className="marginBottomSmall">
            {this.state.tags.map((tag, i) => (
              <Tag
                key={"tag" + i}
                size="md"
                type={tagColors[i % tagColors.length]}
              >
                {tag}
              </Tag>
            ))}
          </div>
          {this.props.template && (
            <div className="marginBottomSmall">
              <Button
                disabled={this.disableSave()}
                onClick={() => {
                  this.handleToggle("showModal");
                }}
              >
                Begin Customizing <Rocket className="rocketIcon" />
              </Button>
            </div>
          )}
        </div>
      </>
    );
  }
}

OptionsForm.propTypes = {
  data: PropTypes.shape({}).isRequired,
  craig: PropTypes.shape({
    options: PropTypes.shape({
      save: PropTypes.func.isRequired,
    }).isRequired,
    store: PropTypes.shape({
      json: PropTypes.shape({
        _options: PropTypes.shape({}).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default OptionsForm;
