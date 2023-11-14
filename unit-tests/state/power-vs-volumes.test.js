const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state(true);
  store.setUpdateCallback(() => {});
  return store;
}

describe("power_volumes", () => {
  describe("power_volumes.init", () => {
    it("should initialize power vs volumes", () => {
      let state = newState();
      assert.deepEqual(
        state.store.json.power_volumes,
        [],
        "it should initialize data"
      );
    });
  });
  describe("power_volumes.onStoreUpdate", () => {
    it("should add power when not created on store update", () => {
      let state = newState();
      delete state.store.json.power_volumes;
      state.update();
      assert.deepEqual(
        state.store.json.power_volumes,
        [],
        "it should initialize data"
      );
    });
    it("should not remove found workspaces on store update", () => {
      let state = newState();
      state.power.create({
        name: "example",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power_volumes.create({
        name: "frog",
        workspace: "example",
      });
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: "example",
            attachments: [],
          },
        ],
        "it should create instance"
      );
    });
    it("should remove unfound workspaces on store update", () => {
      let state = newState();
      state.power.create({
        name: "example",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power_volumes.create({
        name: "frog",
        workspace: "oops",
      });
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: null,
            attachments: [],
          },
        ],
        "it should create instance"
      );
    });
    it("should not remove found instances on store update", () => {
      let state = newState();
      state.power.create({
        name: "example",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power_instances.create({
        name: "toad",
        image: "oops",
        ssh_key: "oops",
        network: [
          {
            name: "oops",
            ip_address: "1.2.3.4",
          },
        ],
        workspace: "oops",
        zone: "oops",
      });
      state.power_volumes.create({
        name: "frog",
        workspace: "example",
        attachments: ["toad"],
      });
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: "example",
            attachments: ["toad"],
          },
        ],
        "it should create instance"
      );
    });
    it("should remove unfound instances on store update", () => {
      let state = newState();
      state.power.create({
        name: "example",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power_instances.create({
        name: "toad2",
        image: "oops",
        ssh_key: "oops",
        network: [
          {
            name: "oops",
            ip_address: "1.2.3.4",
          },
        ],
        workspace: "example",
        zone: "oops",
      });
      state.power_volumes.create({
        name: "frog",
        workspace: "example",
        attachments: ["toad"],
      });
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: "example",
            attachments: [],
          },
        ],
        "it should create instance"
      );
    });
  });
  describe("power_volumes.create", () => {
    it("should create a new power vs instance", () => {
      let state = newState();
      state.power_volumes.create({
        name: "frog",
        workspace: "example",
      });
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: null,
            attachments: [],
          },
        ],
        "it should create instance"
      );
    });
  });
  describe("power_volumes.save", () => {
    it("should save a power vs volume", () => {
      let state = newState();
      state.power_volumes.create({
        name: "toad",
        workspace: null,
      });
      state.power_volumes.save(
        {
          name: "frog",
        },
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: null,
            attachments: [],
          },
        ],
        "it should save instance"
      );
    });
  });
  describe("power_volumes.delete", () => {
    it("should delete a power vs volume", () => {
      let state = newState();
      state.power_volumes.create({
        name: "toad",
        workspace: null,
      });
      state.power_volumes.delete(
        {
          name: "frog",
        },
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(
        state.store.json.power_volumes,
        [],
        "it should delete instance"
      );
    });
  });
});
