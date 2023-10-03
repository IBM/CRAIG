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
  IbmCloudSysdigSecure,
  IbmDb2,
  IbmPowerVs,
  VirtualMachine,
  Template,
  Home,
  Help,
  Bullhorn,
  JsonReference,
  FileStorage,
} from "@carbon/icons-react";
import f5 from "../../images/f5.png";
import { arraySplatIndex, contains, getObjectFromArray } from "lazy-z";
import { CraigCodeMirror, Navigation, Footer } from ".";
import PropTypes from "prop-types";
import "./page-template.css";
import { codeMirrorGetDisplay, releaseNotes } from "../../lib";
import { Notification } from "./Notification";
import CBRIcon from "../../images/cbr";
import { ActionableNotification } from "@carbon/react";

function F5Icon() {
  return <img src={f5} />;
}

const navCategories = require("../../lib/nav-catagories");
const navIcons = {
  IbmCloudKeyProtect: IbmCloudKeyProtect,
  ObjectStorage: ObjectStorage,
  VirtualPrivateCloud: VirtualPrivateCloud,
  SubnetAclRules: SubnetAclRules,
  IbmCloudSubnets: IbmCloudSubnets,
  IbmCloudTransitGateway: IbmCloudTransitGateway,
  Security: Security,
  IbmCloudVpcEndpoints: IbmCloudVpcEndpoints,
  CloudAuditing: CloudAuditing,
  Password: Password,
  BareMetalServer_02: BareMetalServer_02,
  IbmCloudKubernetesService: IbmCloudKubernetesService,
  CloudApp: CloudApp,
  GatewayVpn: GatewayVpn,
  IdManagement: IdManagement,
  GroupAccess: GroupAccess,
  GroupResource: GroupResource,
  IbmCloudSecretsManager: IbmCloudSecretsManager,
  IbmCloudSecurityComplianceCenter: IbmCloudSecurityComplianceCenter,
  IbmCloudEventStreams: IbmCloudEventStreams,
  LoadBalancerVpc: LoadBalancerVpc,
  Report: Report,
  Router: Router,
  Folders: Folders,
  ServerProxy: ServerProxy,
  DnsServices: DnsServices,
  IbmCloudSysdigSecure: IbmCloudSysdigSecure,
  IbmDb2: IbmDb2,
  CBRIcon: CBRIcon,
  F5Icon: F5Icon,
  IbmPowerVs: IbmPowerVs,
  IbmPowerVsInstance: VirtualMachine,
  IbmPowerVsVolumes: FileStorage,
};

let pageOrder = [
  {
    title: "Options",
    path: "/",
    icon: Home,
  },
  { title: "Infrastructure Template", path: "/templates", icon: Template },
  { title: "About", path: "/docs/about", icon: Help },
  { title: "Release Notes", path: "/docs/releaseNotes", icon: Bullhorn },
  {
    title: "JSON Documentation",
    path: "/docs/json",
    icon: JsonReference,
  },
];

// for each nav category
navCategories.forEach((category) => {
  // for each link
  category.links.forEach((link) => {
    // add icon
    link.icon = navIcons[link.react_icon];
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

  /**
   * updates craig version to newest version in release notes
   */
  function updateCraig() {
    let options = { ...props.json._options };
    options.craig_version = releaseNotes[0].version;
    props.craig.options.save(options, { data: props.json._options });
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
      {props.json._options.craig_version !== releaseNotes[0].version && (
        <ActionableNotification
          className="updateBanner"
          actionButtonLabel="Update With One Click"
          onActionButtonClick={updateCraig}
          inline={true}
          kind="warning-alt"
          lowContrast={true}
          subtitle="Some elements may not function correctly."
          title="CRAIG version out of date."
          hideCloseButton={true}
        />
      )}
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
  craig: PropTypes.shape({}).isRequired,
};

export default PageTemplate;
