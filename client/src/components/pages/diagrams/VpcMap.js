import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { VirtualPrivateCloud } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";
import { disableSave } from "../../../lib";
import { isNullOrEmptyString } from "lazy-z";

export const VpcMap = (props) => {
  let craig = props.craig;
  return craig.store.json.vpcs.map((vpc, vpcIndex) => {
    let vpcBoxClassName = "subForm marginBottomSmall marginRight1Rem width580";
    let isRed = isNullOrEmptyString(vpc.resource_group, true);
    if (props.isSelected && props.isSelected(vpcIndex)) {
      vpcBoxClassName += " diagramBoxSelected";
      isRed = false;
    }
    return (
      <div className={vpcBoxClassName} key={vpc.name + vpc.index}>
        <div className={props.static ? "" : "clicky"}>
          <CraigFormHeading
            isRed={isRed}
            icon={<VirtualPrivateCloud className="diagramTitleIcon" />}
            className="marginBottomSmall"
            type="subHeading"
            name={vpc.name + " VPC"}
            buttons={props.buttons ? props.buttons(vpcIndex) : ""}
            onClick={
              props.onTitleClick
                ? () => props.onTitleClick(vpcIndex)
                : undefined
            }
          />
        </div>
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            vpc: vpc,
            vpc_index: vpcIndex,
          })
        )}
      </div>
    );
  });
};

VpcMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func,
  buttons: PropTypes.func,
};
