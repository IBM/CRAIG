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
    ibm_is_vpc_address_prefix.edge_f5_zone_1_prefix
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
            '##############################################################################\n# Customer AVPC\n##############################################################################\n\nresource "ibm_is_vpc" "customer_a_vpc" {\n  name                        = "${var.prefix}-customer-a-vpc"\n  resource_group              = var.craig_rg_id\n  tags                        = var.tags\n  default_network_acl_name    = null\n  default_security_group_name = null\n  default_routing_table_name  = null\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_1_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  vpc  = ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.10.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "customer_a_subnet_tier_zone_2_prefix" {\n  name = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  vpc  = ibm_is_vpc.customer_a_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.20.10.0/24"\n}\n\nresource "ibm_is_public_gateway" "customer_a_gateway_zone_2" {\n  name           = "${var.prefix}-customer-a-gateway-zone-2"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  zone           = "${var.region}-2"\n  tags           = var.tags\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_1" {\n  vpc             = ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "customer_a_subnet_tier_zone_2" {\n  vpc             = ibm_is_vpc.customer_a_vpc.id\n  name            = "${var.prefix}-customer-a-subnet-tier-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.craig_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.customer_a_subnet_acl_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.customer_a_subnet_tier_zone_2_prefix.cidr\n  public_gateway  = ibm_is_public_gateway.customer_a_gateway_zone_2.id\n}\n\n##############################################################################\n',
          "versions.tf":
            '##############################################################################\n# Terraform Providers\n##############################################################################\n\nterraform {\n  required_providers {\n    ibm = {\n      source  = "IBM-Cloud/ibm"\n      version = "~>1.56.1"\n    }\n  }\n  required_version = ">=1.3"\n}\n\n##############################################################################\n',
          "variables.tf":
            '##############################################################################\n# Customer AVPC Variables\n##############################################################################\n\nvariable "tags" {\n  description = "List of tags"\n  type        = list(string)\n}\n\nvariable "region" {\n  description = "IBM Cloud Region where resources will be provisioned"\n  type        = string\n  validation {\n    error_message = "Region must be in a supported IBM VPC region."\n    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)\n  }\n}\n\nvariable "prefix" {\n  description = "Name prefix that will be prepended to named resources"\n  type        = string\n  validation {\n    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."\n    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16\n  }\n}\n\nvariable "craig_rg_id" {\n  description = "ID for the resource group craig-rg"\n  type        = string\n}\n\n##############################################################################\n',
          "acl_customer_a_subnet_acl.tf":
            '##############################################################################\n# Customer A Subnet Acl ACL\n##############################################################################\n\nresource "ibm_is_network_acl" "customer_a_subnet_acl_acl" {\n  name           = "${var.prefix}-customer-a-subnet-acl-acl"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  tags = [\n    "hello",\n    "world"\n  ]\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "inbound"\n    name        = "allow-all-inbound"\n  }\n  rules {\n    source      = "0.0.0.0"\n    action      = "allow"\n    destination = "0.0.0.0"\n    direction   = "outbound"\n    name        = "allow-all-outbound"\n  }\n}\n\n##############################################################################\n',
          "sg_vsi_sg.tf":
            '##############################################################################\n# Security Group VSI Sg\n##############################################################################\n\nresource "ibm_is_security_group" "customer_a_vpc_vsi_sg_sg" {\n  name           = "${var.prefix}-customer-a-vsi-sg-sg"\n  vpc            = ibm_is_vpc.customer_a_vpc.id\n  resource_group = var.craig_rg_id\n  tags = [\n    "hello",\n    "world"\n  ]\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ssh" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  tcp {\n    port_min = 22\n    port_max = 22\n  }\n}\n\nresource "ibm_is_security_group_rule" "customer_a_vpc_vsi_sg_sg_rule_ping" {\n  group     = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n  remote    = "0.0.0.0"\n  direction = "inbound"\n  icmp {\n    type = 8\n    code = 8\n  }\n}\n\n##############################################################################\n',
          "outputs.tf":
            '##############################################################################\n# Customer AVPC Outputs\n##############################################################################\n\noutput "id" {\n  value = ibm_is_vpc.customer_a_vpc.id\n}\n\noutput "crn" {\n  value = ibm_is_vpc.customer_a_vpc.crn\n}\n\noutput "subnet_tier_zone_1_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.id\n}\n\noutput "subnet_tier_zone_1_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_1.crn\n}\n\noutput "subnet_tier_zone_2_id" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.id\n}\n\noutput "subnet_tier_zone_2_crn" {\n  value = ibm_is_subnet.customer_a_subnet_tier_zone_2.crn\n}\n\noutput "vsi_sg_id" {\n  value = ibm_is_security_group.customer_a_vpc_vsi_sg_sg.id\n}\n\n##############################################################################\n',
        },
        "main.tf":
          'undefined\n##############################################################################\n# Customer AVPC Module\n##############################################################################\n\nmodule "customer_a_vpc" {\n  source      = "./customer_a_vpc"\n  region      = var.region\n  prefix      = var.prefix\n  craig_rg_id = ibm_resource_group.craig_rg.id\n  tags = [\n    "hello",\n    "world"\n  ]\n}\n\n##############################################################################\n',
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
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
