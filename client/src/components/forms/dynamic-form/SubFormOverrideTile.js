import React from "react";
import PropTypes from "prop-types";
import { CraigEmptyResourceTile, NoDomainsTile } from "./tiles";

export const SubFormOverrideTile = (props) => {
  let jsonField = props.subForm.jsonField;
  return jsonField === "dns_records" &&
    props.componentProps.data.domains.length === 0 ? (
    <NoDomainsTile />
  ) : (
    // have to pass in tile here otherwise will not render
    <CraigEmptyResourceTile
      name={props.subForm.name}
      className={props.isMiddleForm ? "marginTop1Rem" : ""}
    />
  );
};

SubFormOverrideTile.propTypes = {
  subForm: PropTypes.shape({
    jsonField: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  componentProps: PropTypes.shape({
    craig: PropTypes.shape({}).isRequired,
    data: PropTypes.shape({}).isRequired,
  }).isRequired,
};
