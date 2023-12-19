import { Edit, IbmCloudSubnets } from "@carbon/icons-react";
import {
  IcseHeading,
  NetworkAclForm,
  SaveAddButton,
  SubnetTierForm,
  ToggleForm,
} from "icse-react-assets";
import React from "react";
import { CopyRuleForm } from "../../forms";
import {
  aclHelperTextCallback,
  buildSubnet,
  disableSave,
  forceShowForm,
  getSubnetTierStateData,
  getTierSubnets,
  invalidCidr,
  invalidCidrText,
  invalidName,
  invalidNameText,
  propsMatchState,
} from "../../../lib";
import { arraySplatIndex, contains, isEmpty } from "lazy-z";
import DynamicForm from "../../forms/DynamicForm";
import { DynamicAclForm } from "./DynamicAclForm";
import { SubnetBox, SubnetTierRow } from "./DisplayComponents";
import { DynamicSubnetTierForm } from "./DynamicSubnetTierForm";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";
import { Modal } from "@carbon/react";

class VpcDiagramPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      aclIndex: -1,
      vpcIndex: -1,
      subnetTierIndex: -1,
      subnetTierCreateModal: true,
    };
    this.onAclEditClick = this.onAclEditClick.bind(this);
    this.onSubnetTierEditClick = this.onSubnetTierEditClick.bind(this);
    this.resetValues = this.resetValues.bind(this);
  }

  /**
   * stop displaying form
   */
  resetValues() {
    this.setState({
      editing: false,
      vpcIndex: -1,
      aclIndex: -1,
      subnetTierIndex: -1,
    });
  }

  /**
   * on subnet tier click
   * @param {number} vpcIndex
   * @param {number} tierIndex
   */
  onSubnetTierEditClick(vpcIndex, tierIndex) {
    if (
      vpcIndex === this.state.vpcIndex &&
      tierIndex === this.state.subnetTierIndex
    ) {
      this.resetValues();
    } else
      this.setState({
        vpcIndex: vpcIndex,
        aclIndex: -1,
        subnetTierIndex: tierIndex,
        editing: true,
      });
  }

  /**
   * on acl edit click
   * @param {number} vpcIndex
   * @param {number} aclIndex
   */
  onAclEditClick(vpcIndex, aclIndex) {
    if (vpcIndex === this.state.vpcIndex && aclIndex === this.state.aclIndex) {
      this.resetValues();
    } else
      this.setState({
        editing: true,
        vpcIndex: vpcIndex,
        aclIndex: aclIndex,
      });
  }

  render() {
    let craig = this.props.craig;
    return (
      <>
        {/* 
        // modal will be hard to add, pausing here
        {this.state.subnetTierCreateModal && (
          <Modal
            id="create-subnet-tier-modal"
            primaryButtonText="Primary Button"
            secondaryButtonText="Cancel"
            open={this.state.subnetTierCreateModal}
            heading="Default Heading"
            size="md"
            modalHeading="Create a New Subnet Tier"
            className="leftTextAlign"
          >
            <DynamicSubnetTierForm
              craig={craig}
              subnetTierIndex={-1}
              vpcIndex={0}
            />
          </Modal>
        )} */}
        <IcseHeading name="VPC Networks" />
        <div className="displayFlex" style={{ width: "100%" }}>
          <div id="left-vpc">
            {craig.store.json.vpcs.map((vpc, vpcIndex) => (
              <div
                className="subForm marginBottomSmall"
                key={vpc.name}
                style={{
                  width: "40vw",
                  marginRight: "1rem",
                }}
              >
                <IcseHeading
                  type="subHeading"
                  name={vpc.name + " VPC"}
                  className="marginBottomSmall"
                />
                {isEmpty(vpc.acls) ? (
                  <CraigEmptyResourceTile name="ACLs" />
                ) : (
                  vpc.acls.map((acl, aclIndex) => (
                    <div
                      key={acl.name + vpc.name + aclIndex + vpcIndex}
                      className="formInSubForm"
                      style={{
                        border: "2px dashed red",
                        width: "535px",
                      }}
                    >
                      <IcseHeading
                        name={acl.name + " ACL"}
                        className="marginBottomSmall"
                        type="subHeading"
                        buttons={
                          <>
                            <SaveAddButton
                              type="custom"
                              customIcon={Edit}
                              hoverText="Manage ACL"
                              onClick={() => {
                                this.onAclEditClick(vpcIndex, aclIndex);
                              }}
                            />
                            <SaveAddButton
                              type="add"
                              hoverText="Create a new Subnet Tier"
                              noDeleteButton
                            />
                          </>
                        }
                      />
                      <div id="tiers">
                        {craig.store.subnetTiers[vpc.name].map(
                          (tier, tierIndex) => (
                            <SubnetTierRow
                              key={vpc.name + JSON.stringify(tier)}
                              tier={tier}
                              tierIndex={tierIndex}
                              vpc={vpc}
                              acl={acl}
                              craig={craig}
                              onClick={() => {
                                this.onSubnetTierEditClick(vpcIndex, tierIndex);
                              }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
          <div id="right-vpc">
            {this.state.editing === true && (
              <>
                <IcseHeading
                  type="subHeading"
                  name={`Editing ${
                    this.state.subnetTierIndex === -1 ? "ACL" : "Subnet Tier"
                  } for VPC ${craig.store.json.vpcs[this.state.vpcIndex].name}`}
                />
                <div
                  style={{ width: "50vw", padding: "0" }}
                  className="subForm"
                >
                  {this.state.subnetTierIndex !== -1 ? (
                    <DynamicSubnetTierForm
                      vpcIndex={this.state.vpcIndex}
                      subnetTierIndex={this.state.subnetTierIndex}
                      craig={craig}
                    />
                  ) : this.state.aclIndex !== -1 ? (
                    <DynamicAclForm
                      vpcIndex={this.state.vpcIndex}
                      aclIndex={this.state.aclIndex}
                      craig={craig}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default VpcDiagramPage;
