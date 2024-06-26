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
const oneZoneEdgeVpnAndWaf = edgeDefaults["1-zone-vpn-and-waf"];
const threeZoneEdgeVpnAndWaf = edgeDefaults["3-zone-vpn-and-waf"];
const managementEdgeVpnAndWaf = edgeDefaults["management-vpn-and-waf"];
const defaultEdgeFullTunnel = edgeDefaults["full-tunnel"];
const defaultEdgeWaf = edgeDefaults["waf"];

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state(true);
  store.setUpdateCallback(() => {});
  return store;
}

describe("edge network", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("createEdgeVpc", () => {
    it("should create the default vpn and waf edge vpc and security groups", () => {
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("vpn-and-waf", false, 3);
      assert.deepEqual(
        craig.store.json.vpcs[0],
        defaultEdgeVpnAndWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        craig.store.json.security_groups,
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
    it("should create the default vpn and waf edge vpc and security groups with one zone", () => {
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("vpn-and-waf", false, 1);
      assert.deepEqual(
        craig.store.json.vpcs[0],
        oneZoneEdgeVpnAndWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        craig.store.json.security_groups,
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
    it("should increase from one zone to three zones", () => {
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("vpn-and-waf", false, 1);
      craig.createEdgeVpc("vpn-and-waf", false, 3);
      assert.deepEqual(
        craig.store.json.vpcs[0],
        threeZoneEdgeVpnAndWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        craig.store.json.security_groups,
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
    it("should decrease from three zones to one zone", () => {
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("vpn-and-waf", false, 3);
      craig.createEdgeVpc("vpn-and-waf", false, 1);
      assert.deepEqual(
        craig.store.json.vpcs[0],
        oneZoneEdgeVpnAndWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        craig.store.json.security_groups,
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
    it("should not create any new resource when create edge network is run when an edge network exists", () => {
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("vpn-and-waf", false, 3);
      craig.createEdgeVpc("vpn-and-waf", false, 3);
      assert.deepEqual(
        craig.store.json.vpcs[0],
        defaultEdgeVpnAndWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        craig.store.json.security_groups,
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
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("full-tunnel", false, 3);
      assert.deepEqual(
        craig.store.json.vpcs[0],
        defaultEdgeFullTunnel,
        "it should return correct vpc"
      );
      assert.deepEqual(
        craig.store.json.security_groups,
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
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("waf", false, 3);
      craig.update();
      assert.deepEqual(
        craig.store.json.vpcs[0],
        defaultEdgeWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        craig.store.json.security_groups,
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
      craig.store.json._options.dynamic_subnets = false;
      craig.createEdgeVpc("vpn-and-waf", true, 3);
      assert.deepEqual(
        craig.store.json.vpcs[0],
        managementEdgeVpnAndWaf,
        "it should return correct vpc"
      );
    });
  });
});
