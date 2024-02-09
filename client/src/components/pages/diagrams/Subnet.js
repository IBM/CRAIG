import React from "react";
import { IbmCloudSubnets } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";

export const Subnet = (props) => {
  let subnetClassName =
    props.small && props.subnet
      ? "subnetBoxSmall"
      : props.subnet
      ? "subnetBox"
      : "powerSubnetBox";
  let subnetName = props?.subnet?.name || "No Subnets Selected";
  return (
    <div
      className={subnetClassName}
      key={props?.subnet?.name + props.vpc.name + props.acl?.name}
    >
      {props.small ? (
        ""
      ) : (
        <div
          className={
            "displayFlex marginBottomThreeQuarterRem" +
            (props.grayNames ? " grayText" : "")
          }
          style={{
            color:
              subnetName === "No Subnets Selected"
                ? "red !important"
                : undefined,
          }}
        >
          <IbmCloudSubnets
            className="marginRightQuarterRem"
            style={subnetName === "No Subnets Selected" ? { fill: "red" } : {}}
          />
          <span
            className="bold"
            style={subnetName === "No Subnets Selected" ? { color: "red" } : {}}
          >
            {subnetName}
          </span>
        </div>
      )}
      <div className={props.grayNames ? " grayText" : ""}>
        {props?.subnet?.cidr || ""}
      </div>
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
