#!/usr/bin/env bash

# Set up defaults
DELETE=false

usage() {
  # Display Help
    cat <<EOF
Syntax: $ access.sh [-h] 
Automates the creation of 3 access groups which assign all required access policies for CRAIG deployment, application runtime, 
and provisioning of all resources depending on the use case.

Note: To use this script, users must have the following type of access in your Cloud Account:
- Account owner
- Administrator or editor on the IAM Access Groups account management service in the account
- Administrator or editor for the All Account Management services

Requires that the ibmcloud CLI be installed and a ibmcloud login has been performed prior to running the script.

1st Access Group: craig-deployer
Assigns all access policies required for the service ID or user account that is logged into the ibmcloud CLI when running the deploy.sh script in order 
to create a Code Engine project, Container Registry namespace, application, image build, and secrets. This access is also needed by the service ID 
or user account owning the API key specified to the deploy.sh script to successfully create a schematics workspace, and PowerVS workspaces in every 
PowerVS zone when running deploy.sh with the -z parameter. 

2nd Access Group: craig-application
Assigns all access required for CRAIG to dynamically fetch account information such as VSI & Power VS images, storage tiers, and storage pools from 
IBM Cloud, as well as the ability to create and upload data to schematics workspaces. If you deploy CRAIG with the deploy.sh script then this access 
group must be assigend to the service ID or user account that owns the API key you give deploy.sh.  It is good practice to make sure that a service ID 
or user account is assigned to both the craig-deployer and craig-application access groups before deploying and using CRAIG.

3rd Access Group: craig-terraform-applier
Assigns high level access required to create resources through Terraform or Schematics "Apply" on the service ID or user account owning the API key 
set on the API key variable of the CRAIG generated Terraform.

After running the script, users should navigate to the IBM Cloud UI to assign users/service IDs to the respective access groups before deploying and using CRAIG.


Options:
  h     Print help.
  d     Delete Access Groups: craig-deployer, craig-application, and craig-terraform-applier
EOF
}

fatal() {
    local prefix=`date '+%Y:%m:%d.%H:%M:%S'`
    echo "$prefix FATAL: $*"
    exit 1
}

# Creates the craig-deployer access group with only the basic access policies required to successfully run deploy.sh to set up CRAIG in Code Engine, create a schematics workspace, and create PowerVS workspaces when running with the -z parameter. 
create_craig_deployer() {
  # create/check access group and policies
  if ! ibmcloud iam access-groups | grep craig-deployer > /dev/null; then 
    echo "Creating Access Group craig-deployer..."
    ibmcloud iam access-group-create craig-deployer -d "Access group that assigns all access policies required to successfully run deploy.sh to set up CRAIG in Code Engine, create a schematics workspace, and create PowerVS workspaces when running with the -z parameter." || fatal "An error ocurred while creating the craig-deployer access group."
    echo "Creating Access Policies for craig-deployer..."
    # Resource Group access policy
    ibmcloud iam access-group-policy-create craig-deployer --roles Viewer,Editor --resource-type resource-group
    # Code Engine access policy
    ibmcloud iam access-group-policy-create craig-deployer --roles Writer,Editor --service-name codeengine
    # Container Registry access policy
    ibmcloud iam access-group-policy-create craig-deployer --roles Manager --service-name container-registry
    # Schematics access policy
    ibmcloud iam access-group-policy-create craig-deployer --roles Manager,Editor --service-name schematics
    # PowerVS Workspace access policy
    ibmcloud iam access-group-policy-create craig-deployer --roles Manager,Editor --service-name power-iaas
    echo "Access group craig-deployer has been successfully created."
  else
    echo "The access group craig-deployer already exists."
  fi
}

# Creates the craig-application access group with only the basic access policies required for CRAIG to read data from IBM Cloud while it runs, as well as create schematics workspaces and load data into them. 
create_craig_application() {
  # create/check access group and policies
  if ! ibmcloud iam access-groups | grep craig-application > /dev/null; then 
    echo "Creating Access Group craig-application..."
    ibmcloud iam access-group-create craig-application -d "Access group that assigns all access required for CRAIG to read data from IBM Cloud while it runs, as well as create schematics workspaces and load data into them." || fatal "An error ocurred while creating the craig-application access group."
    echo "Creating Access Policies for craig-application..."
    # cluster/vsi-api access policies
    ibmcloud iam access-group-policy-create craig-application --roles Reader,Viewer --service-name containers-kubernetes
    ibmcloud iam access-group-policy-create craig-application --roles Reader,Viewer --service-name container-registry
    ibmcloud iam access-group-policy-create craig-application --roles Reader,Viewer --service-name is
    # power-api access policies
    ibmcloud iam access-group-policy-create craig-application --roles Reader,Viewer --service-name power-iaas
    # schematics-api access policy
    ibmcloud iam access-group-policy-create craig-application --roles Manager,Editor --service-name schematics
    # Resource Group access policy
    ibmcloud iam access-group-policy-create craig-application --roles Viewer,Editor --resource-type resource-group
    echo "Access group craig-application has been successfully created."
  else
    echo "The access group craig-application already exists."
  fi
}

# Creates the craig-terraform-applier access group with only the basic access policies required to create resources through Terraform or Schematics "Apply" on the service ID or user account owning the API key set on the API key variable of the CRAIG generated Terraform.
create_craig_terraform_applier() {
  # create/check access group and policies
  if ! ibmcloud iam access-groups | grep craig-terraform-applier > /dev/null; then 
    echo "Creating Access Group craig-terraform-applier..."
    ibmcloud iam access-group-create craig-terraform-applier -d "Access group that assigns all access policies required to create resources through Terraform or Schematics "Apply" on the service ID or user account owning the API key set on the API key variable of the CRAIG generated Terraform." || fatal "An error ocurred while creating the craig-terraform-applier access group."
    echo "Creating Access Policies for craig-terraform-applier..."
    # must be account owner or have appropriate permissions listed in helper text above to create most of these access policies
    ibmcloud iam access-group-policy-create craig-terraform-applier --account-management --roles Administrator
    #Resource Group access policy - included by default in above access policy
    # ibmcloud iam access-group-policy-create craig-terraform-applier --roles Editor --resource-type resource-group
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Writer,Editor,Operator,Administrator
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Manager,Administrator --service-name cloud-object-storage
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Editor --service-name directlink
    # can use \ as a subsitute for spaces instead of quotes
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Manager,"Vault Administrator","Key Custodian - Deployer","KMS Key Purge Role","Certificate Manager",Administrator --service-name hs-crypto
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Editor --service-name sysdig-monitor
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Manager --service-name internet-svcs
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Manager,Administrator --service-name kms
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Manager,Administrator --service-name secrets-manager
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Editor --service-name transit
    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Manager,"IP Spoofing Operator",Administrator --service-name is

    ibmcloud iam access-group-policy-create craig-terraform-applier --roles Manager,Editor --service-name power-iaas
    echo "Access group craig-terraform-applier has been successfully created."
  else
    echo "The access group craig-terraform-applier already exists."
  fi
}

# Note: function is not being used given these policies do not seem necessary for provisioning resources
# also cannot add authorization policies to access groups, must be at account level
# create authorization policies needed for Schematics 
create_schematics_authorization_policies() {
  echo "Creating authorization policies needed for Schematics integration..."
  ibmcloud iam authorization-policy-create schematics kms Reader || fatal "An error ocurred while creating this authorization policy, or an access policy with identical attributes already exists."
  ibmcloud iam authorization-policy-create schematics hs-crypto Reader || fatal "An error ocurred while creating this authorization policy, or an access policy with identical attributes already exists."
  # need to confirm proper CLI command structure for the following access policy
  # ibmcloud iam authorization-policy-create is hs-crypto AuthorizationDelegator,Reader --source-resource-type File Storage for VPC || fatal "An error ocurred while creating this authorization policy, or an access policy with identical attributes already exists."
  echo "Authorization policies have been successfully created."
}

delete_resources() {
  # remove craig-deployer if present
  if ibmcloud iam access-groups | grep craig-deployer > /dev/null; then 
    echo "Deleting Access Group craig-deployer..."
    ibmcloud iam access-group-delete craig-deployer || fatal "An error ocurred while deleting the craig-deployer access group."
  else
    echo "No Access Group craig-deployer found for deletion. Continuing."
  fi
  # remove craig-application if present
  if ibmcloud iam access-groups | grep craig-application > /dev/null; then 
    echo "Deleting Access Group craig-application..."
    ibmcloud iam access-group-delete craig-application || fatal "An error ocurred while deleting the craig-application access group."
  else
    echo "No Access Group craig-application found for deletion. Continuing."
  fi
  # remove craig-terraform-applier if present
  if ibmcloud iam access-groups | grep craig-terraform-applier > /dev/null; then 
    echo "Deleting Access Group craig-terraform-applier..."
    ibmcloud iam access-group-delete craig-terraform-applier || fatal "An error ocurred while deleting the craig-terraform-applier access group."
  else
    echo "No Access Group craig-terraform-applier found for deletion."
  fi
  echo "Access group deletion complete"
}

# get arguments
# define arguments for getopts to look for
while getopts ":dh" opt; do
  # for each argument present assign the correct value to override the default value
  # values defined after the flag are stored in $OPTARG
  case $opt in
  h) # if -h print usage
    usage
    exit 0
    ;;
  d) DELETE=true ;; # if -d set DELETE to true
  \?) # this case is for when an unknown argument is passed (e.g. -c)
    echo "Invalid option: -$OPTARG"
    exit 1
    ;;
  esac
done

ibmcloud iam oauth-tokens &> /dev/null || fatal "Please log in with the ibmcloud CLI (ibmcloud login)"

if [ $DELETE == true ]; then # if -d provided
  delete_resources
  exit 0
fi

create_craig_deployer

create_craig_application

create_craig_terraform_applier

echo "Access group creation complete, navigate to IBM Cloud UI to add users or service IDs to respective access groups."
