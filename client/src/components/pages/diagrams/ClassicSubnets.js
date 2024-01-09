import React from "react";
import PropTypes from "prop-types";
import { Connect, EarthFilled, Router, VlanIbm } from "@carbon/icons-react";
import { arraySplatIndex, titleCase } from "lazy-z";
import { Tag } from "@carbon/react";
import { tagColors } from "../../forms/dynamic-form/components";

export const ClassicSubnets = (props) => {
  return props.craig.store.json.classic_vlans
    .filter((vlan) => {
      // only display vlans in datacenter
      if (vlan.datacenter === props.datacenter) {
        return vlan;
      }
    })
    .map((vlan) => {
      // get vlan index from entire array for callbacks
      let vlanIndex = arraySplatIndex(
        props.craig.store.json.classic_vlans,
        "name",
        vlan.name
      );
      let isPrivate = vlan.type === "PRIVATE";
      return (
        <div
          className={
            "powerSubnetBox" +
            (props.isSelected && props.isSelected(vlanIndex)
              ? " diagramBoxSelected"
              : "")
          }
          key={vlan.name + "-" + props.datacenter}
        >
          <div
            className={
              "displayFlex marginBottomThreeQuarterRem" +
              (props.onClick ? " clicky" : "")
            }
            onClick={props.onClick ? () => props.onClick(vlanIndex) : undefined}
          >
            <VlanIbm className="marginRightQuarterRem" />
            <span className="powerSubnetName">{vlan.name}</span>
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
          </div>
          {React.Children.map(props.children, (child) =>
            // clone react child
            React.cloneElement(child, {
              datacenter: props.datacenter,
              vlan: vlan.name,
            })
          )}
        </div>
      );
    });
};

ClassicSubnets.propTypes = {
  datacenter: PropTypes.string,
  craig: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func,
};
