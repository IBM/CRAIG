import React from "react";
import PropTypes from "prop-types";
import { PopoverWrapper } from "icse-react-assets";
import {
  Add,
  Save,
  TrashCan,
  ChevronDown,
  ChevronRight,
} from "@carbon/icons-react";
import { Button } from "@carbon/react";
import {
  dynamicPrimaryButtonProps,
  dynamicSecondaryButtonProps,
  statelessWrapperProps,
} from "../../../lib/components/toggle-form-components";
import { kebabCase } from "lazy-z";
import { DynamicToolTipWrapper } from "../dynamic-form/components";

/**
 * generate save icon
 * @param {object} props
 * @param {boolean} props.saveIsDisabled true if disabled
 * @returns Save Icon
 */
const SaveIcon = (props) => {
  return <Save className={props.disabled ? "" : "tertiaryButtonColors"} />;
};

SaveIcon.defaultProps = {
  disabled: false,
};

SaveIcon.propTypes = {
  disabled: PropTypes.bool.isRequired,
};

/**
 * Render a form
 * @param {*} form form element
 * @param {*} formProps props
 * @returns Form element
 */
function RenderForm(form, formProps) {
  return React.createElement(form, {
    ...formProps,
  });
}

/**
 * Dynamically render inner contents
 * @param {*} props
 * @param {boolean=} props.hide hide element
 * @param {boolean=} props.content component to show when hide is false
 * @returns empty string when hidden, component when visible
 */
function DynamicRender(props) {
  return props.hide === true ? "" : props.content;
}

DynamicRender.defaultProps = {
  hide: false,
  content: "",
};

DynamicRender.propTypes = {
  hide: PropTypes.bool.isRequired,
};

const PrimaryButton = (props) => {
  let buttonProps = dynamicPrimaryButtonProps(props);
  return (
    <PopoverWrapper
      hoverText={buttonProps.popoverProps.hoverText}
      className={buttonProps.popoverProps.className}
      align={props.hoverTextAlign}
    >
      <Button
        aria-label={props.name + "-" + props.type}
        kind={buttonProps.buttonProps.kind}
        onClick={props.onClick}
        className={buttonProps.buttonProps.className}
        disabled={props.disabled || false}
        size="sm"
      >
        {props.type === "custom" ? (
          RenderForm(props.customIcon)
        ) : props.type === "add" ? (
          <Add />
        ) : (
          <SaveIcon saveIsDisabled={props.disabled} />
        )}
      </Button>
    </PopoverWrapper>
  );
};

PrimaryButton.defaultProps = {
  type: "save",
  hoverText: "Save Changes",
  inline: false,
  disabled: false,
  hoverTextAlign: "bottom",
};

PrimaryButton.propTypes = {
  hoverText: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  inline: PropTypes.bool.isRequired,
  hoverTextAlign: PropTypes.string.isRequired,
  customIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

const SecondaryButton = (props) => {
  let buttonProps = dynamicSecondaryButtonProps(props);
  return (
    <div className="delete-area">
      <PopoverWrapper
        hoverText={buttonProps.popoverProps.hoverText}
        align={props.hoverTextAlign}
        className={buttonProps.popoverProps.className}
      >
        <Button
          aria-label={props.name + "-delete"}
          className={buttonProps.buttonClassName}
          kind="ghost"
          size="sm"
          onClick={props.onClick}
          disabled={props.disabled === true}
        >
          <TrashCan className={buttonProps.iconClassName} />
        </Button>
      </PopoverWrapper>
    </div>
  );
};

SecondaryButton.defaultProps = {
  disabled: false,
  hoverTextAlign: "bottom",
};

SecondaryButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  hoverTextAlign: PropTypes.string.isRequired,
  disableDeleteMessage: PropTypes.string,
  name: PropTypes.string.isRequired,
};

/**
 * Edit close icon with popover
 * @param {*} props
 * @returns edit close icon
 */
const ToggleFormIcon = (props) => {
  return (
    <PopoverWrapper
      hoverText={
        props.hoverText
          ? props.hoverText
          : props.open
          ? "Close"
          : props.type === "add"
          ? "Configure Resource"
          : "Open"
      }
    >
      <i
        role="button"
        aria-label={props.name + "-open-close"}
        onClick={props.onClick}
        className="chevron"
      >
        {props.open ? (
          <ChevronDown />
        ) : props.type === "add" ? ( // keep add button for optional components
          <Add />
        ) : (
          <ChevronRight />
        )}
      </i>
    </PopoverWrapper>
  );
};

ToggleFormIcon.propTypes = {
  hoverText: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
};

ToggleFormIcon.defaultProps = {
  type: "edit",
  open: false,
  disabled: false,
};

/**
 * All of the toggle form functionality without injecting anything on render
 */
const StatelessFormWrapper = (props) => {
  let wrapperProps = statelessWrapperProps(props);
  return props.hideTitle ? (
    props.children
  ) : (
    <>
      <div className={wrapperProps.titleClassName}>
        {props.hideIcon === true ? (
          ""
        ) : (
          <ToggleFormIcon
            name={kebabCase(props.name)}
            onClick={props.onIconClick}
            type={props.iconType}
            open={props.hide === false}
          />
        )}
        <CraigFormHeading
          type={wrapperProps.headerType}
          name={props.name}
          toggleFormTitle={props.toggleFormTitle}
          buttons={
            <DynamicRender
              hide={props.hide === true && props.alwaysShowButtons !== true}
              content={props.buttons || ""}
            />
          }
        />
      </div>
      <DynamicRender hide={props.hide} content={props.children} />
    </>
  );
};

StatelessFormWrapper.defaultProps = {
  hide: true,
  iconType: "edit",
  name: "Stateless Toggle Form",
  hideTitle: false,
  alwaysShowButtons: false,
  hideTitle: false,
  toggleFormTitle: false,
};

StatelessFormWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  hide: PropTypes.bool.isRequired,
  iconType: PropTypes.string.isRequired,
  onIconClick: PropTypes.func,
  subHeading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  buttons: PropTypes.node,
  toggleFormTitle: PropTypes.bool.isRequired,
  alwaysShowButtons: PropTypes.bool.isRequired,
  hideTitle: PropTypes.bool.isRequired,
};

const CraigFormHeading = (props) => {
  let icon = props.icon || "";
  return (
    <div
      className={`displayFlex spaceBetween widthOneHundredPercent alignItemsCenter ${
        props.className
      } ${props.noMarginBottom ? "marginBottomNone" : ""}`}
    >
      <DynamicToolTipWrapper
        tooltip={props.tooltip}
        noLabelText={true}
        id={props.name}
        innerForm={() => {
          return (
            <div
              onClick={props.onClick}
              className={
                (props.onClick ? "clicky" : "") +
                (props.isRed ? " diagramSubFormInvalid" : "")
              }
            >
              {props.type === "subHeading" ? (
                <h5 className="displayFlex">
                  {icon}
                  {props.name}
                  {props.addText}
                </h5>
              ) : props.type === "p" ? (
                <p
                  className={
                    props.toggleFormTitle
                      ? "toggleFormTitle displayFlex"
                      : "displayFlex"
                  }
                >
                  {icon}
                  {props.name}
                </p>
              ) : props.type === "section" ? (
                <h6 className="displayFlex">
                  {icon}
                  {props.name}
                </h6>
              ) : props.h2 ? (
                <h2 className="displayFlex marginBottomSmall">
                  {icon}
                  {props.name}
                </h2>
              ) : (
                <h4 className="displayFlex">
                  {icon}
                  {props.name}
                </h4>
              )}
            </div>
          );
        }}
      />
      <div className="displayFlex">{props.buttons}</div>
    </div>
  );
};

CraigFormHeading.defaultProps = {
  type: "heading",
};

CraigFormHeading.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
    align: PropTypes.string,
    alignModal: PropTypes.string,
  }),
  buttons: PropTypes.node,
  className: PropTypes.string,
  toggleFormTitle: PropTypes.bool,
  isRed: PropTypes.bool,
};

export {
  CraigFormHeading,
  DynamicRender,
  PrimaryButton,
  RenderForm,
  SaveIcon,
  SecondaryButton,
  StatelessFormWrapper,
};
