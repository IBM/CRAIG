# Access policies and account settings


## Account settings
The following account settings should be enabled:
- Manage -> Account Settings
    - Activate Financial Services Validated
    - Activate EU Supported
    - Activate Virtual routing and forwarding
    - Service endpoints

## Access policies
The API key used for the `ibmcloud_api_key` variable during Terraform or Schematics `apply` must have the necessary access to create and manage the resources in the project. The following steps list how to create and access group with the required access.
- Create Access Group
    - Manage -> Access (IAM) -> Access Groups -> Create +
    - Name the access group "base-infrastructure"
    - Add users +
    - Navigate to Access tab -> Assign access +
    - Create access for each of the following below
        - Resource group only, All, Editor
        - All Identity and Access enabled services, All, Writer, Editor, Operator, Administrator
        - All IAM Account Management services, All, UserApiKeyCreator
        - All Account Management services, All, Editor
        - VPC Infrastructure Services, All, Administrator, Manager, IP Spoofing Operator
        - Workspace for Power Systems Virtual Server, All, Manager, Editor
        - Transit Gateway, All, Editor
        - Cloud Object Storage, All, Administrator
        - Internet Services, All, Manager
        - Key Protect, All, Manager and Administrator
        - Secrets Manager, All, Manager and Administrator
        - Hyper Protect Crypto Services, All, Manager, Vault Administrator, Key Custodian - Deployer, KMS Key Purge Role, Certificate Manager, Administrator
        - Direct Link, All, Editor
        - IBM Cloud Monitoring, All, Editor

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