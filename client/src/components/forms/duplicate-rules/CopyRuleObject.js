import React from "react";
import {
  SaveAddButton,
  IcseFormGroup,
  IcseSelect,
  IcseHeading
} from "icse-react-assets";
import {
  getObjectFromArray,
  isNullOrEmptyString,
  splat,
  splatContains
} from "lazy-z";
import { Replicate } from "@carbon/icons-react";
import PropTypes from "prop-types";

const CopyRuleObject = props => {
  return (
    <>
      <IcseHeading
        type="subHeading"
        name={
          props.isSecurityGroup
            ? "Copy Security Group to VPC"
            : "Copy ACL to VPC"
        }
      />
      <IcseFormGroup className="align-row">
        <IcseSelect
          formName={
            props.isSecurityGroup
              ? "copy-security-group-source"
              : "copy-acl-source-" + props.data.name
          }
          labelText={
            props.isSecurityGroup ? "Source Security Group" : "Source ACL"
          }
          groups={(props.source ? [""] : []).concat(
            props.isSecurityGroup
              ? splat(props.craig.store.json.security_groups, "name")
              : splat(props.data.acls, "name")
          )}
          value={props.source}
          handleInputChange={props.handleSelect}
          name="source"
          className="fieldWidthSmaller"
          disableInvalid={isNullOrEmptyString(props.destinationVpc)}
          invalidText={
            props.isSecurityGroup
              ? "Select a source Security Group"
              : "Select a source ACL"
          }
        />
        <IcseSelect
          formName={
            props.isSecurityGroup
              ? "copy-security-group-destination"
              : "copy-acl-destination-" + props.data.name
          }
          labelText="Destination VPC"
          groups={(props.destinationVpc ? [""] : []).concat(
            props.isSecurityGroup
              ? splat(props.craig.store.json.vpcs, "name")
              : splat(props.craig.store.json.vpcs, "name").filter(vpc => {
                  if (vpc !== props.data.name) return vpc;
                })
          )}
          value={props.destinationVpc}
          handleInputChange={props.handleSelect}
          name="destinationVpc"
          className="fieldWidthSmaller"
          disableInvalid={isNullOrEmptyString(props.source)}
          invalidText="Select a destination VPC"
        />
        <div className="align-row">
          <SaveAddButton
            type="custom"
            customIcon={Replicate}
            onClick={() => {
              props.openModal("copyAcl");
            }}
            disabled={
              isNullOrEmptyString(props.source) ||
              isNullOrEmptyString(props.destinationVpc) ||
              props.hoverText.indexOf("Duplicate") === 0
            }
            hoverText={props.hoverText}
          />
        </div>
      </IcseFormGroup>
    </>
  );
};

CopyRuleObject.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    acls: PropTypes.arrayOf(PropTypes.shape({})).isRequired
  }),
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        vpcs: PropTypes.arrayOf(PropTypes.shape({})).isRequired
      }).isRequired
    }).isRequired
  }).isRequired,
  handleSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  source: PropTypes.string,
  destinationVpc: PropTypes.string,
  hoverText: PropTypes.string.isRequired
};

export default CopyRuleObject;
