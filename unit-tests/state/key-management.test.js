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
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "atracker-key",
              root_key: true,
              force_delete: true,
              endpoint: "public",
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "vsi-volume-key",
              root_key: true,
              force_delete: true,
              endpoint: "public",
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "roks-key",
              root_key: true,
              force_delete: null,
              endpoint: null,
              rotation: 1,
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
      state.store.json.key_management.push({
        name: "frog",
        keys: [],
      });
      state.key_management.save(
        {
          name: "toad",
          resource_group: null,
          use_hs_crypto: true,
          authorize_vpc_reader_role: true,
        },
        { data: { name: "frog" } }
      );
      state.store.json.key_management[0].keys = [];
      let expectedData = {
        name: "toad",
        resource_group: null,
        use_hs_crypto: true,
        use_data: true,
        authorize_vpc_reader_role: true,
        keys: [],
      };
      assert.deepEqual(
        state.store.json.key_management[1],
        expectedData,
        "it should update everything"
      );
    });
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
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "atracker-key",
              root_key: true,
              force_delete: true,
              endpoint: "public",
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "vsi-volume-key",
              root_key: true,
              force_delete: true,
              endpoint: "public",
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "roks-key",
              root_key: true,
              force_delete: null,
              endpoint: null,
              rotation: 1,
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
    it("should add a new key management system with no keys", () => {
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
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "atracker-key",
              root_key: true,
              force_delete: true,
              endpoint: "public",
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "vsi-volume-key",
              root_key: true,
              force_delete: true,
              endpoint: "public",
              rotation: 1,
              dual_auth_delete: false,
            },
            {
              key_ring: "ring",
              name: "roks-key",
              root_key: true,
              force_delete: null,
              endpoint: null,
              rotation: 1,
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
  describe("key_management.schema", () => {
    let craig;
    beforeEach(() => {
      craig = state();
    });
    it("should return correct name for use hs crypto on render", () => {
      assert.deepEqual(
        craig.key_management.use_hs_crypto.onRender({ use_hs_crypto: true }),
        "HPCS",
        "it should return correct data"
      );
    });
    it("should return correct name for key protect on render", () => {
      assert.deepEqual(
        craig.key_management.use_hs_crypto.onRender({ use_hs_crypto: false }),
        "Key Protect",
        "it should return correct data"
      );
    });
    it("should set state data for use hs crypto on input change", () => {
      let data = {
        use_hs_crypto: "HPCS",
      };
      assert.isTrue(
        craig.key_management.use_hs_crypto.onInputChange(data),
        "it should return true"
      );
      assert.deepEqual(
        data,
        {
          use_data: true,
          use_hs_crypto: "HPCS",
        },
        "it should return correct data"
      );
    });
    it("should disable use data when use hpcs is true", () => {
      assert.isTrue(
        craig.key_management.use_data.disabled({ use_hs_crypto: true }),
        "it should be disabled"
      );
    });
  });
  describe("key_management.keys", () => {
    describe("key_management.keys.create", () => {
      it("should create a new key", () => {
        let state = new newState();
        state.store.json.key_management.push({
          name: "frog",
          keys: [],
        });
        state.key_management.keys.create(
          {
            name: "all-new-key",
            root_key: true,
            key_ring: "all-new-ring",
          },
          {
            innerFormProps: { arrayParentName: "kms" },
            arrayData: state.store.json.key_management[0].keys,
          }
        );
        let expectedData = {
          name: "all-new-key",
          root_key: true,
          key_ring: "all-new-ring",
          force_delete: null,
          endpoint: null,
          rotation: 1,
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
            rotation: 1,
          },
          { arrayParentName: "kms", data: { name: "roks-key" } }
        );
        let expectedData = {
          name: "all-new-key",
          root_key: true,
          key_ring: "all-new-ring",
          force_delete: null,
          endpoint: null,
          rotation: 1,
          dual_auth_delete: false,
        };
        assert.deepEqual(
          state.store.json.key_management[0].keys[3],
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
    describe("key management schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
      });
      it("should not have invalid key ring when empty string", () => {
        assert.isFalse(
          craig.key_management.keys.key_ring.invalid({ key_ring: "" }),
          "it should not be invalid"
        );
      });
      it("should have invalid key ring when bad name", () => {
        assert.isTrue(
          craig.key_management.keys.key_ring.invalid({ key_ring: "@@@" }),
          "it should not be invalid"
        );
      });
      it("should have invalid endpoint when public and private", () => {
        assert.isTrue(
          craig.key_management.keys.endpoint.invalid({
            endpoint: "public-and-private",
          }),
          "it should be true"
        );
      });
      it("should hide endpoint when craig is not public and private", () => {
        assert.isTrue(
          craig.key_management.keys.endpoint.hideWhen({}, { craig: craig }),
          "it should be hidden"
        );
      });
      it("should hide rotation when key is not root key", () => {
        assert.isTrue(
          craig.key_management.keys.rotation.hideWhen(
            { root_key: false },
            { craig: craig }
          ),
          "it should be hidden"
        );
      });
    });
  });
});
