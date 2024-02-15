import React from "react";
import { getDisplayTierSubnetList } from "../../../lib";
import { isString } from "lazy-z";
import { Subnet } from "./Subnet";
import PropTypes from "prop-types";
import "./diagrams.css";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const SubnetRow = (props) => {
  if (isString(props.tier)) {
    return (
      <Subnet
        vpcIndex={props.vpcIndex}
        vpc={props.vpc}
        acl={props.acl}
        key={props.vpc?.name + (props.acl ? props.acl.name : "")}
        craig={props.craig}
        small={props.small}
      >
        {props.renderChildren}
      </Subnet>
    );
  }

  let tierSubnets = getDisplayTierSubnetList(props);
  let allSubnetsHaveAcl = true;
  tierSubnets.forEach((subnet) => {
    if (
      props.hasAcl &&
      subnet.network_acl !== props.acl.name &&
      props.tier.advanced !== true &&
      !subnet.display
    ) {
      allSubnetsHaveAcl = false;
    } else if (
      props.tier &&
      props.acl &&
      props.tier.advanced &&
      subnet.network_acl !== props.acl.name &&
      !subnet.display
    ) {
      allSubnetsHaveAcl = false;
    }
  });

  let subnetRowClassName = "displayFlex subnetRowBox";
  if (!props.grayNames && !props.static) subnetRowClassName += " clicky";
  if (props.tierIndex === 0) subnetRowClassName += " marginTopHalfRem";
  if (
    props.isSelected &&
    props.isSelected(props.vpcIndex, props.tierIndex, allSubnetsHaveAcl)
  )
    subnetRowClassName += " diagramBoxSelected";

  return allSubnetsHaveAcl ? (
    <HoverClassNameWrapper
      key={props.vpc.name + (props.acl ? props.acl.name : "") + props.tier.name}
      className={subnetRowClassName}
      hoverClassName="diagramBoxSelected"
      static={props.static}
      onClick={
        props.onClick
          ? () => {
              props.onClick(props.vpcIndex, props.tierIndex);
            }
          : undefined
      }
    >
      {tierSubnets.map((subnet) => {
        return subnet.display === "none" ? (
          <div
            className={props.small ? "emptySmallSubnetBox" : "emptySubnetBox"}
          />
        ) : (
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
            small={props.small}
          >
            {props.renderChildren}
          </Subnet>
        );
      })}
    </HoverClassNameWrapper>
  ) : (
    ""
  );
};

SubnetRow.propTypes = {
  tier: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string]).isRequired,
  vpc: PropTypes.shape({}).isRequired,
  acl: PropTypes.shape({}),
  onClick: PropTypes.func,
  craig: PropTypes.shape({}).isRequired,
  renderChildren: PropTypes.node,
};
