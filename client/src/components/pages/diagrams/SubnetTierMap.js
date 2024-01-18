import React from "react";
import { SubnetRow } from "./SubnetRow";
import PropTypes from "prop-types";
import { IbmCloudSubnets } from "@carbon/icons-react";

export const SubnetTierMap = (props) => {
  let vpc = props.vpc;
  let vpcIndex = props.vpc_index;
  let craig = props.craig;
  return vpc.name ? (
    craig.store.subnetTiers[vpc.name].map((tier, tierIndex) => {
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
          small={props.small}
        />
      );
    })
  ) : (
    <>
      <div className="powerSubnetBox">
        <div className={"displayFlex marginBottomThreeQuarterRem"}>
          <IbmCloudSubnets className="marginRightQuarterRem diagramSubFormInvalid" />
          <span className="powerSubnetName diagramSubFormInvalid">
            No VPC Selected
          </span>
        </div>
        <div className="alignItemsCenter">{props.renderChildren}</div>
      </div>
    </>
  );
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
