import React from "react";
import { PopoverWrapper } from "icse-react-assets";
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
} from "@carbon/react";
import PropTypes from "prop-types";
import { dynamicPasswordInputProps } from "../../../lib/forms/dynamic-form-fields/password-input";

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
  return <TextArea {...dynamicTextAreaProps(props)} />;
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

export {
  DynamicFormTextInput,
  DynamicFormSelect,
  DynamicFormToggle,
  DynamicTextArea,
  DynamicMultiSelect,
  DynamicPublicKey,
};
