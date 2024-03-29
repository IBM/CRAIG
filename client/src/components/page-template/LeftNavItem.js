import { Popover, PopoverContent, SideNavLink } from "@carbon/react";
import React from "react";
import PropTypes from "prop-types";
import "./navigation.scss";
import { leftNavItemClassName } from "../../lib/forms";
import { contains } from "lazy-z";

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
    let requiredComponent = this.props.item.required && this.props.fsCloud;
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
            href={this.props.item.path + (this.props.isV2Page ? "?v2" : "")}
            renderIcon={this.props.item.icon}
            key={this.props.item.title}
            onMouseOver={() => this.setHover(true)}
            onMouseOut={() => this.setHover(false)}
            className={
              (this.props.new &&
              this.props.expanded &&
              !contains(window.location.pathname, "/v2") &&
              !contains(window.location.search, "v2")
                ? "newLeftNav "
                : "") +
              (requiredComponent && this.props.expanded
                ? "sideNavLinkRequired "
                : "") +
              leftNavItemClassName(
                window,
                this.props.item.path,
                this.props.expanded,
                this.props.hasInvalidForm,
                this.state.isHovering
              )
            }
          >
            {this.props.expanded ? this.props.item.title : ""}
          </SideNavLink>
          <PopoverContent
            className={
              "popover-box navPopoverAlign " +
              (requiredComponent ? " sideNavLinkRequired" : "")
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

LeftNavItem.defaultProps = {
  fsCloud: true,
};

LeftNavItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    // icon can be stateless component or import from carbon
    icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
    required: PropTypes.bool,
  }).isRequired,
  expanded: PropTypes.bool.isRequired,
  fsCloud: PropTypes.bool.isRequired,
};

export default LeftNavItem;
