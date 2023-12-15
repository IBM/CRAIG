import React from "react";
import { IcseFormGroup, PopoverWrapper } from "icse-react-assets";
import {
  dynamicTextInputProps,
  dynamicSelectProps,
  dynamicFieldId,
  dynamicToggleProps,
  dynamicTextAreaProps,
  dynamicMultiSelectProps,
} from "../../../lib/forms/dynamic-form-fields";
import {
  FilterableMultiSelect,
  SelectItem,
  TextArea,
  Toggle,
  TextInput,
  Select,
  Tag,
} from "@carbon/react";
import PropTypes from "prop-types";
import { dynamicPasswordInputProps } from "../../../lib/forms/dynamic-form-fields/password-input";
import { deepEqual } from "lazy-z";
const tagColors = ["red", "magenta", "purple", "blue", "cyan", "teal", "green"];

const DynamicFormTextInput = (props) => {
  return <TextInput {...dynamicTextInputProps(props)} />;
};

DynamicFormTextInput.propTypes = {
  name: PropTypes.string.isRequired,
  propsName: PropTypes.string,
  keyIndex: PropTypes.number,
  field: PropTypes.shape({
    invalid: PropTypes.func.isRequired,
    invalidText: PropTypes.func.isRequired,
    optional: PropTypes.bool,
    labelText: PropTypes.string,
    disabled: PropTypes.func.isRequired,
    disabledText: PropTypes.func.isRequired,
    className: PropTypes.string,
  }).isRequired,
  parentState: PropTypes.shape({}).isRequired,
  parentProps: PropTypes.shape({}).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const DynamicFormSelect = (props) => {
  let selectProps = { ...dynamicSelectProps(props) };

  return (
    <PopoverWrapper
      hoverText={selectProps.value || ""}
      className={props.field.tooltip ? " tooltip" : "select"}
    >
      <Select {...selectProps}>
        {selectProps.groups.map((value) => (
          <SelectItem
            text={value}
            value={value}
            key={dynamicFieldId(props) + "-" + value}
          />
        ))}
      </Select>
    </PopoverWrapper>
  );
};

DynamicFormSelect.propTypes = {
  name: PropTypes.string.isRequired,
  propsName: PropTypes.string.isRequired,
  keyIndex: PropTypes.number.isRequired,
  field: PropTypes.shape({
    invalid: PropTypes.func.isRequired,
    invalidText: PropTypes.func.isRequired,
    optional: PropTypes.bool,
    labelText: PropTypes.string,
    disabled: PropTypes.func.isRequired,
    className: PropTypes.string,
    groups: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.func,
    ]).isRequired,
    readOnly: PropTypes.bool,
  }).isRequired,
  parentState: PropTypes.shape({}).isRequired,
  parentProps: PropTypes.shape({}).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const DynamicFormToggle = (props) => {
  return <Toggle {...dynamicToggleProps(props)} />;
};

DynamicFormToggle.propTypes = {
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
    alignModal: PropTypes.string,
  }),
  className: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  propsName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  parentState: PropTypes.shape({}).isRequired,
  parentProps: PropTypes.shape({}).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const DynamicTextArea = (props) => {
  return (
    <>
      <TextArea {...dynamicTextAreaProps(props)} />
      <div>
        {props.field.labelText === "Tags"
          ? props.parentState.tags.map((tag, i) => (
              <Tag
                key={"tag" + i}
                size="md"
                type={tagColors[i % tagColors.length]}
              >
                {tag}
              </Tag>
            ))
          : ""}
      </div>
    </>
  );
};

DynamicTextArea.propTypes = {
  name: PropTypes.string.isRequired,
  propsName: PropTypes.string.isRequired,
  keyIndex: PropTypes.number.isRequired,
  field: PropTypes.shape({
    labelText: PropTypes.string, // not required for toolip wrapper
    invalid: PropTypes.func.isRequired,
    invalidText: PropTypes.func.isRequired,
    placeholder: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
      .isRequired,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  parentState: PropTypes.shape({}).isRequired,
  parentProps: PropTypes.shape({}).isRequired,
};

const DynamicMultiSelect = (props) => {
  return <FilterableMultiSelect {...dynamicMultiSelectProps(props)} />;
};

DynamicMultiSelect.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  parentState: PropTypes.shape({}).isRequired,
  parentProps: PropTypes.shape({}).isRequired,
  field: PropTypes.shape({
    onRender: PropTypes.func,
    invalid: PropTypes.func.isRequired,
    groups: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.func,
    ]).isRequired,
    tooltip: PropTypes.shape({}),
    labelText: PropTypes.string,
    forceUpdateKey: PropTypes.func,
    disabled: PropTypes.func.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const DynamicPublicKey = (props) => {
  return (
    <div className="fieldWidthBigger leftTextAlign">
      <TextInput.PasswordInput {...dynamicPasswordInputProps(props)} />
    </div>
  );
};

DynamicPublicKey.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  parentState: PropTypes.shape({}).isRequired,
  parentProps: PropTypes.shape({}).isRequired,
  field: PropTypes.shape({
    onRender: PropTypes.func,
    invalid: PropTypes.func.isRequired,
    tooltip: PropTypes.shape({}),
    labelText: PropTypes.string,
    forceUpdateKey: PropTypes.func,
  }).isRequired,
  name: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export class DynamicFetchSelect extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      data: ["Loading..."],
    };
    this.dataToGroups = this.dataToGroups.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    // on mount if not items have been set
    if (deepEqual(this.state.data, ["Loading..."]))
      fetch(
        // generate api endpoint based on state and props
        this.props.field.apiEndpoint(
          this.props.parentState,
          this.props.parentProps
        )
      )
        .then((res) => res.json())
        .then((data) => {
          // set state with data if mounted
          if (this._isMounted) this.setState({ data: data });
        })
        .catch((err) => {
          console.error(err);
        });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  dataToGroups() {
    return (this.props.parentProps.isModal ? [""] : []).concat(this.state.data);
  }

  render() {
    let props = { ...this.props };
    return (
      <PopoverWrapper
        key={this.dataToGroups()}
        hoverText={dynamicSelectProps(props).value || ""}
        className={props.field.tooltip ? " tooltip" : "select"}
      >
        <Select {...dynamicSelectProps(props, this._isMounted)}>
          {this.dataToGroups().map((value) => (
            <SelectItem
              text={value}
              value={value}
              key={dynamicFieldId(props) + "-" + value}
            />
          ))}
        </Select>
      </PopoverWrapper>
    );
  }
}

export {
  DynamicFormTextInput,
  DynamicFormSelect,
  DynamicFormToggle,
  DynamicTextArea,
  DynamicMultiSelect,
  DynamicPublicKey,
};
