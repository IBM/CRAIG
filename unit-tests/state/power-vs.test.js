const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const {
  hideWhenWorkspaceNotUseData,
} = require("../../client/src/lib/state/power-vs/power-vs");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state(true);
  store.setUpdateCallback(() => {});
  store.store.json._options.power_vs_zones = ["us-south", "dal10", "dal12"];
  return store;
}

describe("power-vs", () => {
  describe("power.init", () => {
    it("should initialize power-vs", () => {
      let state = new newState();
      assert.deepEqual(state.store.json.power, []);
    });
  });
  describe("power.onStoreUpdate", () => {
    it("should be able to update power vs when no power vs zones", () => {
      let state = newState();
      state.power.create({
        name: "toad",
        zone: "us-south",
      });
      state.store.json._options.power_vs_zones = undefined;
      let task = () => state.update();
      assert.doesNotThrow(task, "it should not throw");
    });
    it("should update images to only contain the selected image names", () => {
      let state = new newState();
      state.store.json._options.power_vs_zones = ["dal10", "us-south"];
      state.power.create({
        name: "toad",
        zone: "us-south",
      });
      state.store.json.power[0].images.push({ name: "imageName" });
      state.store.json.power[0].imageNames.push("otherImageName");
      state.update();
      assert.deepEqual(state.store.json.power[0], {
        attachments: [],
        cloud_connections: [],
        name: "toad",
        imageNames: ["otherImageName"],
        images: [],
        zone: "us-south",
        network: [],
        resource_group: null,
        ssh_keys: [],
      });
    });
    it("should set unfound workspaces to null on change of power vs zones", () => {
      let state = new newState();
      state.store.json._options.power_vs_zones = ["dal10", "us-south"];
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "us-south",
        imageNames: ["7100-05-09"],
      });
      state.store.json._options.power_vs_zones = [];
      state.update();
      let expectedData = {
        name: "toad",
        resource_group: null,
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        images: [
          {
            name: "7100-05-09",
            workspace: "toad",
            zone: null,
            workspace_use_data: false,
          },
        ],
        attachments: [],
        imageNames: ["7100-05-09"],
        zone: null,
      };
      assert.deepEqual(
        state.store.json.power[0],
        expectedData,
        "it should create a new power vs"
      );
    });
  });
  describe("power.create", () => {
    it("should create a workspace", () => {
      let state = new newState();
      state.power.create({
        name: "toad",
        images: [
          {
            name: "7100-05-09",
            pi_image_id: "35eca797-6599-4597-af1f-d2eb5e292dfc",
            workspace: "toad",
            zone: "us-south",
          },
        ],
        imageNames: ["7100-05-09"],
        zone: "us-south",
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
            zone: "us-south",
            workspace_use_data: false,
          },
        ],
        attachments: [],
        imageNames: ["7100-05-09"],
        zone: "us-south",
      };
      assert.deepEqual(
        state.store.json.power[0],
        expectedData,
        "it should create a new power vs"
      );
    });
  });
  describe("power.save", () => {
    it("should save a workspace and update instances, volumes, and tgw connections with new name", () => {
      let state = new newState();
      state.power.create({ name: "toad", zone: "dal10", imageNames: [] });
      state.power_instances.create({
        name: "frog",
        zone: "dal10",
        workspace: "toad",
        network: [],
      });
      state.power_instances.create({
        name: "frog",
        zone: "dal10",
        workspace: "bog",
        network: [],
      });
      state.transit_gateways.save(
        {
          connections: [
            { tgw: "todd", vpc: "management" },
            { tgw: "todd", vpc: "workload" },
            { tgw: "transit-gateway", power: "toad" },
          ],
        },
        {
          data: {
            name: "transit-gateway",
          },
        }
      );
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
        imageNames: [],
        attachments: [],
        zone: "dal10",
      };
      assert.deepEqual(
        state.store.json.power[0],
        expectedData,
        "it should update name in place"
      );
      assert.deepEqual(
        state.store.json.power_instances[0].workspace,
        "frog",
        "it should update name"
      );
      assert.deepEqual(
        state.store.json.transit_gateways[0].connections[2],
        {
          power: "frog",
          tgw: "transit-gateway",
        },
        "it should return correct data"
      );
    });
    it("should save a workspace and update instances, volumes, and vtl to remove storage pools and storage tiers", () => {
      let state = new newState();
      state.power.create({ name: "toad", zone: "dal10", imageNames: [] });
      state.power_instances.create({
        name: "frog",
        zone: "dal10",
        workspace: "toad",
        network: [],
        pi_storage_pool: "General-Flash-43",
        pi_storage_type: "Tier 1",
      });
      state.power_volumes.create({
        name: "foo",
        zone: "dal10",
        workspace: "toad",
        network: [],
        pi_volume_pool: "General-Flash-43",
        pi_volume_type: "Tier 3",
      });
      state.vtl.create({
        name: "bar",
        zone: "dal10",
        workspace: "toad",
        network: [],
        pi_storage_pool: "General-Flash-43",
        pi_storage_type: "Tier 3",
      });
      state.power.save(
        { name: "toad", zone: "dal12" },
        { data: { name: "toad", zone: "dal10" } }
      );
      let expectedData = {
        name: "toad",
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
        "it should update zone in place"
      );
      assert.deepEqual(
        state.store.json.power_instances[0].pi_storage_pool,
        "",
        "it should update instance storage pool"
      );
      assert.isNull(
        state.store.json.power_instances[0].pi_storage_type,
        "it should update instance storage type"
      );
      assert.deepEqual(
        state.store.json.power_volumes[0].pi_volume_pool,
        "",
        "it should update volume pool"
      );
      assert.isNull(
        state.store.json.power_volumes[0].pi_volume_type,
        "it should update volume type"
      );
      assert.deepEqual(
        state.store.json.vtl[0].pi_storage_pool,
        "",
        "it should update instance storage pool"
      );
      assert.isNull(
        state.store.json.vtl[0].pi_storage_type,
        "it should update instance storage type"
      );
    });
    it("should save a workspoace and not remove storage pools and storage tiers if instances, volumes, and vtl are not in workspace", () => {
      let state = new newState();
      state.power.create({ name: "toad", zone: "dal10", imageNames: [] });
      state.power.create({ name: "toad2", zone: "dal10", imageNames: [] });
      state.power_instances.create({
        name: "frog",
        zone: "dal10",
        workspace: "toad2",
        network: [],
        pi_storage_pool: "General-Flash-43",
        pi_storage_type: "Tier 1",
      });
      state.power_volumes.create({
        name: "foo",
        zone: "dal10",
        workspace: "toad2",
        network: [],
        pi_volume_pool: "General-Flash-43",
        pi_volume_type: "Tier 3",
      });
      state.vtl.create({
        name: "bar",
        zone: "dal10",
        workspace: "toad2",
        network: [],
        pi_storage_pool: "General-Flash-43",
        pi_storage_type: "Tier 3",
      });
      state.power.save(
        { name: "toad", zone: "dal12" },
        { data: { name: "toad", zone: "dal10" } }
      );
      let expectedData = {
        name: "toad",
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
        "it should update zone in place"
      );
      assert.deepEqual(
        state.store.json.power_instances[0].pi_storage_pool,
        "General-Flash-43",
        "it should update instance storage pool"
      );
      assert.deepEqual(
        state.store.json.power_instances[0].pi_storage_type,
        "Tier 1",
        "it should update instance storage type"
      );
      assert.deepEqual(
        state.store.json.power_volumes[0].pi_volume_pool,
        "General-Flash-43",
        "it should update volume pool"
      );
      assert.deepEqual(
        state.store.json.power_volumes[0].pi_volume_type,
        "Tier 3",
        "it should update volume type"
      );
      assert.deepEqual(
        state.store.json.vtl[0].pi_storage_pool,
        "General-Flash-43",
        "it should update instance storage pool"
      );
      assert.deepEqual(
        state.store.json.vtl[0].pi_storage_type,
        "Tier 3",
        "it should update instance storage type"
      );
    });
    it("should save a workspace and not alter any storage pools or storage tiers if zone was not changed", () => {
      let state = new newState();
      state.power.create({ name: "toad", zone: "dal10", imageNames: [] });
      state.power_instances.create({
        name: "frog",
        zone: "dal10",
        workspace: "toad",
        network: [],
        pi_storage_pool: "General-Flash-43",
        pi_storage_type: "Tier 1",
      });
      state.power_volumes.create({
        name: "foo",
        zone: "dal10",
        workspace: "toad",
        network: [],
        pi_volume_pool: "General-Flash-43",
        pi_volume_type: "Tier 3",
      });
      state.vtl.create({
        name: "bar",
        zone: "dal10",
        workspace: "toad",
        network: [],
        pi_storage_pool: "General-Flash-43",
        pi_storage_type: "Tier 3",
      });
      state.power.save(
        { name: "cat", zone: "dal10" },
        { data: { name: "toad", zone: "dal10" } }
      );
      let expectedData = {
        name: "cat",
        resource_group: null,
        ssh_keys: [],
        network: [],
        cloud_connections: [],
        images: [],
        imageNames: [],
        attachments: [],
        zone: "dal10",
      };
      assert.deepEqual(
        state.store.json.power[0],
        expectedData,
        "it should update name in place"
      );
      assert.deepEqual(
        state.store.json.power_instances[0].pi_storage_pool,
        "General-Flash-43",
        "it should update instance storage pool"
      );
      assert.deepEqual(
        state.store.json.power_instances[0].pi_storage_type,
        "Tier 1",
        "it should update instance storage type"
      );
      assert.deepEqual(
        state.store.json.power_volumes[0].pi_volume_pool,
        "General-Flash-43",
        "it should update volume pool"
      );
      assert.deepEqual(
        state.store.json.power_volumes[0].pi_volume_type,
        "Tier 3",
        "it should update volume type"
      );
      assert.deepEqual(
        state.store.json.vtl[0].pi_storage_pool,
        "General-Flash-43",
        "it should update instance storage pool"
      );
      assert.deepEqual(
        state.store.json.vtl[0].pi_storage_type,
        "Tier 3",
        "it should update instance storage type"
      );
    });
  });
  describe("power.delete", () => {
    it("should delete a workspace", () => {
      let state = new newState();
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "us-south",
      });
      state.power.delete({}, { data: { name: "toad" } });
      assert.deepEqual(
        state.store.json.power,
        [],
        "it should have no workspaces"
      );
    });
  });
  describe("power.schema", () => {
    describe("state.power.name.helperText", () => {
      it("should return correct helper text for name when use data", () => {
        let state = newState();
        assert.deepEqual(
          state.power.name.helperText({ use_data: true, name: "name" }),
          "name",
          "it should return correct helper text"
        );
      });
      it("should return correct helper text", () => {
        let state = newState();
        assert.deepEqual(
          state.power.name.helperText(
            { name: "frog" },
            {
              craig: {
                store: {
                  json: {
                    _options: {
                      prefix: "toad",
                    },
                  },
                },
              },
            }
          ),
          "toad-power-workspace-frog",
          "it should return correct helper text"
        );
      });
    });
    describe("power.zone", () => {
      describe("power.zone.onStateChange", () => {
        it("should set images when changing zone", () => {
          let craig = newState();
          let data = {};
          let expectedData = {
            images: [],
            imageNames: [],
          };
          craig.power.zone.onStateChange(data);
          assert.deepEqual(data, expectedData, "it should set images");
        });
      });
      describe("power.zone.groups", () => {
        it("should return list of zones", () => {
          let craig = newState();
          craig.store.json._options.power_vs_zones = ["zone"];
          assert.deepEqual(
            craig.power.zone.groups({}, { craig: craig }),
            ["zone"],
            "it should return a list of zones"
          );
        });
      });
    });
    describe("power.images", () => {
      it("should not be invalid when using data", () => {
        let craig = newState();
        assert.isFalse(
          craig.power.imageNames.invalid({ use_data: true }),
          "it should be false"
        );
      });
      it("should return images and zone for updated key", () => {
        let craig = newState();
        assert.deepEqual(
          craig.power.imageNames.forceUpdateKey({
            images: [{ name: "image" }],
            zone: "us-south",
          }),
          '[{"name":"image"}]us-south',
          "it should return images array"
        );
      });
      it("should return groups when no zone", () => {
        let craig = newState();
        assert.deepEqual(
          craig.power.imageNames.groups({}),
          [],
          "it should return empty array"
        );
      });
      it("should return correct api endpoint for images", () => {
        let craig = newState();
        assert.deepEqual(
          craig.power.imageNames.apiEndpoint(
            {
              zone: "us-south",
            },
            {
              craig: {
                store: {
                  json: {
                    _options: {
                      region: "us-south",
                    },
                  },
                },
              },
            }
          ),
          `/api/power/us-south/images`,
          "it should return api endpoint"
        );
      });
      it("should return correct api endpoint for images when workspace uses data", () => {
        let craig = newState();
        assert.deepEqual(
          craig.power.imageNames.apiEndpoint(
            {
              use_data: true,
              name: "frog",
              zone: "us-south",
            },
            {
              craig: {
                store: {
                  json: {
                    _options: {
                      region: "us-south",
                    },
                  },
                },
              },
            }
          ),
          `/api/power/us-south/images?name=frog`,
          "it should return api endpoint"
        );
      });
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
        zone: "us-south",
        images: [{ name: "7100-05-09", workspace: "toad" }],
      });
    });
    it("should create a ssh key", () => {
      state.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].ssh_keys,
        [
          {
            name: "test-key",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: false,
          },
        ],
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
        [
          {
            name: "new-key-name",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: false,
          },
        ],
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
    describe("power.ssh_keys.schema", () => {
      describe("public_key", () => {
        describe("invalidText", () => {
          it("should return correct invalid text when a duplicate ssh key is added", () => {
            let tempState = newState();
            tempState.store = {
              resourceGroups: ["hi"],
              json: {
                ssh_keys: [],
                power: [
                  {
                    name: "workspace",
                    ssh_keys: [
                      {
                        name: "honk",
                        public_key:
                          "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                      },
                      {
                        name: "ddd",
                        public_key:
                          "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                      },
                      {
                        name: "aaa",
                        public_key: "NONE",
                      },
                    ],
                  },
                ],
              },
            };
            assert.deepEqual(
              tempState.power.ssh_keys.public_key.invalidText(
                {
                  name: "test",
                  resource_group: "hi",
                  public_key: "sssss",
                },
                {
                  data: {
                    data: "test",
                  },
                  arrayParentName: "workspace",
                  craig: tempState,
                }
              ),
              "Provide a unique SSH public key for this workspace",
              "it should return correct text"
            );
            assert.deepEqual(
              tempState.power.ssh_keys.public_key.invalidText(
                {
                  name: "test",
                  resource_group: "hi",
                  public_key:
                    "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                },
                {
                  data: {
                    data: "test",
                  },
                  arrayParentName: "workspace",
                  craig: tempState,
                }
              ),
              "SSH Public Key in use",
              "it should return correct text"
            );
          });
          it("should return correct invalid text when not a duplicate ssh key is added", () => {
            let tempState = newState();
            tempState.store = {
              resourceGroups: ["hi"],
              json: {
                ssh_keys: [],
                power: [
                  {
                    name: "workspace",
                    ssh_keys: [
                      {
                        name: "honk",
                        public_key:
                          "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                      },
                      {
                        name: "ddd",
                        public_key:
                          "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                      },
                      {
                        name: "aaa",
                        public_key: "NONE",
                      },
                    ],
                  },
                ],
              },
            };
            assert.deepEqual(
              tempState.power.ssh_keys.public_key.invalidText(
                {
                  name: "test",
                  resource_group: "hi",
                  public_key: "NONE",
                },
                {
                  data: {
                    data: "test",
                  },
                  arrayParentName: "workspace",
                  craig: tempState,
                }
              ),
              "",
              "it should return correct text"
            );
          });
        });
        describe("invalid", () => {
          it("should return true when key in modal is invalid when no data", () => {
            assert.isTrue(
              state.power.ssh_keys.public_key.invalid(
                {
                  public_key: "",
                },
                {
                  arrayParentName: "workspace",
                }
              )
            );
          });
          it("should return true when key name matches data name", () => {
            state.power.ssh_keys.create(
              { name: "test-key", public_key: "aaa" },
              { innerFormProps: { arrayParentName: "power-vs" } }
            );
            delete state.store.json.power[0].ssh_keys[0].workspace;
            assert.isTrue(
              state.power.ssh_keys.public_key.invalid(
                {
                  public_key: "aaa",
                  name: "name",
                },
                {
                  arrayParentName: "workspace",
                  data: {
                    name: "name",
                  },
                }
              )
            );
          });
        });
      });
      beforeEach(() => {
        state = new newState();
        state.power.create({
          name: "power-vs",
          resource_group: "default",
          zone: "us-south",
          images: [{ name: "7100-05-09", workspace: "toad" }],
        });
      });
    });
  });
  describe("power.network crud", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        zone: "us-south",
        images: [{ name: "7100-05-09", workspace: "toad" }],
      });
    });
    it("should create a network interface", () => {
      state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        zone: "us-south",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        use_data: true,
        pi_network_jumbo: false,
      });
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [
          {
            name: "test-network",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: true,
            pi_network_mtu: "",
          },
        ],
        "it should create a network interface"
      );
      assert.deepEqual(
        state.store.json.power[0].attachments,
        [
          {
            connections: [],
            workspace: "power-vs",
            zone: "us-south",
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
        { name: "new-network-name", pi_network_mtu: "2000" },
        {
          arrayParentName: "power-vs",
          data: { name: "test-network" },
        }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [
          {
            name: "new-network-name",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: false,
            pi_network_mtu: "2000",
          },
        ],
        "it should update network name"
      );
      assert.deepEqual(
        state.store.json.power[0].attachments,
        [
          {
            connections: [],
            workspace: "power-vs",
            zone: "us-south",
            network: "new-network-name",
            workspace_use_data: false,
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
      state.store.json.power[0].attachments = [];
      state.power.network.save(
        { name: "new-network-name", pi_network_jumbo: true },
        {
          arrayParentName: "power-vs",
          data: { name: "test-network" },
        }
      );
      assert.deepEqual(
        state.store.json.power[0].network,
        [
          {
            name: "new-network-name",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: false,
            pi_network_mtu: "9000",
            pi_network_jumbo: true,
          },
        ],
        "it should update network name"
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
        [
          {
            name: "test-network",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: false,
            pi_network_mtu: "",
          },
        ],
        "it should update network name"
      );
      assert.deepEqual(
        state.store.json.power[0].attachments,
        [
          {
            connections: [],
            workspace: "power-vs",
            zone: "us-south",
            network: "test-network",
            workspace_use_data: false,
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
    describe("power.network.schema", () => {
      describe("pi_network_mtu", () => {
        let craig;
        beforeEach(() => {
          craig = newState();
        });
        describe("power.network.pi_cidr.invalidText", () => {
          it("should return correct text if cidr is null", () => {
            assert.deepEqual(
              craig.power.network.pi_cidr.invalidText(
                { cidr: null },
                { data: { cidr: "1.2.3.4/5" } }
              ),
              "Invalid CIDR block",
              "it should return correct data"
            );
          });
          it("should return correct text if cidr is not valid", () => {
            assert.deepEqual(
              craig.power.network.pi_cidr.invalidText(
                { cidr: "aaa" },
                { data: { cidr: "1.2.3.4/5" } }
              ),
              "Invalid CIDR block",
              "it should return correct data"
            );
          });
          it("should return correct text if cidr is too many addresses", () => {
            assert.deepEqual(
              craig.power.network.pi_cidr.invalidText(
                { cidr: "10.0.0.0/11" },
                { data: { cidr: "1.2.3.4/5" } }
              ),
              "CIDR ranges of /17 or less are not supported",
              "it should return correct data"
            );
          });
          it("should return correct text if cidr overlaps with existing cidr", () => {
            assert.deepEqual(
              craig.power.network.pi_cidr.invalidText(
                { cidr: "10.10.30.0/24" },
                { data: {}, craig: craig }
              ),
              "Warning: CIDR overlaps with 10.10.30.0/24",
              "it should return correct data"
            );
          });
          it("should return correct text if cidr does not overlap with existing cidr", () => {
            assert.deepEqual(
              craig.power.network.pi_cidr.invalidText(
                { cidr: "10.10.80.0/24" },
                { data: {}, craig: craig }
              ),
              "",
              "it should return correct data"
            );
          });
          it("should return correct text if cidr matches previous cidr", () => {
            assert.deepEqual(
              craig.power.network.pi_cidr.invalidText(
                { cidr: "10.10.80.0/24" },
                { data: { cidr: "10.10.80.0/24" } }
              ),
              "",
              "it should return correct data"
            );
          });
        });
        it("should have correct invalid value for network mtu", () => {
          assert.isFalse(
            craig.power.network.pi_network_mtu.invalid({
              use_data: true,
            }),
            "it should be valid"
          );
          assert.isTrue(
            craig.power.network.pi_network_mtu.invalid({
              pi_network_mtu: "fff",
            }),
            "it should be invalid"
          );
        });
        it("should show correct on render if network jumbo", () => {
          assert.deepEqual(
            craig.power.network.pi_network_mtu.onRender({
              pi_network_jumbo: true,
            }),
            "9000",
            "it should return correct data"
          );
          assert.deepEqual(
            craig.power.network.pi_network_mtu.onRender({
              pi_network_jumbo: true,
              pi_network_mtu: "8000",
            }),
            "8000",
            "it should return correct data"
          );
          assert.deepEqual(
            craig.power.network.pi_network_mtu.onRender({
              pi_network_jumbo: false,
            }),
            "1500",
            "it should return correct data"
          );
          assert.deepEqual(
            craig.power.network.pi_network_mtu.onRender({
              pi_network_mtu: "1400",
            }),
            "1400",
            "it should return correct data"
          );
        });
      });
      describe("pi_cidr", () => {
        describe("invalidText", () => {
          it("should return correct invalid text for invalid pi cidr", () => {
            assert.deepEqual(
              state.power.network.pi_cidr.invalidText(
                {
                  pi_cidr: "aaaa",
                },
                {
                  data: {
                    cidr: "",
                  },
                }
              ),
              "Invalid CIDR block",
              "it should return correct data"
            );
          });
        });
      });
      describe("pi_dns", () => {
        describe("invalid", () => {
          it("should return true if the pi_dns value is string", () => {
            assert.isTrue(
              state.power.network.pi_dns.invalid({ pi_dns: "" }),
              "it should be true"
            );
          });
          it("should return true if the pi_dns value is null", () => {
            assert.isTrue(
              state.power.network.pi_dns.invalid({}),
              "it should be true"
            );
          });
        });
        describe("invalidText", () => {
          it("should return correct invalid text", () => {
            assert.deepEqual(
              state.power.network.pi_dns.invalidText(),
              "Invalid IP Address",
              "it should return correct invalid text"
            );
          });
        });
        describe("helperText", () => {
          it("should be null", () => {
            assert.isNull(
              state.power.network.pi_dns.helperText(),
              "it should be null"
            );
          });
        });
        describe("onInputChange", () => {
          it("should add target data to array", () => {
            let craig = newState();
            let data = {
              pi_dns: "dns",
            };
            data.pi_dns = craig.power.network.pi_dns.onInputChange(data, "dns");
            assert.deepEqual(
              data,
              {
                pi_dns: ["dns"],
              },
              "it should set data"
            );
          });
        });
        describe("onRender", () => {
          it("should return string data", () => {
            let craig = newState();
            let data = {
              pi_dns: ["dns"],
            };
            assert.deepEqual(
              craig.power.network.pi_dns.onRender(data),
              "dns",
              "it should return value"
            );
          });
          it("should return string data", () => {
            let craig = newState();
            let data = {};
            assert.deepEqual(
              craig.power.network.pi_dns.onRender(data),
              "",
              "it should return value"
            );
          });
        });
      });
      it("should hide subnet use data when not workspace use data", () => {
        let state = newState();
        assert.isTrue(
          state.power.network.use_data.hideWhen({}),
          "it should be hidden"
        );
      });
      it("should not have pi cidr invalid when use data", () => {
        let state = newState();
        assert.isFalse(
          state.power.network.pi_cidr.invalid({
            use_data: true,
          }),
          "it should be use data"
        );
      });
      it("should not have pi_dns invalid when use data", () => {
        let state = newState();
        assert.isFalse(
          state.power.network.pi_dns.invalid({
            use_data: true,
          }),
          "it should be use data"
        );
      });
    });
  });
  describe("power.cloud_connections crud", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        zone: "us-south",
        images: [{ name: "7100-05-09", workspace: "power-vs" }],
      });
    });
    it("should create a cloud connection", () => {
      state.power.cloud_connections.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "power-vs" } }
      );
      assert.deepEqual(
        state.store.json.power[0].cloud_connections,
        [
          {
            name: "test-network",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: false,
          },
        ],
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
        [
          {
            name: "new-network-name",
            workspace: "power-vs",
            zone: "us-south",
            workspace_use_data: false,
          },
        ],
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
    describe("power.cloud_connections.schema", () => {
      describe("power.cloud_connections.transit_gateways", () => {
        describe("power.cloud_connections.transit_gateways.hideWhen", () => {
          it("should return false if pi_cloud_connection_transit_enabled is true", () => {
            assert.isFalse(
              state.power.cloud_connections.transit_gateways.hideWhen({
                pi_cloud_connection_transit_enabled: true,
              }),
              "it should be shown"
            );
          });
        });
        describe("power.cloud_connections.transit_gateways.groups", () => {
          it("should return false if pi_cloud_connection_transit_enabled is true", () => {
            assert.deepEqual(
              state.power.cloud_connections.transit_gateways.groups(
                {
                  pi_cloud_connection_transit_enabled: true,
                },
                {
                  craig: state,
                }
              ),
              ["transit-gateway"],
              "it should return list of tgws"
            );
          });
        });
      });
    });
  });
  describe("attachments", () => {
    it("should save attachment", () => {
      let state = new newState();
      state.power.create({
        name: "power-vs",
        resource_group: "default",
        zone: "us-south",
        images: [{ name: "7100-05-09", workspace: "power-vs" }],
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
            zone: "us-south",
            connections: ["test-network"],
            workspace_use_data: false,
          },
        ],
        "it should delete a cloud connection"
      );
    });
    describe("attachments schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
        craig.power.create({
          name: "power-vs",
          resource_group: "default",
          zone: "us-south",
          images: [{ name: "7100-05-09", workspace: "power-vs" }],
        });
        craig.power.cloud_connections.create(
          { name: "test-network" },
          { innerFormProps: { arrayParentName: "power-vs" } }
        );
      });
      it("should return false for invalid", () => {
        assert.isFalse(
          craig.power.attachments.connections.invalid(),
          "it should not be invalid"
        );
      });
      it("should return groups", () => {
        assert.deepEqual(
          craig.power.attachments.connections.groups(
            {},
            {
              craig: craig,
              arrayParentName: "power-vs",
            }
          ),
          ["test-network"],
          "it should not be invalid"
        );
      });
    });
  });
  describe("hideWhenWorkspaceNotUseData", () => {
    it("should be true when workspace does not use data", () => {
      assert.isTrue(
        hideWhenWorkspaceNotUseData({ workspace_use_data: false }),
        "it should be hidden"
      );
    });
  });
});
