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
});
