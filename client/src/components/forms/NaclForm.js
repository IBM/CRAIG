import React from "react";
import {
  IcseFormTemplate,
  FormModal,
  IcseHeading,
  SaveAddButton,
  NetworkAclForm
} from "icse-react-assets";
import {
  invalidNameText,
  propsMatchState,
  disableSave,
  invalidName,
  aclHelperTextCallback
} from "../../lib/forms";
import { splat } from "lazy-z";
import CopyRuleForm from "./CopyRuleForm";

function none() {}

class NaclForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showToggleForm: false,
      sourceAcl: null,
      destinationVpc: null,
      addClusterRuleAcl: null
    };
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  onModalSubmit(data) {
    this.props.craig.vpcs.acls.create(data, {
      vpc_name: this.props.data.name
    });
    this.props.handleModalToggle();
  }

  handleSelect(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    return (
      <>
        <FormModal
          name="Add a Network ACL"
          show={this.props.showSubModal}
          onRequestSubmit={this.onModalSubmit}
          onRequestClose={this.props.handleModalToggle}
        >
          <NetworkAclForm
            invalidTextCallback={invalidNameText("acls")}
            invalidCallback={invalidName("acls")}
            craig={this.props.craig}
            resourceGroups={splat(
              this.props.craig.store.json.resource_groups,
              "name"
            )}
            vpc_name={this.props.data.name}
            shouldDisableSubmit={function() {
              // set modal form enable submit
              if (disableSave("acls", this.state, this.props) === false) {
                this.props.enableModal();
              } else {
                this.props.disableModal();
              }
            }}
            isModal
            /* below functions only needed when not modal but are required */
            disableSaveCallback={none}
            helperTextCallback={none}
            onRuleSave={none}
            onRuleDelete={none}
            disableModalSubmitCallback={none}
            onSubmitCallback={none}
          />
        </FormModal>
        <IcseHeading
          name="Network Access Control Lists"
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

        <IcseFormTemplate
          arrayData={this.props.data.acls}
          onSubmit={none} // no modal
          onDelete={this.props.craig.vpcs.acls.delete}
          onSave={this.props.craig.vpcs.acls.save}
          innerForm={NetworkAclForm}
          isMiddleForm
          innerFormProps={{
            invalidTextCallback: invalidNameText("acls"),
            invalidCallback: invalidName("acls"),
            invalidRuleTextCallback: invalidNameText("acl_rules"),
            invalidRuleText: invalidName("acl_rules"),
            disableSaveCallback: function(stateData, componentProps) {
              return (
                disableSave("acl_rules", stateData, componentProps) ||
                propsMatchState("acl_rules", stateData, componentProps)
              );
            },
            helperTextCallback: aclHelperTextCallback,
            onRuleSave: this.props.craig.vpcs.acls.rules.save,
            onRuleDelete: this.props.craig.vpcs.acls.rules.delete,
            onSubmitCallback: this.props.craig.vpcs.acls.rules.create,
            resourceGroups: splat(
              this.props.craig.store.json.resource_groups,
              "name"
            ),
            vpc_name: this.props.data.name,
            craig: this.props.craig,
            disableModalSubmitCallback: none
          }}
          disableSave={disableSave}
          propsMatchState={propsMatchState}
          toggleFormProps={{
            submissionFieldName: "acls",
            hideName: true,
            type: "formInSubForm",
            disableSave: disableSave,
            propsMatchState: propsMatchState,
            vpc_name: this.props.data.name
          }}
          hideAbout
        />
        {this.props.data.acls.length > 0 && (
          <CopyRuleForm data={this.props.data} craig={this.props.craig} />
        )}
      </>
    );
  }
}

export default NaclForm;
