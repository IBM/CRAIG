import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { Security } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import "./diagrams.css";
import { CraigFormGroup } from "../../forms";

export const SecurityGroups = (props) => {
  let craig = props.craig;
  let vpc = props.vpc;
  return (
    <div
      className={
        "formInSubForm marginBottomSmall" +
        (props.width ? " securityGroupsBoxWidth" : "")
      }
    >
      <CraigFormHeading
        icon={<Security className="diagramTitleIcon" />}
        name="Security Groups"
        type="subHeading"
        noMarginBottom
      />
      <CraigFormGroup
        className={
          "displayFlex alignItemsCenter overrideGap" +
          (props.width ? " securityGroupsBoxWidth" : "")
        }
      >
        {craig.store.json.security_groups.map((sg, sgIndex) => {
          if (sg.vpc === vpc.name)
            return (
              <div
                key={"sg-" + sgIndex}
                className="fieldWidthSmaller sgDeploymentBox"
              >
                <DeploymentIcon
                  craig={craig}
                  icon={Security}
                  item={sg}
                  vpcIndex={props.vpc_index}
                  itemIndex={sgIndex}
                  itemName="security_groups"
                  isSelected={props.isSelected}
                  onClick={
                    props.onClick
                      ? () => props.onClick(props.vpc_index, sgIndex)
                      : undefined
                  }
                />
              </div>
            );
        })}
      </CraigFormGroup>
    </div>
  );
};

SecurityGroups.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}),
  width: PropTypes.string,
  buttons: PropTypes.node,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
};