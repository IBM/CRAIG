import React from "react";
// popover wrapper needs to be imported this way to prevent an error importing
// dynamic form before initializtion
import { default as PopoverWrapper } from "../utils/PopoverWrapper";
import {
  dynamicTextInputProps,
  dynamicSelectProps,
  dynamicFieldId,
  dynamicToggleProps,
  dynamicTextAreaProps,
  dynamicMultiSelectProps,
  dynamicPasswordInputProps,
} from "../../../lib";
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
import { ToolTipWrapper } from "../utils/ToolTip";
import { RenderForm } from "../utils";

const tagColors = ["red", "magenta", "purple", "blue", "cyan", "teal", "green"];

const DynamicToolTipWrapper = (props) => {
  //make sure that either children or innerForm are passed as a prop
  if (props.children === undefined && props.innerForm === undefined) {
    throw new Error(
      "DynamicToolTipWrapper expects either `props.children` or `props.innerForm` when rendering ToolTipWrapper, got neither."
    );
  }
  return props.tooltip ? (
    <ToolTipWrapper {...props} />
  ) : props.children ? (
    props.children
  ) : (
    RenderForm(props.innerForm, {})
  );
};

DynamicToolTipWrapper.propTypes = {
  tooltip: PropTypes.shape({
    content: PropTypes.string,
    link: PropTypes.string,
  }),
  isModal: PropTypes.bool,
  children: PropTypes.node,
  innerForm: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

const DynamicFormTextInput = (props) => {
  return <TextInput {...dynamicTextInputProps(props)} />;
};

DynamicFormTextInput.propTypes = {
  name: PropTypes.string.isRequired,
  propsName: PropTypes.string,
  keyIndex: PropTypes.number,
  field: PropTypes.shape({
    invalid: PropTypes.func.isRequired,
    invalidText: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    optional: PropTypes.bool,
    labelText: PropTypes.string,
    disabled: PropTypes.func.isRequired,
    disabledText: PropTypes.func.isRequired,
    className: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  }).isRequired,
  parentState: PropTypes.shape({}).isRequired,
  parentProps: PropTypes.shape({}).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const DynamicFormSelect = (props) => {
  let selectProps = { ...dynamicSelectProps(props) };
  const { key, ...filteredProps } = selectProps;
  return (
    <PopoverWrapper
      hoverText={selectProps.value || ""}
      className={props.field.tooltip ? " tooltip" : "select"}
    >
      <Select key={key} {...filteredProps}>
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
    readOnly: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
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
  labelText: PropTypes.string,
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
      <TextInput {...dynamicPasswordInputProps(props)} />
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
  DynamicToolTipWrapper,
  tagColors,
};
