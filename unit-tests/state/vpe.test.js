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

describe("virtual_private_endpoints", () => {
  describe("virtual_private_endpoints.init", () => {
    it("should initialize with default vpe", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-cos",
          service: "cos",
          vpc: "management",
          resource_group: "management-rg",
          security_groups: ["management-vpe"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
        {
          name: "workload-cos",
          service: "cos",
          vpc: "workload",
          resource_group: "workload-rg",
          security_groups: ["workload-vpe"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
      ];
      assert.deepEqual(
        state.store.json.virtual_private_endpoints,
        expectedData,
        "it should return data"
      );
    });
  });
  describe("virtual_private_endpoints.onStoreUpdate", () => {
    it("should remove a vpc, its security groups and subnets after deletion", () => {
      let state = newState();
      let expectedData = {
        name: "management-cos",
        service: "cos",
        vpc: null,
        resource_group: "management-rg",
        security_groups: [],
        subnets: [],
      };
      state.store.json.vpcs.shift();
      state.update();
      assert.deepEqual(
        state.store.json.virtual_private_endpoints[0],
        expectedData,
        "it should return data"
      );
    });
    it("should remove subnets from a vpc after deletion", () => {
      let state = newState();
      let expectedData = {
        name: "management-cos",
        service: "cos",
        vpc: "management",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: [],
      };
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vpe-zone-1",
          },
        }
      );
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vpe-zone-2",
          },
        }
      );
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vpe-zone-3",
          },
        }
      );
      assert.deepEqual(
        state.store.json.virtual_private_endpoints[0],
        expectedData,
        "it should return data"
      );
    });
    it("should remove unfound resource groups", () => {
      let state = newState();
      let expectedData = [
        {
          name: "management-cos",
          service: "cos",
          vpc: "management",
          resource_group: null,
          security_groups: ["management-vpe"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
        {
          name: "workload-cos",
          service: "cos",
          vpc: "workload",
          resource_group: "workload-rg",
          security_groups: ["workload-vpe"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
      ];
      state.resource_groups.delete({}, { data: { name: "management-rg" } });
      assert.deepEqual(
        state.store.json.virtual_private_endpoints,
        expectedData,
        "it should return data"
      );
    });
    it("should remove unfound security groups", () => {
      let state = newState();
      let expectedData = [
        {
          name: "management-cos",
          service: "cos",
          vpc: "management",
          resource_group: "management-rg",
          security_groups: [],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
        {
          name: "workload-cos",
          service: "cos",
          vpc: "workload",
          resource_group: "workload-rg",
          security_groups: ["workload-vpe"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
      ];
      state.security_groups.delete({}, { data: { name: "management-vpe" } });
      assert.deepEqual(
        state.store.json.virtual_private_endpoints,
        expectedData,
        "it should have empty list for security groups"
      );
    });
  });
  describe("virtual_private_endpoints.delete", () => {
    it("should delete a vpe", () => {
      let state = newState();
      state.virtual_private_endpoints.delete(
        {},
        { data: { name: "management-cos" } }
      );
      assert.deepEqual(
        state.store.json.virtual_private_endpoints,
        [
          {
            name: "workload-cos",
            service: "cos",
            vpc: "workload",
            resource_group: "workload-rg",
            security_groups: ["workload-vpe"],
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
        ],
        "it should delete"
      );
    });
  });
  describe("virtual_private_endpoints.save", () => {
    it("should update a vpe", () => {
      let state = newState();
      let expectedData = [
        {
          name: "todd",
          service: "cos",
          vpc: "management",
          security_groups: ["management-vpe"],
          subnets: ["vpe-zone-1"],
          resource_group: "management-rg",
        },
        {
          name: "workload-cos",
          service: "cos",
          vpc: "workload",
          resource_group: "workload-rg",
          security_groups: ["workload-vpe"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
      ];
      state.virtual_private_endpoints.save(
        {
          name: "todd",
          service: "cos",
          vpc: "management",
          security_groups: ["management-vpe"],
          subnets: ["vpe-zone-1"],
          resource_group: "management-rg",
        },
        {
          data: {
            name: "management-cos",
          },
        }
      );
      assert.deepEqual(
        state.store.json.virtual_private_endpoints,
        expectedData,
        "it should return data"
      );
    });
  });
  describe("virtual_private_endpoints.create", () => {
    it("should create a vpe", () => {
      let state = newState();
      let expectedData = {
        name: "frog",
        service: "cos",
        vpc: "workload",
        security_groups: ["workload-vpe"],
        subnets: ["vpe-zone-1"],
        resource_group: "management-rg",
      };
      state.virtual_private_endpoints.create({
        name: "frog",
        service: "cos",
        vpc: "workload",
        security_groups: ["workload-vpe"],
        subnets: ["vpe-zone-1"],
        resource_group: "management-rg",
      });
      assert.deepEqual(
        state.store.json.virtual_private_endpoints[2],
        expectedData,
        "it should return data"
      );
    });
  });
});
