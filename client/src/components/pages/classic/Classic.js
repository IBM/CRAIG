import React from "react";
import { craigForms } from "../CraigForms";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import { ClassicMap, ClassicSubnets, SshKeys, docTabs } from "../diagrams";
import {
  CraigFormHeading,
  PrimaryButton,
  RenderForm,
} from "../../forms/utils/ToggleFormComponents";
import { distinct, isNullOrEmptyString, snakeCase, titleCase } from "lazy-z";
import { FirewallClassic, Password, VlanIbm } from "@carbon/icons-react";
import { CraigToggleForm, DynamicFormModal } from "../../forms/utils";
import { disableSave, propsMatchState } from "../../../lib";
import { ClassicGateways } from "../diagrams/ClassicGateways";
import { IcseSelect } from "icse-react-assets";
import DynamicForm from "../../forms/DynamicForm";

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

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
    this.getIcon = this.getIcon.bind(this);
    this.onGwClick = this.onGwClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onItemDelete = this.onItemDelete.bind(this);
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
    return this.state.selectedItem === "classic_ssh_keys"
      ? Password
      : this.state.selectedItem === "classic_vlans"
      ? VlanIbm
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
      scrollToTop();
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
      scrollToTop();
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
      scrollToTop();
    }
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
          <IcseSelect
            labelText="Resource Type"
            formName="classic"
            value={titleCase(this.state.modalService)
              .replace("Vlans", "VLANs")
              .replace("Ssh", "SSH")}
            name="modalService"
            disableInvalid
            groups={["Classic SSH Keys", "Classic VLANs", "Classic Gateways"]}
            handleInputChange={this.handleInputChange}
          />
          <div className="marginBottomSmall" />
          {isNullOrEmptyString(this.state.modalService, true) ? (
            // need to pass html element
            <></>
          ) : (
            <CraigFormHeading
              name={`New ${titleCase(this.state.modalService)
                .replace("Vlans", "VLANs")
                .replace("Ssh", "SSH")
                .replace(/s$/g, "")}`}
            />
          )}
          {isNullOrEmptyString(this.state.modalService, true) ? (
            <></>
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
            marginTop: "1rem",
          }}
        >
          <StatefulTabs
            name="Classic Network"
            formName="Classic Network"
            nestedDocs={docTabs(
              ["Classic SSH Keys", "Classic VLANs", "Classic Gateways"],
              craig
            )}
            form={
              <>
                <div className="marginBottomSmall" />
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
                        <CraigFormHeading
                          icon={RenderForm(this.getIcon(), {
                            style: {
                              marginRight: "0.5rem",
                              marginTop: "0.4rem",
                            },
                          })}
                          noMarginBottom
                          name={`Editing ${
                            this.state.selectedItem === "classic_ssh_keys"
                              ? "Classic SSH Key"
                              : this.state.selectedItem === "classic_vlans"
                              ? "VLAN"
                              : "Classic Gateway"
                          } ${
                            craig.store.json[this.state.selectedItem][
                              this.state.selectedIndex
                            ].name
                          }`}
                        />
                        <CraigToggleForm
                          key={
                            this.state.selectedItem + this.state.selectedIndex
                          }
                          tabPanel={{ hideAbout: true }}
                          onSave={craig[this.state.selectedItem].save}
                          onDelete={this.onItemDelete}
                          hideChevron
                          hideName
                          hide={false}
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
