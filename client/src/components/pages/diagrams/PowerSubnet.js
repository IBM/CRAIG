import React from "react";
import { IbmCloudSubnets } from "@carbon/icons-react";
import PropTypes from "prop-types";

export const PowerSubnet = (props) => {
  return (
    <div className="powerSubnetBox">
      <div
        className="displayFlex marginBottomThreeQuarterRem"
        onClick={props.onClick ? props.onClick : undefined}
      >
        <IbmCloudSubnets className="marginRightQuarterRem" />
        <span className="powerSubnetName">{props.subnet.name}</span>
        <div>{props.subnet.pi_cidr}</div>
      </div>
      {props.children}
    </div>
  );
};

PowerSubnet.propTypes = {
  subnet: PropTypes.shape({
    name: PropTypes.string,
    pi_cidr: PropTypes.string,
  }).isRequired,
};
