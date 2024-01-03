import React from "react";
import { SubnetRow } from "./SubnetRow";
import PropTypes from "prop-types";

export const SubnetTierMap = (props) => {
  let vpc = props.vpc;
  let vpcIndex = props.vpc_index;
  let craig = props.craig;
  return craig.store.subnetTiers[vpc.name].map((tier, tierIndex) => {
    return (
      <SubnetRow
        key={vpc.name + JSON.stringify(tier)}
        tier={tier}
        tierIndex={tierIndex}
        vpc={vpc}
        acl={props.acl}
        hasAcl={props.acl ? true : false}
        vpcIndex={vpcIndex}
        craig={craig}
        renderChildren={props.renderChildren}
        isSelected={props.isSelected}
        onClick={props.onClick}
        grayNames={props.grayNames}
      />
    );
  });
};

SubnetTierMap.propTypes = {
  vpc: PropTypes.shape({}),
  vpc_index: PropTypes.number,
  craig: PropTypes.shape({}).isRequired,
  acl: PropTypes.shape({}),
  renderChildren: PropTypes.node,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
  grayNames: PropTypes.bool,
};
