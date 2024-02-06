# Power VS Workspace Deployment

To dynamically fetch Power VS images and storage pools within CRAIG, the IBM Power VS APIs require a workspace to be created. CRAIG provides Terraform scripts to automatically provision these workspaces and an environment file that can be used for both IBM Code Engine deployments and local deployments.

>* _**Note:** this only needs to be done once per IBM Cloud Account, not per user of CRAIG._
>* _This is a recommended but optional step. If these workspaces are not deployed CRAIG will use a static list which may include options that are not available in a specific zone._
>* _The deploy.sh script used to deploy CRAIG in IBM Code Engine can also automatically deploy the workspaces using its `-z` parameter._

## Prerequisites
- [Create an IBM Cloud API Key](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui#create_user_key)
- [jq](https://jqlang.github.io/jq/) v1.7 or higher


<br /> _Note: If you plan on [deploying CRAIG To IBM Code Engine](../README.md#deploying-to-ibm-code-engine), ensure you are using the same account you intend to use for CRAIG deployment in Code Engine when creating the API key and doing the PowerVS Workspace Deployment setup below._


## Automated Deployment

The `terraform.sh` script found in the `/deploy` folder of the CRAIG root directory provisions a Power VS Workspace in each zone and sets the needed environment variables with the format of `POWER_WORKSPACE_<zone>=<workspace-guid>`.

Use the following command to run the script:
```shell
sh deploy/terraform.sh -a "<Your IBM Cloud Platform API key>"
```

This will produce a file named `.env` that can be passed to the `deploy.sh` script when deploying CRAIG in Code Engine.

#### Bring Your Own Workspace

To bring your own Power VS Workspace into CRAIG to fetch images, you will need to set a field in your `.env` with the following format. To see an example, see [.env.example](../.env.example)

```
POWER_WORKSPACE_<zone-of-workspace>=<workspace-guid>
```

To find the GUIDs and locations of your workspaces, the following IBM Cloud CLI command can be run in a terminal window or an IBM Cloud Shell: 

```
ibmcloud resource service-instances --service-name power-iaas --output json | jq -r '.[]? | "\(.guid), \(.name), \(.region_id)"'
```

*For instructions on how to install the IBM Cloud CLI, click [here](https://cloud.ibm.com/docs/cli?topic=cli-getting-started)*
