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
  DrillThrough,
  DrillBack,
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
      contains(window.location.pathname, "/v2") ||
      contains(window.location.search, "v2")
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
      contains(window.location.pathname, "/v2") ||
      contains(window.location.search, "v2")
    )
      this.setState({ isHovering: false }, () => {
        if (this.props.expanded) this.props.onOverlayClick();
      });
  }

  render() {
    let dividerClass = this.props.expanded ? "expandedDivider" : "railDivider";
    let isV2Page =
      contains(window.location.pathname, "/v2") ||
      contains(window.location.search, "v2");
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
              path: `${isV2Page ? "/v2" : ""}/projects`,
              icon: Folders,
              title: "Projects",
            }}
            key="Projects"
            expanded={this.props.expanded}
          />
          <LeftNavItem
            item={{
              path: isV2Page ? "/v2/settings" : "/",
              icon: Settings,
              title: "Options",
            }}
            key="Options"
            expanded={this.props.expanded}
          />
          {isV2Page && (
            <>
              <LeftNavItem
                key="Cloud Services"
                item={{
                  path: "/v2/services",
                  icon: CloudServices,
                  title: "Cloud Services",
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
                  path: "/v2/vpc",
                  icon: VirtualPrivateCloud,
                  title: "VPC Networks",
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
                  path: "/v2/vpcDeployments",
                  icon: IbmCloudVpc,
                  title: "VPC Deployments",
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
                  path: "/v2/connectivity",
                  icon: IbmCloudTransitGateway,
                  title: "Connectivity",
                }}
                expanded={this.props.expanded}
                hasInvalidForm={containsAny(this.props.invalidForms, [
                  "transit_gateways",
                ])}
              />
              <LeftNavItem
                key="Power VS"
                item={{
                  path: "/v2/power",
                  icon: IbmPowerVs,
                  title: "Power VS",
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
                  path: "/v2/classic",
                  icon: InfrastructureClassic,
                  title: "Classic Network",
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
                  path: "/v2/overview",
                  icon: Dashboard,
                  title: "Overview",
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
              {this.props.expanded && !isV2Page && (
                <>
                  <LeftNavItem
                    key="V2"
                    item={{
                      path: "/v2/projects",
                      icon: DrillThrough,
                      title: "[New] Use Craig V2",
                    }}
                    expanded={this.props.expanded}
                    new
                  />
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
                </>
              )}
              {this.props.expanded && isV2Page && (
                <LeftNavItem
                  key="V2"
                  item={{
                    path: "/",
                    icon: DrillBack,
                    title: "Use Classic Craig",
                  }}
                  expanded={this.props.expanded}
                  new
                />
              )}
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
              (isV2Page &&
                splatContains(
                  category.links,
                  "path",
                  window.location.pathname
                )) ||
              !isV2Page;
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
                    (isV2Page && item.path === window.location.pathname) ||
                    !isV2Page ||
                    (this.props.hasSearch && isV2Page)
                  )
                    return (
                      <LeftNavItem
                        isV2Page={isV2Page}
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
