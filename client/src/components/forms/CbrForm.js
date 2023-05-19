import React from "react";
import PropTypes from "prop-types";
import {
  CbrZoneForm,
  CbrRuleForm,
  ToggleForm,
  EmptyResourceTile,
  StatefulTabPanel,
  SaveAddButton,
  IcseHeading,
  FormModal,
  buildFormFunctions
} from "icse-react-assets";
import { RenderDocs } from "../pages/SimplePages";
import {
  disableSave,
  invalidName,
  invalidNameText,
  propsMatchState
} from "../../lib";
import { invalidCbrRuleText } from "../../lib/forms/text-callbacks";
import { invalidCbrRule } from "../../lib/forms/invalid-callbacks";

function none() {}

class CbrForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showZonesModal: false, showRulesModal: false };
    this.onZoneModalSubmit = this.onZoneModalSubmit.bind(this);
    this.onRuleModalSubmit = this.onRuleModalSubmit.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.handleModalToggle = this.handleModalToggle.bind(this);
    buildFormFunctions(this);
  }

  onZoneModalSubmit(data) {
    this.props.craig.cbr_zones.create(data, {});
    this.onModalClose();
  }

  onRuleModalSubmit(data) {
    this.props.craig.cbr_rules.create(data, {});
    this.onModalClose();
  }

  onModalClose() {
    this.setState({ showZonesModal: false, showRulesModal: false });
  }

  handleModalToggle(modal) {
    modal === "zones"
      ? this.setState({ showZonesModal: true })
      : this.setState({ showRulesModal: true });
  }
  render() {
    return (
      <>
        <FormModal
          name="Add a CBR Zone"
          show={this.state.showZonesModal}
          onRequestSubmit={this.onZoneModalSubmit}
          onRequestClose={this.onModalClose}
        >
          <CbrZoneForm
            invalidCallback={invalidName("cbr_zones")}
            invalidTextCallback={invalidNameText("cbr_zones")}
            disableSave={disableSave}
            propsMatchState={propsMatchState}
            isModal
            shouldDisableSubmit={function() {
              // set modal form enable submit
              if (disableSave("cbr_zones", this.state, this.props) === false) {
                this.props.enableModal();
              } else {
                this.props.disableModal();
              }
            }}
            craig={this.props.craig}
          />
        </FormModal>
        <FormModal
          name="Add a CBR Rule"
          show={this.state.showRulesModal}
          onRequestSubmit={this.onRuleModalSubmit}
          onRequestClose={this.onModalClose}
        >
          <CbrRuleForm
            isModal
            invalidNameCallback={invalidName("cbr_rules")}
            invalidNameTextCallback={invalidNameText("cbr_rules")}
            invalidCallback={invalidCbrRule}
            invalidTextCallback={invalidCbrRuleText}
            disableSave={disableSave}
            propsMatchState={propsMatchState}
            shouldDisableSubmit={function() {
              // set modal form enable submit
              if (disableSave("cbr_rules", this.state, this.props) === false) {
                this.props.enableModal();
              } else {
                this.props.disableModal();
              }
            }}
            contextProps={{}}
            resourceAttributeProps={{}}
            tagProps={{}}
            craig={this.props.craig}
          />
        </FormModal>
        <StatefulTabPanel
          name="Context Based Restrictions"
          about={RenderDocs("cbr")()}
          form={
            <div className="subForm">
              <IcseHeading
                name="Context Based Restriction Zones"
                className={
                  this.props.craig.store.json.cbr_zones.length > 0
                    ? "marginBottomSmall"
                    : ""
                }
                type="subHeading"
                buttons={
                  <SaveAddButton
                    onClick={() => this.handleModalToggle("zones")}
                    type="add"
                    noDeleteButton
                  />
                }
              />
              <EmptyResourceTile
                name="Zones"
                showIfEmpty={this.props.craig.store.json.cbr_zones}
                noMarginTop
              />
              {this.props.craig.store.json.cbr_zones.map((zone, index) => {
                return (
                  <ToggleForm
                    key={zone.name + "-" + index}
                    name={zone.name}
                    submissionFieldName="cbr_zones"
                    hideName
                    onShowToggle={none}
                    onSave={this.props.craig.cbr_zones.save}
                    onDelete={this.props.craig.cbr_zones.delete}
                    disableSave={disableSave}
                    propsMatchState={propsMatchState}
                    type="formInSubForm"
                    innerForm={CbrZoneForm}
                    tabPanel={{
                      name: this.props.name,
                      hideAbout: true, // passed to ignore second tab panel
                      hasBuiltInHeading: true // passed to ignore second tabPanel
                    }}
                    craig={this.props.craig}
                    innerFormProps={{
                      craig: this.props.craig,
                      data: { ...zone },
                      invalidCallback: invalidName("cbr_zones"),
                      invalidTextCallback: invalidNameText("cbr_zones"), // all fields can use default field invalid text
                      invalidAddressCallback: invalidName("addresses"),
                      invalidAddressTextCallback: invalidNameText("addresses"),
                      invalidExclusionCallback: invalidName("exclusions"),
                      invalidExclusionTextCallback: invalidNameText(
                        "exclusions"
                      ),
                      disableSave: disableSave,
                      propsMatchState: propsMatchState,
                      addressProps: {
                        craig: this.props.craig,
                        onSave: this.props.craig.cbr_zones.addresses.save,
                        onDelete: this.props.craig.cbr_zones.addresses.delete,
                        onSubmit: this.props.craig.cbr_zones.addresses.create,
                        disableSave: disableSave
                      },
                      exclusionProps: {
                        craig: this.props.craig,
                        onSave: this.props.craig.cbr_zones.exclusions.save,
                        onDelete: this.props.craig.cbr_zones.exclusions.delete,
                        onSubmit: this.props.craig.cbr_zones.exclusions.create,
                        disableSave: disableSave
                      }
                    }}
                  />
                );
              })}
              <IcseHeading
                name="Context Based Restriction Rules"
                className={
                  this.props.craig.store.json.cbr_rules.length > 0
                    ? "marginBottomSmall"
                    : ""
                }
                type="subHeading"
                buttons={
                  <SaveAddButton
                    onClick={() => this.handleModalToggle("rules")}
                    type="add"
                    noDeleteButton
                  />
                }
              />
              <EmptyResourceTile
                name="Rules"
                showIfEmpty={this.props.craig.store.json.cbr_rules}
                noMarginTop
              />
              {this.props.craig.store.json.cbr_rules.map((rule, index) => {
                return (
                  <ToggleForm
                    key={rule.name + "-" + index}
                    name={rule.name}
                    submissionFieldName="cbr_rules"
                    hideName
                    onShowToggle={none}
                    onSave={this.props.craig.cbr_rules.save}
                    onDelete={this.props.craig.cbr_rules.delete}
                    disableSave={disableSave}
                    propsMatchState={propsMatchState}
                    type="formInSubForm"
                    innerForm={CbrRuleForm}
                    tabPanel={{
                      name: this.props.name,
                      hideAbout: true, // passed to ignore second tab panel
                      hasBuiltInHeading: true // passed to ignore second tabPanel
                    }}
                    craig={this.props.craig}
                    innerFormProps={{
                      craig: this.props.craig,
                      data: { ...rule },
                      invalidCallback: invalidCbrRule,
                      invalidTextCallback: invalidCbrRuleText,
                      invalidNameCallback: invalidName("cbr_rules"),
                      invalidNameTextCallback: invalidNameText("cbr_rules"),
                      disableSave: disableSave,
                      propsMatchState: propsMatchState,
                      contextProps: {
                        craig: this.props.craig,
                        disableSave: disableSave,
                        onSave: this.props.craig.cbr_rules.contexts.save,
                        onSubmit: this.props.craig.cbr_rules.contexts.create,
                        onDelete: this.props.craig.cbr_rules.contexts.delete,
                        invalidCallback: invalidCbrRule,
                        invalidTextCallback: invalidCbrRuleText,
                        invalidNameCallback: invalidName("contexts"),
                        invalidNameTextCallback: invalidNameText("contexts")
                      },
                      resourceAttributeProps: {
                        craig: this.props.craig,
                        disableSave: disableSave,
                        onSave: this.props.craig.cbr_rules.resource_attributes
                          .save,
                        onSubmit: this.props.craig.cbr_rules.resource_attributes
                          .create,
                        onDelete: this.props.craig.cbr_rules.resource_attributes
                          .delete,
                        invalidCallback: invalidCbrRule,
                        invalidTextCallback: invalidCbrRuleText,
                        invalidNameCallback: invalidName("resource_attributes"),
                        invalidNameTextCallback: invalidNameText(
                          "resource_attributes"
                        )
                      },
                      tagProps: {
                        craig: this.props.craig,
                        disableSave: disableSave,
                        onSave: this.props.craig.cbr_rules.tags.save,
                        onSubmit: this.props.craig.cbr_rules.tags.create,
                        onDelete: this.props.craig.cbr_rules.tags.delete,
                        invalidCallback: invalidCbrRule,
                        invalidTextCallback: invalidCbrRuleText,
                        invalidNameCallback: invalidName("tags"),
                        invalidNameTextCallback: invalidNameText("tags")
                      }
                    }}
                  />
                );
              })}
            </div>
          }
        />
      </>
    );
  }
}

export default CbrForm;

CbrForm.propTypes = {
  craig: PropTypes.shape({
    cbr_zones: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
      addresses: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired,
      exclusions: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    cbr_rules: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
      contexts: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired,
      resource_attributes: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired,
      tags: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    store: PropTypes.shape({
      json: PropTypes.shape({
        cbr_zones: PropTypes.array.isRequired,
        cbr_rules: PropTypes.array.isRequired
      }).isRequired
    }).isRequired
  })
};
