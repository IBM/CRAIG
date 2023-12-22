import React from "react";
import {
  BareMetalServer_02,
  IbmCloudSubnets,
  Security,
} from "@carbon/icons-react";
import { disableSave, getTierSubnets } from "../../../lib";
import { RenderForm } from "../../forms/utils/ToggleFormComponents";
import { contains } from "lazy-z";
import { Tag } from "@carbon/react";
import { tagColors } from "../../forms/dynamic-form/components";

export const SubnetBox = (props) => {
  return (
    <div
      style={{
        border: "2px solid #00882B",
        margin: "0.5rem",
        padding: "0.5rem",
        width: "150px",
        background: "#E6F0E2",
        color: props.children ? "gray" : undefined,
      }}
      key={props.subnet.name + props.vpc.name + props.acl?.name}
    >
      <div className="displayFlex" style={{ marginBottom: "0.75rem" }}>
        <IbmCloudSubnets style={{ marginRight: "0.25rem" }} />
        <span style={{ fontWeight: "bold" }}>{props.subnet.name}</span>
      </div>
      <div>{props.subnet.cidr}</div>
      <div
        style={{
          textAlign: "center",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export const SubnetTierRow = (props) => {
  let tierSubnets = getTierSubnets(props.tier, props.vpc)(props.tier);
  let allSubnetsHaveAcl = true;
  tierSubnets.forEach((subnet) => {
    if (subnet.acl_name !== props.acl.name) allSubnetsHaveAcl = false;
  });

  return allSubnetsHaveAcl ? (
    <div
      key={props.vpc.name + props.acl.name + props.tier.name}
      style={{
        border: "2px dotted gray",
        width: "500px",
        marginTop: props.tierIndex === 0 ? "" : "0.5rem",
        boxShadow:
          props.parentVpcIndex === props.vpcIndex &&
          allSubnetsHaveAcl &&
          props.parentTierIndex === props.tierIndex
            ? " 0 10px 14px 0 rgba(0, 0, 0, 0.24),0 17px 50px 0 rgba(0, 0, 0, 0.19)"
            : "",
      }}
      className="displayFlex "
      onClick={props.onClick}
    >
      {tierSubnets.map((subnet) => {
        return (
          <SubnetBox
            subnet={subnet}
            vpc={props.vpc}
            acl={props.acl}
            key={subnet.name + props.vpc.name + props.acl.name}
          />
        );
      })}
    </div>
  ) : (
    ""
  );
};

export const DeploymentIcon = (props) => {
  let isSelected =
    props.parentState.selectedItem === props.itemName &&
    props.parentState.selectedIndex === props.itemIndex &&
    props.parentState.vpcIndex === props.vpcIndex;
  return (
    <div
      style={{
        color: isSelected ? "blue" : "black",
        textShadow: isSelected
          ? " 0 10px 14px 0 rgba(0, 0, 100, 0.24),0 17px 50px 0 rgba(0, 0, 100, 0.19)"
          : "",
      }}
    >
      {RenderForm(props.icon, {
        size: "60",
        style: { margin: "1rem" },
        onClick: props.onClick,
      })}
      <p style={{ fontSize: "12px" }}>{props.item.name}</p>
      {contains(["virtual_private_endpoints", "vsi"], props.itemName)
        ? props.item.security_groups.map((sg, i) => (
            <Tag
              key={props.item.name + props.itemName + sg}
              type={tagColors[i % tagColors.length]}
              onClick={() => props.onTabClick(sg)}
              style={{
                boxShadow: props.tabSelected(sg)
                  ? " 0 10px 14px 0 rgba(0, 0, 100, 0.24),0 17px 50px 0 rgba(0, 0, 100, 0.19)"
                  : "",
              }}
            >
              <div className="displayFlex" style={{ fontSize: "10px" }}>
                <Security style={{ marginRight: "0.33rem" }} /> {sg}
              </div>
            </Tag>
          ))
        : ""}
    </div>
  );
};
