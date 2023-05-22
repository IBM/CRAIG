import {
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavLink
} from "@carbon/react";
import { Home, Help, Bullhorn, Folders } from "@carbon/icons-react";
import React from "react";
import "./navigation.scss";
import LeftNavItem from "./LeftNavItem";
import PropTypes from "prop-types";
import { kebabCase } from "lazy-z";

const LeftNav = props => {
  let dividerClass = props.expanded ? "expandedDivider" : "railDivider";
  return (
    <SideNav
      expanded={props.expanded}
      onOverlayClick={props.onOverlayClick}
      aria-label="Side navigation"
      className={props.expanded ? "expanded" : "rail"}
    >
      <SideNavItems>
        <LeftNavItem
          item={{ path: "/", icon: Home, title: "Home" }}
          key="Home"
          expanded={props.expanded}
        />
        {props.expanded && (
          <>
            <LeftNavItem
              item={{ path: "/docs/about", icon: Help, title: "About" }}
              key="About"
              expanded={props.expanded}
            />
            <LeftNavItem
              item={{
                path: "/docs/releaseNotes",
                icon: Bullhorn,
                title: "Release Notes"
              }}
              key="ReleaseNotes"
              expanded={props.expanded}
            />
          </>
        )}
        {props.navCategories.map(category => (
          <div key={kebabCase(category.name)}>
            <SideNavDivider className={dividerClass} />
            {props.expanded && (
              <SideNavLink href="#">{category.name}</SideNavLink>
            )}
            {category.links.map(item => (
              <LeftNavItem
                item={item}
                key={item.title}
                expanded={props.expanded}
              />
            ))}
          </div>
        ))}
      </SideNavItems>
    </SideNav>
  );
};

LeftNav.defaultProps = {
  expanded: false
};

LeftNav.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onOverlayClick: PropTypes.func.isRequired,
  navCategories: PropTypes.array.isRequired
};

export default LeftNav;
