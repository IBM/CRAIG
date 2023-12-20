import React from "react";
import { buildSubnet, disableSave, propsMatchState } from "../../../lib";
import { IcseHeading } from "icse-react-assets";
import DynamicForm from "../DynamicForm";
import { Tile } from "@carbon/react";
import { PrimaryButton } from "../utils/ToggleFormComponents";

export const SubnetTileTitle = (props) => {
  return props.parentProps.formName === "subnet" ? (
    <IcseHeading
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
  let nextTier;
  let subnets;
  if (isSubnetTierForm) {
    nextTier = [
      props.parentProps.craig.store.subnetTiers[props.parentProps.data.name],
    ].length;
    subnets = [];
    while (subnets.length < props.parentState.zones) {
      subnets.push(
        buildSubnet(
          props.parentProps.vpc_name,
          Object.keys(props.parentProps.craig.store.subnetTiers).indexOf(
            props.parentProps.vpc_name
          ),
          props.parentState.name,
          nextTier,
          props.parentState.networkAcl,
          props.parentProps.data.resource_group,
          subnets.length + 1,
          props.parentState.addPublicGateway
        )
      );
    }
  }
  return isSubnetTierForm ? (
    <div
      className={`${props.parentProps.isModal ? "subForm" : "formInSubForm"}`}
      style={{
        marginTop: "1rem",
        marginBottom: props.parentProps.isModal ? "0rem" : undefined,
      }}
    >
      <IcseHeading name="Subnets" type="subHeading" noMarginBottom />
      <div className="displayFlex">
        {subnets.map((subnet, index) => (
          <Tile
            key={subnet.name + index}
            className={`marginRightSubnetTile ${
              props.parentProps.isModal ? "formInSubForm" : "subForm"
            }`}
            style={{ marginBottom: "0rem" }}
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
        ))}
      </div>
    </div>
  ) : (
    ""
  );
};
