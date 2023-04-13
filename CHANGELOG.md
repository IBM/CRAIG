# Changelog

All notable changes to this project will be documented in this file.

## 0.3.0

### Features

- Backed API calls now support multiple regions
- Users can now create an edge network from the home page
- Users can now scale the number of availability zones from the home page
- Forms with invalid fields will be open by default when navigating to the component page
- Users can no longer navigate to a form page when no prefix or region is selected
- Users can now easily containerize and deploy application
- Users can now import environments from SLZ using override.json on the home page
- Added functionality to allow for CRAIG JSON to be converted into CDKTF JSON
- Users can now create, update, and delete VSI deployments from the GUI

### Fixes

- Removed unneeded props from secrets manager JSON
- Fixed vulnerabilities in `/client` pagage-lock.json
- Better file exports and imports
- Now uses jsonToTf instead of depricated jsonToTfLegacy
- F5 Default Route Gateway now has correct CIDR
- Removed unused event streams parameters when not an enterprise plan

## 0.2.0

### Features

- Implemented AppID page
- Implemented Activity Tracker page
- Implemented Clusters page
- Implemented Event Streams page
- Implemented IAM Account Settings page
- Implemented Key Management page
- Implemented Object Storage page
- Implemented Security and Compliance Center page
- Implemented Security Groups page
- Implemented SSH Keys page
- Implemented Transit Gateways page
- Implemented VPC page
- Implemented Network ACLs Page
- Implemented Subnets Page
- Implmemented VPE page
- Implemented VPN Gateways page
- Implemented Secrets Manager page
- Implemented Summary page
- Implemented notifications on save / error
- Users can now upload CRAIG JSON data from file
- Users can no longer download terraform code when configuration is invalid
- Moved some code mirror functionality to `/client/src/lib`
- Added backend functionality to allow users to import Secure Landing Zone override.json and convert to CRAIG
- When downloading Terraform code users now also get craig.json, a file containing the JSON contents of their environment.

### Fixes

- More consistent css form form/code mirror
- Popovers on footer are consistant with other popovers
- Manual address prefix subnets `depends_on` to force them to wait until the prefixes for those subnets are done creating
- Teleport instances now have correct template values in Terraform
- F5 instances now have correct template values in Terraform

## 0.1.0

### Features

- Added state store and JSON to IaC Capabilities
- Added navbar and page template
