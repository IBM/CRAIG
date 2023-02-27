const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { contains } = require("lazy-z");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("vpn_gateways", () => {
  describe("vpn_gateways.init", () => {
    it("should initialize vpn for default patterns", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.json.vpn_gateways,
        [
          {
            name: "management-gateway",
            resource_group: "management-rg",
            subnet: "vpn-zone-1",
            vpc: "management",
          },
        ],
        "it should create vpn gateway"
      );
    });
  });
  describe("vpn_gatways.onStoreUpdate", () => {
    it("should remove subnet name and vpc name on deletion", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "management-rg",
          subnet: null,
          vpc: null,
        },
      ];
      state.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should update gateways"
      );
    });
    it("should remove unfound subnet name if vpc exists", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "management-rg",
          subnet: null,
          vpc: "management",
        },
      ];
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          subnet: {
            name: "vpn-zone-1",
          },
        }
      );
      console.log("deleted");
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should update gateways"
      );
    });
    it("should remove unfound resource groups", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: null,
          subnet: "vpn-zone-1",
          vpc: "management",
        },
      ];
      state.resource_groups.delete({}, { data: { name: "management-rg" } });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should update gateways"
      );
    });
  });
  describe("vpn_gateways.delete", () => {
    it("should delete a vpn gateway by name", () => {
      let state = new newState();
      state.vpn_gateways.delete({}, { data: { name: "management-gateway" } });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        [],
        "it should delete the gw"
      );
    });
  });
  describe("vpn_gateways.save", () => {
    it("should update a vpn gateway", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "todd",
          resource_group: "management-rg",
          subnet: "vpe-zone-1",
          vpc: "workload",
        },
      ];
      state.vpn_gateways.save(
        {
          name: "todd",
          vpc: "workload",
          subnet: "vpe-zone-1",
        },
        {
          data: {
            name: "management-gateway",
          },
        }
      );
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should change the gw"
      );
    });
    it("should update a vpn gateway with same name different everything else", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "workload-rg",
          subnet: "vpe-zone-1",
          vpc: "workload",
        },
      ];
      state.vpn_gateways.save(
        {
          name: "management-gateway",
          vpc: "workload",
          subnet: "vpe-zone-1",
          resource_group: "workload-rg",
        },
        {
          data: {
            name: "management-gateway",
          },
        }
      );
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should change the gw"
      );
    });
  });
  describe("vpn_gateways.create", () => {
    it("should add a new vpn gateway", () => {
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "management-rg",
          subnet: "vpn-zone-1",
          vpc: "management",
        },
        {
          name: "todd",
          resource_group: null,
          subnet: "vpn-zone-1",
          vpc: "management",
        },
      ];
      let state = new newState();
      state.vpn_gateways.create({
        name: "todd",
        subnet: "vpn-zone-1",
        vpc: "management",
      });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should add the gw"
      );
    });
  });
});
