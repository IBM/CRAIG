import "./about.scss";
import { Accordion, AccordionItem } from "@carbon/react";
const About = () => {
  return (
    <div className="about">
      <div id="what-is-craig" className="section">
        <div className="displayFlex">
          <div className="displayFlex spaceBetween third verticalLine center">
            <div className="stackedAcronym">
              <h1>
                <strong>C</strong>loud
              </h1>
              <h1>
                <strong>R</strong>esource
              </h1>
              <h1>
                <strong>A</strong>nd
              </h1>
              <h1>
                <strong>I</strong>aC
              </h1>
              <h1>
                <strong>G</strong>enerator
              </h1>
            </div>
          </div>
          <div className="verticalAlign twoThirds verticalFlex infoPadding">
            <p className="marginBottom textContainer">
              Cloud Resource and Infrastructure-as-Code Generator (CRAIG) allows
              users to generate Infrastructure-as-Code (IaC) to create a fully
              customizable environment on IBM Cloud.
            </p>
            <p className="marginBottom textContainer">
              CRAIG simplifies the process of creating IaC through its GUI,
              which manages and updates interconnected resources as they are
              created.
            </p>
            <p className="textContainer">
              CRAIG configures infrastructure using JSON to create full VPC
              networks, manage security and networking with VSI deployments, and
              create services, clusters, and manage IAM for an IBM Cloud
              Account. This JSON configuration can be imported to quick start
              environments, and can be downloaded and edited as needed.
            </p>
          </div>
        </div>
      </div>
      <hr />
      <div id="features">
        <h1>Features</h1>
        <hr />
        <Accordion align="start" size="lg">
          <AccordionItem title="Deploy FS-Cloud Compliant Configuration">
            <p>
              The default pattern is an FS Cloud Compliant "mixed" pattern,
              which creates
            </p>
            <ul className="bullets indent marginBottomSmall">
              <li>A resource group for cloud services and for each VPC</li>
              <li>
                Object storage instances for flow logs and Activity Tracker
              </li>
              <li>
                Encryption keys in either a Key Protect or Hyper Protect Crypto
                Services instance
              </li>
              <li>
                A management and workload VPC connected by a transit gateway
              </li>
              <li>A flow log collector for each VPC</li>
              <li>All necessary networking rules to allow communication</li>
              <li>
                Virtual Private endpoints for Cloud Object storage in each VPC
              </li>
              <li>A VPN Gateway in the Management VPC</li>
            </ul>
            <p>Additionally,</p>
            <ul className="bullets indent">
              <li>
                Identical virtual servers will be deployed across the VSI subnet
                tier in each VPC
              </li>
              <li>
                Identical clusters will be deployed across the VSI subnet tier
                in each VPC
              </li>
            </ul>
          </AccordionItem>
          <AccordionItem title="Create & Edit Cloud Resources">
            <p className="marginBottomSmall">
              CRAIG supports the creation of the following cloud resources:
            </p>
            <div className="displayFlex">
              <div className="half">
                <small>Access</small>
                <ul className="bullets indent">
                  <li>Resource Groups</li>
                  <li>Access Groups</li>
                  <li>IAM Account Settings</li>
                </ul>
                <small>Services</small>
                <ul className="bullets indent">
                  <li>Key Management</li>
                  <li>Cloud Object Storage</li>
                  <li>Secrets Manager</li>
                  <li>Activity Tracker</li>
                  <li>Event Streams</li>
                  <li>App ID</li>
                  <li>Security & Compliance Center</li>
                </ul>
              </div>
              <div className="half">
                <small>Network</small>
                <ul className="bullets indent">
                  <li>Virtual Private Clouds</li>
                  <li>VPC Access Control Lists</li>
                  <li>VPC Subnets</li>
                  <li>Transit Gateways</li>
                  <li>Security Groups</li>
                  <li>Virtual Private Endpoints</li>
                  <li>VPN Gateways</li>
                </ul>
                <small>Clusters</small>
                <ul className="bullets indent">
                  <li>Clusters (IBM Cloud Kubernetes or Red Hat OpenShift)</li>
                </ul>
                <small>Virtual Servers</small>
                <ul className="bullets indent">
                  <li>SSH Keys</li>
                  <li>Virtual Server Instances</li>
                  <li>Load Balancers</li>
                  <li>Teleport Bastion Host</li>
                  <li>F5 Big IP</li>
                </ul>
              </div>
            </div>
          </AccordionItem>
          <AccordionItem title="Download Configuration">
            <p>
              Users can download the configured resources as a terraform
              directory, including all specified networking and resource
              settings.
            </p>
          </AccordionItem>
          <AccordionItem title="Import Configuration">
            <p>
              Users can import an existing craig JSON configuration to generate
              IaC from them and edit pre-existing configurations.
            </p>
          </AccordionItem>
        </Accordion>
      </div>
      <hr />
      <div id="faqs">
        <h1>FAQs</h1>
        <hr />
        <Accordion size="lg" align="start">
          <AccordionItem title="How is this different from SLZ?">
            <div className="marginBottomSmall">
              <p>
                The following features have been added as improvements since the
                latest version of Secure Landing Zone:
              </p>
            </div>
            <ul className="bullets indent">
              <li>
                Users can bring/create more than one key management instance
              </li>
              <li>
                Users can create and manage multiple instances of appid, secrets
                manager, event streams
              </li>
              <li>Users can create boot storage volumes for vsi</li>
              <li>Users can create VSI Load Balancers</li>
              <li>
                Users can now generate their own fully custom terraform template
              </li>
            </ul>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default About;
