import React from "react";
import PropTypes from "prop-types";
// popover wrapper needs to be imported this way to prevent an error importing
// dynamic form before initializtion
import { default as PopoverWrapper } from "./PopoverWrapper";
import { CraigFormHeading } from "./CraigFormHeading";
import { Add, ChevronDown, ChevronRight } from "@carbon/icons-react";
import { statelessWrapperProps } from "../../../lib/components/toggle-form-components";
import { kebabCase } from "lazy-z";
import { DynamicRender } from "./DynamicRender";

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

export { StatelessFormWrapper };
