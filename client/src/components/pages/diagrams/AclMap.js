import React from "react";
import { isEmpty, isNullOrEmptyString, splatContains } from "lazy-z";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { SubnetAclRules } from "@carbon/icons-react";
import "./diagrams.css";
import PropTypes from "prop-types";

export const AclMap = (props) => {
  let vpc = props.vpc;
  let subnets = vpc.subnets || []; // empty subnets for no vpc
  // add null as acl
  let initialAclList = splatContains(subnets, "network_acl", null)
    ? [{ name: null }]
    : [];
  // if no acls on vpc, add null
  let aclList = initialAclList.concat(
    vpc.acls || [
      {
        name: null,
      },
    ]
  );
  return isEmpty(vpc.acls || []) && !props.static ? (
    <CraigEmptyResourceTile name="ACLs" />
  ) : (
    aclList.map((acl, aclIndex) => {
      // adding null offsets index, this corrects
      let actualAclIndex = splatContains(subnets, "network_acl", null)
        ? aclIndex - 1
        : aclIndex;
      let aclClassName = "formInSubForm aclBox";
      let isRed = isNullOrEmptyString(
        acl ? acl.resource_group : undefined,
        true
      );
      if (aclIndex !== 0) aclClassName += " aclBoxTop";
      if (
        props.isSelected &&
        props.isSelected(props.vpc_index, actualAclIndex)
      ) {
        aclClassName += " diagramBoxSelected";
        isRed = false;
      }
      if (!acl?.name) aclClassName += "noAclBox";
      return (
        <div
          key={acl.name + vpc.name + aclIndex + props.vpc_index}
          className={aclClassName}
        >
          <div
            onClick={
              props.aclTitleClick
                ? () => props.aclTitleClick(props.vpc_index, actualAclIndex)
                : undefined
            }
            className="clicky"
          >
            <CraigFormHeading
              name={acl?.name ? acl.name + " ACL" : "No ACL Selected"}
              icon={<SubnetAclRules className="diagramTitleIcon" />}
              className="marginBottomSmall"
              type="subHeading"
              isRed={isRed}
              buttons={
                props.buttons
                  ? props.buttons(acl, props.vpc_index, actualAclIndex)
                  : undefined
              }
            />
          </div>
          {React.Children.map(props.children, (child) =>
            // clone react child
            React.cloneElement(child, {
              vpc: vpc,
              vpc_index: props.vpc_index,
              acl: acl,
            })
          )}
        </div>
      );
    })
  );
};

AclMap.propTypes = {
  vpc: PropTypes.shape({}),
  isSelected: PropTypes.func,
  aclTitleClick: PropTypes.func,
  buttons: PropTypes.func,
};
