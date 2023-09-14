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

describe("power_instances", () => {
  describe("power_instances.init", () => {
    it("should initialize power vs instances", () => {
      let state = newState();
      assert.deepEqual(
        state.store.json.power_instances,
        [],
        "it should initialize data"
      );
    });
  });
  describe("power_instances.create", () => {
    it("should create a new power vs instance", () => {
      let state = newState();
      state.power_instances.create({
        name: "frog",
      });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "frog",
            image: null,
            ssh_key: null,
            network: [],
            workspace: null,
            zone: null,
          },
        ],
        "it should create instance"
      );
    });
  });
  describe("power_instances.save", () => {
    it("should save a power vs instance", () => {
      let state = newState();
      state.power_instances.create({
        name: "toad",
        image: null,
        ssh_key: null,
        network: [],
        workspace: null,
        zone: null,
      });
      state.power_instances.save(
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
        state.store.json.power_instances,
        [
          {
            name: "frog",
            image: null,
            ssh_key: null,
            network: [],
            workspace: null,
            zone: null,
          },
        ],
        "it should save instance"
      );
    });
  });
  describe("power_instances.delete", () => {
    it("should delete a power vs instance", () => {
      let state = newState();
      state.power_instances.create({
        name: "toad",
      });
      state.power_instances.delete(
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
        state.store.json.power_instances,
        [],
        "it should delete instance"
      );
    });
  });
  describe("power_instances.onStoreUpdate", () => {
    it("should add power when not created on store update", () => {
      let state = newState();
      delete state.store.json.power_instances;
      state.update();
      assert.deepEqual(
        state.store.json.power_instances,
        [],
        "it should initialize data"
      );
    });
    it("should update ssh key, network, image, and workspace when unfound", () => {
      let state = newState();
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
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
            network: [],
            workspace: null,
            zone: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should update ssh key, network, image, when workspace is unfound", () => {
      let state = newState();
      state.power.create({
        name: "toad",
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
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
            network: [],
            workspace: null,
            zone: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should not update image when still in existing workspace", () => {
      let state = newState();
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      state.power_instances.create({
        name: "toad",
        image: "7100-05-09",
        ssh_key: "oops",
        network: [
          {
            name: "oops",
            ip_address: "1.2.3.4",
          },
          {
            name: "test-network",
          },
        ],
        workspace: "toad",
        zone: "oops",
      });

      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: "7100-05-09",
            ssh_key: null,
            network: [
              {
                name: "test-network",
              },
            ],
            workspace: "toad",
            zone: "dal10",
          },
        ],
        "it should initialize data"
      );
    });
    it("should not update ssh key when still in existing workspace", () => {
      let state = newState();
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      state.power_instances.create({
        name: "toad",
        image: "7100-05-09",
        ssh_key: "test-key",
        network: [
          {
            name: "oops",
            ip_address: "1.2.3.4",
          },
          {
            name: "test-network",
          },
        ],
        workspace: "toad",
        zone: "oops",
      });

      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: "7100-05-09",
            ssh_key: "test-key",
            network: [
              {
                name: "test-network",
              },
            ],
            workspace: "toad",
            zone: "dal10",
          },
        ],
        "it should initialize data"
      );
    });
    it("should update image when no longer in existing workspace", () => {
      let state = newState();
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      state.power_instances.create({
        name: "toad",
        image: "oops",
        ssh_key: "oops",
        network: [
          {
            name: "oops",
            ip_address: "1.2.3.4",
          },
          {
            name: "test-network",
          },
        ],
        workspace: "toad",
        zone: "oops",
      });

      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
            network: [
              {
                name: "test-network",
              },
            ],
            workspace: "toad",
            zone: "dal10",
          },
        ],
        "it should initialize data"
      );
    });
  });
});
