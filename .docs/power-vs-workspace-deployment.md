# Power VS Workspace Deployment

To dynamically fetch Power VS images and storage pools within CRAIG, the IBM Power VS APIs require a workspace to be created. CRAIG provides Terraform scripts to automatically provision these workspaces and an environment file that can be used for both IBM Code Engine deployments and local deployments.

>* _**Note:** this only needs to be done once per IBM Cloud Account, not per user of CRAIG._
>* _The `deploy.sh` script used to deploy CRAIG in IBM Code Engine can also automatically deploy the workspaces using its `-z` parameter. See our [README](../README.md#deploying-to-ibm-code-engine) for further instructions on how to run the deploy script._

## Prerequisites
- [Create an IBM Cloud API Key](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui#create_user_key)

_If runnning outside of IBM Cloud Shell:_
- [jq](https://jqlang.github.io/jq/) v1.7 or higher
- ibmcloud cli

## Automated Power VS Workspace Deployment for Local CRAIG Installations

The `terraform.sh` script found in the `/deploy` folder of the CRAIG root directory provisions a Power VS Workspace in each zone worldwide and sets the needed environment variables with the format of `POWER_WORKSPACE_<zone>=<workspace-guid>`.

Use the following command to run the script:
```shell
sh deploy/terraform.sh -a "<Your IBM Cloud Platform API key>"
```

This will produce a file named `.env` in your local environment. 

The `API_KEY` key and value should also be added to the `.env` file, see [.env.example](../.env.example) for more information.


## Bring your own Power VS workspace

### Background
You can bring your own existing Power VS workspace into CRAIG which allows you to choose custom images for Power VSIs.

The IBM Code Engine deployment script will automatically create Power VS workspaces in every Power VS zone worldwide for CRAIG's use when using the `-z` parameter.

If you do not want Power VS workspaces created in every zone, you can create the Power VS Workspaces in your chosen zone(s) using the Clould console, CLI, or other means. The [generate-env.sh](../generate-env.sh) script can generate an environment file that can be used with the `deploy.sh` script to configure CRAIG to use the workspaces. 

### Bring Your Own Workspace for CRAIG Code Engine Deployment Script

#### 1. Download the generate-env.sh script within the IBM Cloud Shell
From within IBM Cloud Shell run the following two commands to download the script and make it executable:
```bash
wget https://raw.githubusercontent.com/IBM/CRAIG/main/generate-env.sh
chmod 755 generate-env.sh
```
#### 2. Run generate-env.sh to generate `env` file
To generate an `env` file containing all of the workspaces in your account, you can run the following command:

```
./generate-env.sh env
```

The `env` file should then be modified to remove or comment out any workspaces that CRAIG should not use, and to ensure it contains only one workspace per zone.

#### 3. Run deploy.sh using generated `env` file
The `env` file can then be used on the `deploy.sh` script:

```
./deploy.sh -e env
```

See our [README](../README.md#deploying-to-ibm-code-engine) for further instructions on how to run the deploy script.

### Modifying the CRAIG Code Engine configmap Post-Deployment
If you want to bring your own workspace after CRAIG deployment in Code Engine you can update the configmap with the GUID of your workspace.

To find the GUIDs and locations of your workspaces, the following IBM Cloud CLI command can be run in a terminal window or an IBM Cloud Shell:

```
ibmcloud resource service-instances --service-name power-iaas --output json | jq -r '.[]? | "\(.guid), \(.name), \(.region_id)"'
```

To modify the configmap to add your workspace GUID, click on `Secrets and configmaps` on left navigation pane of the Code Engine project. Click on the `craig-env` Configmap. Find the key that matches your workspace's zone and set your workspace's GUID as the value for the key. Click the `Save` button. The CRAIG instance can then be [redeployed](#redeploying-the-craig-instance) to pick up the configmap change.

If CRAIG was deployed without specifying `-z` or `-e`, a configmap can be manually created and set with the correct key-value for the zone. See the [.env.example](../.env.example) for the possible keys and the [IBM Code Engine documentation](https://cloud.ibm.com/docs/codeengine?topic=codeengine-configmap) for how to create the configmap and add the reference to the `craig` application.


### Bring Your Own Workspace for local CRAIG installations


#### Prerequisites for running generate-env.sh locally
- [jq](https://jqlang.github.io/jq/) v1.7 or higher
- ibmcloud CLI

#### 1. Navigate to your CRAIG root directory and make generate-env.sh executable

```bash
chmod 755 generate-env.sh
```
#### 2. Run generate-env.sh to generate `env` file
To generate an `env` file containing all of the workspaces in your account, you can run the following command:

```
./generate-env.sh env
```
#### 3. Modify `env` file
The `env` file should then be modified to remove or comment out any workspaces that CRAIG should not use, and to ensure it contains only one workspace per zone. The `API_KEY` key and value should also be added to the file, see [.env.example](../.env.example) for more information.

If you're using your CRAIG directory in source control, ensure you also rename the `env` file to `.env` to make it hidden and recognized by `.gitignore` to avoid uploading sensitive data to Github.
