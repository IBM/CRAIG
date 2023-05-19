import React from "react";
import { CraigCodeMirror } from "../../page-template/CodeMirror";
import PropTypes from "prop-types";
import { copyAclModalContent } from "../../../lib";

const CopyAclModalContent = props => {
  return (
    <>
      <p className="marginBottomSmall">
        Copy ACL <strong>{props.sourceAcl}</strong> to VPC{" "}
        <strong>{props.destinationVpc}</strong>?
      </p>
      <CraigCodeMirror
        light
        className="regular"
        code={copyAclModalContent(props)}
      />
    </>
  );
};

CopyAclModalContent.propTypes = {
  sourceAcl: PropTypes.string.isRequired,
  destinationVpc: PropTypes.string.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        vpcs: PropTypes.arrayOf(PropTypes.shape({})).isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default CopyAclModalContent;
