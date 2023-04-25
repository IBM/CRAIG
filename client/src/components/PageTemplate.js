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
  BastionHost,
  IdManagement,
  GroupAccess,
  GroupResource,
  IbmCloudSecretsManager,
  IbmCloudSecurityComplianceCenter,
  IbmCloudEventStreams,
  LoadBalancerVpc,
  Report
} from "@carbon/icons-react";
import f5 from "../images/f5.png";
import {
  arraySplatIndex,
  contains,
  getObjectFromArray,
  prettyJSON
} from "lazy-z";
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
  codeMirrorFormatIamAccountSettingsTf
} from "../lib";
import {
  maskFieldsExpStep1ReplacePublicKey,
  maskFieldsExpStep2ReplaceTmosAdminPassword,
  maskFieldsExpStep3ReplaceLicensePassword,
  maskFieldsExpStep4HideValue,
  maskFieldsExpStep5CleanUp
} from "../lib/constants";
import { Notification } from "./Notification";
import CBRIcon from "../images/cbr";

function F5Icon() {
  return <img src={f5} />;
}

const navCategories = [
  {
    name: "Access",
    links: [
      {
        title: "Resource Groups",
        path: "/form/resourceGroups",
        icon: GroupResource,
        toTf: resourceGroupTf,
        jsonField: "resource_groups",
        required: true
      },
      {
        title: "Access Groups",
        path: "/form/accessGroups",
        icon: GroupAccess,
        toTf: iamTf,
        jsonField: "access_groups"
      },
      {
        title: "IAM Account Settings",
        path: "/form/iamAccountSettings",
        icon: IdManagement,
        toTf: json => codeMirrorFormatIamAccountSettingsTf(json),
        jsonField: "iam_account_settings"
      }
    ]
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
        jsonField: "key_management"
      },
      {
        title: "Object Storage",
        path: "/form/objectStorage",
        icon: ObjectStorage,
        field: "cos",
        toTf: cosTf,
        required: true,
        jsonField: "object_storage"
      },
      {
        title: "Secrets Manager",
        path: "/form/secretsManager",
        icon: IbmCloudSecretsManager,
        jsonField: "secrets_manager",
        toTf: secretsManagerTf
      },
      {
        title: "Activity Tracker",
        path: "/form/activityTracker",
        icon: CloudAuditing,
        jsonField: "atracker",
        toTf: atrackerTf,
        required: true
      },
      {
        title: "Event Streams",
        path: "/form/eventStreams",
        icon: IbmCloudEventStreams,
        jsonField: "event_streams",
        toTf: codeMirrorEventStreamsTf
      },
      {
        title: "App ID",
        path: "/form/appID",
        icon: CloudApp,
        toTf: appidTf,
        jsonField: "appid"
      },
      {
        title: "Security Compliance Center",
        path: "/form/securityComplianceCenter",
        icon: IbmCloudSecurityComplianceCenter,
        toTf: sccTf,
        jsonField: "scc"
      }
    ]
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
        required: true
      },
      {
        title: "VPC Access Control",
        path: "/form/nacls",
        icon: SubnetAclRules,
        toTf: codeMirrorAclTf,
        required: true
      },
      {
        title: "VPC Subnets",
        path: "/form/subnets",
        icon: IbmCloudSubnets,
        toTf: codeMirrorSubnetsTf,
        required: true
      },
      {
        title: "Transit Gateways",
        path: "/form/transitGateways",
        icon: IbmCloudTransitGateway,
        toTf: tgwTf,
        jsonField: "transit_gateways"
      },
      {
        title: "Security Groups",
        path: "/form/securityGroups",
        icon: Security,
        toTf: sgTf,
        required: true,
        jsonField: "security_groups"
      },
      {
        title: "Virtual Private Endpoints",
        path: "/form/vpe",
        icon: IbmCloudVpcEndpoints,
        toTf: vpeTf,
        jsonField: "virtual_private_endpoints",
        required: true
      },
      {
        title: "VPN Gateways",
        path: "/form/vpn",
        icon: GatewayVpn,
        toTf: vpnTf,
        jsonField: "vpn_gateways"
      }
    ]
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
        jsonField: "clusters"
      }
    ]
  },
  {
    name: "Virtual Servers",
    links: [
      {
        title: "SSH Keys",
        path: "/form/sshKeys",
        icon: Password,
        toTf: sshKeyTf,
        jsonField: "ssh_keys"
      },
      {
        title: "Virtual Server Instances",
        path: "/form/vsi",
        icon: BareMetalServer_02,
        toTf: vsiTf,
        jsonField: "vsi"
      },
      {
        title: "Load Balancers",
        path: "/form/loadBalancers",
        icon: LoadBalancerVpc,
        toTf: lbTf
      },
      {
        title: "Context Based Restrictions",
        path: "/form/cbr",
        icon: CBRIcon
        //toTf:
      },
      {
        title: "F5 Big IP",
        path: "/form/f5",
        icon: F5Icon,
        jsonField: "f5_vsi",
        toTf: f5Tf
      }
    ]
  },
  {
    name: "Final Steps",
    links: [
      {
        title: "Summary",
        path: "/summary",
        icon: Report
      }
    ]
  }
];

let pageOrder = [
  { title: "About", path: "/docs/about" },
  { title: "Release Notes", path: "/docs/releaseNotes" },
  {
    title: "Options",
    path: "/"
  }
];

// for each nav category
navCategories.forEach(category => {
  // for each link
  category.links.forEach(link => {
    // add the title and path to path order
    pageOrder.push(link);
  });
});

pageOrder.push({
  title: "Summary",
  path: "/summary"
});

const PageTemplate = props => {
  let isResetState = window.location.pathname === "/resetState";
  /**
   * Footer navigation function
   * @param {boolean} isBackward goes back
   * @returns {{title: string, onClick:Function}} title for page, on click function to navigate to that page
   */
  function navigate(isBackward) {
    let currentPath = window.location.pathname;
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
          title: "Reset State"
        }
      : nextPathIndex === pageOrder.length || nextPathIndex === -1
      ? {
          // if next index is out of bounds of array, send empty string
          // and no onclick function
          title: ""
        }
      : {
          title: pageOrder[nextPathIndex].title,
          onClick: onClick
        };
  }
  let pageObj = props.form
    ? getObjectFromArray(pageOrder, "path", `/form/${props.form}`)
    : { toTf: false };

  /**
   * get code mirror display
   * @param {Object} json craig config json
   * @param {boolean} jsonInCodeMirror true if displaying json in code mirror
   * @returns {string} code to display
   */
  function getCodeMirrorDisplay(json, jsonInCodeMirror) {
    if (jsonInCodeMirror) {
      if (pageObj.path === "/form/nacls") {
        let allAcls = [];
        json.vpcs.forEach(nw => {
          allAcls = allAcls.concat(nw.acls);
        });
        return prettyJSON(allAcls);
      } else if (pageObj.path === "/form/subnets") {
        let allSubnets = [];
        json.vpcs.forEach(nw => {
          allSubnets = allSubnets.concat(nw.subnets);
        });
        return prettyJSON(allSubnets);
      }
      return prettyJSON(json[pageObj.jsonField] || json) // if pageObj.jsonField is undefined - aka, home page
        .replace(maskFieldsExpStep1ReplacePublicKey, "public_key%%%%")
        .replace(
          maskFieldsExpStep2ReplaceTmosAdminPassword,
          json.f5_vsi.tmos_admin_password
            ? "tmos_admin_password%%%%"
            : "tmos_admin_password"
        )
        .replace(
          maskFieldsExpStep3ReplaceLicensePassword,
          json.f5_vsi.license_password !== "null"
            ? "license_password%%%%"
            : "license_password"
        )
        .replace(
          maskFieldsExpStep4HideValue,
          '": "****************************'
        )
        .replace(maskFieldsExpStep5CleanUp, "public_key"); // remove any extraneous %%%% from setting fields to null
    } else if (pageObj.toTf) {
      return pageObj.toTf(json).replace(/\[\n\s*\]/g, "[]");
    } else return prettyJSON(json);
  }
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
        notify={props.notify}
        isResetState={isResetState}
        formPathNotPresent={formPathNotPresent}
      />
      <div className="minHeight displayFlex navBarAlign boxShadow fieldPadding">
        <div
          className={
            props.hideCodeMirror || formPathNotPresent
              ? "widthOneHundredPercent"
              : "leftPanelWidth"
          }
        >
          {props.notifications.map((notification, index) => (
            <li className="notification-list" key={index}>
              <Notification
                kind={notification.kind}
                text={notification.text}
                title={notification.title}
                timeout={notification.timeout}
              />
            </li>
          ))}
          {props.children}
        </div>
        <CraigCodeMirror
          hideCodeMirror={formPathNotPresent === true || props.hideCodeMirror}
          code={getCodeMirrorDisplay(props.json, props.jsonInCodeMirror)}
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
  jsonInCodeMirror: false
};

PageTemplate.propTypes = {
  code: PropTypes.string, // can be null or undefined
  hideCodeMirror: PropTypes.bool.isRequired,
  hideFooter: PropTypes.bool.isRequired,
  toggleHide: PropTypes.func,
  jsonInCodeMirror: PropTypes.bool.isRequired
};

export default PageTemplate;
