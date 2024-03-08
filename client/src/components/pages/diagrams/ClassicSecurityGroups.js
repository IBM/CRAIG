import React from "react";
import { CraigFormHeading } from "../../forms/utils";
import { SecurityServices } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import "./diagrams.css";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const ClassicSecurityGroups = (props) => {
  let craig = props.craig;
  return (
    <HoverClassNameWrapper
      className={
        "subForm marginBottomSmall" +
        (props.width ? " securityGroupsBoxWidth" : "")
      }
      hoverClassName="diagramBoxSelected"
      static={props.static}
    >
      <CraigFormHeading
        icon={<SecurityServices className="diagramTitleIcon" />}
        name="Classic Security Groups"
        type="subHeading"
        noMarginBottom
      />
      <div className={"marginBottomSmall"} />
      <div
        className={
          "formInSubForm displayFlex alignItemsCenter powerSubnetChildren" +
          (props.width ? " securityGroupsBoxWidth" : "")
        }
      >
        {craig.store.json.classic_security_groups.length === 0
          ? "No Classic Security Groups"
          : craig.store.json.classic_security_groups.map((sg, sgIndex) => {
              return (
                <HoverClassNameWrapper
                  key={"sg-" + sgIndex}
                  className="fieldWidthSmaller sgDeploymentBox"
                  static={props.static}
                  hoverClassName="diagramIconBoxSelected"
                >
                  <DeploymentIcon
                    craig={craig}
                    icon={SecurityServices}
                    item={sg}
                    itemIndex={sgIndex}
                    itemName="security_groups"
                    isSelected={props.isSelected}
                    onClick={
                      props.onClick
                        ? () => {
                            props.onClick(sgIndex);
                          }
                        : undefined
                    }
                  />
                </HoverClassNameWrapper>
              );
            })}
      </div>
    </HoverClassNameWrapper>
  );
};

ClassicSecurityGroups.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}),
  width: PropTypes.string,
  buttons: PropTypes.node,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
};
