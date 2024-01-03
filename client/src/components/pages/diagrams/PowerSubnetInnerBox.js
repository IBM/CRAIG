import React from "react";
import {
  CraigFormHeading,
  RenderForm,
} from "../../forms/utils/ToggleFormComponents";
import PropTypes from "prop-types";

export const PowerSubnetInnerBox = (props) => {
  return (
    <div
      style={{
        border: "2px dashed gray",
        width: "100%",
        textAlign: "left",
        marginTop: props.marginTop ? "0.75rem" : undefined,
      }}
    >
      <div
        style={{
          marginTop: "0.25rem",
          marginLeft: "0.25rem",
        }}
      >
        <CraigFormHeading
          icon={RenderForm(props.icon, {
            style: {
              marginTop: "0.25rem",
              marginLeft: "0.33rem",
              marginRight: "0.33rem",
            },
          })}
          name={props.name}
          type="p"
        />
      </div>
      <div
        className="displayFlex alignItemsCenter"
        style={{
          justifyContent: "center",
          paddingBottom: "0.5rem",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

PowerSubnetInnerBox.propTypes = {
  name: PropTypes.string.isRequired,
};
