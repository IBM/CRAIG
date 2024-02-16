import React from "react";
import { IbmCloudSubnets } from "@carbon/icons-react";
import PropTypes from "prop-types";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const PowerSubnet = (props) => {
  return (
    <HoverClassNameWrapper
      className={
        "powerSubnetBox" +
        (props.small && props.subnetIndex === 0 ? " marginTopNone" : "") +
        (props.subnet.name === "No Workspace" ||
        props.subnet.name === "No Subnets Selected"
          ? " diagramIconBoxInvalid"
          : "")
      }
      hoverClassName="diagramBoxSelected"
      static={props.static}
    >
      <div
        className={
          "displayFlex marginBottomThreeQuarterRem" +
          (props.onClick ? " clicky" : "")
        }
        onClick={props.onClick ? props.onClick : undefined}
      >
        {props.small ? (
          ""
        ) : (
          <>
            <IbmCloudSubnets className="marginRightQuarterRem" />
            <span className={"powerSubnetName"}>{props.subnet.name}</span>
            {props.subnet.use_data ? (
              <span
                className="powerSubnetName"
                style={{ fontWeight: "normal" }}
              >
                [Imported]
              </span>
            ) : (
              ""
            )}
          </>
        )}
        <div style={props.small ? { fontSize: "10px" } : {}}>
          {props.subnet.pi_cidr}
        </div>
      </div>
      {props.children}
    </HoverClassNameWrapper>
  );
};

PowerSubnet.propTypes = {
  subnet: PropTypes.shape({
    name: PropTypes.string,
    pi_cidr: PropTypes.string,
  }).isRequired,
};
