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

const CopyAclRule = props => {
  return (
    <>
      <IcseHeading type="subHeading" name="Copy Rule to ACL" />
      <IcseFormGroup noMarginBottom className="align-row">
        <IcseSelect
          formName={"copy-rule-acl-source-" + props.data.name}
          labelText="Rule Source ACL"
          groups={splat(props.data.acls, "name")}
          value={props.ruleSourceAcl}
          handleInputChange={props.handleSelect}
          name="ruleSourceAcl"
          className="fieldWidthSmaller"
          disableInvalid
        />
        <IcseSelect
          formName={"copy-rule-rule-" + props.data.name}
          labelText="Rule to Copy"
          groups={
            isNullOrEmptyString(props.ruleSourceAcl) ? [] : props.allRuleNames
          }
          value={props.ruleCopyName}
          handleInputChange={props.handleSelect}
          name="ruleCopyName"
          className="fieldWidthSmaller"
          disableInvalid={
            isNullOrEmptyString(props.ruleSourceAcl) ||
            contains(props.destinationRuleNames, props.ruleCopyName)
          }
          invalid={contains(props.destinationRuleNames, props.ruleCopyName)}
          invalidText={
            contains(props.destinationRuleNames, props.ruleCopyName)
              ? `Duplicate rule name "${props.ruleCopyName}" in destination "${
                  props.ruleDestinationAcl
                }"`
              : "Select an ACL rule"
          }
        />
        <IcseSelect
          formName={"copy-rule-acl-destination-" + props.data.name}
          labelText="Destination ACL"
          groups={props.allOtherAcls}
          value={props.ruleDestintionAcl}
          handleInputChange={props.handleSelect}
          name="ruleDestintionAcl"
          className="fieldWidthSmaller"
          disableInvalid={isNullOrEmptyString(props.ruleSourceAcl)}
          invalidText="Select a destination ACL"
        />
        <div className="align-row">
          <SaveAddButton
            type="custom"
            customIcon={Replicate}
            onClick={() => {
              props.openModal("copyRule");
            }}
            disabled={
              isNullOrEmptyString(props.ruleSourceAcl) ||
              isNullOrEmptyString(props.ruleDestinationAcl) ||
              isNullOrEmptyString(props.ruleCopyName) ||
              contains(props.destinationRuleNames, props.ruleCopyName)
            }
            hoverText="Copy Rule"
          />
        </div>
      </IcseFormGroup>
    </>
  );
};

CopyAclRule.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    acls: PropTypes.arrayOf(PropTypes.shape({})).isRequired
  }),
  handleSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  ruleSourceAcl: PropTypes.string,
  ruleDestinationAcl: PropTypes.string,
  destinationRuleNames: PropTypes.arrayOf(PropTypes.string),
  ruleCopyName: PropTypes.string,
  allOtherAcls: PropTypes.arrayOf(PropTypes.string)
};

export default CopyAclRule;
