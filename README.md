# Cloud Resource and Infrastructure-as-code Generator (CRAIG)

Cloud Resource and Infrastructure-as-Code Generator (or **CRAIG**) allows users to generate Terraform Deployable Architecures to create a fully customizable environment on IBM Cloud.

CRAIG simplifies the process of creating IaC through its GUI, which manages and updates interconnected resources as they are created.

CRAIG configures infrastructure using JSON to create full VPC networks, manage security and networking with VSI deployments, and create services, clusters, and manage IAM for an IBM Cloud Account. This JSON configuration can be imported to quick start environments, and can be downloaded as Terraform code directly from the GUI.

---

## Prerequisites

- NodeJS 18.11 or higher
- NPM version 8.19.2 or higher
- Terraform 1.3 or higher

---

## Installation

1. [Running CRAIG Application Locally](#running-craig-application-locally)
2. [Setting Up CRAIG Development Environment](#setting-up-craig-development-environment)
3. [Building Local CRAIG Container Image](#building-local-container-image)
4. [Deploying To IBM Code Engine](#deploying-to-ibm-code-engine)

---

### Running CRAIG Application Locally

To get started using CRAIG locally, follow these steps:

#### 1. Install Dependencies

To install needed dependencies, use the command
```shell
npm run setup
```

#### 2. Set envionment variables

Add you IBM Cloud platform API key to the environment. This API key is used by the back end API server to retrieve Cluster flavors, Cluster versions, VSI instance profiles, and VSI images.

```
export API_KEY="<your ibm cloud platform API key>"
```

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

#### 2. Set envionment variables

Add you IBM Cloud platform API key to the environment. This API key is used by the back end API server to retrieve Cluster flavors, Cluster versions, VSI instance profiles, and VSI images.

```shell
export API_KEY="<your ibm cloud platform API key>"
```

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

#### 6. Testing the Development Envionment

CRAIG uses [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) for unit testing. To run unit tests use the command:

```shell
npm run test
```

Craig uses [nyc](https://www.npmjs.com/package/nyc) for unit test coverage. To get a report of unit test coverage run the command

```shell
npn run coverage
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

Within the root directory is a script `deploy.sh` which deploys CRAIG to IBM Cloud Code Engine. At a minimum an IBM Cloud API key will be needed that has sufficient permissions to provision a Code Engine project, application, and secrets. In addition, this API key must be able to create a IBM Container Registry namespace. See below for a simple use case using the default parameters.

```bash
npm run deploy -- -a <API_KEY>
```

This script can also delete the resources when the delete flag `-d` is passed

```bash
npm run deploy -- -d -a <API_KEY>
```

Below is the full list of parameters and their default values

```
Syntax: $ deploy.sh [-h] [-d] [-a API KEY] [-r REGION] [-g RESOURCE GROUP] [-p PROJECT NAME] [-n ICR NAMESPACE]
Options:
  a     IBM Cloud Platform API Key (REQUIRED).
  d     Delete resources.
  g     Resource group to deploy resources in. Default value = 'default'
  h     Print help.
  n     IBM Cloud Container Registry namespace. Default value = 'slz-gui-namespace'
  p     Name of Code Engine project. Default value = 'slz-gui'
  r     Region to deploy resources in. Default value = 'us-south'
```

or run

```bash
npm run deploy -- -h
```

---

## Running the Terraform Files

After creating a deployment using the GUI, users can download a file called `craig.zip`. Included in this file are all the Terraform files needed to create you environment. In addition, your environment configuration is saved as `craig.json` and can easily be imported into the GUI for further customization.

### Prerequisites

- Terraform v1.3 or higher
- Terraform CLI
- IBM Cloud Platform API Key

#### 1. Intializing the Directory

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

Found a bug or need an additional feature? File an issue in this repository with the following information.

### Bugs

- A detailed title describing the issue beginning with `[BUG]` and the current release. For sprint one, filing a bug would have the title `[BUG][0.1.0] <issue title>`
- Steps to recreate said bug (including non-sensitive variables)
- (optional) Corresponding output logs **as text or as part of a code block**
- Tag the issue with the `bug` label 

### Features

- A detailed title describing the desired feature that includes the current release. For sprint one, a feature would have the title `[0.1.0] <feature name>`
- A detailed description including the user story
- A checkbox list of needed features
- Tag the issue with the `enhancement` label

Want to work on an issue? Be sure to assign it to yourself and branch from main. When you're done making the required changes, create a pull request.

### Pull requests

**Do not merge directly to main**. Pull requests should reference the corresponding issue filed in this repository. Please be sure to maintain **code coverage** before merging.

At least **two** reviews are required to merge a pull request. When creating a pull request, please ensure that details about unexpected changes to the codebase are provided in the description.

