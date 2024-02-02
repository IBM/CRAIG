import { Popover, PopoverContent } from "@carbon/react";
import React from "react";
import PropTypes from "prop-types";

/**
 * create a composed class name
 * @param {string} className name of classes to add
 * @param {*} props arbitrary props
 * @param {string=} props.className additional classnames
 */
function addClassName(className, props) {
  let composedClassName = className;
  if (props?.className) {
    composedClassName += " " + props.className;
    if (props.noMarginRight === true) {
      composedClassName = composedClassName.replace(/\s?marginRight\b/g, "");
    }
  }
  return composedClassName;
}

/**
 * get popoverwraper params
 * @param {Object} props
 * @param {boolean} props.noPopover
 * @param {string} props.hoverText
 * @param {string} props.align
 * @param {string} props.contentClassName
 * @returns {Object} params object
 */
function popoverWrapperParams(props) {
  let noPopover = props.noPopover === true || props.hoverText === "";
  let autoAlign = props.align ? false : true;
  let contentClassName =
    "popover-box" +
    (props.contentClassName ? ` ${props.contentClassName}` : "");

  return { noPopover, autoAlign, contentClassName };
}

/**
 * Wrapper for carbon popover component to handle individual component mouseover
 */
class PopoverWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  /**
   * handle mouse over
   */
  handleMouseOver() {
    this.setState({ isHovering: true });
  }

  /**
   * handle mouse out
   */
  handleMouseOut() {
    this.setState({ isHovering: false });
  }

  render() {
    let { noPopover, autoAlign, contentClassName } = popoverWrapperParams(
      this.props
    );
    return noPopover ? (
      this.props.children
    ) : (
      <div
        className={addClassName("popover-obj", this.props)}
        onMouseEnter={this.handleMouseOver}
        onMouseLeave={this.handleMouseOut}
      >
        <Popover
          open={this.state.isHovering}
          autoAlign={autoAlign}
          dropShadow={false}
          highContrast={true}
          caret={false}
          align={this.props.align}
        >
          {this.props.children}
          <PopoverContent className={contentClassName}>
            {this.props.hoverText}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
}

PopoverWrapper.defaultProps = {
  noPopover: false,
};

PopoverWrapper.propTypes = {
  noPopover: PropTypes.bool,
  hoverText: PropTypes.string.isRequired,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  align: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default PopoverWrapper;
