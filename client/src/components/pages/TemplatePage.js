import React from "react";
import { OptionsForm } from "../forms";
import { ToggleForm, StatefulTabPanel } from "icse-react-assets";
import MixedPattern from "../../images/mixed.png";
import VsiPattern from "../../images/VsiPattern.png";
import VsiEdgePattern from "../../images/VsiEdgePattern.png";
import PowerSAP_HanaPattern from "../../images/PowerSAP_HanaPattern.png";
import "./template-page.css";
import { RenderDocs } from "./SimplePages";
const defaultTemplate = require("../../lib/docs/default-template.json");
const vsiPattern = require("../../lib/docs/templates/slz-vsi.json");
const vsiEdgePattern = require("../../lib/docs/templates/slz-vsi-edge.json");
const powerSAPHana = require("../../lib/docs/templates/power-sap-hana.json");

const templates = [
  {
    template: defaultTemplate,
    name: "Landing Zone Mixed Pattern",
    image: MixedPattern,
    patternDocText:
      "A default pattern based on the IBM Landing Zone Mixed Pattern. This is the default pattern for CRAIG.",
    includes: [
      "A resource group for cloud services and for each VPC",
      "A management and workload VPC connected by a transit gateway",
      "A flow log collector for each VPC",
      "Object storage instances for flow logs and activity tracker",
      "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
      "All necessary networking rules to allow communication",
      "Virtual Private endpoints for Cloud Object storage in each VPC",
      "A Red Hat OpenShift cluster in the workload VPC",
      "An example Virtual Server instance deployment in the management VPC",
      "A VPN Gateway in the Management VPC",
    ],
  },
  {
    template: vsiPattern,
    name: "Landing Zone VSI Pattern",
    image: VsiPattern,
    patternDocText:
      "Based on the IBM Landing Zone VSI Pattern, deploys an example application server deployment in both the Management and Workload VPC.",
    includes: [
      "A resource group for cloud services and for each VPC",
      "A management and workload VPC connected by a transit gateway",
      "A flow log collector for each VPC",
      "Object storage instances for flow logs and activity tracker",
      "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
      "All necessary networking rules to allow communication",
      "Virtual Private endpoints for Cloud Object storage in each VPC",
      "An example Virtual Server deployment in the management VPC",
      "An example Virtual Server deployment in the workload VPC",
      "A VPN Gateway in the Management VPC",
    ],
  },
  {
    template: vsiEdgePattern,
    name: "Landing Zone VSI Edge Pattern",
    image: VsiEdgePattern,
    patternDocText:
      "Based on the IBM Landing Zone VSI Edge Pattern, deploys an Edge VPC with one VSI and an F5 Big IP instance with VPN and WAF.",
    includes: [
      "A resource group for cloud services and for each VPC",
      "A management and workload VPC connected by a transit gateway",
      "An Edge VPC with F5 Big IP and needed network interfaces",
      "A flow log collector for each VPC",
      "Object storage instances for flow logs and activity tracker",
      "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
      "All necessary networking rules to allow communication",
      "Virtual Private endpoints for Cloud Object storage in each VPC",
      "An example Virtual Server deployment in the management VPC",
      "An example Virtual Server deployment in the workload VPC",
      "A VPN Gateway in the Management VPC",
    ],
  },
  {
    template: powerSAPHana,
    name: "Landing Zone Power SAP Hana Pattern",
    image: PowerSAP_HanaPattern,
    patternDocText:
      "Based on existing SAP Hana solutions, this template creates base infrastructure with SAP system landscape that leverages the services from the VPC landing zone as well as the needed components to get started with a Power VS Virtual Server environment",
    includes: [
      "A resource group for cloud services and for each VPC",
      "A management and workload VPC connected by a transit gateway",
      "An Edge VPC with F5 Big IP and needed network interfaces",
      "A Power VS Instances for SAP Hana, SAP Netweaver, and Secure File Share.",
      "A flow log collector for each VPC",
      "Object storage instances for flow logs and activity tracker",
      "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
      "All necessary networking rules to allow communication",
      "Virtual Private endpoints for Cloud Object storage in each VPC",
      "An example Virtual Server instance deployment in the management VPC",
      "A VPN Gateway in the Management VPC",
    ],
  },
];

export const TemplatePage = (props) => {
  return (
    <div id="templates">
      <h2>Infrastructure Templates</h2>
      <StatefulTabPanel
        name="Infrastructure Templates"
        about={RenderDocs("templates")()}
        hasBuiltInHeading
        form={<></>}
      />
      {templates.map((pattern) => (
        <ToggleForm
          key={pattern.name}
          innerForm={OptionsForm}
          name={pattern.name + " Template"}
          noDeleteButton
          onSave={() => {}}
          hideName
          tabPanel={{
            hideAbout: true,
          }}
          noSaveButton
          innerFormProps={{
            craig: { ...props.craig },
            data: { ...props.craig.store.json._options },
            template: pattern,
          }}
          disableSave={() => {
            return false;
          }}
          propsMatchState={() => {
            return false;
          }}
          submissionFieldName={pattern.name}
        />
      ))}
    </div>
  );
};
