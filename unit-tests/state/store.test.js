const { assert, expect } = require("chai");
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
  describe("appid", () => {
    describe("appid.init", () => {
      it("should initialize appid", () => {
        let state = new newState();
        let expectedData = [];
        assert.deepEqual(
          state.store.json.appid,
          expectedData,
          "it should have appid initialized"
        );
      });
    });
    describe("appid crud functions", () => {
      let appidState;
      beforeEach(() => {
        appidState = new newState();
      });
      it("should add an appid instance", () => {
        appidState.appid.create({ name: "default" });
        assert.deepEqual(
          appidState.store.json.appid,
          [
            {
              name: "default",
              resource_group: null,
            },
          ],
          "it should create appid"
        );
      });
      it("should save an appid instance", () => {
        appidState.appid.create({ name: "default" });
        appidState.appid.save(
          { resource_group: "service-rg" },
          { data: { name: "default" } }
        );
        assert.deepEqual(
          appidState.store.json.appid,
          [
            {
              name: "default",
              resource_group: "service-rg",
            },
          ],
          "it should create appid"
        );
      });
      it("should delete an appid instance", () => {
        appidState.appid.create({ name: "default" });
        appidState.appid.delete({}, { data: { name: "default" } });
        assert.deepEqual(
          appidState.store.json.appid,
          [],
          "it should create appid"
        );
      });
    });
  });
  describe("vpcs", () => {
    describe("vpcs.save", () => {
      it("should rename a vpc", () => {
        let state = new newState();
        state.vpcs.save(
          { name: "todd", default_network_acl_name: "" },
          { data: { name: "management" } }
        );
        assert.isTrue(
          contains(state.store.vpcList, "todd"),
          "todd should be there"
        );
        assert.isNull(
          state.store.json.vpcs[0].default_network_acl_name,
          "it should be null"
        );
        assert.deepEqual(
          state.store.subnetTiers,
          {
            todd: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
              { name: "vpn", zones: 1 },
            ],
            workload: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
            ],
          },
          "it should update subnet tiers"
        );
      });
      it("should change edge vpc name when updating edge vpc", () => {
        let state = new newState();
        state.store.edge_vpc_name = "management";
        state.vpcs.save({ name: "todd" }, { data: { name: "management" } });
        assert.isTrue(
          contains(state.store.vpcList, "todd"),
          "todd should be there"
        );
        assert.deepEqual(
          state.store.subnetTiers,
          {
            todd: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
              { name: "vpn", zones: 1 },
            ],
            workload: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
            ],
          },
          "it should update subnet tiers"
        );
        assert.deepEqual(
          state.store.edge_vpc_name,
          "todd",
          "it should be todd"
        );
      });
      it("should update another field", () => {
        let state = new newState();
        state.vpcs.save(
          {
            name: "management",
            classic_access: true,
          },
          {
            data: {
              name: "management",
            },
          }
        );
        assert.isTrue(
          contains(state.store.vpcList, "management"),
          "todd should be there"
        );
        assert.deepEqual(
          state.store.subnetTiers,
          {
            management: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
              { name: "vpn", zones: 1 },
            ],
            workload: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
            ],
          },
          "it should update subnet tiers"
        );
      });
      it("should correctly save a vpc with no subnet tiers", () => {
        let state = new newState();
        state.vpcs.create({ name: "test" });
        state.vpcs.save(
          { default_network_acl_name: "todd" },
          { data: { name: "test" } }
        );
        assert.deepEqual(
          state.store.json.vpcs[2].default_network_acl_name,
          "todd",
          "todd should be there"
        );
      });
    });
    describe("vpcs.create", () => {
      it("should create a new vpc with a name and resource group", () => {
        let state = new newState();
        state.vpcs.create({ name: "test" });
        let expectedData = {
          cos: null,
          bucket: null,
          name: "test",
          resource_group: null,
          classic_access: false,
          manual_address_prefix_management: false,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
          address_prefixes: [
            {
              vpc: null,
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
            },
            {
              vpc: null,
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
            },
            {
              vpc: null,
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
            },
            {
              vpc: null,
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: null,
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: null,
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: null,
              zone: 1,
              cidr: "10.30.10.0/24",
              name: "vpn-zone-1",
            },
          ],
          subnets: [
            {
              vpc: null,
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: null,
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: null,
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: null,
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: null,
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: null,
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: null,
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: null,
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ],
          public_gateways: [],
          acls: [
            {
              resource_group: "management-rg",
              name: null,
              vpc: null,
              rules: [
                {
                  action: "allow",
                  destination: "10.0.0.0/8",
                  direction: "inbound",
                  name: "allow-ibm-inbound",
                  source: "161.26.0.0/16",
                  acl: null,
                  vpc: null,
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                },
                {
                  action: "allow",
                  destination: "10.0.0.0/8",
                  direction: "inbound",
                  name: "allow-all-network-inbound",
                  source: "10.0.0.0/8",
                  acl: null,
                  vpc: null,
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                },
                {
                  action: "allow",
                  destination: "0.0.0.0/0",
                  direction: "outbound",
                  name: "allow-all-outbound",
                  source: "0.0.0.0/0",
                  acl: null,
                  vpc: null,
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                },
              ],
            },
          ],
        };
        let actualData = state.store.json.vpcs[2];
        assert.deepEqual(actualData, expectedData, "it should create new vpc");
      });
    });
    describe("vpcs.delete", () => {
      it("should delete a vpc from config", () => {
        let state = new newState();
        state.vpcs.delete({}, { data: { name: "management" } });
        let expectedData = [
          {
            cos: "cos",
            bucket: "management-bucket",
            name: "workload",
            resource_group: "workload-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.40.10.0/24",
                name: "vsi-zone-1",
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.50.10.0/24",
                name: "vsi-zone-2",
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.60.10.0/24",
                name: "vsi-zone-3",
              },
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.40.20.0/24",
                name: "vpe-zone-1",
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.50.20.0/24",
                name: "vpe-zone-2",
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.60.20.0/24",
                name: "vpe-zone-3",
              },
            ],
            subnets: [
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.40.10.0/24",
                name: "vsi-zone-1",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.50.20.0/24",
                name: "vsi-zone-2",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.60.30.0/24",
                name: "vsi-zone-3",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.20.10.0/24",
                name: "vpe-zone-1",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.20.20.0/24",
                name: "vpe-zone-2",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.20.30.0/24",
                name: "vpe-zone-3",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: true,
              },
            ],
            public_gateways: [],
            acls: [
              {
                resource_group: "workload-rg",
                name: "workload",
                vpc: "workload",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "workload",
                    vpc: "workload",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "workload",
                    vpc: "workload",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "0.0.0.0/0",
                    direction: "outbound",
                    name: "allow-all-outbound",
                    source: "0.0.0.0/0",
                    acl: "workload",
                    vpc: "workload",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
          },
        ];
        assert.deepEqual(
          state.store.json.vpcs,
          expectedData,
          "it should have only one vpcs"
        );
      });
    });
    describe("vpcs.subnets", () => {
      describe("vpcs.subnets.save", () => {
        it("should update a subnet in place", () => {
          let state = new newState();
          state.vpcs.subnets.save(
            {
              name: "frog",
            },
            {
              name: "management",
              subnet: { name: "vpn-zone-1" },
            }
          );
          assert.deepEqual(
            state.store.json.vpcs[0].subnets[1].name,
            "frog",
            "it should be frog"
          );
        });
        it("should update a subnet in place", () => {
          let state = new newState();
          state.vpcs.subnets.save(
            {
              name: "frog",
              acl_name: "",
            },
            {
              name: "management",
              subnet: { name: "vpn-zone-1" },
            }
          );
          assert.deepEqual(
            state.store.json.vpcs[0].subnets[1].acl_name,
            null,
            "it should be null"
          );
        });
        it("should update a subnet in place using field other than name", () => {
          let state = new newState();
          state.setUpdateCallback(() => {});
          state.vpcs.subnets.save(
            {
              cidr: "1.2.3.4/32",
            },
            {
              name: "management",
              subnet: {
                name: "vpn-zone-1",
              },
            }
          );
          assert.deepEqual(
            state.store.json.vpcs[0].subnets[1].cidr,
            "1.2.3.4/32",
            "it should be frog"
          );
        });
      });
      describe("vpcs.subnets.delete", () => {
        it("should delete a subnet from a vpc", () => {
          let state = new newState();
          state.setUpdateCallback(() => {});
          state.vpcs.subnets.delete(
            {},
            {
              name: "management",
              subnet: {
                name: "vpn-zone-1",
              },
            }
          );
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].subnets,
            expectedData,
            "vpn-zone-1 should be deleted"
          );
        });
      });
      describe("vpcs.subnets.create", () => {
        it("should create a subnet in a zone", () => {
          let state = new newState();
          let index = state.store.json.vpcs[0].subnets.length; // new vpc should be stored here
          state.setUpdateCallback(() => {});
          let testData = {
            name: "frog-zone-1",
            cidr: "10.2.3.4/32",
            network_acl: "management-acl",
            public_gateway: true,
          };
          state.vpcs.subnets.create(testData, { name: "management" });
          assert.deepEqual(
            state.store.json.vpcs[0].subnets[index],
            testData,
            "it should be frog"
          );
        });
      });
    });
    describe("vpcs.subnetTiers", () => {
      describe("vpcs.subnetTiers.save", () => {
        it("should update a subnet tier in place", () => {
          let vpcState = newState();
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "frog-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          vpcState.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
            },
            {
              vpc_name: "management",
              tier: { name: "vsi" },
            }
          );

          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with nacl and gateway", () => {
          let vpcState = newState();
          vpcState.vpcs.acls.create(
            { name: "todd" },
            { vpc_name: "management" }
          );
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "todd",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "frog-zone-2",
              network_acl: "todd",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          vpcState.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
              networkAcl: "todd",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vsi" },
              config: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        public_gateways: [
                          {
                            vpc: "management",
                            zone: 1,
                          },
                          {
                            vpc: "management",
                            zone: 2,
                          },
                          {
                            vpc: "management",
                            zone: 3,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with nacl and gateway when only one gateway is enabled", () => {
          let vpcState = newState();
          vpcState.vpcs.acls.create(
            { name: "todd" },
            { vpc_name: "management" }
          );
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "todd",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "frog-zone-2",
              network_acl: "todd",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          vpcState.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
              networkAcl: "todd",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vsi" },
              config: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        public_gateways: [
                          {
                            vpc: "management",
                            zone: 1,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl", () => {
          let vpcState = newState();
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpn-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          vpcState.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
            },
            {
              vpc_name: "management",
              tier: { name: "vpn" },
            }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl and 1 zone pgw", () => {
          let vpcState = newState();
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpn-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          vpcState.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vpn" },
              config: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        public_gateways: [
                          {
                            vpc: "management",
                            zone: 1,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl and 2 zone pgw", () => {
          let vpcState = newState();
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpn-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
          ];
          vpcState.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vpn" },
              config: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        public_gateways: [
                          {
                            vpc: "management",
                            zone: 1,
                          },
                          {
                            vpc: "management",
                            zone: 2,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should expand a reserved edge subnet tier in place with additional zones", () => {
          let vpcState = newState();
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.5.60.0/24",
              name: "f5-bastion-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.6.60.0/24",
              name: "f5-bastion-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.7.60.0/24",
              name: "f5-bastion-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          vpcState.store.edge_vpc_name = "management";
          vpcState.store.subnetTiers.management.unshift({
            name: "f5-bastion",
            zones: 1,
          });
          vpcState.vpcs.subnetTiers.save(
            {
              name: "f5-bastion",
              zones: 3,
            },
            {
              vpc_name: "management",
              tier: { name: "f5-bastion" },
              config: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        public_gateways: [
                          {
                            vpc: "management",
                            zone: 1,
                          },
                          {
                            vpc: "management",
                            zone: 2,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
      });
      describe("vpcs.subnetTiers.create", () => {
        it("should add a subnet tier to vpc", () => {
          let vpcState = new newState();
          vpcState.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management",
            },
            { vpc_name: "management" }
          );
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.40.0/24",
              name: "test-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.40.0/24",
              name: "test-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "test-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should add a subnet tier to vpc with pgw", () => {
          let vpcState = new newState();
          vpcState.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management",
              addPublicGateway: true,
            },
            { vpc_name: "management" }
          );
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.40.0/24",
              name: "test-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.40.0/24",
              name: "test-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "test-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
          ];
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should add a subnet tier to vpc with no subnet tier", () => {
          let vpcState = new newState();
          vpcState.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
            },
            { vpc_name: "management" }
          );
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.40.0/24",
              name: "test-zone-1",
              resource_group: "management-rg",
              network_acl: null,
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.40.0/24",
              name: "test-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "test-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
      });
      describe("vpcs.subnetTiers.delete", () => {
        it("should delete a subnet tier", () => {
          let vpcState = new newState();
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          vpcState.vpcs.subnetTiers.delete(
            {},
            { vpc_name: "management", tier: { name: "vsi" } }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should delete a subnet tier and leave F5 subnets in place", () => {
          let vpcState = new newState();
          // push f5-management to subnets
          vpcState.store.json.vpcs[0].subnets.push({
            cidr: "10.5.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-1",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 1,
          });
          vpcState.store.json.vpcs[0].subnets.push({
            cidr: "10.6.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-2",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 2,
          });
          vpcState.store.json.vpcs[0].subnets.push({
            cidr: "10.7.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-3",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 3,
          });
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              cidr: "10.5.60.0/24",
              has_prefix: true,
              name: "f5-bastion-zone-1",
              network_acl: "management",
              public_gateway: false,
              resource_group: "edge-rg",
              vpc: "edge",
              zone: 1,
            },
            {
              cidr: "10.6.60.0/24",
              has_prefix: true,
              name: "f5-bastion-zone-2",
              network_acl: "management",
              public_gateway: false,
              resource_group: "edge-rg",
              vpc: "edge",
              zone: 2,
            },
            {
              cidr: "10.7.60.0/24",
              has_prefix: true,
              name: "f5-bastion-zone-3",
              network_acl: "management",
              public_gateway: false,
              resource_group: "edge-rg",
              vpc: "edge",
              zone: 3,
            },
          ];
          vpcState.vpcs.subnetTiers.delete(
            { name: "vsi", zones: 3 },
            { vpc_name: "management", tier: { name: "vsi", zones: 3 } }
          );
          assert.deepEqual(
            vpcState.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
      });
    });
    describe("vpcs.network_acls", () => {
      describe("vpcs.network_acls.create", () => {
        it("should create an acl", () => {
          let state = newState();
          state.vpcs.acls.create({ name: "new" }, { vpc_name: "management" });
          let expectedData = {
            name: "new",
            resource_group: "management-rg",
            vpc: "management",
            rules: [],
          };
          assert.deepEqual(
            state.store.json.vpcs[0].acls[1],
            expectedData,
            "it should create acl"
          );
        });
      });
      describe("vpcs.network_acls.delete", () => {
        it("should delete an acl", () => {
          let state = newState();
          state.vpcs.acls.delete(
            {},
            { data: { name: "management" }, arrayParentName: "management" }
          );
          let expectedData = [];
          assert.deepEqual(
            state.store.json.vpcs[0].acls,
            expectedData,
            "it should delete acl"
          );
        });
        it("should set subnet acls to null on delete", () => {
          let state = newState();
          state.vpcs.acls.delete(
            {},
            { data: { name: "management" }, arrayParentName: "management" }
          );
          let expectedData = [];
          assert.deepEqual(
            state.store.json.vpcs[0].acls,
            expectedData,
            "it should delete acl"
          );
          assert.deepEqual(
            state.store.json.vpcs[0].subnets,
            [
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.10.0/24",
                name: "vsi-zone-1",
                network_acl: null,
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.30.0/24",
                name: "vpn-zone-1",
                network_acl: null,
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "management",
                zone: 2,
                cidr: "10.10.20.0/24",
                name: "vsi-zone-2",
                network_acl: null,
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "management",
                zone: 3,
                cidr: "10.10.30.0/24",
                name: "vsi-zone-3",
                network_acl: null,
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "management",
                zone: 1,
                cidr: "10.20.10.0/24",
                name: "vpe-zone-1",
                resource_group: "management-rg",
                network_acl: null,
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "management",
                zone: 2,
                cidr: "10.20.20.0/24",
                name: "vpe-zone-2",
                network_acl: null,
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "management",
                zone: 3,
                cidr: "10.20.30.0/24",
                name: "vpe-zone-3",
                network_acl: null,
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: true,
              },
            ],
            "it should have correct subnets"
          );
        });
      });
      describe("vpcs.network_acls.save", () => {
        it("should update an acl", () => {
          let state = newState();
          state.vpcs.acls.save(
            { name: "new" },
            { data: { name: "management" }, arrayParentName: "management" }
          );
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].name,
            "new",
            "it should update acl"
          );
        });
        it("should update an acl with no name change", () => {
          let state = newState();
          state.vpcs.acls.save(
            { name: "management", resource_group: "workload-rg" },
            { data: { name: "management" }, arrayParentName: "management" }
          );
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].resource_group,
            "workload-rg",
            "it should update acl rg"
          );
        });
      });
      describe("vpcs.network_acls.rules", () => {
        describe("vpcs.network_acls.rules.create", () => {
          it("should create a network acl rule", () => {
            let state = newState();
            state.vpcs.acls.rules.create(
              {
                name: "frog",
                action: "allow",
                direction: "inbound",
                source: "8.8.8.8",
                destination: "0.0.0.0/0",
              },
              {
                vpc_name: "management",
                parent_name: "management",
              }
            );
            let expectedData = [
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                destination: "0.0.0.0/0",
                direction: "outbound",
                name: "allow-all-outbound",
                source: "0.0.0.0/0",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "0.0.0.0/0",
                name: "frog",
                source: "8.8.8.8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              state.store.json.vpcs[0].acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
          it("should create a network acl rule with deny outbound", () => {
            let state = newState();
            state.vpcs.acls.rules.create(
              {
                name: "frog",
                action: "deny",
                direction: "outbound",
                source: "8.8.8.8",
                destination: "0.0.0.0/0",
              },
              {
                vpc_name: "management",
                parent_name: "management",
              }
            );
            let expectedData = [
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                destination: "0.0.0.0/0",
                direction: "outbound",
                name: "allow-all-outbound",
                source: "0.0.0.0/0",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "deny",
                direction: "outbound",
                destination: "0.0.0.0/0",
                name: "frog",
                source: "8.8.8.8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              state.store.json.vpcs[0].acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
        });
        describe("vpcs.network_acls.rules.save", () => {
          it("should update a rule in place with all", () => {
            let state = newState();
            state.vpcs.acls.rules.save(
              {
                name: "frog",
                allow: false,
                inbound: true,
                source: "1.2.3.4",
                destination: "5.6.7.8",
                ruleProtocol: "all",
              },
              {
                vpc_name: "management",
                parent_name: "management",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "deny",
                direction: "inbound",
                destination: "5.6.7.8",
                name: "frog",
                source: "1.2.3.4",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              state.store.json.vpcs[0].acls[0].rules,
              expectedData,
              "it should update rule"
            );
          });
          it("should update a rule in place with protocol", () => {
            let state = newState();
            state.vpcs.acls.rules.save(
              {
                name: "frog",
                allow: false,
                inbound: true,
                source: "1.2.3.4",
                destination: "5.6.7.8",
                ruleProtocol: "tcp",
                rule: {
                  port_max: 8080,
                  port_min: null,
                },
              },
              {
                vpc_name: "management",
                parent_name: "management",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "deny",
                direction: "inbound",
                destination: "5.6.7.8",
                name: "frog",
                source: "1.2.3.4",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: 8080,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              state.store.json.vpcs[0].acls[0].rules,
              expectedData,
              "it should update rule"
            );
          });
          it("should update a rule in place with only one change protocol", () => {
            let state = newState();
            state.vpcs.acls.rules.save(
              {
                name: "allow-all-outbound",
                allow: true,
                inbound: false,
                source: "10.0.0.0/8",
                destination: "0.0.0.0/0",
                ruleProtocol: "tcp",
                rule: {
                  port_max: 8080,
                  port_min: null,
                },
              },
              {
                vpc_name: "management",
                parent_name: "management",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "outbound",
                destination: "0.0.0.0/0",
                name: "allow-all-outbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: 8080,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              state.store.json.vpcs[0].acls[0].rules,
              expectedData,
              "it should update rule"
            );
          });
          it("should update a rule in place with protocol and change port values to numbers from string", () => {
            let state = newState();
            state.vpcs.acls.rules.save(
              {
                name: "frog",
                allow: false,
                inbound: true,
                source: "1.2.3.4",
                destination: "5.6.7.8",
                ruleProtocol: "tcp",
                rule: {
                  port_max: "8080",
                  port_min: null,
                },
              },
              {
                vpc_name: "management",
                parent_name: "management",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "deny",
                direction: "inbound",
                destination: "5.6.7.8",
                name: "frog",
                source: "1.2.3.4",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: 8080,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              state.store.json.vpcs[0].acls[0].rules,
              expectedData,
              "it should update rule"
            );
          });
        });
        describe("vpcs.network_acls.rules.delete", () => {
          it("should delete an acl rule", () => {
            let state = newState();
            state.vpcs.acls.rules.delete(
              {},
              {
                vpc_name: "management",
                parent_name: "management",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "management",
                vpc: "management",
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              state.store.json.vpcs[0].acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
        });
      });
    });
  });
});
