const { assert } = require("chai");
const {
  formatVpc,
  formatAddressPrefix,
  formatSubnet,
  formatAcl,
  formatAclRule,
  formatPgw,
  vpcTf,
  vpcModuleJson,
  vpcModuleTf,
} = require("../../client/src/lib/json-to-iac/vpc");
const f5Nw = require("../data-files/f5-nw.json");

describe("vpc", () => {
  describe("formatVpc", () => {
    it("should create vpc terraform", () => {
      let actualData = formatVpc(
        {
          name: "management",
          resource_group: "slz-management-rg",
          classic_access: false,
          manual_address_prefix_management: false,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_vpc" "management_vpc" {
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.slz_management_rg_id
  no_sg_acl_rules             = true
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create vpc terraform from data", () => {
      let actualData = formatVpc(
        {
          name: "management",
          use_data: true,
          resource_group: "slz-management-rg",
          classic_access: false,
          manual_address_prefix_management: false,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
data "ibm_is_vpc" "management_vpc" {
  name = "management"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create vpc terraform with optional fields not null", () => {
      let actualData = formatVpc(
        {
          name: "management",
          resource_group: "slz-management-rg",
          classic_access: false,
          manual_address_prefix_management: false,
          default_network_acl_name: "null",
          default_security_group_name: "null",
          default_routing_table_name: "null",
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_vpc" "management_vpc" {
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.slz_management_rg_id
  default_network_acl_name    = "null"
  default_security_group_name = "null"
  default_routing_table_name  = "null"
  no_sg_acl_rules             = true
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create vpc terraform with classic access and manual prefixes", () => {
      let actualData = formatVpc(
        {
          name: "management",
          resource_group: "slz-management-rg",
          classic_access: true,
          manual_address_prefix_management: true,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_vpc" "management_vpc" {
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.slz_management_rg_id
  no_sg_acl_rules             = true
  classic_access              = true
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAddressPrefix", () => {
    it("should create terraform for vpc address prefix", () => {
      let actualData = formatAddressPrefix(
        {
          name: "vsi-subnet-1",
          zone: 1,
          cidr: "1.2.3.4/5",
          vpc: "management",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          vpcs: [
            {
              name: "management",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "\${var.prefix}-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "1.2.3.4/5"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create terraform for vpc address prefix with data vpc", () => {
      let actualData = formatAddressPrefix(
        {
          name: "vsi-subnet-1",
          zone: 1,
          cidr: "1.2.3.4/5",
          vpc: "management",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          vpcs: [
            {
              use_data: true,
              name: "management",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "\${var.prefix}-management-vsi-subnet-1"
  vpc  = data.ibm_is_vpc.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "1.2.3.4/5"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatSubnet", () => {
    it("should create subnet", () => {
      let actualData = formatSubnet(
        {
          vpc: "management",
          name: "vsi-subnet-1",
          resource_group: "slz-management-rg",
          cidr: "1.2.3.4/5",
          network_acl: "management",
          public_gateway: true,
          has_prefix: true,
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
          vpcs: [
            {
              name: "management",
              acls: [
                {
                  name: "management",
                },
              ],
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-subnet-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create subnet with vpc from data", () => {
      let actualData = formatSubnet(
        {
          vpc: "management",
          name: "vsi-subnet-1",
          resource_group: "slz-management-rg",
          cidr: "1.2.3.4/5",
          network_acl: "management",
          public_gateway: true,
          has_prefix: true,
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
          vpcs: [
            {
              name: "management",
              use_data: true,
              acls: [
                {
                  name: "management",
                },
              ],
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = data.ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-subnet-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create subnet with dynamic subnets", () => {
      let actualData = formatSubnet(
        {
          vpc: "management",
          name: "vsi-subnet-1",
          resource_group: "slz-management-rg",
          cidr: "1.2.3.4/5",
          network_acl: "management",
          public_gateway: true,
          has_prefix: false,
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
            dynamic_subnets: true,
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
          vpcs: [
            {
              name: "management",
              address_prefixes: [
                {
                  name: "management-zone-1",
                  cidr: "1.2.3.4/5",
                  zone: 1,
                },
                {
                  name: "bad",
                },
              ],
              acls: [
                {
                  name: "management",
                },
              ],
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-subnet-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = "1.2.3.4/5"
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.management_management_zone_1_prefix
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create subnet with a depends_on when no address_prefix is created", () => {
      let actualData = formatSubnet(
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "slz-edge-rg",
          network_acl: "edge-acl",
          cidr: "10.5.60.0/24",
          name: "f5-bastion-zone-1",
          public_gateway: false,
        },
        f5Nw
      );
      let expectedData = `
resource "ibm_is_subnet" "edge_f5_bastion_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-bastion-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.60.0/24"
  tags = [
    "slz",
    "landing-zone"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAcl", () => {
    it("should format network acl", () => {
      let actualData = formatAcl(
        {
          name: "management",
          resource_group: "slz-management-rg",
          vpc: "management",
          rules: [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 8080,
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              udp: {
                port_min: 8080,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: 1,
                code: 2,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
          ],
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
          vpcs: [
            {
              name: "managment",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl" "management_management_acl" {
  name           = "\${var.prefix}-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl with vpc from data", () => {
      let actualData = formatAcl(
        {
          name: "management",
          resource_group: "slz-management-rg",
          vpc: "management",
          rules: [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 8080,
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              udp: {
                port_min: 8080,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: 1,
                code: 2,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
          ],
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
          vpcs: [
            {
              name: "management",
              use_data: true,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl" "management_management_acl" {
  name           = "\${var.prefix}-management-management-acl"
  vpc            = data.ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl from data with vpc from data", () => {
      let actualData = formatAcl(
        {
          name: "management",
          resource_group: "slz-management-rg",
          vpc: "management",
          use_data: true,
          rules: [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 8080,
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              udp: {
                port_min: 8080,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: 1,
                code: 2,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
          ],
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
          vpcs: [
            {
              name: "management",
              use_data: true,
            },
          ],
        }
      );
      let expectedData = `
data "ibm_is_network_acl" "management_management_acl" {
  name = "management"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl with nested rules", () => {
      let actualData = formatAcl(
        {
          name: "management",
          resource_group: "slz-management-rg",
          vpc: "management",
          rules: [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 8080,
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              udp: {
                port_min: 8080,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound-8080",
              source: "161.26.0.0/16",
              icmp: {
                type: 1,
                code: 2,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
          ],
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
          vpcs: [
            {
              name: "managment",
            },
          ],
        },
        true
      );
      let expectedData = `
resource "ibm_is_network_acl" "management_management_acl" {
  name           = "\${var.prefix}-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "hello",
    "world"
  ]
  rules {
    source      = "161.26.0.0/16"
    action      = "allow"
    destination = "10.0.0.0/8"
    direction   = "inbound"
    name        = "allow-ibm-inbound"
  }
  rules {
    source      = "161.26.0.0/16"
    action      = "allow"
    destination = "10.0.0.0/8"
    direction   = "inbound"
    name        = "allow-ibm-inbound-8080"
    tcp {
      port_min        = 8080
      port_max        = null
      source_port_min = null
      source_port_max = null
    }
  }
  rules {
    source      = "161.26.0.0/16"
    action      = "allow"
    destination = "10.0.0.0/8"
    direction   = "inbound"
    name        = "allow-ibm-inbound-8080"
    udp {
      port_min        = 8080
      port_max        = null
      source_port_min = null
      source_port_max = null
    }
  }
  rules {
    source      = "161.26.0.0/16"
    action      = "allow"
    destination = "10.0.0.0/8"
    direction   = "inbound"
    name        = "allow-ibm-inbound-8080"
    icmp {
      type = 1
      code = 2
    }
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAclRule", () => {
    it("should format network acl rule with no protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
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
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with tcp protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound-8080",
          source: "161.26.0.0/16",
          icmp: {
            type: null,
            code: null,
          },
          tcp: {
            port_min: 8080,
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
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound_8080" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound-8080"
  tcp {
    port_min        = 8080
    port_max        = null
    source_port_min = null
    source_port_max = null
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with udp protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound-8080",
          source: "161.26.0.0/16",
          icmp: {
            type: null,
            code: null,
          },
          udp: {
            port_min: 8080,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
          tcp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound_8080" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound-8080"
  udp {
    port_min        = 8080
    port_max        = null
    source_port_min = null
    source_port_max = null
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with icmp protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound-8080",
          source: "161.26.0.0/16",
          icmp: {
            type: 1,
            code: 2,
          },
          udp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
          tcp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound_8080" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound-8080"
  icmp {
    type = 1
    code = 2
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with icmp protocol null", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound-8080",
          source: "161.26.0.0/16",
          icmp: {
            type: "null",
            code: "null",
          },
          udp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
          tcp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound_8080" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound-8080"
  icmp {
    type = null
    code = null
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatPgw", () => {
    it("should format a public gateway", () => {
      let actualData = formatPgw(
        {
          resource_group: "slz-management-rg",
          vpc: "management",
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "\${var.prefix}-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format a public gateway with an overriden name", () => {
      let actualData = formatPgw(
        {
          override_name: "override-gw",
          resource_group: "slz-management-rg",
          vpc: "management",
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_public_gateway" "management_override_gw" {
  name           = "\${var.prefix}-management-override-gw"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vpcTf", () => {
    it("should create vpc terraform", () => {
      let actualData = vpcTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_data: false,
            name: "slz-management-rg",
          },
        ],
        vpcs: [
          {
            name: "management",
            resource_group: "slz-management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "vsi-subnet-1",
                zone: 1,
                cidr: "1.2.3.4/5",
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                name: "vsi-subnet-1",
                resource_group: "slz-management-rg",
                cidr: "1.2.3.4/5",
                network_acl: "management",
                public_gateway: true,
                has_prefix: true,
                zone: 1,
              },
            ],
            acls: [
              {
                name: "management",
                resource_group: "slz-management-rg",
                vpc: "management",
                rules: [
                  {
                    acl: "management",
                    vpc: "management",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
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
                  },
                ],
              },
            ],
            public_gateways: [
              {
                resource_group: "slz-management-rg",
                vpc: "management",
                zone: 1,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.slz_management_rg_id
  no_sg_acl_rules             = true
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "\${var.prefix}-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "1.2.3.4/5"
}

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "\${var.prefix}-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "\${var.prefix}-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-subnet-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create vpc terraform with vpc and acl from data", () => {
      let actualData = vpcTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_data: false,
            name: "slz-management-rg",
          },
        ],
        vpcs: [
          {
            name: "management",
            resource_group: "slz-management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            use_data: true,
            address_prefixes: [
              {
                name: "vsi-subnet-1",
                zone: 1,
                cidr: "1.2.3.4/5",
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                name: "vsi-subnet-1",
                resource_group: "slz-management-rg",
                cidr: "1.2.3.4/5",
                network_acl: "management",
                public_gateway: true,
                has_prefix: true,
                zone: 1,
              },
            ],
            acls: [
              {
                use_data: true,
                name: "management",
                resource_group: "slz-management-rg",
                vpc: "management",
                rules: [
                  {
                    acl: "management",
                    vpc: "management",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
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
                  },
                ],
              },
            ],
            public_gateways: [
              {
                resource_group: "slz-management-rg",
                vpc: "management",
                zone: 1,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Management VPC
##############################################################################

data "ibm_is_vpc" "management_vpc" {
  name = "management"
}

resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "\${var.prefix}-management-vsi-subnet-1"
  vpc  = data.ibm_is_vpc.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "1.2.3.4/5"
}

data "ibm_is_network_acl" "management_management_acl" {
  name = "management"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "\${var.prefix}-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = data.ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-subnet-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_management_rg_id
  network_acl     = data.ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create vpc terraform with multiple vpcs", () => {
      let actualData = vpcTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_data: false,
            name: "slz-management-rg",
          },
        ],
        vpcs: [
          {
            name: "management",
            resource_group: "slz-management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "vsi-subnet-1",
                zone: 1,
                cidr: "1.2.3.4/5",
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                name: "vsi-subnet-1",
                resource_group: "slz-management-rg",
                cidr: "1.2.3.4/5",
                network_acl: "management",
                public_gateway: true,
                has_prefix: true,
                zone: 1,
              },
            ],
            acls: [
              {
                name: "management",
                resource_group: "slz-management-rg",
                vpc: "management",
                rules: [
                  {
                    acl: "management",
                    vpc: "management",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
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
                  },
                ],
              },
            ],
            public_gateways: [
              {
                resource_group: "slz-management-rg",
                vpc: "management",
                zone: 1,
              },
            ],
          },
          {
            name: "workload",
            resource_group: "slz-management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "vsi-subnet-1",
                zone: 1,
                cidr: "1.2.3.4/5",
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                name: "vsi-subnet-1",
                resource_group: "slz-management-rg",
                ipv4_cidr_block: "1.2.3.4/5",
                network_acl: "management",
                public_gateway: true,
                has_prefix: true,
                zone: 1,
              },
            ],
            acls: [
              {
                name: "management",
                resource_group: "slz-management-rg",
                vpc: "management",
                rules: [
                  {
                    acl: "management",
                    vpc: "management",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
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
                  },
                ],
              },
            ],
            public_gateways: [
              {
                resource_group: "slz-management-rg",
                vpc: "management",
                zone: 1,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.slz_management_rg_id
  no_sg_acl_rules             = true
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "\${var.prefix}-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "1.2.3.4/5"
}

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "\${var.prefix}-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "\${var.prefix}-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-subnet-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# Workload VPC
##############################################################################

resource "ibm_is_vpc" "workload_vpc" {
  name                        = "\${var.prefix}-workload-vpc"
  resource_group              = var.slz_management_rg_id
  no_sg_acl_rules             = true
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "\${var.prefix}-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "1.2.3.4/5"
}

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "\${var.prefix}-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "\${var.prefix}-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-subnet-1"
  zone            = "\${var.region}-1"
  resource_group  = var.slz_management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct data for f5 nw", () => {
      let actualData = vpcTf({
        _options: {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 3,
          endpoints: "private",
          account_id: "",
          fs_cloud: true,
          enable_classic: false,
          dynamic_subnets: false,
          enable_power_vs: true,
          power_vs_zones: ["us-south"],
          craig_version: "1.6.0",
        },
        access_groups: [],
        appid: [],
        atracker: {
          enabled: true,
          type: "cos",
          name: "atracker",
          target_name: "atracker-cos",
          bucket: "atracker-bucket",
          add_route: true,
          cos_key: "cos-bind-key",
          locations: ["global", "us-south"],
        },
        cbr_rules: [],
        cbr_zones: [],
        clusters: [],
        dns: [],
        event_streams: [],
        f5_vsi: [
          {
            kms: "kms",
            subnet: "f5-management-zone-1",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-1",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-1",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-1",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 1,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
          {
            kms: "kms",
            subnet: "f5-management-zone-2",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-2",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-2",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-2",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 2,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
          {
            kms: "kms",
            subnet: "f5-management-zone-3",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-3",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-3",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-3",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 3,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
        ],
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
            keys: [],
          },
        ],
        load_balancers: [],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: "service-rg",
          cos: "atracker-cos",
          bucket: "atracker-bucket",
        },
        object_storage: [
          {
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "atracker-key",
                name: "atracker-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
            ],
            keys: [
              {
                name: "cos-bind-key",
                role: "Writer",
                enable_hmac: false,
                use_random_suffix: true,
              },
            ],
            name: "atracker-cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
            use_random_suffix: true,
            kms: "kms",
          },
          {
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "management-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "workload-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
              {
                force_delete: false,
                name: "edge-bucket",
                storage_class: "standard",
                kms_key: "key",
                endpoint: "public",
                use_random_suffix: true,
              },
            ],
            use_random_suffix: true,
            keys: [],
            name: "cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
            kms: "kms",
          },
        ],
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
            name: "management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "workload-rg",
            use_data: false,
          },
          {
            use_data: false,
            use_prefix: true,
            name: "edge-rg",
          },
          {
            use_data: false,
            name: "powervs-rg",
            use_prefix: true,
          },
        ],
        routing_tables: [],
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
        secrets_manager: [],
        security_groups: [],
        ssh_keys: [],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: "service-rg",
        },
        teleport_vsi: [],
        transit_gateways: [],
        virtual_private_endpoints: [],
        vpcs: [
          {
            cos: "cos",
            bucket: "edge-bucket",
            name: "edge",
            resource_group: "edge-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_routing_table_name: null,
            default_security_group_name: null,
            address_prefixes: [
              {
                vpc: "edge",
                zone: 1,
                cidr: "10.5.0.0/16",
                name: "edge-zone-1",
              },
              {
                vpc: "edge",
                zone: 2,
                cidr: "10.6.0.0/16",
                name: "edge-zone-2",
              },
              {
                vpc: "edge",
                zone: 3,
                cidr: "10.7.0.0/16",
                name: "edge-zone-3",
              },
            ],
            acls: [
              {
                name: "edge-acl",
                vpc: "edge",
                resource_group: "edge-rg",
                rules: [
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
              {
                name: "f5-external-acl",
                vpc: "edge",
                resource_group: "edge-rg",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-f5-external-443-inbound",
                    source: "0.0.0.0/0",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: 443,
                      port_min: 443,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
            subnets: [
              {
                vpc: "edge",
                name: "f5-bastion-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-bastion-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-bastion-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
            ],
            public_gateways: [],
            publicGateways: [],
          },
        ],
        vpn_gateways: [],
        vpn_servers: [],
        vsi: [],
        classic_ssh_keys: [],
        classic_vlans: [],
      });
      let expectedData = `##############################################################################
# Edge VPC
##############################################################################

resource "ibm_is_vpc" "edge_vpc" {
  name                        = "\${var.prefix}-edge-vpc"
  resource_group              = var.edge_rg_id
  no_sg_acl_rules             = true
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_vpc_address_prefix" "edge_zone_1_prefix" {
  name = "\${var.prefix}-edge-edge-zone-1"
  vpc  = ibm_is_vpc.edge_vpc.id
  zone = "\${var.region}-1"
  cidr = "10.5.0.0/16"
}

resource "ibm_is_vpc_address_prefix" "edge_zone_2_prefix" {
  name = "\${var.prefix}-edge-edge-zone-2"
  vpc  = ibm_is_vpc.edge_vpc.id
  zone = "\${var.region}-2"
  cidr = "10.6.0.0/16"
}

resource "ibm_is_vpc_address_prefix" "edge_zone_3_prefix" {
  name = "\${var.prefix}-edge-edge-zone-3"
  vpc  = ibm_is_vpc.edge_vpc.id
  zone = "\${var.region}-3"
  cidr = "10.7.0.0/16"
}

resource "ibm_is_network_acl" "edge_edge_acl_acl" {
  name           = "\${var.prefix}-edge-edge-acl-acl"
  vpc            = ibm_is_vpc.edge_vpc.id
  resource_group = var.edge_rg_id
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_network_acl_rule" "edge_edge_acl_acl_rule_allow_ibm_inbound" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.edge_edge_acl_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
}

resource "ibm_is_network_acl_rule" "edge_edge_acl_acl_rule_allow_all_network_inbound" {
  source      = "10.0.0.0/8"
  network_acl = ibm_is_network_acl.edge_edge_acl_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-all-network-inbound"
}

resource "ibm_is_network_acl_rule" "edge_edge_acl_acl_rule_allow_all_network_outbound" {
  source      = "10.0.0.0/8"
  network_acl = ibm_is_network_acl.edge_edge_acl_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "outbound"
  name        = "allow-all-network-outbound"
}

resource "ibm_is_network_acl" "edge_f5_external_acl_acl" {
  name           = "\${var.prefix}-edge-f5-external-acl-acl"
  vpc            = ibm_is_vpc.edge_vpc.id
  resource_group = var.edge_rg_id
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_network_acl_rule" "edge_f5_external_acl_acl_rule_allow_ibm_inbound" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.edge_f5_external_acl_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
}

resource "ibm_is_network_acl_rule" "edge_f5_external_acl_acl_rule_allow_all_network_inbound" {
  source      = "10.0.0.0/8"
  network_acl = ibm_is_network_acl.edge_f5_external_acl_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-all-network-inbound"
}

resource "ibm_is_network_acl_rule" "edge_f5_external_acl_acl_rule_allow_all_network_outbound" {
  source      = "10.0.0.0/8"
  network_acl = ibm_is_network_acl.edge_f5_external_acl_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "outbound"
  name        = "allow-all-network-outbound"
}

resource "ibm_is_network_acl_rule" "edge_f5_external_acl_acl_rule_allow_f5_external_443_inbound" {
  source      = "0.0.0.0/0"
  network_acl = ibm_is_network_acl.edge_f5_external_acl_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-f5-external-443-inbound"
  tcp {
    port_min        = 443
    port_max        = 443
    source_port_min = null
    source_port_max = null
  }
}

resource "ibm_is_subnet" "edge_f5_bastion_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-bastion-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.50.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_bastion_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-bastion-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.50.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_bastion_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-bastion-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.50.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_external_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-external-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_f5_external_acl_acl.id
  ipv4_cidr_block = "10.5.40.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_external_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-external-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_f5_external_acl_acl.id
  ipv4_cidr_block = "10.6.40.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_external_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-external-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_f5_external_acl_acl.id
  ipv4_cidr_block = "10.7.40.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_management_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-management-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.30.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_management_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-management-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.30.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_management_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-f5-management-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.30.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpe_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpe-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.60.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpe_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpe-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.60.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpe_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpe-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.60.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_1_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-1-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.10.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_1_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-1-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.10.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_1_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-1-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.10.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_2_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-2-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.20.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_2_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-2-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.20.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_2_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-2-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.edge_rg_id
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.20.0/24"
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    describe("other use cases", () => {
      it("should return craig terraform for one vpc with only one advanced subnet tier", () => {
        let actualData = vpcTf({
          _options: {
            prefix: "t1",
            region: "us-south",
            tags: ["hello", "world"],
            zones: 1,
            endpoints: "private",
            account_id: "",
            fs_cloud: false,
            enable_classic: false,
            dynamic_subnets: false,
            enable_power_vs: false,
            craig_version: "1.6.0",
            power_vs_zones: [],
            advanced_subnets: true,
          },
          access_groups: [],
          appid: [],
          atracker: {
            enabled: false,
            type: "cos",
            name: "atracker",
            target_name: "atracker-cos",
            bucket: null,
            add_route: true,
            cos_key: null,
            locations: ["global", "us-south"],
          },
          cbr_rules: [],
          cbr_zones: [],
          clusters: [],
          dns: [],
          event_streams: [],
          f5_vsi: [],
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
              use_hs_crypto: false,
              use_data: false,
              name: "customer-a-kms",
              resource_group: "craig-rg",
              authorize_vpc_reader_role: false,
              keys: [
                {
                  name: "vsi-key",
                  root_key: false,
                  key_ring: "",
                  force_delete: false,
                  endpoint: null,
                  rotation: 1,
                  dual_auth_delete: false,
                },
              ],
            },
          ],
          load_balancers: [
            {
              name: "customer-a-public-lb",
              resource_group: "craig-rg",
              vpc: "customer-a",
              type: "public",
              security_groups: ["vsi-sg"],
              algorithm: "round_robin",
              protocol: "tcp",
              proxy_protocol: null,
              health_type: "tcp",
              session_persistence_app_cookie_name: "",
              target_vsi: ["connect-vsi"],
              listener_protocol: "tcp",
              connection_limit: null,
              port: 80,
              health_timeout: 5,
              health_delay: 6,
              health_retries: 5,
              listener_port: 80,
              subnets: ["subnet-tier-zone-2"],
            },
            {
              name: "customer-a-private-lb",
              resource_group: "craig-rg",
              vpc: "customer-a",
              type: "private",
              security_groups: ["vsi-sg"],
              algorithm: "round_robin",
              protocol: "tcp",
              proxy_protocol: null,
              health_type: "tcp",
              session_persistence_app_cookie_name: "",
              target_vsi: ["compass-vsi"],
              listener_protocol: "tcp",
              connection_limit: null,
              port: 80,
              health_timeout: 5,
              health_delay: 6,
              health_retries: 5,
              listener_port: 80,
              subnets: ["subnet-tier-zone-1"],
            },
          ],
          logdna: {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: null,
            cos: null,
            bucket: null,
          },
          object_storage: [],
          power: [],
          power_instances: [],
          power_volumes: [],
          resource_groups: [
            {
              use_prefix: true,
              name: "craig-rg",
              use_data: false,
            },
          ],
          routing_tables: [],
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
          secrets_manager: [],
          security_groups: [
            {
              resource_group: "craig-rg",
              rules: [
                {
                  name: "ssh",
                  direction: "inbound",
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: 22,
                    port_max: 22,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                  },
                  source: "0.0.0.0",
                  vpc: "customer-a",
                  sg: "vsi-sg",
                },
                {
                  name: "ping",
                  direction: "inbound",
                  icmp: {
                    type: 8,
                    code: 8,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                  },
                  source: "0.0.0.0",
                  vpc: "customer-a",
                  sg: "vsi-sg",
                },
              ],
              name: "vsi-sg",
              vpc: "customer-a",
              show: false,
            },
          ],
          ssh_keys: [
            {
              name: "customer-a-ssh-key",
              public_key: "",
              use_data: false,
              resource_group: "craig-rg",
            },
          ],
          sysdig: {
            enabled: false,
            plan: "graduated-tier",
            resource_group: null,
          },
          teleport_vsi: [],
          transit_gateways: [],
          virtual_private_endpoints: [],
          vpcs: [
            {
              name: "customer-a",
              resource_group: "craig-rg",
              classic_access: false,
              manual_address_prefix_management: false,
              default_network_acl_name: null,
              default_security_group_name: null,
              default_routing_table_name: null,
              address_prefixes: [
                {
                  name: "subnet-tier-zone-1",
                  cidr: null,
                  zone: 1,
                  vpc: "customer-a",
                },
                {
                  name: "subnet-tier-zone-2",
                  cidr: null,
                  zone: 2,
                  vpc: "customer-a",
                },
                {
                  vpc: "customer-a",
                  zone: 1,
                  cidr: "10.10.10.0/24",
                  name: "subnet-tier-zone-1",
                },
                {
                  vpc: "customer-a",
                  zone: 2,
                  cidr: "10.20.10.0/24",
                  name: "subnet-tier-zone-2",
                },
              ],
              subnets: [
                {
                  vpc: "customer-a",
                  zone: 1,
                  cidr: "10.10.10.0/24",
                  name: "subnet-tier-zone-1",
                  network_acl: "subnet-acl",
                  resource_group: "craig-rg",
                  public_gateway: false,
                  has_prefix: true,
                  tier: "subnet-tier",
                },
                {
                  vpc: "customer-a",
                  zone: 2,
                  cidr: "10.10.11.0/24",
                  name: "subnet-tier-zone-2",
                  network_acl: "subnet-acl",
                  resource_group: "craig-rg",
                  public_gateway: true,
                  has_prefix: true,
                  acl_name: "subnet-acl",
                  tier: "subnet-tier",
                },
              ],
              public_gateways: [
                {
                  vpc: "customer-a",
                  zone: 2,
                  resource_group: "craig-rg",
                },
              ],
              acls: [
                {
                  name: "subnet-acl",
                  resource_group: "craig-rg",
                  vpc: "customer-a",
                  rules: [
                    {
                      name: "allow-all-inbound",
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
                      source: "0.0.0.0",
                      destination: "0.0.0.0",
                      acl: "subnet-acl",
                      vpc: "customer-a",
                    },
                    {
                      name: "allow-all-outbound",
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
                      source: "0.0.0.0",
                      destination: "0.0.0.0",
                      acl: "subnet-acl",
                      vpc: "customer-a",
                    },
                  ],
                },
              ],
              bucket: "$disabled",
              publicGateways: [2],
              cos: null,
            },
          ],
          vpn_gateways: [
            {
              name: "customer-a-vpn-gw",
              resource_group: "craig-rg",
              vpc: "customer-a",
              subnet: "subnet-tier-zone-1",
              policy_mode: true,
            },
          ],
          vpn_servers: [],
          vsi: [
            {
              kms: "customer-a-kms",
              encryption_key: "vsi-key",
              image: "eagle-cent-os-7",
              image_name:
                "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
              profile: "bx2-2x8",
              name: "compass-vsi",
              security_groups: ["vsi-sg"],
              ssh_keys: ["customer-a-ssh-key"],
              vpc: "customer-a",
              vsi_per_subnet: 1,
              resource_group: "craig-rg",
              override_vsi_name: null,
              user_data: null,
              network_interfaces: [],
              subnets: ["subnet-tier-zone-1"],
              volumes: [],
              subnet: "",
              enable_floating_ip: false,
            },
            {
              kms: "customer-a-kms",
              encryption_key: "vsi-key",
              image: "eagle-cent-os-7",
              image_name:
                "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
              profile: "bx2-2x8",
              name: "connect-vsi",
              security_groups: ["vsi-sg"],
              ssh_keys: ["customer-a-ssh-key"],
              vpc: "customer-a",
              vsi_per_subnet: 1,
              resource_group: "craig-rg",
              override_vsi_name: null,
              user_data: null,
              network_interfaces: [],
              subnets: ["subnet-tier-zone-2"],
              volumes: [],
              subnet: "",
              enable_floating_ip: false,
            },
          ],
          classic_vlans: [],
          classic_ssh_keys: [],
        });
        let expectedData = `##############################################################################
# Customer AVPC
##############################################################################

resource "ibm_is_vpc" "customer_a_vpc" {
  name                        = "\${var.prefix}-customer-a-vpc"
  resource_group              = var.craig_rg_id
  no_sg_acl_rules             = true
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_1_prefix" {
  name = "\${var.prefix}-customer-a-subnet-tier-zone-1"
  vpc  = ibm_is_vpc.customer_a_vpc.id
  zone = "\${var.region}-1"
  cidr = "10.10.10.0/24"
}

resource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_2_prefix" {
  name = "\${var.prefix}-customer-a-subnet-tier-zone-2"
  vpc  = ibm_is_vpc.customer_a_vpc.id
  zone = "\${var.region}-2"
  cidr = "10.20.10.0/24"
}

resource "ibm_is_network_acl" "customer_a_subnet_acl_acl" {
  name           = "\${var.prefix}-customer-a-subnet-acl-acl"
  vpc            = ibm_is_vpc.customer_a_vpc.id
  resource_group = var.craig_rg_id
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_network_acl_rule" "customer_a_subnet_acl_acl_rule_allow_all_inbound" {
  source      = "0.0.0.0"
  network_acl = ibm_is_network_acl.customer_a_subnet_acl_acl.id
  action      = "allow"
  destination = "0.0.0.0"
  direction   = "inbound"
  name        = "allow-all-inbound"
}

resource "ibm_is_network_acl_rule" "customer_a_subnet_acl_acl_rule_allow_all_outbound" {
  source      = "0.0.0.0"
  network_acl = ibm_is_network_acl.customer_a_subnet_acl_acl.id
  action      = "allow"
  destination = "0.0.0.0"
  direction   = "outbound"
  name        = "allow-all-outbound"
}

resource "ibm_is_public_gateway" "customer_a_gateway_zone_2" {
  name           = "\${var.prefix}-customer-a-gateway-zone-2"
  vpc            = ibm_is_vpc.customer_a_vpc.id
  resource_group = var.craig_rg_id
  zone           = "\${var.region}-2"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "customer_a_subnet_tier_zone_1" {
  vpc             = ibm_is_vpc.customer_a_vpc.id
  name            = "\${var.prefix}-customer-a-subnet-tier-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.craig_rg_id
  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_1_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "customer_a_subnet_tier_zone_2" {
  vpc             = ibm_is_vpc.customer_a_vpc.id
  name            = "\${var.prefix}-customer-a-subnet-tier-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.craig_rg_id
  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_2_prefix.cidr
  public_gateway  = ibm_is_public_gateway.customer_a_gateway_zone_2.id
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
        assert.deepEqual(
          actualData,
          expectedData,
          "should return correct data"
        );
      });
    });
  });
  describe("vpcModuleTf", () => {
    it("should return craig terraform for one vpc with only one advanced subnet tier", () => {
      let actualData = {};
      vpcModuleTf(actualData, {
        _options: {
          prefix: "t1",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 1,
          endpoints: "private",
          account_id: "",
          fs_cloud: false,
          enable_classic: false,
          dynamic_subnets: false,
          enable_power_vs: false,
          craig_version: "1.6.0",
          power_vs_zones: [],
          advanced_subnets: true,
        },
        access_groups: [],
        appid: [],
        atracker: {
          enabled: false,
          type: "cos",
          name: "atracker",
          target_name: "atracker-cos",
          bucket: null,
          add_route: true,
          cos_key: null,
          locations: ["global", "us-south"],
        },
        cbr_rules: [],
        cbr_zones: [],
        clusters: [],
        dns: [],
        event_streams: [],
        f5_vsi: [],
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
            use_hs_crypto: false,
            use_data: false,
            name: "customer-a-kms",
            resource_group: "craig-rg",
            authorize_vpc_reader_role: false,
            keys: [
              {
                name: "vsi-key",
                root_key: false,
                key_ring: "",
                force_delete: false,
                endpoint: null,
                rotation: 1,
                dual_auth_delete: false,
              },
            ],
          },
        ],
        load_balancers: [
          {
            name: "customer-a-public-lb",
            resource_group: "craig-rg",
            vpc: "customer-a",
            type: "public",
            security_groups: ["vsi-sg"],
            algorithm: "round_robin",
            protocol: "tcp",
            proxy_protocol: null,
            health_type: "tcp",
            session_persistence_app_cookie_name: "",
            target_vsi: ["connect-vsi"],
            listener_protocol: "tcp",
            connection_limit: null,
            port: 80,
            health_timeout: 5,
            health_delay: 6,
            health_retries: 5,
            listener_port: 80,
            subnets: ["subnet-tier-zone-2"],
          },
          {
            name: "customer-a-private-lb",
            resource_group: "craig-rg",
            vpc: "customer-a",
            type: "private",
            security_groups: ["vsi-sg"],
            algorithm: "round_robin",
            protocol: "tcp",
            proxy_protocol: null,
            health_type: "tcp",
            session_persistence_app_cookie_name: "",
            target_vsi: ["compass-vsi"],
            listener_protocol: "tcp",
            connection_limit: null,
            port: 80,
            health_timeout: 5,
            health_delay: 6,
            health_retries: 5,
            listener_port: 80,
            subnets: ["subnet-tier-zone-1"],
          },
        ],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: null,
          cos: null,
          bucket: null,
        },
        object_storage: [],
        power: [],
        power_instances: [],
        power_volumes: [],
        resource_groups: [
          {
            use_prefix: true,
            name: "craig-rg",
            use_data: false,
          },
        ],
        routing_tables: [],
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
        secrets_manager: [],
        security_groups: [
          {
            resource_group: "craig-rg",
            rules: [
              {
                name: "ssh",
                direction: "inbound",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: 22,
                  port_max: 22,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                source: "0.0.0.0",
                vpc: "customer-a",
                sg: "vsi-sg",
              },
              {
                name: "ping",
                direction: "inbound",
                icmp: {
                  type: 8,
                  code: 8,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                source: "0.0.0.0",
                vpc: "customer-a",
                sg: "vsi-sg",
              },
            ],
            name: "vsi-sg",
            vpc: "customer-a",
            show: false,
          },
        ],
        ssh_keys: [
          {
            name: "customer-a-ssh-key",
            public_key: "",
            use_data: false,
            resource_group: "craig-rg",
          },
        ],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: null,
        },
        teleport_vsi: [],
        transit_gateways: [],
        virtual_private_endpoints: [],
        vpcs: [
          {
            name: "customer-a",
            resource_group: "craig-rg",
            classic_access: false,
            manual_address_prefix_management: false,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "subnet-tier-zone-1",
                cidr: null,
                zone: 1,
                vpc: "customer-a",
              },
              {
                name: "subnet-tier-zone-2",
                cidr: null,
                zone: 2,
                vpc: "customer-a",
              },
              {
                vpc: "customer-a",
                zone: 1,
                cidr: "10.10.10.0/24",
                name: "subnet-tier-zone-1",
              },
              {
                vpc: "customer-a",
                zone: 2,
                cidr: "10.20.10.0/24",
                name: "subnet-tier-zone-2",
              },
            ],
            subnets: [
              {
                vpc: "customer-a",
                zone: 1,
                cidr: "10.10.10.0/24",
                name: "subnet-tier-zone-1",
                network_acl: "subnet-acl",
                resource_group: "craig-rg",
                public_gateway: false,
                has_prefix: true,
                tier: "subnet-tier",
              },
              {
                vpc: "customer-a",
                zone: 2,
                cidr: "10.10.11.0/24",
                name: "subnet-tier-zone-2",
                network_acl: "subnet-acl",
                resource_group: "craig-rg",
                public_gateway: true,
                has_prefix: true,
                acl_name: "subnet-acl",
                tier: "subnet-tier",
              },
            ],
            public_gateways: [
              {
                vpc: "customer-a",
                zone: 2,
                resource_group: "craig-rg",
              },
            ],
            acls: [
              {
                name: "subnet-acl",
                resource_group: "craig-rg",
                vpc: "customer-a",
                rules: [
                  {
                    name: "allow-all-inbound",
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
                    source: "0.0.0.0",
                    destination: "0.0.0.0",
                    acl: "subnet-acl",
                    vpc: "customer-a",
                  },
                  {
                    name: "allow-all-outbound",
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
                    source: "0.0.0.0",
                    destination: "0.0.0.0",
                    acl: "subnet-acl",
                    vpc: "customer-a",
                  },
                ],
              },
            ],
            bucket: "$disabled",
            publicGateways: [2],
            cos: null,
          },
        ],
        vpn_gateways: [
          {
            name: "customer-a-vpn-gw",
            resource_group: "craig-rg",
            vpc: "customer-a",
            subnet: "subnet-tier-zone-1",
            policy_mode: true,
          },
        ],
        vpn_servers: [],
        vsi: [
          {
            kms: "customer-a-kms",
            encryption_key: "vsi-key",
            image: "eagle-cent-os-7",
            image_name:
              "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
            profile: "bx2-2x8",
            name: "compass-vsi",
            security_groups: ["vsi-sg"],
            ssh_keys: ["customer-a-ssh-key"],
            vpc: "customer-a",
            vsi_per_subnet: 1,
            resource_group: "craig-rg",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            subnets: ["subnet-tier-zone-1"],
            volumes: [],
            subnet: "",
            enable_floating_ip: false,
          },
          {
            kms: "customer-a-kms",
            encryption_key: "vsi-key",
            image: "eagle-cent-os-7",
            image_name:
              "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
            profile: "bx2-2x8",
            name: "connect-vsi",
            security_groups: ["vsi-sg"],
            ssh_keys: ["customer-a-ssh-key"],
            vpc: "customer-a",
            vsi_per_subnet: 1,
            resource_group: "craig-rg",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            subnets: ["subnet-tier-zone-2"],
            volumes: [],
            subnet: "",
            enable_floating_ip: false,
          },
        ],
        classic_vlans: [],
        classic_ssh_keys: [],
      });
      let expectedData = {
        customer_a_vpc: {
          "main.tf":
            '##############################################################################\n# Customer AVPC\n##############################################################################\n\nresource "ibm_is_vpc" "customer_a_vpc" {\n  name                        = "${var.prefix}-customer-a-vpc"\n  resource_group              = var.craig_rg_id\n  tags                        = var.tags\n  no_sg_acl_rules             = true\n  default_network_acl_name    = null\n  default_security_group_name = null\n  default_routing_table_name  = null\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_1_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  vpc  = ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.10.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_2_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  vpc  = ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.20.10.0/24"\n}\n\nresource "ibm_is_public_gateway" "customer_a_gateway_zone_2" {\n  name           = "${var.prefix}-customer-a-gateway-zone-2"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  zone           = "${var.region}-2"\n  tags           = var.tags\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_1" {\n  vpc             = ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_2" {\n  vpc             = ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_2_prefix.cidr\n  public_gateway  = ibm_is_public_gateway.customer_a_gateway_zone_2.id\n}\n\n##############################################################################\n',
          "versions.tf":
            '##############################################################################\n# Terraform Providers\n##############################################################################\n\nterraform {\n  required_providers {\n    ibm = {\n      source  = "IBM-Cloud/ibm"\n      version = "~>1.61.0"\n    }\n  }\n  required_version = ">=1.5"\n}\n\n##############################################################################\n',
          "variables.tf":
            '##############################################################################\n# Customer AVPC Variables\n##############################################################################\n\nvariable "tags" {\n  description = "List of tags"\n  type        = list(string)\n}\n\nvariable "region" {\n  description = "IBM Cloud Region where resources will be provisioned"\n  type        = string\n}\n\nvariable "prefix" {\n  description = "Name prefix that will be prepended to named resources"\n  type        = string\n}\n\nvariable "craig_rg_id" {\n  description = "ID for the resource group craig-rg"\n  type        = string\n}\n\n##############################################################################\n',
          "acl_customer_a_subnet_acl.tf":
            '##############################################################################\n# Customer A Subnet Acl ACL\n##############################################################################\n\nresource "ibm_is_network_acl" "customer_a_subnet_acl_acl" {\n  name           = "${var.prefix}-customer-a-subnet-acl-acl"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  tags = [\n    "hello",\n    "world"\n  ]\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "inbound"\n    name        = "allow-all-inbound"\n  }\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "outbound"\n    name        = "allow-all-outbound"\n  }\n}\n\n##############################################################################\n',
          "sg_vsi_sg.tf":
            '##############################################################################\n# Security Group VSI Sg\n##############################################################################\n\nresource "ibm_is_security_group" "customer_a_vpc_vsi_sg_sg" {\n  name           = "${var.prefix}-customer-a-vsi-sg-sg"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  tags = [\n    "hello",\n    "world"\n  ]\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ssh" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  tcp {\n    port_min = 22\n    port_max = 22\n  }\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ping" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  icmp {\n    type = 8\n    code = 8\n  }\n}\n\n##############################################################################\n',
          "outputs.tf":
            '##############################################################################\n# Customer AVPC Outputs\n##############################################################################\n\noutput "id" {\n  value = ibm_is_vpc.customer_a_vpc.id\n}\n\noutput "crn" {\n  value = ibm_is_vpc.customer_a_vpc.crn\n}\n\noutput "subnet_tier_zone_1_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.id\n}\n\noutput "subnet_tier_zone_1_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.crn\n}\n\noutput "subnet_tier_zone_2_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.id\n}\n\noutput "subnet_tier_zone_2_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.crn\n}\n\noutput "vsi_sg_id" {\n  value = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n}\n\n##############################################################################\n',
        },
        "main.tf":
          '##############################################################################\n# Customer AVPC Module\n##############################################################################\n\nmodule "customer_a_vpc" {\n  source      = "./customer_a_vpc"\n  region      = var.region\n  prefix      = var.prefix\n  craig_rg_id = ibm_resource_group.craig_rg.id\n  tags = [\n    "hello",\n    "world"\n  ]\n}\n\n##############################################################################\n',
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return craig terraform for one vpc with only one advanced subnet tier and vpc from data", () => {
      let actualData = {};
      vpcModuleTf(actualData, {
        _options: {
          prefix: "t1",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 1,
          endpoints: "private",
          account_id: "",
          fs_cloud: false,
          enable_classic: false,
          dynamic_subnets: false,
          enable_power_vs: false,
          craig_version: "1.6.0",
          power_vs_zones: [],
          advanced_subnets: true,
        },
        access_groups: [],
        appid: [],
        atracker: {
          enabled: false,
          type: "cos",
          name: "atracker",
          target_name: "atracker-cos",
          bucket: null,
          add_route: true,
          cos_key: null,
          locations: ["global", "us-south"],
        },
        cbr_rules: [],
        cbr_zones: [],
        clusters: [],
        dns: [],
        event_streams: [],
        f5_vsi: [],
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
            use_hs_crypto: false,
            use_data: false,
            name: "customer-a-kms",
            resource_group: "craig-rg",
            authorize_vpc_reader_role: false,
            keys: [
              {
                name: "vsi-key",
                root_key: false,
                key_ring: "",
                force_delete: false,
                endpoint: null,
                rotation: 1,
                dual_auth_delete: false,
              },
            ],
          },
        ],
        load_balancers: [
          {
            name: "customer-a-public-lb",
            resource_group: "craig-rg",
            vpc: "customer-a",
            type: "public",
            security_groups: ["vsi-sg"],
            algorithm: "round_robin",
            protocol: "tcp",
            proxy_protocol: null,
            health_type: "tcp",
            session_persistence_app_cookie_name: "",
            target_vsi: ["connect-vsi"],
            listener_protocol: "tcp",
            connection_limit: null,
            port: 80,
            health_timeout: 5,
            health_delay: 6,
            health_retries: 5,
            listener_port: 80,
            subnets: ["subnet-tier-zone-2"],
          },
          {
            name: "customer-a-private-lb",
            resource_group: "craig-rg",
            vpc: "customer-a",
            type: "private",
            security_groups: ["vsi-sg"],
            algorithm: "round_robin",
            protocol: "tcp",
            proxy_protocol: null,
            health_type: "tcp",
            session_persistence_app_cookie_name: "",
            target_vsi: ["compass-vsi"],
            listener_protocol: "tcp",
            connection_limit: null,
            port: 80,
            health_timeout: 5,
            health_delay: 6,
            health_retries: 5,
            listener_port: 80,
            subnets: ["subnet-tier-zone-1"],
          },
        ],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: null,
          cos: null,
          bucket: null,
        },
        object_storage: [],
        power: [],
        power_instances: [],
        power_volumes: [],
        resource_groups: [
          {
            use_prefix: true,
            name: "craig-rg",
            use_data: false,
          },
        ],
        routing_tables: [],
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
        secrets_manager: [],
        security_groups: [
          {
            resource_group: "craig-rg",
            rules: [
              {
                name: "ssh",
                direction: "inbound",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: 22,
                  port_max: 22,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                source: "0.0.0.0",
                vpc: "customer-a",
                sg: "vsi-sg",
              },
              {
                name: "ping",
                direction: "inbound",
                icmp: {
                  type: 8,
                  code: 8,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                source: "0.0.0.0",
                vpc: "customer-a",
                sg: "vsi-sg",
              },
            ],
            name: "vsi-sg",
            vpc: "customer-a",
            show: false,
          },
        ],
        ssh_keys: [
          {
            name: "customer-a-ssh-key",
            public_key: "",
            use_data: false,
            resource_group: "craig-rg",
          },
        ],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: null,
        },
        teleport_vsi: [],
        transit_gateways: [],
        virtual_private_endpoints: [],
        vpcs: [
          {
            name: "customer-a",
            use_data: true,
            resource_group: "craig-rg",
            classic_access: false,
            manual_address_prefix_management: false,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "subnet-tier-zone-1",
                cidr: null,
                zone: 1,
                vpc: "customer-a",
              },
              {
                name: "subnet-tier-zone-2",
                cidr: null,
                zone: 2,
                vpc: "customer-a",
              },
              {
                vpc: "customer-a",
                zone: 1,
                cidr: "10.10.10.0/24",
                name: "subnet-tier-zone-1",
              },
              {
                vpc: "customer-a",
                zone: 2,
                cidr: "10.20.10.0/24",
                name: "subnet-tier-zone-2",
              },
            ],
            subnets: [
              {
                vpc: "customer-a",
                zone: 1,
                cidr: "10.10.10.0/24",
                name: "subnet-tier-zone-1",
                network_acl: "subnet-acl",
                resource_group: "craig-rg",
                public_gateway: false,
                has_prefix: true,
                tier: "subnet-tier",
              },
              {
                vpc: "customer-a",
                zone: 2,
                cidr: "10.10.11.0/24",
                name: "subnet-tier-zone-2",
                network_acl: "subnet-acl",
                resource_group: "craig-rg",
                public_gateway: true,
                has_prefix: true,
                acl_name: "subnet-acl",
                tier: "subnet-tier",
              },
            ],
            public_gateways: [
              {
                vpc: "customer-a",
                zone: 2,
                resource_group: "craig-rg",
              },
            ],
            acls: [
              {
                name: "subnet-acl",
                resource_group: "craig-rg",
                vpc: "customer-a",
                rules: [
                  {
                    name: "allow-all-inbound",
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
                    source: "0.0.0.0",
                    destination: "0.0.0.0",
                    acl: "subnet-acl",
                    vpc: "customer-a",
                  },
                  {
                    name: "allow-all-outbound",
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
                    source: "0.0.0.0",
                    destination: "0.0.0.0",
                    acl: "subnet-acl",
                    vpc: "customer-a",
                  },
                ],
              },
            ],
            bucket: "$disabled",
            publicGateways: [2],
            cos: null,
          },
        ],
        vpn_gateways: [
          {
            name: "customer-a-vpn-gw",
            resource_group: "craig-rg",
            vpc: "customer-a",
            subnet: "subnet-tier-zone-1",
            policy_mode: true,
          },
        ],
        vpn_servers: [],
        vsi: [
          {
            kms: "customer-a-kms",
            encryption_key: "vsi-key",
            image: "eagle-cent-os-7",
            image_name:
              "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
            profile: "bx2-2x8",
            name: "compass-vsi",
            security_groups: ["vsi-sg"],
            ssh_keys: ["customer-a-ssh-key"],
            vpc: "customer-a",
            vsi_per_subnet: 1,
            resource_group: "craig-rg",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            subnets: ["subnet-tier-zone-1"],
            volumes: [],
            subnet: "",
            enable_floating_ip: false,
          },
          {
            kms: "customer-a-kms",
            encryption_key: "vsi-key",
            image: "eagle-cent-os-7",
            image_name:
              "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
            profile: "bx2-2x8",
            name: "connect-vsi",
            security_groups: ["vsi-sg"],
            ssh_keys: ["customer-a-ssh-key"],
            vpc: "customer-a",
            vsi_per_subnet: 1,
            resource_group: "craig-rg",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            subnets: ["subnet-tier-zone-2"],
            volumes: [],
            subnet: "",
            enable_floating_ip: false,
          },
        ],
        classic_vlans: [],
        classic_ssh_keys: [],
      });
      let expectedData = {
        customer_a_vpc: {
          "main.tf":
            '##############################################################################\n# Customer AVPC\n##############################################################################\n\ndata "ibm_is_vpc" "customer_a_vpc" {\n  name = "customer-a"\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_1_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  vpc  = data.ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.10.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_2_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  vpc  = data.ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.20.10.0/24"\n}\n\nresource "ibm_is_public_gateway" "customer_a_gateway_zone_2" {\n  name           = "${var.prefix}-customer-a-gateway-zone-2"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  zone           = "${var.region}-2"\n  tags           = var.tags\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_1" {\n  vpc             = data.ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_2" {\n  vpc             = data.ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_2_prefix.cidr\n  public_gateway  = ibm_is_public_gateway.customer_a_gateway_zone_2.id\n}\n\n##############################################################################\n',
          "versions.tf":
            '##############################################################################\n# Terraform Providers\n##############################################################################\n\nterraform {\n  required_providers {\n    ibm = {\n      source  = "IBM-Cloud/ibm"\n      version = "~>1.61.0"\n    }\n  }\n  required_version = ">=1.5"\n}\n\n##############################################################################\n',
          "variables.tf":
            '##############################################################################\n# Customer AVPC Variables\n##############################################################################\n\nvariable "tags" {\n  description = "List of tags"\n  type        = list(string)\n}\n\nvariable "region" {\n  description = "IBM Cloud Region where resources will be provisioned"\n  type        = string\n}\n\nvariable "prefix" {\n  description = "Name prefix that will be prepended to named resources"\n  type        = string\n}\n\nvariable "craig_rg_id" {\n  description = "ID for the resource group craig-rg"\n  type        = string\n}\n\n##############################################################################\n',
          "acl_customer_a_subnet_acl.tf":
            '##############################################################################\n# Customer A Subnet Acl ACL\n##############################################################################\n\nresource "ibm_is_network_acl" "customer_a_subnet_acl_acl" {\n  name           = "${var.prefix}-customer-a-subnet-acl-acl"\n  vpc            = data.ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  tags = [\n    "hello",\n    "world"\n  ]\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "inbound"\n    name        = "allow-all-inbound"\n  }\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "outbound"\n    name        = "allow-all-outbound"\n  }\n}\n\n##############################################################################\n',
          "sg_vsi_sg.tf":
            '##############################################################################\n# Security Group VSI Sg\n##############################################################################\n\nresource "ibm_is_security_group" "customer_a_vpc_vsi_sg_sg" {\n  name           = "${var.prefix}-customer-a-vsi-sg-sg"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  tags = [\n    "hello",\n    "world"\n  ]\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ssh" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  tcp {\n    port_min = 22\n    port_max = 22\n  }\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ping" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  icmp {\n    type = 8\n    code = 8\n  }\n}\n\n##############################################################################\n',
          "outputs.tf":
            '##############################################################################\n# Customer AVPC Outputs\n##############################################################################\n\noutput "id" {\n  value = data.ibm_is_vpc.customer_a_vpc.id\n}\n\noutput "crn" {\n  value = data.ibm_is_vpc.customer_a_vpc.crn\n}\n\noutput "subnet_tier_zone_1_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.id\n}\n\noutput "subnet_tier_zone_1_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.crn\n}\n\noutput "subnet_tier_zone_2_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.id\n}\n\noutput "subnet_tier_zone_2_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.crn\n}\n\noutput "vsi_sg_id" {\n  value = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n}\n\n##############################################################################\n',
        },
        "main.tf":
          '##############################################################################\n# Customer AVPC Module\n##############################################################################\n\nmodule "customer_a_vpc" {\n  source      = "./customer_a_vpc"\n  region      = var.region\n  prefix      = var.prefix\n  craig_rg_id = ibm_resource_group.craig_rg.id\n  tags = [\n    "hello",\n    "world"\n  ]\n}\n\n##############################################################################\n',
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return craig terraform for one vpc with only one advanced subnet tier and vpc from data and sg from data", () => {
      let actualData = {};
      vpcModuleTf(actualData, {
        _options: {
          prefix: "t1",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 1,
          endpoints: "private",
          account_id: "",
          fs_cloud: false,
          enable_classic: false,
          dynamic_subnets: false,
          enable_power_vs: false,
          craig_version: "1.6.0",
          power_vs_zones: [],
          advanced_subnets: true,
        },
        access_groups: [],
        appid: [],
        atracker: {
          enabled: false,
          type: "cos",
          name: "atracker",
          target_name: "atracker-cos",
          bucket: null,
          add_route: true,
          cos_key: null,
          locations: ["global", "us-south"],
        },
        cbr_rules: [],
        cbr_zones: [],
        clusters: [],
        dns: [],
        event_streams: [],
        f5_vsi: [],
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
            use_hs_crypto: false,
            use_data: false,
            name: "customer-a-kms",
            resource_group: "craig-rg",
            authorize_vpc_reader_role: false,
            keys: [
              {
                name: "vsi-key",
                root_key: false,
                key_ring: "",
                force_delete: false,
                endpoint: null,
                rotation: 1,
                dual_auth_delete: false,
              },
            ],
          },
        ],
        load_balancers: [
          {
            name: "customer-a-public-lb",
            resource_group: "craig-rg",
            vpc: "customer-a",
            type: "public",
            security_groups: ["vsi-sg"],
            algorithm: "round_robin",
            protocol: "tcp",
            proxy_protocol: null,
            health_type: "tcp",
            session_persistence_app_cookie_name: "",
            target_vsi: ["connect-vsi"],
            listener_protocol: "tcp",
            connection_limit: null,
            port: 80,
            health_timeout: 5,
            health_delay: 6,
            health_retries: 5,
            listener_port: 80,
            subnets: ["subnet-tier-zone-2"],
          },
          {
            name: "customer-a-private-lb",
            resource_group: "craig-rg",
            vpc: "customer-a",
            type: "private",
            security_groups: ["vsi-sg"],
            algorithm: "round_robin",
            protocol: "tcp",
            proxy_protocol: null,
            health_type: "tcp",
            session_persistence_app_cookie_name: "",
            target_vsi: ["compass-vsi"],
            listener_protocol: "tcp",
            connection_limit: null,
            port: 80,
            health_timeout: 5,
            health_delay: 6,
            health_retries: 5,
            listener_port: 80,
            subnets: ["subnet-tier-zone-1"],
          },
        ],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: null,
          cos: null,
          bucket: null,
        },
        object_storage: [],
        power: [],
        power_instances: [],
        power_volumes: [],
        resource_groups: [
          {
            use_prefix: true,
            name: "craig-rg",
            use_data: false,
          },
        ],
        routing_tables: [],
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
        secrets_manager: [],
        security_groups: [
          {
            use_data: true,
            resource_group: "craig-rg",
            rules: [
              {
                name: "ssh",
                direction: "inbound",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: 22,
                  port_max: 22,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                source: "0.0.0.0",
                vpc: "customer-a",
                sg: "vsi-sg",
              },
              {
                name: "ping",
                direction: "inbound",
                icmp: {
                  type: 8,
                  code: 8,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                source: "0.0.0.0",
                vpc: "customer-a",
                sg: "vsi-sg",
              },
            ],
            name: "vsi-sg",
            vpc: "customer-a",
            show: false,
          },
        ],
        ssh_keys: [
          {
            name: "customer-a-ssh-key",
            public_key: "",
            use_data: false,
            resource_group: "craig-rg",
          },
        ],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: null,
        },
        teleport_vsi: [],
        transit_gateways: [],
        virtual_private_endpoints: [],
        vpcs: [
          {
            name: "customer-a",
            use_data: true,
            resource_group: "craig-rg",
            classic_access: false,
            manual_address_prefix_management: false,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "subnet-tier-zone-1",
                cidr: null,
                zone: 1,
                vpc: "customer-a",
              },
              {
                name: "subnet-tier-zone-2",
                cidr: null,
                zone: 2,
                vpc: "customer-a",
              },
              {
                vpc: "customer-a",
                zone: 1,
                cidr: "10.10.10.0/24",
                name: "subnet-tier-zone-1",
              },
              {
                vpc: "customer-a",
                zone: 2,
                cidr: "10.20.10.0/24",
                name: "subnet-tier-zone-2",
              },
            ],
            subnets: [
              {
                vpc: "customer-a",
                zone: 1,
                cidr: "10.10.10.0/24",
                name: "subnet-tier-zone-1",
                network_acl: "subnet-acl",
                resource_group: "craig-rg",
                public_gateway: false,
                has_prefix: true,
                tier: "subnet-tier",
              },
              {
                vpc: "customer-a",
                zone: 2,
                cidr: "10.10.11.0/24",
                name: "subnet-tier-zone-2",
                network_acl: "subnet-acl",
                resource_group: "craig-rg",
                public_gateway: true,
                has_prefix: true,
                acl_name: "subnet-acl",
                tier: "subnet-tier",
              },
            ],
            public_gateways: [
              {
                vpc: "customer-a",
                zone: 2,
                resource_group: "craig-rg",
              },
            ],
            acls: [
              {
                name: "subnet-acl",
                resource_group: "craig-rg",
                vpc: "customer-a",
                rules: [
                  {
                    name: "allow-all-inbound",
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
                    source: "0.0.0.0",
                    destination: "0.0.0.0",
                    acl: "subnet-acl",
                    vpc: "customer-a",
                  },
                  {
                    name: "allow-all-outbound",
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
                    source: "0.0.0.0",
                    destination: "0.0.0.0",
                    acl: "subnet-acl",
                    vpc: "customer-a",
                  },
                ],
              },
            ],
            bucket: "$disabled",
            publicGateways: [2],
            cos: null,
          },
        ],
        vpn_gateways: [
          {
            name: "customer-a-vpn-gw",
            resource_group: "craig-rg",
            vpc: "customer-a",
            subnet: "subnet-tier-zone-1",
            policy_mode: true,
          },
        ],
        vpn_servers: [],
        vsi: [
          {
            kms: "customer-a-kms",
            encryption_key: "vsi-key",
            image: "eagle-cent-os-7",
            image_name:
              "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
            profile: "bx2-2x8",
            name: "compass-vsi",
            security_groups: ["vsi-sg"],
            ssh_keys: ["customer-a-ssh-key"],
            vpc: "customer-a",
            vsi_per_subnet: 1,
            resource_group: "craig-rg",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            subnets: ["subnet-tier-zone-1"],
            volumes: [],
            subnet: "",
            enable_floating_ip: false,
          },
          {
            kms: "customer-a-kms",
            encryption_key: "vsi-key",
            image: "eagle-cent-os-7",
            image_name:
              "CentOS 7.x - Minimal Install (amd64) [eagle-cent-os-7]",
            profile: "bx2-2x8",
            name: "connect-vsi",
            security_groups: ["vsi-sg"],
            ssh_keys: ["customer-a-ssh-key"],
            vpc: "customer-a",
            vsi_per_subnet: 1,
            resource_group: "craig-rg",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            subnets: ["subnet-tier-zone-2"],
            volumes: [],
            subnet: "",
            enable_floating_ip: false,
          },
        ],
        classic_vlans: [],
        classic_ssh_keys: [],
      });
      let expectedData = {
        customer_a_vpc: {
          "main.tf":
            '##############################################################################\n# Customer AVPC\n##############################################################################\n\ndata "ibm_is_vpc" "customer_a_vpc" {\n  name = "customer-a"\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_1_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  vpc  = data.ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.10.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_2_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  vpc  = data.ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.20.10.0/24"\n}\n\nresource "ibm_is_public_gateway" "customer_a_gateway_zone_2" {\n  name           = "${var.prefix}-customer-a-gateway-zone-2"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  zone           = "${var.region}-2"\n  tags           = var.tags\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_1" {\n  vpc             = data.ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_2" {\n  vpc             = data.ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_2_prefix.cidr\n  public_gateway  = ibm_is_public_gateway.customer_a_gateway_zone_2.id\n}\n\n##############################################################################\n',
          "versions.tf":
            '##############################################################################\n# Terraform Providers\n##############################################################################\n\nterraform {\n  required_providers {\n    ibm = {\n      source  = "IBM-Cloud/ibm"\n      version = "~>1.61.0"\n    }\n  }\n  required_version = ">=1.5"\n}\n\n##############################################################################\n',
          "variables.tf":
            '##############################################################################\n# Customer AVPC Variables\n##############################################################################\n\nvariable "tags" {\n  description = "List of tags"\n  type        = list(string)\n}\n\nvariable "region" {\n  description = "IBM Cloud Region where resources will be provisioned"\n  type        = string\n}\n\nvariable "prefix" {\n  description = "Name prefix that will be prepended to named resources"\n  type        = string\n}\n\nvariable "craig_rg_id" {\n  description = "ID for the resource group craig-rg"\n  type        = string\n}\n\n##############################################################################\n',
          "acl_customer_a_subnet_acl.tf":
            '##############################################################################\n# Customer A Subnet Acl ACL\n##############################################################################\n\nresource "ibm_is_network_acl" "customer_a_subnet_acl_acl" {\n  name           = "${var.prefix}-customer-a-subnet-acl-acl"\n  vpc            = data.ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  tags = [\n    "hello",\n    "world"\n  ]\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "inbound"\n    name        = "allow-all-inbound"\n  }\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "outbound"\n    name        = "allow-all-outbound"\n  }\n}\n\n##############################################################################\n',
          "sg_vsi_sg.tf":
            '##############################################################################\n# Security Group VSI Sg\n##############################################################################\n\ndata "ibm_is_security_group" "customer_a_vpc_vsi_sg_sg" {\n  name = "vsi-sg"\n  vpc  = data.ibm_is_vpc.customer_a_vpc.id\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ssh" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  tcp {\n    port_min = 22\n    port_max = 22\n  }\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ping" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  icmp {\n    type = 8\n    code = 8\n  }\n}\n\n##############################################################################\n',
          "outputs.tf":
            '##############################################################################\n# Customer AVPC Outputs\n##############################################################################\n\noutput "id" {\n  value = data.ibm_is_vpc.customer_a_vpc.id\n}\n\noutput "crn" {\n  value = data.ibm_is_vpc.customer_a_vpc.crn\n}\n\noutput "subnet_tier_zone_1_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.id\n}\n\noutput "subnet_tier_zone_1_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.crn\n}\n\noutput "subnet_tier_zone_2_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.id\n}\n\noutput "subnet_tier_zone_2_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.crn\n}\n\noutput "vsi_sg_id" {\n  value = data.ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n}\n\n##############################################################################\n',
        },
        "main.tf":
          '##############################################################################\n# Customer AVPC Module\n##############################################################################\n\nmodule "customer_a_vpc" {\n  source      = "./customer_a_vpc"\n  region      = var.region\n  prefix      = var.prefix\n  craig_rg_id = ibm_resource_group.craig_rg.id\n  tags = [\n    "hello",\n    "world"\n  ]\n}\n\n##############################################################################\n',
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return craig terraform for edge network in module", () => {
      let actualData = {};
      vpcModuleTf(actualData, {
        _options: {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 3,
          endpoints: "private",
          account_id: "",
          fs_cloud: true,
          enable_classic: false,
          dynamic_subnets: false,
          enable_power_vs: true,
          power_vs_zones: ["us-south"],
          craig_version: "1.8.0",
          template: "Power VS SAP Hana",
        },
        access_groups: [],
        appid: [],
        atracker: {
          enabled: true,
          type: "cos",
          name: "atracker",
          target_name: "atracker-cos",
          bucket: "atracker-bucket",
          add_route: true,
          cos_key: "cos-bind-key",
          locations: ["global", "us-south"],
        },
        cbr_rules: [],
        cbr_zones: [],
        clusters: [],
        dns: [],
        event_streams: [],
        f5_vsi: [
          {
            kms: "kms",
            subnet: "f5-management-zone-1",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-1",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-1",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-1",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 1,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
          {
            kms: "kms",
            subnet: "f5-management-zone-2",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-2",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-2",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-2",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 2,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
          {
            kms: "kms",
            subnet: "f5-management-zone-3",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-3",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-3",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-3",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 3,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
        ],
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
              {
                key_ring: "ring",
                name: "atracker-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 1,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "vsi-volume-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 1,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "roks-key",
                root_key: true,
                force_delete: null,
                endpoint: null,
                rotation: 1,
                dual_auth_delete: false,
              },
            ],
          },
        ],
        load_balancers: [],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: "service-rg",
          cos: "atracker-cos",
          bucket: "atracker-bucket",
        },
        object_storage: [
          {
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "atracker-key",
                name: "atracker-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
            ],
            keys: [
              {
                name: "cos-bind-key",
                role: "Writer",
                enable_hmac: false,
                use_random_suffix: true,
              },
            ],
            name: "atracker-cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
            use_random_suffix: true,
            kms: "kms",
          },
          {
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "management-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "workload-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
              {
                force_delete: false,
                name: "edge-bucket",
                storage_class: "standard",
                kms_key: "key",
                endpoint: "public",
                use_random_suffix: true,
              },
            ],
            use_random_suffix: true,
            keys: [],
            name: "cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
            kms: "kms",
          },
        ],
        power: [
          {
            name: "secure-powervs",
            resource_group: "powervs-rg",
            zone: "us-south",
            ssh_keys: [
              {
                name: "power-ssh-key",
                public_key:
                  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC5Zx4PO/vXJ7ptTy84KuUcf7D4XKE20zErMHlnIefwcsGnfSacqqyGyZDpT/CedgtiHFNPBItzMYGpfqF9UZ2a0C3LfdWPt1JE4pHGHE2NoujGVhACSJKADFia6d2u6go1SP3aXmTFYlCWl/z6NJ2rq/Tz3jH5w3oc7QbS+awXzTz/Vw0AIgUJXVqCNWSy9kVnPwTI3dwBdc61ttfQzwAbJm0A2dduHex/Ztstx9pcPeFcULf/muVUjOeqJKCYqgJpO7TDEE4VEQQqj+qUrmWxP/7nMt1SAuxtX1Ey/8LPnu0WN43tVfEUSA58GrkT4YOLp5+N2jwVXd1twuOcyxkq9DM54JEyPe8JWTvgxPt24QzUWoAIPZ9zeLsdcC7DtgVzyR+6f2tmcEn+t/0XHxSOzkcOSRouuDdzEE7YOG9Co/zVLLEoWA7Qfz0ObuQ2ex8WRbTRSbDc7o2++VxPsh4zR9KKVRfzssCtLnRxoGHWTTBI/syUl8kQcy8TCNTDuHE= ay1man1@Aymans-MBP-WORK",
                use_data: false,
                resource_group: "powervs-rg",
                workspace: "secure-powervs",
                zone: "us-south",
              },
            ],
            network: [
              {
                name: "management",
                pi_network_type: "vlan",
                pi_cidr: "10.51.0.0/24",
                pi_dns: ["127.0.0.1"],
                pi_network_jumbo: false,
                workspace: "secure-powervs",
                zone: "us-south",
              },
              {
                name: "backup",
                pi_network_type: "vlan",
                pi_cidr: "10.52.0.0/24",
                pi_dns: ["127.0.0.1"],
                pi_network_jumbo: false,
                workspace: "secure-powervs",
                zone: "us-south",
                depends_on: [
                  "${ibm_pi_network.power_network_secure_powervs_management}",
                ],
              },
              {
                name: "sap",
                pi_network_type: "vlan",
                pi_cidr: "10.53.0.0/24",
                pi_dns: ["127.0.0.1"],
                pi_network_jumbo: false,
                workspace: "secure-powervs",
                zone: "us-south",
                depends_on: [
                  "${ibm_pi_network.power_network_secure_powervs_backup}",
                ],
              },
            ],
            cloud_connections: [],
            images: [
              {
                name: "RHEL8-SP4-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "3a1fd0fd-24df-44a1-919a-7041f9c74fc0",
              },
              {
                name: "RHEL8-SP4-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "a1e22955-749d-4b4a-aeba-d297d60fcb0b",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp4_sap}",
                ],
              },
              {
                name: "RHEL8-SP6-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "268144b8-6223-48e4-a26e-bdc8f71f6c60",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp4_sap_netweaver}",
                ],
              },
              {
                name: "RHEL8-SP6-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "658ba2a0-4add-40b9-a177-a28a856c26de",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp6_sap}",
                ],
              },
              {
                name: "SLES15-SP2-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "5d548cc2-e813-4c09-beb5-8f22b094905d",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp6_sap_netweaver}",
                ],
              },
              {
                name: "SLES15-SP2-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "52579206-7efd-43ae-8417-ce5acac95d31",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp2_sap}",
                ],
              },
              {
                name: "SLES15-SP3-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "423bc6f6-bb0d-44c2-ad26-8705ae83f5ca",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp2_sap_netweaver}",
                ],
              },
              {
                name: "SLES15-SP3-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "1a62ac4a-83e7-4dee-a36f-983521f1826c",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp3_sap}",
                ],
              },
              {
                name: "SLES15-SP4-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "a6b8f8d5-86e0-4fb2-b335-2ce3f1a88612",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp3_sap_netweaver}",
                ],
              },
              {
                name: "SLES15-SP4-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "071e1eac-8aa2-4259-9c0e-5ec268f610e2",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp4_sap}",
                ],
              },
            ],
            attachments: [
              {
                network: "management",
                workspace: "secure-powervs",
                zone: "us-south",
                connections: [],
              },
              {
                network: "backup",
                workspace: "secure-powervs",
                zone: "us-south",
                connections: [],
              },
              {
                network: "sap",
                workspace: "secure-powervs",
                zone: "us-south",
                connections: [],
              },
            ],
            imageNames: [
              "RHEL8-SP4-SAP",
              "RHEL8-SP4-SAP-NETWEAVER",
              "RHEL8-SP6-SAP",
              "RHEL8-SP6-SAP-NETWEAVER",
              "SLES15-SP2-SAP",
              "SLES15-SP2-SAP-NETWEAVER",
              "SLES15-SP3-SAP",
              "SLES15-SP3-SAP-NETWEAVER",
              "SLES15-SP4-SAP",
              "SLES15-SP4-SAP-NETWEAVER",
            ],
          },
        ],
        power_instances: [
          {
            name: "secure-file-share",
            workspace: "secure-powervs",
            image: "RHEL8-SP4-SAP",
            network: [
              {
                name: "backup",
                ip_address: "",
              },
              {
                name: "management",
                ip_address: "",
              },
            ],
            zone: "us-south",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh-key",
            pi_sys_type: "s922",
            pi_memory: "2",
            pi_processors: ".5",
            storage_option: "Storage Type",
            pi_storage_pool_affinity: false,
            sap: false,
          },
          {
            name: "sap-hana",
            workspace: "secure-powervs",
            image: "RHEL8-SP6-SAP",
            network: [
              {
                name: "backup",
                ip_address: "",
              },
              {
                name: "management",
                ip_address: "",
              },
              {
                name: "sap",
                ip_address: "",
              },
            ],
            zone: "us-south",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh-key",
            pi_sys_type: "e880",
            pi_memory: "256",
            pi_processors: "4",
            pi_affinity_volume: null,
            pi_affinity_instance: null,
            pi_anti_affinity_instance: null,
            pi_anti_affinity_volume: null,
            storage_option: "Storage Type",
            pi_storage_pool_affinity: false,
            sap: true,
            sap_profile: "ush1-4x256",
          },
          {
            name: "sap-netweaver",
            workspace: "secure-powervs",
            image: "RHEL8-SP6-SAP-NETWEAVER",
            network: [
              {
                name: "backup",
                ip_address: "",
              },
              {
                name: "management",
                ip_address: "",
              },
              {
                name: "sap",
                ip_address: "",
              },
            ],
            zone: "us-south",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier3",
            ssh_key: "power-ssh-key",
            pi_sys_type: "s922",
            pi_processors: "3",
            pi_memory: "32",
            storage_option: "Storage Type",
            pi_storage_pool_affinity: false,
            sap: false,
          },
        ],
        power_volumes: [
          {
            name: "sapmnt",
            workspace: "secure-powervs",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier3",
            attachments: ["sap-hana", "sap-netweaver"],
            zone: "us-south",
            pi_volume_size: "300",
          },
          {
            name: "trans",
            workspace: "secure-powervs",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier3",
            attachments: ["sap-hana", "sap-netweaver"],
            zone: "us-south",
            pi_volume_size: "50",
          },
          {
            name: "sap-hana-sap-data-1",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-data-2",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-data-3",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-data-4",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-1",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-2",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-3",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-4",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-shared",
            mount: "/hana/shared",
            pi_volume_size: 256,
            pi_volume_type: "tier3",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
        ],
        resource_groups: [
          {
            use_prefix: true,
            name: "service-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "workload-rg",
            use_data: false,
          },
          {
            use_data: false,
            use_prefix: true,
            name: "edge-rg",
          },
          {
            use_data: false,
            name: "powervs-rg",
            use_prefix: true,
          },
        ],
        routing_tables: [],
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
        secrets_manager: [],
        security_groups: [
          {
            name: "f5-management-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            name: "f5-external-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "f5-external-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-inbound-443",
                source: "0.0.0.0/0",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            name: "f5-bastion-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "1-inbound-3023",
                source: "10.5.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "1-inbound-3080",
                source: "10.5.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "2-inbound-3023",
                source: "10.6.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "2-inbound-3080",
                source: "10.6.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "3-inbound-3023",
                source: "10.7.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "3-inbound-3080",
                source: "10.7.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            name: "edge-vpe-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            vpc: "management",
            name: "management-vpe",
            resource_group: "management-rg",
            rules: [
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
            ],
          },
          {
            vpc: "workload",
            name: "workload-vpe",
            resource_group: "workload-rg",
            rules: [
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
            ],
          },
          {
            vpc: "management",
            name: "management-vsi",
            resource_group: "management-rg",
            rules: [
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
            ],
          },
        ],
        ssh_keys: [
          {
            name: "ssh-key",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC5Zx4PO/vXJ7ptTy84KuUcf7D4XKE20zErMHlnIefwcsGnfSacqqyGyZDpT/CedgtiHFNPBItzMYGpfqF9UZ2a0C3LfdWPt1JE4pHGHE2NoujGVhACSJKADFia6d2u6go1SP3aXmTFYlCWl/z6NJ2rq/Tz3jH5w3oc7QbS+awXzTz/Vw0AIgUJXVqCNWSy9kVnPwTI3dwBdc61ttfQzwAbJm0A2dduHex/Ztstx9pcPeFcULf/muVUjOeqJKCYqgJpO7TDEE4VEQQqj+qUrmWxP/7nMt1SAuxtX1Ey/8LPnu0WN43tVfEUSA58GrkT4YOLp5+N2jwVXd1twuOcyxkq9DM54JEyPe8JWTvgxPt24QzUWoAIPZ9zeLsdcC7DtgVzyR+6f2tmcEn+t/0XHxSOzkcOSRouuDdzEE7YOG9Co/zVLLEoWA7Qfz0ObuQ2ex8WRbTRSbDc7o2++VxPsh4zR9KKVRfzssCtLnRxoGHWTTBI/syUl8kQcy8TCNTDuHE= ay1man1@Aymans-MBP-WORK",
            resource_group: "management-rg",
            use_data: false,
          },
        ],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: "service-rg",
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
                vpc: "management",
              },
              {
                tgw: "transit-gateway",
                vpc: "workload",
              },
            ],
          },
        ],
        virtual_private_endpoints: [
          {
            name: "management-cos",
            service: "cos",
            vpc: "management",
            resource_group: "management-rg",
            security_groups: ["management-vpe"],
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
          {
            name: "workload-cos",
            service: "cos",
            vpc: "workload",
            resource_group: "workload-rg",
            security_groups: ["workload-vpe"],
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
        ],
        vpcs: [
          {
            cos: "cos",
            bucket: "edge-bucket",
            name: "edge",
            resource_group: "edge-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_routing_table_name: null,
            default_security_group_name: null,
            address_prefixes: [
              {
                vpc: "edge",
                zone: 1,
                cidr: "10.5.0.0/16",
                name: "edge-zone-1",
              },
              {
                vpc: "edge",
                zone: 2,
                cidr: "10.6.0.0/16",
                name: "edge-zone-2",
              },
              {
                vpc: "edge",
                zone: 3,
                cidr: "10.7.0.0/16",
                name: "edge-zone-3",
              },
            ],
            acls: [
              {
                name: "edge-acl",
                vpc: "edge",
                resource_group: "edge-rg",
                rules: [
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
              {
                name: "f5-external-acl",
                vpc: "edge",
                resource_group: "edge-rg",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-f5-external-443-inbound",
                    source: "0.0.0.0/0",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: 443,
                      port_min: 443,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
            subnets: [
              {
                vpc: "edge",
                name: "f5-bastion-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-bastion-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-bastion-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
            ],
            public_gateways: [],
            publicGateways: [],
          },
          {
            cos: "cos",
            bucket: "management-bucket",
            name: "management",
            resource_group: "management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            publicGateways: [],
            address_prefixes: [
              {
                name: "vsi-zone-1",
                cidr: "10.10.0.0/29",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.0.16/28",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vsi-zone-2",
                cidr: "10.20.0.0/29",
                zone: 2,
                vpc: "management",
              },
              {
                name: "vsi-zone-3",
                cidr: "10.30.0.0/29",
                zone: 3,
                vpc: "management",
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.0.48/29",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.0.16/29",
                zone: 2,
                vpc: "management",
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.0.16/29",
                zone: 3,
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.0.0/29",
                name: "vsi-zone-1",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.0.16/28",
                name: "vpn-zone-1",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 2,
                cidr: "10.20.0.0/29",
                name: "vsi-zone-2",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 3,
                cidr: "10.30.0.0/29",
                name: "vsi-zone-3",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.0.48/29",
                name: "vpe-zone-1",
                resource_group: "management-rg",
                network_acl: "management",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 2,
                cidr: "10.20.0.16/29",
                name: "vpe-zone-2",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 3,
                cidr: "10.30.0.16/29",
                name: "vpe-zone-3",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
            ],
            public_gateways: [],
            acls: [
              {
                resource_group: "management-rg",
                name: "management",
                vpc: "management",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "management",
                    vpc: "management",
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
                  },
                  {
                    action: "allow",
                    source: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-ibm-outbound",
                    destination: "161.26.0.0/16",
                    acl: "management",
                    vpc: "management",
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
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "management",
                    vpc: "management",
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
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    acl: "management",
                    vpc: "management",
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
                  },
                ],
              },
            ],
          },
          {
            cos: "cos",
            bucket: "workload-bucket",
            name: "workload",
            resource_group: "workload-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            publicGateways: [],
            address_prefixes: [
              {
                name: "vsi-zone-1",
                cidr: "10.40.0.0/28",
                zone: 1,
                vpc: "workload",
              },
              {
                name: "vsi-zone-2",
                cidr: "10.50.0.0/28",
                zone: 2,
                vpc: "workload",
              },
              {
                name: "vsi-zone-3",
                cidr: "10.60.0.0/28",
                zone: 3,
                vpc: "workload",
              },
              {
                name: "vpe-zone-1",
                cidr: "10.40.0.32/29",
                zone: 1,
                vpc: "workload",
              },
              {
                name: "vpe-zone-2",
                cidr: "10.50.0.32/29",
                zone: 2,
                vpc: "workload",
              },
              {
                name: "vpe-zone-3",
                cidr: "10.60.0.32/29",
                zone: 3,
                vpc: "workload",
              },
            ],
            subnets: [
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.40.0.0/28",
                name: "vsi-zone-1",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.50.0.0/28",
                name: "vsi-zone-2",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.60.0.0/28",
                name: "vsi-zone-3",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.40.0.32/29",
                name: "vpe-zone-1",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.50.0.32/29",
                name: "vpe-zone-2",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.60.0.32/29",
                name: "vpe-zone-3",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
            ],
            public_gateways: [],
            acls: [
              {
                resource_group: "workload-rg",
                name: "workload",
                vpc: "workload",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "workload",
                    vpc: "workload",
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
                  },
                  {
                    action: "allow",
                    source: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-ibm-outbound",
                    destination: "161.26.0.0/16",
                    acl: "workload",
                    vpc: "workload",
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
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "workload",
                    vpc: "workload",
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
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    acl: "workload",
                    vpc: "workload",
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
                  },
                ],
              },
            ],
          },
        ],
        vpn_gateways: [
          {
            name: "management-gateway",
            resource_group: "management-rg",
            subnet: "vpn-zone-1",
            vpc: "management",
          },
        ],
        vpn_servers: [],
        vsi: [
          {
            kms: "kms",
            encryption_key: "vsi-volume-key",
            image: "ibm-ubuntu-22-04-1-minimal-amd64-1",
            profile: "cx2-4x8",
            name: "management-server",
            security_groups: ["management-vsi"],
            ssh_keys: ["ssh-key"],
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc: "management",
            vsi_per_subnet: 2,
            resource_group: "management-rg",
            override_vsi_name: null,
            user_data: "",
            network_interfaces: [],
            volumes: [],
          },
        ],
        classic_ssh_keys: [],
        classic_vlans: [],
        classic_gateways: [],
      });
      let expectedData = `##############################################################################
# Edge VPC
##############################################################################

resource "ibm_is_vpc" "edge_vpc" {
  name                        = "$\{var.prefix}-edge-vpc"
  resource_group              = var.edge_rg_id
  tags                        = var.tags
  no_sg_acl_rules             = true
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
}

resource "ibm_is_vpc_address_prefix" "edge_zone_1_prefix" {
  name = "$\{var.prefix}-edge-edge-zone-1"
  vpc  = ibm_is_vpc.edge_vpc.id
  zone = "$\{var.region}-1"
  cidr = "10.5.0.0/16"
}

resource "ibm_is_vpc_address_prefix" "edge_zone_2_prefix" {
  name = "$\{var.prefix}-edge-edge-zone-2"
  vpc  = ibm_is_vpc.edge_vpc.id
  zone = "$\{var.region}-2"
  cidr = "10.6.0.0/16"
}

resource "ibm_is_vpc_address_prefix" "edge_zone_3_prefix" {
  name = "$\{var.prefix}-edge-edge-zone-3"
  vpc  = ibm_is_vpc.edge_vpc.id
  zone = "$\{var.region}-3"
  cidr = "10.7.0.0/16"
}

resource "ibm_is_subnet" "edge_f5_bastion_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-bastion-zone-1"
  zone            = "$\{var.region}-1"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.50.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_bastion_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-bastion-zone-2"
  zone            = "$\{var.region}-2"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.50.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_bastion_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-bastion-zone-3"
  zone            = "$\{var.region}-3"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.50.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_external_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-external-zone-1"
  zone            = "$\{var.region}-1"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_f5_external_acl_acl.id
  ipv4_cidr_block = "10.5.40.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_external_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-external-zone-2"
  zone            = "$\{var.region}-2"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_f5_external_acl_acl.id
  ipv4_cidr_block = "10.6.40.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_external_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-external-zone-3"
  zone            = "$\{var.region}-3"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_f5_external_acl_acl.id
  ipv4_cidr_block = "10.7.40.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_management_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-management-zone-1"
  zone            = "$\{var.region}-1"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.30.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_management_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-management-zone-2"
  zone            = "$\{var.region}-2"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.30.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_f5_management_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-f5-management-zone-3"
  zone            = "$\{var.region}-3"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.30.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpe_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-vpe-zone-1"
  zone            = "$\{var.region}-1"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.60.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpe_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-vpe-zone-2"
  zone            = "$\{var.region}-2"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.60.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpe_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-vpe-zone-3"
  zone            = "$\{var.region}-3"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.60.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_1_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-vpn-1-zone-1"
  zone            = "$\{var.region}-1"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.10.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_1_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-vpn-1-zone-2"
  zone            = "$\{var.region}-2"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.10.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_1_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-vpn-1-zone-3"
  zone            = "$\{var.region}-3"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.10.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_2_zone_1" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "$\{var.prefix}-edge-vpn-2-zone-1"
  zone            = "$\{var.region}-1"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.5.20.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_2_zone_2" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-2-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.6.20.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

resource "ibm_is_subnet" "edge_vpn_2_zone_3" {
  vpc             = ibm_is_vpc.edge_vpc.id
  name            = "\${var.prefix}-edge-vpn-2-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.edge_rg_id
  tags            = var.tags
  network_acl     = ibm_is_network_acl.edge_edge_acl_acl.id
  ipv4_cidr_block = "10.7.20.0/24"
  depends_on = [
    ibm_is_vpc_address_prefix.edge_zone_1_prefix,
    ibm_is_vpc_address_prefix.edge_zone_2_prefix,
    ibm_is_vpc_address_prefix.edge_zone_3_prefix
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData.edge_vpc["main.tf"],
        expectedData,
        "should return correct data"
      );
    });
  });
  describe("vpcModuleJson", () => {
    it("should return correct module for vpcs with hyphenate names", () => {
      let actualData = vpcModuleJson(
        {
          name: "test-case",
        },
        [],
        {
          _options: {
            tags: [],
          },
        }
      );
      let expectedData = {
        test_case_vpc: {
          "//": {
            metadata: { uniqueId: "test_case_vpc", path: "./test_case_vpc" },
          },
          source: "./test_case_vpc",
          region: "${var.region}",
          prefix: "${var.prefix}",
          tags: [],
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted module"
      );
    });
  });
});
