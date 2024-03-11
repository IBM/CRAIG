import React from "react";
import PropTypes from "prop-types";
import { contains } from "lazy-z";
import { default as PopoverWrapper } from "./PopoverWrapper";
import { TrashCan } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { dynamicSecondaryButtonProps } from "../../../lib/components/toggle-form-components";

export const SecondaryButton = (props) => {
  let isV2Page =
    contains(window.location.pathname, "/v2") ||
    contains(window.location.search, "v2");
  let buttonProps = dynamicSecondaryButtonProps(props, isV2Page);
  return (
    <div className="delete-area">
      <PopoverWrapper
        hoverText={buttonProps.popoverProps.hoverText}
        align={props.hoverTextAlign}
        className={buttonProps.popoverProps.className}
      >
        <Button
          aria-label={props.name + "-delete"}
          className={buttonProps.buttonClassName}
          kind="ghost"
          size="sm"
          onClick={props.onClick}
          disabled={props.disabled === true}
        >
          <TrashCan className={buttonProps.iconClassName} />
        </Button>
      </PopoverWrapper>
    </div>
  );
};

SecondaryButton.defaultProps = {
  disabled: false,
  hoverTextAlign: "bottom-right",
};

SecondaryButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  hoverTextAlign: PropTypes.string.isRequired,
  disableDeleteMessage: PropTypes.string,
  name: PropTypes.string.isRequired,
};
