import { Rocket } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import React from "react";
import { disableSave } from "../../../lib";

export const OptionsButton = (props) => {
  return props.parentProps.formName === "options" ? (
    <Button
      disabled={disableSave("options", props.parentState, props.parentProps)}
      className="marginTop"
      onClick={() => {
        window.location.pathname = "/form/resourceGroups";
      }}
    >
      Begin Customizing <Rocket className="rocketIcon" />
    </Button>
  ) : (
    ""
  );
};
