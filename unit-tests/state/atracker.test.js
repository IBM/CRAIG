const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const craig = state();
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
  describe("atracker.schema", () => {
    it("should return correct name on render", () => {
      assert.deepEqual(
        craig.atracker.name.onRender(
          {},
          {
            craig: craig,
          }
        ),
        "iac-atracker",
        "it should return correct text"
      );
    });
    it("should hide cos bucket when atracker is disabled", () => {
      assert.isTrue(craig.atracker.bucket.hideWhen({ enabled: false }));
    });
    it("should hide plan when atracker instance is false", () => {
      assert.isTrue(
        craig.atracker.plan.hideWhen({ enabled: true, instance: false })
      );
    });
    it("should return the correct cos buckets", () => {
      assert.deepEqual(
        newState().atracker.bucket.groups({}, { craig: newState() }),
        ["atracker-bucket", "management-bucket", "workload-bucket"],
        "it should return list of cos buckets"
      );
    });
    it("should return the correct resource groups", () => {
      assert.deepEqual(
        newState().atracker.resource_group.groups({}, { craig: newState() }),
        ["service-rg", "management-rg", "workload-rg"],
        "it should return list of resource groups"
      );
    });
    it("should return the correct cos keys", () => {
      assert.deepEqual(
        newState().atracker.cos_key.groups({}, { craig: newState() }),
        ["cos-bind-key"],
        "it should return list of cos keys"
      );
    });
  });
});
