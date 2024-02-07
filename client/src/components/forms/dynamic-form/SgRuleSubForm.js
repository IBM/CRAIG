import React from "react";
import { disableSave, propsMatchState } from "../../../lib";
import { NetworkingRulesOrderCard } from "icse-react-assets";
import CopyRuleForm from "../CopyRuleForm";

export const SgRulesSubForm = (props) => {
  return !props.parentProps.isModal &&
    props.parentProps.form.jsonField === "security_groups" ? (
    <>
      <div className="marginBottomSmall" />
      <NetworkingRulesOrderCard
        rules={props.parentProps.data.rules}
        vpc_name={props.parentProps.data.vpc}
        parent_name={props.parentProps.data.name}
        onRuleSave={props.parentProps.craig.security_groups.rules.save}
        onRuleDelete={props.parentProps.craig.security_groups.rules.delete}
        isSecurityGroup
        invalidRuleTextCallback={
          props.parentProps.craig.security_groups.rules.name.invalidText
        }
        invalidRuleText={
          props.parentProps.craig.security_groups.rules.name.invalid
        }
        craig={props.parentProps.craig}
        disableSaveCallback={function (stateData, componentProps) {
          return (
            disableSave("sg_rules", stateData, componentProps) ||
            propsMatchState("sg_rules", stateData, componentProps)
          );
        }}
        onSubmitCallback={props.parentProps.craig.security_groups.rules.create}
        // unused props naming convention is wonky
        networkRuleOrderDidChange={() => {}}
        invalidCallback={() => {}}
        disableModalSubmitCallback={() => {}}
        invalidTextCallback={() => {}}
      />
      <div className="marginBottomSmall" />
      <CopyRuleForm
        craig={props.parentProps.craig}
        sourceSg={props.parentState.name}
        isAclForm={false}
        v2={true}
      />
    </>
  ) : (
    ""
  );
};
