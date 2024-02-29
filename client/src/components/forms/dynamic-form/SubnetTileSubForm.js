import React from "react";
import { disableSave, propsMatchState } from "../../../lib";
import { Tile } from "@carbon/react";
import { CraigFormHeading, PrimaryButton } from "../utils";
import { getSubnetData } from "../../../lib/forms/dynamic-subnet-tile-sub-form";
import DynamicForm from "../DynamicForm";

export const SubnetTileTitle = (props) => {
  return props.parentProps.formName === "subnet" ? (
    <CraigFormHeading
      name={props.parentState.name}
      type="subHeading"
      buttons={
        props.parentProps.isModal ? (
          ""
        ) : (
          <PrimaryButton
            noDeleteButton
            name={props.parentProps.data.name || "New Subnet"}
            disabled={
              disableSave("subnet", props.parentState, props.parentProps) ||
              propsMatchState("subnet", props.parentState, props.parentProps)
            }
            onClick={() => {
              props.parentProps.craig.vpcs.subnets.save(
                props.parentState,
                props.parentProps
              );
            }}
          />
        )
      }
    />
  ) : (
    ""
  );
};

export const SubnetTileSubForm = (props) => {
  let isSubnetTierForm = props.parentProps.formName === "subnetTiers";
  let subnets;
  if (isSubnetTierForm) {
    subnets = getSubnetData(props);
  }
  return isSubnetTierForm ? (
    <div
      className={`${
        props.parentProps.dynamicSubnetFormSubForm
          ? ""
          : props.parentProps.isModal
          ? "subForm"
          : "formInSubForm"
      } marginTop1Rem marginBottomNone`}
    >
      <CraigFormHeading name="Subnets" type="subHeading" noMarginBottom />
      <div className="displayFlex">
        {subnets.map((subnet, index) => {
          if (subnet.name === "NONE") {
            return (
              <Tile
                key={subnet.name + index}
                className={`marginRightSubnetTile ${
                  props.parentProps.isModal ? "formInSubForm" : "subForm"
                } marginBottomNone`}
              >
                <CraigFormHeading
                  name={`No Subnet in Zone ${index + 1}`}
                  type="subHeading"
                />
                <div className="fieldWidthSmaller" />
              </Tile>
            );
          } else
            return (
              <Tile
                key={subnet.name + index}
                className={`marginRightSubnetTile marginBottomNone ${
                  props.parentProps.isModal ? "formInSubForm" : "subForm"
                }`}
              >
                <DynamicForm
                  isModal={props.parentProps.isModal}
                  tier={props.parentProps.data.name}
                  vpc_name={props.parentProps.vpc_name}
                  formName="subnet"
                  data={subnet}
                  craig={props.parentProps.craig}
                  form={{
                    groups: [
                      {
                        name: props.parentProps.craig.vpcs.subnets.name,
                      },
                      {
                        cidr: props.parentProps.craig.vpcs.subnets.cidr,
                      },
                      {
                        network_acl:
                          props.parentProps.craig.vpcs.subnets.network_acl,
                      },
                      {
                        public_gateway:
                          props.parentProps.craig.vpcs.subnets.public_gateway,
                      },
                    ],
                  }}
                />
              </Tile>
            );
        })}
      </div>
    </div>
  ) : (
    ""
  );
};
