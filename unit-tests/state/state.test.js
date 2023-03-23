const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { splat } = require("lazy-z");

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
});
