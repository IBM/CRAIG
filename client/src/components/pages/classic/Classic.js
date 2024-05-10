import React from "react";
import { craigForms } from "../CraigForms";
import {
  ClassicMap,
  ClassicSecurityGroups,
  ClassicSubnets,
  ClassicBareMetal,
  ClassicVsi,
  SshKeys,
  docTabs,
} from "../diagrams";
import { distinct, isNullOrEmptyString, snakeCase, titleCase } from "lazy-z";
import {
  FirewallClassic,
  InfrastructureClassic,
  Password,
  SecurityServices,
  VlanIbm,
  IbmCloudBareMetalServer,
  InstanceClassic,
} from "@carbon/icons-react";
import {
  StatefulTabs,
  PrimaryButton,
  CraigFormHeading,
  DynamicFormModal,
} from "../../forms/utils";
import {
  classicInfraTf,
  classicSecurityGroupTf,
  classicBareMetalTf,
  classicVsiTf,
  disableSave,
  propsMatchState,
} from "../../../lib";
import { ClassicGateways } from "../diagrams/ClassicGateways";
import DynamicForm from "../../forms/DynamicForm";
import HoverClassNameWrapper from "../diagrams/HoverClassNameWrapper";
import { classicGatewayTf } from "../../../lib/json-to-iac/classic-gateway";
import { DynamicFormSelect } from "../../forms/dynamic-form";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";
import ScrollForm from "../diagrams/ScrollForm";

class ClassicDiagram extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      selectedItem: "",
      selectedIndex: -1,
      showModal: false,
      modalService: "",
    };
    this.onKeyClick = this.onKeyClick.bind(this);
    this.resetSelection = this.resetSelection.bind(this);
    this.onVlanClick = this.onVlanClick.bind(this);
    this.onSgClick = this.onSgClick.bind(this);
    this.onBareMetalClick = this.onBareMetalClick.bind(this);
    this.onVsiClick = this.onVsiClick.bind(this);
    this.getIcon = this.getIcon.bind(this);
    this.onGwClick = this.onGwClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onItemDelete = this.onItemDelete.bind(this);
    this.renderName = this.renderName.bind(this);
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

  toggleModal() {
    this.setState({ showModal: true });
  }

  /**
   * handle modal dropdown
   * @param {*} event
   */
  handleInputChange(event) {
    let { value } = event.target;
    this.setState({
      modalService: snakeCase(value.toLowerCase()),
    });
  }

  getIcon() {
    return this.state.selectedItem === "classic_security_groups"
      ? SecurityServices
      : this.state.selectedItem === "classic_ssh_keys"
      ? Password
      : this.state.selectedItem === "classic_vlans"
      ? VlanIbm
      : this.state.selectedItem === "classic_bare_metal"
      ? IbmCloudBareMetalServer
      : this.state.selectedItem === "classic_vsi"
      ? InstanceClassic
      : FirewallClassic;
  }

  /**
   * reset selection
   */
  resetSelection() {
    this.setState({
      editing: false,
      selectedItem: "",
      selectedIndex: -1,
      modalService: "",
      showModal: false,
    });
  }

  /**
   * on gw click
   * @param {number} gwIndex
   */
  onGwClick(gwIndex) {
    if (
      this.state.editing &&
      this.state.selectedItem === "classic_gateways" &&
      gwIndex === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      this.setState({
        editing: true,
        selectedIndex: gwIndex,
        selectedItem: "classic_gateways",
      });
    }
  }

  /**
   * on vlan click
   * @param {number} vlanIndex
   */
  onVlanClick(vlanIndex) {
    if (
      this.state.editing &&
      this.state.selectedItem === "classic_vlans" &&
      vlanIndex === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      this.setState({
        editing: true,
        selectedIndex: vlanIndex,
        selectedItem: "classic_vlans",
      });
    }
  }

  /**
   * on vlan click
   * @param {number} sgIndex
   */
  onSgClick(sgIndex) {
    if (
      this.state.editing &&
      this.state.selectedItem === "classic_security_groups" &&
      sgIndex === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      this.setState({
        editing: true,
        selectedIndex: sgIndex,
        selectedItem: "classic_security_groups",
      });
    }
  }

  /**
   * on bare metal click
   * @param {number} bareMetalIndex
   */
  onBareMetalClick(bareMetalIndex) {
    if (
      this.state.editing &&
      this.state.selectedItem === "classic_bare_metal" &&
      bareMetalIndex === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      this.setState({
        editing: true,
        selectedIndex: bareMetalIndex,
        selectedItem: "classic_bare_metal",
      });
    }
  }

  /**
   * on classic vsi click
   * @param {number} vsiIndex
   */
  onVsiClick(vsiIndex) {
    if (
      this.state.editing &&
      this.state.selectedItem === "classic_vsi" &&
      vsiIndex === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      this.setState({
        editing: true,
        selectedIndex: vsiIndex,
        selectedItem: "classic_vsi",
      });
    }
  }

  /**
   * on ssh key click
   * @param {number} keyIndex
   */
  onKeyClick(keyIndex) {
    if (
      this.state.editing &&
      this.state.selectedItem === "classic_ssh_keys" &&
      keyIndex === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      this.setState({
        editing: true,
        selectedIndex: keyIndex,
        selectedItem: "classic_ssh_keys",
      });
    }
  }

  renderName() {
    return `Editing ${
      this.state.selectedItem === "classic_security_groups"
        ? "Classic Security Group"
        : this.state.selectedItem === "classic_ssh_keys"
        ? "Classic SSH Key"
        : this.state.selectedItem === "classic_vlans"
        ? "VLAN"
        : this.state.selectedItem === "classic_bare_metal"
        ? "Classic Bare Metal"
        : this.state.selectedItem === "classic_vsi"
        ? "Classic VSI"
        : "Classic Gateway"
    } ${
      this.props.craig.store.json[this.state.selectedItem][
        this.state.selectedIndex
      ].name
    }`;
  }

  render() {
    let craig = this.props.craig;
    const forms = craigForms(craig);
    let classicDatacenters = [];
    craig.store.json.classic_vlans.forEach((vlan) => {
      classicDatacenters = distinct(classicDatacenters.concat(vlan.datacenter));
    });
    return (
      <>
        <DynamicFormModal
          name="Create a Classic Resource"
          beginDisabled
          key={this.state.modalService}
          show={this.state.showModal}
          onRequestClose={this.resetSelection}
          onRequestSubmit={
            isNullOrEmptyString(this.state.modalService, true)
              ? () => {}
              : (stateData, componentProps) => {
                  craig[this.state.modalService].create(
                    stateData,
                    componentProps
                  );
                  this.setState({
                    showModal: false,
                    modalService: "",
                  });
                }
          }
        >
          <DynamicFormSelect
            name="modalService"
            propsName="classic"
            keyIndex={0}
            value={this.state.modalService}
            field={{
              labelText: "Resource Type",
              groups: [
                "Classic SSH Keys",
                "Classic VLANs",
                "Classic Gateways",
                "Classic Security Groups",
                "Classic Bare Metal",
                "Classic VSI",
              ],
              disabled: (stateData) => {
                return false;
              },
              invalid: (stateData) => {
                return false;
              },
              invalidText: (stateData) => {
                return "";
              },
              onRender: (stateData) => {
                return titleCase(stateData.modalService)
                  .replace("Vlans", "VLANs")
                  .replace("Ssh", "SSH");
              },
            }}
            parentProps={this.props}
            parentState={this.state}
            handleInputChange={this.handleInputChange}
          />
          <div className="marginBottomSmall emptyStatelessContainer" />
          {isNullOrEmptyString(this.state.modalService, true) ? (
            // need to pass html element
            <div className="emptyStatelessContainer" />
          ) : (
            <CraigFormHeading
              name={`New ${titleCase(this.state.modalService)
                .replace("Vlans", "VLANs")
                .replace("Ssh", "SSH")
                .replace("Vsi", "VSI")
                .replace(/s$/g, "")}`}
              className="marginBottomSmall"
              type="subHeading"
            />
          )}
          {isNullOrEmptyString(this.state.modalService, true) ? (
            <div className="emptyStatelessContainer" />
          ) : this.state.modalService === "classic_gateways" &&
            this.props.craig.store.json.classic_ssh_keys.length === 0 ? (
            <CraigEmptyResourceTile
              noClick
              name="Classic SSH keys. To enable creation of this resource, create an SSH key"
            />
          ) : (
            <DynamicForm
              className="formInSubForm"
              isModal
              form={forms[this.state.modalService]}
              craig={craig}
              modalService={this.state.modalService}
              data={{}}
              shouldDisableSubmit={function () {
                if (isNullOrEmptyString(this.props.modalService, true)) {
                  this.props.disableModal();
                } else if (
                  disableSave(
                    this.props.modalService,
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
          }}
        >
          <StatefulTabs
            h2
            icon={
              <InfrastructureClassic
                style={{ marginTop: "0.4rem", marginRight: "0.5rem" }}
                size="20"
              />
            }
            name="Classic Network"
            formName="Manage Classic Network"
            nestedDocs={docTabs(
              [
                "Classic SSH Keys",
                "Classic VLANs",
                "Classic Gateways",
                "Classic Security Groups",
                "Classic Bare Metal",
                "Classic VSIs",
              ],
              craig
            )}
            tfTabs={[
              {
                name: "Classic Infrastructure",
                tf: classicInfraTf(craig.store.json) || "",
              },
              {
                name: "Classic Gateways",
                tf: classicGatewayTf(craig.store.json) || "",
              },
              {
                name: "Classic Security Groups",
                tf: classicSecurityGroupTf(craig.store.json) || "",
              },
              {
                name: "Classic Bare Metal",
                tf: classicBareMetalTf(craig.store.json) || "",
              },
              {
                name: "Classic VSIs",
                tf: classicVsiTf(craig.store.json) || "",
              },
            ]}
            form={
              <>
                <div style={{ width: "580px" }}>
                  <CraigFormHeading
                    name="Classic Resources"
                    noMarginBottom
                    buttons={
                      <PrimaryButton
                        noDeleteButton
                        type="add"
                        hoverText="Create a Resource"
                        onClick={this.toggleModal}
                      />
                    }
                  />
                </div>
                <div className="displayFlex" style={{ width: "100%" }}>
                  <div id="left-classic">
                    <HoverClassNameWrapper
                      hoverClassName="diagramBoxSelected"
                      className="width580"
                    >
                      <SshKeys
                        craig={craig}
                        classic
                        isSelected={(props) => {
                          return (
                            this.state.selectedItem === "classic_ssh_keys" &&
                            this.state.selectedIndex === props.itemIndex
                          );
                        }}
                        onKeyClick={this.onKeyClick}
                      />
                    </HoverClassNameWrapper>
                    <ClassicSecurityGroups
                      craig={craig}
                      isSelected={(sgIndex) => {
                        return (
                          this.state.selectedItem ===
                            "classic_security_groups" &&
                          this.state.selectedIndex === sgIndex
                        );
                      }}
                      onClick={this.onSgClick}
                    />
                    {craig.store.json.classic_vlans.length === 0 ? (
                      <CraigEmptyResourceTile
                        name="Classic VLANS"
                        className="width580 marginTopHalfRem"
                      />
                    ) : (
                      ""
                    )}
                    <ClassicMap
                      craig={craig}
                      buttons={
                        <PrimaryButton
                          noDeleteButton
                          type="add"
                          hoverText="Create a Resource"
                          onClick={this.toggleModal}
                        />
                      }
                    >
                      <ClassicSubnets
                        craig={craig}
                        onClick={this.onVlanClick}
                        isSelected={(vlanIndex) => {
                          return (
                            this.state.selectedItem === "classic_vlans" &&
                            this.state.selectedIndex === vlanIndex
                          );
                        }}
                      >
                        <ClassicGateways
                          craig={craig}
                          onClick={this.onGwClick}
                          isSelected={(gwIndex) => {
                            return (
                              this.state.selectedItem === "classic_gateways" &&
                              this.state.selectedIndex === gwIndex
                            );
                          }}
                        />
                        <ClassicVsi
                          craig={craig}
                          isSelected={(vsiIndex) => {
                            return (
                              this.state.selectedItem === "classic_vsi" &&
                              this.state.selectedIndex === vsiIndex
                            );
                          }}
                          onClick={this.onVsiClick}
                        />
                        <ClassicBareMetal
                          craig={craig}
                          isSelected={(bareMetalIndex) => {
                            return (
                              this.state.selectedItem ===
                                "classic_bare_metal" &&
                              this.state.selectedIndex === bareMetalIndex
                            );
                          }}
                          onClick={this.onBareMetalClick}
                        />
                      </ClassicSubnets>
                    </ClassicMap>
                  </div>
                  <div id="right-classic">
                    {this.state.editing === true ? (
                      <div
                        style={{
                          width: "50vw",
                          padding: "0",
                          marginTop: "1rem",
                        }}
                      >
                        <ScrollForm
                          craig={craig}
                          selectedItem={this.state.selectedItem}
                          selectedIndex={this.state.selectedIndex}
                          overrideDelete={this.onItemDelete}
                          icon={this.getIcon()}
                          composedName={this.renderName()}
                          innerFormProps={{
                            form: forms[this.state.selectedItem],
                            craig: craig,
                            data: craig.store.json[this.state.selectedItem][
                              this.state.selectedIndex
                            ],
                            disableSave: disableSave,
                            propsMatchState: propsMatchState,
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

export default ClassicDiagram;
