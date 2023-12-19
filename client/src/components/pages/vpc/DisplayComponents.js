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
  let craig = props.craig;
  return (
    <div
      key={props.vpc.name + props.acl.name + props.tier.name}
      style={{
        border: "2px dotted gray",
        width: "500px",
        marginBottom:
          props.tierIndex === craig.store.subnetTiers[props.vpc.name].length - 1
            ? ""
            : "1rem",
      }}
      className="displayFlex "
      onClick={props.onClick}
    >
      {tierSubnets.map((subnet) => {
        return (
          <SubnetBox
            style={{
              border: "2px solid #00882B",
              margin: "0.5rem",
              padding: "0.5rem",
              width: "150px",
              background: "#E6F0E2",
            }}
            subnet={subnet}
            vpc={props.vpc}
            acl={props.acl}
            key={subnet.name + props.vpc.name + props.acl.name}
          />
        );
      })}
    </div>
  );
};
