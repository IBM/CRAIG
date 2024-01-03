import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { Security } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import { IcseFormGroup } from "icse-react-assets";

export const SecurityGroups = (props) => {
  let craig = props.craig;
  let vpc = props.vpc;
  return (
    <div
      className="formInSubForm marginBottomSmall"
      style={{ width: props.width ? props.width : "535px" }}
    >
      <CraigFormHeading
        icon={<Security className="diagramTitleIcon" />}
        name="Security Groups"
        type="subHeading"
        noMarginBottom
      />
      <IcseFormGroup
        className="displayFlex alignItemsCenter overrideGap"
        style={{ width: props.width ? props.width : "535px" }}
      >
        {craig.store.json.security_groups.map((sg, sgIndex) => {
          if (sg.vpc === vpc.name)
            return (
              <div
                key={"sg-" + sgIndex}
                className="fieldWidthSmaller"
                style={{
                  textAlign: "center",
                  maxWidth: "150px",
                }}
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
      </IcseFormGroup>
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
