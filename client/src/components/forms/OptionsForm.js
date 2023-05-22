import React from "react";
import {
  IcseFormGroup,
  IcseSelect,
  IcseTextInput,
  buildFormFunctions,
  IcseHeading,
  SaveAddButton,
  IcseNumberSelect,
} from "icse-react-assets";
import PropTypes from "prop-types";
import { Tag, TextArea } from "@carbon/react";
import { deepEqual } from "lazy-z";
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
    this.setState({ [name]: value });
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
              value={this.state.prefix}
              invalid={invalidNewResourceName(this.state.prefix)}
              invalidText="Invalid prefix"
              onChange={this.handleChange}
              maxLength={16}
            />
            <IcseSelect
              formName="options"
              name="region"
              labelText={"Region"}
              value={this.state.region}
              groups={["us-south", "us-east", "eu-db", "eu-gb"]}
              handleInputChange={this.handleChange}
            />
            <IcseNumberSelect
              max={3}
              formName="options"
              name="zones"
              labelText="Zones"
              value={this.state.zones}
              handleInputChange={this.handleChange}
              className="fieldWidth"
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
