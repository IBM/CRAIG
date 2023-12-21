import React from "react";
import { IbmCloudSubnets } from "@carbon/icons-react";
import { getTierSubnets } from "../../../lib";

const SubnetBox = (props) => {
  return (
    <div
      style={{
        border: "2px solid #00882B",
        margin: "0.5rem",
        padding: "0.5rem",
        width: "150px",
        background: "#E6F0E2",
      }}
      key={props.subnet.name + props.vpc.name + props.acl.name}
    >
      <div className="displayFlex" style={{ marginBottom: "0.75rem" }}>
        <IbmCloudSubnets style={{ marginRight: "0.25rem" }} />
        <span style={{ fontWeight: "bold" }}>{props.subnet.name}</span>
      </div>
      <div>{props.subnet.cidr}</div>
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
