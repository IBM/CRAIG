import React from "react";
import {
  SaveAddButton,
  IcseFormGroup,
  IcseSelect,
  IcseHeading
} from "icse-react-assets";
import { isNullOrEmptyString, splat } from "lazy-z";
import { Replicate } from "@carbon/icons-react";
import PropTypes from "prop-types";

const AddClusterRules = props => {
  return (
    <>
      <IcseHeading type="subHeading" name="Add Cluster Rules" />
      <IcseFormGroup className="align-row">
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
          <SaveAddButton
            type="custom"
            customIcon={Replicate}
            onClick={() => {
              props.openModal("addClusterRules");
            }}
            disabled={isNullOrEmptyString(props.addClusterRuleAcl)}
            hoverText="Add Cluster Rules"
          />
        </div>
      </IcseFormGroup>
    </>
  );
};

AddClusterRules.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    acls: PropTypes.arrayOf(PropTypes.shape({})).isRequired
  }),
  handleSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  addClusterRuleAcl: PropTypes.string
};

export default AddClusterRules;
