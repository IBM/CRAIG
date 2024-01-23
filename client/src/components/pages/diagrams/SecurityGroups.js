import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { Security } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import "./diagrams.css";
import { CraigFormGroup } from "../../forms";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const SecurityGroups = (props) => {
  let craig = props.craig;
  let vpc = props.vpc;
  return (
    <HoverClassNameWrapper
      className={
        "formInSubForm marginBottomSmall" +
        (props.width ? " securityGroupsBoxWidth" : "") +
        (props.vpc.name === null ? " diagramSubFormInvalid" : "")
      }
      hoverClassName="diagramBoxSelected"
      static={props.static}
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
              <HoverClassNameWrapper
                key={"sg-" + sgIndex}
                className="fieldWidthSmaller sgDeploymentBox"
                static={props.static}
                hoverClassName="diagramIconBoxSelected"
              >
                <DeploymentIcon
                  craig={craig}
                  icon={Security}
                  item={sg}
                  vpcIndex={props.vpc_index}
                  isInvalid={props.vpc.name === null}
                  itemIndex={sgIndex}
                  itemName="security_groups"
                  isSelected={props.isSelected}
                  onClick={
                    props.onClick
                      ? () => props.onClick(props.vpc_index, sgIndex)
                      : undefined
                  }
                />
              </HoverClassNameWrapper>
            );
        })}
      </CraigFormGroup>
    </HoverClassNameWrapper>
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
