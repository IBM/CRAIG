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
  describe("ssh_keys.init", () => {
    it("should initialize with default ssh key if pattern has vsi", () => {
      let state = new newState();
      assert.deepEqual(state.store.json.ssh_keys, [
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
      let state = new newState();
      state.ssh_keys.delete({}, { data: { name: "ssh-key" } });
      assert.deepEqual(
        state.store.json.ssh_keys,
        [],
        "there should be no keys"
      );
      assert.deepEqual(state.store.sshKeys, [], "it should remove the ssh key");
    });
  });
  describe("ssh_keys.save", () => {
    it("should update an ssh key in place", () => {
      let state = new newState();
      state.ssh_keys.save(
        { name: "todd", show: false },
        { data: { name: "ssh-key" } }
      );
      assert.deepEqual(state.store.sshKeys, ["todd"], "it should be todd");
      assert.deepEqual(
        state.store.json.ssh_keys[0].name,
        "todd",
        "it should have a new name"
      );
    });
    it("should update an ssh key in place with same name", () => {
      let state = new newState();
      // for vsi test, dummy vsi
      state.store.json.vsi = [{ ssh_keys: ["ssh-key"] }];
      state.ssh_keys.save(
        { name: "ssh-key", public_key: "todd" },
        { data: { name: "ssh-key" } }
      );
      assert.deepEqual(
        state.store.json.ssh_keys[0].public_key,
        "todd",
        "it should have a new public key"
      );
    });
    it("should update an ssh key in place with same name not used by vsi", () => {
      let state = new newState();
      state.ssh_keys.create({ name: "frog" });
      state.ssh_keys.save({ name: "todd" }, { data: { name: "frog" } });
      assert.deepEqual(
        state.store.sshKeys,
        ["ssh-key", "todd"],
        "it should have a new name"
      );
    });
    it("should update vsi ssh key name", () => {
      let state = new newState();
      // for vsi test, dummy vsi
      state.store.json.vsi = [{ ssh_keys: ["ssh-key"] }];
      console.log("in first test");
      state.ssh_keys.save({ name: "frog" }, { data: { name: "ssh-key" } });
      assert.deepEqual(
        state.store.json.vsi[0].ssh_keys,
        ["frog"],
        "it should have a new ssh key"
      );
    });
  });
  describe("ssh_keys.create", () => {
    it("should create a new ssh key", () => {
      let state = new newState();
      state.ssh_keys.create({ name: "frog" });
      assert.deepEqual(
        state.store.sshKeys,
        ["ssh-key", "frog"],
        "it should have a new name"
      );
    });
  });
});
