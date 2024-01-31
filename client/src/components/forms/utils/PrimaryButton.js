import React from "react";
import PropTypes from "prop-types";
import { dynamicPrimaryButtonProps } from "../../../lib/components/toggle-form-components";
import PopoverWrapper from "./PopoverWrapper";
import { Button } from "@carbon/react";
import { Add, Save } from "@carbon/icons-react";

/**
 * generate save icon
 * @param {object} props
 * @param {boolean} props.saveIsDisabled true if disabled
 * @returns Save Icon
 */
const SaveIcon = (props) => {
  return <Save className={props.disabled ? "" : "tertiaryButtonColors"} />;
};

SaveIcon.defaultProps = {
  disabled: false,
};

SaveIcon.propTypes = {
  disabled: PropTypes.bool.isRequired,
};

export const PrimaryButton = (props) => {
  let buttonProps = dynamicPrimaryButtonProps(props);
  return (
    <PopoverWrapper
      hoverText={buttonProps.popoverProps.hoverText}
      className={buttonProps.popoverProps.className}
      align={props.hoverTextAlign}
    >
      <Button
        aria-label={props.name + "-" + props.type}
        kind={buttonProps.buttonProps.kind}
        onClick={props.onClick}
        className={buttonProps.buttonProps.className}
        disabled={props.disabled || false}
        size="sm"
      >
        {props.type === "custom" ? (
          RenderForm(props.customIcon)
        ) : props.type === "add" ? (
          <Add />
        ) : (
          <SaveIcon saveIsDisabled={props.disabled} />
        )}
      </Button>
    </PopoverWrapper>
  );
};

PrimaryButton.defaultProps = {
  type: "save",
  hoverText: "Save Changes",
  inline: false,
  disabled: false,
  hoverTextAlign: "bottom",
};

PrimaryButton.propTypes = {
  hoverText: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  inline: PropTypes.bool.isRequired,
  hoverTextAlign: PropTypes.string.isRequired,
  customIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
