import React from "react";
import PropTypes from "prop-types";

export const CraigFormGroup = (props) => {
  return (
    <div
      className={`displayFlex ${
        props.noMarginBottom ? "" : "marginBottom"
      } evenSpacing wrap alignItemsTop ${props.className}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

CraigFormGroup.defaultProps = {
  noMarginBottom: false,
  style: {},
};

CraigFormGroup.propTypes = {
  noMarginBottom: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.shape({}),
};
