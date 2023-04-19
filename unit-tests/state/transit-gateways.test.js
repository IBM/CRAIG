const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("transit_gateways", () => {
  describe("transit_gateways.init", () => {
    it("should initialize default transit gateway as an array", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "transit-gateway",
          resource_group: "service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "management",
            },
            {
              tgw: "transit-gateway",
              vpc: "workload",
            },
          ],
        },
      ];
      assert.deepEqual(
        state.store.json.transit_gateways,
        expectedData,
        "it should be equal"
      );
    });
  });
  describe("transit_gateways.onStoreUpdate", () => {
    it("should remove a connection when a vpc is deleted", () => {
      let state = new newState();
      state.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [{ tgw: "transit-gateway", vpc: "workload" }],
        "it should only have one connection"
      );
    });
    it("should not remove crn connections", () => {
      let state = new newState();
      state.store.json.transit_gateways[0].connections[0].crn = "crn";
      delete state.store.json.transit_gateways[0].connections[0].vpc;
      state.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [
          { tgw: "transit-gateway", crn: "crn" },
          { tgw: "transit-gateway", vpc: "workload" },
        ],
        "it should only have one connection"
      );
    });
    it("should set resource group to null if deleted", () => {
      let state = new newState();
      state.resource_groups.delete({}, { data: { name: "service-rg" } });
      assert.deepEqual(
        state.store.json.transit_gateways[0].resource_group,
        null,
        "it should be null"
      );
    });
  });
  describe("transit_gateways.create", () => {
    it("should create a new transit gateway", () => {
      let state = new newState();
      state.transit_gateways.create({
        name: "tg-test",
        resource_group: "management-rg",
        global: false,
        connections: [{ tg: "tg-test", vpc: "management" }],
      });
      let expectedData = {
        name: "tg-test",
        resource_group: "management-rg",
        global: false,
        connections: [{ tg: "tg-test", vpc: "management" }],
      };
      assert.deepEqual(
        state.store.json.transit_gateways[1],
        expectedData,
        "it should be second tg"
      );
    });
  });
  describe("transit_gateways.save", () => {
    it("should update transit gateway", () => {
      let state = new newState();
      state.transit_gateways.save(
        { name: "todd", resource_group: "management-rg" },
        { data: { name: "transit-gateway" } }
      );
      let expectedData = [
        {
          name: "todd",
          resource_group: "management-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "management",
            },
            {
              tgw: "transit-gateway",
              vpc: "workload",
            },
          ],
        },
      ];
      assert.deepEqual(
        state.store.json.transit_gateways,
        expectedData,
        "it should change name and rg"
      );
    });
  });
  describe("transit_gateways.delete", () => {
    it("should delete transit gateway", () => {
      let state = new newState();
      state.transit_gateways.delete({}, { data: { name: "transit-gateway" } });
      assert.deepEqual(
        state.store.json.transit_gateways,
        [],
        "it should be empty"
      );
    });
  });
});
