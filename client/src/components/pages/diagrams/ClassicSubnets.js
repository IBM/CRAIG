import React from "react";
import PropTypes from "prop-types";
import { Connect, EarthFilled, VlanIbm } from "@carbon/icons-react";
import { arraySplatIndex, titleCase } from "lazy-z";
import { Tag } from "@carbon/react";
import { tagColors } from "../../forms/dynamic-form/components";
import HoverClassNameWrapper from "./HoverClassNameWrapper";
import { classicSubnetsFilter } from "../../../lib";

export const ClassicSubnets = (props) => {
  let subnets = classicSubnetsFilter(props);
  return subnets.map((vlan) => {
    // get vlan index from entire array for callbacks
    let vlanIndex = arraySplatIndex(
      props.craig.store.json.classic_vlans,
      "name",
      vlan.name
    );
    let isPrivate = vlan.type === "PRIVATE";
    let hoverClassName =
      "powerSubnetBox" +
      (props.small && vlanIndex === 0 ? " marginTopNone" : "") +
      (props.isSelected && props.isSelected(vlanIndex)
        ? " diagramBoxSelected"
        : "");
    return (
      <HoverClassNameWrapper
        static={props.static}
        className={hoverClassName}
        key={vlan.name + "-" + props.datacenter}
        hoverClassName="diagramBoxSelected"
      >
        <div
          className={
            "displayFlex marginBottomThreeQuarterRem" +
            (props.onClick ? " clicky" : "")
          }
          onClick={props.onClick ? () => props.onClick(vlanIndex) : undefined}
        >
          {props.small ? "" : <VlanIbm className="marginRightQuarterRem" />}
          <span className={props.small ? "font10px" : "powerSubnetName"}>
            {vlan.name}
          </span>
          {props.small ? (
            ""
          ) : (
            <Tag
              type={isPrivate ? tagColors[0] : tagColors[5]}
              style={{
                marginTop: "-0.05rem",
              }}
            >
              <div className="displayFlex font10Px">
                {isPrivate ? (
                  <Connect className="securityTabIconMargin" />
                ) : (
                  <EarthFilled className="securityTabIconMargin" />
                )}
                <div>{titleCase(vlan.type.toLowerCase())}</div>
              </div>
            </Tag>
          )}
        </div>
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            datacenter: props.datacenter,
            vlan: vlan.name,
          })
        )}
      </HoverClassNameWrapper>
    );
  });
};

ClassicSubnets.propTypes = {
  datacenter: PropTypes.string,
  craig: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func,
};
