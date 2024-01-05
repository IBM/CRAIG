import React from "react";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import {
  CraigFormHeading,
  PrimaryButton,
} from "../../forms/utils/ToggleFormComponents";
import {
  BareMetalServer_02,
  GatewayVpn,
  IbmCloudKubernetesService,
  IbmCloudVpcEndpoints,
  NetworkEnterprise,
  Password,
  Security,
} from "@carbon/icons-react";
import { disableSave, propsMatchState } from "../../../lib";
import {
  arraySplatIndex,
  contains,
  isNullOrEmptyString,
  snakeCase,
  titleCase,
} from "lazy-z";
import { IcseSelect, RenderForm } from "icse-react-assets";
import { CraigToggleForm, DynamicFormModal } from "../../forms/utils";
import DynamicForm from "../../forms/DynamicForm";
import { craigForms } from "../CraigForms";
import {
  PassThroughWrapper,
  SshKeys,
  SubnetServiceMap,
  SubnetTierMap,
  VpcMap,
  SecurityGroups,
  docTabs,
} from "../diagrams";

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

class VpcDeploymentsDiagramPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: "",
      selectedIndex: -1,
      vpcIndex: -1,
      editing: false,
      showModal: false,
    };
    this.setSelection = this.setSelection.bind(this);
    this.resetSelection = this.resetSelection.bind(this);
    this.onItemDelete = this.onItemDelete.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.tabSelected = this.tabSelected.bind(this);
    this.onSgTabClick = this.onSgTabClick.bind(this);
    this.vpcName = this.vpcName.bind(this);
    this.selectRenderValue = this.selectRenderValue.bind(this);
    this.getIcon = this.getIcon.bind(this);
    this.onSshKeyButtonClick = this.onSshKeyButtonClick.bind(this);
  }

  onSshKeyButtonClick() {
    this.resetSelection();
    this.setState({
      selectedItem: "ssh_keys",
      showModal: true,
    });
  }

  getIcon(field) {
    return field === "security_groups"
      ? Security
      : field === "ssh_keys"
      ? Password
      : field === "vpn_gateways"
      ? GatewayVpn
      : field === "vsi"
      ? BareMetalServer_02
      : field === "clusters"
      ? IbmCloudKubernetesService
      : IbmCloudVpcEndpoints;
  }

  vpcName() {
    try {
      return this.props.craig.store.json.vpcs[this.state.vpcIndex].name;
    } catch (err) {
      return "";
    }
  }

  /**
   * tab selected
   * @param {string} sgName
   * @returns {boolean} true if selected
   */
  tabSelected(sgName) {
    return (
      arraySplatIndex(
        this.props.craig.store.json.security_groups,
        "name",
        sgName
      ) === this.state.selectedIndex &&
      this.state.selectedItem === "security_groups"
    );
  }

  /**
   * handle click on sg tab
   * @param {*} sgName
   */
  onSgTabClick(vpcIndex) {
    return (sgName) => {
      this.resetSelection();
      this.setSelection(
        vpcIndex,
        "security_groups",
        arraySplatIndex(
          this.props.craig.store.json.security_groups,
          "name",
          sgName
        )
      );
    };
  }

  /**
   * on delete item wrapper to prevent errors
   * @param {*} stateData
   * @param {*} componentProps
   */
  onItemDelete(stateData, componentProps) {
    this.props.craig[this.state.selectedItem].delete(stateData, componentProps);
    this.resetSelection();
  }

  handleInputChange(event) {
    let { name, value } = event.target;
    this.setState({
      [name]: value === "VSI" ? "vsi" : snakeCase(value) + "s",
    });
  }

  resetSelection() {
    this.setState({
      vpcIndex: -1,
      editing: false,
      selectedItem: "",
      selectedIndex: -1,
      showModal: false,
    });
  }

  /**
   * set selection
   * @param {number} vpcIndex
   * @param {string} type
   * @param {number} index
   */
  setSelection(vpcIndex, type, index) {
    if (
      vpcIndex === this.state.vpcIndex &&
      type === this.state.selectedItem &&
      index === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      scrollToTop();
      this.resetSelection();
      this.setState({
        vpcIndex: vpcIndex,
        selectedItem: type,
        selectedIndex: index,
        editing: true,
      });
    }
  }

  selectRenderValue() {
    return this.state.selectedItem === "vsi"
      ? "VSI"
      : this.state.selectedItem === "vpn_gateways"
      ? "VPN Gateway"
      : this.state.selectedItem === "ssh_keys"
      ? "SSH Key"
      : titleCase(this.state.selectedItem).replace(/s$/g, "");
  }

  render() {
    let craig = this.props.craig;
    const forms = craigForms(craig);
    let noSelectedItem = isNullOrEmptyString(this.state.selectedItem, true);
    return (
      <>
        <DynamicFormModal
          name={
            this.state.selectedItem === "ssh_keys"
              ? "Create an SSH Key"
              : `Create a Deployment in ${this.vpcName()}`
          }
          beginDisabled
          show={this.state.showModal}
          onRequestClose={this.resetSelection}
          onRequestSubmit={
            noSelectedItem
              ? () => {}
              : (stateData, componentProps) => {
                  craig[this.state.selectedItem].create(
                    stateData,
                    componentProps
                  );
                  this.resetSelection();
                }
          }
        >
          <IcseSelect
            formName="VPC Deployment"
            value={this.selectRenderValue()}
            labelText="Deployment Type"
            name="selectedItem"
            groups={[
              "Cluster",
              "Security Group",
              "SSH Key",
              "Virtual Private Endpoint",
              "VPN Gateway",
              "VSI",
            ]}
            handleInputChange={this.handleInputChange}
          />
          <div className="marginBottomSmall" />
          {noSelectedItem ? (
            // need to pass html element
            <></>
          ) : (
            <CraigFormHeading
              name={
                this.state.selectedItem === "ssh_keys"
                  ? "New SSH Key"
                  : "New " + this.selectRenderValue() + " Deployment"
              }
            />
          )}
          {noSelectedItem ? (
            // need to pass html element
            <></>
          ) : (
            <DynamicForm
              key={this.state.selectedItem}
              className="formInSubForm"
              isModal
              form={forms[this.state.selectedItem]}
              craig={craig}
              selectedItem={this.state.selectedItem}
              data={{
                vpc:
                  this.state.selectedItem === "ssh_keys" ||
                  this.state.vpcIndex === -1
                    ? undefined
                    : this.vpcName(),
                subnets: [],
                security_groups: contains(
                  ["vsi", "virtual_private_endpoints"],
                  this.state.selectedItem
                )
                  ? []
                  : undefined,
                public_key:
                  this.state.selectedItem === "ssh_keys" ? "" : undefined,
                ssh_keys: [],
              }}
              shouldDisableSubmit={function () {
                if (isNullOrEmptyString(this.props.selectedItem, true)) {
                  this.props.disableModal();
                } else if (
                  disableSave(
                    this.props.selectedItem,
                    this.state,
                    this.props
                  ) === false
                ) {
                  this.props.enableModal();
                } else {
                  this.props.disableModal();
                }
              }}
            />
          )}
        </DynamicFormModal>
        <div
          style={{
            marginRight: "1rem",
            marginTop: "1rem",
          }}
        >
          <StatefulTabs
            name="VPC Deployments"
            formName="VPC Deployments"
            nestedDocs={docTabs(
              [
                "SSH Keys",
                "Clusters",
                "Security Groups",
                "Virtual Servers",
                "Virtual Private Endpoints",
                "VPN Gateways",
              ],
              craig
            )}
            form={
              <>
                <div className="marginBottomSmall" />
                <div style={{ width: "580px" }}>
                  <CraigFormHeading
                    name="Deployments"
                    noMarginBottom
                    buttons={
                      <PrimaryButton
                        type="add"
                        hoverText="Create a Deployment"
                        noDeleteButton
                        onClick={() => {
                          this.resetSelection();
                          this.setState({
                            selectedItem: "ssh_keys",
                            showModal: true,
                          });
                        }}
                      />
                    }
                  />
                </div>
                <div className="displayFlex" style={{ width: "100%" }}>
                  <div id="left-vpc-deployments">
                    <div
                      key={
                        String(this.state.vpcIndex) +
                        String(this.state.editing) +
                        String(this.state.selectedItem) +
                        "new-ssh-keys"
                      }
                    >
                      <SshKeys
                        craig={craig}
                        onKeyClick={(sshKeyIndex) =>
                          this.setSelection(-1, "ssh_keys", sshKeyIndex)
                        }
                        isSelected={(props) => {
                          return (
                            this.state.selectedItem === props.itemName &&
                            this.state.selectedIndex === props.itemIndex &&
                            this.state.vpcIndex === props.vpcIndex
                          );
                        }}
                      />
                    </div>
                    <VpcMap
                      craig={craig}
                      static
                      isSelected={(vpcIndex) => {
                        return vpcIndex === this.state.vpcIndex;
                      }}
                    >
                      <SecurityGroups
                        width="548px"
                        craig={craig}
                        isSelected={(props) => {
                          return (
                            this.state.selectedItem === props.itemName &&
                            this.state.selectedIndex === props.itemIndex &&
                            this.state.vpcIndex === props.vpcIndex
                          );
                        }}
                        onClick={(vpcIndex, sgIndex) => {
                          this.setSelection(
                            vpcIndex,
                            "security_groups",
                            sgIndex
                          );
                        }}
                      />
                      <PassThroughWrapper className="formInSubForm">
                        <CraigFormHeading
                          icon={
                            <NetworkEnterprise className="diagramTitleIcon" />
                          }
                          type="subHeading"
                          name="Network"
                        />
                        <SubnetTierMap
                          grayNames
                          craig={craig}
                          renderChildren={
                            <SubnetServiceMap
                              onClick={(vpcIndex, field, itemIndex) => {
                                this.setSelection(vpcIndex, field, itemIndex);
                              }}
                              craig={craig}
                              parentState={this.state}
                              tabSelected={this.tabSelected}
                              onTabClick={this.onSgTabClick}
                            />
                          }
                        />
                      </PassThroughWrapper>
                    </VpcMap>
                  </div>
                  <div id="right-vpc-deployments">
                    {this.state.editing === true ? (
                      <div
                        style={{
                          width: "50vw",
                          padding: "0",
                          marginTop: "1rem",
                        }}
                      >
                        <CraigFormHeading
                          icon={RenderForm(
                            this.getIcon(this.state.selectedItem),
                            {
                              style: {
                                marginRight: "0.5rem",
                                marginTop: "0.4rem",
                              },
                            }
                          )}
                          noMarginBottom
                          name={`Editing ${
                            this.state.selectedItem === "ssh_keys"
                              ? "SSH Keys"
                              : this.selectRenderValue()
                          }${
                            contains(
                              ["security_groups", "ssh_keys"],
                              this.state.selectedItem
                            )
                              ? ""
                              : " Deployment"
                          } ${
                            craig.store.json[this.state.selectedItem][
                              this.state.selectedIndex
                            ].name
                          }`}
                        />
                        <CraigToggleForm
                          key={
                            this.state.selectedItem +
                            this.state.selectedIndex +
                            this.state.vpcIndex
                          }
                          tabPanel={{ hideAbout: true }}
                          onSave={craig[this.state.selectedItem].save}
                          onDelete={this.onItemDelete}
                          hideChevron
                          hideName
                          hide={false}
                          hideHeading
                          name={
                            craig.store.json[this.state.selectedItem][
                              this.state.selectedIndex
                            ].name
                          }
                          submissionFieldName={this.state.selectedItem}
                          innerFormProps={{
                            form: forms[this.state.selectedItem],
                            craig: craig,
                            data: craig.store.json[this.state.selectedItem][
                              this.state.selectedIndex
                            ],
                            // need to be passed to render child forms
                            disableSave: disableSave,
                            propsMatchState: propsMatchState,
                            vpc_name: this.vpcName(),
                          }}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </>
            }
          />
        </div>
      </>
    );
  }
}

export default VpcDeploymentsDiagramPage;
