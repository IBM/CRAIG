#!/bin/sh

usage() {
  # Display Help
  echo
  echo "Syntax: $ template-test.sh [-h] [-a API KEY]"
  echo "Options:"
  echo "  a     IBM Cloud Platform API Key (REQUIRED)."
  echo "  s     SSH Public Key (REQUIRED)"
  echo "  r     Region to deploy resources in. Default value = 'us-south'."
  echo "  g     Resource group to deploy resources in. Default value = 'default'."
  echo "  h     Print help."
  echo
}

# set up defaults and get arguments
API_KEY="NOT-SET"
SSH_KEY="NOT-SET"
REGION="us-south"
RESOURCE_GROUP="default"
WORKSPACENAME="craig-template-test"
TEMPLATE="quick-start-power"

# define arguments for getopts to look for (a,s,r,g)
while getopts ":ha:s:r:g:" opt; do
  case $opt in
  h) # if -h print usage
    usage
    exit 0
    ;;
  a) API_KEY=$OPTARG ;;
  s) SSH_KEY=$OPTARG ;;
  r) REGION=$OPTARG ;;
  g) RESOURCE_GROUP=$OPTARG ;;
  \?) # this case is for when an unknown argument is passed (e.g. -c)
    echo "Invalid option: -$OPTARG"
    exit 1
    ;;
  esac
done

if [ $API_KEY == "NOT-SET" ]; then
  echo "Please provide your IBM Cloud API Key."
  exit 1
fi

if [ "$SSH_KEY" == "NOT-SET" ]; then
  echo "Please provide your public SSH Key"
  exit 1
fi

# IAM token needed for API Calls
TOKEN=$(echo $(curl -s -k -X POST \
      --header "Content-Type: application/x-www-form-urlencoded" \
      --data-urlencode "grant_type=urn:ibm:params:oauth:grant-type:apikey" \
      --data-urlencode "apikey=$API_KEY" \
      "https://iam.cloud.ibm.com/identity/token") | jq -r .access_token)

# Store tar file for template in 'template-test.tar'
curl -s -X GET \
  --url http://localhost:8080/api/craig/template-tar/$TEMPLATE \
  -o 'template-test.tar'

# Create workspace and store workspace info
WORKSPACE_DATA=$(curl -s --request POST \
  --url https://schematics.cloud.ibm.com/v1/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"'$WORKSPACENAME'", "resource_group": "'$RESOURCE_GROUP'","type": ["terraform_v1.3"],
     "location": "'$REGION'", "description": "Automated CRAIG testing workspace",
     "tags": ["craig"], "template_data": [{ "type": "terraform_v1.3"}]}')
WORKSPACE_ID=$(echo "$WORKSPACE_DATA" | jq -r .id)
TEMPLATE_ID=$(echo "$WORKSPACE_DATA" | jq -r .template_data[0].id)

# Upload template-test.tar file to newly created workspace
curl -s --request PUT \
  --url https://schematics.cloud.ibm.com/v1/workspaces/$WORKSPACE_ID/template_data/$TEMPLATE_ID/template_repo_upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: multipart/form-data" \
  --form "file=@template-test.tar"

# Wait for tar file to upload before continuing
while true; do
    WORKSPACE=$(curl -s --request GET --url https://schematics.cloud.ibm.com/v1/workspaces/$WORKSPACE_ID \
    -H "Authorization: Bearer $TOKEN")
    WORKSPACE_STATUS=$(echo "$WORKSPACE" | jq -r '.status')
    if [ "$WORKSPACE_STATUS" == "INACTIVE" ]; then
      echo "Tar file succesfully uploaded"
      break
    elif [ "$WORKSPACE_STATUS" == "FAILED" ]; then
      echo "Error: Tar file failed to upload"
      echo $WORKSPACE
      exit 1
    else
      echo "Waiting tar file to finish uploading..."
      sleep 10
    fi
done

# Clean up local tar file
rm template-test.tar

# Set vars in workspace
UPDATE_VARS=$(curl -s --request PUT \
  --url "https://schematics.cloud.ibm.com/v1/workspaces/$WORKSPACE_ID/template_data/$TEMPLATE_ID/values" \
  -d '{"variablestore": [{"name": "ibmcloud_api_key", "secure": true, "use_default": false, "value": "'$API_KEY'"},
      {"name": "vsi_ssh_key_public_key", "secure": false, "use_default": false, "value": "'"$SSH_KEY"'" }]}' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

# Begin generate plan job
JOB_ID=$(curl -s --request POST \
  --url "https://schematics.cloud.ibm.com/v1/workspaces/$WORKSPACE_ID/plan" \
  -H "Authorization: Bearer $TOKEN" | jq -r .activityid)

# Check status of generate plan job
while true; do
  JOB=$(curl -s --request GET \
    --url "https://schematics.cloud.ibm.com/v2/jobs/$JOB_ID" \
    -H "Authorization: Bearer $TOKEN")
  JOB_STATUS=$(echo "$JOB" | jq -r '.status.workspace_job_status.status_code')
  if [ "$JOB_STATUS" == "job_failed" ]; then
    echo "Error: Generate plan failed"
    echo $JOB
    exit 1
  elif [ "$JOB_STATUS" == "job_finished" ]; then
    echo "Plan successfully generated"
    break
  elif [ "$JOB_STATUS" == "job_pending" ] || [ "$JOB_STATUS" == "job_in_progress" ]; then
    echo "Generate plan pending...."
    sleep 20
  else
    echo "Error: Job cancelled"
    echo $JOB
    exit 1
  fi
done
