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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("power_volumes.init", () => {
    it("should initialize power vs volumes", () => {
      assert.deepEqual(
        craig.store.json.power_volumes,
        [],
        "it should initialize data"
      );
    });
  });
  it("should add power when not created on store update", () => {
    delete craig.store.json.power_volumes;
    craig.update();
    assert.deepEqual(
      craig.store.json.power_volumes,
      [],
      "it should initialize data"
    );
  });
  describe("power_volumes.onStoreUpdate", () => {
    beforeEach(() => {
      craig.store.json._options.power_vs_zones = ["dal10"];
      craig.power.create({
        name: "example",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
    });
    it("should not remove found workspaces on store update", () => {
      craig.power_volumes.create({
        name: "frog",
        workspace: "example",
      });
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: "example",
            attachments: [],
            zone: "dal10",
            pi_volume_type: null,
          },
        ],
        "it should create instance"
      );
    });
    it("should update workspace zone found workspaces on store update", () => {
      craig.store.json._options.power_vs_zones = ["eu-de-1"];
      craig.power.save(
        {
          name: "example",
          zone: "eu-de-1",
        },
        {
          data: {
            name: "example",
          },
          craig: state,
        }
      );
      craig.power_volumes.create({
        name: "frog",
        workspace: "example",
      });
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: "example",
            attachments: [],
            zone: "eu-de-1",
            pi_volume_type: null,
          },
        ],
        "it should create instance"
      );
    });
    it("should remove unfound workspaces on store update", () => {
      craig.power_volumes.create({
        name: "frog",
        workspace: "oops",
      });
      assert.deepEqual(
        craig.store.json.power_volumes,
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
      craig.power_instances.create({
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
      craig.power_volumes.create({
        name: "frog",
        workspace: "example",
        attachments: ["toad"],
      });
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: "example",
            attachments: ["toad"],
            zone: "dal10",
            pi_volume_type: null,
          },
        ],
        "it should create instance"
      );
    });
    it("should remove unfound instances on store update", () => {
      craig.power_instances.create({
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
      craig.power_volumes.create({
        name: "frog",
        workspace: "example",
        attachments: ["toad"],
      });
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            name: "frog",
            workspace: "example",
            attachments: [],
            zone: "dal10",
            pi_volume_type: null,
          },
        ],
        "it should create instance"
      );
    });
  });
  describe("power volumes crud", () => {
    beforeEach(() => {
      craig.power_volumes.create({
        name: "frog",
        workspace: "example",
      });
    });
    describe("power_volumes.create", () => {
      it("should create a new power vs instance", () => {
        assert.deepEqual(
          craig.store.json.power_volumes,
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
        craig.power_volumes.save(
          {
            name: "toad",
          },
          {
            data: {
              name: "frog",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.power_volumes,
          [
            {
              name: "toad",
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
        craig.power_volumes.delete(
          {
            name: "toad",
          },
          {
            data: {
              name: "frog",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.power_volumes,
          [],
          "it should delete instance"
        );
      });
    });
  });
  describe("power_volumes.schema", () => {
    it("should return correct invalid text when no workspace", () => {
      assert.deepEqual(
        craig.power_volumes.pi_anti_affinity_instance.invalidText({
          workspace: null,
        }),
        "Select a workspace",
        "it should return correct text"
      );
    });
    it("should return correct invalid text when workspace", () => {
      assert.deepEqual(
        craig.power_volumes.pi_anti_affinity_instance.invalidText({
          workspace: "ws",
        }),
        "Select an anti affinity instance",
        "it should return correct text"
      );
    });
    it("should change state when storage option changes", () => {
      let data = {};
      craig.power_volumes.storage_option.onStateChange(data);
      assert.deepEqual(
        data,
        {
          affinity_type: null,
          pi_affinity_instance: null,
          pi_affinity_policy: null,
          pi_affinity_volume: null,
          pi_anti_affinity_instance: null,
          pi_anti_affinity_volume: null,
          pi_volume_pool: null,
        },
        "it should return correct data"
      );
    });
    it("should not have count as invalid when null or empty string", () => {
      assert.isFalse(
        craig.power_volumes.count.invalid({}),
        "it should be valid"
      );
    });
    it("should have invalid count if less than 1", () => {
      assert.isTrue(
        craig.power_volumes.count.invalid({ count: "-12" }),
        "it should be invalid"
      );
    });
    it("should have invalid count if greater than 1 and not whole number", () => {
      assert.isTrue(
        craig.power_volumes.count.invalid({ count: "1.2" }),
        "it should be invalid"
      );
    });
    it("should disable workspace select when sap", () => {
      assert.isTrue(
        craig.power_volumes.workspace.disabled({}, { data: { sap: true } }),
        "it should be disabled"
      );
    });
    it("should not disable workspace select when no sap as part of data object", () => {
      assert.isFalse(
        craig.power_volumes.workspace.disabled({}, { data: {} }),
        "it should be disabled"
      );
    });
    it("should return storage pool select invalid text when no workspace", () => {
      assert.deepEqual(
        craig.power_volumes.pi_volume_pool.invalidText({}),
        "Select a workspace",
        "it should return correct invalid text"
      );
    });
    it("should return storage pool select invalid text when workspace", () => {
      assert.deepEqual(
        craig.power_volumes.pi_volume_pool.invalidText({ workspace: "ok" }),
        "Select a storage pool",
        "it should return correct invalid text"
      );
    });
    it("should not disable replication on input change when zone is replication enabled", () => {
      let data = {
        zone: "dal10",
        pi_volume_pool: "General-Flash-53 (Replication Enabled)",
        pi_replication_enabled: true,
      };
      let actualData = craig.power_volumes.pi_volume_pool.onInputChange(data);
      assert.deepEqual(actualData, "General-Flash-53", "should return pool");
      assert.isTrue(data.pi_replication_enabled, "should be true");
    });
    it("should disable replication on input change when zone is not replication enabled", () => {
      let data = {
        zone: "eu-es",
        pi_volume_pool: "General-Flash-53",
        pi_replication_enabled: true,
      };
      let actualData = craig.power_volumes.pi_volume_pool.onInputChange(data);
      assert.deepEqual(actualData, "General-Flash-53", "should return pool");
      assert.isFalse(data.pi_replication_enabled, "should be false");
    });
    it("should update state on workspace change", () => {
      let actualData = {};
      craig.power_volumes.workspace.onStateChange(
        actualData,
        {
          data: { sap: true },
          craig: craig,
        },
        "ws"
      );
      assert.deepEqual(
        actualData,
        {
          attachments: [],
          pi_affinity_volume: null,
          pi_affinity_instance: null,
          pi_anti_affinity_volume: null,
          pi_anti_affinity_instance: null,
          workspace: "ws",
          zone: undefined,
        },
        "it should reset data"
      );
    });
    it("should update volumes and toggle when changing state for enable volume sharing", () => {
      let actualData = {
        pi_volume_shareable: false,
      };
      craig.power_volumes.pi_volume_shareable.onStateChange(actualData);
      assert.deepEqual(
        actualData,
        {
          pi_volume_shareable: true,
          attachments: [],
        },
        "it should update attachments"
      );
    });
    it("should have invalid pi_volume_size when out of range", () => {
      assert.isTrue(
        craig.power_volumes.pi_volume_size.invalid({
          pi_volume_size: -1,
        }),
        "it should be invalid"
      );
    });
    it("should not disable volume size when sap and storage log", () => {
      assert.isFalse(
        craig.power_volumes.pi_volume_size.disabled({
          sap: true,
          name: "-sap-log-",
        }),
        "it should not be disabled"
      );
    });
    it("should have correct type for attachments when sharable", () => {
      assert.deepEqual(
        craig.power_volumes.attachments.type({ pi_volume_shareable: true }),
        "multiselect",
        "it should be multiselect"
      );
    });
    it("should have correct type for attachments when not sharable", () => {
      assert.deepEqual(
        craig.power_volumes.attachments.type({ pi_volume_shareable: false }),
        "select",
        "it should be select"
      );
    });
    it("should return the correct input change data for attachments when not sharable", () => {
      assert.deepEqual(
        craig.power_volumes.attachments.onInputChange({
          pi_volume_shareable: false,
          attachments: "hi",
        }),
        ["hi"],
        "it should return array"
      );
    });
    it("should return the correct groups data for attachments when sharable", () => {
      craig.store.json._options.power_vs_zones = ["dal10"];
      craig.power.create({
        name: "example",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      craig.vtl.create({
        name: "frog",
        zone: "dal10",
        workspace: "example",
        network: [],
      });
      craig.vtl.create({
        name: "toad",
        zone: "dal10",
        network: [],
      });
      assert.deepEqual(
        craig.power_volumes.attachments.groups(
          {
            pi_volume_shareable: true,
            attachments: "hi",
            workspace: "example",
          },
          {
            craig: craig,
          }
        ),
        ["frog (VTL)"],
        "it should return array"
      );
    });
    it("should return the correct input change data for attachments when sharable", () => {
      assert.deepEqual(
        craig.power_volumes.attachments.onInputChange({
          pi_volume_shareable: true,
          attachments: ["hi"],
        }),
        ["hi"],
        "it should return array"
      );
    });
    it("should not have attachments invalid", () => {
      assert.isFalse(
        craig.power_volumes.attachments.invalid(),
        "it should not be invalid"
      );
    });
    it("should return correct power instances", () => {
      craig.power.create({
        name: "frog",
        imageNames: ["7100-05-09"],
        zone: "dal12",
      });
      craig.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      craig.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
        workspace: "frog",
        network: [],
        pi_storage_type: "yes",
      });
      craig.power_instances.create({
        name: "toad",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
        workspace: "toad",
        network: [],
      });
      assert.deepEqual(
        craig.power_volumes.attachments.groups(
          {
            workspace: "frog",
            pi_volume_type: "yes",
          },
          {
            craig: craig,
          }
        ),
        ["", "frog"],
        "it should return correct instances"
      );
    });
    it("should return correct power instances when no volume type", () => {
      craig.power.create({
        name: "frog",
        imageNames: ["7100-05-09"],
        zone: "dal12",
      });
      craig.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      craig.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
        workspace: "frog",
        network: [],
        pi_storage_type: "yes",
      });
      craig.power_instances.create({
        name: "toad",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
        workspace: "toad",
        network: [],
      });
      assert.deepEqual(
        craig.power_volumes.attachments.groups(
          {
            workspace: "frog",
            pi_volume_type: null,
          },
          {
            craig: craig,
          }
        ),
        ["", "frog"],
        "it should return correct instances"
      );
    });
    it("should not disable volume size not sap", () => {
      assert.isFalse(
        craig.power_volumes.pi_volume_size.disabled({
          sap: false,
          name: "-sap-log-",
        }),
        "it should not be disabled"
      );
    });
    it("should disable volume size when sap and not a log", () => {
      assert.isTrue(
        craig.power_volumes.pi_volume_size.disabled({
          sap: true,
          name: "-sap-",
        }),
        "it should be disabled"
      );
    });
    it("should not return volume groups without current volume", () => {
      assert.deepEqual(
        craig.power_volumes.pi_anti_affinity_instance.groups(
          {
            workspace: "workspace",
            attachments: "",
          },
          {
            craig: {
              store: {
                json: {
                  power_instances: [
                    {
                      workspace: "workspace",
                      name: "volume",
                    },
                  ],
                },
              },
            },
          }
        ),
        ["volume"],
        "it should return list of groups"
      );
    });
    it("should be false for when the storage pool is replication enabled", () => {
      let data = {
        pi_volume_pool: "Tier1-Flash-8",
        zone: "us-east",
      };
      assert.isFalse(
        craig.power_volumes.pi_replication_enabled.disabled(data, {})
      );
    });
    it("should be false for when the storage pool is replication enabled and has additional text", () => {
      let data = {
        pi_volume_pool: "Tier1-Flash-8 (Replication Enabled)",
        zone: "us-east",
      };
      assert.isFalse(
        craig.power_volumes.pi_replication_enabled.disabled(data, {})
      );
    });
    it("should be true for when no pool selected", () => {
      let data = {
        zone: "us-east",
      };
      assert.isTrue(
        craig.power_volumes.pi_replication_enabled.disabled(data, {})
      );
    });
    it("should be true for when the storage pool is not replication enabled", () => {
      let data = {
        pi_volume_pool: "Tier1-Flash-1",
        zone: "us-east",
      };
      assert.isTrue(
        craig.power_volumes.pi_replication_enabled.disabled(data, {})
      );
    });
    it("should be false for when the storage pool has no zone (no workspace selected)", () => {
      let data = {
        pi_volume_pool: "Tier1-Flash-8",
      };
      assert.isTrue(
        craig.power_volumes.pi_replication_enabled.disabled(data, {})
      );
    });
    it("should be true for when the workspace's zone does not have replication enabled", () => {
      let data = {
        pi_volume_pool: "Tier1-Flash-8",
        zone: "eu-es",
      };
      assert.isTrue(
        craig.power_volumes.pi_replication_enabled.disabled(data, {})
      );
    });

    it("should return correct JSON string from forceUpdateKey", () => {
      let data = {
        foo: "bar",
      };
      let expectedData = '{"foo":"bar"}';
      assert.deepEqual(
        craig.power_volumes.pi_replication_enabled.forceUpdateKey(data),
        expectedData,
        "should be equal"
      );
    });
  });
});
