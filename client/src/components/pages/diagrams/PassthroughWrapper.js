import React from "react";
import PropTypes from "prop-types";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

// pass through props to allow render of subcomponents
export const PassThroughWrapper = (props) => {
  return (
    <div className={props.className} style={props.style}>
      {React.Children.map(props.children, (child) =>
        // clone react child
        React.cloneElement(child, {
          vpc: props.vpc,
          vpc_index: props.vpc_index,
          acl: props.acl,
          power: props.power,
          powerIndex: props.powerIndex,
        }),
      )}
    </div>
  );
};

PassThroughWrapper.propTypes = {
  className: PropTypes.string,
};

export const PassThroughHoverWrapper = (props) => {
  return (
    <HoverClassNameWrapper hoverClassName={props.hoverClassName}>
      <PassThroughWrapper {...props}>{props.children}</PassThroughWrapper>
    </HoverClassNameWrapper>
  );
};
