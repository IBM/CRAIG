#!/bin/sh

usage() {
  # Display Help
  echo
  echo "Syntax: $ deploy.sh [-h] [-d] [-a API KEY] [-r REGION] [-g RESOURCE GROUP] [-p PROJECT NAME] [-n ICR NAMESPACE]"
  echo "Options:"
  echo "  a     IBM Cloud Platform API Key (REQUIRED)."
  echo "  d     Delete resources."
  echo "  g     Resource group to deploy resources in. Default value = 'default'."
  echo "  h     Print help."
  echo "  n     IBM Cloud Container Registry namespace. Default value = 'craig-namespace'."
  echo "  p     Name of Code Engine project. Default value = 'craig'."
  echo "  r     Region to deploy resources in. Default value = 'us-south'."
  echo
}

# set up defaults and get arguments
API_KEY="NOT-SET"
REGION="us-south"
RESOURCE_GROUP="default"
PROJECT_NAME="craig"
ICR_NAMESPACE="craig-namespace"
DELETE=false

# define arguments for getopts to look for (d,h,a,r,g,p,n)
while getopts ":dha:r:g:p:n:" opt; do
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
  p) PROJECT_NAME=$OPTARG ;;
  n) ICR_NAMESPACE=$OPTARG ;;
  \?) # this case is for when an unknown argument is passed (e.g. -c)
    echo "Invalid option: -$OPTARG"
    exit 1
    ;;
  esac
done

if [ $API_KEY == "NOT-SET" ]; then
  echo "Please provide an IBM Cloud API Key."
  exit 1
elif ! docker ps 2>/dev/null | grep CONTAINER &>/dev/null; then
  echo "Please make sure the docker daemon is running."
  exit 1
fi

# login to ibmcloud and icr
ibmcloud login -r $REGION --apikey $API_KEY
ibmcloud target -g $RESOURCE_GROUP
ibmcloud cr login

if [ $DELETE == true ]; then # if -d provided
  # remove namespace if present
  if ibmcloud cr namespace-list | grep $ICR_NAMESPACE; then
    ibmcloud cr namespace-rm $ICR_NAMESPACE -f
  fi

  # remove code engine project if present
  if ibmcloud ce project list | grep $PROJECT_NAME; then
    ibmcloud ce project delete -n $PROJECT_NAME -f --hard
  fi
else

  # build docker image and push to icr
  echo "Building Docker image..."
  docker build -t craig .

  if ! ibmcloud plugin list | grep code-engine; then
    echo "y" | ibmcloud plugin install code-engine
  fi

  if ! ibmcloud plugin list | grep container-registry; then
    echo "y" | ibmcloud plugin install container-registry
  fi

  # create namespace
  if ! ibmcloud cr namespace-list | grep $ICR_NAMESPACE; then
    # no namespace found add it
    echo "No namespace found creating one..."
    ibmcloud cr namespace-add $ICR_NAMESPACE
  fi

  # tag and push docker image
  docker tag craig us.icr.io/$ICR_NAMESPACE/craig
  docker push us.icr.io/$ICR_NAMESPACE/craig

  # create/check Code Engine project and select it
  if ! ibmcloud ce project list | grep $PROJECT_NAME; then
    echo "No Code Engine project named $PROJECT_NAME creating one..."
    ibmcloud ce project create -n $PROJECT_NAME
  fi

  ibmcloud ce proj select -n $PROJECT_NAME -k

  # check/create registry access secret
  if ibmcloud ce registry list | grep ibm-cr; then
    # update current
    ibmcloud ce registry update --name ibm-cr --server us.icr.io --username iamapikey --password $API_KEY
  else
    # no registry access secret found
    ibmcloud ce registry create --name ibm-cr --server us.icr.io --username iamapikey --password $API_KEY
  fi

  # check/create secret for env var
  if ! ibmcloud ce secret list | grep apikey; then
    # no secret with name found
    ibmcloud ce secret create -n "apikey" --from-literal "API_KEY=$API_KEY"
  fi

  # create/check for Code Engine application
  if ibmcloud ce app get -n "craig" | grep Age; then
    # app with name found update existing
    echo "Exisiting 'craig' application found, updating..."
    ibmcloud ce app update -n "craig" \
      -i us.icr.io/craig-namespace/craig \
      --rs ibm-cr \
      -w=false \
      --cpu 2 \
      --max 10 \
      --min 1 \
      -m 4G \
      -p http1:8080 \
      --es 2G \
      --env-from-secret apikey
  else
    # no app found create one
    echo "No 'craig' application found, creating one..."
    ibmcloud ce app create -n "craig" \
      -i us.icr.io/craig-namespace/craig \
      --rs ibm-cr \
      -w=false \
      --cpu 2 \
      --max 10 \
      --min 1 \
      -m 4G \
      -p http1:8080 \
      --es 2G \
      --env-from-secret apikey
  fi
fi