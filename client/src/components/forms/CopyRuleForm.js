import React from "react";
import { getObjectFromArray, revision, splat, splatContains } from "lazy-z";
import { copyRuleCodeMirrorData } from "../../lib";
import { CraigCodeMirror } from "../page-template/CodeMirror";
import "./copy-rule-form-page.css";
import {
  AddClusterRules,
  AddClusterRulesModalContent,
  CopyAclModalContent,
  CopyRule,
  CopyRuleObject,
  CopySgModalContent,
} from "./duplicate-rules";
import PropTypes from "prop-types";
import { StatelessFormWrapper } from "./utils";
import { Modal } from "@carbon/react";

class CopyRuleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideToggleForm: true,
      source: null,
      destinationVpc: null,
      addClusterRuleAcl: null,
      ruleSource: null,
      ruleCopyName: null,
      ruleDestination: null,
      destinationRuleNames: [],
      showModal: false,
      modalStyle: null,
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.getAllRuleNames = this.getAllRuleNames.bind(this);
    this.getAllOtherGroups = this.getAllOtherGroups.bind(this);
    this.openModal = this.openModal.bind(this);
    this.hasRuleName = this.hasRuleName.bind(this);
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.duplicateCopyAclName = this.duplicateCopyAclName.bind(this);
    this.copyIsDuplicate = this.copyIsDuplicate.bind(this);
  }

  /**
   * open modal
   * @param {string} style name of style modal to open
   */
  openModal(style) {
    this.setState({
      modalStyle: style,
      showModal: true,
    });
  }

  /**
   * handle select changes
   * @param {*} event
   */
  handleSelect(event) {
    let { name, value } = event.target;
    let nextState = { [name]: value };
    if (name === "ruleSource") {
      nextState.ruleCopyName = null;
    } else if (name === "ruleDestination" && this.props.isAclForm) {
      nextState.destinationRuleNames = [];
      // for each vpc
      this.props.craig.store.json.vpcs.forEach((vpc) => {
        // set rule names to be rules if acl name is found in vpc
        if (splatContains(vpc.acls, "name", value)) {
          nextState.destinationRuleNames = splat(
            getObjectFromArray(vpc.acls, "name", value).rules,
            "name"
          );
          nextState.destinationRuleVpc = vpc.name;
        }
      });
    } else if (name === "ruleDestination") {
      nextState.destinationRuleNames = splat(
        new revision(this.props.craig.store.json).child(
          "security_groups",
          value,
          "name"
        ).data.rules,
        "name"
      );
    }
    this.setState(nextState);
  }

  /**
   * get all rule names from a single acl
   * @returns {Array<string>} list of rule names
   */
  getAllRuleNames() {
    return this.props.craig.getAllRuleNames(
      this.state.ruleSource,
      this.props.isAclForm ? this.props.data.name : null
    );
  }

  /**
   * get all acls other than selected one for rule copy
   * @returns {Array<string>} list of acl names
   */
  getAllOtherGroups() {
    return this.props.craig.getAllOtherGroups(this.state, this.props);
  }

  /**
   * check to see if an acl has a rule name for cluster rules
   * @param {string} name name to check
   * @returns {string} x if not unique, check if unique
   */
  hasRuleName(name) {
    let aclName = this.props.v2
      ? this.props.acl.name
      : this.state.addClusterRuleAcl;
    return splatContains(
      getObjectFromArray(this.props.data.acls, "name", aclName).rules,
      "name",
      name
    )
      ? "✘"
      : "✔";
  }

  copyIsDuplicate() {
    let isDuplicate = false;
    try {
      isDuplicate = this.props.isAclForm
        ? splatContains(
            getObjectFromArray(
              this.props.craig.store.json.vpcs,
              "name",
              this.state.destinationVpc
            ).acls,
            "name",
            this.state.source + "-copy"
          )
        : splatContains(
            this.props.craig.store.json.security_groups,
            "name",
            this.state.source + "-copy"
          );
      return isDuplicate;
    } catch (err) {
      return false;
    }
  }

  duplicateCopyAclName() {
    if (this.copyIsDuplicate())
      return `Duplicate ${
        this.props.isAclForm ? "ACL" : "Security Group"
      } name "${this.state.source + "-copy"}"`;
    else
      return `Copy ${
        this.props.isAclForm ? "Access Control List" : "Security Group"
      }`;
  }

  onModalSubmit() {
    if (
      this.props.isAclForm === false &&
      this.state.modalStyle === "copyRule"
    ) {
      this.props.craig.copySgRule(
        this.state.ruleSource,
        this.state.ruleCopyName,
        this.state.ruleDestination
      );
    } else if (this.props.isAclForm === false) {
      this.props.craig.copySecurityGroup(
        this.state.source,
        this.state.destinationVpc
      );
    } else if (this.state.modalStyle === "addClusterRules") {
      let aclName = this.props.v2
        ? this.props.acl.name
        : this.state.addClusterRuleAcl;
      this.props.craig.addClusterRules(this.props.data.name, aclName);
    } else if (this.state.modalStyle === "copyRule") {
      this.props.craig.copyRule(
        this.props.data.name,
        this.state.ruleSource,
        this.state.ruleCopyName,
        this.state.ruleDestination
      );
    } else {
      this.props.craig.copyNetworkAcl(
        this.props.data.name,
        this.state.source,
        this.state.destinationVpc
      );
    }
    this.setState({
      source: null,
      destinationVpc: null,
      addClusterRuleAcl: null,
      ruleSource: null,
      ruleCopyName: null,
      ruleDestination: null,
      destinationRuleNames: [],
      showModal: false,
      modalStyle: null,
    });
  }

  render() {
    if (this.props.v2) {
      let source = this.props.isAclForm
        ? this.props.acl.name
        : this.props.sourceSg;
      this.state.source = source;
      this.state.ruleSource = source;
    }
    return (
      <div
        className={
          (this.props.isAclForm && !this.props.v2
            ? "formInSubForm "
            : "subForm sgFormTopMargin ") + "positionRelative"
        }
      >
        <Modal
          id="copy-rule-modal"
          open={this.state.showModal}
          modalHeading={
            this.state.modalStyle === "copyRule"
              ? "Copy Rule"
              : this.state.modalStyle === "addClusterRules"
              ? "Add Cluster Rules to ACL"
              : this.props.isAclForm
              ? "Copy Network ACL"
              : "Copy Security Group"
          }
          primaryButtonText={
            this.state.modalStyle === "copyRule"
              ? "Copy Rule"
              : this.state.modalStyle === "addClusterRules"
              ? "Add Cluster Rules"
              : this.props.isAclForm
              ? "Copy Network ACL"
              : "Copy Security Group"
          }
          className="leftTextAlign"
          secondaryButtonText="Cancel"
          size="md"
          onRequestSubmit={this.onModalSubmit}
          onRequestClose={() => {
            this.setState({ showModal: false, modalStyle: null });
          }}
          danger
        >
          {/* && syntax used here to prevent rendering when no data */}
          {this.state.modalStyle === "addClusterRules" &&
            this.props.isAclForm && (
              <AddClusterRulesModalContent
                addClusterRuleAcl={this.state.addClusterRuleAcl}
                hasRuleName={this.hasRuleName}
              />
            )}
          {this.state.modalStyle === "copyRule" && (
            <>
              <p className="marginBottomSmall">
                Copy rule <strong>{this.state.ruleCopyName}</strong> to{" "}
                {this.props.isAclForm ? "ACL" : "Security Group"}{" "}
                <strong>{this.state.ruleDestination}</strong>?
              </p>
              <CraigCodeMirror
                light
                className="regular"
                code={copyRuleCodeMirrorData(this.state, this.props)}
              />
            </>
          )}
          {this.state.modalStyle === "copyAcl" && this.props.isAclForm ? (
            <CopyAclModalContent
              source={this.state.source}
              destinationVpc={this.state.destinationVpc}
              craig={this.props.craig}
              data={this.props.data}
            />
          ) : (
            this.state.modalStyle === "copyAcl" && (
              <CopySgModalContent
                source={this.state.source}
                destinationVpc={this.state.destinationVpc}
                craig={this.props.craig}
              />
            )
          )}
        </Modal>
        <StatelessFormWrapper
          name="Duplicate Lists & Rules"
          subHeading={this.props.isAclForm}
          onIconClick={() => {
            this.setState({ hideToggleForm: !this.state.hideToggleForm });
          }}
          hide={this.state.hideToggleForm}
          iconType="add"
        >
          {this.props.isAclForm && (
            <AddClusterRules
              data={this.props.data}
              addClusterRuleAcl={
                this.props.v2
                  ? this.props.acl.name
                  : this.state.addClusterRuleAcl
              }
              handleSelect={this.handleSelect}
              openModal={this.openModal}
              v2={this.props.v2}
            />
          )}

          <CopyRuleObject
            data={this.props.data}
            source={this.state.source}
            destinationVpc={this.state.destinationVpc}
            handleSelect={this.handleSelect}
            openModal={this.openModal}
            craig={this.props.craig}
            hoverText={this.duplicateCopyAclName()}
            isSecurityGroup={this.props.isAclForm === false}
            v2={this.props.v2}
          />
          <CopyRule
            data={this.props.data}
            ruleSource={this.state.ruleSource}
            ruleCopyName={this.state.ruleCopyName}
            handleSelect={this.handleSelect}
            allRuleNames={this.getAllRuleNames()}
            destinationRuleNames={this.state.destinationRuleNames}
            ruleDestination={this.state.ruleDestination}
            allOtherAcls={this.getAllOtherGroups()}
            openModal={this.openModal}
            craig={this.props.craig}
            isSecurityGroup={this.props.isAclForm === false}
            v2={this.props.v2}
          />
        </StatelessFormWrapper>
      </div>
    );
  }
}

CopyRuleForm.propTypes = {
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        vpcs: PropTypes.array.isRequired,
        security_groups: PropTypes.array,
      }).isRequired,
    }).isRequired,
    getAllRuleNames: PropTypes.func.isRequired,
    getAllOtherGroups: PropTypes.func.isRequired,
    copySgRule: PropTypes.func.isRequired,
    copySecurityGroup: PropTypes.func.isRequired,
    addClusterRules: PropTypes.func.isRequired,
    copyRule: PropTypes.func.isRequired,
    copyNetworkAcl: PropTypes.func.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    acls: PropTypes.array,
  }),
  isAclForm: PropTypes.bool,
};

CopyRuleForm.defaultProps = {
  isAclForm: true,
};

export default CopyRuleForm;
