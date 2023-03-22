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

const CopyAcl = props => {
  return (
    <>
      <IcseHeading type="subHeading" name="Copy ACL to VPC" />
      <IcseFormGroup className="align-row">
        <IcseSelect
          formName={"copy-acl-source-" + props.data.name}
          labelText="Source ACL"
          groups={(props.sourceAcl ? [""] : []).concat(
            splat(props.data.acls, "name")
          )}
          value={props.sourceAcl}
          handleInputChange={props.handleSelect}
          name="sourceAcl"
          className="fieldWidthSmaller"
          disableInvalid={isNullOrEmptyString(props.destinationVpc)}
          invalidText="Select a source ACL"
        />
        <IcseSelect
          formName={"copy-acl-destination-" + props.data.name}
          labelText="Destination VPC"
          groups={(props.destinationVpc ? [""] : []).concat(
            splat(props.craig.store.json.vpcs, "name").filter(vpc => {
              if (vpc !== props.data.name) return vpc;
            })
          )}
          value={props.destinationVpc}
          handleInputChange={props.handleSelect}
          name="destinationVpc"
          className="fieldWidthSmaller"
          disableInvalid={isNullOrEmptyString(props.sourceAcl)}
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
              isNullOrEmptyString(props.sourceAcl) ||
              isNullOrEmptyString(props.destinationVpc) ||
              splatContains(
                getObjectFromArray(
                  props.craig.store.json.vpcs,
                  "name",
                  props.destinationVpc
                ).acls,
                "name",
                props.sourceAcl + "-copy"
              )
            }
            hoverText={props.hoverText}
          />
        </div>
      </IcseFormGroup>
    </>
  );
};

CopyAcl.propTypes = {
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
  sourceAcl: PropTypes.string,
  destinationVpc: PropTypes.string,
  hoverText: PropTypes.string.isRequired
};

export default CopyAcl;
