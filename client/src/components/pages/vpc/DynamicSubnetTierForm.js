import { ToggleForm } from "icse-react-assets";
import React from "react";
import {
  disableSave,
  getSubnetTierStateData,
  propsMatchState,
} from "../../../lib";
import DynamicForm from "../../forms/DynamicForm";
import { capitalize, contains } from "lazy-z";
import { CraigToggleForm } from "../../forms/utils";

/**
 * get subnet tier name / move later
 * @param {*} tierName
 * @returns {string} tier name
 */
function subnetTierName(tierName) {
  if (contains(["vsi", "vpe", "vpn", "vpn-1", "vpn-2"], tierName)) {
    return tierName.toUpperCase() + " Subnet Tier";
  } else if (tierName === "") {
    return "New Subnet Tier";
  } else {
    return capitalize(tierName) + " Subnet Tier";
  }
}

export const DynamicSubnetTierForm = (props) => {
  let vpcName = props.craig.store.json.vpcs[props.vpcIndex].name;
  let subnetTier =
    props.craig.store.subnetTiers[vpcName][props.subnetTierIndex];
  return (
    <CraigToggleForm
      key={props.vpcIndex + "-subnet-tier-form-" + props.subnetTierIndex}
      onSave={props.craig.vpcs.subnetTiers.save}
      onDelete={props.craig.vpcs.subnetTiers.delete}
      hideChevon
      hideTitle
      isModal
      hide={false}
      noSaveButton={props.subnetTierIndex === -1}
      noDeleteButton={props.subnetTierIndex === -1}
      type={props.subnetTierIndex === -1 ? "formInSubForm" : "form"}
      hideName
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      submissionFieldName="subnetTier"
      tabPanel={{ hideAbout: true }}
      name={
        subnetTier?.name ? subnetTierName(subnetTier.name) : "New Subnet Tier"
      }
      innerFormProps={{
        data:
          props.subnetTierIndex === -1
            ? {}
            : getSubnetTierStateData(
                subnetTier,
                props.craig.store.json.vpcs[props.vpcIndex]
              ),
        formName: "subnetTiers",
        craig: props.craig,
        form: {
          groups: [
            {
              name: props.craig.vpcs.subnetTiers.name,
              zones:
                props.craig.vpcs.subnetTiers[
                  subnetTier?.advanced ? "advanced_zones" : "zones"
                ],
              advanced: props.craig.vpcs.subnetTiers.advanced,
            },
            {
              networkAcl: props.craig.vpcs.subnetTiers.networkAcl,
              addPublicGateway: props.craig.vpcs.subnetTiers.addPublicGateway,
            },
          ],
        },
        vpc_name: vpcName,
      }}
    />
  );
};
