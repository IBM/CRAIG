import React from "react";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import {
  CraigFormHeading,
  PrimaryButton,
} from "../../forms/utils/ToggleFormComponents";
import { TransitGatewaysMap, docTabs } from "../diagrams";
import {
  DirectoryDomain, // cis domain
  Account, // cis record
  IbmCloudTransitGateway,
} from "@carbon/icons-react";
import "../diagrams/diagrams.css";
import { CraigToggleForm, DynamicFormModal } from "../../forms/utils";
import { craigForms } from "../CraigForms";
import { disableSave, propsMatchState } from "../../../lib";
import DynamicForm from "../../forms/DynamicForm";
import { isNullOrEmptyString } from "lazy-z";

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

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
  handleItemClick(tgwIndex) {
    if (this.state.selectedIndex === tgwIndex) {
      this.resetSelection();
    } else {
      this.setState({
        selectedIndex: tgwIndex,
        editing: true,
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
          name={"Create a Transit Gateway"}
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
        <div className="marginBottomSmall" />
        <StatefulTabs
          formName="Manage Connectivity"
          name="Connectivity"
          nestedDocs={docTabs(["Transit Gateways"], craig)}
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
                        this.setState({ editing: false, showModal: true });
                      }}
                    />
                  }
                />
              </div>
              <div className="displayFlex">
                <div id="left-connectivity">
                  <TransitGatewaysMap
                    craig={craig}
                    onClick={(tgwIndex) => {
                      this.handleItemClick(tgwIndex);
                    }}
                    isSelected={(tgwIndex) => {
                      return tgwIndex === this.state.selectedIndex;
                    }}
                  />
                </div>
                <div id="right-connectivity" className="">
                  {this.state.editing === false ? (
                    ""
                  ) : (
                    <div className="marginTop1Rem">
                      <CraigFormHeading
                        noMarginBottom
                        type="subHeading"
                        icon={
                          <IbmCloudTransitGateway className="diagramTitleIcon" />
                        }
                        name={`Editing Transit Gateway ${
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
                          form: forms.transit_gateways,
                          craig: craig,
                          data: craig.store.json[this.state.selectedItem][
                            this.state.selectedIndex
                          ],
                          disableSave: disableSave,
                          propsMatchState: propsMatchState,
                        }}
                      />
                    </div>
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
