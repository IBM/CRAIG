#!/usr/bin/env bash

# Set up defaults
# The defaults may be overriden by environment variables
# Some of these values can then be further overridden by command line arguments
API_KEY=${CRAIG_API_KEY:-"NOT-SET"}
REGION=${CRAIG_REGION:-"us-south"}
RESOURCE_GROUP=${CRAIG_RESOURCE_GROUP:-"Default"}
ENVIRONMENT_FILE=${CRAIG_ENVIRONMENT_FILE}
PROJECT_NAME=${CRAIG_PROJECT_NAME:-"craig"}
ICR_NAMESPACE=${CRAIG_ICR_NAMESPACE:-"NOT-SET"}
ICR=${CRAIG_ICR:-"us.icr.io"}
GIT_SOURCE=${CRAIG_GIT_SOURCE:="https://github.com/IBM/CRAIG"}
APP_NAME=${CRAIG_APP_NAME:-"craig"}
IMAGE_NAME=${CRAIG_IMAGE_NAME:-"craig"}
COMMIT=${CRAIG_COMMIT:-"main"}
IMAGE_TAG=${CRAIG_IMAGE_TAG:-"latest"}
SCALE_DOWN_DELAY=${CRAIG_SCALE_DOWN_DELAY:-"600"}
DELETE=false
CREATE_POWERVS=false

# sleep time between checking Schematics status
schematics_sleep_time=5

usage() {
  # Display Help
    cat <<EOF
Syntax: $ deploy.sh [-h] [-d] [-a API KEY] [-r REGION] [-g RESOURCE GROUP] [-e ENVIRONMENT FILE] [-p PROJECT NAME] [-n ICR NAMESPACE] [-x APP NAME] [-w DELAY] [-o SERVER NAME] [-i IMAGE NAME] [-t IMAGE TAG] [-s SOURCE REPOSITORY] [-c SOURCE COMMIT]
Builds and deploys an instance of CRAIG in IBM Code Engine.

Requires the that ibmcloud CLI be installed and a ibmcloud login has been performed.

One input is required, an IBM Cloud Platform API key. This key can be specified using the CRAIG_API_KEY
environment variable or the 'a' option. If neither are provided the command will securely prompt for the key
from standard input.

The options can be either specified on the command line or set as environment variables. See the script source
for the environment variable names.
Options:
  h     Print help.
  a     IBM Cloud Platform API Key.
  d     Delete resources: Power VS workspaces, IBM Code Engine deployment, IBM Container Registry namespace

  g     Resource group to deploy resources in. Default value = 'Default'.
  r     Region to deploy resources in. Default value = 'us-south'.

  p     Name of the IBM Code Engine project. Default value = 'craig'.
  x     IBM Code Engine application name for this CRAIG deployment. Default value = 'craig'
  w     Scale down delay for the application. This specifies the time in seconds of user inactivity before
          the application instance shuts down. Default value = '600'.

  z     Create Power Virtual Server Workspaces. This is a flag option and does not take a value. Default: do not create the workspaces
  e     Path to a CRAIG environment file containing Power Virtual Server Workspace GUIDs. This is only used when deploying multiple instances of CRAIG using the same Power VS workspaces. No default.

  n     IBM Cloud Container Registry namespace. Default value = 'craig-<Softlayer/IMS account number>'.
  o     IBM Container Registry server name. Default value = 'us.icr.io'.
  i     Name of the CRAIG container image. Default value = 'craig'.
  t     Tag for the CRAIG container image. Default value = 'latest'.

  s     Git repository for CRAIG source. Default value = 'https://github.com/IBM/CRAIG'.
  c     Commit, tag, or branch name to use in the git repository. Default value = 'main'.
EOF
}

fatal() {
    local prefix=`date '+%Y:%m:%d.%H:%M:%S'`
    echo "$prefix FATAL: $*"
    exit 1
}

initialize_cli() {
    if ! ibmcloud plugin list | grep code-engine > /dev/null; then
    echo "y" | ibmcloud plugin install code-engine
  fi

  if ! ibmcloud plugin list | grep container-registry > /dev/null; then
    echo "y" | ibmcloud plugin install container-registry
  fi

  if ! ibmcloud plugin list | grep schematics > /dev/null; then
    echo "y" | ibmcloud plugin install schematics
  fi

}

delete_resources() {
  ibmcloud cr region-set $ICR > /dev/null || fatal "Failed to set the IBM Container Registroy region to $ICR"

  # Set the default ICR_NAMESPACE if one was not provided
  if [ $ICR_NAMESPACE == "NOT-SET" ]; then
    # Get the ims account number
    ims_id=$(ibmcloud account show --output json | jq -r .ims_account_id)
    [[ -z "$ims_id" ]] && fatal "Failed to retrieve the Account's IMS ID. To avoid this error, the -n parameter should be used to provide a unique container registry namespace."
    ICR_NAMESPACE="craig-${ims_id}"
  fi

  # remove namespace if present
  if ibmcloud cr namespace-list | grep $ICR_NAMESPACE > /dev/null; then
    ibmcloud cr namespace-rm $ICR_NAMESPACE
  fi

  # remove code engine project if present
  if ibmcloud ce project list | grep $PROJECT_NAME > /dev/null; then
    ibmcloud ce project delete -n $PROJECT_NAME -f --hard
  fi

  # delete Power VS workspaces
  delete_powervs_workspaces
}

create_resources() {
  if [ $API_KEY == "NOT-SET" ]; then
    read -s -p "Enter an IBM Cloud API key for CRAIG-IBM Cloud integration:" API_KEY
    echo ""
    if [ $API_KEY == "" ]; then
      fatal "An IBM Cloud API key is required." 
    fi
  fi

  ibmcloud cr region-set $ICR > /dev/null || fatal "Failed to set the IBM Container Registroy region to $ICR"

  # Set the default ICR_NAMESPACE if one was not provided
  if [ $ICR_NAMESPACE == "NOT-SET" ]; then
    # Get the ims account number
    ims_id=$(ibmcloud account show --output json | jq -r .ims_account_id)
    [[ -z "$ims_id" ]] && fatal "Failed to retrieve the Account's IMS ID. To avoid this error, the -n parameter should be used to provide a unique container registry namespace."
    ICR_NAMESPACE="craig-${ims_id}"
  fi

  # create namespace
  if ! ibmcloud cr namespace-list | grep $ICR_NAMESPACE > /dev/null; then
    # no namespace found add it
    echo "No ICR namespace found creating one..."
    ibmcloud cr namespace-add -g $RESOURCE_GROUP $ICR_NAMESPACE || fatal "An error occurred creating the IBM Container Registry namespace. The -n parameter may be used to specify the name for the namespace."
  fi

  if [ $CREATE_POWERVS == true ]; then
    create_powervs_workspaces
  fi

  # create/check Code Engine project and select it
  if ! ibmcloud ce project list | grep "^$PROJECT_NAME\s" > /dev/null; then
    echo "No Code Engine project named $PROJECT_NAME creating one..."
    ibmcloud ce project create -n $PROJECT_NAME || fatal "An error occurred creating the IBM Code Engine project"
  fi

  ibmcloud ce proj select -n $PROJECT_NAME -k || fatal "An error occurred selecting the IBM Code Engine project"

  # check/create registry access secret
  if ibmcloud ce registry list | grep ibm-cr > /dev/null; then
    # update current
    ibmcloud ce registry update --name ibm-cr --server $ICR --username iamapikey --password $API_KEY || fatal "An error occurred updating the IBM Container Registry secret"
  else
    # no registry access secret found
    ibmcloud ce registry create --name ibm-cr --server $ICR --username iamapikey --password $API_KEY || fatal "An error occurred creating the IBM Container Registry secret"
  fi

  secret_name="${APP_NAME}-apikey"
  # check/create secret for env var API_KEY
  if ! ibmcloud ce secret list | grep "${secret_name}" > /dev/null; then
    # no secret with name found
    ibmcloud ce secret create -n "${secret_name}" --from-literal "API_KEY=$API_KEY" || fatal "An error occurred creating the API secret in IBM Code Engine"
  fi

  accountid_configmap_name="${APP_NAME}-accountid"
  # get the Account ID number
  ACCOUNT_ID=$(ibmcloud account show --output json | jq -r .account_id)
  [[ -z "$ACCOUNT_ID" ]] && fatal "Failed to retrieve the Account ID."
  # check/create configmap for env var ACCOUNT_ID
  if ! ibmcloud ce configmap list | grep "${accountid_configmap_name}" > /dev/null; then
    # if no accountid configmap env found, import into env
    ibmcloud ce configmap create -n "${accountid_configmap_name}" --from-literal "ACCOUNT_ID=$ACCOUNT_ID" || fatal "An error occurred creating the Account ID config map in IBM Code Engine"
  else
    ibmcloud ce configmap update -n "${accountid_configmap_name}" --from-literal "ACCOUNT_ID=$ACCOUNT_ID" || fatal "An error occurred updating the Account ID config map for the application."
  fi
  

  # Power VS workspace IDs can be set one of two ways: an env file, or be set automatically
  # by the generated workspaceids.env from the create_powervs_workspaces function. These
  # options are mutually exclusive enforced by the command line processing.

  # If the environment file is specified use it.
  if [ ! -z "${ENVIRONMENT_FILE}" ]; then
    configmap_name="${APP_NAME}-env"
    if ! ibmcloud ce configmap list | grep $configmap_name > /dev/null ; then
      ibmcloud ce configmap create -n "${configmap_name}"  --from-env-file "${ENVIRONMENT_FILE}" || fatal "An error occurred creating the config map for the application."
    else
      ibmcloud ce configmap update -n "${configmap_name}" --from-env-file "${ENVIRONMENT_FILE}" || fatal "An error occurred updating the config map for the application."  
    fi
  fi

  # If the workspaceids file exists, use it for the config map.
  if [ -f workspaceids.env ]; then
    configmap_name="${APP_NAME}-env"
    if ! ibmcloud ce configmap list | grep $configmap_name > /dev/null ; then
      ibmcloud ce configmap create -n "${configmap_name}"  --from-env-file workspaceids.env || fatal "An error occurred creating the config map for the application."
    else
      ibmcloud ce configmap update -n "${configmap_name}" --from-env-file workspaceids.env || fatal "An error occurred updating the config map for the application."  
    fi
  fi

  IMAGE_REF="${ICR}/${ICR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"

  build_name="imgbld-$APP_NAME"
  if ! ibmcloud ce bd list | grep "${build_name}" > /dev/null; then
    # no image build found, create it
    ibmcloud ce bd create --name $build_name \
        --build-type git \
        --commit $COMMIT \
        --context-dir / \
        --image "${IMAGE_REF}" \
        --registry-secret ibm-cr \
        --source "$GIT_SOURCE" || fatal "Error creating the image build"
  else
    # image build found, update it
    ibmcloud ce bd update --name $build_name \
        --commit $COMMIT \
        --context-dir / \
        --image "${IMAGE_REF}" \
        --registry-secret ibm-cr \
        --source "$GIT_SOURCE" || fatal "Error updating the image build"
  fi

  # Submit build and wait
  echo "Building the CRAIG container in IBM Code Engine"
  ibmcloud ce br submit -b $build_name -w || fatal "An error occurred with the image build"

  configmap_param=""
  if [ ! -z "${ENVIRONMENT_FILE}" ]; then
    configmap_param="--env-from-configmap ${configmap_name}"
  fi

  if [ -f workspaceids.env ]; then
    configmap_param="--env-from-configmap ${configmap_name}"
  fi

 # create/check for Code Engine application
  if ibmcloud ce app get -n "${APP_NAME}" 2>/dev/null | grep Age > /dev/null; then
    # app with name found update existing
    echo "Existing ${APP_NAME} application found, updating..."
    ibmcloud ce app update -n "${APP_NAME}" \
      -i "${IMAGE_REF}" \
      --rs ibm-cr \
      -w=true \
      --cpu 2 \
      --max 10 \
      --min 0 \
      -m 4G \
      -p http1:8080 \
      --es 2G \
      --scale-down-delay $SCALE_DOWN_DELAY \
      --env-from-secret "${secret_name}" \
      --env-from-configmap "${accountid_configmap_name}" \
      ${configmap_param} || fatal "An error occurred updating the application"
    echo "The CRAIG application is now ready at the URL above."
  else
    # no app found create one
    echo "No ${APP_NAME} application found, creating one..."
    ibmcloud ce app create -n "${APP_NAME}" \
      -i "${IMAGE_REF}" \
      --rs ibm-cr \
      -w=true \
      --cpu 2 \
      --max 10 \
      --min 0 \
      -m 4G \
      -p http1:8080 \
      --scale-down-delay $SCALE_DOWN_DELAY \
      --es 2G \
      --env-from-secret "${secret_name}" \
      --env-from-configmap "${accountid_configmap_name}" \
      ${configmap_param} || fatal "An error occurred creating the application"
    echo "The CRAIG application is now ready at the URL above."
  fi
}

# Create workspace template file
# Parameters: 
# $1 filename
# $2 workspace name
# $3 workspace region
# $4 Source URL
# $5 source branch
# $6 API key
# $7 prefix
# $8 resource group
create_workspace_template_file() {
    # Create a workspace template file for creation of the schematics workspace using the CLI
    echo "" > $1
    chmod 600 $1
    # Write the file with placeholder values
    cat >> $1 <<EOF
    {
        "name": "SED_WS_NAME",
        "location": "SED_WS_REGION",
        "resource_group": "SED_RESOURCE_GROUP",
        "type": ["terraform_v1.5"],
        "description": "Power Virtual Server Workspace Creation for CRAIG",
        "template_repo": {
            "url": "SED_CRAIG_SOURCE",
            "branch": "SED_CRAIG_BRANCH"
        },
        "template_data": [
            {
            "folder": "deploy/power_vs_workspaces",
            "type": "terraform_v1.5",
            "compact": true,
            "variablestore": [
            {
                "name": "ibmcloud_api_key",
                "secure": true,
                "value": "SED_API_KEY",
                "type": "string",
                "description": "The IBM Cloud platform API key needed to deploy IAM enabled resources."
            },
            {
                "name": "prefix",
                "secure": false,
                "value": "SED_PREFIX",
                "type": "string",
                "description": "The name prefix for the IBM Power Virtual Server Workspaces."
            },
            {
                "name": "resource_group",
                "secure": false,
                "value": "SED_RESOURCE_GROUP",
                "type": "string",
                "description": "The name of the resource group that will be created for the IBM Power Virtual Server Workspaces."
            },
            {
                "name": "use_existing_rg",
                "secure": false,
                "value": "true",
                "type": "bool",
                "description": "Set to true to use an existing resource group. When false, a resource group will be created automatically"
            }
            ]
        }
        ]
    }
EOF
    # Use sed to find-replace the "SED_" values with the values from the parameters
    # Note that # is used as the command separator instead of the usual / because the craig source
    # variable contains a URL with /
    sed_exp="s#SED_WS_NAME#$2#g;s#SED_WS_REGION#$3#g;s#SED_CRAIG_SOURCE#$4#g;s#SED_CRAIG_BRANCH#$5#g;s#SED_API_KEY#$6#g;s#SED_PREFIX#$7#g;s#SED_RESOURCE_GROUP#$8#g"
    sed -i".bak" "$sed_exp" "$1"
}

wait_for_workspace_inactive_status () {
    # $1 = workspace ID
    echo "Waiting for Schematics workspace $1 to be ready (reach the inactive state)."
    while :
    do
        status=$(ibmcloud sch ws get -i $1 --output json | jq -r ".status")
        [[ -z "$status" ]] && fatal "Failed to retrieve the status of the workspace"
        case $status in
            INACTIVE)
                break
                ;;
            FAILED)
                fatal "Schematics workspace creation failed"
                ;;
        esac
        sleep $schematics_sleep_time
    done
}

wait_for_schematics_action_complete () {
    # $1 = action ID
    # $2 = workspace ID
    echo "Waiting for Schematics action $1 to complete in workspace $2"
    while :
    do
        status=$(ibmcloud sch ws action -i $2 -a $1 --output json | jq -r ".status")
        [[ -z "$status" ]] && fatal "Failed to retrieve the status of the action"
        case $status in
            COMPLETED)
                break
                ;;
            FAILED)
                echo "Schematics workpace action failed. Fetching logs."
                ibmcloud sch logs -i $2 -a $1
                fatal "Schematics workspace action failed"
                ;;
        esac
        sleep $schematics_sleep_time
    done
}

create_powervs_workspaces() {
    # Create the workspace and wait for it to be ready for Terraform apply
    echo "Creating a Schematics workspace to manage the Power VS workspaces for CRAIG"
    ws_template_fn="tmp.workspace.template"
    create_workspace_template_file $ws_template_fn "$PROJECT_NAME-powervs" $REGION $GIT_SOURCE \
        $COMMIT $API_KEY $PROJECT_NAME $RESOURCE_GROUP

    workspace_id=$(ibmcloud schematics workspace new --file $ws_template_fn --output json | jq -r ".id")
    rm $ws_template_fn
    rm "${ws_template_fn}.bak"
    [[ -z "$workspace_id" ]] && fatal "Failed retrieve the Schematics workspace ID on creation"
    wait_for_workspace_inactive_status $workspace_id

    # Apply the template
    echo "Creating the Power VS workspaces for CRAIG integration"
    apply_output=$(ibmcloud sch apply -i $workspace_id -f --output json)
    #echo "Apply output ${apply_output}"
    apply_id=$(echo $apply_output | jq -r ".activityid")
    #echo "Apply ID: $apply_id"
    [[ -z "$apply_id" ]] && fatal "Failed retrieve the ID of the Schematics apply job"
    wait_for_schematics_action_complete $apply_id $workspace_id

    # Get the workspace IDs into an env file
    ibmcloud sch output -i $workspace_id --output json |  jq -r '.[]? | .output_values[]? | keys[] as $k | "POWER_WORKSPACE_\($k)=\(.[$k] | .value)"' > workspaceids.env

    # Check if the workspace IDs env file two or fewer lines, if it does something went wrong with getting the output
    if [[ $(wc -l <workspaceids.env) -le 2 ]]
    then
        fatal "Unable to retrieve the Power VS workspace IDs from the Schematics Terraform output"
    fi
    echo "Power VS workspace creation successful"
}

delete_powervs_workspaces() {
    # Fetch the count and ID(s) separately because of platform/shell differences in handling of echo -n
    # and whitespace characters between multiple workspace names
    workspace_count=$(ibmcloud sch ws list --output json | jq -r --arg wsname "$PROJECT_NAME-powervs" '.workspaces[]? | select(.name==$wsname) | "\(.id)"' | wc -l)
    workspace_id=$(ibmcloud sch ws list --output json | jq -r --arg wsname "$PROJECT_NAME-powervs" '.workspaces[]? | select(.name==$wsname) | "\(.id)"')

    if [[ $workspace_count -ge 2 ]]
    then
        echo "Multiple workspaces found with name $PROJECT_NAME-powervs: $workspace_id"
        fatal "Not destroying resources in workspace $PROJECT_NAME-powervs"
    fi
    if [[ $workspace_count -lt 1 ]]
    then
        echo "No schematics workspace found for Power VS workspace deletion. Continuing."
        return
    fi

    # Destroy the resources
    echo "Destroying Power VS Workspaces used for CRAIG integration"
    destroy_submit_output=$(ibmcloud sch destroy -i $workspace_id -f --output json)
    destroy_id=$(echo $destroy_submit_output | jq -r ".activityid")
    wait_for_schematics_action_complete $destroy_id $workspace_id

    # Delete the workspace
    echo "Deleting the Schematics workspace $workspace_id"
    ibmcloud sch ws delete -i $workspace_id -f
    if [[ $? -ne 0 ]] ; then
        fatal "Error deleting the Schematics workspace"
    fi
    echo "Schematics workspace deletion complete"
}

# get arguments
# define arguments for getopts to look for
while getopts ":dzha:r:g:e:p:x:w:n:o:i:t:s:c:" opt; do
  # for each argument present assign the correct value to override the default value
  # values defined after the flag are stored in $OPTARG
  case $opt in
  h) # if -h print usage
    usage
    exit 0
    ;;
  d) DELETE=true ;; # if -d set DELETE to true
  z) CREATE_POWERVS=true ;;
  a) API_KEY=$OPTARG ;;
  r) REGION=$OPTARG ;;
  g) RESOURCE_GROUP=$OPTARG ;;
  e) ENVIRONMENT_FILE=$OPTARG ;;
  p) PROJECT_NAME=$OPTARG ;;
  x) APP_NAME=$OPTARG ;;
  w) SCALE_DOWN_DELAY=$OPTARG ;;
  n) ICR_NAMESPACE=$OPTARG ;;
  o) ICR=$OPTARG ;;
  i) IMAGE_NAME=$OPTARG ;;
  t) IMAGE_TAG=$OPTARG ;;
  s) GIT_SOURCE=$OPTARG ;;
  c) COMMIT=$OPTARG ;;
  \?) # this case is for when an unknown argument is passed (e.g. -c)
    echo "Invalid option: -$OPTARG"
    exit 1
    ;;
  esac
done

# Check mutually exclusive args
[ ! -z "${ENVIRONMENT_FILE}" ] && [ "$CREATE_POWERVS" = true ] && fatal "-e and -z command parameters cannot be specified together"
[ "$DELETE" = true ] && [ "$CREATE_POWERVS" = true ] && fatal "-d and -z command parameters cannot be specified together"

# Check that the environment file exists if specified
[[ ! -z "${ENVIRONMENT_FILE}" && ! -f "${ENVIRONMENT_FILE}" ]] && fatal "The environment file does not exist: ${ENVIRONMENT_FILE}"

initialize_cli

ibmcloud iam oauth-tokens &> /dev/null || fatal "Please log in with the ibmcloud CLI (ibmcloud login)"

ibmcloud target -g $RESOURCE_GROUP -r $REGION > /dev/null || fatal "Error targeting resource group ${RESOURCE_GROUP} and region ${REGION}"

if [ $DELETE == true ]; then # if -d provided
  delete_resources
  exit 0
fi

create_resources