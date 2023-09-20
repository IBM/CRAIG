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
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal12",
      });
      let expectedData = {
        name: "toad",
        resource_group: null,
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        images: [
          {
            name: "7100-05-09",
            pi_image_id: "35eca797-6599-4597-af1f-d2eb5e292dfc",
            workspace: "toad",
            zone: "dal12",
          },
        ],
        attachments: [],
        imageNames: ["7100-05-09"],
        zone: "dal12",
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
      state.power.create({ name: "toad", zone: "dal12", imageNames: [] });
      state.power.save(
        { name: "frog", zone: "dal12" },
        { data: { name: "toad" } }
      );
      let expectedData = {
        name: "frog",
        resource_group: null,
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        images: [],
        imageNames: [],
        attachments: [],
        zone: "dal12",
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
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal12",
      });
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
        zone: "dal12",
        imageNames: ["7100-05-09"],
      });
    });
    it("should create a ssh key", () => {
      state.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].ssh_keys,
        [{ name: "test-key", workspace: "power-vs", zone: "dal12" }],
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
        [{ name: "new-key-name", workspace: "power-vs", zone: "dal12" }],
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
        zone: "dal12",
        imageNames: ["7100-05-09"],
      });
    });
    it("should create a network interface", () => {
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [{ name: "test-network", workspace: "power-vs", zone: "dal12" }],
        "it should create a network interface"
      );
      assert.deepEqual(
        state.store.json.power[0].attachments,
        [
          {
            connections: [],
            workspace: "power-vs",
            zone: "dal12",
            network: "test-network",
          },
        ],
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
        [{ name: "new-network-name", workspace: "power-vs", zone: "dal12" }],
        "it should update network name"
      );
      assert.deepEqual(
        state.store.json.power[0].attachments,
        [
          {
            connections: [],
            workspace: "power-vs",
            zone: "dal12",
            network: "new-network-name",
          },
        ],
        "it should create a network interface"
      );
    });
    it("should update a network interface with same name", () => {
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.network.save(
        { name: "test-network" },
        {
          arrayParentName: "power-vs",
          data: { name: "test-network" },
        }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [{ name: "test-network", workspace: "power-vs", zone: "dal12" }],
        "it should update network name"
      );
      assert.deepEqual(
        state.store.json.power[0].attachments,
        [
          {
            connections: [],
            workspace: "power-vs",
            zone: "dal12",
            network: "test-network",
          },
        ],
        "it should create a network interface"
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
  describe("power.cloud_connections crud", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        zone: "dal12",
        imageNames: ["7100-05-09"],
      });
    });
    it("should create a cloud connection", () => {
      state.power.cloud_connections.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].cloud_connections,
        [{ name: "test-network", workspace: "power-vs", zone: "dal12" }],
        "it should create a cloud connection"
      );
    });
    it("should update a cloud connection", () => {
      state.power.cloud_connections.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.cloud_connections.save(
        { name: "new-network-name" },
        {
          arrayParentName: "power-vs",
          data: { name: "test-network" },
        }
      );
      assert.deepEqual(
        state.store.json.power[0].cloud_connections,
        [{ name: "new-network-name", workspace: "power-vs", zone: "dal12" }],
        "it should update cloud connection"
      );
    });
    it("should delete a cloud connection", () => {
      state.power.cloud_connections.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.cloud_connections.delete(
        {},
        { arrayParentName: "power-vs", data: { name: "test-network" } }
      );
      assert.deepEqual(
        state.store.json.power[0].cloud_connections,
        [],
        "it should delete a cloud connection"
      );
    });
  });
  describe("attachments", () => {
    it("should save attachment", () => {
      let state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        zone: "dal12",
        imageNames: ["7100-05-09"],
      });
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.cloud_connections.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      state.power.attachments.save(
        {
          network: "test-network",
          connections: ["test-network"],
        },
        {
          arrayParentName: "power-vs",
          data: {
            network: "test-network",
            connections: [],
          },
        }
      );
      assert.deepEqual(
        state.store.json.power[0].attachments,
        [
          {
            network: "test-network",
            workspace: "power-vs",
            zone: "dal12",
            connections: ["test-network"],
          },
        ],
        "it should delete a cloud connection"
      );
    });
  });
});
