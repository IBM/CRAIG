import React from "react";
import PropTypes from "prop-types";

/**
 * Dynamically render inner contents
 * @param {*} props
 * @param {boolean=} props.hide hide element
 * @param {boolean=} props.content component to show when hide is false
 * @returns empty string when hidden, component when visible
 */
export function DynamicRender(props) {
  return props.hide === true ? "" : props.content;
}

DynamicRender.defaultProps = {
  hide: false,
  content: "",
};

DynamicRender.propTypes = {
  hide: PropTypes.bool.isRequired,
};
