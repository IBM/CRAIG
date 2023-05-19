import { Popover, PopoverContent, SideNavLink } from "@carbon/react";
import React from "react";
import PropTypes from "prop-types";
import "./navigation.scss";

/**
 * get classname for nac item
 * @param {string} path
 * @param {boolean=} expanded
 * @returns {string} composed class name
 */
const getClassName = (path, expanded) => {
  let className = "";
  // if our current page is what is in the navbar
  if (window.location.pathname === path) {
    className += expanded
      ? "blueTileExpanded whiteFill "
      : "blueTileRail whiteFill ";
  }
  // if navbar expanded
  expanded ? (className += "expanded ") : (className += "rail ");
  return className;
};

class LeftNavItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
    };

    this.setHover = this.setHover.bind(this);
  }

  setHover(bool) {
    this.setState({ isHovering: bool });
  }

  render() {
    return (
      <div
        className={this.state.isHovering ? "nav-popover-obj" : ""} // do not overexpand divs
        key={"popover-obj-" + this.props.item.title}
      >
        <Popover
          open={this.state.isHovering && !this.props.expanded}
          dropShadow={false}
          align="right"
          highContrast={true}
          caret={false}
          key={"popover-" + this.props.item.title}
        >
          <SideNavLink
            href={this.props.item.path}
            renderIcon={this.props.item.icon}
            key={this.props.item.title}
            onMouseOver={() => this.setHover(true)}
            onMouseOut={() => this.setHover(false)}
            className={
              (this.props.item.required && this.props.expanded
                ? "sideNavLinkRequired "
                : "") + getClassName(this.props.item.path, this.props.expanded)
            }
          >
            {this.props.expanded ? this.props.item.title : ""}
          </SideNavLink>
          <PopoverContent
            className={
              "popover-box navPopoverAlign " +
              (this.props.item.required ? " sideNavLinkRequired" : "")
            }
            key={"popover-content-" + this.props.item.title}
          >
            {this.props.item.title}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
}

LeftNavItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    // icon can be stateless component or import from carbon
    icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
    required: PropTypes.bool,
  }).isRequired,
  expanded: PropTypes.bool.isRequired,
};

export default LeftNavItem;
