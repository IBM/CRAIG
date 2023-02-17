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
  describe("key_management", () => {
    describe("key_management.init", () => {
      it("should initialize key_management as a list", () => {
        let state = new newState();
        let expectedData = [
          {
            name: "kms",
            resource_group: "service-rg",
            use_hs_crypto: false,
            authorize_vpc_reader_role: true,
            use_data: false,
            keys: [
              {
                key_ring: "ring",
                name: "key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 12,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "atracker-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 12,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "vsi-volume-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 12,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "roks-key",
                root_key: true,
                force_delete: null,
                endpoint: null,
                rotation: 12,
                dual_auth_delete: false,
              },
            ],
          },
        ];
        assert.deepEqual(
          state.store.json.key_management,
          expectedData,
          "it should have key_management initialized as a list"
        );
      });
    });
    describe("key_management.onStoreUpdate", () => {
      it("should set parent keys", () => {
        let state = new newState();
        assert.deepEqual(
          state.store.encryptionKeys,
          ["key", "atracker-key", "vsi-volume-key", "roks-key"],
          "it should be set to keys"
        );
      });
    });
    describe("key_management.save", () => {
      it("should change the properties of the key management instance", () => {
        let state = new newState();
        state.key_management.save(
          {
            name: "todd",
            resource_group: null,
            use_hs_crypto: true,
            authorize_vpc_reader_role: true,
          },
          { data: { name: "kms" } }
        );
        state.store.json.key_management[0].keys = [];
        let expectedData = [
          {
            name: "todd",
            resource_group: null,
            use_hs_crypto: true,
            use_data: true,
            authorize_vpc_reader_role: true,
            keys: [],
          },
        ];
        assert.deepEqual(
          state.store.json.key_management,
          expectedData,
          "it should update everything"
        );
      });
      it("should change the properties of the key management instance with no hs crypto", () => {
        let state = new newState();
        state.key_management.save(
          {
            name: "todd",
            resource_group: null,
            authorize_vpc_reader_role: false,
          },
          { data: { name: "kms" } }
        );
        state.store.json.key_management[0].keys = [];
        let expectedData = [
          {
            name: "todd",
            resource_group: null,
            use_hs_crypto: false,
            use_data: false,
            authorize_vpc_reader_role: false,
            keys: [],
          },
        ];
        assert.deepEqual(
          state.store.json.key_management,
          expectedData,
          "it should update everything"
        );
      });
    });
    describe("key_management.create", () => {
      it("should add a new key management system", () => {
        let state = new newState();
        let expectedData = [
          {
            name: "kms",
            resource_group: "service-rg",
            use_hs_crypto: false,
            authorize_vpc_reader_role: true,
            use_data: false,
            keys: [
              {
                key_ring: "ring",
                name: "key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 12,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "atracker-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 12,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "vsi-volume-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 12,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "roks-key",
                root_key: true,
                force_delete: null,
                endpoint: null,
                rotation: 12,
                dual_auth_delete: false,
              },
            ],
          },
          {
            name: "todd",
            resource_group: null,
            use_hs_crypto: false,
            use_data: false,
            authorize_vpc_reader_role: false,
            keys: [],
          },
        ];
        state.key_management.create({
          name: "todd",
          resource_group: null,
          use_hs_crypto: false,
          use_data: false,
          authorize_vpc_reader_role: false,
          keys: [],
        });
        assert.deepEqual(state.store.json.key_management, expectedData);
      });
    });
    describe("key_management.delete", () => {
      it("should delete a key_management system", () => {
        let state = new newState();
        state.key_management.delete({}, { data: { name: "kms" } });
        assert.deepEqual(state.store.json.key_management, []);
      });
    });
    describe("key_management.keys", () => {
      describe("key_management.keys.create", () => {
        it("should create a new key", () => {
          let state = new newState();
          state.key_management.keys.create(
            {
              name: "all-new-key",
              root_key: true,
              key_ring: "all-new-ring",
            },
            { arrayParentName: "kms", data: { name: "key" } }
          );
          let expectedData = {
            name: "all-new-key",
            root_key: true,
            key_ring: "all-new-ring",
            force_delete: null,
            endpoint: null,
            rotation: 12,
            dual_auth_delete: false,
          };
          assert.deepEqual(
            state.store.json.key_management[0].keys[4],
            expectedData,
            "it should add key"
          );
        });
      });
      describe("key_management.keys.save", () => {
        it("should update an encryption key in place", () => {
          let state = new newState();
          state.key_management.keys.save(
            {
              name: "all-new-key",
              root_key: true,
              key_ring: "all-new-ring",
              rotation: 12,
            },
            { arrayParentName: "kms", data: { name: "key" } }
          );
          let expectedData = {
            name: "all-new-key",
            root_key: true,
            key_ring: "all-new-ring",
            force_delete: true,
            endpoint: "public",
            rotation: 12,
            dual_auth_delete: false,
          };
          assert.deepEqual(
            state.store.json.key_management[0].keys[0],
            expectedData,
            "it should update key"
          );
        });
        it("should update an encryption key in place with same name", () => {
          let state = new newState();
          state.key_management.keys.save(
            {
              name: "key",
              root_key: true,
              key_ring: "all-new-ring",
              rotation: 3,
            },
            { arrayParentName: "kms", data: { name: "key" } }
          );
          let expectedData = {
            name: "key",
            root_key: true,
            key_ring: "all-new-ring",
            force_delete: true,
            endpoint: "public",
            rotation: 3,
            dual_auth_delete: false,
          };
          assert.deepEqual(
            state.store.json.key_management[0].keys[0],
            expectedData,
            "it should update key"
          );
        });
      });
      describe("key_management.keys.delete", () => {
        it("should delete an encryption key", () => {
          let state = new newState();
          state.key_management.keys.delete(
            {},
            { arrayParentName: "kms", data: { name: "key" } }
          );
          assert.deepEqual(
            state.store.encryptionKeys,
            ["atracker-key", "vsi-volume-key", "roks-key"],
            "it should update key"
          );
        });
      });
    });
  });
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
        state.cos.keys.delete(
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
        state.cos.keys.create(
          {
            name: "frog",
          },
          {
            arrayParentName: "cos",
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
          target_name: "atracker-cos",
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
    });
  });
});
