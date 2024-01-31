import React from "react";
import { Button, TextArea } from "@carbon/react";
import { DownloadCopyButtonSet } from "./downloadCopyButtons/DownloadCopyButtonSet";
import { Locked, TextWrap, Unlocked } from "@carbon/icons-react";

export const JSONTextArea = (props) => {
  let label = props.big
    ? ""
    : props.override
    ? "Override JSON"
    : props.readOnly
    ? "Preview JSON"
    : "Custom JSON";

  return (
    <div
      className="textAreaWithButtons"
      style={{ height: "60vh", overflowY: "scroll" }}
    >
      {!props.import && (
        <div className={"textAreaButtons"}>
          <DownloadCopyButtonSet
            projectName={props.projectName}
            json={props.json}
            disabled={props.invalid}
            iconOnly
          />
        </div>
      )}
      <TextArea
        id="import-json"
        className="rightTextAlign codeFont textArea marginBottomSmall"
        labelText={label}
        placeholder="{ ... }"
        rows={15}
        value={props.value}
        readOnly={props.readOnly}
        invalid={props.invalid}
        invalidText={props.invalidText}
        onChange={props.onChange}
      />
    </div>
  );
};
