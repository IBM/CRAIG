import React from "react";
import "./code-mirror.css";
import PropTypes from "prop-types";
import { CopyButton } from "@carbon/react";
import { CarbonCodeMirror } from "carbon-react-code-mirror";

const CodeMirrorHeader = (props) => {
  return (
    <div className="tabPanel displayFlex spaceBetween">
      <div className="displayFlex gap">
        <button
          className={"tabButton" + (props.jsonInCodeMirror ? "" : " active")}
          onClick={() => props.onTabClick("Terraform")}
        >
          Terraform
        </button>
        <button
          className={"tabButton" + (props.jsonInCodeMirror ? " active" : "")}
          onClick={() => props.onTabClick("JSON")}
        >
          JSON
        </button>
      </div>
      <CopyButton
        className="copyButton"
        onClick={() => navigator.clipboard.writeText(props.code)}
        iconDescription="Copy"
      />
    </div>
  );
};

export const CraigCodeMirror = (props) => {
  return (
    props.hideCodeMirror !== true && (
      <CarbonCodeMirror
        light={props.light}
        wrapperClassName={props.className}
        code={props.code}
      >
        {!props.light && (
          <CodeMirrorHeader
            jsonInCodeMirror={props.jsonInCodeMirror}
            onTabClick={props.onTabClick}
            code={props.code}
          />
        )}
      </CarbonCodeMirror>
    )
  );
};

// Header PropTypes
CodeMirrorHeader.propTypes = {
  jsonInCodeMirror: PropTypes.bool.isRequired,
  onTabClick: PropTypes.func.isRequired,
};

// CodeMirror Props
CraigCodeMirror.defaultProps = {
  code: "",
  className: "rightPanelWidth",
};

CraigCodeMirror.propTypes = {
  hideCodeMirror: PropTypes.bool.isRequired,
  className: PropTypes.string,
  code: PropTypes.string.isRequired,
  jsonInCodeMirror: PropTypes.bool.isRequired,
  onTabClick: PropTypes.func.isRequired,
};
