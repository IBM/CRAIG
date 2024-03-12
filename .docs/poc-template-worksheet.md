# Worksheet for Power VS POC template

Set up access policies in your IBM Cloud account following the instructions [here](access-policies.md) <br>

Create in your IBM cloud account:<br>
- API key

## Record the values for the keys mentioned below:

### On-Premises information

| *Keys*                                                                                      | *Values* |
| ------------------------------------------------------------------------------------------- | -------- |
| [*On-Prem network CIDRs](powervs-poc.md#on-premises-network-cidrs-and-peer-address)         |          |
| [*On-Prem Peer Address](powervs-poc.md#on-premises-network-cidrs-and-peer-address)          |          |
| [*On-Prem connection preshared key](powervs-poc.md#configuring-the-on-premises-vpn-gateway) |          |

### IBM Cloud information   

| *Keys*                                                                                                         | *Values* |
| -------------------------------------------------------------------------------------------------------------- | -------- |
| [Region](powervs-poc.md#region-and-power-vs-zone)                                                              |          |
| [Power VS Zone](powervs-poc.md#region-and-power-vs-zone)                                                       |          |
| [resource name prefix](powervs-poc.md#resource-prefix) (optional)                                              |          |
| [*Public SSH key](powervs-poc.md#set-public-ssh-keys)                                                          |          |
| [*IBM Cloud API Key](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui#create_user_key) |          |
| [VPC VPN network CIDR](powervs-poc.md#vpc-network-cidr)                                                        |          |
| [VPC VSI network CIDR](powervs-poc.md#vpc-network-cidr)                                                        |          |
| [VPC VPE network CIDR](powervs-poc.md#vpc-network-cidr)                                                        |          |
| [Power VS network CIDR](powervs-poc.md#power-virtual-server-network-cidr)                                      |          |


*Note*: The asterisk (*) denotes mandatory fields; optional values can be provided, otherwise CRAIG will default to predefined values.