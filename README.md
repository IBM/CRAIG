# Cloud Resource and Infrastructure-as-code Generator (CRAIG)

## Building Example Terraform Files

Run the following commands to build a terraform environment for testing:

### Creating Test Folder

If you do not have a folder `tf-test` created in the root directory, create one

```shell
mkdir tf-test
```

### Run the NPM Command

```shell
npm run tf -- <json file path>
```
---
## Building Container Image
To build CRAIG locally the following Docker command can be used. The Dockerfile takes in two possible build arguments region and api_key.
```
docker build . --build-arg region=us-south --build-arg api_key=$API_KEY -t craig
```
to run the container
```
docker run -it craig
```
---
## Deploying to Code Engine with `deploy.sh`

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

## Code Test Coverage

File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |     100 |      100 |     100 |     100 | 🏆
 lib                      |     100 |      100 |     100 |     100 | 🏆
  builders.js             |     100 |      100 |     100 |     100 | 🏆
  constants.js            |     100 |      100 |     100 |     100 | 🏆
 lib/forms                |     100 |      100 |     100 |     100 | 🏆
  duplicate-name.js       |     100 |      100 |     100 |     100 | 🏆
  format-json.js          |     100 |      100 |     100 |     100 | 🏆
  index.js                |     100 |      100 |     100 |     100 | 🏆
  invalid-callbacks.js    |     100 |      100 |     100 |     100 | 🏆
  text-callbacks.js       |     100 |      100 |     100 |     100 | 🏆
 lib/json-to-iac          |     100 |      100 |     100 |     100 | 🏆
  appid.js                |     100 |      100 |     100 |     100 | 🏆
  atracker.js             |     100 |      100 |     100 |     100 | 🏆
  clusters.js             |     100 |      100 |     100 |     100 | 🏆
  config-to-files-json.js |     100 |      100 |     100 |     100 | 🏆
  constants.js            |     100 |      100 |     100 |     100 | 🏆
  event-streams.js        |     100 |      100 |     100 |     100 | 🏆
  f5.js                   |     100 |      100 |     100 |     100 | 🏆
  flow-logs.js            |     100 |      100 |     100 |     100 | 🏆
  iam.js                  |     100 |      100 |     100 |     100 | 🏆
  key-management.js       |     100 |      100 |     100 |     100 | 🏆
  object-storage.js       |     100 |      100 |     100 |     100 | 🏆
  resource-groups.js      |     100 |      100 |     100 |     100 | 🏆
  scc.js                  |     100 |      100 |     100 |     100 | 🏆
  secrets-manager.js      |     100 |      100 |     100 |     100 | 🏆
  security-groups.js      |     100 |      100 |     100 |     100 | 🏆
  ssh-keys.js             |     100 |      100 |     100 |     100 | 🏆
  teleport.js             |     100 |      100 |     100 |     100 | 🏆
  transit-gateway.js      |     100 |      100 |     100 |     100 | 🏆
  utils.js                |     100 |      100 |     100 |     100 | 🏆
  vpc.js                  |     100 |      100 |     100 |     100 | 🏆
  vpe.js                  |     100 |      100 |     100 |     100 | 🏆
  vpn.js                  |     100 |      100 |     100 |     100 | 🏆
 lib/state                |     100 |      100 |     100 |     100 | 🏆
  appid.js                |     100 |      100 |     100 |     100 | 🏆
  atracker.js             |     100 |      100 |     100 |     100 | 🏆
  clusters.js             |     100 |      100 |     100 |     100 | 🏆
  cos.js                  |     100 |      100 |     100 |     100 | 🏆
  defaults.js             |     100 |      100 |     100 |     100 | 🏆
  event-streams.js        |     100 |      100 |     100 |     100 | 🏆
  index.js                |     100 |      100 |     100 |     100 | 🏆
  key-management.js       |     100 |      100 |     100 |     100 | 🏆
  load-balancers.js       |     100 |      100 |     100 |     100 | 🏆
  options.js              |     100 |      100 |     100 |     100 | 🏆
  resource-groups.js      |     100 |      100 |     100 |     100 | 🏆
  scc.js                  |     100 |      100 |     100 |     100 | 🏆
  secrets-manager.js      |     100 |      100 |     100 |     100 | 🏆
  security-groups.js      |     100 |      100 |     100 |     100 | 🏆
  ssh-keys.js             |     100 |      100 |     100 |     100 | 🏆
  state.js                |     100 |      100 |     100 |     100 | 🏆
  store.utils.js          |     100 |      100 |     100 |     100 | 🏆
  transit-gateways.js     |     100 |      100 |     100 |     100 | 🏆
  utils.js                |     100 |      100 |     100 |     100 | 🏆
  vpc.js                  |     100 |      100 |     100 |     100 | 🏆
  vpe.js                  |     100 |      100 |     100 |     100 | 🏆
  vpn.js                  |     100 |      100 |     100 |     100 | 🏆
  vsi.js                  |     100 |      100 |     100 |     100 | 🏆

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

To run tests,

```shell
npm run test
```

To check code coverage:

```shell
npm run coverage
```

At least **two** reviews are required to merge a pull request. When creating a pull request, please ensure that details about unexpected changes to the codebase are provided in the description.