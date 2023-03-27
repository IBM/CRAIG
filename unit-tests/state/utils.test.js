const { assert } = require("chai");
const {
  formatNetworkingRule,
  updateNetworkingRule,
} = require("../../client/src/lib/state/utils");

describe("utils", () => {
  describe("formatNetworkingRule", () => {
    it("should delete extra fields when icmp", () => {
      let networkingRule = {
        acl: "management",
        vpc: "management",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        ruleProtocol: "icmp",
        rule: {
          port_max: 22,
          port_min: 22,
        },
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
      };
      formatNetworkingRule(networkingRule, { isSecurityGroup: false });
      let expectedData = {
        acl: "management",
        vpc: "management",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        ruleProtocol: "icmp",
        rule: {},
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
      };
      assert.deepEqual(networkingRule, expectedData, "they should be equal");
    });
    it("should delete showDeleteModal if exists", () => {
      let networkingRule = {
        acl: "management",
        vpc: "management",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        showDeleteModal: true,
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
      };
      formatNetworkingRule(networkingRule, { isSecurityGroup: false });
      let expectedData = {
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
      };
      assert.deepEqual(networkingRule, expectedData, "they should be equal");
    });
    it("should delete extra fields when protocol not all and is security group", () => {
      let networkingRule = {
        acl: "management",
        vpc: "management",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        ruleProtocol: "icmp",
        show: true,
        action: "allow",
        rule: {
          source_port_max: 22,
          source_port_min: 22,
        },
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
      };
      formatNetworkingRule(networkingRule, { isSecurityGroup: true }, true);
      let expectedData = {
        acl: "management",
        vpc: "management",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        ruleProtocol: "icmp",
        rule: {},
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
      };
      assert.deepEqual(networkingRule, expectedData, "they should be equal");
    });
  });
  describe("updateNetworkingRule", () => {
    it("should update a security group rule", () => {
      let data = {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        security_group: "management",
        vpc: "management",
        icmp: { type: null, code: null },
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
      };
      let networkRule = {
        name: "allow-all-outbound",
        allow: true,
        inbound: false,
        source: "10.0.0.0/8",
        destination: "0.0.0.0/0",
        ruleProtocol: "tcp",
        rule: { port_max: 8080, port_min: null },
      };
      let expectedData = {
        allow: true,
        destination: "0.0.0.0/0",
        inbound: false,
        name: "allow-all-outbound",
        source: "10.0.0.0/8",
        ruleProtocol: "tcp",
        rule: { port_max: 8080, port_min: null },
      };
      updateNetworkingRule(false, data, networkRule);
      assert.deepEqual(networkRule, expectedData, "it should be equal");
    });
    it("should update a security group rule with icmp and no values", () => {
      let data = {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        security_group: "management",
        vpc: "management",
        icmp: { type: null, code: null },
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
      };
      let networkRule = {
        name: "allow-all-outbound",
        allow: true,
        inbound: false,
        source: "10.0.0.0/8",
        destination: "0.0.0.0/0",
        ruleProtocol: "icmp",
        rule: { type: null, code: null },
      };
      let expectedData = {
        allow: true,
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "10.0.0.0/8",
        security_group: "management",
        vpc: "management",
        icmp: { type: 0, code: 0 },
        tcp: {
          port_min: null,
          port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
        },
      };
      updateNetworkingRule(false, data, networkRule);
      assert.deepEqual(data, expectedData, "it should be equal");
    });
    it("should update a security group rule with tcp and no values", () => {
      let data = {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        security_group: "management",
        vpc: "management",
        icmp: { type: null, code: null },
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
      };
      let networkRule = {
        name: "allow-all-outbound",
        allow: true,
        inbound: false,
        source: "10.0.0.0/8",
        destination: "0.0.0.0/0",
        ruleProtocol: "tcp",
        rule: {
          port_min: null,
          port_max: null,
        },
      };
      let expectedData = {
        allow: true,
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "10.0.0.0/8",
        security_group: "management",
        vpc: "management",
        icmp: { type: null, code: null },
        tcp: {
          port_min: 1,
          port_max: 65535,
        },
        udp: {
          port_min: null,
          port_max: null,
        },
      };
      updateNetworkingRule(false, data, networkRule);
      assert.deepEqual(data, expectedData, "it should be equal");
    });
  });
});
