const { assert } = require("chai");
const {
  formatSecurityGroup,
  formatSgRule,
  sgTf,
} = require("../../client/src/lib/json-to-iac/security-groups");
const slzNetwork = require("../data-files/slz-network.json");

describe("security groups", () => {
  describe("formatSecurityGroup", () => {
    it("should format a security group", () => {
      let actualData = formatSecurityGroup(
        {
          vpc: "management",
          name: "management-vpe-sg",
          resource_group: "slz-management-rg",
          rules: [
            {
              vpc: "management",
              sg: "management-vpe-sg",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: null,
                port_min: null,
              },
            },
            {
              vpc: "management",
              sg: "management-vpe-sg",
              direction: "inbound",
              name: "allow-vpc-inbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
            },
            {
              vpc: "management",
              sg: "management-vpe-sg",
              direction: "outbound",
              name: "allow-vpc-outbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
            },
            {
              vpc: "management",
              sg: "management-vpe-sg",
              direction: "outbound",
              name: "allow-ibm-tcp-53-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 53,
                port_min: 53,
              },
            },
            {
              vpc: "management",
              sg: "management-vpe-sg",
              direction: "outbound",
              name: "allow-ibm-tcp-80-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 80,
                port_min: 80,
              },
            },
            {
              vpc: "management",
              sg: "management-vpe-sg",
              direction: "outbound",
              name: "allow-ibm-tcp-443-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 443,
                port_min: 443,
              },
            },
          ],
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_security_group" "management_vpc_management_vpe_sg_sg" {
  name           = "\${var.prefix}-management-management-vpe-sg-sg"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "it should return correct tf");
    });
  });
  describe("formatSgRule", () => {
    it("should format network acl rule with no protocol", () => {
      let actualData = formatSgRule(
        {
          sg: "management-vpe-sg",
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
resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_inbound" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "inbound"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with tcp protocol", () => {
      let actualData = formatSgRule(
        {
          sg: "management-vpe-sg",
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
resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_inbound_8080" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "inbound"
  tcp {
    port_min = 8080
    port_max = null
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
      let actualData = formatSgRule(
        {
          sg: "management-vpe-sg",
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
resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_inbound_8080" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "inbound"
  udp {
    port_min = 8080
    port_max = null
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
      let actualData = formatSgRule(
        {
          sg: "management-vpe-sg",
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
resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_inbound_8080" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "inbound"
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
  });
  describe("sgTf", () => {
    it("should create correct security group terraform", () => {
      let actualData = sgTf(slzNetwork);
      let expectedData = `##############################################################################
# Security Group Management VPE Sg
##############################################################################

resource "ibm_is_security_group" "management_vpc_management_vpe_sg_sg" {
  name           = "\${var.prefix}-management-management-vpe-sg-sg"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.slz_management_rg_id
  tags = [
    "slz",
    "landing-zone"
  ]
}

resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_inbound" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "inbound"
}

resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_vpc_inbound" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "10.0.0.0/8"
  direction = "inbound"
}

resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_vpc_outbound" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "10.0.0.0/8"
  direction = "outbound"
}

resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_tcp_53_outbound" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "outbound"
  tcp {
    port_min = 53
    port_max = 53
  }
}

resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_tcp_80_outbound" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "outbound"
  tcp {
    port_min = 80
    port_max = 80
  }
}

resource "ibm_is_security_group_rule" "management_vpc_management_vpe_sg_sg_rule_allow_ibm_tcp_443_outbound" {
  group     = ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "outbound"
  tcp {
    port_min = 443
    port_max = 443
  }
}

##############################################################################

##############################################################################
# Security Group Workload VPE Sg
##############################################################################

resource "ibm_is_security_group" "workload_vpc_workload_vpe_sg_sg" {
  name           = "\${var.prefix}-workload-workload-vpe-sg-sg"
  vpc            = ibm_is_vpc.workload_vpc.id
  resource_group = var.slz_workload_rg_id
  tags = [
    "slz",
    "landing-zone"
  ]
}

resource "ibm_is_security_group_rule" "workload_vpc_workload_vpe_sg_sg_rule_allow_ibm_inbound" {
  group     = ibm_is_security_group.workload_vpc_workload_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "inbound"
}

resource "ibm_is_security_group_rule" "workload_vpc_workload_vpe_sg_sg_rule_allow_vpc_inbound" {
  group     = ibm_is_security_group.workload_vpc_workload_vpe_sg_sg.id
  remote    = "10.0.0.0/8"
  direction = "inbound"
}

resource "ibm_is_security_group_rule" "workload_vpc_workload_vpe_sg_sg_rule_allow_vpc_outbound" {
  group     = ibm_is_security_group.workload_vpc_workload_vpe_sg_sg.id
  remote    = "10.0.0.0/8"
  direction = "outbound"
}

resource "ibm_is_security_group_rule" "workload_vpc_workload_vpe_sg_sg_rule_allow_ibm_tcp_53_outbound" {
  group     = ibm_is_security_group.workload_vpc_workload_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "outbound"
  tcp {
    port_min = 53
    port_max = 53
  }
}

resource "ibm_is_security_group_rule" "workload_vpc_workload_vpe_sg_sg_rule_allow_ibm_tcp_80_outbound" {
  group     = ibm_is_security_group.workload_vpc_workload_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "outbound"
  tcp {
    port_min = 80
    port_max = 80
  }
}

resource "ibm_is_security_group_rule" "workload_vpc_workload_vpe_sg_sg_rule_allow_ibm_tcp_443_outbound" {
  group     = ibm_is_security_group.workload_vpc_workload_vpe_sg_sg.id
  remote    = "161.26.0.0/16"
  direction = "outbound"
  tcp {
    port_min = 443
    port_max = 443
  }
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
});
