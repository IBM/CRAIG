const { paramTest, titleCase, kebabCase, isFunction } = require("lazy-z");
const {
  disabledReturnsBooleanCheck,
  invalidReturnsBooleanCheck,
  fieldFunctionReturnsStringCheck,
  dynamicFieldId,
  addClassName,
} = require("./utils");

/**
 * create props for text input based on dynamic values
 * @param {*} props
 * @param {string} props.name
 * @param {object} props.field
 * @param {Function} props.field.disabled
 * @param {Function} props.field.disabledText
 * @param {Function} props.field.invalid
 * @param {Function} props.field.invalidText
 * @param {Function} props.field.helperText
 * @param {boolean=} props.field.readOnly
 * @param {object=} props.field.tooltip
 * @param {string=} props.field.labelText
 * @param {boolean=} props.field.optional
 * @param {string=} props.field.className additional classnames
 * @param {Function=} props.field.onRender modify value from state on render
 * @param {object} props.parentState state object for stateful form
 * @param {object} props.parentProps props object for stateful form
 * @param {string} props.parentProps.formName name of form
 * @returns {object} Params object for carbon react text input
 */
function dynamicTextInputProps(props) {
  paramTest(
    "dynamicTextInputProps",
    "props.name",
    "string",
    props.name,
    "props.field",
    "object",
    props.field,
    "props.field.disabled",
    "Function",
    props.field.disabled,
    "props.parentState",
    "object",
    props.parentState,
    "props.parentProps",
    "object",
    props.parentProps,
    "props.field.invalid",
    "Function",
    props.field.invalid,
    "props.field.invalidText",
    "Function",
    props.handleInputChange,
    "props.field.disabledText",
    "Function",
    props.field.disabledText
  );

  let isDisabled = disabledReturnsBooleanCheck(props, "dynamicTextInputProps");
  let disabledText = fieldFunctionReturnsStringCheck(
    props,
    "dynamicTextInputProps",
    "disabledText"
  );
  let invalid = invalidReturnsBooleanCheck(props, "dynamicTextInputProps");
  let invalidText = fieldFunctionReturnsStringCheck(
    props,
    "dynamicTextInputProps",
    "invalidText"
  );

  let placeholder = props.field.placeholder
    ? props.field.placeholder
    : (props.field.optional ? "(Optional) " : "") +
      `my-${kebabCase(props.parentProps.formName)}-${kebabCase(props.name)}`;
  let labelText = props.field.tooltip
    ? ""
    : props.field.labelText
    ? props.field.labelText
    : titleCase(props.name);
  return {
    name: props.name,
    id: dynamicFieldId(props),
    className: addClassName("leftTextAlign", props.field),
    labelText: labelText,
    placeholder: placeholder,
    // override value for power ips
    value: props.value
      ? props.value
      : props.field.onRender
      ? props.field.onRender(props.parentState, props.parentProps)
      : props.parentState[props.name] || "",
    onChange: props.handleInputChange,
    maxLength: props.field.maxLength,
    invalid: invalid,
    invalidText: invalidText,
    disabled: isDisabled,
    helperText: isDisabled
      ? disabledText
      : isFunction(props.field.helperText)
      ? props.field.helperText(props.parentState, props.parentProps)
      : props.field.onRender
      ? props.field.onRender(props.parentState, props.parentProps, props.index)
      : null,
    readOnly: props.field.readOnly || false,
  };
}

module.exports = {
  dynamicTextInputProps,
};
