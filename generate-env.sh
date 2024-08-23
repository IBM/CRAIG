#!/usr/bin/env bash

fatal() {
    echo "FATAL: $*"
    exit 1
}

check_runtime_prereqs() {
    echo "checking prereqs"
    [[ -z "$(which jq)" ]] && fatal "jq is not installed. See https://stedolan.github.io/jq/"
    [[ -z "$(which ibmcloud)" ]] && fatal "ibmcloud is not installed"
}

install_ibmcloud_power_iaas_plugin () {
    # Install the plugin if is not installed    
    if ! ibmcloud plugin show power-iaas &> /dev/null ; then
        echo "Installing ibmcloud power-iaas plugin"
        ibmcloud plugin install power-iaas || fatal "Failed to install the ibmcloud power-iaas plugin"
    fi

    # Check the major version of the version and upgrade if it is less than 1
    majorVersion=$(ibmcloud plugin show power-iaas --output json | jq -r '.Version.Major' 2>/dev/null )
    [[ -z "$majorVersion" ]] && fatal "Unable to query the major version of the power-iaas ibmcloud plugin version"
    if [[ $majorVersion -lt 1 ]]
    then
        echo "The power-iaas plugin version is less than 1.0.0, upgrading."
        ibmcloud plugin update power-iaas
    fi
}

[[ -z "$1" ]] && fatal "An output file name is required as the first parameter."
ibmcloud iam oauth-tokens &> /dev/null || fatal "Please log in with the ibmcloud CLI (ibmcloud login)"

check_runtime_prereqs

# Install or upgrade the power_iaas plugin if necessary
install_ibmcloud_power_iaas_plugin

outputfile=$1
echo "# Comment out or remove workspaces that you do not want to use with CRAIG." > $outputfile
echo "# You should have a max of one workspace listed per zone." >> $outputfile

echo "" >> $outputfile

echo "Fetching workspace information"
# Look up all Power VS workspaces and get their name, region (zone), and ID
workspaces=$(ibmcloud pi ws list --json | jq -r '.Payload.workspaces[]? | "\(.name),\(.location.region),\(.id)"')

# Cycle through all the workspaces
while IFS=, read name region id;
do
    echo "# Workspace: ${name}" >> $outputfile
    region_upper=$(echo ${region} | tr '[:lower:]' '[:upper:]' |  tr '-' '_')
    echo "POWER_WORKSPACE_${region_upper}=$id" >> $outputfile
    echo "" >> $outputfile

done <<< "$workspaces"

echo "Generated file ${outputfile}:"
echo ""
cat $outputfile