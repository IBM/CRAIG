const { paramTest } = require("lazy-z");
const {
  dynamicFieldId,
  invalidReturnsBooleanCheck,
  fieldFunctionReturnsStringCheck,
} = require("./utils");

/**
 * create a public key field props
 * @param {*} props
 * @returns {object} props object
 */
function dynamicPasswordInputProps(props) {
  paramTest(
    "dynamicPasswordInputProps",
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
  let invalid = invalidReturnsBooleanCheck(props, "dynamicPasswordInputProps");
  let invalidText = fieldFunctionReturnsStringCheck(
    props,
    "dynamicPasswordInputProps",
    "invalidText"
  );
  return {
    labelText: "Public Key",
    name: "public_key",
    id: dynamicFieldId(props),
    onChange: props.handleInputChange,
    invalid: invalid,
    invalidText: invalidText,
    value: props.parentState[props.name] || "",
  };
}

module.exports = {
  dynamicPasswordInputProps,
};
