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
describe("store", () => {
  describe("resource_groups", () => {
    describe("resource_groups.init", () => {
      it("should initialize the resource groups", () => {
        let state = new newState();
        let expectedData = [
          {
            use_prefix: true,
            name: "service-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "workload-rg",
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
          "service-rg",
          "management-rg",
          "workload-rg",
          "default",
        ]);
      });
      it("should add and update a non-duplicate group using prefix", () => {
        rgState.resource_groups.create({ name: "default", use_prefix: true });
        assert.deepEqual(rgState.store.resourceGroups, [
          "service-rg",
          "management-rg",
          "workload-rg",
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
        rgState.resource_groups.delete({}, { data: { name: "service-rg" } });
        assert.deepEqual(
          rgState.store.resourceGroups,
          ["management-rg", "workload-rg"],
          "it should set resource groups"
        );
      });
      it("should delete a vpc resource group and update vpc to use the first resource group", () => {
        rgState.resource_groups.delete({}, { data: { name: "management-rg" } });
        assert.deepEqual(
          rgState.store.resourceGroups,
          ["service-rg", "workload-rg"],
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
        let expectedData = ["service-rg", "frog-rg", "workload-rg"];
        rgState.resource_groups.save(
          {
            name: "frog-rg",
            use_prefix: true,
          },
          {
            data: {
              name: "management-rg",
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
              name: "management-rg",
            },
          }
        );
        assert.deepEqual(rgState.store.json.resource_groups[1].name, "frog-rg");
      });
    });
  });
  describe("options", () => {
    describe("options.init", () => {
      it("should initialize options in json", () => {
        let state = new newState();
        let expectedData = {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"],
        };
        assert.deepEqual(
          state.store.json._options,
          expectedData,
          "it should have options initialized"
        );
      });
    });
    describe("options.save", () => {
      let oState;
      beforeEach(() => {
        oState = new newState();
      });
      it("should change the prefix when saved", () => {
        oState.options.save({ prefix: "test" }, { data: { prefix: "iac" } });
        assert.deepEqual(oState.store.json._options.prefix, "test");
      });
      it("should update tags when saved", () => {
        oState.options.save(
          { tags: ["new", "tags", "here"] },
          { data: { tags: ["hello", "world"] } }
        );
        assert.deepEqual(oState.store.json._options.tags, [
          "new",
          "tags",
          "here",
        ]);
      });
    });
  });
});
