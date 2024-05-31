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
  let craig;
  beforeEach(() => {
    craig = newState();
    craig.store.json._options.power_vs_zones = ["dal12", "dal10"];
    craig.power.create({
      name: "example",
      imageNames: ["7100-05-09"],
      zone: "dal10",
    });
  });
  describe("power_placement_groups.init", () => {
    it("should initialize power vs instances", () => {
      assert.deepEqual(
        craig.store.json.power_placement_groups,
        [],
        "it should initialize data"
      );
    });
  });
  describe("power_placement_groups.create", () => {
    it("should create a pool", () => {
      craig.power_placement_groups.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_placement_group_policy: "affinity",
      });
      assert.deepEqual(
        craig.store.json.power_placement_groups,
        [
          {
            zone: "dal12",
            workspace: "example",
            name: "test",
            pi_placement_group_policy: "affinity",
          },
        ],
        "it should create pool"
      );
    });
  });
  describe("power_placement_groups.save", () => {
    it("should save a pool", () => {
      craig.power_placement_groups.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_placement_group_policy: "affinity",
      });
      craig.power_placement_groups.save(
        {
          zone: "dal12",
          workspace: "example",
          name: "z",
          pi_placement_group_policy: "affinity",
        },
        {
          data: {
            zone: "dal12",
            workspace: "example",
            name: "test",
            pi_placement_group_policy: "affinity",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.power_placement_groups,
        [
          {
            zone: "dal12",
            workspace: "example",
            name: "z",
            pi_placement_group_policy: "affinity",
          },
        ],
        "it should create pool"
      );
    });
  });
  describe("power_placement_groups.delete", () => {
    it("should create a pool", () => {
      craig.power_placement_groups.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_placement_group_policy: "affinity",
      });
      craig.power_placement_groups.delete(
        {},
        {
          data: {
            zone: "dal12",
            workspace: "example",
            name: "test",
            pi_placement_group_policy: "affinity",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.power_placement_groups,
        [],
        "it should be empty"
      );
    });
  });
  describe("power_placement_groups.onStoreUpdate", () => {
    it("should update workspace and zone for each processor pool on deletion", () => {
      craig.power_placement_groups.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_placement_group_policy: "affinity",
      });
      craig.power.delete(
        {},
        {
          data: {
            name: "example",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.power_placement_groups,
        [
          {
            zone: null,
            workspace: null,
            name: "test",
            pi_placement_group_policy: "affinity",
          },
        ],
        "it should update"
      );
    });
  });
  describe("schema", () => {
    it("should return correct value for policy on render", () => {
      assert.deepEqual(
        craig.power_placement_groups.pi_placement_group_policy.onRender({
          pi_placement_group_policy: null,
        }),
        "",
        "it should return correct policy"
      );
      assert.deepEqual(
        craig.power_placement_groups.pi_placement_group_policy.onRender({
          pi_placement_group_policy: "anti-affinity",
        }),
        "Anti-Affinity",
        "it should return correct policy"
      );
    });
    it("should update workspace and zone on change", () => {
      craig.store.json._options.power_vs_zones = ["dal12"];
      craig.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal12",
        network: [],
        ssh_keys: [],
      });
      let data = {
        workspace: "toad",
      };
      craig.power_placement_groups.workspace.onStateChange(data, {
        craig: craig,
      });
      assert.deepEqual(
        data,
        {
          workspace: "toad",
          zone: "dal12",
        },
        "it should return list of workspaces"
      );
    });
  });
});
