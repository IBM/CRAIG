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
  IcseModal,
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

const TemplateAbout = (props) => {
  return (
    <div
      id={"pattern-info-" + props.template.name}
      className="leftTextAlign marginBottomSmall subForm marginTopSmall displayFlex"
    >
      <div className="marginBottomSmaller">
        <p className="patternDocText marginBottomSmall">
          {props.template.patternDocText} This pattern includes:
        </p>
        <ul className="bullets indent marginBottomSmall">
          {props.template.includes.map((item) => (
            <li key={item}>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="tileStyles">
        <a
          href={props.template.image}
          target="_blank"
          rel="noreferrer noopener"
          className="magnifier"
        >
          <img
            src={props.template.image}
            className="borderGray tileStyles imageTileSize"
          />
        </a>
      </div>
    </div>
  );
};

TemplateAbout.propTypes = {
  template: PropTypes.shape({
    name: PropTypes.string.isRequired,
    includes: PropTypes.arrayOf(PropTypes.string).isRequired,
    patternDocText: PropTypes.string.isRequired,
    image: PropTypes.node.isRequired,
  }).isRequired,
};

class OptionsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.data,
      showModal: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleTags = this.handleTags.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.disableSave = this.disableSave.bind(this);
    this.handlePowerZonesChange = this.handlePowerZonesChange.bind(this);
    this.hardTemplateSet = this.hardTemplateSet.bind(this);
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
    } else this.setState({ [name]: !this.state[name] });
  }

  disableSave() {
    return (
      invalidNewResourceName(this.state.prefix) ||
      invalidTagList(this.state.tags) ||
      (!this.props.template &&
        deepEqual(this.state, this.props.craig.store.json._options)) ||
      (this.state.enable_power_vs &&
        (!this.state.power_vs_zones || isEmpty(this.state.power_vs_zones)))
    );
  }

  handlePowerZonesChange(items) {
    this.setState({ power_vs_zones: items.selectedItems });
  }

  hardTemplateSet() {
    let newTemplate = { ...this.props.template.template };
    newTemplate._options = this.state;
    this.props.craig.hardSetJson(newTemplate, true);
    window.location.pathname = "/form/resourceGroups";
  }

  render() {
    return (
      <>
        {this.props.template && (
          <TemplateAbout template={this.props.template} />
        )}
        <div
          className={
            "tab-panel " + (this.props.template ? "formInSubForm" : "subForm")
          }
        >
          {this.props.template && (
            <IcseModal
              open={this.state.showModal}
              heading={"Import " + this.props.template.name + " Template"}
              primaryButtonText="Import"
              onRequestClose={() => {
                this.handleToggle("showModal");
              }}
              onRequestSubmit={this.hardTemplateSet}
              danger
            >
              <p className="marginBottomSmall">
                Import the current template into CRAIG for customization.
              </p>
              <p style={{ fontWeight: "bolder" }}>
                This will overwrite any changes in your current configuration.
              </p>
            </IcseModal>
          )}
          <IcseHeading
            name={
              this.props.template
                ? "Configure " + this.props.template.name + " Template"
                : "Environment Options"
            }
            type={this.props.template ? "subHeading" : null}
            buttons={
              // don't display buttons when is a template
              this.props.template ? (
                ""
              ) : (
                <SaveAddButton
                  name="options"
                  onClick={() =>
                    this.props.craig.options.save(this.state, this.props)
                  }
                  disabled={this.disableSave()}
                  type="save"
                />
              )
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
                content: "Show only FS Cloud validated regions.",
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
            <IcseToggle
              labelText="Enable Power Virtual Servers"
              defaultToggled={this.state.enable_power_vs}
              onToggle={() => this.handleToggle("enable_power_vs")}
              id="use-power-vs"
              toggleFieldName="enable_power_vs"
              value={this.state.enable_power_vs}
              tooltip={{
                content:
                  "Enable the creation of IBM Power Virtual Servers and related infrastructure. Power VS is not currently enabled in CRAIG, this flag is for upcoming features.",
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
              value={this.state.zones}
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
            {this.state.enable_power_vs && (
              <IcseMultiSelect
                id="options-power-zones"
                titleText="Power VS Zone"
                onChange={this.handlePowerZonesChange}
                initialSelectedItems={this.state.power_vs_zones || []}
                items={
                  {
                    "au-syd": ["syd04", "syd05"],
                    "eu-de": ["eu-de-1", "eu-de-2"],
                    "eu-gb": ["lon04", "lon06"],
                    "us-east": ["us-east"],
                    "us-south": ["us-south", "dal10", "dal12"],
                    "jp-tok": ["tok04"],
                    "br-sao": ["sao01"],
                    "ca-tor": ["tor1"],
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
  template: PropTypes.shape({
    name: PropTypes.string.isRequired,
    includes: PropTypes.arrayOf(PropTypes.string).isRequired,
    patternDocText: PropTypes.string.isRequired,
    image: PropTypes.node.isRequired,
    template: PropTypes.shape({}).isRequired,
  }),
};

export default OptionsForm;
