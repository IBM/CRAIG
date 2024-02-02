import React from "react";
import PropTypes from "prop-types";
import { DynamicToolTipWrapper } from "../dynamic-form";

export const CraigFormHeading = (props) => {
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
  name: PropTypes.string,
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
