# Setting Up CRAIG Development Environment

CRAIG is a flexible application that can be used directly from your local environment or containerized and deployed to your platform of choice. 

To run CRAIG in your development environment, follow these steps:

## 1. Install Dependencies

To install needed dependencies, use the command
```shell
npm run setup
```

## 2. Creating .env file

Make sure to set the `API_KEY` variable in a `.env` file to be used for IBM Cloud integration. To dynamically fetch Power VS images and storage pools within CRAIG, the IBM Power VS APIs require a workspace to be created and its GUID to be in an environment file. See [Power VS Workspace Deployment](.docs/power-vs-workspace-deployment.md) for more information.

See `.env.example` found [here](./.env.example)

## 3. Starting the Back-End Server

In order to make sure the Back-End API calls are successful, the server needs to be started. To start the server run the following command from the root directory:

```shell
node server.js
```

## 4. Starting the Front-End Application

CRAIG uses [craco](https://www.npmjs.com/package/@craco/craco) to setup and run the development environment. To start the development build server, run the following command in parallel with [Step 3](#3-starting-the-back-end-server):

```shell
npm run dev-start
```

## 5. Opening the Application

Congratulations! CRAIG is now running at `localhost:3000`

## 6. Testing the Development Environment

CRAIG uses [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) for unit testing. To run unit tests use the command:

```shell
npm run test
```

Craig uses [nyc](https://www.npmjs.com/package/nyc) for unit test coverage. To get a report of unit test coverage run the command

```shell
npm run coverage
```

## 7. Install Pre-commit Hook
```shell
git config --local core.hooksPath .githooks/
```