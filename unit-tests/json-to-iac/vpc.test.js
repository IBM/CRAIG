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
