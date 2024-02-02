import React from "react";
import {
  Toggletip,
  ToggletipActions,
  ToggletipButton,
  ToggletipContent,
} from "@carbon/react";
import { Information } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { titleCase } from "lazy-z";
import { addClassName } from "../../../lib/forms/dynamic-form-fields";
import { RenderForm } from "./RenderForm";

/**
 * render a tooltip around an input field
 * @returns slz tooltip component
 */
export const CraigToolTip = (props) => {
  return (
    <>
      <Toggletip align={props.align}>
        <ToggletipButton>
          <Information className="tooltipMarginLeft" />
        </ToggletipButton>
        <ToggletipContent>
          <p>{props.content}</p>
          {props.link && (
            <ToggletipActions>
              <a href={props.link} target="_blank" rel="noopener noreferrer">
                More information
              </a>
            </ToggletipActions>
          )}
        </ToggletipContent>
      </Toggletip>
    </>
  );
};

CraigToolTip.defaultProps = {
  content: "",
  align: "top",
};

CraigToolTip.propTypes = {
  content: PropTypes.string.isRequired,
  link: PropTypes.string,
  align: PropTypes.string.isRequired,
};

const BuildToolTip = (props) => {
  return (
    <CraigToolTip
      content={props.tooltip.content}
      link={props.tooltip?.link}
      align={props.isModal ? props.tooltip.alignModal : props.tooltip.align}
    />
  );
};

BuildToolTip.defaultProps = {
  tooltip: {
    content: "",
  },
  isModal: false,
  align: "top",
  alignModal: "bottom",
};

BuildToolTip.propTypes = {
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
  }).isRequired,
  isModal: PropTypes.bool.isRequired,
  align: PropTypes.string.isRequired,
  alignModal: PropTypes.string.isRequired,
};

export const ToolTipWrapper = (props) => {
  let allProps = { ...props };
  let tooltip = BuildToolTip(props);
  delete allProps.innerForm;
  delete allProps.tooltip;
  delete allProps.noLabelText;
  //check for labelText prop for components where it is a valid param
  if (
    !props.noLabelText &&
    props.labelText === undefined &&
    props.field === undefined
  ) {
    throw new Error(
      "ToolTipWrapper expects `props.labelText` or `props.field` when rendering labelText to be provided, got neither. To not render label text, use the `noLabelText` prop."
    );
  }
  // remove label text from components where it is not valid param
  if (props.noLabelText) delete allProps.labelText;
  else allProps.labelText = " ";
  allProps.className = addClassName("tooltip", { ...props });
  return (
    <div className={props.noLabelText ? "" : "cds--form-item"}>
      {props.noLabelText ? (
        // No label- this is usually a title
        <div className="labelRow">
          {RenderForm(props.innerForm, allProps)}
          {tooltip}
        </div>
      ) : (
        <>
          <div className="cds--label labelRow">
            <label htmlFor={props.id}>
              {props.labelText || titleCase(props.field)}
            </label>
            {tooltip}
          </div>
          {props.children
            ? React.cloneElement(props.children, {
                // adjust props
                labelText: " ", // set labelText to empty
                className: props.children.props.className + " tooltip", // add tooltip class back
              })
            : RenderForm(props.innerForm, allProps)}
        </>
      )}
    </div>
  );
};

ToolTipWrapper.defaultProps = {
  tooltip: {
    content: "",
  },
  noLabelText: false,
};

ToolTipWrapper.propTypes = {
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
  }).isRequired,
  isModal: PropTypes.bool,
  id: PropTypes.string.isRequired,
  labelText: PropTypes.string,
  noLabelText: PropTypes.bool.isRequired,
  children: PropTypes.node,
  innerForm: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};
