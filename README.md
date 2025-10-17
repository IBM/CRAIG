# Cloud Resource and Infrastructure-as-code Generator (CRAIG)

Cloud Resource and Infrastructure-as-Code Generator (or **CRAIG**) allows users to generate and deploy Terraform Architectures to create a fully customizable environment on IBM Cloud.

CRAIG simplifies the process of creating IaC through its GUI, which manages and updates interconnected resources as they are created.

CRAIG configures infrastructure using JSON to create full VPC networks, manage security and networking with VSI deployments, and create services, clusters, and manage IAM for an IBM Cloud Account. This JSON configuration can be imported to quick start environments, and can be downloaded as Terraform code directly from the GUI.

---

## Prerequisites for Local Installations

- NodeJS v24.9.0 or higher
- NPM version v8.19.2 or higher
- Terraform v1.3 or higher
- [jq](https://jqlang.github.io/jq/) v1.7 or higher (for the PowerVS Workspace Deployment `terraform.sh` script)

---

### Tutorial Video

[Follow this tutorial](https://ibm.box.com/v/craigTutorialVideo) for step-by-step instructions on how to get started with CRAIG.

***Ensure `Quality: 1080p` is selected within Box video player settings for the best viewing experience.***

***Last Updated: March 11th, 2024***

---

## Installation

1. [Permission Requirements for CRAIG](.docs/access-policies.md)
2. [Running CRAIG Application Locally](#running-craig-application-locally)
3. [Deploying To IBM Code Engine](#deploying-to-ibm-code-engine)
4. [Building Local CRAIG Container Image](#building-local-container-image)
5. [Setting Up CRAIG Development Environment](.docs/dev-env-setup.md)
6. [Power VS Workspace Deployment](.docs/power-vs-workspace-deployment.md)

---

### Running CRAIG Application Locally

To get started using CRAIG locally, follow these steps:

#### 1. Install Dependencies

To install needed dependencies, use the command
```shell
npm run setup
```

#### 2. Creating .env file

To dynamically fetch Power VS images and storage pools within CRAIG, the IBM Power VS APIs require a workspace to be created and its GUID to be in an environment file. If CRAIG is used for Power VS configuration, the Power VS workspaces must be created. See [Power VS Workspace Deployment](.docs/power-vs-workspace-deployment.md) for more information.

Make sure to set the `API_KEY` variable in a `.env` file to be used for IBM Cloud integration. If the Power VS workspaces creation automation is run, add the `API_KEY` variable to the `.env` file that the automation creates. If Power VS workspace automation is not used, create an `.env` following the example found [here](./.env.example).

#### 3. Start the application

Building the application, installing dependencies, and starting the server can be done with one easy command. From your directory, run:

```
npm run start
```

#### 4. Open the Application

Congratulations! Your application is now available at localhost:8080!

---

### Deploying to IBM Code Engine

IBM Code Engine is a fully managed serverless platform. CRAIG "scales to zero" in Code Engine when not in use, making this a very cost-effective and simple method of running CRAIG. 

Within the root directory is a script `deploy.sh` which deploys CRAIG to IBM Cloud Code Engine. 

_Note: CRAIG has the ability to automate the creation of all the access policies listed below using the `access.sh` script. For more information, refer to our [Access Policy documentation](.docs/access-policies.md)._

Users should make sure they have the following access policy roles for the IBM Code Engine service set within their IBM Cloud Account:

>* `Writer` or greater Service access
>* `Editor` or greater Platform access

Users should also make sure they have the following access policy roles for the IBM Cloud Container Registry service set within their IBM Cloud Account:

>* `Manager` Service access

These permissions are the minimum requirements needed in order to provision a Code Engine project, Container Registry namespace, application, image build, and secrets using the `deploy.sh` script. 

Refer to the [User Permissions for Code Engine documentation](https://cloud.ibm.com/docs/codeengine?topic=codeengine-iam)  and [User Permissions for IBM Cloud Container Registry documentation](https://cloud.ibm.com/docs/Registry?topic=Registry-iam&interface=ui) for more information.

In addition, an API key must be provided in order to create an IBM Container Registry namespace. See below for a simple use case using the default parameters.

#### Prerequisites for running deploy.sh from IBM Cloud Shell (recommended)
>* An API key must be provided that will be used for CRAIG's integration with IBM Cloud Schematics and Power Virtual Server Workspaces. This API key will also be used for IBM Code Engine's access to the IBM Container Registry. See later sections in this document about Schematics and Power Virtual Server integrations for more information.

#### Prerequisites for running deploy.sh outside of IBM Cloud Shell
>* The `ibmcloud` CLI must be [installed](https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli)
>* `ibmcloud login` must be run before invoking the script
>* An API key must be provided that will be used for CRAIG's integration with IBM Cloud Schematics and Power Virtual Server Workspaces. This API key will also be used for IBM Code Engine's access to the IBM Container Registry. See later sections in this document about Schematics and Power Virtual Server integrations for more information.
>* [jq](https://jqlang.github.io/jq/) v1.7 or higher


#### Downloading deploy.sh in IBM Cloud Shell
From within IBM Cloud Shell run the following two commands to download the deploy.sh script and make it executable:
```bash
wget https://raw.githubusercontent.com/IBM/CRAIG/main/deploy.sh
chmod 755 deploy.sh
```

#### Running the deploy script

By default the script will securely prompt you for your API key. It may also be read from an environment variable or specified as a command line argument. See the `deploy.sh -h` usage for more information.

 If CRAIG is used for Power VS configuration, Power Virtual Server workspaces must exist in the zones that CRAIG projects will use. The deploy script can create the Power Virtual Server workspaces in every Power VS zone worldwide and automatically integrate them with the CRAIG deployment. 
 
 The deploy script uses a Schematics workspace and Terraform to drive the creation and deletion of the Power Virtual Server workspaces. In order to allow Schematics integration, users should make sure they have the following access policy roles for the Schematics service set within their IBM Cloud Account:
 
>* `Manager` Service access
>* `Editor` or greater Platform access
 
 Once access policy roles for the Schematics service are properly configured, users can specify the `-z` parameter to automatically create the Power Virtual Server workspaces alongside your CRAIG deployment:

```bash
./deploy.sh -z
```

If CRAIG is used for Power VS configuration and you do not want Power VS workspaces created in every zone, you can bring your own existing Power VS workspace into CRAIG. This also allows you to choose custom images for Power VSIs. See [Bring Your Own Power VS Workspace](.docs/craig-code-engine.md#bring-your-own-power-vs-workspace) for more information.

If CRAIG will not be used for Power VS configuration, `deploy.sh` can be run without parameters to deploy CRAIG into Code Engine:

```bash
./deploy.sh
```
For the full list of parameters which allows full customization of the IBM Code Engine deployment, specify the `-h` parameter:

```
./deploy.sh -h
```

This script can also delete the resources created when the delete flag `-d` is passed:

```bash
./deploy.sh -d
```

Note, if you've specified custom parameters beyond the default values for your deploy script, then you must specify them after the delete flag in order to delete all resources properly. 

For example, to delete the CRAIG Code Engine and Container Registry resources with custom parameters resource group: `test-rg`, namespace: `craig-demo-namespace`, and project name: `craig-demo-project`, then the script must be specified as followed:

```bash
./deploy.sh -d -g test-rg -n craig-demo-namespace -p craig-demo-project
```

#### Updating and managing the Code Engine deployment
As CRAIG releases updates the Code Engine deployment can be updated to the latest version. For more information on updating and managing the CRAIG application in Code Engine see the [CRAIG in IBM Code Engine](.docs/craig-code-engine.md#craig-in-ibm-code-engine).

---

### Building Local Container Image

To build CRAIG locally the following Docker command can be used.

```shell
docker build . -t craig
```

#### Running the Container Image Locally

Make sure to set the `API_KEY` variable in a `.env` file to be used for IBM Cloud integration. To dynamically fetch Power VS images and storage pools within CRAIG, the IBM Power VS APIs require a workspace to be created and its GUID to be in an environment file. See [Power VS Workspace Deployment](.docs/power-vs-workspace-deployment.md) for more information.

See `.env.example` found [here](./.env.example)

```shell
docker run -t -d -p 8080:8080 --env-file .env -- craig
```

CRAIG is now available at http://localhost:8080.

---

### Setting Up CRAIG Development Environment

To run CRAIG in your development environment, follow the [development environment setup steps](.docs/dev-env-setup.md).

---

## Running the Terraform Files

After creating a deployment using the GUI, users can download a file called `craig.zip`. Included in this file are all the Terraform files needed to create your environment. See the [Running the Terraform Files](.docs/running-terraform-files.md) for more information on using Terraform with the CRAIG generated Terraform.

---

## Schematics Integration

Using [IBM Cloud Schematics](https://cloud.ibm.com/docs/schematics?topic=schematics-getting-started) with CRAIG can be powerful way to automate and manage Infrastructure as code deployments. With Schematics you don't have to worry about setting up and maintaining the Terraform command-line. See [Integrate Schematics with CRAIG](.docs/schematics-how-to.md) for more information.

---

## Code Test Coverage

File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------|---------|----------|---------|---------|-------------------
All files                   |     100 |      100 |     100 |     100 | 🏆   
 client/src/lib             |     100 |      100 |     100 |     100 | 🏆   
 client/src/lib/docs        |     100 |      100 |     100 |     100 | 🏆   
 client/src/lib/forms       |     100 |      100 |     100 |     100 | 🏆   
 client/src/lib/json-to-iac |     100 |      100 |     100 |     100 | 🏆   
 client/src/lib/state       |     100 |      100 |     100 |     100 | 🏆   
 express-controllers        |     100 |      100 |     100 |     100 | 🏆    
 unit-tests/mocks           |     100 |      100 |     100 |     100 | 🏆   

---

## Contributing

Found a bug or need an additional feature? File an issue in this repository with the following information and they will be responded to in a timely manner.

### Bugs

- A detailed title describing the issue with the current release and the tag `[BUG]`. For sprint one, filing a bug would have the title `[0.1.0][BUG] <issue title>`
- Steps to recreate said bug (including non-sensitive variables)
- (optional) Corresponding output logs **as text or as part of a code block**
- Tag bug issues with the `bug` label
- If you come across a vulnerability that needs to be addressed immediately, use the `vulnerability` label


### Features

- A detailed title describing the desired feature that includes the current release. For sprint one, a feature would have the title `[0.1.0] <feature name>`
- A detailed description including the user story
- A checkbox list of needed features
- Tag the issue with the `enhancement` label

Want to work on an issue? Be sure to assign it to yourself and branch from main. When you're done making the required changes, create a pull request.

### Pull requests

**Do not merge directly to main**. Pull requests should reference the corresponding issue filed in this repository. Please be sure to maintain **code coverage** before merging.

At least **two** reviews are required to merge a pull request. When creating a pull request, please ensure that details about unexpected changes to the codebase are provided in the description.

