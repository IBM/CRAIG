# Changelog

All notable changes to this project will be documented in this file.

## 0.7.0

### Upgrade Notes

- Dynamic subnet tiers and advanced subnet tiers are now mutually exclusive. This prevents the application from crashing when advanced subnet options are used with dynamic subnets

### Features

- When a form page is invalid, the title and icon will be rendered in red in the left navigation bar
- When setting Account ID on the options page, the value will auto populate in some forms where `account_id` is required
- When downloading Terraform code, the downloaded archive now has a timestamped date as part of the filename
- Documentation pages now each have a date when the documentation was last updated
- Information on the default template can now be found on the home page
- Advanced options have been moved to a new tab `Advanced` in the Left Navigation Menu
- Edge Networking tile now redirects users to the home page when no edge network is found

### Fixes

- Frixed an error where create button was misaligned on projects page
- Fixed an issue where `public-and-private` was not a valid value for service endpoints on options page
- MultiSelects now correctly show full name on hover instead of being cut off
- Fixed an issue causing toggles on Routing Table page to not set state when toggled
- Cluster `entitlement` field is no longer displayed when creating an IKS cluster
- Fixed an error causing notifications to be rendered on top of one another
- Fixed an error causing VSI Block Storage volumes to be invalid when no capacity is provided
- Fixed a bug in the terraform causing SSH Key validation to have incorrect reference
- Fixed a bug causing vpn server client dns server IPs to not render correctly as a list of strings
- Fixed an error where dynamically addressed subnets had overlapping VPC address prefixes
- Fixed an error where changing from dynamic subnets to legacy subnets was causing the option page to not be saved
- Subnet address prefixes no longer dependencies for prefixes in other zones

## 0.6.0

### Features

- Prettier added as a dependency as well as repo level `.prettierrc.json` and `.prettierignore`. To run prettier from the root directory, use the command `npm run pretty`
- Added functionality to allow for CRAIG to create Terraform for imported Secrets Manager certificates in an existing secrets manager instance
- Secrets Manager instance objects without a `secrets` array now have one added on store update
- When no Secrets Manager instances are created within the state store, the VPN Server page now shows a tile with an explanation and a link to `/form/secretsManager`
- Detailed installation instructions have been added to `README.md`
- Added functionality to allow CRAIG to create LogDNA, Sysdig, Activity Tracker, and needed resources to match the Terraform IBM Modules Obsrvability Module functionality
- Added functionality for LogDNA and Sysdig in state store
- Added functionality to create DNS Services, Records, Zones, and Custom Resolvers on `/forms/dns/`
- Endpoints for Cloud Services are now a global option variable instead of being handled at the component level
- On the options page, users can now choose to use only FS Cloud validated regions or any VPC regions
- Added account_id Terraform variable, this is used in some VPE deployments
- By default, subnets are now assigned a number of addresses based on resources. The original subnet management is now referred to as `legacy`
- By default, all outbound traffic rules are no longer created in ACLs
- The default VSI image has been changed to `ibm-ubuntu-22-04-1-minimal-amd64-1`
- The Edge Networking form now has a `none` option to allow the user visual feedback on the status of the Edge Network. A tooltip has been added to explain the Edge Networking Zones dropdown.
- IAM and Access Control Policies have been moved in the navigation bar for a better workflow
- Components no longer show as `required` in the Left Nav when the user is not using FS Cloud
- VPCs can now be provisioned with Flow Logs disabled
- Added Terraform documentation in the About tab for each component for each resource created by CRAIG

### Fixes

- DNS subnets now correctly render when list of strings
- Fixed an issue cauing errors to occur for unfound props on the Options page
- Fixed an error causing `use_prefix` in resource groups to not correctly change the prefix of the resource group
- Fixed an error causing DNS instance resources to have undefined references to parent issue
- Fixed an error causing `cos_instance_crn` to not be added to OpenShift clusters
- Fixed an error causing CIDR blocks to be valid entries for routing table `next_hop` value

## 0.5.0

### Upgrade Notes

- Code Mirror Rendering is now handled by `carbon-react-code-mirror`

### Features

- Users can now create advanced Subnet Tiers. This allows users to create subnets with custom CIDR blocks and choose zones within a tier
- Users can now create Context Based Restrictions Rules and Zones from the `/forms/cbr` page
- Users can now create VPN Servers and VPN Server Routes from the `/forms/vpnServers` page
- Added documentation for Routing Tables
- Added documentation for Load Balancers
- When downloading terraform code, VPCs are now separated into modules with grouped components
- When downloading terraform code, ACLs, Security Groups, and Routing Tables are now each in their own file within the VPC module
- Release notes now contain upgrade notes
- To maintain rule order, ACL rules are now nested in each ACL block, rather than being their own resource
- VSI Image names are now rendered in alphabetical order
- Added JSON to IAC code for Secrets Manager VPE, Reserved IP for VSI, Secrets Manager Key Value Secret, and DNS Service
- When downloading Terraform code, `prefix` and `region` are now variables to allow for easier reuse
- Users can now save configurations as projects in browser storage

### Fixes

- Fixed an issue causing security group rules and acl rules to be incorrectly added to new groups after duplication
- SCC and IAM Account Settings pages are no longer forced open when disabled
- Duplicate lists and rules form is no longer shown when no security groups are created
- Fixed an issue where no margin was created between form titles and the empty resource tile
- When updating the name of an ACL, child rules are correctly updated to point to the parent ACL
- Empty tile form is now shown in VPC Subnet Tiers for VPCs where no subnets have been provisioned
- Users can now save Activity Tracker when it is disabled
- When deleting a resource group, Cluster Worker Pools will now have the value set to null if unfound
- `virtual_servers.tf`, `ssh_keys.tf`, and `vpn_gateways.tf` are no longer created as part of the download when no resources are present
- A variable for an SSH public key is no longer created for SSH Keys that are retrieved from data
- COS bucket types are now correctly saved as lower case
- When updating the store, security groups will now have `sg` set to the parent name when the name has changed

## 0.4.0

### Upgrade Notes

- Support for Teleport has been removed

### Features

- Implemented Routing Tables Page
- Implemented Load Balancers Page
- Enhanced CodeMirror styling to more closely match carbon code blocks
- Copy networking rule fields now have tooltips describing usage
- Users can now change Activity Tracker instance name
- Users can now disable Activity Tracker
- Terraform no longer uses native function `split`, allowing for easier conversion to cdktf
- Kerning on release notes page now easier to read

### Fixes

- Block Storage volume modal no longer incorrectly shows as invalid
- Copying a network rule no longer causes Security Groups or Network ACLs to incorrectly be created with copied rule data by default
- Cluster page no longer fails to load after deleting a vpc where a cluster is created
- When creating an edge network, a resource group for those resources called `edge-rg` is now created
- Code Mirror text no longer spreads empty arrays over multiple lines
- Users can no longer delete SSH keys that are in use

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
