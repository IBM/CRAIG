# Power VS Workspace Deployment

To dynamically fetch Power VS images and storage pools within CRAIG, the IBM Power VS APIs require a workspace to be created. CRAIG provides Terraform scripts to automatically provision these workspaces and an environment file that can be used for both IBM Code Engine deployments and local deployments.

>* _**Note:** this only needs to be done once per IBM Cloud Account, not per user of CRAIG._
>* _The deploy.sh script used to deploy CRAIG in IBM Code Engine can also automatically deploy the workspaces using its `-z` parameter._

## Prerequisites
- [Create an IBM Cloud API Key](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui#create_user_key)
- [jq](https://jqlang.github.io/jq/) v1.7 or higher


<br /> _Note: If you plan on [deploying CRAIG To IBM Code Engine](../README.md#deploying-to-ibm-code-engine), ensure you are using the same account you intend to use for CRAIG deployment in Code Engine when creating the API key and doing the PowerVS Workspace Deployment setup below._


## Automated Deployment

The `terraform.sh` script found in the `/deploy` folder of the CRAIG root directory provisions a Power VS Workspace in each zone worldwide and sets the needed environment variables with the format of `POWER_WORKSPACE_<zone>=<workspace-guid>`.

Use the following command to run the script:
```shell
sh deploy/terraform.sh -a "<Your IBM Cloud Platform API key>"
```

This will produce a file named `.env` that can be passed to the `deploy.sh` script when deploying CRAIG in Code Engine.

#### Bring Your Own Workspace

If you do not want Power VS workspaces created in every zone or if you want to use custom images you can bring your own Power VS Workspace into CRAIG. The [generate-env.sh](../generate-env.sh) script can generate a `.env` environment file containing all of the workspaces in your account.

#### generate-env.sh prerequisites
- [jq](https://jqlang.github.io/jq/) v1.7 or higher
- [IBM Cloud CLI](https://cloud.ibm.com/docs/cli?topic=cli-getting-started)

To generate a `.env` file containing all of the workspaces in your account, you can run the following command:

```
./generate-env.sh .env
```

The `.env` file should then be modified to remove or comment out any workspaces that CRAIG should not use, and to ensure it contains only one workspace per zone. The `API_KEY` key and value should also be added to the file, see [.env.example](../.env.example) for more information.

