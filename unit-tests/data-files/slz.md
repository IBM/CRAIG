
## Resource Groups

Resource groups aid in the organization of account resources in an IBM Cloud account.

The default configuration includes:

Group Name    | Description                                                                                                                                                                    | Optional
--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------
service-rg    | A resource group containing all IBM Cloud Services                                                                                                                             | 
management-rg | A resource group containing the compute, storage, and network services to enable the application provider's administrators to monitor, operation, and maintain the environment | 
workload-rg   | A resource group containing the compute, storage, and network services to support hosted applications and operations that deliver services to the consumer                     | 
edge-rg       | A resource group containing the compute, storage, and network services necessary for edge networking                                                                           | true

### Related Links

- [Resource Group Documentation](https://cloud.ibm.com/docs/account?topic=account-rgs&interface=ui)
- [Resource Group Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_group)

-----

## Cloud Object Storage

IBM Cloud Object Storage (COS) is a highly available, durable, and secure platform for storing unstructured data. PDFs, media files, database backups, disk images, large structured datasets can be uploaded as objects and then organized into containers named Buckets.

The initial configuration includes two COS instances:

Instance Name | Description
--------------|--------------------------------------------------------------------------------------------------------------------
cos           | A COS instance with two buckets, a management bucket and a workload bucket, where respective objects can be stored
atracker-cos  | A COS instance with a bucket where Activity Tracker logs will be stored

The initial configuration also includes a service credential to allow for Activity Tracker to connect to COS.

Credential Name | Description
----------------|-------------------------------------------------------------------------------------------------------
cos-bind-key    | A service credential to allow for Activity Tracker to have write access to an Object Storage Instance

### Related Links

- [Cloud Object Storage Documentation](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-about-cloud-object-storage)
- [Resource Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_instance)
- [Object Storage Bucket Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/cos_bucket)
- [Resource Key Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/data-sources/resource_key)

-----

## Key Management

A key management service is used to create, import, rotate, and manage encryption keys. By default a single instance is created, but users can add additional instances as needed.

IBM Cloud offers two solutions for key management:

Service Name                                   | Description
-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
IBM Cloud Hyper Protect Crypto Services (HPCS) | A dedicated key management service and hardware security module (HSM) based on IBM Cloud. Built on FIPS 140-2 Level 4-certified hardware, this service allows users to take the ownership of the cloud HSM to fully manage encryption keys and perform cryptographic operations. Users cannot use SLZ to initialize HPCS. In order to use HPCS with Secure Landing Zone users will need to bring an existing instance.
IBM Cloud Key Protect                          | A full-service encryption solution that allows data to be secured and stored in IBM Cloud using the latest envelope encryption techniques that leverage FIPS 140-2 Level 3 certified cloud-based hardware security modules.

To be FS Cloud compliant, data at rest is to always be encrypted using your keys.

The default configuration includes:

Key Name       | Description
---------------|-------------------------------------------------------------------------------
key            | An encryption key for service instances
vsi-volume-key | An encryption key for Virtual Server Instance (VSI) deployments
roks-key       | An encryption key for Red Hat OpenShift Kubernetes (ROKS) cluster deployments
atracker-key   | An encryption key for Activity Tracker

To allow keys from your Key Protect Service to encrypt VSI and VPC Block Storage Volumes. The creation of these service authorizations can be enabled and disabled with the Authorize VPC Reader Role toggle.

### Related Links

- [Docs](https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-shared-encryption-at-rest)
- [Get Started With HyperProtect Crypto Servies](https://cloud.ibm.com/docs/hs-crypto?topic=hs-crypto-get-started)
- [IBM Cloud Key Protect](https://cloud.ibm.com/docs/key-protect?topic=key-protect-about)
- [Resource Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_instance)
- [Key Management Key Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/kms_key)
- [Key Management Key Policy Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/kms_key_policies)
- [Key Management Key Ring Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/kms_key_rings)

-----

## VPCs

A Virtual Private Cloud (VPC) is a public cloud offering that lets an enterprise establish its own private cloud-like computing environment on shared public cloud infrastructure. A VPC gives an enterprise the ability to define and control a virtual network that is logically isolated from all other public cloud tenants, creating a private, secure place on the public cloud.

The default configuration includes:

Network Name | Description                                                                                                                  | Optional
-------------|------------------------------------------------------------------------------------------------------------------------------|----------
management   | A VPC for management to enable the application provider's administrators to monitor, operation, and maintain the environment | 
workload     | A VPC for workload to support hosted applications and operations that deliver services to the consumer                       | 
edge         | a VPC for edge if you enable edge networking for F5                                                                          | true

### Related Links

- [Docs](https://www.ibm.com/cloud/learn/vpc)
- [Virtual Private Cloud Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_vpc)
- [VPC Flow Log Terraform Documetation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_flow_log)
- [VPC Public Gateway Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_public_gateway)

-----

## Network Access Control Lists

An Access Control List (ACL) is a built-in, virtual firewall. An ACL can be leveraged to control all incoming and outgoing traffic on a VPC.

By default, the management and workload ACLs are configured to have rules that are FS Cloud compliant. Removing the below rules may affect FS Cloud compliance for your environment.

Rule Name
- `allow-ibm-inbound`
- `allow-ibm-outbound`
- `allow-all-network-inbound`
- `allow-all-network-outbound`

If you select "Use Cluster Rules", these additional ACL rules will be created to allow cluster provisioning from private service endpoints

Rule Name                           | Action | Direction | Source        | Destination   | Protocol | Port
------------------------------------|--------|-----------|---------------|---------------|----------|-------------
roks-create-worker-nodes-inbound    | Allow  | Inbound   | 161.26.0.0/16 | 10.0.0.0/8    | All      | 
roks-create-worker-nodes-outbound   | Allow  | Outbound  | 10.0.0.0/8    | 161.26.0.0/16 | All      | 
roks-nodes-to-service-inbound       | Allow  | Inbound   | 166.8.0.0/14  | 10.0.0.0/8    | All      | 
roks-nodes-to-service-outbound      | Allow  | Outbound  | 166.8.0.0/14  | 10.0.0.0/8    | All      | 
allow-app-incoming-traffic-requests | Allow  | Inbound   | 10.0.0.0/8    | 10.0.0.0/8    | TCP      | 30000-32767
allow-app-outgoing-traffic-requests | Allow  | Outbound  | 10.0.0.0/8    | 10.0.0.0/8    | TCP      | 30000-32767
allow-lb-incoming-traffic-requests  | Allow  | Inbound   | 10.0.0.0/8    | 10.0.0.0/8    | TCP      | 443
allow-lb-outgoing-traffic-requests  | Allow  | Outbound  | 10.0.0.0/8    | 10.0.0.0/8    | TCP      | 443

### Related Links

- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-using-acls)
- [Network Access Control List Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_network_acl)

-----

## Subnets

Subnet Tiers are used to dynamically generate Subnets and reserve space for expansion into other zones. Subnets are networks created within a VPC; they are a fundamental mechanism within a VPC used to allocate addresses to individual resources (such as Virtual Server Instances), and enable various controls to these resources through the use of network ACLs, routing tables, and resource groups. Subnets are bound to a single zone; however, they can reach all other subnets within a VPC, across a region. They are created from a larger address space within the VPC called an address prefix; and you can provision multiple subnets per address prefix.

When dynamic subnets are enabled, there are three main actions that are automatically executed. First, VPC address prefixes are automatically determined based on the zone and resource. Generally, each resource is given an index starting at 0 and the address prefix(es) for that resource is calculated as follows: 10.([index] * 3 + [zone number])0.0.0/(suffix). For example, a VSI with index 2 and 3 subnets would have the following address prefixes: 10.(2 * 3 + 1)0.0.0 = 10.70.0.0, 10.(2*3+2)0.0.0 = 10.80.0.0, and 10.(2*3+3)0.0.0 = 10.90.0.0.

Next, the subnets are configured according to the number of resources in order to minimize the number of IP addresses per subnet. By default, each subnet has 5 IPs. Additional IPs are then added according to the following table: 

Resource              | # of IPs
----------------------|---------------
Cluster Worker Node   | 2 per worker
Reserved VPE IP       | 1
VPN Gateway           | 4 per gateway
VPN Server            | 1
VSI Network Interface | 1 per VSI

Finally, the CIDR range for each subnet is calculated by the number of needed interfaces. For example, a subnet with a VPN gateway would require, 5 addresses by default, and 4 additional addresses for a total of 9 addresses. This is rounded to the highest exponent of 2. In this example, the number of IPs is rounded up to 16.

The default configuration includes:

VPC        | Subnet Tier | Zone 1        | Zone 2        | Zone 3
-----------|-------------|---------------|---------------|---------------
management | vsi         | 10.10.10.0/24 | 10.10.20.0/24 | 10.10.30.0/24
management | vpe         | 10.20.10.0/24 | 10.20.20.0/24 | 10.20.30.0/24
management | vpn         | 10.30.10.0/24 | -             | -
workload   | vsi         | 10.40.10.0/24 | 10.40.20.0/24 | 10.40.30.0/24
workload   | vpe         | 10.50.10.0/24 | 10.50.20.0/24 | 10.50.30.0/24

### Related Links

- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-about-subnets-vpc&interface=ui)
- [VPC Subnet Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_subnet)

-----

## Transit Gateways

A Transit Gateway provides connectivity between two or more VPCs which allows distributed resources to communicate with each other. By default, a single transit gateway is created connecting the management and workload VPCs. Additional connections can be made to specific VPCs by providing the CRN.

The default configuration includes:

Service Name        | Description
--------------------|-----------------------------------------------------------------------------------------------------------
iac-transit-gateway | A transit gateway deployed in the SLZ service resource group connecting the management and workload VPCs.

### Related Links

- [Docs](https://cloud.ibm.com/docs/transit-gateway?topic=transit-gateway-about)
- [Transit Gateway Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/tg_gateway)
- [Transit Gateway Connection Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/tg_connection)

-----

## Security Groups

An IBM Cloud Security Group is a set of IP filter rules that define how to handle incoming and outgoing traffic to both the public and private interfaces of a virtual server instance (VSI).

By default, the management and workload VPE security groups are configured to have rules that are FS Cloud compliant. Removing the below rules may affect FS Cloud compliance for your environment.

Rule Name
- `allow-ibm-inbound`
- `allow-vpc-inbound`
- `allow-vpc-outbound`
- `allow-ibm-tcp-53-outbound`
- `allow-ibm-tcp-80-outbound`
- `allow-ibm-tcp-433-outbound`

### Related Links

- [Docs](https://cloud.ibm.com/docs/security-groups?topic=security-groups-about-ibm-security-groups)
- [VPC Security Group Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_security_group)
- [VPC Security Group Rule Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_security_group_rule)

-----

## Virtual Private Endpoints

A Virtual Private Endpoint (VPE) gateway enables users to connect to supported IBM Cloud Services from their VPC network via an IP address allocated from a subnet within the VPC. The VPE gateway is a virtualized function that scales horizontally, is redundant and highly available, and spans all availability zones of the specified VPC.

The default configuration connects the management and workload VPCs to IBM Cloud Object Storage by creating a VPE subnet in each zone of the VPC, then creating a VPE gateway for each VPE subnet.

### Related Links

- [VPE Supported Services](https://cloud.ibm.com/docs/vpc?topic=vpc-vpe-supported-services)
- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-about-vpe)
- [VPC Subnet Reserved IP Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_subnet_reserved_ip)
- [Virtual Endpoint Gateway Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_virtual_endpoint_gateway)
- [Virtual Endpoint Gateway IP Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_virtual_endpoint_gateway_ip)

-----

## Activity Tracker

The Activity Tracker service can be used to capture and monitor activities performed on the IBM Cloud account by users.

The default configuration includes:

Service Name           | Description
-----------------------|-----------------------------------------------------------------------------
<your prefix>-atracker | An Activity Tracker instance deployed in the service resource group.
atracker-cos           | A Cloud Object Storage instance deployed in the service resource group.
atracker-bucket        | A Cloud Object Storage bucket where Activity Tracker logs will be stored.
cos-bind-key           | An IAM API key that has writer access to the Cloud Object Storage instance.

### Related Links

- [Docs](https://cloud.ibm.com/docs/activity-tracker?topic=activity-tracker-getting-started)
- [Activity Tracker Target Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/atracker_target)
- [Activity Tracker Route Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/atracker_route)

-----

## SSH Keys

SSH keys identify a user or device through public-key cryptography and allow access to a device without using a password. At least one SSH Key is required to create virtual server instances. Based on the pattern selected, an SSH key may or may not be configured automatically.

Pattern                             | Configuration
------------------------------------|-------------------------
Virtual Server Instance (VSI)       | One SSH key configured.
Red Hat OpenShift Kubernetes (ROKS) | No SSH key configured.
Mixed                               | One SSH key configured.

### Related Links

- [Docs](https://cloud.ibm.com/docs/ssh-keys?topic=ssh-keys-about-ssh-keys)
- [VPC SSH Key Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_ssh_key)
- [VPC SSH Key Terraform Data Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/data-sources/is_ssh_key)

-----

## Virtual Server Instance Deployments

IBM Cloud Virtual Servers for VPC allow users to deploy fast, flexible, and secure instances. The SLZ Virtual Server Instance (VSI) Deployment allows users to create multiple instances with the same configuration on various subnets across a single VPC. Based on the pattern selected, a deployment may or may not be configured automatically.

The default configuration includes:

Pattern                             | Configuration
------------------------------------|---------------------------------------------------------------------------------------------------------------------
Virtual Server Instance (VSI)       | Two VSI deployments for three VSIs distributed across the VSI subnet tier of both the management and workload VPCs.
Red Hat OpenShift Kubernetes (ROKS) | No VSI deployments configured.
Mixed                               | One VSI deployment for three VSIs distributed across the VSI subnet tier of the management VPC.

### Related Links

- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-about-advanced-virtual-servers)
- [VPC Image Terraform Data Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/data-sources/is_image)
- [VPC Virtual Server Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_instance)
- [VPC Block Storage Volume Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/data-sources/is_volume)

-----

## Clusters

IBM Cloud provides users with the ability to deploy highly available, containerized apps on Red Hat OpenShift clusters and Kubernetes clusters. Based on the pattern selected, a cluster may or may not be configured automatically.

Pattern                             | Configuration
------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------
Virtual Server Instance (VSI)       | No clusters configured.
Red Hat OpenShift Kubernetes (ROKS) | Two OpenShift clusters with three zones in VSI Subnet Tier with a worker pool dedicated to logging deployed in both management and workload VPCs.
Mixed                               | One OpenShift cluster with three zones in VSI Subnet Tier with a worker pool dedicated to logging deployed in the workload VPC.

### Related Links

- [Getting Started With Red Hat OpenShift Clusters on IBM Cloud](https://cloud.ibm.com/docs/openshift?topic=openshift-getting-started)
- [Getting started with IBM Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started)
- [VPC Cluster Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/data-sources/container_vpc_cluster)
- [VPC Worker Pool Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/container_vpc_worker_pool)

-----

## VPN Gateways

VPN Gateway service for VPC provides secure, encrypted connectivity from a user's on-premise network to the IBM Cloud VPC network.

The default configuration includes:

management-gateway | A VPN gateway service deployed in the management resource group on the VPN subnet tier of the management VPC.
-------------------|---------------------------------------------------------------------------------------------------------------

### Related Links

- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-vpn-overview)
- [VPC VPN Gateway Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_vpn_gateway)

-----

## App ID

IBM Cloud App ID allows user to easily add authentication to web and mobile applications. Keys can be added to connect an application to an IBM Cloud service. Please note, at least one App ID instance with at least one key is required to create a Teleport Bastion Host.

By default, no AppID instances are created.

### Related Links

- [About App ID](https://cloud.ibm.com/docs/appid?topic=appid-about)
- [Getting Started With App ID](https://cloud.ibm.com/docs/appid?topic=appid-getting-started)
- [Resource Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_instance)
- [Resource Key Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_key)
- [AppID Redirect URL Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/appid_redirect_urls)

-----

## Icd

IBM Cloud Databases are managed databases (and a messaging queue) that are hosted in IBM Cloud and integrated with other IBM Cloud services.

Supported Databases
- `Databases for PostgreSQL`
- `Databases for etcd`
- `Databases for Redis`
- `Databases for MongoDB`
- `Databases for MySQL`

Optional Fields
Memory          | - `The amount of memory in gigabytes for the database, split across all members. If not specified, the default setting of the database service is used, which can vary by database type.`
Disk            | - `The amount of disk space for the database, split across all members. If not specified, the default setting of the database service is used, which can vary by database type.`
CPU             | - `Enables and allocates the number of specified dedicated cores to your deployment.`

### Related Links

- [Getting Started with IBM Cloud Databases](https://cloud.ibm.com/docs/cloud-databases)
- [IBM Cloud Databases Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/database)

-----

## F5 Big IP

The F5 BIG-IP Virtual Edition will enable you to setup a client-to-site full tunnel VPN to connect to your management/edge VPC and/or a web application firewall (WAF) to enable consumers to connect to your workload VPC over the public internet.

Through Secure Landing Zone, users can optionally provision the F5 BIG-IP so that one can either setup the implemented solution of a client-to-site VPN or web application firewall (WAF).

F5 BIG-IP can be provisioned in a separate edge VPC or in the existing management VPC. Best practice is to configure F5 in the edge VPC. To enable edge networking, return to the home page.

### Subnet Tier/CIDR Blocks

The chart below shows the total subnets needed for F5 BIG-IP and other services (VPE) within the VPC. IBM Cloud has a quota of 15 Subnets per VPC, contact support to increase the quota for subnets per VPC.

Edge Networking Pattern | Number of subnets without f5-bastion | Number of subnets with f5-bastion
------------------------|--------------------------------------|-----------------------------------
WAF                     | 15                                   | 18
VPN                     | 18                                   | 21
VPN-and-WAF             | 21                                   | 24

The chart below notes the CIDR blocks and the zones that each F5 BIG-IP deployment is deployed and can be modified in the Subnets section.

### F5 Subnet CIDR Blocks

CIDR         | Zone   | WAF | VPN | VPN-and-WAF
-------------|--------|-----|-----|-------------
10.5.10.0/24 | zone-1 | ✔   | ✔   | ✔
10.5.20.0/24 | zone-1 | ✔   | ✔   | ✔
10.5.30.0/24 | zone-1 | ✔   | ✔   | ✔
10.5.40.0/24 | zone-1 |     | ✔   | ✔
10.5.50.0/24 | zone-1 |     | ✔   | ✔
10.5.60.0/24 | zone-1 |     |     | ✔
10.6.10.0/24 | zone-2 | ✔   | ✔   | ✔
10.6.20.0/24 | zone-2 | ✔   | ✔   | ✔
10.6.30.0/24 | zone-2 | ✔   | ✔   | ✔
10.6.40.0/24 | zone-2 |     | ✔   | ✔
10.6.50.0/24 | zone-2 |     | ✔   | ✔
10.6.60.0/24 | zone-2 |     |     | ✔
10.7.10.0/24 | zone-3 | ✔   | ✔   | ✔
10.7.20.0/24 | zone-3 | ✔   | ✔   | ✔
10.7.30.0/24 | zone-3 | ✔   | ✔   | ✔
10.7.50.0/24 | zone-3 |     | ✔   | ✔
10.7.60.0/24 | zone-3 |     |     | ✔

### Deployment Configuration

F5 BIG-IP can be deployed with up to four interfaces within 4 different VPC subnets: management, external, workload, and f5-bastion. Each interface refers to the ports on the BIG-IP system, and secondary interfaces are included based on the Edge Networking pattern selected.

The following chart shows the number of subnets/F5 interfaces provisioned for each Edge Networking pattern:

F5 Interface            | WAF | VPN | VPN-and-WAF
------------------------|-----|-----|-------------
F5 Management Interface | ✔   | ✔   | ✔
F5 External Interface   | ✔   | ✔   | ✔
F5 Workload Interface   | ✔   |     | ✔
F5 Bastion Interface    |     | ✔   | ✔

 Each interface has the following different functions:

Interface               | Description
------------------------|---------------------------------------------------------------------------------------------
F5 Management Interface | A special interface dedicated to performing a specific set of system management functions.
F5 External Interface   | The external interface is used by the BIG-IP system to send or receive application traffic.
F5 Workload Interface   | Created only when using F5 patterns that supports WAF.
F5 Bastion Interface    | Created only when using F5 patterns that supports full tunnel VPN service

### Networking Rules

By default, the Edge ACLs are configured to have rules that are FS Cloud compliant within the VPC Access Control section. Removing the below rules may affect FS Cloud compliance for your environment.

Name                       | Action | Direction | Source        | Destination   | Protocol
---------------------------|--------|-----------|---------------|---------------|----------
allow-ibm-inbound          | Allow  | Inbound   | 161.26.0.0/16 | 10.0.0.0/8    | ALL
allow-ibm-outbound         | Allow  | Outbound  | 10.0.0.0/8    | 161.26.0.0/16 | ALL
allow-all-network-inbound  | Allow  | Inbound   | 10.0.0.0/8    | 10.0.0.0/8    | ALL
allow-all-network-outbound | Allow  | Outbound  | 10.0.0.0/8    | 10.0.0.0/8    | ALL

By default, the F5 and Edge VPE security groups are configured to have rules that are FS Cloud compliant within the Security Groups section. Removing the below rules may affect FS Cloud compliance for your environment.

Security groups are split up between the primary subnet tier, which contains the Management Interface Security Group, and three secondary subnet tiers, which contain the External Interface, Workload Interface , and F5 Bastion Interface Security Groups within each respectively.

Interface     | Direction | Protocol | Source                                                                                       | Port
--------------|-----------|----------|----------------------------------------------------------------------------------------------|-----------------
F5 Management | Inbound   | TCP      | CIDR Block value from Bastion host subnet (for example, 10.5.70.0/24)                        | Ports 22-22
F5 Management | Inbound   | TCP      | CIDR Block value from Bastion host subnet (for example, 10.5.70.0/24)                        | Ports 443-443
F5 External   | Inbound   | TCP      | CIS global load balancers allowlisted IP addresses                                           | Ports 443-443
F5 External   | Inbound   | TCP      | Any                                                                                          | Ports 4443-4443
F5 Workload   | Outbound  | TCP      | CIDR block of the subnet your workload or application is located (for example, 10.40.0.0/18) | Ports 443-443
F5 Workload   | Outbound  | TCP      | CIDR block of the subnet your workload or application is located (for example, 10.50.0.0/18) | Ports 443-443
F5 Workload   | Outbound  | TCP      | CIDR block of the subnet your workload or application is located (for example, 10.60.0.0/18) | Ports 443-443
F5 Bastion    | Outbound  | TCP      | CIDR Block value from Bastion subnet (for example, 10.5.70.0/24)                             | Ports 3023-3025
F5 Bastion    | Outbound  | TCP      | CIDR Block value from Bastion subnet (for example, 10.5.70.0/24)                             | Ports 3080-3080

Note:

• Restrict SSH port 22 and F5 configuration utility port 443 into the BIG-IP to the Bastion host.

• Restrict incoming traffic on port 443 to CIS global load balancers allowlisted IP addresses. The allowlisted IP addresses might periodically change and should be updated.

For more information on Networking rules, reference Deploying and configuring F5 BIG-IP on FS Cloud.

### Related Links

- [Deploying and configuring F5 BIG-IP on FS Cloud](https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-vpc-architecture-connectivity-f5-tutorial)
- [Landing Zone Documentation](https://github.com/open-toolchain/landing-zone/blob/main/.docs/f5-big-ip/f5-big-ip.md)
- [F5 Cloud Documentation](https://clouddocs.f5.com/)
- [CIS global load balancers allowlisted IP addresses](https://cloud.ibm.com/docs/cis?topic=cis-cis-allowlisted-ip-addresses)
- [Contact IBM Cloud Support](https://cloud.ibm.com/unifiedsupport/cases/form)
- [VPC Virtual Server Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_instance)

-----

## IAM Account Settings

Identity and Access Management (IAM) settings can be configured account-wide. By default, users in your account verify themselves by logging in with a username and password. To require all users to use more secure authentication factors, enable the type of multifactor authentication (MFA) desired for the account.

MFA types include:

NONE            | MFA Disabled
----------------|--------------------------------------------------------------------------------------------------------------------------------------------------
TOTP            | All non-federated IBMid users are required to authenticate by using an IBMid, password, and time-based one-time passcode (TOTP)
TOTP4ALL        | All users are required to authenticate by using an IBMid, password, and time-based one-time passcode (TOTP)
Email-based MFA | Users authenticate by using a security password that's sent by email
TOTP MFA        | Users authenticate by using a time-based one-time passcode (TOTP) with an authenticator app, such as IBM Security Verify or Google Authenticator
U2F MFA         | Users authentication by using a hardware security key that generates a six-digit numerical code.

If enabled, the multi-factor authentication should be set to the U2F MFA type for all users in your account. Based on the FIDO U2F standard, this method offers the highest level of security. This security is needed because the IBM Cloud Framework for Financial Services requires a smart card or hardware token that is designed and operated to FIPS 140-2 level 2 or higher or equivalent (for example, ANSI X9.24 or ISO 13491-1:2007).

### Related Links

- [Setting up MFA Settings](https://cloud.ibm.com/docs/account?topic=account-account-getting-started)
- [IAM on IBM Cloud for Financial Services Setup](https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-shared-account-setup)
- [IAM Account Settings Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/iam_account_settings)

-----

## Access Groups

Users can manage access on IBM Cloud by setting up Access Groups. An access group can be created to organize a set of users, service IDs, and trusted profiles into a single entity that makes it easy to assign access. A single policy can be assigned to the group instead of assigning the same policy multiple times to each individual users or service ID.

### Policies

Access groups are assigned policies that grant roles and permissions to the members of that group. Members of an access group can include multiple identity types, like users, service IDs, and trusted profiles. The members inherit the policies, roles, and permissions that are assigned to the access group, and also keep the roles that they are assigned individually.

### Dynamic Rules and Policies

You can create dynamic rules and policies to automatically add federated users to access groups based on specific identity attributes. When your users log in with a federated ID, the data from the identity provider (IdP) dynamically maps your users to an access group based on the rules that you set.

### Resource Parameters

Parameter            | Description
---------------------|-------------------------------------------------------------------
Resource             | The resource of the policy definition
Resource Group       | Name of the resource group the policy will apply to
Resource Instance ID | ID of a service instance to give permissions
Service              | Name of the service type of the policy ex. "cloud-object-storage"
Resource Type        | Name of the resource type for the policy

### Related Links

- [Docs](https://cloud.ibm.com/docs/account?topic=account-groups&interface=ui)
- [IAM Access Group Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/iam_access_group)

-----

## Secrets Manager

IBM Cloud Secrets Manager allows users to create, lease, and centrally manage secrets on a dedicated instance built on open source HashiCorp Vault.

Secret Types
- `Passwords of any type (database logins, OS accounts, functional IDs, etc.)`
- `API keys`
- `Long-lived authentication tokens (OAuth2, GitHub, IAM, etc.)`
- `SSH keys`
- `Encryption keys`
- `Other private keys (PKI/TLS certificates, HMAC keys, signing keys, etc.)`

Please note, IBM Cloud Secrets Manager is not yet Financial Services Validated. For this reason, no instances are enabled in the initial configuration but can be created if desired.

### Related Links

- [HashiCorp Vault](https://www.vaultproject.io/)
- [Getting Started with Secrets Manager](https://cloud.ibm.com/docs/secrets-manager?topic=secrets-manager-getting-started)
- [Handling and Securing Secrets on FS Cloud](https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-shared-secrets)
- [FS Cloud Best Practices](https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-best-practices#best-practices-financial-services-validated-services)
- [Resource Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_instance)

-----

## Security Compliance Center

IBM Cloud Security and Compliance Center (SCC) is comprised of two components: Posture Management and Configuration Governance.

Component Name           | Description
-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Posture Manager          | Prevents the misconfiguration of resources by allowing users to standardize how resources should be provisioned and configured according to the organization's security policies.
Configuration Governance | Ensures all teams in the organization are adhering to best practices and external regulations/laws at all times. It will routinely scan all available resources in the account and output a report for review.

By default, IBM Cloud Security and Compliance Center is not enabled but can be enabled if desired.

### Related Links

- [Docs](https://cloud.ibm.com/docs/security-compliance?topic=security-compliance-getting-started)
- [SCC Posture Credential Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/scc_posture_credential)
- [SCC Account Settings Terraform Documetation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/scc_account_settings)
- [SCC Posture Scope Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/scc_posture_scope)

-----

## Event Streams

IBM Cloud Event Streams is an event-streaming platform that helps you build smart apps that can react to events as they happen.

By default, IBM Event Streams instances are not created but can be if desired.

### Related Links

- [Docs](https://cloud.ibm.com/docs/EventStreams/index.html?topic=EventStreams-getting-started#getting_started)
- [Resource Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_instance)

-----

## Context Based Restrictions

IBM Cloud Context-Based Restrictions give users the ability to define and enforce access restrictions. These restrictions add an extra layer of protection that work with traditional IAM Access Policies.

### Related Links

- [Docs](https://cloud.ibm.com/docs/account?topic=account-context-restrictions-whatis)
- [Context-Based Restrictions Zone Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/cbr_zone)
- [Context-Based Restrictions Rule Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/cbr_rule)

-----

## VPN Servers

VPN Servers create client-to-site connectivity that allows remote devices to securely connect to a VPN network using an OpenVPN client.

Secrets Manager is required to create VPN Server instances.

### Related Links

- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-vpn-client-to-site-overview)
- [VPN Server Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_vpn_server)
- [VPN Server Route Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_vpn_server_route)

-----

## Dns

IBM Cloud offers public and private authoritative domain name system (DNS) services.

DNS zones are collections for holding domain names. The DNS resolver always looks for a record from the longest matching zone.

DNS resource records are entries in the DNS zone that provide information about the components that support your domain. The following record types are supported:

Record types | Description
-------------|-------------------------------------------------------------------------------------------------------------
A            | An A (IPv4 address) record consists of a hostname and an IP address.
AAAA         | An AAAA (IPv6 address) record.
CNAME        | CNAME (canonical name) records point to domain names instead of IP addresses.
MX           | An MX (mail exchange) record handles the direction of mail.
NS           | An NS (nameserver) record.
PTR          | A PTR (pointer/reverse) record.
SOA          | The SOA (start of authority) record.
SPF          | An SPF (sender policy framework) record.
TXT          | A TXT (text) record generally is a record that you can query, and which returns information about a domain.

A DNS custom resolver enables the resolution of on-premises hostnames from the IBM Cloud.

By default, no DNS services are provisioned.

### Related Links

- [Docs](https://cloud.ibm.com/docs/dns-svcs)
- [Resource Instance Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_instance)
- [DNS Zone Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/dns_zone)
- [DNS Resource Record Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/dns_resource_record)
- [DNS Permitted Network Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/dns_permitted_network)
- [DNS Custom Resolver Terraform Documentation](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/dns_custom_resolver)

-----

## Observability

Users can optionally use LogDNA and Sysdig for logging and monitoring metrics. These services are not FS Cloud Validated.

LogDNA can be used to add log management capabilities to your IBM Cloud Architecture such as operating system logs, application logs, and platform logs. Features like filtering, search, alerts, and custom views are possible with LogDNA.

Sysdig can be used to gain visibility into the performance and health of your applications, services, and platforms. Filtering, alerting, and custom dashboards are some of the features available in Sysdig.

### Related Links

- [LogDNA](https://cloud.ibm.com/docs/log-analysis?topic=log-analysis-getting-started)
- [LogDNA Terraform Provider](https://registry.terraform.io/providers/logdna/logdna/latest/docs)
- [LogDNA archive resource](https://registry.terraform.io/providers/logdna/logdna/latest/docs/resources/logdna_archive)
- [Sysdig](https://cloud.ibm.com/docs/monitoring?topic=monitoring-getting-started)

-----

## Power

A workspace is a free working environment that acts as a folder for Power Systems Virtual Server resources at a specific geographic location (zone). Compute (e.g., images and VSIs), networking (e.g., subnets and VPN connections), and storage (e.g., volumes and snapshots) resources are deployed within a selected workspace and cannot be moved or shared between workspaces.

Workspaces are a means of grouping and managing related resources deployed in a single location (data location), but otherwise have no functional capabilities. For solutions that span multiple locations, e.g., to implement High Availability or Disaster Recovery, you can create multiple workspaces and connect them over the network (e.g., using a Transit Gateway).

After provisioning a workspace you can create the following:

Additional Fields | Description
------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
SSH Keys          | You can set up one or more Secure Shell (SSH) keys for root login when you create new AIX virtual machines (VM). The keys are loaded into the root's authorized_keys file. SSH keys allow you to securely log in to a VM. You must use the available operating system options to create SSH keys. To generate SSH keys on a Linux or Mac OS system, for example, you can use the standard ssh-keygen tool.
Network Interface | When you create a Power Systems Virtual Server, you can select a private or public network interface. These network interfaces function like subnets for VPC infrastructure.
Cloud Connections | You can use IBM Cloud connections to connect your Power Systems Virtual Server instances to IBM Cloud resources on IBM Cloud classic network and Virtual Private Cloud (VPC) infrastructures. IBM Cloud connection creates a Direct Link (2.0) Connect instance to connect your Power Systems Virtual Server instances to the IBM Cloud resources within your account. For cross-account connectivity, use IBM Transit Gateway to interconnect your Power Systems Virtual Server to the IBM Cloud classic and Virtual Private Cloud (VPC) infrastructures. The speed and reliability of the Direct Link connection extends your Power Systems Virtual Server network to the IBM Cloud network and offers more consistent and higher-throughput connectivity, while keeping network traffic within the IBM Cloud. Cloud Connections are not available in zones where Power Edge Router is deployed, see documentation for more information.

### Related Links

- [Getting started with IBM Power Systems Virtual Servers](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-getting-started)
- [Generating an SSH Key](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-create-vm#ssh-setup)
- [Public & Private Network on Power VS](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-about-virtual-server#public-private-networks)
- [Network Security](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-network-security)
- [Managing Power VS Cloud Connections](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-cloud-connections)
- [Power Edge Router Docs](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-per)

-----

## Power Instances

To provision a Power Systems Virtual Server instance, first ensure that Power VS is enabled in the Options page, along with the zone(s) you would like to provision Power VS resources in. Then create a Power VS workspace and be sure to import any images you will need for your Power VS instance along with your SSH Keys and Network Interfaces for connectivity. At least one SSH Key and one Network interface are required to create a Power VS Instance in a Power VS workspace.

Refer to the following table for more information on Power Systems Virtual Server instance fields:

Instance Fields  | Description
-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
System Type      | Specify the machine type. The machine type that you select determines the number of cores and memory that is available. For more information about machine types, see Hardware Specification documentation.
Processor Type   | When deploying a VM, customers can choose between dedicated, capped shared, or uncapped shared processors for their virtual CPUs (vCPUs). The following list provides a simplified breakdown of their differences: Dedicated: resources are allocated for a specific client (used for specific third-party considerations). Uncapped shared: shared among other clients. Capped shared: shared, but resources do not expand beyond those that are requested (used mostly for licensing). For more information on processor types, see 'What's the difference between capped and uncapped shared processor performance? How does they compare to dedicated processor performance?' documentation.
Storage Type     | For each Power Systems Virtual Server instance, you must select a storage tier - Tier 1 or Tier 3. The storage tiers in Power Systems Virtual Server are based on I/O operations per second (IOPS). It means that the performance of your storage volumes is limited to the maximum number of IOPS based on volume size and storage tier. Although, the exact numbers might change over time, the Tier 3 storage is currently set to 3 IOPS/GB, and the Tier 1 storage is currently set to 10 IOPS/GB. For example, a 100 GB Tier 3 storage volume can receive up to 300 IOPs, and a 100 GB Tier 1 storage volume can receive up to 1000 IOPS. After the IOPS limit is reached for the storage volume, the I/O latency increases. For more information on storage types, see Storage Tiers documentation.
Cores/Processors | There is a core-to-vCPU ratio of 1:1. For shared processors, fractional cores round up to the nearest whole number. For example, 1.25 cores equals 2 vCPUs. If the system type is S922 and operating system is IBM i, IBM i supports maximum of 4 cores per VM.
Memory           | Select the amount of memory for the Power Systems Virtual Server. If you choose to use more than 64 GBs of memory per core, you are charged a higher price. For example, when you choose one core with 128 GBs of memory, you are charged the regular price for the first 64 GBs. After the first 64 GBs (64 - 128 GBs), you are charged a higher price.

### Related Links

- [Creating a Power Systems Virtual Server](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-creating-power-virtual-server)
- [IBM Power Hardware Specifications](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-about-virtual-server#hardware-specifications)
- [What's the difference between capped and uncapped shared processor performance? How does they compare to dedicated processor performance?](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-power-iaas-faqs#processor)
- [IBM Power Storage Tiers](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-about-virtual-server#storage-tiers)
- [Configuring and adding a private network subnet](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-configuring-subnet)

-----

## Power Volumes

Create storage volumes for Power VS and attach them to Power VS Instances. Storage volumes must be a minimum size of 1 GB and can scale up to 2000 GB. These volumes can be set up to allow multiple instances to access the same volume.

The storage tier selected determines the number of I/O operations per second (IOPS) the volume is capable of. Users can either choose Tier 1 or Tier 3 storage. Tier 1 storage is capable of 10 IOPS/GB, and Tier 3 is capable of 3 IOPS/GB.

Enabling volume replication allows users to create copies of their storage volumes through the Global Mirror Change Volume (GMCV). Through this, users can protect and restore their volumes in the event of a disaster.

Enabling volume sharing allows users to attach multiple Power VS instances to their volume.

### Related Links

- [Adding Volumes to a Power VS Instance](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-modifying-server)
- [Power VS Storage Key Concepts](https://www.linkedin.com/pulse/powervs-key-concepts-bogdan-savu/#:~:text=Instances%20%2D%20storage%20configuration-,Storage,-Tiers)
- [Power VS Shared Volumes](https://www.ibm.com/docs/en/powervc/2.1.1?topic=volumes-working-shared)
- [Power VS Volume Replication](https://cloud.ibm.com/docs/power-iaas?topic=power-iaas-getting-started-GRS)

-----

## Templates

Import infrastructure template with all the needed resources to jump-start your environment customization.

Importing a template will override any existing customization changes.

Pattern                             | Description
------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Landing Zone Mixed Pattern          | Create an FS Cloud Compliant environment with a management VPC, workload VPC, Virtual Servers, and a Red Hat OpenShift cluster.
Landing Zone VSI Pattern            | Create an FS Cloud Compliant environment with a management VPC, workload VPC, and an example application server deployment in both the Management and Workload VPC.
Landing Zone VSI Edge Pattern       | Create an environment with a management VPC, workload VPC, and deploys an edge VPC with an F5 Big IP instance with VPN and WAF.
Landing Zone Power SAP Hana Pattern | Creates a basic and expandable SAP system landscape that leverages the services from the VPC landing zone and the network connectivity configuration provided by Power Virtual Server with VPC landing zone.

### Related Links

- [IBM Secure Landing Zone Patterns](https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone/tree/main/.docs/patterns)
- [PowerVS SAP Hana Pattern](https://github.com/terraform-ibm-modules/terraform-ibm-powervs-sap)

-----
