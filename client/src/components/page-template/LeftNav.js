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
  IbmCloudTransitGateway,
} from "@carbon/icons-react";
import React from "react";
import "./navigation.scss";
import LeftNavItem from "./LeftNavItem";
import PropTypes from "prop-types";
import { contains, containsAny, kebabCase, splatContains } from "lazy-z";

class LeftNav extends React.Component {
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
    if (
      contains(window.location.pathname, "beta") ||
      contains(window.location.search, "beta")
    )
      this.setState({ isHovering: true }, () => {
        if (!this.props.expanded) this.props.onOverlayClick();
      });
  }

  /**
   * handle mouse out
   */
  handleMouseOut() {
    if (
      contains(window.location.pathname, "beta") ||
      contains(window.location.search, "beta")
    )
      this.setState({ isHovering: false }, () => {
        if (this.props.expanded) this.props.onOverlayClick();
      });
  }

  render() {
    let dividerClass = this.props.expanded ? "expandedDivider" : "railDivider";
    let isBetaPage =
      contains(window.location.pathname, "beta") ||
      contains(window.location.search, "beta");
    return (
      <SideNav
        expanded={this.props.expanded}
        onOverlayClick={this.props.onOverlayClick}
        aria-label="Side navigation"
        className={this.props.expanded ? "expanded" : "rail"}
        onMouseEnter={this.handleMouseOver}
        onMouseLeave={this.handleMouseOut}
      >
        <SideNavItems>
          <LeftNavItem
            item={{
              path: `${isBetaPage ? "/beta" : ""}/projects`,
              icon: Folders,
              title: (isBetaPage ? "[Beta] " : "") + "Projects",
            }}
            key="Projects"
            expanded={this.props.expanded}
          />
          <LeftNavItem
            item={{
              path: isBetaPage ? "/beta/settings" : "/",
              icon: Settings,
              title: isBetaPage ? "[Beta] Settings" : "Options",
            }}
            key="Options"
            expanded={this.props.expanded}
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
                expanded={this.props.expanded}
                hasInvalidForm={containsAny(this.props.invalidForms, [
                  "/form/observability",
                  "key_management",
                  "object_storage",
                  "event_streams",
                  "secrets_manager",
                  "appid",
                  "atracker",
                  "icd",
                  "dns",
                  "scc_v2",
                ])}
              />
              <LeftNavItem
                key="VPC Networks"
                item={{
                  path: "/beta/vpc",
                  icon: VirtualPrivateCloud,
                  title: "[Beta] VPC Networks",
                }}
                expanded={this.props.expanded}
                hasInvalidForm={containsAny(this.props.invalidForms, [
                  "vpcs",
                  "/form/nacls",
                  "/forms/subnets",
                ])}
              />
              <LeftNavItem
                key="VPC Deployments"
                item={{
                  path: "/beta/vpcDeployments",
                  icon: IbmCloudVpc,
                  title: "[Beta] VPC Deployments",
                }}
                expanded={this.props.expanded}
                hasInvalidForm={containsAny(this.props.invalidForms, [
                  "vsi",
                  "clusters",
                  "ssh_keys",
                  "load_balancers",
                  "virtual_private_endpoints",
                  "vpn_gateways",
                  "vpn_servers",
                  "routing_tables",
                  "security_groups",
                  "fortigate_vnf",
                ])}
              />
              <LeftNavItem
                key="Connectivity"
                item={{
                  path: "/beta/connectivity",
                  icon: IbmCloudTransitGateway,
                  title: "[Beta] Connectivity",
                }}
                expanded={this.props.expanded}
                hasInvalidForm={containsAny(this.props.invalidForms, [
                  "transit_gateways",
                ])}
              />
              <LeftNavItem
                key="Power VS"
                item={{
                  path: "/beta/power",
                  icon: IbmPowerVs,
                  title: "[Beta] Power VS",
                }}
                expanded={this.props.expanded}
                hasInvalidForm={containsAny(this.props.invalidForms, [
                  "power",
                  "power_instances",
                  "power_volumes",
                ])}
              />
              <LeftNavItem
                key="Classic Network"
                item={{
                  path: "/beta/classic",
                  icon: InfrastructureClassic,
                  title: "[Beta] Classic Network",
                }}
                expanded={this.props.expanded}
                hasInvalidForm={containsAny(this.props.invalidForms, [
                  "classic_ssh_keys",
                  "classic_vlans",
                  "classic_gateways",
                ])}
              />
              <LeftNavItem
                key="Overview"
                item={{
                  path: "/beta/overview",
                  icon: Dashboard,
                  title: "[Beta] Overview",
                }}
                expanded={this.props.expanded}
                hasInvalidForm={this.props.invalidForms.length !== 0}
              />
              {this.props.expanded && (
                <SideNavDivider className={dividerClass} />
              )}
            </>
          )}
          {this.props.expanded && (
            <>
              <LeftNavItem
                item={{ path: "/docs/about", icon: Help, title: "About" }}
                key="About"
                expanded={this.props.expanded}
              />
              <LeftNavItem
                item={{
                  path: "/docs/releaseNotes",
                  icon: Bullhorn,
                  title: "Release Notes",
                }}
                key="ReleaseNotes"
                expanded={this.props.expanded}
              />
              <LeftNavItem
                item={{
                  path: "/docs/json",
                  icon: JsonReference,
                  title: "JSON Documentation",
                }}
                key="json-docs"
                expanded={this.props.expanded}
              />
              <LeftNavItem
                item={{
                  path: "/docs/tutorial",
                  icon: Compass,
                  title: "Tutorial",
                }}
                key="tutorial"
                expanded={this.props.expanded}
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
                onChange={this.props.onSearch}
              />
            </>
          )}
          {this.props.navCategories.map((category) => {
            // display nav category and divider when searching for a page in the beta
            // and that page is part of the category
            let showNavCategory =
              (isBetaPage &&
                splatContains(
                  category.links,
                  "path",
                  window.location.pathname
                )) ||
              !isBetaPage;
            return (
              <div key={kebabCase(category.name)}>
                {showNavCategory && <SideNavDivider className={dividerClass} />}
                {this.props.expanded && showNavCategory && (
                  <SideNavLink href="#">{category.name}</SideNavLink>
                )}
                {category.links.map((item) => {
                  if (!item.icon) {
                    console.log(item);
                  }
                  if (
                    (isBetaPage && item.path === window.location.pathname) ||
                    !isBetaPage ||
                    (this.props.hasSearch && isBetaPage)
                  )
                    return (
                      <LeftNavItem
                        isBetaPage={isBetaPage}
                        item={item}
                        key={item.title}
                        expanded={this.props.expanded}
                        fsCloud={this.props.fsCloud}
                        hasInvalidForm={
                          this.props.isResetState
                            ? false
                            : contains(
                                this.props.invalidForms,
                                item.jsonField
                              ) || contains(this.props.invalidForms, item.path)
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
  }
}

LeftNav.defaulProps = {
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
