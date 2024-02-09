import React from "react";
import { getSubnetTierStateData } from "../../../lib";
import { capitalize, contains, transpose } from "lazy-z";
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

// stateful form to prevent warnings about passing references
export class DynamicSubnetTierForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: this.props.hide || false,
    };
  }
  render() {
    let vpcName = this.props.craig.store.json.vpcs[this.props.vpcIndex].name;
    let subnetTier = this.props.craig.store.json.vpcs[this.props.vpcIndex]
      .subnetTiers
      ? this.props.craig.store.json.vpcs[this.props.vpcIndex].subnetTiers[
          this.props.subnetTierIndex
        ]
      : this.props.craig.store.subnetTiers[vpcName][this.props.subnetTierIndex];
    let innerFormProps = {
      data:
        this.props.subnetTierIndex === -1
          ? {
              networkAcl: this.props.aclName,
            }
          : getSubnetTierStateData(
              subnetTier,
              this.props.craig.store.json.vpcs[this.props.vpcIndex]
            ),
      formName: "subnetTiers",
      craig: this.props.craig,
      form: {
        groups: [
          {
            name: this.props.craig.vpcs.subnetTiers.name,
            zones: this.props.craig.vpcs.subnetTiers.zones,
            advanced: this.props.craig.vpcs.subnetTiers.advanced,
          },
          {
            networkAcl: this.props.craig.vpcs.subnetTiers.networkAcl,
            addPublicGateway:
              this.props.craig.vpcs.subnetTiers.addPublicGateway,
          },
        ],
      },
      vpc_name: vpcName,
      vpc: vpcName,
    };
    transpose(this.props.innerFormProps || {}, innerFormProps);
    let noButtons =
      this.props.subnetTierIndex === -1 ||
      contains(
        [
          "vpn-2",
          "vpn-1",
          "f5-workload",
          "f5-management",
          "f5-bastion",
          "f5-external",
        ],
        innerFormProps.data.name
      );
    return (
      <CraigToggleForm
        key={
          this.props.vpcIndex +
          "-subnet-tier-form-" +
          this.props.subnetTierIndex +
          JSON.stringify(innerFormProps.data)
        }
        onSave={this.props.craig.vpcs.subnetTiers.save}
        onDelete={this.props.onDelete}
        hideChevron={this.props.formInSubForm ? false : true}
        hide={this.state.hide}
        isModal={this.props.subnetTierIndex === -1}
        noSaveButton={noButtons}
        noDeleteButton={noButtons}
        type={
          this.props.formInSubForm || this.props.subnetTierIndex === -1
            ? "formInSubForm"
            : "subForm"
        }
        hideName
        submissionFieldName="subnetTier"
        tabPanel={{ hideAbout: true }}
        name={
          subnetTier?.name ? subnetTierName(subnetTier.name) : "New Subnet Tier"
        }
        innerFormProps={innerFormProps}
        disableModal={this.props.disableModal}
        enableModal={this.props.enableModal}
        setRefUpstream={this.props.setRefUpstream}
        formInSubForm={this.props.formInSubForm}
        onShowToggle={this.props.onShowToggle}
        index={this.props.subnetTierIndex}
      />
    );
  }
}
