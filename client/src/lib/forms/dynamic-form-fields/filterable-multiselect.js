const { titleCase, contains, deepEqual } = require("lazy-z");
const {
  dynamicFieldId,
  addClassName,
  disabledReturnsBooleanCheck,
  invalidReturnsBooleanCheck,
  groupsEvaluatesToArrayCheck,
} = require("./utils");

/**
 *
 * @param {*} props
 * @returns {object} params for carbon filterable multiselect
 */
function dynamicMultiSelectProps(props, fetchedData) {
  // check params for disabled
  let isDisabled =
    disabledReturnsBooleanCheck(props, "dynamicMultiSelectProps") ||
    deepEqual(fetchedData, ["Loading..."]); // disable multiselect until fetch resolves
  // quick ref for state value
  let stateValue = props.field.onRender
    ? props.field.onRender(props.parentState)
    : props.parentState[props.name];

  // should always be invalid when no selection is made
  let invalid =
    (stateValue && stateValue?.length === 0 && props.field.optional) ||
    contains(
      ["power_connections", "accept_routes_from_resource_type"],
      props.name
    )
      ? false
      : // force network to not display as invalid when ip is invalid
      stateValue?.length > 0 && props.name === "network"
      ? false
      : invalidReturnsBooleanCheck(props, "dynamicMultiSelectProps") === false
      ? false
      : stateValue?.length > 0
      ? invalidReturnsBooleanCheck(props, "dynamicMultiSelectProps")
      : true;

  let groups = groupsEvaluatesToArrayCheck(
    props,
    "dynamicMultiSelectProps",
    stateValue
  );

  // hide text when tooltip so that multiple name labels are not rendered
  let labelText = props.field.tooltip
    ? null
    : isDisabled
    ? `Loading ${props.field.labelText || props.name}...` // Add Loading... while values are being fetched
    : titleCase(props.field.labelText || props.name);
  let dynamicKeyProp = props.field.forceUpdateKey
    ? props.field.forceUpdateKey(props.parentState)
    : undefined;

  return {
    key: dynamicKeyProp,
    id: dynamicFieldId(props),
    className: addClassName("leftTextAlign", props.field),
    titleText: labelText || titleCase(props.name),
    itemToString: (item) => {
      // lists only names of image objects
      if (item) {
        return item.name ? item.name : item;
      }
      return "";
    },
    invalid: invalid,
    invalidText: props.field.invalidText(props.parentState, props.parentProps),
    onChange: (selectEvent) => {
      let event = {
        target: {
          name: props.name,
          value: selectEvent.selectedItems,
        },
      };
      props.handleInputChange(event);
    },
    items: groups,
    useTitleInItem: props.field.useTitleInItem || false,
    label: labelText,
    disabled: isDisabled,
    initialSelectedItems: stateValue,
  };
}

module.exports = {
  dynamicMultiSelectProps,
};
