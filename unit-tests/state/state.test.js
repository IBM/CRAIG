const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { splat } = require("lazy-z");
const json = require("../data-files/craig-json.json");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("state util functions", () => {
  describe("toggleStoreValue", () => {
    it("should toggle a boolean store value", () => {
      let state = newState();
      state.toggleStoreValue("hideCodeMirror");
      assert.isTrue(state.store.hideCodeMirror, "it should toggle value");
    });
  });
  describe("addClusterRules", () => {
    it("should add rules and skip duplicate rules", () => {
      let state = newState();
      state.store.json.vpcs[0].acls[0].rules.push({
        name: "roks-create-worker-nodes-inbound",
      });
      state.addClusterRules("management", "management");
      assert.deepEqual(
        splat(state.store.json.vpcs[0].acls[0].rules, "name"),
        [
          "allow-ibm-inbound",
          "allow-all-network-inbound",
          "allow-all-outbound",
          "roks-create-worker-nodes-inbound",
          "roks-create-worker-nodes-outbound",
          "roks-nodes-to-service-inbound",
          "roks-nodes-to-service-outbound",
          "allow-app-incoming-traffic-requests",
          "allow-app-outgoing-traffic-requests",
          "allow-lb-incoming-traffic-requests",
          "allow-lb-outgoing-traffic-requests",
        ],
        "it should add non duplicate rules"
      );
    });
  });
  describe("copySecurityGroup", () => {
    it("should copy acl from one vpc to another", () => {
      let state = newState();
      state.store.json.vpcs[1].acls = [];
      state.copySecurityGroup("management-vpe", "workload");
      assert.deepEqual(
        splat(state.store.json.security_groups, "name")[3],
        "management-vpe-copy",
        "it should copy"
      );
    });
  });
  describe("copyNetworkAcl", () => {
    it("should copy acl from one vpc to another", () => {
      let state = newState();
      state.store.json.vpcs[1].acls = [];
      state.copyNetworkAcl("management", "management", "workload");
      assert.deepEqual(
        splat(state.store.json.vpcs[1].acls, "name"),
        ["management-copy"],
        "it should copy"
      );
    });
  });
  describe("copyRule", () => {
    it("should copy one rule from vpc to another", () => {
      let state = newState();
      state.store.json.vpcs[1].acls[0].rules = [];
      state.copyRule(
        "management",
        "management",
        "allow-all-outbound",
        "workload"
      );
      assert.deepEqual(
        splat(state.store.json.vpcs[1].acls[0].rules, "name"),
        ["allow-all-outbound"],
        "it should copy"
      );
    });
  });
  describe("copySgRule", () => {
    it("should copy one rule from sg to another", () => {
      let state = newState();
      state.store.json.security_groups[0].rules = [];
      state.copySgRule("workload-vpe", "allow-vpc-outbound", "management-vpe");
      assert.deepEqual(
        splat(state.store.json.security_groups[0].rules, "name"),
        ["allow-vpc-outbound"],
        "it should copy"
      );
    });
  });
  describe("getAllSubnets", () => {
    it("should get all subnets", () => {
      let expectedData = [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.10.0/24",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.10.0/24",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.10.0/24",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.20.0/24",
          name: "vpe-zone-1",
          resource_group: "management-rg",
          network_acl: "management",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.20.0/24",
          name: "vpe-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.20.0/24",
          name: "vpe-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.10.0/24",
          name: "vsi-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.10.0/24",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.10.0/24",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.20.0/24",
          name: "vpe-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.20.0/24",
          name: "vpe-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.20.0/24",
          name: "vpe-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
      ];
      let state = newState();
      let actualData = state.getAllSubnets();
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("hardSetJson", () => {
    it("should set JSON data if valid", () => {
      let state = newState();
      state.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      state.hardSetJson(json);
      assert.deepEqual(state.store.json, json, "it should set the store");
      assert.deepEqual(
        state.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should set JSON data if not valid but slz", () => {
      let state = newState();
      state.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      state.hardSetJson({}, true);
      assert.deepEqual(
        state.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpn", zones: 1 },
            { name: "vpe", zones: 3 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
  });
  describe("getAllRuleNames", () => {
    it("should return empty array if no params", () => {
      let state = newState();
      let actualData = state.getAllRuleNames();
      assert.deepEqual(actualData, [], "it should return an empty array");
    });
    it("should return the names of all rules in a security group when no source acl name", () => {
      let state = newState();
      let actualData = state.getAllRuleNames("management-vpe");
      let expectedData = [
        "allow-ibm-inbound",
        "allow-vpc-inbound",
        "allow-vpc-outbound",
        "allow-ibm-tcp-53-outbound",
        "allow-ibm-tcp-80-outbound",
        "allow-ibm-tcp-443-outbound",
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct rule names"
      );
    });
    it("should return the names of all rules in an acl when two params are passed", () => {
      let state = newState();
      let actualData = state.getAllRuleNames("management", "management");
      let expectedData = [
        "allow-ibm-inbound",
        "allow-all-network-inbound",
        "allow-all-outbound",
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct rule names"
      );
    });
  });
  describe("getAllOtherGroups", () => {
    it("should return empty array if rule source is null or empty string", () => {
      let state = newState();
      let actualData = state.getAllOtherGroups({ ruleSource: "" });
      assert.deepEqual(actualData, [], "it should return empty array");
    });
    it("should return all other acl names if rule source and isAclForm", () => {
      let state = newState();
      let actualData = state.getAllOtherGroups(
        { ruleSource: "management" },
        { isAclForm: true }
      );
      assert.deepEqual(
        actualData,
        ["workload"],
        "it should return empty array"
      );
    });
    it("should return all other security groups if rule source and not isAclForm", () => {
      let state = newState();
      let actualData = state.getAllOtherGroups(
        { ruleSource: "management-vpe" },
        { isAclForm: false }
      );
      assert.deepEqual(
        actualData,
        ["workload-vpe", "management-vsi"],
        "it should return empty array"
      );
    });
  });
});
