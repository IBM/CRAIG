import { CraigHeader } from "./SplashPage";
import React from "react";
import {
  Accordion,
  AccordionItem,
  CodeSnippet,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from "@carbon/react";
import { templates, TemplateAbout } from "../utils";
import save from "../../images/save.png";
import create from "../../images/create.png";
import disabledsave from "../../images/disabledsave.png";
import deletebutton from "../../images/delete.png";
import download from "../../images/download.png";
import invalid from "../../images/invalid.png";
import "./about.scss";

const MiniTutorialTile = (props) => {
  return (
    <div className="tutorial-tile">
      <div className="image-container">
        <img className="fit-images" src={props.image.src} />
      </div>
      <p className="bold center">{props.title}</p>
      <hr />
      <p className="justify">{props.description}</p>
    </div>
  );
};

const aboutCategories = [
  [
    "Key Management",
    "VPCs",
    "Power VS Workspace",
    "Classic SSH Keys",
    "Resource Groups",
  ],
  [
    "Cloud Object Storage",
    "VPC Access Control Lists",
    "Power VS Instances",
    "Classic VLANs",
    "Access Groups",
  ],
  [
    "Secrets Manager",
    "VPC Subnets",
    "Power VS Storage",
    "Classic Gateways",
    "IAM Account Settings",
  ],
  [
    "Logdna/Sysdig",
    "Virtual Server Instances",
    "FalconStor VTL",
    "",
    "Content Based Restrictions",
  ],
  [
    "Activity Tracker",
    "Transit Gateways",
    "",
    "",
    "Security & Compliance Center",
  ],
  ["Event Streams", "Security Groups", "", "", ""],
  ["AppID", "Virtual Private Endpoints", "", "", ""],
  ["Cloud Databases", "VPN Servers", "", "", ""],
  ["Cloud Internet Services (CIS)", "VPN Gateways", "", "", ""],
  ["DNS Service", "Load Balancers", "", "", ""],
  ["", "VPC Clusters", "", "", ""],
  ["", "F5 Big IP", "", "", ""],
];

const About = () => {
  let templateRows = Object.keys(templates).map((template) => {
    return {
      name: template,
      id: template,
    };
  });
  return (
    <div id="craig-about">
      <CraigHeader />
      <div id="features" className="marginBottomSmall">
        <h2 className="marginBottomXs">Features</h2>
        <Accordion align="start" size="lg">
          <AccordionItem title="Create and Manage Templates with Projects">
            <p className="marginBottomSmall">
              Users can create custom projects for each of their desired
              configurations. When creating a project, users can select from the
              following templates:
            </p>
            <DataTable
              rows={templateRows}
              headers={[
                {
                  key: "name",
                  header: "Templates",
                },
              ]}
            >
              {({ rows, headers, getRowProps }) => (
                <Table aria-label="sample table">
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader aria-label="expand row" />
                      {headers.map((header, i) => (
                        <TableHeader key={i}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          {...getRowProps({
                            row,
                          })}
                        >
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        <TableExpandedRow colSpan={headers.length + 1}>
                          <div>
                            <TemplateAbout
                              smallImage
                              template={templates[row.id]}
                            />
                          </div>
                        </TableExpandedRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
            <p className="marginTop">
              Users can also use the Project Setup Wizard to create starting
              point for custom infrastructure templates.
            </p>
          </AccordionItem>
          <AccordionItem title="Create & Edit Cloud Resources">
            <p className="marginBottomSmall">
              CRAIG supports the creation of the following cloud resources:
            </p>
            <Table aria-label="sample table">
              <TableHead>
                <TableRow>
                  <TableHeader>Cloud Services</TableHeader>
                  <TableHeader>Virtual Private Clouds</TableHeader>
                  <TableHeader>Power</TableHeader>
                  <TableHeader>Classic</TableHeader>
                  <TableHeader> IAM & Access</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {aboutCategories.map((category, catIndex) => (
                  <TableRow key={`about-category-${catIndex}`}>
                    {category.map((item, itemIndex) => (
                      <TableCell key={`about-${catIndex}-item-${itemIndex}`}>
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionItem>
          <AccordionItem title="Import Configuration">
            <p className="marginBottomSmall">
              After a CRAIG configuration has been created, in the archive of
              Terraform scripts is a file called <code>craig.json</code>. This
              file can be used to create a duplicate environment.
            </p>
            <p>There are two options for importing existing configurations:</p>
            <ul className="bullets indent marginBottomSmall">
              <li className="small">
                From the Options page, click the <code>Import JSON</code> tab
              </li>
              <li className="small">
                From the Projects page, click the <code>Import from JSON</code>{" "}
                button
              </li>
            </ul>
            <p>
              For more information on importing JSON and JSON schema, visit:
            </p>
            <a
              href="/docs/json"
              target="_blank"
              className="smallerText"
              rel="noreferrer"
            >
              CRAIG JSON Documentation
            </a>
          </AccordionItem>
          <AccordionItem title="Download Configuration">
            <p className="marginBottomSmall">
              Users can download their configuration as a terraform directory,
              including all specified networking and resource settings, as long
              as they do not have any outstanding errors within their CRAIG
              environment.
            </p>
            <p className="marginBottomSmall">
              Users can download their configuration by clicking the download
              icon located in their top navigation bar, which will download in
              the form of a <code>craig.zip</code> file.
            </p>
            <h3 className="marginBottomSmall">Running the Terraform Files</h3>
            <h4>Prerequisites</h4>
            <ul className="bullets indent marginBottomSmall">
              <li className="small">Terraform v1.3 or higher</li>
              <li className="small">Terraform CLI</li>
              <li className="small">IBM Cloud Platform API Key</li>
            </ul>
            <h4 className="marginBottomSmall">1. Initializing the Directory</h4>
            <ul className="indent">
              <li className="small marginBottomSmall">
                After unzipping craig.zip, enter the containing folder from your
                terminal. In your directory, run the following command to
                install needed providers and to initialize the directory:
              </li>
              <CodeSnippet
                type="single"
                feedback="Copied to clipboard"
                className="marginBottomSmall"
              >
                terraform init
              </CodeSnippet>
            </ul>
            <h4 className="marginBottomSmall">
              2. Adding environment variables
            </h4>
            <ul className="indent">
              <li className="small">
                Once your environment has been initialized, add your IBM Cloud
                Platform API key to the environment. This can be done by
                exporting your API key as an environment variable.
              </li>
              <li className="small marginBottomSmall">
                Once that's complete, run the following command to plan your
                terraform directory:
              </li>
              <CodeSnippet
                type="single"
                feedback="Copied to clipboard"
                className="marginBottomSmall"
              >
                terraform plan
              </CodeSnippet>
            </ul>
            <h4 className="marginBottomSmall">3. Creating Resources</h4>
            <ul className="indent">
              <li className="small marginBottomSmall">
                Resources can be created from the directory by running the
                Terraform Apply command after a successful plan:
              </li>
              <CodeSnippet
                type="single"
                feedback="Copied to clipboard"
                className="marginBottomSmall"
              >
                terraform apply
              </CodeSnippet>
            </ul>
            <h4 className="marginBottomSmall">4. Destroying Resources</h4>
            <ul className="indent">
              <li className="small">
                To destroy you resources, use the following command. This will
                delete all resources provisioned by the template:
              </li>
              <CodeSnippet
                type="single"
                feedback="Copied to clipboard"
                className="marginBottomSmall"
              >
                terraform destroy
              </CodeSnippet>
            </ul>
          </AccordionItem>
          <AccordionItem title="Schematics Integration">
            <p className="marginBottomSmall">
              Users can integrate their projects with IBM Schematics to create
              and upload a Terraform archive of your configuration to a
              Schematics Workspace.
            </p>
            <p className="marginBottomSmall">
              Note: In order to use schematics, users must run their own CRAIG
              application using their account platform API key, this integration
              is not available on the demo website.
            </p>
            <h3 className="marginBottomSmall">Integrating with Schematics</h3>
            <p>
              In order to allow Schematics to successfully create resources,
              users should make sure they meet the following permission
              requirements and prerequisites:
            </p>
            <ul className="bullets indent marginBottomSmall">
              <li className="small">
                IBM Cloud Platform Roles: Editor or Higher
              </li>
              <li className="small">
                Schematics Service Roles: Writer or Higher
              </li>
            </ul>
            <p className="marginBottomSmall">
              Refer to the{" "}
              <a
                href="https://cloud.ibm.com/docs/schematics?topic=schematics-access"
                target="_blank"
              >
                User permissions for Schematics Workspaces documentation
              </a>{" "}
              for more information.
            </p>
            <h4>Prerequisites</h4>
            <ul className="indent marginBottomSmall">
              <li className="small">
                An <code>.env</code> file is created and all fields to be used
                as environment variables by the backend API server are filled
              </li>
            </ul>
            <h4>
              Creating the <code>.env</code> file
            </h4>
            <ul className="indent marginBottomSmall">
              <li className="small">
                Make sure to set the following fields in a <code>.env</code>{" "}
                file to be used as environment variables by the backend API
                server.
              </li>
              <li className="small">
                These fields are used to populate dynamic information to the
                frontend from cloud account where the API key originates.
              </li>
              <li className="small">
                To automatically deploy the CRAIG Power VS workspaces and set
                the appropriate environment variables run the{" "}
                <code>terraform.sh</code> script in <code>/deploy.</code>
              </li>
              <li className="small">
                See <code>.env example</code> found{" "}
                <a
                  href="https://github.com/IBM/CRAIG/blob/main/.env.example"
                  target="_blank"
                >
                  here
                </a>{" "}
                .
              </li>
            </ul>
            <h4>Creating the Schematics Workspace</h4>
            <p className="indent">
              From the Projects page, there are two ways to integrate with
              Schematic:
            </p>
            <ul className="indentLarge bullets marginBottomSmall">
              <li className="small">
                When creating a new CRAIG project, click the{" "}
                <code>Integrate with Schematics</code> toggle within the modal
              </li>
              <li className="small">
                Integrate an already existing project with Schematics by
                clicking the <code>Create Workspace</code> button within the
                project's tab
              </li>
            </ul>
            <p className="indent marginBottomSmall">
              Users can then specify the Workspace name, resource group, and
              region, then click the <code>Save Project & Workspace</code>{" "}
              button to have CRAIG automatically create their Schematics
              Workspace.
            </p>
            <h4>Uploading to Schematics</h4>
            <p className="indent">
              To upload a CRAIG configuration to schematics, simply navigate to
              the Projects page, then click the{" "}
              <code>Upload to Schematics</code> button within the project's tab.
            </p>
          </AccordionItem>
        </Accordion>
      </div>
      <div id="faq" className="marginBottomSmall">
        <h2 className="marginBottomXs">FAQs</h2>
        <Accordion size="lg" align="start">
          <AccordionItem title="What is CRAIG?">
            <p className="marginBottomSmall">
              Cloud Resource and Infrastructure-as-Code Generator (or CRAIG)
              allows users to generate Terraform Deployable Architectures to
              create a fully customizable environment on IBM Cloud.
            </p>
            <p className="marginBottomSmall">
              CRAIG simplifies the process of creating IaC through its GUI,
              which manages and updates interconnected resources as they are
              created.
            </p>
            <p>
              CRAIG configures infrastructure using JSON to create full VPC
              networks, manage security and networking with VSI deployments, and
              create services, clusters, and manage IAM for an IBM Cloud
              Account. This JSON configuration can be imported to quick start
              environments, and can be downloaded as Terraform code directly
              from the GUI.
            </p>
          </AccordionItem>
          <AccordionItem title="How do I use CRAIG?">
            <div className="tile-container">
              <MiniTutorialTile
                image={create}
                title="Create Resources"
                description="Choose any resource by clicking on it within the hamburger menu, and create a new instance by pressing the add icon, located in the top right of the form."
              />
              <MiniTutorialTile
                image={save}
                title="Update Resources"
                description="Edit form fields to customize the resource to your needs, then press the blue save button to save changes and update Terraform code."
              />
              <MiniTutorialTile
                image={deletebutton}
                title="Delete Resources"
                description="The delete button allows you to delete any resource previously created. After confirming, the Terraform code will automatically update."
              />
            </div>
            <div className="tile-container">
              <MiniTutorialTile
                image={disabledsave}
                title="Disabled Save"
                description="Save will be automatically disabled if there is an error in the form's content or no changes have been made to ensure functioning Terraform code. If you are unable to save a form, check for errors."
              />
              <MiniTutorialTile
                image={invalid}
                title="Invalid Pages"
                description="Invalid pages will be shown as red in the navigation menu. Fix errors in these pages to export your Terraform code."
              />
              <MiniTutorialTile
                image={download}
                title="Download Configuration"
                description="After creating a valid configuration, you can download your terraform files with the download button in the top right of any page."
              />
            </div>
            <p className="marginTop">
              For more information, please refer to the following video for a
              step-by-step tutorial on how to get started with CRAIG:
            </p>
            <a
              href="https://ibm.box.com/v/craigTutorialVideo"
              target="_blank"
              className="smallerText"
              rel="noreferrer"
            >
              CRAIG Tutorial Video
            </a>
          </AccordionItem>
          <AccordionItem title="How is this different from SLZ?">
            <div className="displayFlex">
              <div className="half">
                <h3>SLZ</h3>
                <ul className="bullets indent">
                  <li className="small">Monolithic</li>
                  <li className="small">Manual Customization</li>
                  <li className="small">
                    Required components require completion
                  </li>
                  <li className="small">
                    Select from only 3 predefined patterns
                  </li>
                </ul>
              </div>
              <div className="half">
                <h3>CRAIG</h3>
                <ul className="bullets indent">
                  <li className="small">Dynamic</li>
                  <li className="small">Works out of the box</li>
                  <li className="small">Easily Extendable</li>
                  <li className="small">Flexible Infrastructure</li>
                  <li className="small">
                    Dynamic creation of custom resources
                  </li>
                  <li className="small">
                    Static Terraform Code to follow IaC model
                  </li>
                  <li className="small">8 predefined customizable patterns</li>
                </ul>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </div>
      <div id="troubleshooting" className="marginBottomSmall">
        <h2 className="marginBottomXs">Troubleshooting</h2>
        <Accordion size="lg" align="start">
          <AccordionItem title="CRAIG-generated Terraform is unable to create an Activity Tracker target">
            <p className="marginBottomSmall">
              When creating an Activity Tracker target with a public endpoint,
              you may see this error when attempting to apply your Terraform
              configuration, even if your Activity Tracker instance is set to
              public:
            </p>
            <CodeSnippet
              type="single"
              feedback="Copied to clipboard"
              className="marginBottomSmall"
            >
              Error: CreateTargetWithContext failed Your account has the API
              public endpoint disabled. Try again by using the private endpoint.
            </CodeSnippet>
            <p className="marginBottomSmall">
              This error is caused by a setting in your IBM Cloud Account that
              only allows private endpoints for Activity Tracker instances. You
              can rectify this issue by accessing the{" "}
              <a
                href="https://cloud.ibm.com/docs/cloud-shell?topic=cloud-shell-getting-started"
                target="_blank"
              >
                IBM Cloud Shell
              </a>{" "}
              and enabling public endpoints with the following command:
            </p>
            <CodeSnippet
              type="single"
              feedback="Copied to clipboard"
              className="marginBottomSmall"
            >
              ibmcloud atracker setting update --private-api-endpoint-only FALSE
            </CodeSnippet>
            <p>
              After enabling public endpoints on your account, your Terraform
              configuration should be able to create an Activity Tracker target
              successfully.
            </p>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default About;
