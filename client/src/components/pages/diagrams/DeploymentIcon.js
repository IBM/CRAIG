import React from "react";
import { contains, isNullOrEmptyString, splatContains } from "lazy-z";
import { Tag } from "@carbon/react";
import { tagColors } from "../../forms/dynamic-form/components";
import { FloatingIp, Security } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";
import { disableSave } from "../../../lib";
import { RenderForm } from "../../forms";

/**
 * check to see if deployment icon is selected
 * @param {*} props
 * @returns {boolean} true if selected
 */
function deploymentIconIsSelected(props) {
  return props.isSelected
    ? props.isSelected(props)
    : props?.parentState?.selectedItem === props.itemName &&
        // select all items when f5
        (props?.parentState?.selectedIndex === props.itemIndex ||
          props.itemName === "f5_vsi") &&
        props?.parentState?.vpcIndex === props.vpcIndex;
}

/**
 * get boc classname for deployment icon
 * @param {*} props
 * @returns {string} className
 */
function deploymentIconBoxClassName(props) {
  let boxClassName = "deploymentIconBox";
  if (deploymentIconIsSelected(props)) {
    boxClassName += " diagramIconBoxSelected";
  }
  if (
    typeof props.isInvalid === "boolean"
      ? props.isInvalid
      : disableSave(props.itemName, props.item, {
          craig: props.craig,
          data: props.item,
        })
  ) {
    boxClassName += " diagramIconBoxInvalid";
  } else if (props.itemName === "vpn_gateways") {
    let addBoxClassName = "";
    props.item.connections.forEach((connection) => {
      if (isNullOrEmptyString(connection.peer_address, true))
        addBoxClassName = " diagramIconBoxInvalid";
    });
    boxClassName += addBoxClassName;
  }
  return boxClassName;
}

export const DeploymentIcon = (props) => {
  let boxClassName = deploymentIconBoxClassName(props);
  let hasSecurityGroups =
    contains(
      [
        "virtual_private_endpoints",
        "vsi",
        "vpn_servers",
        "load_balancers",
        "fortigate_vnf",
        "f5_vsi",
      ],
      props.itemName
    ) && !props.small;

  /**
   * get name display
   * @param {*} props
   * @returns {string} string
   */
  function nameDisplay(props) {
    let name = props.item.name || props.item.domain;
    if (props.count && props.count !== 1) {
      name += ` (x${props.count})`;
    } else if (
      props.itemName === "power_volumes" &&
      !isNullOrEmptyString(props.item.count, true)
    ) {
      name += ` (x${props.item.count})`;
    } else if (props.item.use_data) {
      name += " [Imported]";
    }
    return name;
  }

  return (
    <div className={boxClassName}>
      <div className="maxWidth150">
        {RenderForm(props.icon, {
          size: props.small ? "30" : props.size || "60",
          className: "margin1rem" + (props.onClick ? " clicky" : ""),
          onClick: props.onClick ? props.onClick : undefined,
        })}
        <p className="font12px">{nameDisplay(props)}</p>
      </div>
      {props.children}
      {hasSecurityGroups
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
      {props.itemName === "vsi" &&
      props.item.enable_floating_ip &&
      !props.small ? (
        <Tag type={tagColors[3]}>
          <div className="displayFlex font10Px">
            <FloatingIp className="securityTabIconMargin" /> Floating IP
          </div>
        </Tag>
      ) : (
        ""
      )}
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
