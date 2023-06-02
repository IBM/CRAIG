import React from "react";
import {
  IbmCloudKeyProtect,
  ObjectStorage,
  VirtualPrivateCloud,
  SubnetAclRules,
  IbmCloudSubnets,
  IbmCloudTransitGateway,
  Security,
  IbmCloudVpcEndpoints,
  CloudAuditing,
  Password,
  BareMetalServer_02,
  IbmCloudKubernetesService,
  CloudApp,
  GatewayVpn,
  IdManagement,
  GroupAccess,
  GroupResource,
  IbmCloudSecretsManager,
  IbmCloudSecurityComplianceCenter,
  IbmCloudEventStreams,
  LoadBalancerVpc,
  Report,
  Router,
  Folders,
  ServerProxy,
  DnsServices,
} from "@carbon/icons-react";
import f5 from "../images/f5.png";
import { arraySplatIndex, contains, getObjectFromArray } from "lazy-z";
import { CraigCodeMirror, Navigation, Footer } from "./page-template";
import PropTypes from "prop-types";
import "./page-template.css";
import {
  appidTf,
  atrackerTf,
  clusterTf,
  cosTf,
  f5Tf,
  kmsTf,
  lbTf,
  resourceGroupTf,
  sccTf,
  secretsManagerTf,
  sgTf,
  sshKeyTf,
  tgwTf,
  vpeTf,
  vpnTf,
  vsiTf,
  iamTf,
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
  codeMirrorGetDisplay,
  routingTableTf,
  cbrTf,
  dnsTf,
} from "../lib";
import { Notification } from "./Notification";
import CBRIcon from "../images/cbr";
import { vpnServerTf } from "../lib/json-to-iac/vpn-server";

function F5Icon() {
  return <img src={f5} />;
}

const navCategories = [
  {
    name: "Resource Groups",
    links: [
      {
        title: "Resource Groups",
        path: "/form/resourceGroups",
        icon: GroupResource,
        toTf: resourceGroupTf,
        jsonField: "resource_groups",
        required: true,
      },
    ],
  },
  {
    name: "Services",
    links: [
      {
        title: "Key Management",
        path: "/form/keyManagement",
        icon: IbmCloudKeyProtect,
        field: "key_management",
        toTf: kmsTf,
        required: true,
        jsonField: "key_management",
      },
      {
        title: "Object Storage",
        path: "/form/objectStorage",
        icon: ObjectStorage,
        field: "cos",
        toTf: cosTf,
        required: true,
        jsonField: "object_storage",
      },
      {
        title: "Secrets Manager",
        path: "/form/secretsManager",
        icon: IbmCloudSecretsManager,
        jsonField: "secrets_manager",
        toTf: secretsManagerTf,
      },
      {
        title: "Activity Tracker",
        path: "/form/activityTracker",
        icon: CloudAuditing,
        jsonField: "atracker",
        toTf: atrackerTf,
        required: true,
      },
      {
        title: "Event Streams",
        path: "/form/eventStreams",
        icon: IbmCloudEventStreams,
        jsonField: "event_streams",
        toTf: codeMirrorEventStreamsTf,
      },
      {
        title: "App ID",
        path: "/form/appID",
        icon: CloudApp,
        toTf: appidTf,
        jsonField: "appid",
      },
    ],
  },
  {
    name: "Network",
    links: [
      {
        title: "Virtual Private Clouds",
        path: "/form/vpcs",
        icon: VirtualPrivateCloud,
        toTf: codeMirrorVpcTf,
        jsonField: "vpcs",
        required: true,
      },
      {
        title: "VPC Access Control",
        path: "/form/nacls",
        icon: SubnetAclRules,
        toTf: codeMirrorAclTf,
        required: true,
      },
      {
        title: "VPC Subnets",
        path: "/form/subnets",
        icon: IbmCloudSubnets,
        toTf: codeMirrorSubnetsTf,
        required: true,
      },
      {
        title: "Routing Tables",
        path: "/form/routingTables",
        icon: Router,
        toTf: routingTableTf,
        jsonField: "routing_tables",
      },
      {
        title: "Transit Gateways",
        path: "/form/transitGateways",
        icon: IbmCloudTransitGateway,
        toTf: tgwTf,
        jsonField: "transit_gateways",
      },
      {
        title: "Security Groups",
        path: "/form/securityGroups",
        icon: Security,
        toTf: sgTf,
        required: true,
        jsonField: "security_groups",
      },
      {
        title: "Virtual Private Endpoints",
        path: "/form/vpe",
        icon: IbmCloudVpcEndpoints,
        toTf: vpeTf,
        jsonField: "virtual_private_endpoints",
        required: true,
      },
      {
        title: "VPN Gateways",
        path: "/form/vpn",
        icon: GatewayVpn,
        toTf: vpnTf,
        jsonField: "vpn_gateways",
      },
    ],
  },
  {
    name: "Clusters",
    links: [
      {
        title: "Clusters",
        path: "/form/clusters",
        icon: IbmCloudKubernetesService,
        toTf: clusterTf,
        required: true,
        jsonField: "clusters",
      },
    ],
  },
  {
    name: "Virtual Servers",
    links: [
      {
        title: "SSH Keys",
        path: "/form/sshKeys",
        icon: Password,
        toTf: sshKeyTf,
        jsonField: "ssh_keys",
      },
      {
        title: "Virtual Server Instances",
        path: "/form/vsi",
        icon: BareMetalServer_02,
        toTf: vsiTf,
        jsonField: "vsi",
      },
      {
        title: "Load Balancers",
        path: "/form/lb",
        icon: LoadBalancerVpc,
        toTf: lbTf,
        jsonField: "load_balancers",
        isLast: true,
      },
    ],
  },
  {
    name: "Advanced Features",
    links: [
      {
        title: "Security Compliance Center",
        path: "/form/securityComplianceCenter",
        icon: IbmCloudSecurityComplianceCenter,
        toTf: sccTf,
        jsonField: "scc",
      },
      {
        title: "DNS Service",
        path: "/form/dns",
        icon: DnsServices,
        toTf: dnsTf,
        jsonField: "dns",
      },
      {
        title: "VPN Servers",
        path: "/form/vpnServers",
        toTf: vpnServerTf,
        jsonField: "vpn_servers",
        icon: ServerProxy,
      },
      {
        title: "F5 Big IP",
        path: "/form/f5",
        icon: F5Icon,
        jsonField: "f5_vsi",
        toTf: f5Tf,
      },
      {
        title: "Access Groups",
        path: "/form/accessGroups",
        icon: GroupAccess,
        toTf: iamTf,
        jsonField: "access_groups",
      },
      {
        title: "IAM Account Settings",
        path: "/form/iamAccountSettings",
        icon: IdManagement,
        toTf: (json) => codeMirrorFormatIamAccountSettingsTf(json),
        jsonField: "iam_account_settings",
      },
      {
        title: "Context Based Restrictions",
        path: "/form/cbr",
        icon: CBRIcon,
        toTf: cbrTf,
      },
    ],
  },
  {
    name: "Final Steps",
    links: [
      {
        title: "Summary",
        path: "/summary",
        icon: Report,
      },
      { title: "Projects", path: "/projects", icon: Folders },
    ],
  },
];

let pageOrder = [
  { title: "About", path: "/docs/about" },
  { title: "Release Notes", path: "/docs/releaseNotes" },
  {
    title: "JSON Documentation",
    path: "/docs/json",
  },
  {
    title: "Options",
    path: "/",
  },
];

// for each nav category
navCategories.forEach((category) => {
  // for each link
  category.links.forEach((link) => {
    // add the title and path to path order
    pageOrder.push(link);
  });
});

const PageTemplate = (props) => {
  let isResetState = window.location.pathname === "/resetState";
  /**
   * Footer navigation function
   * @param {boolean} isBackward goes back
   * @returns {{title: string, onClick:Function}} title for page, on click function to navigate to that page
   */
  function navigate(isBackward) {
    let currentPath = window.location.pathname;

    if (currentPath === "/projects" && props.current_project && !isBackward) {
      if (pageOrder[pageOrder.length - 1].path === "/") {
        pageOrder.pop();
      }
      pageOrder.push({
        title: "Configure " + props.current_project,
        path: "/",
      });
    }

    let nextPathIndex = isBackward // get next path based on direction
      ? arraySplatIndex(pageOrder, "path", currentPath) - 1
      : arraySplatIndex(pageOrder, "path", currentPath) + 1;

    /**
     * function to send user to next path
     */
    function onClick() {
      props.nav(pageOrder[nextPathIndex].path);
    }

    return isResetState
      ? {
          title: "Reset State",
        }
      : nextPathIndex === pageOrder.length || nextPathIndex === -1
      ? {
          // if next index is out of bounds of array, send empty string
          // and no onclick function
          title: "",
        }
      : getObjectFromArray(pageOrder, "path", `/form/${props.form}`)?.isLast
      ? {
          title: "Summary",
          onClick: () => {
            props.nav("/summary");
          },
        }
      : {
          title: pageOrder[nextPathIndex].title,
          onClick: onClick,
        };
  }
  let pageObj = props.form
    ? getObjectFromArray(pageOrder, "path", `/form/${props.form}`)
    : { toTf: false };

  // if path is undefined or "form" is not present in path then hide the code mirror
  let formPathNotPresent =
    pageObj.path === undefined ? true : !contains(pageObj.path, "form");

  return (
    <>
      <Navigation
        hideCodeMirror={props.hideCodeMirror}
        onJsonToggle={() => props.toggleHide("hideCodeMirror")}
        navCategories={navCategories}
        json={props.json}
        project={props.project}
        notify={props.notify}
        isResetState={isResetState}
        formPathNotPresent={formPathNotPresent}
        invalidForms={props.invalidForms}
      />
      <div className="minHeight displayFlex navBarAlign boxShadow fieldPadding">
        <div
          className={
            props.hideCodeMirror || formPathNotPresent
              ? "widthOneHundredPercent"
              : "leftPanelWidth"
          }
        >
          <ul className="notification-list">
            {props.notifications.map((notification, index) => (
              <li key={index}>
                <Notification
                  kind={notification.kind}
                  text={notification.text}
                  title={notification.title}
                  timeout={notification.timeout}
                />
              </li>
            ))}
          </ul>
          {props.children}
        </div>
        <CraigCodeMirror
          hideCodeMirror={formPathNotPresent === true || props.hideCodeMirror}
          code={codeMirrorGetDisplay(
            props.json,
            props.jsonInCodeMirror,
            pageObj.path,
            pageObj.toTf,
            pageObj.jsonField
          )}
          onTabClick={props.onTabClick}
          jsonInCodeMirror={props.jsonInCodeMirror}
        />
      </div>
      {isResetState !== true && (
        <Footer
          toggleFooter={() => props.toggleHide("hideFooter")}
          hideFooter={props.hideFooter}
          navigate={navigate}
        />
      )}
    </>
  );
};

PageTemplate.defaultProps = {
  hideFooter: false,
  hideCodeMirror: false,
  jsonInCodeMirror: false,
};

PageTemplate.propTypes = {
  code: PropTypes.string, // can be null or undefined
  hideCodeMirror: PropTypes.bool.isRequired,
  hideFooter: PropTypes.bool.isRequired,
  toggleHide: PropTypes.func,
  jsonInCodeMirror: PropTypes.bool.isRequired,
  invalidForms: PropTypes.arrayOf(PropTypes.string),
};

export default PageTemplate;
