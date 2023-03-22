import React from "react";
import { StatelessToggleForm, IcseModal } from "icse-react-assets";
import {
  getObjectFromArray,
  isNullOrEmptyString,
  splat,
  splatContains,
  prettyJSON,
  revision
} from "lazy-z";
import "./copy-rule-form-page.css";
import { CraigCodeMirror } from "../page-template/CodeMirror";
import {
  AddClusterRules,
  AddClusterRulesModalContent,
  CopyAclModalContent,
  CopyAcl,
  CopyAclRule
} from "./duplicate-rules";

class CopyRuleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideToggleForm: true,
      sourceAcl: null,
      destinationVpc: null,
      addClusterRuleAcl: null,
      ruleSourceAcl: null,
      ruleCopyName: null,
      ruleDestintionAcl: null,
      destinationRuleNames: [],
      showModal: false,
      modalStyle: null
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.getAllRuleNames = this.getAllRuleNames.bind(this);
    this.getAllOtherAcls = this.getAllOtherAcls.bind(this);
    this.openModal = this.openModal.bind(this);
    this.hasRuleName = this.hasRuleName.bind(this);
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.duplicateCopyAclName = this.duplicateCopyAclName.bind(this);
  }

  /**
   * open modal
   * @param {string} style name of style modal to open
   */
  openModal(style) {
    this.setState({
      modalStyle: style,
      showModal: true
    });
  }

  /**
   * handle select changes
   * @param {*} event
   */
  handleSelect(event) {
    let { name, value } = event.target;
    let nextState = { [name]: value };
    if (name === "ruleSourceAcl") {
      nextState.ruleCopyName = null;
    } else if (name === "ruleDestintionAcl") {
      nextState.destinationRuleNames = [];
      // for each vpc
      this.props.craig.store.json.vpcs.forEach(vpc => {
        // set rule names to be rules if acl name is found in vpc
        if (splatContains(vpc.acls, "name", value)) {
          nextState.destinationRuleNames = splat(
            getObjectFromArray(vpc.acls, "name", value).rules,
            "name"
          );
          nextState.destinationRuleVpc = vpc.name;
        }
      });
    }
    this.setState(nextState);
  }

  /**
   * get all rule names from a single acl
   * @returns {Array<string>} list of rule names
   */
  getAllRuleNames() {
    return this.state.ruleSourceAcl
      ? splat(
          new revision(this.props.craig.store.json)
            .child("vpcs", this.props.data.name, "name")
            .child("acls", this.state.ruleSourceAcl, "name").data.rules,
          "name"
        )
      : [];
  }

  /**
   * get all acls other than selected one for rule copy
   * @returns {Array<string>} list of acl names
   */
  getAllOtherAcls() {
    if (isNullOrEmptyString(this.state.ruleSourceAcl)) {
      return [];
    } else {
      let aclNames = [];
      this.props.craig.store.json.vpcs.forEach(vpc => {
        vpc.acls.forEach(acl => {
          if (acl.name !== this.state.ruleSourceAcl) aclNames.push(acl.name);
        });
      });
      return aclNames;
    }
  }

  /**
   * check to see if an acl has a rule name for cluster rules
   * @param {string} name name to check
   * @returns {string} x if not unique, check if unique
   */
  hasRuleName(name) {
    return splatContains(
      getObjectFromArray(
        this.props.data.acls,
        "name",
        this.state.addClusterRuleAcl
      ).rules,
      "name",
      name
    )
      ? "✘"
      : "✔";
  }

  duplicateCopyAclName() {
    try {
      if (
        splatContains(
          getObjectFromArray(
            this.props.craig.store.json.vpcs,
            "name",
            this.state.destinationVpc
          ).acls,
          "name",
          this.state.sourceAcl + "-copy"
        )
      )
        return `Duplicate ACL name "${this.state.sourceAcl + "-copy"}"`;
      else return "Copy Access Control List";
    } catch {
      return "Copy Access Control List";
    }
  }

  onModalSubmit() {
    if (this.state.modalStyle === "addClusterRules") {
      this.props.craig.addClusterRules(
        this.props.data.name,
        this.state.addClusterRuleAcl
      );
    } else if (this.state.modalStyle === "copyRule") {
      this.props.craig.copyRule(
        this.props.data.name,
        this.state.ruleSourceAcl,
        this.state.ruleCopyName,
        this.state.ruleDestintionAcl
      );
    } else {
      this.props.craig.copyNetworkAcl(
        this.props.data.name,
        this.state.sourceAcl,
        this.state.destinationVpc
      );
    }
    this.setState({
      sourceAcl: null,
      destinationVpc: null,
      addClusterRuleAcl: null,
      ruleSourceAcl: null,
      ruleCopyName: null,
      ruleDestintionAcl: null,
      destinationRuleNames: [],
      showModal: false,
      modalStyle: null
    });
  }

  render() {
    return (
      <div className="formInSubForm positionRelative">
        <IcseModal
          open={this.state.showModal}
          heading={
            this.state.modalStyle === "copyRule"
              ? "Copy ACL Rule"
              : this.state.modalStyle === "addClusterRules"
              ? "Add Cluster Rules to ACL"
              : "Copy Network ACL"
          }
          primaryButtonText={
            this.state.modalStyle === "copyRule"
              ? "Copy Rule"
              : this.state.modalStyle === "addClusterRules"
              ? "Add Cluster Rules"
              : "Copy Network ACL"
          }
          onRequestSubmit={this.onModalSubmit}
          onRequestClose={() => {
            this.setState({ showModal: false, modalStyle: null });
          }}
          danger
        >
          {/* && syntax used here to prevent rendering when no data */}
          {this.state.modalStyle === "addClusterRules" && (
            <AddClusterRulesModalContent
              addClusterRuleAcl={this.state.addClusterRuleAcl}
              hasRuleName={this.hasRuleName}
            />
          )}
          {this.state.modalStyle === "copyRule" && (
            <>
              <p className="marginBottomSmall">
                Copy rule <strong>{this.state.ruleCopyName}</strong> to ACL{" "}
                <strong>{this.state.ruleDestintionAcl}</strong>?
              </p>
              <CraigCodeMirror
                className="regular"
                code={prettyJSON(
                  new revision(this.props.craig.store.json)
                    .child("vpcs", this.props.data.name, "name")
                    .child("acls", this.state.ruleSourceAcl, "name")
                    .child("rules", this.state.ruleCopyName, "name").data
                ).replace(/"(vpc|acl)"[^,\n]+(,\s+)?/g, "")}
              />
            </>
          )}
          {this.state.modalStyle === "copyAcl" && (
            <CopyAclModalContent
              sourceAcl={this.state.sourceAcl}
              destinationVpc={this.state.destinationVpc}
              craig={this.props.craig}
              data={this.props.data}
            />
          )}
        </IcseModal>
        <StatelessToggleForm
          name="Duplicate Lists & Rules"
          subHeading
          onIconClick={() => {
            this.setState({ hideToggleForm: !this.state.hideToggleForm });
          }}
          hide={this.state.hideToggleForm}
          iconType="add"
        >
          <AddClusterRules
            data={this.props.data}
            addClusterRuleAcl={this.state.addClusterRuleAcl}
            handleSelect={this.handleSelect}
            openModal={this.openModal}
          />
          <CopyAcl
            data={this.props.data}
            sourceAcl={this.state.sourceAcl}
            destinationVpc={this.state.destinationVpc}
            handleSelect={this.handleSelect}
            openModal={this.openModal}
            craig={this.props.craig}
            hoverText={this.duplicateCopyAclName()}
          />
          <CopyAclRule
            data={this.props.data}
            ruleSourceAcl={this.state.ruleSourceAcl}
            ruleCopyName={this.state.ruleCopyName}
            handleSelect={this.handleSelect}
            allRuleNames={this.getAllRuleNames()}
            destinationRuleNames={this.state.destinationRuleNames}
            ruleDestintionAcl={this.state.ruleDestintionAcl}
            allOtherAcls={this.getAllOtherAcls()}
            openModal={this.openModal}
          />
        </StatelessToggleForm>
      </div>
    );
  }
}

export default CopyRuleForm;
