import React from "react";
import { RenderForm } from "../../forms/utils/ToggleFormComponents";
import { contains } from "lazy-z";
import { Tag } from "@carbon/react";
import { tagColors } from "../../forms/dynamic-form/components";
import { Security } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";

export const DeploymentIcon = (props) => {
  let isSelected = props.isSelected
    ? props.isSelected(props)
    : props?.parentState?.selectedItem === props.itemName &&
      // select all items when f5
      (props?.parentState?.selectedIndex === props.itemIndex ||
        props.itemName === "f5_vsi") &&
      props?.parentState?.vpcIndex === props.vpcIndex;
  let boxClassName = "deploymentIconBox";
  if (isSelected) boxClassName += " diagramIconBoxSelected";
  if (props.isInvalid) boxClassName += " diagramIconBoxInvalid";
  return (
    <div className={boxClassName}>
      <div className="maxWidth150">
        {RenderForm(props.icon, {
          size: props.size || "60",
          className: "margin1rem" + (props.onClick ? " clicky" : ""),
          onClick: props.onClick ? props.onClick : undefined,
        })}
        <p className="font12px">{props.item.name}</p>
      </div>
      {props.children}
      {contains(
        [
          "virtual_private_endpoints",
          "vsi",
          "vpn_servers",
          "load_balancers",
          "fortigate_vnf",
          "f5_vsi",
        ],
        props.itemName
      )
        ? props.item.security_groups.map((sg, i) => (
            <Tag
              key={props.item.name + props.itemName + sg}
              type={tagColors[i % tagColors.length]}
              onClick={
                props.onTabClick ? () => props.onTabClick(sg) : undefined
              }
              className={
                props.tabSelected && props.tabSelected(sg)
                  ? "diagramBoxSelected"
                  : ""
              }
            >
              <div className="displayFlex font10Px">
                <Security className="securityTabIconMargin" /> {sg}
              </div>
            </Tag>
          ))
        : ""}
    </div>
  );
};

DeploymentIcon.propTypes = {
  isSelected: PropTypes.func,
  parentState: PropTypes.shape({}),
  itemName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  onTabClick: PropTypes.func,
  tabSelected: PropTypes.func,
  isInvalid: PropTypes.bool,
};
