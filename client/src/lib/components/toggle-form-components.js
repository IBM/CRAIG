const { isFunction } = require("lazy-z");
const { addClassName } = require("../forms/dynamic-form-fields");

/**
 * create classname for sub form chevron save button
 * @param {*} componentProps
 * @returns {string} classNames for button
 */
function primaryButtonClass(props) {
  let className = "forceTertiaryButtonStyles";
  if (props?.noDeleteButton !== true) className += " marginRightSmall";
  if (props?.disabled !== true) className += " tertiaryButtonColors";
  return (
    className +
    (props?.disabled === true
      ? " pointerEventsNone "
      : " " + (props?.className || ""))
  );
}

/**
 * create props for primary bitton
 * @param {*} props
 * @returns
 */
function dynamicPrimaryButtonProps(props) {
  return {
    popoverProps: {
      hoverText:
        props.type === "add" && props.hoverText === "Save Changes"
          ? "Add Resource"
          : props.hoverText,
      className: `${props.disabled ? "inlineBlock cursorNotAllowed" : ""} ${
        props.inline ? " alignItemsCenter marginTopLarge inLineFormButton" : ""
      }`,
    },
    buttonProps: {
      kind:
        props.type === "add" || props.type === "custom"
          ? "tertiary"
          : "primary",
      className: primaryButtonClass(props),
    },
  };
}

/**
 * get props for delete button
 * @param {*} props
 * @returns {object} props object
 */
function dynamicSecondaryButtonProps(props) {
  return {
    popoverProps: {
      hoverText:
        props.disabled && props.disableDeleteMessage
          ? props.disableDeleteMessage
          : "Delete " + props.name,
      className: props.disabled ? "inlineBlock cursorNotAllowed" : "",
    },
    buttonClassName:
      "cds--btn--danger--tertiary forceTertiaryButtonStyles" +
      (props.disabled ? " pointerEventsNone" : ""),
    iconClassName: props.disabled ? "" : "redFill",
  };
}

/**
 * props object for stateless form wrapper
 * @param {*} props
 * @returns {Object} props object
 */
function statelessWrapperProps(props) {
  return {
    titleClassName: addClassName(
      `displayFlex alignItemsCenter widthOneHundredPercent${
        props.hide ? "" : " marginBottomSmall"
      }`,
      props
    ),
    headerType: props.toggleFormTitle
      ? "p"
      : props.subHeading
      ? "subHeading"
      : "heading",
  };
}

/**
 * get props for stateful tab panel
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Object}
 */
function tabPanelProps(stateData, componentProps) {
  return {
    headingType: componentProps.subHeading ? "subHeading" : "heading",
    hideButtons:
      componentProps.hideFormTitleButton ||
      stateData.tabIndex !== 0 ||
      !isFunction(componentProps.onClick),
    hideHeading:
      componentProps.hideHeading === true ||
      (componentProps.name && !componentProps.hasBuiltInHeading) === false,
    disableButton: componentProps.shouldDisableSave
      ? componentProps.shouldDisableSave()
      : false,
  };
}

module.exports = {
  dynamicPrimaryButtonProps,
  dynamicSecondaryButtonProps,
  primaryButtonClass,
  statelessWrapperProps,
  tabPanelProps,
};
