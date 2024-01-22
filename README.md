# Cloud Resource and Infrastructure-as-code Generator (CRAIG)

Cloud Resource and Infrastructure-as-Code Generator (or **CRAIG**) allows users to generate Terraform Deployable Architectures to create a fully customizable environment on IBM Cloud.

CRAIG simplifies the process of creating IaC through its GUI, which manages and updates interconnected resources as they are created.

CRAIG configures infrastructure using JSON to create full VPC networks, manage security and networking with VSI deployments, and create services, clusters, and manage IAM for an IBM Cloud Account. This JSON configuration can be imported to quick start environments, and can be downloaded as Terraform code directly from the GUI.

---

## Prerequisites

- NodeJS 18.11 or higher
- NPM version 8.19.2 or higher
- Terraform 1.3 or higher
- [jq](https://jqlang.github.io/jq/) version 1.7.1 or higher

---

## Installation

1. [Running CRAIG Application Locally](#running-craig-application-locally)
2. [Setting Up CRAIG Development Environment](#setting-up-craig-development-environment)
3. [Building Local CRAIG Container Image](#building-local-container-image)
4. [Deploying To IBM Code Engine](#deploying-to-ibm-code-engine)

---

## Power VS Workspace Deployment

To dynamically fetch Power VS images and storage pools, the IBM Power VS APIs require a workspace to be created. CRAIG provides Terraform scripts to automatically provision these workspaces and import the GUIDs into the local NodeJS environment.

### Automated Deployment

The `terraform.sh` script found in `/deploy` provisions a Power VS Workspace in each zone and sets the needed environment variables with the format of `POWER_WORKSPACE_<zone>=<workspace-guid>`.

Use the following command to run the script:
```shell
sh deploy/terraform.sh -a "<Your IBM Cloud Platform API key>"
```

### Bring Your Own Workspace

To bring your own Power VS Workspace into CRAIG to fetch images, you will need to set a field in your `.env` with the following format. To see an example, see [.env.example](./.env.example)

```
POWER_WORKSPACE_<zone-of-workspace>=<workspace-guid>
```

To find the GUIDs and locations of your workspaces, the following command can be run in a terminal window or an IBM Cloud Shell: 

```
ibmcloud resource service-instances --service-name power-iaas --output json | jq -r '.[]? | "\(.guid), \(.name), \(.region_id)"'
```

For instructions on how to install the IBM Cloud CLI, click [here](https://cloud.ibm.com/docs/cli?topic=cli-getting-started)
---

## Tutorial Video

[Follow this tutorial](https://ibm.box.com/v/craigTutorialVideo) for step-by-step instructions on how to get started with CRAIG.

***Ensure `Quality: 1080p` is selected within Box video player settings for the best viewing experience.***

---

### Running CRAIG Application Locally

To get started using CRAIG locally, follow these steps:

#### 1. Install Dependencies

To install needed dependencies, use the command
```shell
npm run setup
```

#### 2. Creating .env file

Make sure to set the following fields in a `.env` file to be used as environment variables by the backend API server. These fields are used to populate dynamic information to the frontend from cloud account where the API key originates. To automatically deploy the CRAIG Power VS workspaces and set the appropriate environment variables run the `terraform.sh` script in `/deploy`.

see `.env.example` found [here](./.env.example)

#### 3. Start the application

Building the application, installing dependencies, and starting the server can be done with one easy command. From your directory, run:

```
npm run start
```

#### 4. Open the Application

Congratulations! Your application is now available at localhost:8080!

---

### Setting Up CRAIG Development Environment

CRAIG is a flexible application that can be used directly from your local environment or containerized an deployed to your platform of choice. 

To run CRAIG in your development environment, follow these steps:

#### 1. Install Dependencies

To install needed dependencies, use the command
```shell
npm run setup
```

#### 2. Creating .env file

Make sure to set the following fields in a `.env` file to be used as environment variables by the backend API server. These fields are used to populate dynamic information to the frontend from cloud account where the API key originates. To automatically deploy the CRAIG Power VS workspaces and set the appropriate environment variables run the `terraform.sh` script in `/deploy`.

see `.env.example` found [here](./.env.example)

#### 3. Starting the Back-End Server

In order to make sure the Back-End API calls are successful, the server needs to be started. To start the server run the following command from the root directory:

```shell
node server.js
```

#### 4. Starting the Front-End Application

CRAIG uses [craco](https://www.npmjs.com/package/@craco/craco) to setup and run the development environment. To start the development build server, run the following command in parallel with [Step 3](#3-starting-the-back-end-server):

```shell
npm run dev-start
```

#### 5. Opening the Application

Congratulations! CRAIG is now running at `localhost:3000`

#### 6. Testing the Development Environment

CRAIG uses [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) for unit testing. To run unit tests use the command:

```shell
npm run test
```

Craig uses [nyc](https://www.npmjs.com/package/nyc) for unit test coverage. To get a report of unit test coverage run the command

```shell
npm run coverage
```

#### 7. Install Pre-commit Hook
```shell
git config --local core.hooksPath .githooks/
```

---

### Building Local Container Image

To build CRAIG locally the following Docker command can be used. The Dockerfile accepts `api_key` as a build argument.

```shell
docker build . --build-arg api_key=$API_KEY -t craig
```

#### Running the Container Image Locally

```shell
docker run -it craig
```

---

### Deploying to IBM Code Engine

Within the root directory is a script `deploy.sh` which deploys CRAIG to IBM Cloud Code Engine. The user running this command must have sufficient permissions to provision a Code Engine project, application, image build, and secrets. In addition, this API key must be able to create a IBM Container Registry namespace. See below for a simple use case using the default parameters.

#### Prerequisites for running deploy.sh from IBM Cloud Shell (recommended)
>* An API key must be provided that will be used for CRAIG's integration with IBM Cloud Schematics and Power Virtual Server Workspaces. This API key will also be used for IBM Code Engine's access to the IBM Container Registry. See later sections in this document about Schematics and Power Virtual Server integrations for more information.

#### Prerequisites for running deploy.sh outside of IBM Cloud Shell
>* The `ibmcloud` CLI must be [installed](https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli)
>* `ibmcloud login` must be run before invoking the script
>* An API key must be provided that will be used for CRAIG's integration with IBM Cloud Schematics and Power Virtual Server Workspaces. This API key will also be used for IBM Code Engine's access to the IBM Container Registry. See later sections in this document about Schematics and Power Virtual Server integrations for more information.

#### Downloading deploy.sh in IBM Cloud Shell
From within IBM Cloud Shell run the following two commands to download the deploy.sh script and make it executable:
```bash
wget https://raw.githubusercontent.com/IBM/CRAIG/main/deploy.sh
chmod 755 deploy.sh
```

#### Running the deploy script

By default the script will securely prompt you for your API key. It may also be read from an environment variable or specified as a command line argument. See the `deploy.sh -h` usage for more information.

```bash
deploy.sh
```

This script can also delete the resources when the delete flag `-d` is passed

```bash
deploy.sh -d
```

For the full list of parameters which allows full customization of the IBM Code Engine deployment, specify the `-h` parameter:
```
deploy.sh -h
```

---

## Running the Terraform Files

After creating a deployment using the GUI, users can download a file called `craig.zip`. Included in this file are all the Terraform files needed to create you environment. In addition, your environment configuration is saved as `craig.json` and can easily be imported into the GUI for further customization.

### Prerequisites

- Terraform v1.3 or higher
- Terraform CLI
- IBM Cloud Platform API Key

#### 1. Initializing the Directory

After unzipping craig.zip, enter the containing folder from your terminal. In your directory, run the following command to install needed providers and to initialize the directory:
```
terraform init
```

#### 2. Adding Environment Variables

Once your environment has been initialized, add your IBM Cloud Platform API key to the environment. This can be done by exporting your API key as an environment variable. Once that's complete, run the following command to plan your terraform directory.

```
terraform plan
```

#### 3. Creating Resources

Resources can be created from the directory by running the Terraform Apply command after a successful plan

```
terraform apply
```

#### 4. Destroying Resources

To destroy you resources, use the following command. This will **delete all resources** provisioned by the template.

```
terraform destroy
```

---

## Schematics Integration

In order to allow Schematics integration, users should make sure they have the following access policy roles for the Schematics service set within their IBM Cloud Account:

- IBM Cloud Platform Roles: Editor or Higher
- Schematics Service Roles: Writer or Higher

These roles allow the integration with Schematics including the Schematics workspace creation and the upload of the project. However, to create and manage the IBM Cloud resources in a CRAIG project, you must be assigned the IAM platform or service access role for the individual IBM Cloud resources being provisioned in the project. 

 Refer to the [User permissions for Schematics Workspaces documentation](https://cloud.ibm.com/docs/schematics?topic=schematics-access) for more information.

### Prerequisites
- `.env` file is created and all fields to be used as environment variables by the backend API server are filled (see [Step 2 of Setting Up CRAIG Development Environment](#2-creating-env-file-1))

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

