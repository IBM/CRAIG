const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("classic vsi state", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("crud ops", () => {
    beforeEach(() => {
      craig.classic_ssh_keys.create({
        name: "key",
        public_key: "1234",
        datacenter: "dal10",
      });
      craig.classic_security_groups.create({ name: "pub", description: "" });
      craig.classic_security_groups.create({ name: "priv", description: "" });
      craig.classic_vlans.create({
        name: "pub",
        datacenter: "dal10",
        type: "PUBLIC",
      });
      craig.classic_vlans.create({
        name: "priv",
        datacenter: "dal10",
        type: "PRIVATE",
      });
    });
    it("should create a vsi and set unfound values to null", () => {
      craig.classic_vsi.create({
        name: "test",
        ssh_keys: ["aaa"],
        public_vlan: "aa",
        private_vlan: "aa",
        private_security_groups: ["aaa"],
        public_security_groups: ["aaa"],
      });
      assert.deepEqual(
        craig.store.json.classic_vsi,
        [
          {
            name: "test",
            public_vlan: null,
            private_vlan: null,
            private_security_groups: [],
            public_security_groups: [],
            ssh_keys: [],
          },
        ],
        "it should create vsi"
      );
    });
    it("should create a vsi with found values", () => {
      craig.classic_vsi.create({
        name: "test",
        ssh_keys: ["key"],
        public_vlan: "pub",
        private_vlan: "priv",
        private_security_groups: ["pub"],
        public_security_groups: ["priv"],
      });
      assert.deepEqual(
        craig.store.json.classic_vsi,
        [
          {
            name: "test",
            public_vlan: "pub",
            private_vlan: "priv",
            private_security_groups: ["pub"],
            public_security_groups: ["priv"],
            ssh_keys: ["key"],
          },
        ],
        "it should create vsi"
      );
      craig.classic_vsi.save(
        {
          name: "honk",
          ssh_keys: ["key"],
          public_vlan: "pub",
          private_vlan: "priv",
          private_security_groups: ["pub"],
          public_security_groups: ["priv"],
        },
        {
          data: {
            name: "test",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.classic_vsi,
        [
          {
            name: "honk",
            public_vlan: "pub",
            private_vlan: "priv",
            private_security_groups: ["pub"],
            public_security_groups: ["priv"],
            ssh_keys: ["key"],
          },
        ],
        "it should update vsi"
      );
      craig.classic_vsi.delete(
        {
          name: "honk",
          ssh_keys: ["key"],
          public_vlan: "pub",
          private_vlan: "priv",
          private_security_groups: ["pub"],
          public_security_groups: ["priv"],
        },
        {
          data: {
            name: "honk",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.classic_vsi,
        [],
        "it should delete vsi"
      );
    });
  });
  describe("schema", () => {
    it("should be invalid when no values", () => {
      assert.isTrue(
        disableSave("classic_vsi", {}, { craig: craig }),
        "it should be disabled"
      );
    });
    it("should return invalid when no ssh keys selected", () => {
      assert.isTrue(
        craig.classic_vsi.ssh_keys.invalid({ ssh_keys: [] }),
        "it should be invalid"
      );
    });
    it("should return groups for classic ssh keys", () => {
      assert.deepEqual(
        craig.classic_vsi.ssh_keys.groups({}, { craig: craig }),
        [],
        "it should return data"
      );
    });
    it("should return invalid and groups for private security groups", () => {
      assert.isTrue(
        craig.classic_vsi.private_security_groups.invalid({
          private_security_groups: [],
        }),
        "it should be invalid"
      );
      assert.deepEqual(
        craig.classic_vsi.private_security_groups.groups({}, { craig: craig }),
        [],
        "it should return data"
      );
    });
    it("should return invalid and groups for public security groups", () => {
      assert.isTrue(
        craig.classic_vsi.public_security_groups.invalid({
          private_security_groups: [],
          public_security_groups: [],
        }),
        "it should be invalid"
      );
      assert.isFalse(
        craig.classic_vsi.public_security_groups.invalid({
          private_security_groups: [],
          private_network_only: true,
          public_security_groups: [],
        }),
        "it should be valid when none and private only"
      );
      assert.isTrue(
        craig.classic_vsi.public_security_groups.hideWhen({
          private_security_groups: [],
          private_network_only: true,
          public_security_groups: [],
        }),
        "it should be hidden"
      );
      assert.deepEqual(
        craig.classic_vsi.public_security_groups.groups({}, { craig: craig }),
        [],
        "it should return data"
      );
    });
  });
});
