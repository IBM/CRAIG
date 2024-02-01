import React from "react";
import { SubnetRow } from "./SubnetRow";
import PropTypes from "prop-types";
import { IbmCloudSubnets } from "@carbon/icons-react";
import { isEmpty } from "lazy-z";

export const SubnetTierMap = (props) => {
  let vpc = props.vpc;
  let vpcIndex = props.vpc_index;
  let craig = props.craig;
  let emptySubnetResources = false;
  // check for empty subnet objects
  ["virtual_private_endpoints", "vsi", "vpn_servers", "clusters"].forEach(
    (field) => {
      craig.store.json[field].forEach((item) => {
        if (isEmpty(item.subnets) && item.vpc === vpc.name) {
          emptySubnetResources = true;
        }
      });
    }
  );

  ["vpn_gateways"].forEach((field) => {
    craig.store.json[field].forEach((item) => {
      if (item.subnet === null && item.vpc === vpc.name)
        emptySubnetResources = true;
    });
  });

  let subnetTiers = craig.store.subnetTiers[vpc.name];
  if (emptySubnetResources && !props.foundSubnetsOnly) {
    subnetTiers = subnetTiers.concat("NO_SUBNETS");
  }

  return vpc.name ? (
    subnetTiers.map((tier, tierIndex) => {
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
          static={props.static}
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
