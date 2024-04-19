const { assert } = require("chai");
const {
  formatNetworkingRule,
  updateNetworkingRule,
  isRangeInvalid,
  cbrTitleCase,
  cbrSaveType,
  powerAffinityInvalid,
  invalidTagList,
  timeToLive,
  powerStoragePoolSelect,
  powerAntiAffinityInstance,
  powerAntiAffinityVolume,
  powerAffinityVolume,
  powerAffinityInstance,
  powerVsStorageOptions,
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
    it("should delete extra fields when icmp and new rule style", () => {
      let networkingRule = {
        acl: "management",
        vpc: "management",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        ruleProtocol: "icmp",
        port_max: 22,
        port_min: 22,
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
        icmp: { type: "null", code: "null" },
        tcp: {
          port_min: null,
          port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
        },
        ruleProtocol: "icmp",
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
        ruleProtocol: "tcp",
      };
      updateNetworkingRule(false, data, networkRule);
      assert.deepEqual(data, expectedData, "it should be equal");
    });
  });
  // describe("nameHelperText", () => {
  //   it("should return correct helper text when use data", () => {
  //     assert.deepEqual(
  //       nameHelperText(
  //         { use_data: true, name: "tgw" },
  //         {
  //           craig: {
  //             store: {
  //               json: {},
  //             },
  //           },
  //         }
  //       ),
  //       "tgw",
  //       "it should return name"
  //     );
  //   });
  //   it("should return correct helper text when use data and name is null", () => {
  //     assert.deepEqual(
  //       nameHelperText(
  //         { use_data: true, name: null },
  //         {
  //           craig: {
  //             store: {
  //               json: {},
  //             },
  //           },
  //         }
  //       ),
  //       "",
  //       "it should return name"
  //     );
  //   });
  // });

  describe("isRangeInvalid", () => {
    it("should return false if range is valid", () => {
      assert.isFalse(isRangeInvalid(5, 1, 10));
    });
    it("should return false if value is empty", () => {
      assert.isFalse(isRangeInvalid("", 1, 10));
    });
    it("should return true if value is not in range", () => {
      assert.isTrue(isRangeInvalid(20, 1, 10));
    });
  });
  describe("cbrTitleCase", () => {
    it("should return correct titleCase formatting for ip address", () => {
      assert.deepEqual(
        cbrTitleCase("type")({ type: "Ipaddress" }),
        "IP Address"
      );
    });
    it("should return correct titleCase formatting for ip range", () => {
      assert.deepEqual(cbrTitleCase("type")({ type: "Ip Range" }), "IP Range");
    });
    it("should return correct titleCase formatting for service ref", () => {
      assert.deepEqual(
        cbrTitleCase("type")({ type: "Serviceref" }),
        "Service Ref"
      );
    });
    it("should return correct titleCase for empty string", () => {
      assert.deepEqual(cbrTitleCase("type")({ type: "" }), "");
    });
  });
  describe("cbrSaveType", () => {
    it("should return correctly formatted cbr type to store in JSON", () => {
      assert.deepEqual(cbrSaveType("type")({ type: "IP Range" }), "ipRange");
    });
    it("should return correctly formatted cbr type to store in JSON", () => {
      assert.deepEqual(
        cbrSaveType("type")({ type: "IP Address" }),
        "ipAddress"
      );
    });
    it("should return correctly formatted cbr type to store in JSON", () => {
      assert.deepEqual(cbrSaveType("type")({ type: "Subnet" }), "subnet");
    });
    it("should return correctly formatted cbr type to store in JSON", () => {
      assert.deepEqual(cbrSaveType("type")({ type: "Vpc" }), "vpc");
    });
    it("should return correctly formatted cbr type to store in JSON", () => {
      assert.deepEqual(cbrSaveType("type")({ type: "" }), "");
    });
    it("should return correctly formatted cbr type to store in JSON", () => {
      assert.deepEqual(
        cbrSaveType("type")({ type: "Service Ref" }),
        "serviceRef"
      );
    });
  });
  describe("powerAffinityInvalid", () => {
    it("should be true if state data option is option and no affinity type", () => {
      assert.isTrue(
        powerAffinityInvalid({ storage_option: "good" }, "good"),
        "it should be true"
      );
    });
    it("should be false if everything matches and field is not null", () => {
      assert.isFalse(
        powerAffinityInvalid(
          { storage_option: "good", affinity_type: "good" },
          "good",
          "good",
          "good"
        ),
        "it should be false"
      );
    });
  });
  describe("invalidTagList", () => {
    it("should return true when invalid tag list", () => {
      assert.isTrue(invalidTagList(["hi", "2@@@2"]));
    });
    it("should return false when no tags", () => {
      assert.isFalse(invalidTagList([]));
    });
  });
  describe("invalidTagList", () => {
    it("should return true when invalid tag list", () => {
      assert.isTrue(invalidTagList(["hi", "2@@@2"]));
    });
    it("should return false when no tags", () => {
      assert.isFalse(invalidTagList([]));
    });
  });
  describe("timeToLive", () => {
    it("should not be invalid when no value is provided", () => {
      let ttl = timeToLive();
      assert.isFalse(ttl.invalid({}), "it should be valid");
    });
  });
  describe("powerStoragePoolSelect", () => {
    it("should be invalid when storage option is storage pool and field is invalid", () => {
      assert.isTrue(
        powerStoragePoolSelect().invalid({ storage_option: "Storage Pool" }),
        "it should be invalid"
      );
    });
  });
  describe("powerAntiAffinityInstance", () => {
    it("should be invalid when no instance selected", () => {
      assert.isTrue(
        powerAntiAffinityInstance().invalid({
          pi_anti_affinity_instance: "",
          storage_option: "Anti-Affinity",
        }),
        "it should be invalid"
      );
    });
  });
  describe("powerAntiAffinityVolume", () => {
    it("should be invalid when no instance selected", () => {
      assert.isTrue(
        powerAntiAffinityVolume().invalid({
          pi_anti_affinity_volume: "",
          storage_option: "Anti-Affinity",
        }),
        "it should be invalid"
      );
    });
  });
  describe("powerAffinityInstance", () => {
    it("should be invalid when no instance selected", () => {
      assert.isTrue(
        powerAffinityInstance().invalid({
          pi_affinity_instance: "",
          storage_option: "Affinity",
        }),
        "it should be invalid"
      );
    });
  });
  describe("powerAffinityVolume", () => {
    it("should be invalid when no instance selected", () => {
      assert.isTrue(
        powerAffinityVolume().invalid({
          pi_affinity_volume: "",
          storage_option: "Affinity",
        }),
        "it should be invalid"
      );
    });
  });
  describe("powerVsStorageOptions", () => {
    it("should handle invalid cases", () => {
      assert.isTrue(
        powerVsStorageOptions().invalid({ storage_option: "Storage Pool" }),
        "it should be invalid"
      );
    });
  });
});
