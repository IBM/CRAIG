const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state(true);
  store.setUpdateCallback(() => {});
  store.store.json._options.power_vs_zones = ["dal12", "dal10"];
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
    it("should set unfound workspaces to null on change of power vs zones", () => {
      let state = new newState();
      state.store.json._options.power_vs_zones = ["dal10", "dal12"];
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal12",
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
            pi_image_id: "ERROR: ZONE UNDEFINED",
            workspace: "toad",
            zone: null,
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
    it("should save a workspace and update instances and volumes with new name", () => {
      let state = new newState();
      state.power.create({ name: "toad", zone: "dal12", imageNames: [] });
      state.power_instances.create({
        name: "frog",
        zone: "dal12",
        workspace: "toad",
        network: [],
      });
      state.power_instances.create({
        name: "frog",
        zone: "dal12",
        workspace: "bog",
        network: [],
      });
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
      assert.deepEqual(
        state.store.json.power_instances[0].workspace,
        "frog",
        "it should update name"
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
  describe("power.schema", () => {
    describe("power.zone", () => {
      describe("power.zone.onStateChange", () => {
        it("should set imageNames when changing zone", () => {
          let craig = newState();
          let data = {};
          let expectedData = {
            imageNames: [],
            images: [],
          };
          craig.power.zone.onStateChange(data);
          assert.deepEqual(data, expectedData, "it should set image names");
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
    describe("power.imageNames", () => {
      it("should return groups when no zone", () => {
        let craig = newState();
        assert.deepEqual(
          craig.power.imageNames.groups({ zone: "" }),
          [],
          "it should return empty array"
        );
      });
      it("should return name of zone for force update key", () => {
        let craig = newState();
        assert.deepEqual(
          craig.power.imageNames.forceUpdateKey({ zone: "zone" }),
          "zone",
          "it should return empty array"
        );
      });
      it("should return groups when zone", () => {
        let craig = newState();
        assert.deepEqual(
          craig.power.imageNames.groups({ zone: "dal12" }).length,
          33,
          "it should return image names"
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
    describe("power.ssh_keys.schema", () => {
      describe("public_key", () => {
        describe("invalidText", () => {
          it("should return correct invalid text when a duplicate ssh key is added", () => {
            let tempState = newState();
            tempState.store = {
              resourceGroups: ["hi"],
              json: {
                ssh_keys: [
                  {
                    name: "honk",
                    public_key:
                      "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                  },
                ],
                power: [
                  {
                    name: "workspace",
                    ssh_keys: [
                      {
                        name: "ddd",
                        public_key:
                          "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
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
    describe("power.network.schema", () => {
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
        });
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
    describe("attachments schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
        craig.power.create({
          name: "power-vs",
          resource_group: "default",
          zone: "dal12",
          imageNames: ["7100-05-09"],
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
});
