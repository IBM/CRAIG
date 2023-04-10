import React from "react";
import {
  SaveAddButton,
  IcseFormGroup,
  IcseSelect,
  IcseHeading
} from "icse-react-assets";
import { isNullOrEmptyString, splat, contains } from "lazy-z";
import { Replicate } from "@carbon/icons-react";
import PropTypes from "prop-types";

const CopyRule = props => {
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
      <IcseHeading type="subHeading" name={"Copy Rule to " + ruleType} />
      <IcseFormGroup noMarginBottom className="align-row">
        <IcseSelect
          formName={getFormName("source")}
          labelText={"Rule Source " + ruleType}
          groups={
            props.isSecurityGroup
              ? splat(props.craig.store.json.security_groups, "name")
              : splat(props.data.acls, "name")
          }
          value={props.ruleSource}
          handleInputChange={props.handleSelect}
          name="ruleSource"
          className="fieldWidthSmaller"
          disableInvalid
        />
        <IcseSelect
          formName={getFormName("rule")}
          labelText="Rule to Copy"
          groups={
            isNullOrEmptyString(props.ruleSource) ? [] : props.allRuleNames
          }
          value={props.ruleCopyName}
          handleInputChange={props.handleSelect}
          name="ruleCopyName"
          className="fieldWidthSmaller"
          disableInvalid={
            isNullOrEmptyString(props.ruleSource) ||
            contains(props.destinationRuleNames, props.ruleCopyName)
          }
          invalid={contains(props.destinationRuleNames, props.ruleCopyName)}
          invalidText={
            contains(props.destinationRuleNames, props.ruleCopyName)
              ? `Duplicate rule name "${props.ruleCopyName}" in destination "${props.ruleDestination}"`
              : "Select a rule"
          }
        />
        <IcseSelect
          formName={getFormName("destination")}
          labelText={"Destination " + ruleType}
          groups={props.allOtherAcls}
          value={props.ruleDestination}
          handleInputChange={props.handleSelect}
          name="ruleDestination"
          className="fieldWidthSmaller"
          disableInvalid={isNullOrEmptyString(props.ruleSource)}
          invalidText="Select a destination"
        />
        <div className="align-row">
          <SaveAddButton
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
      </IcseFormGroup>
    </>
  );
};

CopyRule.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    acls: PropTypes.arrayOf(PropTypes.shape({})).isRequired
  }),
  handleSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  ruleSource: PropTypes.string,
  ruleDestination: PropTypes.string,
  destinationRuleNames: PropTypes.arrayOf(PropTypes.string),
  ruleCopyName: PropTypes.string,
  allOtherAcls: PropTypes.arrayOf(PropTypes.string)
};

export default CopyRule;
