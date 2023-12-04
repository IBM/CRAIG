const { kebabCase, paramTest } = require("lazy-z");
const { disabledReturnsBooleanCheck, addClassName } = require("./utils");

/**
 * @param {*} props
 * @param {string} props.name
 * @param {object} props.field
 * @param {Function} props.field.disabled
 * @param {object=} props.field.tooltip
 * @param {string} props.field.labelText
 * @param {string=} props.field.className additional classnames
 * @param {object} props.parentState state object for stateful form
 * @param {object} props.parentProps props object for stateful form
 * @param {string} props.parentProps.formName name of form
 * @param {Function} props.handleInputChange
 * @returns {object} object for carbon react toggle
 */
function dynamicToggleProps(props) {
  paramTest(
    "dynamicToggleProps",
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
    "props.handleInputChange",
    "Function",
    props.handleInputChange
  );

  // check params for disabled
  let isDisabled = disabledReturnsBooleanCheck(props, "dynamicToggleProps");
  let labelA = props.field.useOnOff ? "Off" : "False",
    labelB = props.field.useOnOff ? "On" : "True",
    labelText = props.field.tooltip ? " " : props.field.labelText,
    id = kebabCase(props.name) + "-toggle-" + props.propsName,
    className =
      addClassName("leftTextAlign fitContent", props.field) +
      (props.field.tooltip ? " cds--form-item tooltip" : " cds--form-item");

  return {
    labelA: labelA,
    labelB: labelB,
    labelText: labelText,
    id: id,
    className: className,
    onToggle: () => {
      props.handleInputChange(props.name);
    },
    defaultToggled: props.field.onRender
      ? props.field.onRender(props.parentState, props.parentProps)
      : props.parentState[props.name],
    disabled: isDisabled,
  };
}

module.exports = {
  dynamicToggleProps,
};
