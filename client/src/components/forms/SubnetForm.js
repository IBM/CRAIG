import React from "react";
import {
  FormModal,
  IcseHeading,
  SaveAddButton,
  SubnetTierForm
} from "icse-react-assets";
import {
  propsMatchState,
  disableSave,
  invalidSubnetTierName,
  invalidSubnetTierText,
  getTierSubnets,
  getSubnetTierStateData
} from "../../lib/forms";
import { splat } from "lazy-z";
import { buildSubnet } from "../../lib/builders";

function none() {}

class SubnetForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }
  onModalSubmit(data) {
    this.props.craig.vpcs.subnetTiers.create(data, {
      vpc_name: this.props.data.name
    });
    this.props.handleModalToggle();
  }

  handleSelect(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    let tiers = [...this.props.craig.store.subnetTiers[this.props.data.name]];
    return (
      <>
        <FormModal
          name="Add a Subnet Tier"
          show={this.props.showSubModal}
          onRequestSubmit={this.onModalSubmit}
          onRequestClose={this.props.handleModalToggle}
        >
          <SubnetTierForm
            networkAcls={splat(this.props.data.acls, "name")}
            enabledPublicGateways={this.props.data.publicGateways}
            vpc_name={this.props.data.name}
            subnetListCallback={stateData => {
              let nextTier = tiers.length;
              let subnets = [];
              while (subnets.length < stateData.zones) {
                subnets.push(
                  buildSubnet(
                    this.props.vpc_name,
                    this.props.index,
                    stateData.name,
                    nextTier,
                    stateData.networkAcl,
                    this.props.data.resource_group,
                    subnets.length + 1,
                    stateData.addPublicGateway
                  )
                );
              }
              return subnets;
            }}
            craig={this.props.craig}
            disableSubnetSaveCallback={none}
            shouldDisableSave={none}
            shouldDisableSubmit={(stateData, componentProps) => {
              return disableSave("subnetTier", stateData, componentProps);
            }}
            invalidTextCallback={invalidSubnetTierText}
            invalidCallback={invalidSubnetTierName}
          />
        </FormModal>
        <IcseHeading
          name="Subnet Tiers"
          className="marginBottomSmall"
          type="subHeading"
          buttons={
            <SaveAddButton
              onClick={() => this.props.handleModalToggle()}
              type="add"
              noDeleteButton
            />
          }
        />
        {this.props.craig.store.subnetTiers[this.props.data.name].map(
          (tier, index) => (
            <SubnetTierForm
              key={JSON.stringify(tier)}
              data={getSubnetTierStateData(tier, this.props.data)}
              index={index}
              onSave={this.props.craig.vpcs.subnetTiers.save}
              onDelete={this.props.craig.vpcs.subnetTiers.delete}
              networkAcls={splat(this.props.data.acls, "name")}
              enabledPublicGateways={this.props.data.publicGateways}
              vpc_name={this.props.data.name}
              subnetListCallback={getTierSubnets(tier, {...this.props.data})}
              craig={this.props.craig}
              disableSubnetSaveCallback={(stateData, componentProps) => {
                return (
                  propsMatchState("subnet", stateData, componentProps) ||
                  disableSave("subnet", stateData, componentProps)
                );
              }}
              shouldDisableSave={(stateData, componentProps) => {
                componentProps.data.hide = false;
                return (
                  propsMatchState("subnetTier", stateData, componentProps) ||
                  disableSave("subnetTier", stateData, componentProps)
                );
              }}
              shouldDisableSubmit={none}
              invalidTextCallback={invalidSubnetTierText}
              invalidCallback={invalidSubnetTierName}
            />
          )
        )}
      </>
    );
  }
}

export default SubnetForm;
