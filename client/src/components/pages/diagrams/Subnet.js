import React from "react";
import { IbmCloudSubnets } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";

export const Subnet = (props) => {
  let subnetClassName = props.small ? "subnetBoxSmall" : "subnetBox";
  if (props.grayNames) subnetClassName += " grayText";
  return (
    <div
      className={subnetClassName}
      key={props.subnet.name + props.vpc.name + props.acl?.name}
    >
      {props.small ? (
        ""
      ) : (
        <div className="displayFlex marginBottomThreeQuarterRem">
          <IbmCloudSubnets className="marginRightQuarterRem" />
          <span className="bold">{props.subnet.name}</span>
        </div>
      )}
      <div>{props.subnet.cidr}</div>
      <div className="textAlignCenter">
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            vpc: props.vpc,
            vpc_index: props.vpcIndex,
            acl: props.acl,
            craig: props.craig,
            subnet: props.subnet,
          })
        )}
      </div>
    </div>
  );
};

Subnet.propTypes = {
  grayNames: PropTypes.bool,
  subnet: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}).isRequired,
  ack: PropTypes.shape({}),
};
