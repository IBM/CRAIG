import React from "react";
import {
  IcseFormGroup,
  IcseSelect,
  IcseTextInput,
  buildFormFunctions,
  IcseHeading,
  SaveAddButton
} from "icse-react-assets";
import { Tag, TextArea } from "@carbon/react";
import { deepEqual } from "lazy-z";
import { invalidNewResourceName, invalidTagList } from "../../lib/forms";

const tagColors = ["red", "magenta", "purple", "blue", "cyan", "teal", "green"];

class OptionsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.data };
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
        <IcseHeading
          name="Environment Options"
          buttons={
            <SaveAddButton
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
          <IcseSelect
            formName="options"
            name="region"
            labelText={"Region"}
            value={this.state.region}
            groups={["us-south", "us-east", "eu-db", "eu-gb"]}
            handleInputChange={this.handleChange}
          />
          <IcseTextInput
            id="prefix"
            field="prefix"
            value={this.state.prefix}
            invalid={invalidNewResourceName(this.state.prefix)}
            invalidText="Invalid prefix"
            onChange={this.handleChange}
            maxLength={16}
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
      </>
    );
  }
}

export default OptionsForm;
