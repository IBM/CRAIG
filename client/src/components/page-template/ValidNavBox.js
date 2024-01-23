import React from "react";
import { HeaderGlobalAction } from "@carbon/react";
import { invalidForms } from "../../lib";
import { CheckmarkFilled, CloseFilled } from "@carbon/icons-react";

export const ValidNavBox = (props) => {
  // by using a stateless component here we force component to check for validation
  // each time a change is made
  let isValid = invalidForms({ store: { json: props.json } }).length === 0;
  return props.isResetState === true ? (
    ""
  ) : (
    <HeaderGlobalAction
      key={JSON.stringify(props.json)}
      onClick={props.onClick}
      aria-label={
        isValid
          ? "Configuration is valid and ready to download"
          : "Your configuration contains errors and cannot be downloaded. Review invalid resources highlighted in red."
      }
      isActive
      tooltipAlignment="end"
    >
      {isValid ? (
        <CheckmarkFilled style={{ fill: "green" }} />
      ) : (
        <CloseFilled style={{ fill: "red" }} />
      )}
    </HeaderGlobalAction>
  );
};
