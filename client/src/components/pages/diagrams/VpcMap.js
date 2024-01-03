import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { VirtualPrivateCloud } from "@carbon/icons-react";
import PropTypes from "prop-types";

export const VpcMap = (props) => {
  let craig = props.craig;
  return craig.store.json.vpcs.map((vpc, vpcIndex) => {
    return (
      <div
        className="subForm marginBottomSmall"
        key={vpc.name + vpc.index}
        style={{
          marginRight: "1rem",
          width: "580px",
          boxShadow:
            props.isSelected && props.isSelected(vpcIndex)
              ? " 0 10px 14px 0 rgba(0, 0, 0, 0.24),0 17px 50px 0 rgba(0, 0, 0, 0.19)"
              : "",
        }}
      >
        <div
          onClick={
            props.onTitleClick ? () => props.onTitleClick(vpcIndex) : undefined
          }
        >
          <CraigFormHeading
            icon={<VirtualPrivateCloud className="diagramTitleIcon" />}
            className="marginBottomSmall"
            type="subHeading"
            name={vpc.name + " VPC"}
            buttons={props.buttons ? props.buttons(vpcIndex) : ""}
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
