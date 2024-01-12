import {
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavLink,
  Search,
} from "@carbon/react";
import {
  Help,
  Bullhorn,
  JsonReference,
  Compass,
  Folders,
  Settings,
  CloudServices,
  VirtualPrivateCloud,
  IbmCloudVpc,
  IbmPowerVs,
  Dashboard,
  InfrastructureClassic,
} from "@carbon/icons-react";
import React from "react";
import "./navigation.scss";
import LeftNavItem from "./LeftNavItem";
import PropTypes from "prop-types";
import { contains, kebabCase } from "lazy-z";

const LeftNav = (props) => {
  let dividerClass = props.expanded ? "expandedDivider" : "railDivider";
  let isBetaPage = contains(window.location.pathname, "/beta");
  return (
    <SideNav
      expanded={props.expanded}
      onOverlayClick={props.onOverlayClick}
      aria-label="Side navigation"
      className={props.expanded ? "expanded" : "rail"}
    >
      <SideNavItems>
        <LeftNavItem
          item={{
            path: `${isBetaPage ? "/beta" : ""}/projects`,
            icon: Folders,
            title: (isBetaPage ? "[Beta] " : "") + "Projects",
          }}
          key="Projects"
          expanded={props.expanded}
        />
        <LeftNavItem
          item={{
            path: isBetaPage ? "/beta/settings" : "/",
            icon: Settings,
            title: (isBetaPage ? "[Beta] " : "") + "Options",
          }}
          key="Options"
          expanded={props.expanded}
        />
        {isBetaPage && (
          <>
            <LeftNavItem
              key="Cloud Services"
              item={{
                path: "/beta/services",
                icon: CloudServices,
                title: "[Beta] Cloud Services",
              }}
              expanded={props.expanded}
            />
            <LeftNavItem
              key="VPC Networks"
              item={{
                path: "/beta/vpc",
                icon: VirtualPrivateCloud,
                title: "[Beta] VPC Networks",
              }}
              expanded={props.expanded}
            />
            <LeftNavItem
              key="VPC Deployments"
              item={{
                path: "/beta/vpcDeployments",
                icon: IbmCloudVpc,
                title: "[Beta] VPC Deployments",
              }}
              expanded={props.expanded}
            />
            <LeftNavItem
              key="Power VS"
              item={{
                path: "/beta/power",
                icon: IbmPowerVs,
                title: "[Beta] Power VS",
              }}
              expanded={props.expanded}
            />
            <LeftNavItem
              key="Classic Network"
              item={{
                path: "/beta/classic",
                icon: InfrastructureClassic,
                title: "[Beta] Classic Network",
              }}
              expanded={props.expanded}
            />
            <LeftNavItem
              key="Overview"
              item={{
                path: "/beta/overview",
                icon: Dashboard,
                title: "[Beta] Overview",
              }}
              expanded={props.expanded}
            />
            {props.expanded && <SideNavDivider className={dividerClass} />}
          </>
        )}
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
                title: "Release Notes",
              }}
              key="ReleaseNotes"
              expanded={props.expanded}
            />
            <LeftNavItem
              item={{
                path: "/docs/json",
                icon: JsonReference,
                title: "JSON Documentation",
              }}
              key="json-docs"
              expanded={props.expanded}
            />
            <LeftNavItem
              item={{
                path: "/docs/tutorial",
                icon: Compass,
                title: "Tutorial",
              }}
              key="tutorial"
              expanded={props.expanded}
            />
            <SideNavDivider className={dividerClass} />
            <SideNavLink href="#">Search</SideNavLink>
            <Search
              size="lg"
              id="craig-search"
              placeholder="Find cloud resources"
              labelText="Search"
              className="left-nav-search"
              closeButtonLabelText="Clear"
              onChange={props.onSearch}
            />
          </>
        )}
        {props.navCategories.map((category) => {
          return (
            <div key={kebabCase(category.name)}>
              <SideNavDivider className={dividerClass} />
              {props.expanded && (
                <SideNavLink href="#">{category.name}</SideNavLink>
              )}
              {category.links.map((item) => {
                if (!item.icon) {
                  console.log(item);
                }
                return (
                  <LeftNavItem
                    item={item}
                    key={item.title}
                    expanded={props.expanded}
                    fsCloud={props.fsCloud}
                    hasInvalidForm={
                      props.isResetState
                        ? false
                        : contains(props.invalidForms, item.jsonField) ||
                          contains(props.invalidForms, item.path)
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </SideNavItems>
    </SideNav>
  );
};

LeftNav.defaultProps = {
  expanded: false,
  fsCloud: true,
};

LeftNav.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onOverlayClick: PropTypes.func.isRequired,
  navCategories: PropTypes.array.isRequired,
  fsCloud: PropTypes.bool.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default LeftNav;
