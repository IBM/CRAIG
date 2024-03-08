import React from "react";
import { isNullOrEmptyString, splat } from "lazy-z";
import { Replicate } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { CraigFormGroup, CraigFormHeading, PrimaryButton } from "../utils";
import { DynamicFormSelect } from "../dynamic-form";

const CopyRuleObject = (props) => {
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
        name={
          props.isSecurityGroup
            ? "Copy Security Group to VPC"
            : "Copy ACL to VPC"
        }
        tooltip={{
          content: props.isSecurityGroup
            ? "Copy Security Group from one VPC to another"
            : "Copy ACL from one VPC to another",
        }}
      />
      <CraigFormGroup className="align-row">
        <DynamicFormSelect
          name="source"
          propsName={getFormName("source")}
          keyIndex={0}
          value={props.source}
          field={{
            labelText: props.isSecurityGroup
              ? "Source Security Group"
              : "Source ACL",
            className: "fieldWidthSmaller",
            groups: (props.source ? [""] : []).concat(
              props.isSecurityGroup
                ? splat(
                    props.craig.store.json.security_groups.filter((sg) => {
                      if (!sg.use_data) return sg;
                    }),
                    "name"
                  )
                : splat(
                    props.data.acls.filter((acl) => {
                      if (!acl.use_data) return acl;
                    }),
                    "name"
                  )
            ),
            disabled: (stateData) => {
              return stateData.v2;
            },
            invalid: (stateData) => {
              return (
                !isNullOrEmptyString(stateData.destinationVpc) &&
                isNullOrEmptyString(stateData.source)
              );
            },
            invalidText: (stateData) => {
              return stateData.isSecurityGroup
                ? "Select a source Security Group"
                : "Select a source ACL";
            },
          }}
          parentProps={props}
          parentState={props}
          handleInputChange={props.handleSelect}
        />
        <DynamicFormSelect
          name="destinationVpc"
          propsName={getFormName("destination")}
          keyIndex={0}
          value={props.destinationVpc}
          field={{
            labelText: "Destination VPC",
            className: "fieldWidthSmaller",
            groups: (props.destinationVpc ? [""] : []).concat(
              splat(props.craig.store.json.vpcs, "name").filter((vpc) => {
                if (props.isSecurityGroup) {
                  return vpc;
                } else if (vpc !== props.data.name) return vpc;
              })
            ),
            disabled: (stateData) => {
              return false;
            },
            invalid: (stateData) => {
              return (
                !isNullOrEmptyString(stateData.source) &&
                isNullOrEmptyString(stateData.destinationVpc)
              );
            },
            invalidText: () => {
              return "Select a destination VPC";
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
      </CraigFormGroup>
    </>
  );
};

CopyRuleObject.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    acls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }),
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        vpcs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  handleSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  source: PropTypes.string,
  destinationVpc: PropTypes.string,
  hoverText: PropTypes.string.isRequired,
};

export default CopyRuleObject;
