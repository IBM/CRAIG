const { contains, titleCase, paramTest } = require("lazy-z");
const {
  dynamicFieldId,
  addClassName,
  disabledReturnsBooleanCheck,
  fieldFunctionReturnsStringCheck,
  invalidReturnsBooleanCheck,
  groupsEvaluatesToArrayCheck,
} = require("./utils");

/**
 *
 * @param {*} props
 * @param {string} props.name
 * @param {object} props.field
 * @param {Function=} props.field.onRender
 * @param {Function} props.field.disabled
 * @param {Function} props.field.invalid
 * @param {Function} props.field.invalidText
 * @param {object} props.parentState state data for stateful foem
 * @returns {object} props object for carbon react select
 */
function dynamicSelectProps(props) {
  paramTest(
    "dynamicSelectProps",
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

  // check params for disabled
  let isDisabled = disabledReturnsBooleanCheck(props, "dynamicSelectProps");

  // state value
  let stateValue = props.field.onRender
    ? props.field.onRender(props.parentState)
    : props.parentState[props.name];

  let groups = groupsEvaluatesToArrayCheck(
    props,
    "dynamicSelectProps",
    stateValue
  );

  let invalid = isDisabled
    ? false
    : contains(groups, stateValue)
    ? invalidReturnsBooleanCheck(props, "dynamicSelectProps")
    : true;

  // hide text when tooltip so that multiple name labels are not rendered
  let labelText = props.field.tooltip
    ? ""
    : props.field.labelText || titleCase(props.name);
  let invalidText = fieldFunctionReturnsStringCheck(
    props,
    "dynamicSelectProps",
    "invalidText"
  );
  return {
    id: dynamicFieldId(props),
    name: props.name,
    labelText: labelText,
    value: stateValue || "",
    className: addClassName(
      `leftTextAlign${props.field.tooltip ? " tooltip" : ""}`,
      props.field
    ),
    disabled: isDisabled,
    invalid: invalid,
    invalidText: invalidText,
    readOnly: props.field.readOnly,
    onChange: props.handleInputChange,
    groups: groups,
  };
}

module.exports = {
  dynamicSelectProps,
};
