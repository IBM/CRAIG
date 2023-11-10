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

describe("atracker", () => {
  describe("atracker.init", () => {
    it("should have default atracker", () => {
      let state = new newState();
      let expectedData = {
        enabled: true,
        type: "cos",
        name: "atracker",
        target_name: "atracker-cos",
        bucket: "atracker-bucket",
        add_route: true,
        cos_key: "cos-bind-key",
        locations: ["global", "us-south"],
      };
      assert.deepEqual(
        state.store.json.atracker,
        expectedData,
        "it should have atracker"
      );
    });
  });
  describe("atracker.onStoreUpdate", () => {
    it("should set cos_key to null if deleted", () => {
      let state = new newState();
      state.object_storage.keys.delete(
        {},
        { arrayParentName: "atracker-cos", data: { name: "cos-bind-key" } }
      );
      assert.deepEqual(
        state.store.json.atracker.cos_key,
        null,
        "it should be null"
      );
    });
  });
  describe("atracker.save", () => {
    it("should update atracker info", () => {
      let state = new newState();
      // create key
      state.object_storage.keys.create(
        {
          name: "frog",
        },
        {
          innerFormProps: {
            arrayParentName: "cos",
            arrayData: state.store.json.object_storage[0].keys,
          },
        }
      );
      // save with different key
      state.atracker.save({
        bucket: "management-bucket",
        add_route: false,
        cos_key: "frog",
      });
      let expectedData = {
        enabled: true,
        type: "cos",
        name: "atracker",
        target_name: "cos",
        bucket: "management-bucket",
        add_route: false,
        cos_key: "frog",
        locations: ["global", "us-south"],
      };
      assert.deepEqual(
        state.store.json.atracker,
        expectedData,
        "it should update"
      );
    });
    it("should update atracker target name when saving new bucket in different cos instance", () => {
      let state = new newState();
      state.store.json.object_storage.push({
        name: "atracker",
        use_data: false,
        resource_group: "service-rg",
        plan: "standard",
        use_random_suffix: true,
        kms: "kms",
        buckets: [
          {
            force_delete: false,
            name: "test-atracker-bucket",
            storage_class: "standard",
            kms_key: "atracker",
            endpoint: "public",
            use_random_suffix: true,
          },
        ],
        keys: [
          {
            name: "atracker-key",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ],
      });
      state.atracker.save({
        bucket: "test-atracker-bucket",
        add_route: false,
        cos_key: "frog",
      });
      assert.deepEqual(
        state.store.json.atracker.target_name,
        "atracker",
        "it should set target name"
      );
    });
  });
});
