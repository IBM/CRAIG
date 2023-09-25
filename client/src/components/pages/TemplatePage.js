import React from "react";
import { OptionsForm } from "../forms";
import { ToggleForm } from "icse-react-assets";
import MixedPattern from "../../images/mixed.png";
import "./template-page.css";
import { RenderDocs } from "./SimplePages";
const defaultTemplate = require("../../lib/docs/default-template.json");

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
];

export const TemplatePage = (props) => {
  return (
    <div id="templates">
      <h2>Infrastructure Templates</h2>
      {templates.map((pattern) => (
        <ToggleForm
          key={pattern.name}
          innerForm={OptionsForm}
          name={pattern.name + " Template"}
          noDeleteButton
          onSave={() => {}}
          hideName
          about={RenderDocs("templates")()}
          tabPanel={{}}
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
