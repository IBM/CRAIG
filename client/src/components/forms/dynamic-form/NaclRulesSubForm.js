import React from "react";
import { disableSave, propsMatchState } from "../../../lib";
import { NetworkingRulesOrderCard } from "icse-react-assets";

export const NaclRulesSubForm = (props) => {
  return !props.parentProps.isModal &&
    props.parentProps.form.jsonField === "acls" ? (
    <>
      <div className="marginBottomSmall" />
      <NetworkingRulesOrderCard
        rules={props.parentProps.data.rules}
        vpc_name={props.parentProps.data.vpc}
        parent_name={props.parentProps.data.name}
        onRuleSave={props.parentProps.craig.vpcs.acls.rules.save}
        onRuleDelete={props.parentProps.craig.vpcs.acls.rules.delete}
        isAclForm
        invalidRuleTextCallback={
          props.parentProps.craig.vpcs.acls.rules.name.invalidText
        }
        invalidRuleText={props.parentProps.craig.vpcs.acls.rules.name.invalid}
        craig={props.parentProps.craig}
        disableSaveCallback={function (stateData, componentProps) {
          return (
            disableSave("acl_rules", stateData, componentProps) ||
            propsMatchState("acl_rules", stateData, componentProps)
          );
        }}
        onSubmitCallback={props.parentProps.craig.vpcs.acls.rules.create}
        // unused props naming convention is wonky
        networkRuleOrderDidChange={() => {}}
        invalidCallback={() => {}}
        disableModalSubmitCallback={() => {}}
        invalidTextCallback={() => {}}
      />
    </>
  ) : (
    ""
  );
};
