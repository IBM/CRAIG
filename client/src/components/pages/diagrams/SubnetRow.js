import React from "react";
import { getTierSubnets } from "../../../lib";
import { splatContains } from "lazy-z";
import { Subnet } from "./Subnet";
import PropTypes from "prop-types";
import "./diagrams.css";

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

  let subnetRowClassName = "displayFlex subnetRowBox";
  if (props.tierIndex === 0) subnetRowClassName += " marginTopHalfRem";
  if (
    props.isSelected &&
    props.isSelected(props.vpcIndex, props.tierIndex, allSubnetsHaveAcl)
  )
    subnetRowClassName += " diagramBoxSelected";

  return allSubnetsHaveAcl &&
    (!props.tier.advanced ||
      // prevent advanced tiers from rendering in unfound groups
      (props.acl &&
        splatContains(tierSubnets, "network_acl", props.acl.name))) ? (
    <div
      key={props.vpc.name + (props.acl ? props.acl.name : "") + props.tier.name}
      className={subnetRowClassName}
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
