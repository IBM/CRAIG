import React from "react";
import { isNullOrEmptyString, splat } from "lazy-z";
import { Replicate } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { CraigFormHeading, CraigFormGroup, PrimaryButton } from "../utils";
import { DynamicFormSelect } from "../dynamic-form";

const AddClusterRules = (props) => {
  return (
    <>
      <CraigFormHeading
        type="subHeading"
        name="Add Cluster Rules"
        tooltip={{
          content:
            "Add rules to allow needed traffic for provisioning Red Hat OpenShift and IBM Kubernetes Service clusters.",
          link: "https://cloud.ibm.com/docs/openshift?topic=openshift-vpc-acls#acls_ui",
        }}
      />
      <CraigFormGroup className="align-row">
        <DynamicFormSelect
          name="addClusterRuleAcl"
          propsName="cluster-rules-acl-source"
          keyIndex={0}
          value={props.addClusterRuleAcl}
          field={{
            labelText: "Target ACL",
            className: "fieldWidthSmaller",
            groups: (props.addClusterRuleAcl ? [""] : []).concat(
              splat(props.data.acls, "name"),
            ),
            disabled: (stateData) => {
              return stateData.v2;
            },
            invalid: (stateData) => {
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
        <div className="align-row">
          <PrimaryButton
            type="custom"
            customIcon={Replicate}
            onClick={() => {
              props.openModal("addClusterRules");
            }}
            disabled={isNullOrEmptyString(props.addClusterRuleAcl)}
            hoverText="Add Cluster Rules"
          />
        </div>
      </CraigFormGroup>
    </>
  );
};

AddClusterRules.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    acls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }),
  handleSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  addClusterRuleAcl: PropTypes.string,
};

export default AddClusterRules;
