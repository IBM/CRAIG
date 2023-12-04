const { paramTest } = require("lazy-z");
const {
  dynamicFieldId,
  fieldFunctionReturnsStringCheck,
  invalidReturnsBooleanCheck,
} = require("./utils");
/**
 * format props for dynamic rendered text area
 * @param {*} props
 * @returns {object} text area object
 */
function dynamicTextAreaProps(props) {
  paramTest(
    "dynamicTextAreaProps",
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
    props.field.invalidText,
    "props.handleInputChange",
    "Function",
    props.handleInputChange
  );

  let labelText = props.field.tooltip ? null : props.field.labelText;
  let invalid = invalidReturnsBooleanCheck(props, "dynamicTextAreaProps");
  let invalidText = fieldFunctionReturnsStringCheck(
    props,
    "dynamicTextAreaProps",
    "invalidText"
  );
  return {
    id: dynamicFieldId(props),
    onChange: (event) => {
      event.target.name = props.name;
      props.handleInputChange(event);
    },
    className:
      (props.field.className ? props.field.className + " " : "") +
      "textInputMedium",
    invalid: invalid,
    invalidText: invalidText,
    labelText: labelText,
    value: props.parentState[props.name],
    placeholder: fieldFunctionReturnsStringCheck(
      props,
      "dynamicTextAreaProps",
      "placeholder"
    ),
  };
}

module.exports = {
  dynamicTextAreaProps,
};
