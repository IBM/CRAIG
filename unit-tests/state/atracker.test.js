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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("atracker.init", () => {
    it("should have default atracker", () => {
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
        craig.store.json.atracker,
        expectedData,
        "it should have atracker",
      );
    });
  });
  describe("atracker.onStoreUpdate", () => {
    it("should set cos_key to null if deleted", () => {
      craig.object_storage.keys.delete(
        {},
        { arrayParentName: "atracker-cos", data: { name: "cos-bind-key" } },
      );
      assert.deepEqual(
        craig.store.json.atracker.cos_key,
        null,
        "it should be null",
      );
    });
  });
  describe("atracker.save", () => {
    it("should update atracker info", () => {
      // create key
      craig.object_storage.keys.create(
        {
          name: "frog",
        },
        {
          innerFormProps: {
            arrayParentName: "cos",
            arrayData: craig.store.json.object_storage[0].keys,
          },
        },
      );
      // save with different key
      craig.atracker.save({
        bucket: "management-bucket",
        add_route: false,
        cos_key: "frog",
      });
      assert.deepEqual(
        craig.store.json.atracker.cos_key,
        "frog",
        "it should update",
      );
    });
    it("should update atracker target name when saving new bucket in different cos instance", () => {
      craig.store.json.object_storage.push({
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
      craig.atracker.save({
        bucket: "test-atracker-bucket",
        add_route: false,
        cos_key: "frog",
      });
      assert.deepEqual(
        craig.store.json.atracker.target_name,
        "atracker",
        "it should set target name",
      );
    });
  });
  describe("atracker.schema", () => {
    it("should return correct groups for region", () => {
      assert.deepEqual(
        craig.atracker.locations.groups({}, { craig: craig }),
        ["global", "us-south"],
        "it should return correct groups",
      );
      assert.deepEqual(
        craig.atracker.locations.groups({}, {}),
        ["global", ""],
        "it should return correct groups",
      );
    });

    it("should return correct name on render", () => {
      assert.deepEqual(
        craig.atracker.name.onRender(
          {},
          {
            craig: craig,
          },
        ),
        "iac-us-south-atracker",
        "it should return correct text",
      );
    });
    it("should hide cos bucket when atracker is disabled", () => {
      assert.isTrue(craig.atracker.bucket.hideWhen({ enabled: false }));
    });
    it("should hide plan when atracker instance is false", () => {
      assert.isTrue(
        craig.atracker.plan.hideWhen({ enabled: true, instance: false }),
      );
    });
    it("should return the correct cos buckets", () => {
      assert.deepEqual(
        craig.atracker.bucket.groups({}, { craig: craig }),
        ["atracker-bucket", "management-bucket", "workload-bucket"],
        "it should return list of cos buckets",
      );
    });
    it("should return the correct resource groups", () => {
      assert.deepEqual(
        craig.atracker.resource_group.groups({}, { craig: craig }),
        ["service-rg", "management-rg", "workload-rg"],
        "it should return list of resource groups",
      );
    });
    it("should have an invalid resource group if instance and enabled", () => {
      assert.isTrue(
        craig.atracker.resource_group.invalid(
          {
            instance: true,
            enabled: true,
          },
          { craig: craig },
        ),
        "it should return list of resource groups",
      );
    });
    it("should have an invalid plan if instance and enabled", () => {
      assert.isTrue(
        craig.atracker.plan.invalid(
          {
            instance: true,
            enabled: true,
          },
          { craig: craig },
        ),
        "it should return list of resource groups",
      );
    });
    it("should return the correct cos keys", () => {
      assert.deepEqual(
        craig.atracker.cos_key.groups({}, { craig: craig }),
        ["cos-bind-key"],
        "it should return list of cos keys",
      );
    });
    describe("invalidText", () => {
      it("should return invalid text for resource group", () => {
        assert.deepEqual(
          craig.atracker.resource_group.invalidText(),
          "Select a Resource Group",
          "it should return text",
        );
      });
      it("should return invalid text for bucket", () => {
        assert.deepEqual(
          craig.atracker.bucket.invalidText(),
          "Select an Object Storage bucket.",
          "it should return text",
        );
      });
      it("should return invalid text for cos_key", () => {
        assert.deepEqual(
          craig.atracker.cos_key.invalidText(),
          "Select an Object Storage key.",
          "it should return text",
        );
      });
      it("should return invalid text for locations", () => {
        assert.deepEqual(
          craig.atracker.locations.invalidText(),
          "Select at least one location.",
          "it should return text",
        );
      });
      it("should return invalid text for plan", () => {
        assert.deepEqual(
          craig.atracker.plan.invalidText(),
          "Select a plan.",
          "it should return text",
        );
      });
    });
  });
  describe("appid.shouldDisableSave", () => {
    it("should return false if atracker is not enabled", () => {
      assert.isFalse(
        craig.atracker.shouldDisableSave(
          {
            enabled: false,
          },
          {
            craig: craig,
          },
        ),
        "it should be false",
      );
    });
  });
});
