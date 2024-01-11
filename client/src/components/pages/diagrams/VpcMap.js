import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { GatewayPublic, VirtualPrivateCloud } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";
import { isNullOrEmptyString, splatContains } from "lazy-z";
import { DeploymentIcon } from "./DeploymentIcon";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";

export const VpcMap = (props) => {
  let craig = props.craig;
  return craig.store.json.vpcs.length === 0 && !props.static ? (
    <CraigEmptyResourceTile name="VPCs" className="width580 marginTopHalfRem" />
  ) : (
    craig.store.json.vpcs.map((vpc, vpcIndex) => {
      let vpcBoxClassName =
        "subForm marginBottomSmall marginRight1Rem width580";
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
          <div
            className="displayFlex overrideGap alignItemsCenter"
            style={{
              justifyContent: "center",
            }}
          >
            {["1", "2", "3"].map((num) => {
              return (
                <div style={{ width: "150px" }} key={num}>
                  {splatContains(vpc.public_gateways, "zone", Number(num)) ? (
                    <DeploymentIcon
                      icon={GatewayPublic}
                      item={{ name: "Public Gateway" }}
                      isSelected={() => {
                        return false;
                      }}
                      itemName="public_gateway"
                    />
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    })
  );
};

VpcMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func,
  buttons: PropTypes.func,
};
