import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { javascript } from "@codemirror/lang-javascript";
import { tags as t } from "@lezer/highlight";
import "./code-mirror.css";
import PropTypes from "prop-types";
import { CopyButton } from "@carbon/react";

const codeMirrorDark = createTheme({
  theme: "dark",
  settings: {
    background: "#262626",
    foreground: "#c6c6c6",
    caret: "#fffffff",
    selection: "#036dd626",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBackground: "#262626",
    gutterForeground: "#fffffff"
  },
  styles: [
    { tag: [t.standard(t.tagName), t.tagName], color: "#7ee787" },
    { tag: [t.comment, t.bracket], color: "#8b949e" },
    { tag: [t.className, t.propertyName], color: "#d2a8ff" },
    {
      tag: [t.variableName, t.attributeName, t.number, t.operator],
      color: "#79c0ff"
    },
    {
      tag: [t.keyword, t.typeName, t.typeOperator, t.typeName],
      color: "#ff7b72"
    },
    { tag: [t.string, t.meta, t.regexp], color: "#a5d6ff" },
    { tag: [t.name, t.quote], color: "#7ee787" },
    { tag: [t.heading], color: "#d2a8ff", fontWeight: "bold" },
    { tag: [t.emphasis], color: "#d2a8ff", fontStyle: "italic" },
    { tag: [t.deleted], color: "#ffdcd7", backgroundColor: "ffeef0" },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#ffab70" },
    { tag: t.link, textDecoration: "underline" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.invalid, color: "#f97583" }
  ]
});

const CodeMirrorHeader = props => {
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

export const CraigCodeMirror = props => {
  return (
    props.hideCodeMirror !== true && (
      <div className={props.className}>
        <CodeMirror
          className="label"
          readOnly={true}
          value={props.code}
          extensions={[javascript({ jsx: true })]}
          theme={codeMirrorDark}
        >
          <CodeMirrorHeader
            jsonInCodeMirror={props.jsonInCodeMirror}
            onTabClick={props.onTabClick}
            code={props.code}
          />
        </CodeMirror>
      </div>
    )
  );
};

// Header PropTypes
CodeMirrorHeader.propTypes = {
  jsonInCodeMirror: PropTypes.bool.isRequired,
  onTabClick: PropTypes.func.isRequired
};

// CodeMirror Props
CraigCodeMirror.defaultProps = {
  code: "",
  className: "rightPanelWidth"
};

CraigCodeMirror.propTypes = {
  hideCodeMirror: PropTypes.bool.isRequired,
  className: PropTypes.string,
  code: PropTypes.string.isRequired,
  jsonInCodeMirror: PropTypes.bool.isRequired,
  onTabClick: PropTypes.func.isRequired
};
