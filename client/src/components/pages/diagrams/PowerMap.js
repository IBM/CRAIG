import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { IbmPowerVs } from "@carbon/icons-react";
import PropTypes from "prop-types";

export const PowerMap = (props) => {
  let craig = props.craig;
  return craig.store.json.power.map((power, powerIndex) => {
    return (
      <div
        className="subForm"
        key={power.name + powerIndex}
        style={{
          marginBottom: "1rem",
          marginRight: "1rem",
          width: props.big ? "" : "580px",
          maxWidth: props.big ? "1775px" : "",
          boxShadow:
            props.isSelected && props.isSelected(powerIndex)
              ? " 0 10px 14px 0 rgba(0, 0, 0, 0.24),0 17px 50px 0 rgba(0, 0, 0, 0.19)"
              : "",
        }}
      >
        <CraigFormHeading
          name={power.name}
          icon={<IbmPowerVs className="diagramTitleIcon" />}
          type="subHeading"
          addText={<p style={{ marginLeft: "0.5rem" }}>[{power.zone}]</p>}
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
