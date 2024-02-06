# Running the Terraform Files

After creating a deployment using the GUI, users can download a file called `craig.zip`. Included in this file are all the Terraform files needed to create your environment. In addition, your environment configuration is saved as `craig.json` and can easily be imported into the GUI for further customization.

## Prerequisites

- Terraform v1.3 or higher
- Terraform CLI
- IBM Cloud Platform API Key

### 1. Initializing the Directory

After unzipping craig.zip, enter the containing folder from your terminal. In your directory, run the following command to install needed providers and to initialize the directory:
```
terraform init
```

### 2. Adding Environment Variables

Once your environment has been initialized, add your IBM Cloud Platform API key to the environment. This can be done by exporting your API key as an environment variable. Once that's complete, run the following command to plan your terraform directory.

```
terraform plan
```

### 3. Creating Resources

Resources can be created from the directory by running the Terraform Apply command after a successful plan

```
terraform apply
```

### 4. Destroying Resources

To destroy your resources, use the following command. This will **delete all resources** provisioned by the template.

```
terraform destroy
```
