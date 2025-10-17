const { assert } = require("chai");
const {
  formatClassicSg,
  formatClassicSgRule,
  classicSecurityGroupTf,
} = require("../../client/src/lib");

describe("classic security group", () => {
  describe("formatClassicSgRule", () => {
    it("should return the correct data for a classic security group rule", () => {
      let actualData = formatClassicSgRule({
        ruleProtocol: "icmp",
        direction: "inbound",
        port_range_min: "8080",
        port_range_max: "8080",
        classic_sg: "classic-sg",
        name: "allow-8080",
      });
      let expectedData = `
resource "ibm_security_group_rule" "classic_security_group_classic_sg_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg.id
  direction         = "ingress"
  port_range_min    = 8080
  port_range_max    = 8080
  protocol          = "icmp"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform",
      );
    });
    it("should return the correct data for a classic security group rule with all protocol", () => {
      let actualData = formatClassicSgRule({
        ruleProtocol: "all",
        direction: "inbound",
        port_range_min: "8080",
        port_range_max: "8080",
        classic_sg: "classic-sg",
        name: "allow-8080",
      });
      let expectedData = `
resource "ibm_security_group_rule" "classic_security_group_classic_sg_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg.id
  direction         = "ingress"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform",
      );
    });
    it("should return the correct data for a classic security group rule with no port range or rule protocol", () => {
      let actualData = formatClassicSgRule({
        ruleProtocol: null,
        direction: "outbound",
        port_range_min: null,
        port_range_max: null,
        classic_sg: "classic-sg",
        name: "allow-8080",
      });
      let expectedData = `
resource "ibm_security_group_rule" "classic_security_group_classic_sg_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg.id
  direction         = "egress"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform",
      );
    });
  });
  describe("formatClassicSg", () => {
    it("should return the correct security group", () => {
      let actualData = formatClassicSg({
        name: "classic-sg",
        description: "optional",
        classic_sg_rules: [
          {
            ruleProtocol: null,
            direction: "outbound",
            port_range_min: null,
            port_range_max: null,
            classic_sg: "classic-sg",
            name: "allow-8080",
          },
          {
            ruleProtocol: "icmp",
            direction: "inbound",
            port_range_min: "8080",
            port_range_max: "8080",
            classic_sg: "classic-sg",
            name: "allow-8080",
          },
        ],
      });
      let expectedData = `##############################################################################
# Classic Sg Classic Security Group
##############################################################################

resource "ibm_security_group" "classic_security_group_classic_sg" {
  name        = "\${var.prefix}-classic-sg"
  description = "optional"
}

resource "ibm_security_group_rule" "classic_security_group_classic_sg_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg.id
  direction         = "egress"
}

resource "ibm_security_group_rule" "classic_security_group_classic_sg_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg.id
  direction         = "ingress"
  port_range_min    = 8080
  port_range_max    = 8080
  protocol          = "icmp"
}

##############################################################################
`;
      assert.deepEqual(actualData, expectedData, "it should return correct tf");
    });
  });
  describe("classicSecurityGroupTf", () => {
    it("should return the correct terraform file", () => {
      let actualData = classicSecurityGroupTf({
        classic_security_groups: [
          {
            name: "classic-sg",
            description: "optional",
            classic_sg_rules: [
              {
                ruleProtocol: null,
                direction: "outbound",
                port_range_min: null,
                port_range_max: null,
                classic_sg: "classic-sg",
                name: "allow-8080",
              },
              {
                ruleProtocol: "icmp",
                direction: "inbound",
                port_range_min: "8080",
                port_range_max: "8080",
                classic_sg: "classic-sg",
                name: "allow-8080",
              },
            ],
          },
          {
            name: "classic-sg2",
            description: "optional",
            classic_sg_rules: [
              {
                ruleProtocol: null,
                direction: "outbound",
                port_range_min: null,
                port_range_max: null,
                classic_sg: "classic-sg2",
                name: "allow-8080",
              },
              {
                ruleProtocol: "icmp",
                direction: "inbound",
                port_range_min: "8080",
                port_range_max: "8080",
                classic_sg: "classic-sg2",
                name: "allow-8080",
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Classic Sg Classic Security Group
##############################################################################

resource "ibm_security_group" "classic_security_group_classic_sg" {
  name        = "\${var.prefix}-classic-sg"
  description = "optional"
}

resource "ibm_security_group_rule" "classic_security_group_classic_sg_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg.id
  direction         = "egress"
}

resource "ibm_security_group_rule" "classic_security_group_classic_sg_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg.id
  direction         = "ingress"
  port_range_min    = 8080
  port_range_max    = 8080
  protocol          = "icmp"
}

##############################################################################

##############################################################################
# Classic Sg 2 Classic Security Group
##############################################################################

resource "ibm_security_group" "classic_security_group_classic_sg2" {
  name        = "\${var.prefix}-classic-sg2"
  description = "optional"
}

resource "ibm_security_group_rule" "classic_security_group_classic_sg2_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg2.id
  direction         = "egress"
}

resource "ibm_security_group_rule" "classic_security_group_classic_sg2_rule_allow_8080" {
  security_group_id = ibm_security_group.classic_security_group_classic_sg2.id
  direction         = "ingress"
  port_range_min    = 8080
  port_range_max    = 8080
  protocol          = "icmp"
}

##############################################################################
`;
      assert.deepEqual(actualData, expectedData, "it should return correct tf");
    });
  });
});
