import React from "react";
import { IcseSelect, IcseHeading } from "icse-react-assets";
import { isNullOrEmptyString, splat } from "lazy-z";
import { Replicate } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { PrimaryButton } from "../utils/ToggleFormComponents";
import { CraigFormGroup } from "../utils";

const AddClusterRules = (props) => {
  return (
    <>
      <IcseHeading
        type="subHeading"
        name="Add Cluster Rules"
        tooltip={{
          content:
            "Add rules to allow needed traffic for provisioning Red Hat OpenShift and IBM Kubernetes Service clusters.",
          link: "https://cloud.ibm.com/docs/openshift?topic=openshift-vpc-acls#acls_ui",
        }}
      />
      <CraigFormGroup className="align-row">
        <IcseSelect
          formName={"cluster-rules-acl-source-" + props.data.name}
          labelText="Target ACL"
          groups={(props.addClusterRuleAcl ? [""] : []).concat(
            splat(props.data.acls, "name")
          )}
          value={props.addClusterRuleAcl}
          handleInputChange={props.handleSelect}
          name="addClusterRuleAcl"
          className="fieldWidthSmaller"
          disableInvalid
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
