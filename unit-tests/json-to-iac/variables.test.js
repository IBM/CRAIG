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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
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

##############################################################################
`;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct variables"
    );
  });
});
