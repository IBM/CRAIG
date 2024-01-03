import React from "react";
import {
  CraigFormHeading,
  RenderForm,
} from "../../forms/utils/ToggleFormComponents";
import PropTypes from "prop-types";
import "./diagrams.css";

export const PowerSubnetInnerBox = (props) => {
  let powerInnerBoxClassName = "powerSubnetInnerBox";
  if (props.marginTop) {
    powerInnerBoxClassName += " marginTopThreeQuartersRem";
  }
  return (
    <div className={powerInnerBoxClassName}>
      <div className="powerSubnetTitleMargin">
        <CraigFormHeading
          icon={RenderForm(props.icon, {
            className: "powerSubnetIconMargin",
          })}
          name={props.name}
          type="p"
        />
      </div>
      <div className="displayFlex alignItemsCenter powerSubnetChildren">
        {props.children}
      </div>
    </div>
  );
};

PowerSubnetInnerBox.propTypes = {
  name: PropTypes.string.isRequired,
};
