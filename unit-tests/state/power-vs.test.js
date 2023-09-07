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

describe("power-vs", () => {
  describe("power.init", () => {
    it("should initialize power-vs", () => {
      let state = new newState();
      assert.deepEqual(state.store.json.power, []);
    });
  });
  describe("power.create", () => {
    it("should create a workspace", () => {
      let state = new newState();
      state.power.create({ name: "toad" });
      let expectedData = {
        name: "toad",
        resource_group: null,
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        images: [],
        attachments: [],
      };
      assert.deepEqual(
        state.store.json.power[0],
        expectedData,
        "it should create a new power vs"
      );
    });
  });
  describe("power.save", () => {
    it("should save a workspace", () => {
      let state = new newState();
      state.power.create({ name: "toad", zone: "dal10" });
      state.power.save(
        { name: "frog", zone: "dal10" },
        { data: { name: "toad" } }
      );
      let expectedData = {
        name: "frog",
        resource_group: null,
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        images: [],
        attachments: [],
        zone: "dal10",
      };
      assert.deepEqual(
        state.store.json.power[0],
        expectedData,
        "it should update name in place"
      );
    });
  });
  describe("power.delete", () => {
    it("should delete a workspace", () => {
      let state = new newState();
      state.power.create({ name: "toad" });
      state.power.delete({}, { data: { name: "toad" } });
      assert.deepEqual(
        state.store.json.power,
        [],
        "it should have no workspaces"
      );
    });
  });
  describe("power.ssh_keys crud", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        zone: "dal10",
      });
    });
    it("should create a ssh key", () => {
      state.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].ssh_keys,
        [{ name: "test-key", workspace: "power-vs", zone: "dal10" }],
        "it should create a ssh key"
      );
    });
    it("should update a ssh key", () => {
      state.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.ssh_keys.save(
        { name: "new-key-name" },
        {
          arrayParentName: "power-vs",
          data: { name: "test-key" },
        }
      );
      assert.deepEqual(
        state.store.json.power[0].ssh_keys,
        [{ name: "new-key-name", workspace: "power-vs", zone: "dal10" }],
        "it should update ssh key name"
      );
    });
    it("should delete a ssh key", () => {
      state.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.ssh_keys.delete(
        {},
        { arrayParentName: "power-vs", data: { name: "test-key" } }
      );
      assert.deepEqual(
        state.store.json.power[0].ssh_keys,
        [],
        "it should be empty"
      );
    });
  });
  describe("power.network crud", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        zone: "dal10",
      });
    });
    it("should create a network interface", () => {
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [{ name: "test-network", workspace: "power-vs", zone: "dal10" }],
        "it should create a network interface"
      );
    });
    it("should update a network interface", () => {
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.network.save(
        { name: "new-network-name" },
        {
          arrayParentName: "power-vs",
          data: { name: "test-network" },
        }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [{ name: "new-network-name", workspace: "power-vs", zone: "dal10" }],
        "it should update network name"
      );
    });
    it("should delete a network interface", () => {
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.network.delete(
        {},
        { arrayParentName: "power-vs", data: { name: "test-network" } }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [],
        "it should delete a network interface"
      );
    });
  });
});
