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

describe("ssh_keys", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("ssh_keys.init", () => {
    it("should initialize with default ssh key if pattern has vsi", () => {
      assert.deepEqual(craig.store.json.ssh_keys, [
        {
          name: "ssh-key",
          public_key: "<user-determined-value>",
          resource_group: "management-rg",
          use_data: false,
        },
      ]);
    });
  });
  describe("ssh_keys.delete", () => {
    it("should delete an unused ssh key and update list", () => {
      craig.ssh_keys.delete({}, { data: { name: "ssh-key" } });
      assert.deepEqual(
        craig.store.json.ssh_keys,
        [],
        "there should be no keys"
      );
      assert.deepEqual(craig.store.sshKeys, [], "it should remove the ssh key");
    });
  });
  describe("ssh_keys.save", () => {
    it("should update an ssh key in place", () => {
      craig.ssh_keys.save(
        { name: "todd", show: false },
        { data: { name: "ssh-key" } }
      );
      assert.deepEqual(craig.store.sshKeys, ["todd"], "it should be todd");
      assert.deepEqual(
        craig.store.json.ssh_keys[0].name,
        "todd",
        "it should have a new name"
      );
    });
    it("should update an ssh key in place with same name", () => {
      // for vsi test, dummy vsi
      craig.store.json.vsi = [{ ssh_keys: ["ssh-key"] }];
      craig.ssh_keys.save(
        { name: "ssh-key", public_key: "todd" },
        { data: { name: "ssh-key" } }
      );
      assert.deepEqual(
        craig.store.json.ssh_keys[0].public_key,
        "todd",
        "it should have a new public key"
      );
    });
    it("should update an ssh key in place with same name not used by vsi", () => {
      craig.ssh_keys.create({ name: "frog" });
      craig.ssh_keys.save({ name: "todd" }, { data: { name: "frog" } });
      assert.deepEqual(
        craig.store.sshKeys,
        ["ssh-key", "todd"],
        "it should have a new name"
      );
    });
    it("should update vsi ssh key name", () => {
      // for vsi test, dummy vsi
      craig.store.json.vsi = [{ ssh_keys: ["ssh-key"] }];
      craig.ssh_keys.save({ name: "frog" }, { data: { name: "ssh-key" } });
      assert.deepEqual(
        craig.store.json.vsi[0].ssh_keys,
        ["frog"],
        "it should have a new ssh key"
      );
    });
  });
  it("should set public key to null when using data", () => {
    craig.ssh_keys.save(
      { name: "todd", use_data: true, public_key: "honk" },
      { data: { name: "ssh-key" } }
    );
    assert.deepEqual(
      craig.store.json.ssh_keys[0].public_key,
      null,
      "it should have a new name and public key null"
    );
  });
  describe("ssh_keys.create", () => {
    it("should create a new ssh key", () => {
      craig.ssh_keys.create({ name: "frog" });
      assert.deepEqual(
        craig.store.sshKeys,
        ["ssh-key", "frog"],
        "it should have a new name"
      );
    });
  });
  describe("ssh_keys.schema", () => {
    describe("resource_group", () => {
      it("should not be invalid if use data", () => {
        assert.isFalse(
          craig.ssh_keys.resource_group.invalid(
            { use_data: true },
            { craig: craig }
          ),
          "it should be false"
        );
      });
    });
    describe("public_key", () => {
      it("should not be invalid if use data", () => {
        assert.isFalse(
          craig.ssh_keys.public_key.invalid(
            { use_data: true },
            { craig: craig }
          ),
          "it should be false"
        );
      });
      it("should not be invalid if the key is NONE and another NONE key exists", () => {
        craig.store.json.ssh_keys.push({ name: "test", public_key: "NONE" });
        assert.isFalse(
          craig.ssh_keys.public_key.invalid(
            { public_key: "NONE" },
            {
              data: {},
              isModal: true,
              craig: craig,
            }
          ),
          "it should be valid"
        );
      });
      describe("hideWhen", () => {
        it("should return true when use data is true", () => {
          assert.isTrue(
            craig.ssh_keys.public_key.hideWhen({ use_data: true }),
            "it should be true"
          );
        });
      });
    });
  });
});
