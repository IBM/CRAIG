# Access policies and account settings


## Account settings
The following account settings should be enabled:
- Manage -> Account Settings
    - Activate Financial Services Validated
    - Activate EU Supported
    - Activate Virtual routing and forwarding
    - Service endpoints

## Automation of Access Policy Creation

The `access.sh` script automates the creation of 3 access groups which assign all required access policies needed for CRAIG deployment, application runtime, and provisioning of all resources depending on the use case.

### Prerequisites

- _To use this script, users must be the Account Owner or have the following type of access in their Cloud Account:_
  - **_Administrator or editor on the IAM Access Groups account management services_**
  - **_Administrator or editor on the IAM Account Management services_**
  - **_Administrator or editor on the All Identity and Access enabled services_**
  - **_Administrator or editor for the All Account Management services_**

- _Requires that the ibmcloud CLI be installed and a ibmcloud login has been performed prior to running the script (or run using the IBM Cloud Shell)._

### Access Groups that are created

- _1st Access Group: craig-deployer:_
    
    Assigns all access policies required for the service ID or user account that is logged into the ibmcloud CLI when running the deploy.sh script in order to create a Code Engine project, Container Registry namespace, application, image build, and secrets. This access is also needed by the service ID or user account owning the API key specified to the deploy.sh script to successfully create a schematics workspace, and PowerVS workspaces in every PowerVS zone when running deploy.sh with the `-z` parameter. 
    

- _2nd Access Group: craig-application:_
    
    Assigns all access required for CRAIG to dynamically fetch account information such as VSI & Power VS images, storage tiers, and storage pools from IBM Cloud, as well as the ability to create and upload data to schematics workspaces. 
    
    Note: If you deploy CRAIG with the deploy.sh script then this access group must be assigend to the service ID or user account that owns the API key you give deploy.sh. It is good practice to make sure that a service ID or user account is assigned to both the craig-deployer and craig-application access groups before deploying and using CRAIG.
    


- _3rd Access Group: craig-terraform-applier:_
    
    Assigns high level access required to create resources through Terraform or Schematics "Apply" on the service ID or user account owning the API key set on the API key variable of the CRAIG generated Terraform.
    


### Configuring the access script
If you're running the script within IBM Cloud Shell then you must run the following two commands to download the `access.sh` script and make it executable:
```bash
wget https://raw.githubusercontent.com/IBM/CRAIG/main/access.sh
chmod 755 access.sh
```
If you are running the access script locally, first make sure you are logged into IBM Cloud, then simply make sure your in the root CRAIG directory and make the script executable:
```bash
chmod 755 access.sh
```

### Running the access script


The script can be run without any parameters to automatically create your access groups:

```bash
./access.sh
```

This script can also delete the access groups created when the delete flag `-d` is passed:

```bash
./access.sh -d
```
For the more information about the script, specify the `-h` parameter:

```
./access.sh -h
```

**_After running the script, users should navigate to the IBM Cloud UI to assign users/service IDs to the respective access groups before deploying and using CRAIG._**

## Creating Access Groups Manually 

Users can also create and define access groups and policies for CRAIG use manually. Below are detailed instructions on how to create the access groups and policies needed for CRAIG deployment, application runtime, and provisioning of all resources depending on the use case.

### CRAIG Deployment Access Group

The service ID or user account that is logged into the ibmcloud CLI when running the `deploy.sh` script must have the following necessary access policies in order to create a Code Engine project, Container Registry namespace, application, image build, and secrets. 

_This access is also needed by the service ID or user account owning the API key specified to the `deploy.sh` script to successfully create a schematics workspace, and PowerVS workspaces in every PowerVS zone when running `deploy.sh` with the `-z` parameter._

The following steps list how to create an access group with these required access policies:

- Create Access Group
    - Manage -> Access (IAM) -> Access Groups -> Create +
    - Name the access group  _(i.e. CRAIG Deployment)_
    - Add users and/or service IDs as needed
    - Navigate to Access tab -> Assign access +
    - Create an access policy for each of the following:

| Service                            | Resources                          | Access          |
|-                                   |-                                   |-                |
| All Account Management services    | All                                | Viewer          |
| Code Engine                        | All                                | Writer, Editor  |
| Container Registry                 | All                                | Manager         |
| Resource Group Only                | All resource groups in the account | Viewer, Editor  |
| Schematics                         | All                                | Manager, Editor |
| Workspace for Power Virtual Server | All                                | Manager, Editor |

### CRAIG Application Access Group

The service ID or user account owning the API key given to the `deploy.sh` script must have the following necessary access policies in order for CRAIG to dynamically fetch account information such as VSI & Power VS images, storage tiers, and storage pools from IBM Cloud, as well as the ability to create and upload data to schematics workspaces.  

_It is good practice to make sure that a service ID or user account is assigned to both the CRAIG Deployment and Application Access Groups._

The following steps list how to create an access group with these required access policies:

- Create Access Group
    - Manage -> Access (IAM) -> Access Groups -> Create +
    - Name the access group _(i.e. CRAIG Application)_
    - Add users and/or service IDs as needed
    - Navigate to Access tab -> Assign access +
    - Create an access policy for each of the following:

| Service                            | Resources                          | Access          |
|-                                   |-                                   |-                |
| Container Registry                 | All                                | Reader, Viewer  |
| Kubernetes Service                 | All                                | Reader, Viewer  |
| Resource Group Only                | All resource groups in the account | Viewer, Editor  |
| Schematics                         | All                                | Manager, Editor |
| VPC Infrastructure Services        | All                                | Reader, Viewer  |
| Workspace for Power Virtual Server | All                                | Reader, Editor  |


### CRAIG Terraform Applier Access Group

The service ID or user account owning the API key specified for the `ibmcloud_api_key` variable during Terraform or Schematics `apply` must have the following necessary access policies to create and manage the resources in the project. 

The following steps list how to create an access group with these required access policies:

- Create Access Group
    - Manage -> Access (IAM) -> Access Groups -> Create +
    - Name the access group _(i.e. CRAIG Terraform Applier)_
    - Add users and/or service IDs as needed
    - Navigate to Access tab -> Assign access +
    - Create an access policy for each of the following:
  
| Service                                    | Resources | Access                                                                                                         |
|-                                           |-          |-                                                                                                               |
| All Account Management services            | All       | Administrator                                                                                                  |
| All Identity and Access enabled services   | All       | Writer, Editor, Operator, Administrator                                                                        |
| Cloud Object Storage                       | All       | Manager, Administrator                                                                                         |
| Direct Link                                | All       | Editor                                                                                                         |
| Hyper Protect Crypto Services              | All       | Manager, Vault Administrator, Key Custodian - Deployer, KMS Key Purge Role, Certificate Manager, Administrator |
| IBM Cloud Monitoring                       | All       | Editor                                                                                                         |
| Internet Services                          | All       | Manager                                                                                                        |
| Key Protect                                | All       | Manager, Administrator                                                                                         |
| Secrets Manager                            | All       | Manager, Administrator                                                                                         |
| Transit Gateway                            | All       | Editor                                                                                                         |
| VPC Infrastructure Services                | All       | Manager, IP Spoofing Operator, Administrator                                                                   |
| Workspace for Power Systems Virtual Server | All       | Manager, Editor                                                                                                |

**_After creating access groups manually, users should navigate to the IBM Cloud UI to assign users/service IDs to the respective access groups before deploying and using CRAIG._**

## Authorization Policies
The following authorization policies should be created.

  1. Schematics, All resources, Key Protect, Reader
  2. Schematics, All resources, HPCS, Reader
  3. The following authorization is needed when running code for Schematics until fix is pushed (End of March 2024)
      - Source: VPC Infrastructure Services, Specific Resources, Resource type, File Storage for VPC
      - Target: HPCS, All Resources, Enable authorizations to be delegated..., Reader

How to create Authorization policy
- Manage -> Access (IAM) -> Authorizations -> Create +
- Select This account
- Specify source and target
- Click Authorize
