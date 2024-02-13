import React from "react";
import { DynamicFormSelect } from "../dynamic-form";
import { isNullOrEmptyString, splat, contains } from "lazy-z";
import { Replicate } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { CraigFormHeading, CraigFormGroup, PrimaryButton } from "../utils";

const CopyRule = (props) => {
  let ruleType = props.isSecurityGroup ? "Security Group" : "ACL";

  /**
   * get form name for icse props
   * @param {string} field name of field
   * @returns {string} form name string
   */
  function getFormName(field) {
    return `copy-rule-${props.isSecurityGroup ? "sg" : "acl"}-${field}${
      props.isSecurityGroup ? "" : "-" + props.data.name
    }`;
  }

  return (
    <>
      <CraigFormHeading
        type="subHeading"
        name={"Copy Rule to " + ruleType}
        tooltip={{
          content: "Copy a rule from one " + ruleType + " to another",
        }}
      />
      <CraigFormGroup noMarginBottom className="align-row">
        <DynamicFormSelect
          name="ruleSource"
          propsName={getFormName("source")}
          keyIndex={0}
          value={props.ruleSource}
          field={{
            labelText: "Rule Source " + ruleType,
            className:
              props.v2 && props.isSecurityGroup
                ? "fieldWidthCopyRule"
                : "fieldWidthSmaller",
            groups: props.isSecurityGroup
              ? splat(props.craig.store.json.security_groups, "name")
              : splat(props.data.acls, "name"),
            disabled: () => {
              return props.v2;
            },
            invalid: () => {
              return false;
            },
            invalidText: () => {
              return "";
            },
          }}
          parentProps={props}
          parentState={props}
          handleInputChange={props.handleSelect}
        />
        <DynamicFormSelect
          name="ruleCopyName"
          propsName={getFormName("rule")}
          keyIndex={0}
          value={props.ruleCopyName}
          field={{
            labelText: "Rule to Copy",
            className: "fieldWidthSmaller",
            groups: isNullOrEmptyString(props.ruleSource)
              ? []
              : props.allRuleNames,
            disabled: (stateData) => {
              return false;
            },
            invalid: (stateData) => {
              return (
                !isNullOrEmptyString(stateData.ruleSource) &&
                (contains(
                  stateData.destinationRuleNames,
                  stateData.ruleCopyName
                ) ||
                  isNullOrEmptyString(stateData.ruleCopyName))
              );
            },
            invalidText: (stateData) => {
              return contains(
                stateData.destinationRuleNames,
                stateData.ruleCopyName
              )
                ? `Duplicate rule name "${stateData.ruleCopyName}" in destination "${stateData.ruleDestination}"`
                : "Select a rule";
            },
          }}
          parentProps={props}
          parentState={props}
          handleInputChange={props.handleSelect}
        />
        <DynamicFormSelect
          name="ruleDestination"
          propsName={getFormName("destination")}
          keyIndex={0}
          value={props.ruleDestination}
          field={{
            labelText: "Destination " + ruleType,
            className: "fieldWidthSmaller",
            groups: props.allOtherAcls,
            disabled: (stateData) => {
              return false;
            },
            invalid: (stateData) => {
              return (
                !isNullOrEmptyString(stateData.ruleSource) &&
                isNullOrEmptyString(stateData.ruleDestination)
              );
            },
            invalidText: () => {
              return "Select a destination";
            },
          }}
          parentProps={props}
          parentState={props}
          handleInputChange={props.handleSelect}
        />
        <div className="align-row">
          <PrimaryButton
            type="custom"
            customIcon={Replicate}
            onClick={() => {
              props.openModal("copyRule");
            }}
            disabled={
              isNullOrEmptyString(props.ruleSource) ||
              isNullOrEmptyString(props.ruleDestination) ||
              isNullOrEmptyString(props.ruleCopyName) ||
              contains(props.destinationRuleNames, props.ruleCopyName)
            }
            hoverText={
              contains(props.destinationRuleNames, props.ruleCopyName)
                ? `Duplicate rule name`
                : "Copy Rule"
            }
          />
        </div>
      </CraigFormGroup>
    </>
  );
};

CopyRule.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    acls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }),
  handleSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  ruleSource: PropTypes.string,
  ruleDestination: PropTypes.string,
  destinationRuleNames: PropTypes.arrayOf(PropTypes.string),
  ruleCopyName: PropTypes.string,
  allOtherAcls: PropTypes.arrayOf(PropTypes.string),
};

export default CopyRule;
