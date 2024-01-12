import React from "react";
import PropTypes from "prop-types";

export const CraigFormGroup = (props) => {
  return (
    <div
      className={`displayFlex ${
        props.noMarginBottom ? "" : "marginBottom"
      } evenSpacing wrap alignItemsTop ${props.className}`}
    >
      {props.children}
    </div>
  );
};

CraigFormGroup.defaultProps = {
  noMarginBottom: false,
};

CraigFormGroup.propTypes = {
  noMarginBottom: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
