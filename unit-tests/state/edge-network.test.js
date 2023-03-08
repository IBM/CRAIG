const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const {
  newF5ManagementSg,
  newF5ExternalSg,
  newF5WorkloadSg,
  newF5BastionSg,
  newF5VpeSg,
  defaultSecurityGroups,
} = require("../../client/src/lib/state/defaults");
const edgeDefaults = require("../data-files/f5-config.json");
const defaultEdgeVpnAndWaf = edgeDefaults["vpn-and-waf"];
const managementEdgeVpnAndWaf = edgeDefaults["management-vpn-and-waf"];
const defaultEdgeFullTunnel = edgeDefaults["full-tunnel"];
const defaultEdgeWaf = edgeDefaults["waf"];

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("edge network", () => {
  describe("createEdgeVpc", () => {
    it("should create the default vpn and waf edge vpc and security groups", () => {
      let state = new newState();
      state.setUpdateCallback(() => {});
      state.createEdgeVpc("vpn-and-waf");
      assert.deepEqual(
        state.store.json.vpcs[0],
        defaultEdgeVpnAndWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        state.store.json.security_groups,
        [
          newF5ManagementSg(),
          newF5ExternalSg(),
          newF5WorkloadSg(),
          newF5BastionSg(),
          newF5VpeSg(),
        ].concat(defaultSecurityGroups()),
        "it should have the correct security groups"
      );
    });
    it("should create the default full-tunnel edge vpc and security groups", () => {
      let state = new newState();
      state.setUpdateCallback(() => {});
      state.createEdgeVpc("full-tunnel");
      assert.deepEqual(
        state.store.json.vpcs[0],
        defaultEdgeFullTunnel,
        "it should return correct vpc"
      );
      assert.deepEqual(
        state.store.json.security_groups,
        [
          newF5ManagementSg(),
          newF5ExternalSg(),
          newF5BastionSg(),
          newF5VpeSg(),
        ].concat(defaultSecurityGroups()),
        "it should have the correct security groups"
      );
    });
    it("should create the default waf edge vpc and security groups", () => {
      let state = new newState();
      state.setUpdateCallback(() => {});
      state.createEdgeVpc("waf");
      assert.deepEqual(
        state.store.json.vpcs[0],
        defaultEdgeWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        state.store.json.security_groups,
        [
          newF5ManagementSg(),
          newF5ExternalSg(),
          newF5WorkloadSg(),
          newF5VpeSg(),
        ].concat(defaultSecurityGroups()),
        "it should have the correct security groups"
      );
    });
    it("should create the default vpn and waf edge vpc on management", () => {
      let state = new newState();
      state.setUpdateCallback(() => {});
      state.createEdgeVpc("vpn-and-waf", true);
      assert.deepEqual(
        state.store.json.vpcs[0],
        managementEdgeVpnAndWaf,
        "it should return correct vpc"
      );
    });
  });
});
