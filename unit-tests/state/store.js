const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {slzStore} slz state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("resource_groups", () => {
  describe("resource_groups.init", () => {
    it("should initialize the resource groups", () => {
      let state = new newState();
      let expectedData = [
        {
          use_prefix: true,
          name: "slz-service-rg",
          use_data: false,
        },
        {
          use_prefix: true,
          name: "slz-management-rg",
          use_data: false,
        },
        {
          use_prefix: true,
          name: "slz-workload-rg",
          use_data: false,
        },
      ];
      assert.deepEqual(
        state.store.json.resource_groups,
        expectedData,
        "it should have resource groups initialized"
      );
    });
  });
  describe("resource_groups.create", () => {
    let rgState;
    beforeEach(() => {
      rgState = new newState();
    });
    it("should add and update a non-duplicate group", () => {
      rgState.resource_groups.create({ name: "default" });
      assert.deepEqual(rgState.store.resourceGroups, [
        "slz-service-rg",
        "slz-management-rg",
        "slz-workload-rg",
        "default",
      ]);
    });
    it("should add and update a non-duplicate group using prefix", () => {
      rgState.resource_groups.create({ name: "default", use_prefix: true });
      assert.deepEqual(rgState.store.resourceGroups, [
        "slz-service-rg",
        "slz-management-rg",
        "slz-workload-rg",
        "default",
      ]);
    });
  });
  describe("resource_groups.delete", () => {
    let rgState;
    beforeEach(() => {
      rgState = new newState();
    });
    it("should delete a group and update names", () => {
      rgState.resource_groups.delete({}, { data: { name: "slz-service-rg" } });
      assert.deepEqual(
        rgState.store.resourceGroups,
        ["slz-management-rg", "slz-workload-rg"],
        "it should set resource groups"
      );
    });
    it("should delete a vpc resource group and update vpc to use the first resource group", () => {
      rgState.resource_groups.delete(
        {},
        { data: { name: "slz-management-rg" } }
      );
      assert.deepEqual(
        rgState.store.resourceGroups,
        ["slz-service-rg", "slz-workload-rg"],
        "it should set resource groups"
      );
    });
  });
  describe("resource_groups.save", () => {
    let rgState;
    beforeEach(() => {
      rgState = new newState();
    });
    it("should change the name of a resource group in place", () => {
      let expectedData = ["slz-service-rg", "frog-rg", "slz-workload-rg"];
      rgState.resource_groups.save(
        {
          name: "frog-rg",
          use_prefix: true,
        },
        {
          data: {
            name: "slz-management-rg",
          },
        }
      );
      assert.deepEqual(
        rgState.store.resourceGroups,
        expectedData,
        "it should change the name"
      );
    });
    it("should change the name of a resource group in place and update vpcs when not use prefix", () => {
      rgState.store.json.resource_groups[1].use_prefix = false;
      rgState.resource_groups.save(
        { name: "frog-rg" },
        {
          data: {
            name: "slz-management-rg",
          },
        }
      );
      assert.deepEqual(rgState.store.json.resource_groups[1].name, "frog-rg");
    });
  });
});
