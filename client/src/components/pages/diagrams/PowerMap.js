import React from "react";
import { CraigFormHeading } from "../../forms/utils";
import { IbmPowerVs } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";
import HoverClassNameWrapper from "./HoverClassNameWrapper";
import { disableSave } from "../../../lib";
import { splatContains } from "lazy-z";

export const PowerMap = (props) => {
  let craig = props.craig;
  let nullPowerWorkspaceResource = false;
  ["power_instances", "power_volumes", "vtl"].forEach((field) => {
    if (
      !nullPowerWorkspaceResource &&
      splatContains(craig.store.json[field], "workspace", null)
    ) {
      nullPowerWorkspaceResource = true;
    }
  });
  return (nullPowerWorkspaceResource ? [{ name: null }] : [])
    .concat(craig.store.json.power)
    .map((power, powerIndex) => {
      let actualPowerIndex = nullPowerWorkspaceResource
        ? powerIndex - 1
        : powerIndex;
      let powerSubFormClassName = "subForm powerSubForm";
      let isRed = false;
      if (props.isSelected && props.isSelected(actualPowerIndex)) {
        powerSubFormClassName += " diagramBoxSelected";
      }
      if (props.big) powerSubFormClassName += " powerSubFormBig";
      if (disableSave("power", power, { data: power, craig: craig })) {
        isRed = true;
      }
      return (
        <HoverClassNameWrapper
          className={powerSubFormClassName}
          key={power.name + actualPowerIndex}
          static={props.static}
          hoverClassName="diagramBoxSelected"
        >
          <CraigFormHeading
            name={power.name === null ? "No Workspace Selected" : power.name}
            icon={<IbmPowerVs className="diagramTitleIcon" />}
            type="subHeading"
            addText={
              power.name === null ? (
                ""
              ) : (
                <>
                  <p className="marginLeftHalfRem">[{power.zone}]</p>
                  {power.use_data ? (
                    <p className="marginLeftHalfRem">[Imported]</p>
                  ) : (
                    ""
                  )}
                </>
              )
            }
            onClick={
              props.onClick && !(nullPowerWorkspaceResource && powerIndex === 0)
                ? () => props.onClick(actualPowerIndex)
                : undefined
            }
            buttons={
              props.buttons && !(nullPowerWorkspaceResource && powerIndex === 0)
                ? props.buttons(actualPowerIndex)
                : undefined
            }
            isRed={isRed}
            className="marginBottomSmall"
          />
          {React.Children.map(props.children, (child) =>
            // clone react child
            React.cloneElement(child, {
              power: power,
              powerIndex: actualPowerIndex,
            })
          )}
        </HoverClassNameWrapper>
      );
    });
};

PowerMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  big: PropTypes.bool,
  isSelected: PropTypes.func,
};
