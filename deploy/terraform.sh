usage() {
  # Display Help
  echo
  echo "Syntax: $ terraform.sh [-h] [-d] [-a API KEY]"
  echo "Options:"
  echo "  a     IBM Cloud Platform API Key (REQUIRED)."
  echo
}

formatted_print() {
  printf "\n%s" "##############################################################################"
  printf "\n%s" "# > Terraform Setup: $1"
  printf "\n%s" "##############################################################################"
  printf "\n" "\n"
}

# set up defaults and get arguments
API_KEY="NOT-SET"
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
fi

export TF_VAR_ibmcloud_api_key=$API_KEY
CRAIG_PATH=$(pwd)
TF_PATH=$(pwd)/deploy/power_vs_workspaces
cd $TF_PATH
formatted_print "Initializing Terraform"
FORCE_QUIET=$(terraform init)
echo \\nTerraform Initialized!
formatted_print "Planning Terraform"
FORCE_QUIET=$(terraform plan)
echo \\nTerraform Plan Successful!
formatted_print "Creating Workspaces"
FORCE_QUIET=$(echo "yes" | terraform apply)
echo \\nWorkspace Creation Successful!

# for local deployments convert to list of workspace environment variables
terraform output --json | jq -r 'keys[] as $k | "POWER_WORKSPACE_\($k)=\"\(.[$k] | .value)\""' > $CRAIG_PATH/.env
