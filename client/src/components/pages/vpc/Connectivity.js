import React from "react";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import { DeploymentIcon, TransitGatewaysMap, docTabs } from "../diagrams";
import {
  DirectoryDomain, // cis domain
  Account, // cis record
  IbmCloudTransitGateway,
  IbmCloudInternetServices,
} from "@carbon/icons-react";
import "../diagrams/diagrams.css";
import {
  CraigFormHeading,
  PrimaryButton,
  CraigFormGroup,
  DynamicFormModal,
  CraigToggleForm,
} from "../../forms/utils";
import { craigForms } from "../CraigForms";
import { disableSave, propsMatchState, tgwTf } from "../../../lib";
import DynamicForm from "../../forms/DynamicForm";
import { isNullOrEmptyString } from "lazy-z";
import { ScrollFormWrapper } from "../diagrams/ScollFormWrapper";
import HoverClassNameWrapper from "../diagrams/HoverClassNameWrapper";
import { cisTf } from "../../../lib/json-to-iac/cis";

class VpcConnectivityPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selectedItem: "transit_gateways",
      selectedIndex: -1,
      editing: false,
    };
    this.handleItemClick = this.handleItemClick.bind(this);
    this.resetSelection = this.resetSelection.bind(this);
    this.onItemDelete = this.onItemDelete.bind(this);
  }

  resetSelection() {
    this.setState({
      selectedIndex: -1,
      editing: false,
      showModal: false,
    });
  }

  /**
   * right now only handles tgw click
   * @param {number} tgwIndex
   */
  handleItemClick(tgwIndex, selectedItem) {
    if (this.state.selectedIndex === tgwIndex) {
      this.resetSelection();
    } else {
      this.setState({
        selectedIndex: tgwIndex,
        editing: true,
        selectedItem: selectedItem,
      });
    }
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

  render() {
    let craig = this.props.craig;
    let forms = craigForms(craig);
    return (
      <>
        <DynamicFormModal
          name={
            this.state.selectedItem === "cis"
              ? "Create a Cloud Internet Services Instance"
              : "Create a Transit Gateway"
          }
          beginDisabled
          show={this.state.showModal}
          onRequestClose={this.resetSelection}
          onRequestSubmit={(stateData, componentProps) => {
            craig[this.state.selectedItem].create(stateData, componentProps);
            this.resetSelection();
          }}
        >
          <DynamicForm
            key={this.state.selectedItem}
            className="formInSubForm"
            isModal
            form={forms[this.state.selectedItem]}
            craig={craig}
            selectedItem={this.state.selectedItem}
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
        <StatefulTabs
          h2
          icon={
            <IbmCloudTransitGateway
              style={{ marginTop: "0.4rem", marginRight: "0.5rem" }}
              size="20"
            />
          }
          formName="Manage Connectivity"
          name="Connectivity"
          nestedDocs={docTabs(
            ["Cloud Internet Services", "Transit Gateways"],
            craig
          )}
          tfTabs={[
            {
              name: "Transit Gateways",
              tf: tgwTf(craig.store.json) || "",
            },
            {
              name: "Cloud Internet Services",
              tf: cisTf(craig.store.json) || "",
            },
          ]}
          form={
            <>
              <div className="marginRight1Rem width580">
                <div className="marginBottomSmall" />
                <CraigFormHeading
                  name="Transit Gateways"
                  noMarginBottom
                  buttons={
                    <PrimaryButton
                      type="add"
                      hoverText="Create a Transit Gateway"
                      noDeleteButton
                      onClick={() => {
                        this.setState({
                          editing: false,
                          showModal: true,
                          selectedItem: "transit_gateways",
                        });
                      }}
                    />
                  }
                />
              </div>
              <div className="displayFlex">
                <div
                  id="left-connectivity"
                  className="marginRight1Rem width580"
                >
                  <TransitGatewaysMap
                    craig={craig}
                    onClick={(tgwIndex) => {
                      this.handleItemClick(tgwIndex, "transit_gateways");
                    }}
                    isSelected={(tgwIndex) => {
                      return (
                        tgwIndex === this.state.selectedIndex &&
                        this.state.selectedItem === "transit_gateways"
                      );
                    }}
                  />
                  <div className="marginBottomSmall" />
                  <CraigFormHeading
                    name="Cloud Internet Services"
                    noMarginBottom
                    buttons={
                      <PrimaryButton
                        type="add"
                        hoverText="Create a Cloud Internet Services Instance"
                        noDeleteButton
                        onClick={() => {
                          this.setState({
                            editing: false,
                            showModal: true,
                            selectedItem: "cis",
                          });
                        }}
                      />
                    }
                  />
                  {craig.store.json.cis.map((cis, cisIndex) => {
                    return (
                      <HoverClassNameWrapper
                        className="subForm marginBottomSmall marginRight1Rem width580"
                        hoverClassName="diagramBoxSelected"
                        key={"cis" + cisIndex}
                        onClick={() => {
                          this.handleItemClick(cisIndex, "cis");
                        }}
                      >
                        <DeploymentIcon
                          item={cis}
                          craig={craig}
                          itemName="cis"
                          icon={IbmCloudInternetServices}
                        />
                        <div className="marginBottomSmall" />
                        <div className="formInSubForm marginBottomSmall">
                          <CraigFormHeading
                            icon={
                              <DirectoryDomain className="diagramTitleIcon" />
                            }
                            type="subHeading"
                            noMarginBottom={cis.domains.length === 0}
                            name="Domains"
                          />
                          {cis.domains.length === 0 ? (
                            ""
                          ) : (
                            <CraigFormGroup
                              className="displayFlex alignItemsCenter overrideGap powerSubnetChildren"
                              style={{
                                width: "535px",
                              }}
                            >
                              {cis.domains.map((domain, domainIndex) => (
                                <DeploymentIcon
                                  key={cis.name + "-domain-" + domainIndex}
                                  item={domain}
                                  itemName="domain"
                                  icon={DirectoryDomain}
                                  size="30"
                                />
                              ))}
                            </CraigFormGroup>
                          )}
                        </div>
                        <div className="formInSubForm">
                          <CraigFormHeading
                            icon={<Account className="diagramTitleIcon" />}
                            type="subHeading"
                            noMarginBottom={cis.dns_records.length === 0}
                            name="DNS Records"
                          />
                          {cis.dns_records.length === 0 ? (
                            ""
                          ) : (
                            <CraigFormGroup
                              className="displayFlex alignItemsCenter overrideGap powerSubnetChildren"
                              style={{
                                width: "535px",
                              }}
                            >
                              {cis.dns_records.map((domain, domainIndex) => (
                                <DeploymentIcon
                                  key={cis.name + "-domain-" + domainIndex}
                                  item={domain}
                                  itemName="dns_record"
                                  icon={Account}
                                  size="30"
                                />
                              ))}
                            </CraigFormGroup>
                          )}
                        </div>
                      </HoverClassNameWrapper>
                    );
                  })}
                </div>

                <div id="right-connectivity" className="">
                  {this.state.editing === false ? (
                    ""
                  ) : (
                    <ScrollFormWrapper>
                      <CraigFormHeading
                        noMarginBottom
                        type="subHeading"
                        icon={
                          <IbmCloudTransitGateway className="diagramTitleIcon" />
                        }
                        name={`Editing ${
                          this.state.selectedItem === "cis"
                            ? "Cloud Internet Services"
                            : "Transit Gateway"
                        } ${
                          craig.store.json[this.state.selectedItem][
                            this.state.selectedIndex
                          ].name
                        }`}
                      />
                      <CraigToggleForm
                        key={this.state.selectedIndex}
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
                    </ScrollFormWrapper>
                  )}
                </div>
              </div>
            </>
          }
        />
      </>
    );
  }
}

export default VpcConnectivityPage;
