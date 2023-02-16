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
});
