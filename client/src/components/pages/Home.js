import React from "react";
import { Tabs, TabList, Tab, TabPanel, TabPanels } from "@carbon/react";
import { Sprout } from "@carbon/icons-react";
import { OptionsForm, EdgeNetworkingForm } from "../forms";
import "./home.scss";
import ImportJson from "./ImportJson";

function Home(props) {
  return (
    <>
      <div className="banner">
        <div className="banner-icon">
          <Sprout size="32" />
        </div>
        <div className="banner-text">
          Create, deploy and manage scalable infrastructure on IBM Cloud with
          CRAIG.
          <br />
          Configure environment options or get started by importing a JSON
          configuration.
        </div>
      </div>
      <Tabs>
        <TabList aria-label="home-options">
          <Tab>Options</Tab>
          <Tab>Default Template</Tab>
          <Tab>Import JSON</Tab>
          <Tab>Import SLZ JSON</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {/* Options Form */}
            <OptionsForm
              craig={props.craig}
              data={props.craig.store.json._options}
            />
            {props.craig.store.json._options.dynamic_subnets === false && (
              <EdgeNetworkingForm craig={props.craig} />
            )}
          </TabPanel>
          <TabPanel>
            <div
              id="pattern-form-information"
              className="leftTextAlign marginBottom subForm"
            >
              <div className="marginBottomSmall">
                <p className="patternDocText">
                  A default pattern based on the{" "}
                  <a
                    href="https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone/blob/main/.docs/patterns/mixed-pattern.md"
                    target="_blank"
                  >
                    IBM Landing Zone Mixed Pattern
                  </a>{" "}
                  created by default. This pattern includes:
                </p>
              </div>
              <ul className="bullets indent">
                <li>A resource group for cloud services and for each VPC</li>
                <li>
                  Object storage instances for flow logs and activity tracker
                </li>
                <li>
                  Encryption keys in either a Key Protect or Hyper Protect
                  Crypto Services instance
                </li>
                <li>
                  A management and workload VPC connected by a transit gateway
                </li>
                <li>A flow log collector for each VPC</li>
                <li>All necessary networking rules to allow communication</li>
                <li>
                  Virtual Private endpoints for Cloud Object storage in each VPC
                </li>
                <li>A Red Hat OpenShift cluster in the workload VPC</li>
                <li>Virtual Server instances in the management VPC</li>
                <li>
                  <em>A VPN Gateway in the Management VPC</em>
                </li>
              </ul>
            </div>
          </TabPanel>
          <TabPanel>
            {/* Import/Export JSON page */}
            <div className="tab-panel">
              <ImportJson craig={props.craig} />
            </div>
          </TabPanel>
          <TabPanel>
            {/* Import/Export SLZ JSON page */}
            <div className="tab-panel">
              <ImportJson craig={props.craig} slz />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Home;
