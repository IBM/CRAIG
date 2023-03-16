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

describe("object_storage", () => {
  describe("object_storage.init", () => {
    it("should initialize the object storage instances", () => {
      let state = new newState();
      let expectedData = [
        {
          buckets: [
            {
              endpoint: "public",
              force_delete: true,
              kms_key: "atracker-key",
              name: "atracker-bucket",
              storage_class: "standard",
              use_random_suffix: true,
            },
          ],
          keys: [
            {
              name: "cos-bind-key",
              role: "Writer",
              enable_hmac: false,
              use_random_suffix: true,
            },
          ],
          name: "atracker-cos",
          plan: "standard",
          resource_group: "service-rg",
          use_data: false,
          use_random_suffix: true,
          kms: "kms",
        },
        {
          buckets: [
            {
              endpoint: "public",
              force_delete: true,
              kms_key: "key",
              name: "management-bucket",
              storage_class: "standard",
              use_random_suffix: true,
            },
            {
              endpoint: "public",
              force_delete: true,
              kms_key: "key",
              name: "workload-bucket",
              storage_class: "standard",
              use_random_suffix: true,
            },
          ],
          use_random_suffix: true,
          keys: [],
          name: "cos",
          plan: "standard",
          resource_group: "service-rg",
          use_data: false,
          kms: "kms",
        },
      ];
      assert.deepEqual(
        state.store.json.object_storage,
        expectedData,
        "it should have cos"
      );
    });
  });
  describe("object_storage.create", () => {
    it("should create a new cos instance", () => {
      let state = new newState();
      state.object_storage.create({
        name: "todd",
        use_data: false,
        resource_group: "default",
        plan: "standard",
        use_random_suffix: true,
      });
      let expectedData = {
        name: "todd",
        use_data: false,
        resource_group: null,
        plan: "standard",
        use_random_suffix: true,
        keys: [],
        buckets: [],
      };
      assert.deepEqual(
        state.store.json.object_storage[2],
        expectedData,
        "it should create new cos"
      );
    });
  });
  describe("object_storage.save", () => {
    it("should update a cos instance in place", () => {
      let state = new newState();
      state.object_storage.save({ name: "todd" }, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.object_storage[1].name,
        "todd",
        "it should create new cos"
      );
    });
    it("should update a cos instance in place with same name", () => {
      let state = new newState();
      state.object_storage.save({ name: "cos" }, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.object_storage[1].name,
        "cos",
        "it should create new cos"
      );
    });
  });
  describe("object_storage.delete", () => {
    it("should delete a cos instance", () => {
      let state = new newState();
      state.object_storage.delete({}, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.object_storage.length,
        1,
        "it should create new cos"
      );
    });
  });
  describe("object_storage.onStoreUpdate", () => {
    it("should create a list of storage buckets", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.cosBuckets,
        ["atracker-bucket", "management-bucket", "workload-bucket"],
        "it should have all the buckets"
      );
    });
    it("should create a list of storage keys", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.cosKeys,
        ["cos-bind-key"],
        "it should have all the keys"
      );
    });
    it("should remove unfound kms key from buckets after deletion", () => {
      let state = new newState();
      state.key_management.keys.delete(
        {},
        { arrayParentName: "kms", data: { name: "atracker-key" } }
      );
      state.update();
      assert.deepEqual(
        state.store.json.object_storage[0].buckets[0].kms_key,
        null,
        "it should have all the keys"
      );
    });
  });
  describe("object_storage.buckets", () => {
    describe("object_storage.buckets.create", () => {
      it("should create a bucket in a specified instance", () => {
        let state = new newState();

        state.object_storage.buckets.create(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "todd",
            storage_class: "standard",
            showBucket: true,
          },
          {
            innerFormProps: { arrayParentName: "atracker-cos" },
            arrayData: state.store.json.object_storage[0].buckets,
          }
        );
        let expectedData = {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "todd",
          storage_class: "standard",
          use_random_suffix: true,
        };
        assert.deepEqual(
          state.store.json.object_storage[0].buckets[1],
          expectedData,
          "it should make new bucket"
        );
      });
    });

    describe("object_storage.buckets.save", () => {
      it("should update a bucket in a specified instance", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.object_storage.buckets.save(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "todd",
            storage_class: "standard",
          },
          {
            arrayParentName: "cos",
            data: { name: "management-bucket" },
          }
        );
        let expectedData = {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "todd",
          storage_class: "standard",
          use_random_suffix: true,
        };
        assert.deepEqual(
          state.store.json.object_storage[1].buckets[0],
          expectedData,
          "it should make new bucket"
        );
      });
      it("should update a atracker collector bucket name when bucket changed", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.object_storage.buckets.save(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "todd",
            storage_class: "standard",
          },
          {
            arrayParentName: "atracker-cos",
            data: { name: "atracker-bucket" },
          }
        );
        assert.deepEqual(
          state.store.json.atracker.collector_bucket_name,
          "todd",
          "it should be todd"
        );
      });
      it("should update a bucket in a specified instance with same name", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-key",
        };
        state.object_storage.buckets.save(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "management-bucket",
            storage_class: "standard",
          },
          {
            arrayParentName: "cos",
            data: { name: "management-bucket" },
          }
        );
        let expectedData = {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "management-bucket",
          storage_class: "standard",
          use_random_suffix: true,
        };
        assert.deepEqual(
          state.store.json.object_storage[1].buckets[0],
          expectedData,
          "it should make new bucket"
        );
      });
    });
    describe("object_storage.buckets.delete", () => {
      it("should delete bucket", () => {
        let state = new newState();
        state.object_storage.buckets.delete(
          {},
          { arrayParentName: "cos", data: { name: "management-bucket" } }
        );
        assert.deepEqual(
          state.store.json.object_storage[1].buckets.length,
          1,
          "should delete bucket"
        );
      });
    });
  });
  describe("object_storage.keys", () => {
    describe("object_storage.keys.create", () => {
      it("should create a new cos key in a specified instance", () => {
        let state = new newState();
        state.object_storage.keys.create(
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
          },
          {
            innerFormProps: { arrayParentName: "cos" },
            arrayData: state.store.json.object_storage[1].keys,
          }
        );
        assert.deepEqual(state.store.json.object_storage[1].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
      });
    });

    describe("object_storage.keys.save", () => {
      it("should update a cos key in a specified instance", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.store.json.atracker.cos_key = "cos-bind-key";
        state.object_storage.keys.save(
          { name: "todd" },
          { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
        );
        assert.deepEqual(state.store.json.object_storage[0].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
        assert.deepEqual(
          state.store.json.atracker.cos_key,
          "todd",
          "it should be todd"
        );
      });
      it("should update a cos key not atracker", () => {
        let state = new newState();

        state.object_storage.keys.create(
          {
            name: "boo",
            role: "Writer",
            enable_hmac: false,
          },
          {
            innerFormProps: { arrayParentName: "cos" },
            arrayData: state.store.json.object_storage[1].keys,
          }
        );
        state.object_storage.keys.save(
          { name: "todd" },
          { data: { name: "boo" }, arrayParentName: "cos" }
        );
        assert.deepEqual(state.store.json.object_storage[1].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
      });
      it("should update cos key in a specified instance with same name", () => {
        let state = new newState();

        state.object_storage.keys.save(
          {
            name: "cos-bind-key",
          },
          { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
        );
        assert.deepEqual(state.store.json.object_storage[0].keys, [
          {
            name: "cos-bind-key",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
      });
    });
    describe("object_storage.keys.delete", () => {
      it("should delete a cos key in a specified instance", () => {
        let state = new newState();
        state.object_storage.keys.delete(
          {},
          { arrayParentName: "atracker-cos", data: { name: "cos-bind-key" } }
        );
        assert.deepEqual(state.store.json.object_storage[0].keys, []);
      });
    });
  });
});
