import React from "react";
import {
  CraigFormHeading,
  PrimaryButton,
  RenderForm,
} from "../../forms/utils/ToggleFormComponents";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import {
  FileStorage,
  IbmPowerVs,
  VirtualMachine,
  Voicemail,
} from "@carbon/icons-react";
import { craigForms } from "../CraigForms";
import { CraigToggleForm, DynamicFormModal } from "../../forms/utils";
import { disableSave, powerVsTf, propsMatchState } from "../../../lib";
import DynamicForm from "../../forms/DynamicForm";
import { contains, isNullOrEmptyString, revision } from "lazy-z";
import { docTabs } from "../diagrams/DocTabs";
import { PowerMap } from "../diagrams/PowerMap";
import { PowerSshKeys } from "./PowerSshKeys";
import { PowerSubnets } from "./PowerSubnets";
import { PowerVolumes } from "./PowerVolumes";
import { IcseSelect } from "icse-react-assets";
import { NoPowerNetworkTile } from "../../forms/dynamic-form";
import { PowerVolumeTable } from "./PowerVolumeTable";
import { ScrollFormWrapper } from "../diagrams/ScollFormWrapper";
import { powerInstanceTf, powerVsVolumeTf } from "../../../lib/json-to-iac";

class PowerDiagram extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      selectedIndex: -1,
      selectedItem: "",
      powerIndex: -1,
      showModal: false,
      showInstanceVolumeModal: false,
      modalService: "",
      overrideData: {},
    };
    this.getIcon = this.getIcon.bind(this);
    this.resetSelection = this.resetSelection.bind(this);
    this.onItemDelete = this.onItemDelete.bind(this);
    this.onPowerCreateClick = this.onPowerCreateClick.bind(this);
    this.onPowerInstanceClick = this.onPowerInstanceClick.bind(this);
    this.onVtlClick = this.onVtlClick.bind(this);
    this.onPowerWorkspaceClick = this.onPowerWorkspaceClick.bind(this);
    this.onVolumeClick = this.onVolumeClick.bind(this);
    this.onWorkspaceButtonClick = this.onWorkspaceButtonClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * on click handler for power workspace
   * @param {*} powerIndex
   */
  onPowerWorkspaceClick(powerIndex) {
    if (powerIndex === this.state.powerIndex) {
      this.resetSelection();
    } else {
      this.setState({
        editing: true,
        selectedItem: "power",
        selectedIndex: powerIndex,
        powerIndex: powerIndex,
      });
    }
  }

  onWorkspaceButtonClick(powerIndex) {
    this.resetSelection();
    this.setState({
      showInstanceVolumeModal: true,
      powerIndex: powerIndex,
    });
  }

  getIcon() {
    return this.state.selectedItem === "power"
      ? IbmPowerVs
      : this.state.selectedItem === "vtl"
      ? Voicemail
      : this.state.selectedItem === "power_volumes"
      ? FileStorage
      : VirtualMachine;
  }

  resetSelection() {
    this.setState({
      powerIndex: -1,
      selectedIndex: -1,
      selectedItem: "",
      editing: false,
      showModal: false,
      showInstanceVolumeModal: false,
      overrideData: {},
    });
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

  onPowerCreateClick() {
    this.resetSelection();
    this.setState({
      showModal: true,
      selectedItem: "power",
    });
  }

  onPowerInstanceClick(instanceIndex) {
    if (
      this.state.selectedIndex === instanceIndex &&
      this.state.selectedItem === "power_instances"
    ) {
      this.resetSelection();
    } else {
      this.resetSelection();
      this.setState({
        editing: true,
        selectedItem: "power_instances",
        selectedIndex: instanceIndex,
      });
    }
  }

  onVtlClick(instanceIndex) {
    if (
      this.state.selectedIndex === instanceIndex &&
      this.state.selectedItem === "vtl"
    ) {
      this.resetSelection();
    } else {
      this.resetSelection();
      this.setState({
        editing: true,
        selectedItem: "vtl",
        selectedIndex: instanceIndex,
      });
    }
  }

  onVolumeClick(volumeIndex) {
    if (
      this.state.selectedIndex === volumeIndex &&
      this.state.selectedItem === "power_volumes"
    ) {
      this.resetSelection();
    } else {
      this.resetSelection();
      this.setState({
        editing: true,
        selectedItem: "power_volumes",
        selectedIndex: volumeIndex,
      });
    }
  }

  handleInputChange(event) {
    let { name, value } = event.target;
    this.setState({
      [name]:
        value === "Power Volume"
          ? "power_volumes"
          : value === "FalconStor VTL"
          ? "vtl"
          : "power_instances",
    });
  }

  render() {
    let craig = this.props.craig;
    const forms = craigForms(craig);
    let noSelectedItem = isNullOrEmptyString(this.state.selectedItem, true);
    return (
      <>
        <DynamicFormModal
          name={`Create a Power VS Deployment in ${
            this.state.powerIndex > -1
              ? craig.store.json.power[this.state.powerIndex].name
              : ""
          }`}
          beginDisabled
          show={this.state.showInstanceVolumeModal}
          onRequestClose={() => {
            if (this.state.selectWhenDone) {
              this.setState({
                modalService: "",
                showInstanceVolumeModal: false,
                editing: this.state.selectWhenDone.editing,
                selectedItem: this.state.selectWhenDone.selectedItem,
                selectedIndex: this.state.selectWhenDone.selectedIndex,
                selectWhenDone: {},
              });
            } else this.resetSelection();
          }}
          key={this.state.modalService}
          onRequestSubmit={
            // prevent from loading unfound field
            isNullOrEmptyString(this.state.modalService, true)
              ? () => {}
              : (stateData, componentProps) => {
                  craig[this.state.modalService].create(
                    stateData,
                    componentProps
                  );
                  if (this.state.selectWhenDone) {
                    this.setState({
                      modalService: "",
                      showInstanceVolumeModal: false,
                      editing: this.state.selectWhenDone.editing,
                      selectedItem: this.state.selectWhenDone.selectedItem,
                      selectedIndex: this.state.selectWhenDone.selectedIndex,
                      selectWhenDone: {},
                    });
                  } else {
                    this.setState(
                      {
                        showInstanceVolumeModal: false,
                        modalService: "",
                      },
                      () => {
                        this.resetSelection();
                      }
                    );
                  }
                }
          }
        >
          <IcseSelect
            formName="power-modal"
            value={
              this.state.modalService === "power_volumes"
                ? "Power Volume"
                : this.state.modalService === "vtl"
                ? "FalconStor VTL"
                : isNullOrEmptyString(this.state.modalService, true)
                ? ""
                : "Power Instance"
            }
            labelText="Deployment Type"
            name="modalService"
            disableInvalid
            groups={["Power Instance", "Power Volume", "FalconStor VTL"]}
            handleInputChange={this.handleInputChange}
          />
          <div className="marginBottomSmall" />
          {isNullOrEmptyString(this.state.modalService, true) ? (
            // need to pass html element
            <></>
          ) : (
            <CraigFormHeading
              name={`New ${
                this.state.modalService === "power_volumes"
                  ? "Power Volume"
                  : this.state.modalService === "vtl"
                  ? "FalconStor VTL"
                  : "Power Instance"
              }`}
            />
          )}
          {isNullOrEmptyString(this.state.modalService, true) ? (
            // need to pass html element
            <></>
          ) : (
            <DynamicForm
              className="formInSubForm"
              isModal
              form={forms[this.state.modalService]}
              craig={craig}
              modalService={this.state.modalService}
              formName={
                this.state.modalService === "power_volumes"
                  ? undefined
                  : "Power Instances"
              }
              data={
                this.state.overrideData
                  ? this.state.overrideData
                  : {
                      workspace:
                        this.state.powerIndex > -1
                          ? craig.store.json.power[this.state.powerIndex].name
                          : undefined,
                    }
              }
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
        <DynamicFormModal
          name="Create a Workspace"
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
                  this.setState({
                    editing: true,
                    selectedItem: "power",
                    selectedIndex: craig.store.json.power.length - 1,
                    powerIndex: craig.store.json.power.length - 1,
                  });
                }
          }
        >
          <DynamicForm
            className="formInSubForm"
            isModal
            form={forms.power}
            selectedItem={this.state.selectedItem}
            craig={craig}
            data={{}}
            shouldDisableSubmit={function () {
              if (isNullOrEmptyString(this.props.selectedItem, true)) {
                this.props.disableModal();
              } else if (
                disableSave(this.props.selectedItem, this.state, this.props) ===
                false
              ) {
                this.props.enableModal();
              } else {
                this.props.disableModal();
              }
            }}
          />
        </DynamicFormModal>
        <div
          style={{
            marginRight: "1rem",
          }}
        >
          <StatefulTabs
            h2
            icon={
              <IbmPowerVs
                style={{ marginTop: "0.4rem", marginRight: "0.5rem" }}
                size="20"
              />
            }
            name="Power VS"
            formName="Manage Power VS"
            nestedDocs={docTabs(
              ["Power VS", "Power VS Instances (LPARs)", "Power Volumes"],
              craig
            )}
            tfTabs={[
              {
                name: "Power VS Workspaces",
                tf: powerVsTf(craig.store.json) || "",
              },
              {
                name: "Power VS Instances",
                tf: powerInstanceTf(craig.store.json) || "",
              },
              {
                name: "Power VS Volumes",
                tf: powerVsVolumeTf(craig.store.json) || "",
              },
            ]}
            form={
              craig.store.json._options.enable_power_vs === true ? (
                <>
                  <div style={{ width: "580px" }}>
                    <CraigToggleForm
                      hideName
                      name="Project Power VS Settings"
                      tabPanel={{
                        hideAbout: true,
                        hasBuiltInHeading: true,
                      }}
                      noDeleteButton
                      onDelete={() => {}}
                      onSave={craig.options.save}
                      craig={craig}
                      innerFormProps={{
                        data: craig.store.json._options,
                        form: {
                          groups: [
                            {
                              enable_power_vs: craig.options.enable_power_vs,
                              power_vs_high_availability:
                                craig.options.power_vs_high_availability,
                            },
                            {
                              power_vs_zones: craig.options.power_vs_zones,
                            },
                          ],
                        },
                      }}
                    />
                  </div>
                  <div style={{ width: "580px" }}>
                    <CraigFormHeading
                      name="Power Workspaces"
                      noMarginBottom
                      buttons={
                        <PrimaryButton
                          noDeleteButton
                          type="add"
                          hoverText="Create a Power Workspace"
                          onClick={this.onPowerCreateClick}
                        />
                      }
                    />
                  </div>
                  <div className="displayFlex" style={{ width: "100%" }}>
                    <div id="left-power">
                      <PowerMap
                        craig={craig}
                        onClick={this.onPowerWorkspaceClick}
                        isSelected={(powerIndex) => {
                          return (
                            this.state.selectedItem === "power" &&
                            this.state.selectedIndex === powerIndex
                          );
                        }}
                        buttons={(powerIndex) => {
                          return (
                            <PrimaryButton
                              noDeleteButton
                              type="add"
                              name="Create a Deployment"
                              onClick={() =>
                                this.onWorkspaceButtonClick(powerIndex)
                              }
                            />
                          );
                        }}
                      >
                        <PowerSshKeys onClick={this.onPowerWorkspaceClick} />
                        <PowerSubnets
                          craig={craig}
                          onPowerWorkspaceClick={this.onPowerWorkspaceClick}
                          onPowerInstanceClick={this.onPowerInstanceClick}
                          onVolumeClick={this.onVolumeClick}
                          onVtlClick={this.onVtlClick}
                          isSelected={(props) => {
                            return (
                              this.state.selectedIndex === props.index &&
                              this.state.selectedItem === props.itemName
                            );
                          }}
                          volumeIsSelected={(volumeIndex) => {
                            return (
                              this.state.selectedItem === "power_volumes" &&
                              volumeIndex === this.state.selectedIndex
                            );
                          }}
                        />
                        <PowerVolumes
                          craig={craig}
                          isSelected={(props) => {
                            return (
                              this.state.selectedIndex === props.index &&
                              this.state.selectedItem === props.itemName
                            );
                          }}
                          onVolumeClick={this.onVolumeClick}
                        />
                      </PowerMap>
                    </div>
                    <div id="right-power">
                      {this.state.editing === true ? (
                        <ScrollFormWrapper>
                          <CraigFormHeading
                            icon={RenderForm(this.getIcon(), {
                              style: {
                                marginRight: "0.5rem",
                                marginTop: "0.4rem",
                              },
                            })}
                            noMarginBottom
                            name={`Editing Power ${
                              this.state.selectedItem === "power"
                                ? "Workspace"
                                : this.state.selectedItem === "power_instances"
                                ? "Instance"
                                : this.state.selectedItem === "vtl"
                                ? "FalconStor VTL"
                                : "Volume"
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
                              formName: contains(
                                ["power_instances", "vtl"],
                                this.state.selectedItem
                              )
                                ? "Power Instances"
                                : undefined,
                              craig: craig,
                              data: craig.store.json[this.state.selectedItem][
                                this.state.selectedIndex
                              ],
                              disableSave: disableSave,
                              propsMatchState: propsMatchState,
                              arrayParentName:
                                craig.store.json.power[this.state.powerIndex],
                            }}
                          />
                          <PowerVolumeTable
                            craig={craig}
                            parentState={this.state}
                            parentProps={this.props}
                            onClick={() => {
                              this.setState({
                                showInstanceVolumeModal: true,
                                modalService: "power_volumes",
                                selectWhenDone: {
                                  selectedItem: "power_instances",
                                  editing: true,
                                  selectedIndex: this.state.selectedIndex,
                                },
                                overrideData: {
                                  workspace:
                                    craig.store.json[this.state.selectedItem][
                                      this.state.selectedIndex
                                    ].workspace,
                                  zone: new revision(craig.store.json).child(
                                    "power",
                                    craig.store.json[this.state.selectedItem][
                                      this.state.selectedIndex
                                    ].workspace
                                  ).data.zone,
                                  attachments: [
                                    craig.store.json[this.state.selectedItem][
                                      this.state.selectedIndex
                                    ].name,
                                  ],
                                },
                              });
                            }}
                          />
                        </ScrollFormWrapper>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <NoPowerNetworkTile />
              )
            }
          />
        </div>
      </>
    );
  }
}

export default PowerDiagram;
