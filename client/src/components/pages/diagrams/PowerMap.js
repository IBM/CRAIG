import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { IbmPowerVs } from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";

export const PowerMap = (props) => {
  let craig = props.craig;
  return craig.store.json.power.map((power, powerIndex) => {
    let powerSubFormClassName = "subForm powerSubForm";
    if (props.isSelected && props.isSelected(powerIndex)) {
      powerSubFormClassName += " diagramBoxSelected";
    }
    if (props.big) powerSubFormClassName += " powerSubFormBig";
    return (
      <div className={powerSubFormClassName} key={power.name + powerIndex}>
        <CraigFormHeading
          name={power.name}
          icon={<IbmPowerVs className="diagramTitleIcon" />}
          type="subHeading"
          addText={<p className="marginLeftHalfRem">[{power.zone}]</p>}
          onClick={props.onClick ? () => props.onClick(powerIndex) : undefined}
          buttons={props.buttons ? props.buttons(powerIndex) : undefined}
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
