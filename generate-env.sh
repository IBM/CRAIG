#!/usr/bin/env bash


fatal() {
    echo "FATAL: $*"
    exit 1
}

check_runtime_prereqs() {
    echo "checking prereqs"
    [[ "${BASH_VERSINFO:-0}" -lt 4 ]] && fatal "This script requires bash version 4 or higher. Version ${BASH_VERSINFO} is in use."
    [[ -z "$(which jq)" ]] && fatal "jq is not installed. See https://stedolan.github.io/jq/"
    [[ -z "$(which ibmcloud)" ]] && fatal "ibmcloud is not installed"
}

install_ibmcloud_plugin () {
    [[ -z "$1" ]] && fatal "install_ibmcloud_plugin requries one parameter which contains the name of a plugin to install"
    # Install the IBM Cloud plugin
    
    if ! ibmcloud plugin show $1 &> /dev/null ; then
        echo "Installing ibmcloud plugin $1"
        ibmcloud plugin install $1 || fatal "Failed to install ibmcloud plugin: $1"
    fi
}

[[ -z "$1" ]] && fatal "An output file name is required as the first parameter."
ibmcloud iam oauth-tokens &> /dev/null || fatal "Please log in with the ibmcloud CLI (ibmcloud login)"

check_runtime_prereqs

# Install ibmcloud plugins if necessary
install_ibmcloud_plugin power-iaas

outputfile=$1
echo "# Comment out or remove workspaces that you do not want to use with CRAIG." > $outputfile
echo "# You should have a max of one workspace listed per zone." >> $outputfile

echo "" >> $outputfile

echo "Fetching workspace information"
# Look up all Power VS workspaces and get their name, region (zone), and ID
workspaces=$(ibmcloud pi wss --json | jq -r '.[]? | "\(.name),\(.location.region),\(.id)"')

# Cycle through all the workspaces
while IFS=, read name region id;
do
    echo "# Workspace: ${name}" >> $outputfile
    # the ${region^^} makes all characters in the region upper case
    echo "POWER_WORKSPACE_${region^^}=$id" >> $outputfile
    echo "" >> $outputfile

done <<< "$workspaces"

echo "Generated file ${outputfile}:"
echo ""
cat $outputfile