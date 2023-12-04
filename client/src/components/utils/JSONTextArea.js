import React from "react";
import { Button, TextArea } from "@carbon/react";
import { ToolTipWrapper } from "icse-react-assets";
import { DownloadCopyButtonSet } from "./downloadCopyButtons/DownloadCopyButtonSet";
import { Locked, TextWrap, Unlocked } from "@carbon/icons-react";

export const JSONTextArea = (props) => {
  let label = props.override
    ? "Override JSON"
    : props.readOnly
    ? "Preview JSON"
    : "Custom JSON";

  return (
    <div className="textAreaWithButtons">
      {!props.import && (
        <div className={"textAreaButtons"}>
          <DownloadCopyButtonSet
            projectName={props.projectName}
            json={props.json}
            disabled={props.invalid}
            iconOnly
          />
          <Button
            kind="tertiary"
            className={props.noEditButton ? "" : "marginRightMed"}
            onClick={props.onClickWrapJSON}
            renderIcon={TextWrap}
            iconDescription={props.wrapped ? "Wrap JSON" : "Unwrap JSON"}
            hasIconOnly
          />
          {!props.noEditButton && (
            <Button
              kind="tertiary"
              onClick={props.onEditJSONClick}
              renderIcon={props.readOnly ? Locked : Unlocked}
              iconDescription={props.readOnly ? "Unlock JSON" : "Lock JSON"}
              disabled={props.readOnly ? false : props.invalid}
              hasIconOnly
            />
          )}
        </div>
      )}
      <ToolTipWrapper
        id="import-json"
        labelText={label}
        tooltip={{
          align: "bottom-left",
          content:
            "More information on the JSON Schema can be found in the following link.",
          link: props.link || "/docs/json",
        }}
      >
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
      </ToolTipWrapper>
    </div>
  );
};
