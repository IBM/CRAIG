#!/bin/sh

# Set up defaults
# The defaults may be overriden by environment variables
# Some of these values can then be further overridden by command line arguments
API_KEY=${CRAIG_API_KEY:-"NOT-SET"}
REGION=${CRAIG_REGION:-"us-south"}
RESOURCE_GROUP=${CRAIG_RESOURCE_GROUP:-"Default"}
ENVIRONMENT_FILE=${CRAIG_ENVIRONMENT_FILE}
PROJECT_NAME=${CRAIG_PROJECT_NAME:-"craig"}
ICR_NAMESPACE=${CRAIG_ICR_NAMESPACE:-"craig-namespace"}
ICR=${CRAIG_ICR:-"us.icr.io"}
GIT_SOURCE=${CRAIG_GIT_SOURCE:="https://github.com/IBM/CRAIG"}
APP_NAME=${CRAIG_APP_NAME:-"craig"}
IMAGE_NAME=${CRAIG_IMAGE_NAME:-"craig"}
COMMIT=${CRAIG_COMMIT:-"main"}
IMAGE_TAG=${CRAIG_IMAGE_TAG:-"latest"}
SCALE_DOWN_DELAY=${CRAIG_SCALE_DOWN_DELAY:-"600"}
DELETE=false

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
  d     Delete resources.

  g     Resource group to deploy resources in. Default value = 'Default'.
  r     Region to deploy resources in. Default value = 'us-south'.
  e     Path to a CRAIG environment file for things such as Power Virtual Server Workspace GUIDs. No default.

  p     Name of the IBM Code Engine project. Default value = 'craig'.
  x     IBM Code Engine application name for this CRAIG deployment. Default value = 'craig'
  w     Scale down delay for the application. This specifies the time in seconds of user inactivity before
          the application instance shuts down. Default value = '600'.

  n     IBM Cloud Container Registry namespace. Default value = 'craig-namespace'.
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
    if ! ibmcloud plugin list | grep code-engine; then
    echo "y" | ibmcloud plugin install code-engine
  fi

  if ! ibmcloud plugin list | grep container-registry; then
    echo "y" | ibmcloud plugin install container-registry
  fi
}

delete_resources() {
  # remove namespace if present
  if ibmcloud cr namespace-list | grep $ICR_NAMESPACE > /dev/null; then
    ibmcloud cr namespace-rm $ICR_NAMESPACE -f
  fi

  # remove code engine project if present
  if ibmcloud ce project list | grep $PROJECT_NAME > /dev/null; then
    ibmcloud ce project delete -n $PROJECT_NAME -f --hard
  fi
}

create_resources() {
  if [ $API_KEY == "NOT-SET" ]; then
    read -s -p "Enter an IBM Cloud API key for CRAIG-IBM Cloud integration:" API_KEY

    if [ $API_KEY == "" ]; then
      fatal "An IBM Cloud API key is required." 
    fi
  fi

  # create namespace
  if ! ibmcloud cr namespace-list | grep $ICR_NAMESPACE > /dev/null; then
    # no namespace found add it
    echo "No ICR namespace found creating one..."
    ibmcloud cr namespace-add $ICR_NAMESPACE || fatal "An error occurred creating the IBM Container Registry namespace"
  fi

  # create/check Code Engine project and select it
  if ! ibmcloud ce project list | grep $PROJECT_NAME > /dev/null; then
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
  # check/create secret for env var
  if ! ibmcloud ce secret list | grep "${secret_name}" > /dev/null; then
    # no secret with name found
    ibmcloud ce secret create -n "${secret_name}" --from-literal "API_KEY=$API_KEY" || fatal "An error occurred creating the API secret in IBM Code Engine"
  fi

  if [ ! -z "${ENVIRONMENT_FILE}" ]; then
    configmap_name="${APP_NAME}-env"
    if ! ibmcloud ce configmap list | grep $configmap_name > /dev/null ; then
      ibmcloud ce configmap create -n "${configmap_name}"  --from-env-file "${ENVIRONMENT_FILE}" || fatal "An error ocurred creating the config map for the application."
    else
      ibmcloud ce configmap update -n "${configmap_name}" --from-env-file "${ENVIRONMENT_FILE}" || fatal "An error ocurred updating the config map for the application."  
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
      ${configmap_param} || fatal "An error occurred creating the application"
    echo "The CRAIG application is now ready at the URL above."
  fi
}

# get arguments
# define arguments for getopts to look for
while getopts ":dha:r:g:e:p:x:w:n:o:i:t:s:c:" opt; do
  # for each argument present assign the correct value to override the default value
  # values defined after the flag are stored in $OPTARG
  case $opt in
  h) # if -h print usage
    usage
    exit 0
    ;;
  d) DELETE=true ;; # if -d set DELETE to true
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

# Check that the environment file exists if specified
[[ ! -z "${ENVIRONMENT_FILE}" && ! -f "${ENVIRONMENT_FILE}" ]] && fatal "The environment file does not exist: ${ENVIRONMENT_FILE}"


ibmcloud iam oauth-tokens &> /dev/null || fatal "Please log in with the ibmcloud CLI (ibmcloud login)"

ibmcloud target -g $RESOURCE_GROUP -r $REGION > /dev/null || fatal "Error targeting resource group ${RESOURCE_GROUP} and region ${REGION}"

if [ $DELETE == true ]; then # if -d provided
  delete_resources
  exit 0
fi

create_resources