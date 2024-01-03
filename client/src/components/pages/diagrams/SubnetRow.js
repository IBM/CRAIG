import React from "react";
import { getTierSubnets } from "../../../lib";
import { splatContains } from "lazy-z";
import { Subnet } from "./Subnet";
import PropTypes from "prop-types";

export const SubnetRow = (props) => {
  let tierSubnets = getTierSubnets(props.tier, props.vpc)(props.tier);
  let allSubnetsHaveAcl = true;
  tierSubnets.forEach((subnet) => {
    if (
      props.hasAcl &&
      subnet.acl_name !== props.acl.name &&
      props.tier.advanced !== true
    )
      allSubnetsHaveAcl = false;
  });

  return allSubnetsHaveAcl &&
    (!props.tier.advanced ||
      // prevent advanced tiers from rendering in unfound groups
      (props.acl &&
        splatContains(tierSubnets, "network_acl", props.acl.name))) ? (
    <div
      key={props.vpc.name + (props.acl ? props.acl.name : "") + props.tier.name}
      style={{
        border: "2px dotted gray",
        width: "500px",
        marginTop: props.tierIndex === 0 ? "" : "0.5rem",
        boxShadow:
          props.isSelected &&
          props.isSelected(props.vpcIndex, props.tierIndex, allSubnetsHaveAcl)
            ? " 0 10px 14px 0 rgba(0, 0, 0, 0.24),0 17px 50px 0 rgba(0, 0, 0, 0.19)"
            : "",
      }}
      className="displayFlex"
      onClick={
        props.onClick
          ? () => {
              props.onClick(props.vpcIndex, props.tierIndex);
            }
          : undefined
      }
    >
      {tierSubnets.map((subnet) => {
        return (
          <Subnet
            grayNames={props.grayNames}
            subnet={subnet}
            vpcIndex={props.vpcIndex}
            vpc={props.vpc}
            acl={props.acl}
            key={
              subnet.name + props.vpc.name + (props.acl ? props.acl.name : "")
            }
            craig={props.craig}
          >
            {props.renderChildren}
          </Subnet>
        );
      })}
    </div>
  ) : (
    ""
  );
};

SubnetRow.propTypes = {
  tier: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}).isRequired,
  acl: PropTypes.shape({}),
  onClick: PropTypes.func,
  craig: PropTypes.shape({}).isRequired,
  renderChildren: PropTypes.node,
};
