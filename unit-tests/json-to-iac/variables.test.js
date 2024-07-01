const { assert } = require("chai");
const {
  variablesDotTf,
} = require("../../client/src/lib/json-to-iac/variables");

describe("variables", () => {
  it("should return correct variable values for vpn connection preshared key", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork.vpn_gateways[0].connections = [
      {
        vpn: "management-gateway",
        name: "connection-1",
        local_cidrs: ["10.10.10.10/24"],
        peer_cidrs: ["10.10.20.10/24"],
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "management_gateway_connection_1_preshared_key" {
  description = "Preshared key for VPN Gateway management-gateway connection connection-1"
  type        = string
  sensitive   = true
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable values for cluster ingress secrets manager secrets", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork.vpn_gateways[0].connections = undefined;
    slzNetwork.clusters[0].opaque_secrets = [
      {
        name: "example",
        cluster: "example",
        namespace: "ns",
        secrets_manager: "secrets-manager",
        expiration_date: "1234",
        secret_group: "group",
        labels: ["my-label"],
        arbitrary_secret_name: "arbitrary-secret",
        arbitrary_secret_description: "example",
        arbitrary_secret_data: "arbitrary",
        username_password_secret_name: "username-secret",
        username_password_secret_description: "username-password",
        username_password_secret_username: "username",
        username_password_secret_password: "1VeryGoodPasword?",
        auto_rotate: true,
        interval: 1,
        unit: "day",
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable when classic resources are enabled", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork._options.enable_classic = true;
    slzNetwork.classic_ssh_keys = [
      {
        name: "example-classic",
        public_key: "1234",
        datacenter: "dal10",
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "iaas_classic_username" {
  description = "The IBM Cloud username for the creation of classic resources."
  type        = string
  sensitive   = true
}

variable "iaas_classic_api_key" {
  description = "The IBM Cloud API Key for the creation of classic resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

variable "classic_example_classic_public_key" {
  description = "Public SSH Key Value for classic SSH Key example classic"
  type        = string
  default     = "1234"
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable when classic resources are enabled for template tar mode", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork._options.enable_classic = true;
    slzNetwork.classic_ssh_keys = [
      {
        name: "example-classic",
        public_key: "1234",
        datacenter: "dal10",
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false, true);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "iaas_classic_username" {
  description = "The IBM Cloud username for the creation of classic resources."
  type        = string
  sensitive   = true
}

variable "iaas_classic_api_key" {
  description = "The IBM Cloud API Key for the creation of classic resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

variable "classic_example_classic_public_key" {
  description = "Public SSH Key Value for classic SSH Key example classic"
  type        = string
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable when power vs is enabled", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork._options.enable_power_vs = true;
    slzNetwork._options.enable_classic = false;
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable when power vs is enabled with ssh keys", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork._options.enable_power_vs = true;
    slzNetwork._options.enable_classic = false;
    slzNetwork.power = [
      {
        name: "oracle-template",
        resource_group: "management-rg",
        zone: "dal12",
        ssh_keys: [
          {
            name: "power-ssh",
            public_key: "",
            use_data: false,
            resource_group: "management-rg",
            workspace: "oracle-template",
            zone: "dal12",
          },
        ],
        network: [
          {
            name: "oracle-public",
            pi_network_type: "pub-vlan",
            pi_cidr: "172.40.10.0/24",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
          {
            name: "oracle-private-1",
            pi_network_type: "vlan",
            pi_cidr: "10.80.10.0/28",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
          {
            name: "oracle-private-2",
            pi_network_type: "vlan",
            pi_cidr: "10.90.10.0/28",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
        ],
        cloud_connections: [],
        images: [
          {
            name: "7300-00-01",
            workspace: "oracle-template",
            zone: "dal12",
            pi_image_id: "2cf98f53-433d-4c7a-bc46-1f2dfcc04066",
          },
        ],
        attachments: [
          {
            network: "oracle-public",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
          {
            network: "oracle-private-1",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
          {
            network: "oracle-private-2",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
        ],
        imageNames: ["7300-00-01"],
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

variable "power_oracle_template_power_ssh_key" {
  description = "Oracle template power ssh public key value"
  type        = string
  default     = ""
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable when power vs is enabled with ssh keys in template tar mode", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork._options.enable_power_vs = true;
    slzNetwork._options.enable_classic = false;
    slzNetwork.power = [
      {
        name: "oracle-template",
        resource_group: "management-rg",
        zone: "dal12",
        ssh_keys: [
          {
            name: "power-ssh",
            public_key: "",
            use_data: false,
            resource_group: "management-rg",
            workspace: "oracle-template",
            zone: "dal12",
          },
        ],
        network: [
          {
            name: "oracle-public",
            pi_network_type: "pub-vlan",
            pi_cidr: "172.40.10.0/24",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
          {
            name: "oracle-private-1",
            pi_network_type: "vlan",
            pi_cidr: "10.80.10.0/28",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
          {
            name: "oracle-private-2",
            pi_network_type: "vlan",
            pi_cidr: "10.90.10.0/28",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
        ],
        cloud_connections: [],
        images: [
          {
            name: "7300-00-01",
            workspace: "oracle-template",
            zone: "dal12",
            pi_image_id: "2cf98f53-433d-4c7a-bc46-1f2dfcc04066",
          },
        ],
        attachments: [
          {
            network: "oracle-public",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
          {
            network: "oracle-private-1",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
          {
            network: "oracle-private-2",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
        ],
        imageNames: ["7300-00-01"],
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false, true);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

variable "power_oracle_template_power_ssh_key" {
  description = "Oracle template power ssh public key value"
  type        = string
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable when power vs is enabled with ssh keys", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork.vpn_servers = [
      {
        name: "abc",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "hij",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "slz-management-rg",
        security_groups: ["management-vpe-sg"],
        subnets: ["vsi-zone-1"],
        vpc: "management",
        routes: [],
        bring_your_own_cert: true,
        secrets_manager: "secrets-manager",
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

variable "management_vpn_server_abc_cert_pem" {
  description = "Imported certificate PEM for Management Vpn Server Abc. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "management_vpn_server_abc_private_key_pem" {
  description = "Imported certificate private key PEM for Management Vpn Server Abc. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "management_vpn_server_abc_intermediate_pem" {
  description = "Imported certificate intermediate PEM for Management Vpn Server Abc. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "management_vpn_server_abc_client_ca_cert_pem" {
  description = "Imported certificate client ca PEM for Management Vpn Server Abc. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "management_vpn_server_abc_client_ca_private_key_pem" {
  description = "Imported certificate client ca private key PEM for Management Vpn Server Abc. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable when power vs is enabled with ssh keys from data", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork._options.enable_power_vs = true;
    slzNetwork._options.enable_classic = false;
    slzNetwork.power = [
      {
        name: "oracle-template",
        resource_group: "management-rg",
        zone: "dal12",
        ssh_keys: [
          {
            name: "power-ssh",
            public_key: "",
            use_data: true,
            resource_group: "management-rg",
            workspace: "oracle-template",
            zone: "dal12",
          },
        ],
        network: [
          {
            name: "oracle-public",
            pi_network_type: "pub-vlan",
            pi_cidr: "172.40.10.0/24",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
          {
            name: "oracle-private-1",
            pi_network_type: "vlan",
            pi_cidr: "10.80.10.0/28",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
          {
            name: "oracle-private-2",
            pi_network_type: "vlan",
            pi_cidr: "10.90.10.0/28",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "oracle-template",
            zone: "dal12",
          },
        ],
        cloud_connections: [],
        images: [
          {
            name: "7300-00-01",
            workspace: "oracle-template",
            zone: "dal12",
            pi_image_id: "2cf98f53-433d-4c7a-bc46-1f2dfcc04066",
          },
        ],
        attachments: [
          {
            network: "oracle-public",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
          {
            network: "oracle-private-1",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
          {
            network: "oracle-private-2",
            workspace: "oracle-template",
            zone: "dal12",
            connections: [],
          },
        ],
        imageNames: ["7300-00-01"],
      },
    ];
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "secrets_manager_example_secret_arbitrary_secret_data" {
  description = "Data for example secret arbitrary secret data"
  type        = string
  sensitive   = true
  default     = "arbitrary"
}

variable "secrets_manager_example_secret_username" {
  description = "Example secret username"
  type        = string
  sensitive   = true
  default     = "username"
}

variable "secrets_manager_example_secret_password" {
  description = "Example secret password"
  type        = string
  sensitive   = true
  default     = "1VeryGoodPasword?"
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variables for byo cert in vpn server", () => {
    let actualData = variablesDotTf({
      _options: {
        prefix: "c2s",
        region: "us-south",
        tags: ["poc"],
        zones: 1,
        endpoints: "public",
        account_id: null,
        dynamic_subnets: false,
        enable_power_vs: true,
        enable_classic: false,
        power_vs_zones: ["dal10"],
        craig_version: "1.13.0",
        power_vs_high_availability: false,
        template: "Empty Project",
        fs_cloud: false,
      },
      access_groups: [],
      appid: [],
      atracker: {
        enabled: false,
        type: "cos",
        name: "atracker",
        target_name: "a-tracker",
        bucket: null,
        add_route: true,
        cos_key: null,
        locations: ["global", "us-south"],
        instance: false,
        plan: "lite",
        resource_group: "service-rg",
      },
      cbr_rules: [],
      cbr_zones: [],
      cis: [],
      cis_glbs: [],
      classic_gateways: [],
      classic_ssh_keys: [],
      classic_vlans: [],
      clusters: [],
      dns: [],
      event_streams: [],
      f5_vsi: [],
      fortigate_vnf: [],
      iam_account_settings: {
        enable: false,
        mfa: null,
        allowed_ip_addresses: null,
        include_history: false,
        if_match: null,
        max_sessions_per_identity: null,
        restrict_create_service_id: null,
        restrict_create_platform_apikey: null,
        session_expiration_in_seconds: null,
        session_invalidation_in_seconds: null,
      },
      icd: [],
      key_management: [
        {
          name: "kms",
          resource_group: "service-rg",
          use_hs_crypto: false,
          authorize_vpc_reader_role: true,
          use_data: false,
          keys: [
            {
              key_ring: "ring",
              name: "key",
              root_key: true,
              force_delete: true,
              endpoint: "public",
              rotation: 1,
              dual_auth_delete: false,
            },
          ],
        },
      ],
      load_balancers: [],
      logdna: {
        enabled: false,
        plan: "7-day",
        endpoints: "private",
        platform_logs: false,
        resource_group: "service-rg",
        cos: null,
        bucket: null,
        name: "logdna",
        archive: false,
      },
      object_storage: [],
      power: [],
      power_instances: [],
      power_volumes: [],
      resource_groups: [
        {
          use_prefix: true,
          name: "service-rg",
          use_data: false,
        },
        {
          use_prefix: true,
          name: "transit-rg",
          use_data: false,
        },
      ],
      routing_tables: [
        {
          routes: [
            {
              name: "on-prem",
              zone: "1",
              destination: "10.40.0.0/16",
              action: "deliver",
              next_hop: "10.250.0.1",
              routing_table: "poweringress",
              vpc: "transit",
            },
          ],
          name: "poweringress",
          vpc: "transit",
          internet_ingress: false,
          transit_gateway_ingress: true,
          vpc_zone_ingress: true,
          direct_link_ingress: false,
          route_direct_link_ingress: false,
          route_vpc_zone_ingress: false,
          accept_routes_from_resource_type: [],
        },
      ],
      scc: {
        credential_description: null,
        id: null,
        passphrase: null,
        name: "",
        location: "us",
        collector_description: null,
        is_public: false,
        scope_description: null,
        enable: false,
      },
      scc_v2: {
        enable: false,
        resource_group: null,
        region: "",
        account_id: "${var.account_id}",
        profile_attachments: [],
      },
      secrets_manager: [
        {
          resource_group: "service-rg",
          use_data: true,
          name: "Secrets Manager-vidhi",
          plan: "standard",
          encryption_key: null,
          kms: null,
          secrets: [],
        },
      ],
      security_groups: [
        {
          vpc: "transit",
          name: "transit-vpe",
          resource_group: "transit-rg",
          rules: [
            {
              name: "general-inbound",
              direction: "inbound",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
              source: "10.0.0.0/8",
              vpc: "transit",
              sg: "transit-vpe",
              ruleProtocol: "all",
              port_min: null,
              port_max: null,
              type: null,
              code: null,
            },
            {
              name: "powervs-inbound",
              direction: "inbound",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
              source: "192.168.0.0/24",
              vpc: "transit",
              sg: "transit-vpe",
              ruleProtocol: "all",
              port_min: null,
              port_max: null,
              type: null,
              code: null,
            },
            {
              name: "general-outbound",
              direction: "outbound",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
              source: "10.0.0.0/8",
              vpc: "transit",
              sg: "transit-vpe",
              ruleProtocol: "all",
              port_min: null,
              port_max: null,
              type: null,
              code: null,
            },
          ],
        },
        {
          vpc: "transit",
          name: "transit-vsi",
          resource_group: "transit-rg",
          rules: [
            {
              name: "general-inbound",
              direction: "inbound",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
              source: "10.0.0.0/8",
              vpc: "transit",
              sg: "transit-vsi",
              ruleProtocol: "all",
              port_min: null,
              port_max: null,
              type: null,
              code: null,
            },
            {
              name: "ibm-inbound",
              direction: "inbound",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
              source: "161.26.0.0/16",
              vpc: "transit",
              sg: "transit-vsi",
              ruleProtocol: "all",
              port_min: null,
              port_max: null,
              type: null,
              code: null,
            },
            {
              name: "powervs-inbound",
              direction: "inbound",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
              source: "192.168.0.0/24",
              vpc: "transit",
              sg: "transit-vsi",
              ruleProtocol: "all",
              port_min: null,
              port_max: null,
              type: null,
              code: null,
            },
            {
              name: "all-outbound",
              direction: "outbound",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
              source: "0.0.0.0/0",
              vpc: "transit",
              sg: "transit-vsi",
              ruleProtocol: "all",
              port_min: null,
              port_max: null,
              type: null,
              code: null,
            },
          ],
        },
      ],
      ssh_keys: [
        {
          name: "vsi-ssh-key",
          public_key: "NONE",
          use_data: false,
          resource_group: "transit-rg",
        },
      ],
      sysdig: {
        enabled: false,
        plan: "graduated-tier",
        resource_group: "service-rg",
        name: "sysdig",
        platform_logs: false,
      },
      teleport_vsi: [],
      transit_gateways: [
        {
          name: "transit-gateway",
          resource_group: "service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "transit",
            },
          ],
          use_data: false,
          gre_tunnels: [],
          prefix_filters: [],
        },
      ],
      virtual_private_endpoints: [
        {
          name: "transit-cos",
          service: "cos",
          vpc: "transit",
          resource_group: "transit-rg",
          security_groups: ["transit-vpe"],
          subnets: ["vpe-zone-1"],
          instance: null,
        },
      ],
      vpcs: [
        {
          cos: null,
          bucket: "$disabled",
          name: "transit",
          resource_group: "transit-rg",
          classic_access: false,
          manual_address_prefix_management: true,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
          publicGateways: [1],
          address_prefixes: [
            {
              vpc: "transit",
              zone: 1,
              name: "transit-zone-1",
              cidr: "10.10.0.0/22",
            },
          ],
          subnets: [
            {
              vpc: "transit",
              zone: 1,
              cidr: "10.10.0.0/26",
              name: "vsi-zone-1",
              network_acl: "transit",
              resource_group: "transit-rg",
              public_gateway: true,
              has_prefix: false,
            },
            {
              vpc: "transit",
              zone: 1,
              cidr: "10.10.0.128/29",
              name: "vpe-zone-1",
              resource_group: "transit-rg",
              network_acl: "transit",
              public_gateway: false,
              has_prefix: false,
            },
            {
              vpc: "transit",
              zone: 1,
              cidr: "10.10.0.144/28",
              name: "vpn-zone-1",
              networkAcl: "transit",
              resource_group: "transit-rg",
              has_prefix: false,
              network_acl: "transit",
              public_gateway: false,
            },
          ],
          public_gateways: [
            {
              vpc: "transit",
              zone: 1,
              resource_group: "transit-rg",
            },
          ],
          acls: [
            {
              resource_group: "transit-rg",
              name: "transit",
              vpc: "transit",
              rules: [
                {
                  name: "all-inbound",
                  action: "allow",
                  direction: "inbound",
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  source: "0.0.0.0/0",
                  destination: "10.0.0.0/8",
                  acl: "transit",
                  vpc: "transit",
                  ruleProtocol: "all",
                  port_min: null,
                  port_max: null,
                  type: null,
                  code: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                {
                  name: "all-outbound",
                  action: "allow",
                  direction: "outbound",
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  source: "10.0.0.0/8",
                  destination: "0.0.0.0/0",
                  acl: "transit",
                  vpc: "transit",
                  ruleProtocol: "all",
                  port_min: null,
                  port_max: null,
                  type: null,
                  code: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              ],
              use_data: false,
            },
          ],
          subnetTiers: [
            {
              name: "vsi",
              zones: 1,
            },
            {
              name: "vpe",
              zones: 1,
            },
            {
              name: "vpn",
              zones: 1,
            },
          ],
          use_data: false,
        },
      ],
      vpn_gateways: [
        {
          name: "dal10gw",
          resource_group: "transit-rg",
          vpc: "transit",
          subnet: "vpn-zone-1",
          policy_mode: true,
          connections: [
            {
              name: "on-prem-connection",
              peer_cidrs: ["10.40.0.0/16"],
              local_cidrs: [
                "192.168.0.0/24",
                "10.10.0.0/26",
                "10.10.0.128/29",
                "10.10.0.144/28",
              ],
              vpn: "dal10gw",
              peer_address: "10.40.0.0",
            },
          ],
          additional_prefixes: ["10.40.0.0/16"],
        },
      ],
      vpn_servers: [
        {
          vpc: "transit",
          subnets: ["vpn-zone-1"],
          security_groups: ["transit-vsi"],
          ssh_keys: [],
          name: "test-c2s",
          resource_group: "transit-rg",
          method: "byo",
          certificate_crn:
            "crn:v1:bluemix:public:secrets-manager:us-south:a/cdefe6d99f7ea459aacb25775fb88a33:3e99268e-ea59-4893-a095-f0934c33346a:secret:aa8ebb11-bc2b-1012-1289-1516aae031e1",
          secrets_manager: "Secrets Manager-vidhi",
          client_ca_crn:
            "crn:v1:bluemix:public:secrets-manager:us-south:a/cdefe6d99f7ea459aacb25775fb88a33:3e99268e-ea59-4893-a095-f0934c33346a:secret:9f132030-b6a6-78e8-dcf1-4e124befc360",
          client_ip_pool: "192.168.0.0/16",
          port: "443",
          protocol: "udp",
          enable_split_tunneling: false,
          client_idle_timeout: null,
          client_dns_server_ips: null,
          zone: null,
          additional_prefixes: [],
          routes: [],
        },
      ],
      vsi: [
        {
          kms: "kms",
          encryption_key: "key",
          image: "ibm-redhat-9-2-minimal-amd64-3",
          image_name:
            "Red Hat Enterprise Linux 9.x - Minimal Install (amd64) [ibm-redhat-9-2-minimal-amd64-3]",
          profile: "cx2-2x4",
          name: "example-deployment",
          security_groups: ["transit-vsi"],
          ssh_keys: ["vsi-ssh-key"],
          vpc: "transit",
          vsi_per_subnet: "1",
          resource_group: "transit-rg",
          override_vsi_name: null,
          user_data: null,
          network_interfaces: [],
          subnets: ["vsi-zone-1"],
          volumes: [],
          subnet: "",
          enable_floating_ip: false,
          primary_interface_ip_spoofing: false,
        },
      ],
      vtl: [],
    });
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "c2s"
}

variable "vsi_ssh_key_public_key" {
  description = "Public SSH Key Value for Vsi SSH Key"
  type        = string
  sensitive   = true
  default     = "NONE"
}

variable "dal10gw_on_prem_connection_preshared_key" {
  description = "Preshared key for VPN Gateway dal10gw connection on-prem-connection"
  type        = string
  sensitive   = true
}

variable "transit_vpn_server_test_c2s_cert_pem" {
  description = "Imported certificate PEM for Transit Vpn Server Test C 2s. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "transit_vpn_server_test_c2s_private_key_pem" {
  description = "Imported certificate private key PEM for Transit Vpn Server Test C 2s. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "transit_vpn_server_test_c2s_intermediate_pem" {
  description = "Imported certificate intermediate PEM for Transit Vpn Server Test C 2s. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "transit_vpn_server_test_c2s_client_ca_cert_pem" {
  description = "Imported certificate client ca PEM for Transit Vpn Server Test C 2s. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "transit_vpn_server_test_c2s_client_ca_private_key_pem" {
  description = "Imported certificate client ca private key PEM for Transit Vpn Server Test C 2s. Certificate will be stored in Secrets Manager"
  type        = string
  sensitive   = true
}

##############################################################################
`;

    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable values for vsi using variable names", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    slzNetwork.clusters[0].opaque_secrets = [];
    slzNetwork.vsi[0].use_variable_names = true;
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_1_subnet_server_1_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-1"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-1-1"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_1_subnet_server_2_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-1"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-1-2"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_2_subnet_server_1_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-2"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-2-1"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_2_subnet_server_2_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-2"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-2-2"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_3_subnet_server_1_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-3"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-3-1"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_3_subnet_server_2_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-3"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-3-2"
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
  it("should return correct variable values for vsi using variable names with no cbr, power, or vpn server", () => {
    let slzNetwork = { ...require("../data-files/slz-network.json") };
    delete slzNetwork.cbr_zones;
    delete slzNetwork.power;
    delete slzNetwork.vpn_servers;
    slzNetwork.clusters[0].opaque_secrets = [];
    slzNetwork.vsi[0].use_variable_names = true;
    let actualData = variablesDotTf(slzNetwork, false);
    let expectedData = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_1_subnet_server_1_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-1"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-1-1"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_1_subnet_server_2_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-1"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-1-2"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_2_subnet_server_1_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-2"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-2-1"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_2_subnet_server_2_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-2"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-2-2"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_3_subnet_server_1_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-3"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-3-1"
}

variable "management_vpc_vsi_deployment_management_server_vsi_zone_3_subnet_server_2_name" {
  description = "Override name for management-server server. VPC: management Subnet: vsi-zone-3"
  type        = string
  default     = "slz-management-management-server-server-vsi-zone-3-2"
}

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
});
