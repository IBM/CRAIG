import React from "react";
import { OrderCardDataTable } from "../network-rules-order-card";
import {
  CraigFormHeading,
  CraigToggleForm,
  DynamicFormModal,
  PrimaryButton,
  RenderForm,
} from "../utils";
import { DataView, Edit } from "@carbon/icons-react";
import { allFieldsNull, contains } from "lazy-z";
import DynamicForm from "../DynamicForm";
import { disableSave } from "../../../lib";

/**
 * get which rule protocol is being used
 * @param {string} rule
 * @returns {string} protocol
 */
function getRuleProtocol(rule) {
  let protocol = "all";
  // for each possible protocol
  ["icmp", "tcp", "udp"].forEach((field) => {
    // set protocol to that field if not all fields are null
    if (allFieldsNull(rule[field]) === false) {
      protocol = field;
    }
  });
  return protocol;
}

class NetworkingRuleOrderCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMode: true,
      openForms: [],
      showModal: false,
    };
    this.openForm = this.openForm.bind(this);
    this.saveRuleOrder = this.saveRuleOrder.bind(this);
    this.handleModalToggle = this.handleModalToggle.bind(this);
  }

  handleModalToggle() {
    this.setState({ showModal: !this.state.showModal });
  }

  /**
   * save rule order
   * @param {string} direction
   * @param {number} index
   */
  saveRuleOrder(direction, index) {
    /**
     * Helper function to move items up and down in the list so they can be rendered properly
     * @param {Array} arr
     * @param {number} indexA
     * @param {number} indexB
     */
    function swapArrayElements(arr, indexA, indexB) {
      let temp = arr[indexA];
      arr[indexA] = arr[indexB];
      arr[indexB] = temp;
    }

    let resource = { ...this.props.parentProps.data };
    swapArrayElements(
      resource.rules,
      index,
      direction === "down" ? index + 1 : index - 1
    );
    let component =
      this.props.parentProps.form.jsonField === "security_groups"
        ? this.props.parentProps.craig.security_groups
        : this.props.parentProps.craig.vpcs.acls;

    component.save(resource, {
      craig: this.props.parentProps.craig,
      data: this.props.parentProps.data,
      vpc_name: resource.vpc,
    });
  }

  /**
   * maintain form open after save
   * @param {number} index
   */
  openForm(index) {
    let forms = [...this.state.openForms];
    if (contains(this.state.openForms, index)) {
      forms.splice(forms.indexOf(index), 1);
    } else forms.push(index);
    this.setState({ openForms: forms });
  }

  render() {
    let craig = this.props.parentProps.craig;
    let isSecurityGroup =
      this.props.parentProps.form.jsonField === "security_groups";
    let form = isSecurityGroup
      ? {
          groups: [
            {
              name: craig.security_groups.rules.name,
              direction: craig.security_groups.rules.direction,
              source: craig.security_groups.rules.source,
            },
            {
              ruleProtocol: craig.security_groups.rules.ruleProtocol,
            },
            {
              port_min: craig.security_groups.rules.port_min,
              port_max: craig.security_groups.rules.port_max,
            },
            {
              type: craig.security_groups.rules.type,
              code: craig.security_groups.rules.code,
            },
          ],
        }
      : {
          groups: [
            {
              name: craig.vpcs.acls.rules.name,
              action: craig.vpcs.acls.rules.action,
              direction: craig.vpcs.acls.rules.direction,
            },
            {
              source: craig.vpcs.acls.rules.source,
              destination: craig.vpcs.acls.rules.destination,
              ruleProtocol: craig.vpcs.acls.rules.ruleProtocol,
            },
            {
              port_min: craig.vpcs.acls.rules.port_min,
              port_max: craig.vpcs.acls.rules.port_max,
            },
            {
              source_port_min: craig.vpcs.acls.rules.source_port_min,
              source_port_max: craig.vpcs.acls.rules.source_port_max,
            },
            {
              type: craig.vpcs.acls.rules.type,
              code: craig.vpcs.acls.rules.code,
            },
          ],
        };
    return !this.props.parentProps.isModal &&
      (this.props.parentProps.form.jsonField === "acls" ||
        this.props.parentProps.form.jsonField === "security_groups") ? (
      <>
        <DynamicFormModal
          name={
            isSecurityGroup
              ? "Create a Security Group Rule"
              : "Create an ACL Rule"
          }
          show={this.state.showModal}
          beginDisabled
          submissionFieldName={isSecurityGroup ? "sg_rules" : "acl_rules"}
          onRequestClose={this.handleModalToggle}
          onRequestSubmit={(stateData) => {
            let resource = isSecurityGroup
              ? craig.security_groups
              : craig.vpcs.acls;
            resource.rules.create(stateData, {
              parent_name: this.props.parentProps.data.name,
              vpc_name: this.props.parentProps.data.vpc,
            });
            this.handleModalToggle();
          }}
        >
          {RenderForm(DynamicForm, {
            craig: craig,
            data: {
              ruleProtocol: "",
              source: "",
            },
            rules: this.props.parentProps.data.rules,
            shouldDisableSubmit: function () {
              if (
                disableSave(
                  isSecurityGroup ? "sg_rules" : "acl_rules",
                  this.state,
                  this.props
                ) === false
              ) {
                this.props.enableModal();
              } else {
                this.props.disableModal();
              }
            },
            form: form,
          })}
        </DynamicFormModal>
        <div className="marginBottomSmall" />
        <CraigFormHeading
          name="Rules"
          className={
            this.state.displayMode === false &&
            this.props.parentProps.classicCraig
              ? ""
              : "marginBottomSmall"
          }
          type="subHeading"
          buttons={
            <>
              <PrimaryButton
                type="custom"
                onClick={() => {
                  this.setState({ displayMode: !this.state.displayMode });
                }}
                customIcon={this.state.showTable ? Edit : DataView}
                hoverText={this.state.showTable ? "Edit" : "Manage Rules"}
                className="edit-view-btn"
                hide={this.props.parentProps.data.rules.length < 0} // do not show edit if no rules
              />
              <PrimaryButton
                type="add"
                name={this.props.parentProps.data.vpc}
                onClick={this.handleModalToggle}
                noDeleteButton
              />
            </>
          }
        />
        {this.state.displayMode ? (
          <OrderCardDataTable
            key={JSON.stringify(this.props.parentProps.data.rules)}
            rules={this.props.parentProps.data.rules}
            vpc_name={this.props.parentProps.data.vpc}
            isSecurityGroup={isSecurityGroup}
          />
        ) : (
          [...this.props.parentProps.data.rules].map((rule, ruleIndex) => {
            if (!rule.ruleProtocol) {
              rule.ruleProtocol = getRuleProtocol(rule);
            }
            return (
              <CraigToggleForm
                key={JSON.stringify(rule)}
                onDelete={
                  isSecurityGroup
                    ? craig.security_groups.rules.delete
                    : craig.vpcs.acls.rules.delete
                }
                onSave={
                  isSecurityGroup
                    ? craig.security_groups.rules.save
                    : craig.vpcs.acls.rules.save
                }
                onShowToggle={() => {
                  this.openForm(ruleIndex);
                }}
                craig={craig}
                hide={!contains(this.state.openForms, ruleIndex)}
                hideName
                submissionFieldName={isSecurityGroup ? "sg_rules" : "acl_rules"}
                tabPanel={{
                  hideAbout: true,
                }}
                disableUp={ruleIndex === 0}
                handleUp={() => {
                  this.saveRuleOrder("up", ruleIndex);
                }}
                disableDown={
                  ruleIndex === this.props.parentProps.data.rules.length - 1
                }
                handleDown={() => {
                  this.saveRuleOrder("down", ruleIndex);
                }}
                name={rule.name}
                type={
                  this.props.parentProps.classicCraig
                    ? "subForm"
                    : "formInSubForm"
                }
                aclClassicCraig={this.props.parentProps.classicCraig}
                innerFormProps={{
                  craig: craig,
                  data: rule,
                  parent_name: this.props.parentProps.data.name,
                  form: form,
                  rules: this.props.parentProps.data.rules,
                }}
              />
            );
          })
        )}
      </>
    ) : (
      ""
    );
  }
}

export default NetworkingRuleOrderCard;
