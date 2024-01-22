import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { IbmPowerVs } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";
import { isNullOrEmptyString } from "lazy-z";

export const PowerMap = (props) => {
  let craig = props.craig;
  return craig.store.json.power.map((power, powerIndex) => {
    let powerSubFormClassName = "subForm powerSubForm";
    let isRed = false;
    if (props.isSelected && props.isSelected(powerIndex)) {
      powerSubFormClassName += " diagramBoxSelected";
    }
    if (props.big) powerSubFormClassName += " powerSubFormBig";
    if (isNullOrEmptyString(power.resource_group, true) && !power.use_data) {
      isRed = true;
    }
    return (
      <div className={powerSubFormClassName} key={power.name + powerIndex}>
        <CraigFormHeading
          name={power.name}
          icon={<IbmPowerVs className="diagramTitleIcon" />}
          type="subHeading"
          addText={
            <>
              <p className="marginLeftHalfRem">[{power.zone}]</p>
              {power.use_data ? (
                <p className="marginLeftHalfRem">[Imported]</p>
              ) : (
                ""
              )}
            </>
          }
          onClick={props.onClick ? () => props.onClick(powerIndex) : undefined}
          buttons={props.buttons ? props.buttons(powerIndex) : undefined}
          isRed={isRed}
          className="marginBottomSmall"
        />
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            power: power,
            powerIndex: powerIndex,
          })
        )}
      </div>
    );
  });
};

PowerMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  big: PropTypes.bool,
  isSelected: PropTypes.func,
};
