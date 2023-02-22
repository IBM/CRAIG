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

describe("cos", () => {
  describe("cos.init", () => {
    it("should initialize the object storage instances", () => {
      let state = new newState();
      let expectedData = [
        {
          buckets: [
            {
              endpoint_type: "public",
              force_delete: true,
              kms_key: "atracker-key",
              name: "atracker-bucket",
              storage_class: "standard",
            },
          ],
          keys: [
            {
              name: "cos-bind-key",
              role: "Writer",
              enable_HMAC: false,
            },
          ],
          name: "atracker-cos",
          plan: "standard",
          resource_group: "service-rg",
          use_data: false,
          random_suffix: true,
          kms: "kms",
        },
        {
          buckets: [
            {
              endpoint_type: "public",
              force_delete: true,
              kms_key: "key",
              name: "management-bucket",
              storage_class: "standard",
            },
            {
              endpoint_type: "public",
              force_delete: true,
              kms_key: "key",
              name: "workload-bucket",
              storage_class: "standard",
            },
          ],
          random_suffix: true,
          keys: [],
          name: "cos",
          plan: "standard",
          resource_group: "service-rg",
          use_data: false,
          kms: "kms",
        },
      ];
      assert.deepEqual(
        state.store.json.cos,
        expectedData,
        "it should have cos"
      );
    });
  });
  describe("cos.create", () => {
    it("should create a new cos instance", () => {
      let state = new newState();
      state.cos.create({
        name: "todd",
        use_data: false,
        resource_group: "default",
        plan: "standard",
        random_suffix: true,
      });
      let expectedData = {
        name: "todd",
        use_data: false,
        resource_group: null,
        plan: "standard",
        random_suffix: true,
        keys: [],
        buckets: [],
      };
      assert.deepEqual(
        state.store.json.cos[2],
        expectedData,
        "it should create new cos"
      );
    });
  });
  describe("cos.save", () => {
    it("should update a cos instance in place", () => {
      let state = new newState();
      state.cos.save({ name: "todd" }, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.cos[1].name,
        "todd",
        "it should create new cos"
      );
    });
    it("should update a cos instance in place with same name", () => {
      let state = new newState();
      state.cos.save({ name: "cos" }, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.cos[1].name,
        "cos",
        "it should create new cos"
      );
    });
  });
  describe("cos.delete", () => {
    it("should delete a cos instance", () => {
      let state = new newState();
      state.cos.delete({}, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.cos.length,
        1,
        "it should create new cos"
      );
    });
  });
  describe("cos.onStoreUpdate", () => {
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
        state.store.json.cos[0].buckets[0].kms_key,
        null,
        "it should have all the keys"
      );
    });
  });
  describe("cos.buckets", () => {
    describe("cos.buckets.create", () => {
      it("should create a bucket in a specified instance", () => {
        let state = new newState();

        state.cos.buckets.create(
          {
            endpoint_type: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "todd",
            storage_class: "standard",
            showBucket: true,
          },
          {
            arrayParentName: "atracker-cos",
          }
        );
        let expectedData = {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "todd",
          storage_class: "standard",
        };
        assert.deepEqual(
          state.store.json.cos[0].buckets[1],
          expectedData,
          "it should make new bucket"
        );
      });
    });

    describe("cos.buckets.save", () => {
      it("should update a bucket in a specified instance", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.cos.buckets.save(
          {
            endpoint_type: "public",
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
          endpoint_type: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "todd",
          storage_class: "standard",
        };
        assert.deepEqual(
          state.store.json.cos[1].buckets[0],
          expectedData,
          "it should make new bucket"
        );
      });
      it("should update a atracker collector bucket name when bucket changed", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.cos.buckets.save(
          {
            endpoint_type: "public",
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
        state.cos.buckets.save(
          {
            endpoint_type: "public",
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
          endpoint_type: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "management-bucket",
          storage_class: "standard",
        };
        assert.deepEqual(
          state.store.json.cos[1].buckets[0],
          expectedData,
          "it should make new bucket"
        );
      });
    });
    describe("cos.buckets.delete", () => {
      it("should delete bucket", () => {
        let state = new newState();
        state.cos.buckets.delete(
          {},
          { arrayParentName: "cos", data: { name: "management-bucket" } }
        );
        assert.deepEqual(
          state.store.json.cos[1].buckets.length,
          1,
          "should delete bucket"
        );
      });
    });
  });
  describe("cos.keys", () => {
    describe("cos.keys.create", () => {
      it("should create a new cos key in a specified instance", () => {
        let state = new newState();
        state.cos.keys.create(
          {
            name: "todd",
            role: "Writer",
            enable_HMAC: false,
          },
          {
            arrayParentName: "cos",
          }
        );
        assert.deepEqual(state.store.json.cos[1].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_HMAC: false,
          },
        ]);
      });
    });

    describe("cos.keys.save", () => {
      it("should update a cos key in a specified instance", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.store.json.atracker.cos_key = "cos-bind-key";
        state.cos.keys.save(
          { name: "todd" },
          { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
        );
        assert.deepEqual(state.store.json.cos[0].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_HMAC: false,
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

        state.cos.keys.create(
          {
            name: "boo",
            role: "Writer",
            enable_HMAC: false,
          },
          { arrayParentName: "cos" }
        );
        state.cos.keys.save(
          { name: "todd" },
          { data: { name: "boo" }, arrayParentName: "cos" }
        );
        assert.deepEqual(state.store.json.cos[1].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_HMAC: false,
          },
        ]);
      });
      it("should update cos key in a specified instance with same name", () => {
        let state = new newState();

        state.cos.keys.save(
          {
            name: "cos-bind-key",
          },
          { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
        );
        assert.deepEqual(state.store.json.cos[0].keys, [
          {
            name: "cos-bind-key",
            role: "Writer",
            enable_HMAC: false,
          },
        ]);
      });
    });
    describe("cos.keys.delete", () => {
      it("should delete a cos key in a specified instance", () => {
        let state = new newState();
        state.cos.keys.delete(
          {},
          { arrayParentName: "atracker-cos", data: { name: "cos-bind-key" } }
        );
        assert.deepEqual(state.store.json.cos[0].keys, []);
      });
    });
  });
});
