
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

- [Docs](https://cloud.ibm.com/docs/account?topic=account-rgs&interface=ui)

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

- [Docs](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-about-cloud-object-storage)

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

-----

## Network Access Control Lists

An Access Control List (ACL) is a built-in, virtual firewall. An ACL can be leveraged to control all incoming and outgoing traffic on a VPC.

By default, the management and workload ACLs are configured to have rules that are FS Cloud compliant. Removing the below rules may affect FS Cloud compliance for your environment.

Rule Name
- `allow-ibm-inbound`
- `allow-all-network-inbound`
- `allow-all-outbound`

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

-----

## Subnets

Subnet Tiers are used to dynamically generate Subnets and reserve space for expansion into other zones. Subnets are networks created within a VPC; they are a fundamental mechanism within a VPC used to allocate addresses to individual resources (such as Virtual Server Instances), and enable various controls to these resources through the use of network ACLs, routing tables, and resource groups. Subnets are bound to a single zone; however, they can reach all other subnets within a VPC, across a region. They are created from a larger address space within the VPC called an address prefix; and you can provision multiple subnets per address prefix.

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

-----

## Transit Gateway

A Transit Gateway provides connectivity between two or more VPCs which allows distributed resources to communicate with each other.

The default configuration includes:

Service Name        | Description
--------------------|-----------------------------------------------------------------------------------------------------------
slz-transit-gateway | A transit gateway deployed in the SLZ service resource group connecting the management and workload VPCs.

### Related Links

- [Docs](https://cloud.ibm.com/docs/transit-gateway?topic=transit-gateway-about)

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

-----

## Virtual Private Endpoints

A Virtual Private Endpoint (VPE) gateway enables users to connect to supported IBM Cloud Services from their VPC network via an IP address allocated from a subnet within the VPC. The VPE gateway is a virtualized function that scales horizontally, is redundant and highly available, and spans all availability zones of the specified VPC.

The default configuration connects the management and workload VPCs to IBM Cloud Object Storage by creating a VPE subnet in each zone of the VPC, then creating a VPE gateway for each VPE subnet.

### Related Links

- [VPE Supported Services](https://cloud.ibm.com/docs/vpc?topic=vpc-vpe-supported-services)
- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-about-vpe)

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

-----

## VPN Gateways

VPN Gateway service for VPC provides secure, encrypted connectivity from a user's on-premise network to the IBM Cloud VPC network.

The default configuration includes:

management-gateway | A VPN gateway service deployed in the management resource group on the VPN subnet tier of the management VPC.
-------------------|---------------------------------------------------------------------------------------------------------------

### Related Links

- [Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-vpn-overview)

-----

## App ID

IBM Cloud App ID allows user to easily add authentication to web and mobile applications. Keys can be added to connect an application to an IBM Cloud service. Please note, at least one App ID instance with at least one key is required to create a Teleport Bastion Host.

By default, no AppID instances are created.

### Related Links

- [About App ID](https://cloud.ibm.com/docs/appid?topic=appid-about)
- [Getting Started With App ID](https://cloud.ibm.com/docs/appid?topic=appid-getting-started)

-----

## Teleport Bastion Host

A bastion host will provide a secure connection to virtual server instances or Red Hat OpenShift on IBM Cloud clusters within the management and workload VPCs.

By default, a bastion host is not enabled. If enabled, users can specify:

Value                           | Description
--------------------------------|------------------------------------------------------------------------------------------------------------------------------
Teleport Template Configuration | The specs required for configuring all bastion hosts to use Teleport
Teleport VSI Deployment         | A VSI deployment that will allow users to deploy multiple instances on a single subnet in a VPC with the same configuration.

### Related Links

- [Docs](https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-vpc-architecture-connectivity-bastion-tutorial-teleport)
- [Teleport](https://goteleport.com/)

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

Name                      | Action | Direction | Source        | Destination | Protocol
--------------------------|--------|-----------|---------------|-------------|----------
allow-ibm-inbound         | Allow  | Inbound   | 161.26.0.0/16 | 10.0.0.0/8  | ALL
allow-all-network-inbound | Allow  | Inbound   | 10.0.0.0/8    | 10.0.0.0/8  | ALL
allow-all-outbound        | Allow  | Outbound  | 0.0.0.0/0     | 0.0.0.0/0   | ALL

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

-----
