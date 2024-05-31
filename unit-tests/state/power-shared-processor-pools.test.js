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
  describe("power_shared_processor_pools.init", () => {
    it("should initialize power vs instances", () => {
      assert.deepEqual(
        craig.store.json.power_shared_processor_pools,
        [],
        "it should initialize data"
      );
    });
  });
  describe("power_shared_processor_pools.create", () => {
    it("should create a pool", () => {
      craig.power_shared_processor_pools.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_shared_processor_pool_host_group: "s922",
        pi_shared_processor_pool_reserved_cores: "2",
      });
      assert.deepEqual(
        craig.store.json.power_shared_processor_pools,
        [
          {
            zone: "dal12",
            workspace: "example",
            name: "test",
            pi_shared_processor_pool_host_group: "s922",
            pi_shared_processor_pool_reserved_cores: "2",
          },
        ],
        "it should create pool"
      );
    });
  });
  describe("power_placement_groups.save", () => {
    it("should save a pool", () => {
      craig.power_shared_processor_pools.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_shared_processor_pool_host_group: "s922",
        pi_shared_processor_pool_reserved_cores: "2",
      });
      craig.power_shared_processor_pools.save(
        {
          zone: "dal12",
          workspace: "example",
          name: "z",
          pi_shared_processor_pool_host_group: "s922",
          pi_shared_processor_pool_reserved_cores: "2",
        },
        {
          data: {
            zone: "dal12",
            workspace: "example",
            name: "test",
            pi_shared_processor_pool_host_group: "s922",
            pi_shared_processor_pool_reserved_cores: "2",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.power_shared_processor_pools,
        [
          {
            zone: "dal12",
            workspace: "example",
            name: "z",
            pi_shared_processor_pool_host_group: "s922",
            pi_shared_processor_pool_reserved_cores: "2",
          },
        ],
        "it should create pool"
      );
    });
  });
  describe("power_placement_groups.delete", () => {
    it("should create a pool", () => {
      craig.power_shared_processor_pools.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_shared_processor_pool_host_group: "s922",
        pi_shared_processor_pool_reserved_cores: "2",
      });
      craig.power_shared_processor_pools.delete(
        {},
        {
          data: {
            zone: "dal12",
            workspace: "example",
            name: "test",
            pi_shared_processor_pool_host_group: "s922",
            pi_shared_processor_pool_reserved_cores: "2",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.power_shared_processor_pools,
        [],
        "it should be empty"
      );
    });
  });
  describe("power_placement_groups.onStoreUpdate", () => {
    it("should update workspace and zone for each processor pool on deletion", () => {
      craig.power_shared_processor_pools.create({
        zone: "dal12",
        workspace: "example",
        name: "test",
        pi_shared_processor_pool_host_group: "s922",
        pi_shared_processor_pool_reserved_cores: "2",
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
        craig.store.json.power_shared_processor_pools,
        [
          {
            zone: null,
            workspace: null,
            name: "test",
            pi_shared_processor_pool_host_group: null,
            pi_shared_processor_pool_reserved_cores: "2",
          },
        ],
        "it should update"
      );
    });
  });
  describe("schema", () => {
    it("should return correct api endpoint for sys type", () => {
      assert.deepEqual(
        craig.power_shared_processor_pools.pi_shared_processor_pool_host_group.apiEndpoint(
          {
            zone: "frog",
          }
        ),
        "/api/power/frog/system_pools",
        "it should be equal"
      );
    });
    it("should hide sys type when no workspace", () => {
      assert.isTrue(
        craig.power_shared_processor_pools.pi_shared_processor_pool_host_group.hideWhen(
          {}
        ),
        "it should be hidden"
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
      craig.power_shared_processor_pools.workspace.onStateChange(data, {
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
    it("should have invalid cores", () => {
      assert.isTrue(
        craig.power_shared_processor_pools.pi_shared_processor_pool_reserved_cores.invalid(
          {
            pi_shared_processor_pool_reserved_cores: "",
          }
        ),
        "it should be true"
      );
      assert.isFalse(
        craig.power_shared_processor_pools.pi_shared_processor_pool_reserved_cores.invalid(
          {
            pi_shared_processor_pool_reserved_cores: "10",
          }
        ),
        "it should be false"
      );
    });
    it("should have invalid name", () => {
      assert.isTrue(
        craig.power_shared_processor_pools.name.invalid({ name: "" }),
        "it should be invalid"
      );
      assert.isTrue(
        craig.power_shared_processor_pools.name.invalid(
          { name: "ssssss-sss" },
          {
            craig: craig,
          }
        ),
        "it should be invalid"
      );
      assert.isTrue(
        craig.power_shared_processor_pools.name.invalid({
          name: "1234561234561",
        }),
        "it should be invalid"
      );
      assert.isTrue(
        craig.power_shared_processor_pools.name.invalid(
          {
            name: "dupe",
          },
          {
            craig: {
              store: {
                json: {
                  power_shared_processor_pools: [
                    {
                      name: "dupe",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be invalid when duplicate name"
      );
    });
    it("should have invalid name text", () => {
      assert.deepEqual(
        craig.power_shared_processor_pools.name.invalidText({ name: "" }),
        "Name must be between 2 and 12 characters and follow the regex pattern: /^[A-z]([a-z0-9]*[a-z0-9])*$/s",
        "it should have correct text"
      );
      assert.deepEqual(
        craig.power_shared_processor_pools.name.invalidText({
          name: "1234561234561",
        }),
        "Name must be between 2 and 12 characters and follow the regex pattern: /^[A-z]([a-z0-9]*[a-z0-9])*$/s",
        "it should have correct text"
      );
      assert.deepEqual(
        craig.power_shared_processor_pools.name.invalidText(
          {
            name: "dupe",
          },
          {
            craig: {
              store: {
                json: {
                  power_shared_processor_pools: [
                    {
                      name: "dupe",
                    },
                  ],
                },
              },
            },
          }
        ),
        'Name "dupe" in use',
        "It should have correct invalid text"
      );
    });
  });
});
