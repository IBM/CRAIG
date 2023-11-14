import React from "react";
import { CraigCodeMirror } from "../../page-template/CodeMirror";
import PropTypes from "prop-types";
import { copySgModalContent } from "../../../lib";

const CopySgModalContent = (props) => {
  return (
    <>
      <p className="marginBottomSmall">
        Copy Security Group <strong>{props.source}</strong> to VPC{" "}
        <strong>{props.destinationVpc}</strong>?
      </p>
      <CraigCodeMirror
        light
        className="regular"
        code={copySgModalContent(props)}
      />
    </>
  );
};

CopySgModalContent.propTypes = {
  source: PropTypes.string.isRequired,
  destinationVpc: PropTypes.string.isRequired,
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        vpcs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default CopySgModalContent;
