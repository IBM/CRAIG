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
} from "icse-react-assets";
import PropTypes from "prop-types";
import { Tag, TextArea } from "@carbon/react";
import { deepEqual, kebabCase, azsort, titleCase } from "lazy-z";
import { invalidNewResourceName, invalidTagList } from "../../lib";

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
    this.setState({ [name]: value });
  }

  handleToggle(name) {
    this.setState({ [name]: !this.state[name] });
  }

  disableSave() {
    return (
      invalidNewResourceName(this.state.prefix) ||
      invalidTagList(this.state.tags) ||
      deepEqual(this.state, this.props.craig.store.json._options)
    );
  }

  render() {
    return (
      <>
        <div className="tab-panel subForm">
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
          </IcseFormGroup>
          <IcseFormGroup>
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
          </IcseFormGroup>
          <IcseFormGroup>
            <IcseToggle
              labelText="Dynamic Scalable Subnets"
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
