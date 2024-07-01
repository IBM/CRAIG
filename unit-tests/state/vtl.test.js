const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { distinct, flatten, splat } = require("lazy-z");
/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state(true);
  store.setUpdateCallback(() => {});
  return store;
}

describe("vtl", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("vtl.init", () => {
    it("should initialize power vs instances", () => {
      assert.deepEqual(craig.store.json.vtl, [], "it should initialize data");
    });
  });
  describe("vtl.create", () => {
    it("should create a new power vs instance", () => {
      craig.vtl.create({
        name: "frog",
        zone: "dal12",
      });
      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "frog",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            zone: null,
          },
        ],
        "it should create instance"
      );
    });
    it("should create a new power vs instance with SAP and create volumes", () => {
      craig.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "frog",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            sap: true,
            sap_profile: "ush1-4x128",
            zone: null,
          },
        ],
        "it should create instance"
      );
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-data-1",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-data-2",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-data-3",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-data-4",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-log-1",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-log-2",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-log-3",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-log-4",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
          {
            attachments: ["frog"],
            workspace: undefined,
            name: "frog-sap-shared",
            pi_volume_type: "tier3",
            mount: "/hana/shared",
            pi_volume_size: 256,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: undefined,
          },
        ],
        "it should create correct volumes"
      );
    });
  });
  describe("vtl.save", () => {
    it("should save a power vs instance", () => {
      craig.vtl.create({
        name: "toad",
        image: null,
        ssh_key: "(None)",
        network: [],
        workspace: null,
        zone: null,
      });
      craig.vtl.save(
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
        craig.store.json.vtl,
        [
          {
            name: "frog",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            zone: null,
          },
        ],
        "it should save instance"
      );
    });
    it("should update power vs volume names when updating sap instance name", () => {
      craig.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      craig.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      craig.vtl.save(
        {
          name: "toad",
          sap: true,
          sap_profile: "ush1-4x128",
        },
        {
          data: {
            name: "frog",
            sap: true,
            sap_profile: "ush1-4x128",
          },
        }
      );

      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            sap: true,
            sap_profile: "ush1-4x128",
            zone: null,
          },
        ],
        "it should create instance"
      );
      assert.deepEqual(
        distinct(flatten(splat(craig.store.json.power_volumes, "attachments"))),
        ["toad"],
        "it should create correct volumes"
      );
    });
    it("should update power vs volume sizes when updating sap instance profile", () => {
      craig.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      craig.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
      });
      craig.vtl.save(
        {
          name: "toad",
          sap: true,
          sap_profile: "bh1-140x14000",
        },
        {
          data: {
            sap_profile: "ush1-4x128",
            name: "frog",
            sap: true,
          },
        }
      );

      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            sap: true,
            sap_profile: "bh1-140x14000",
            zone: null,
          },
        ],
        "it should create instance"
      );
      assert.deepEqual(
        distinct(
          flatten(splat(craig.store.json.power_volumes, "pi_volume_size"))
        ),
        [undefined, 3851, 512, 1024],
        "it should create correct volumes"
      );
    });
    it("should create power vs volumes when converting non-sap instance to sap", () => {
      craig.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      craig.vtl.create({
        name: "frog",
        zone: "dal12",
      });
      craig.vtl.save(
        {
          name: "toad",
          sap: true,
          sap_profile: "ush1-4x128",
          zone: "dal12",
        },
        {
          data: {
            name: "frog",
            zone: "dal12",
          },
        }
      );

      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            sap: true,
            sap_profile: "ush1-4x128",
            zone: null,
          },
        ],
        "it should create instance"
      );
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            attachments: [],
            name: "ignore-me",
            workspace: null,
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-data-1",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-data-2",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-data-3",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-data-4",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-log-1",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-log-2",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-log-3",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-log-4",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: undefined,
            name: "toad-sap-shared",
            pi_volume_type: "tier3",
            mount: "/hana/shared",
            pi_volume_size: 256,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
        ],
        "it should create correct volumes"
      );
    });
    it("should update power vs volume workspace when changing instance workspace", () => {
      craig.store.json._options.power_vs_zones = ["dal12", "dal10"];
      craig.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal12",
      });
      craig.power.create({
        name: "frog",
        images: [{ name: "7100-05-09", workspace: "frog" }],
        zone: "dal12",
      });
      craig.store.json.power_volumes.push({
        attachments: [],
        workspace: null,
        name: "ignore-me",
      });
      craig.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
        workspace: "frog",
        network: [],
      });
      craig.vtl.save(
        {
          name: "toad",
          sap: true,
          sap_profile: "ush1-4x128",
          workspace: "toad",
          zone: "dal12",
        },
        {
          data: {
            zone: "dal12",

            name: "frog",
            sap: true,
            sap_profile: "ush1-4x128",
            workspace: "frog",
          },
        }
      );

      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            workspace: "toad",
            sap: true,
            sap_profile: "ush1-4x128",
            zone: "dal12",
          },
        ],
        "it should create instance"
      );
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            attachments: [],
            name: "ignore-me",
            workspace: null,
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-data-1",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-data-2",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-data-3",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-data-4",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 71,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-log-1",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-log-2",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-log-3",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-log-4",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 33,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: "toad",
            name: "toad-sap-shared",
            pi_volume_type: "tier3",
            mount: "/hana/shared",
            pi_volume_size: 256,
            sap: true,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
        ],
        "it should create correct volumes"
      );
    });
    it("should delete power vs volumes when converting sap volume to non-sap", () => {
      craig.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      craig.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      craig.vtl.save(
        {
          name: "toad",
        },
        {
          data: {
            sap: true,
            name: "frog",
          },
        }
      );

      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            sap: true,
            sap_profile: "ush1-4x128",
            zone: null,
          },
        ],
        "it should create instance"
      );
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            attachments: [],
            name: "ignore-me",
            workspace: null,
          },
        ],
        "it should create correct volumes"
      );
    });
  });
  describe("vtl.delete", () => {
    it("should delete a power vs instance", () => {
      craig.vtl.create({
        name: "toad",
      });
      craig.vtl.delete(
        {
          name: "frog",
        },
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(craig.store.json.vtl, [], "it should delete instance");
    });
    it("should delete power vs volumes when deleting sap instance", () => {
      craig.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      craig.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      craig.vtl.delete(
        {
          name: "toad",
          sap: true,
          sap_profile: "ush1-4x128",
        },
        {
          data: {
            name: "frog",
            sap: true,
          },
        }
      );

      assert.deepEqual(craig.store.json.vtl, [], "it should create instance");
      assert.deepEqual(
        craig.store.json.power_volumes,
        [
          {
            attachments: [],
            name: "ignore-me",
            workspace: null,
          },
        ],
        "it should create correct volumes"
      );
    });
  });
  describe("vtl.onStoreUpdate", () => {
    it("should add power when not created on store update", () => {
      delete craig.store.json.vtl;
      craig.update();
      assert.deepEqual(craig.store.json.vtl, [], "it should initialize data");
    });
    it("should update ssh key, network, image, primary subnet, and workspace when unfound", () => {
      craig.vtl.create({
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
        primary_subnet: "oops",
      });
      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            zone: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should update ssh key, network, image, and priamry subnet when workspace is unfound", () => {
      craig.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal10",
      });
      craig.vtl.create({
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
        primary_subnet: "oops",
      });
      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: null,
            zone: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should update primary_subnet when network interface is unfound", () => {
      craig.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      craig.vtl.create({
        name: "toad",
        image: "oops",
        ssh_key: "oops",
        network: [
          {
            name: "oops",
            ip_address: "1.2.3.4",
          },
        ],
        workspace: "toad",
        zone: "oops",
        primary_subnet: "oops",
      });
      assert.deepEqual(
        craig.store.json.vtl,
        [
          {
            name: "toad",
            image: null,
            ssh_key: "(None)",
            network: [],
            primary_subnet: null,
            workspace: "toad",
            zone: null,
            pi_storage_type: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should not update image when still in existing workspace", () => {
      craig.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      craig.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      craig.vtl.create({
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
        craig.store.json.vtl[0].image,
        "7100-05-09",
        "it should initialize data"
      );
    });
    it("should not update ssh key when still in existing workspace", () => {
      craig.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal10",
        imageNames: ["7100-05-09"],
      });
      craig.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      craig.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      craig.vtl.create({
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
        craig.store.json.vtl[0].ssh_key,
        "test-key",
        "it should initialize data"
      );
    });
    it("should update image when no longer in existing workspace", () => {
      craig.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal10",
      });
      craig.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      craig.vtl.create({
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
        craig.store.json.vtl[0].image,
        null,
        "it should initialize data"
      );
    });
  });
  describe("vtl.schema", () => {
    describe("vtl.pi_proc_type.hideWhen", () => {
      it("should hide when no workspace is selected or no vtl images", () => {
        assert.isTrue(
          craig.vtl.pi_proc_type.hideWhen({}, {}),
          "it should be hidden"
        );
        craig.power.create({ name: "bad" });
        assert.isTrue(
          craig.vtl.pi_proc_type.hideWhen(
            { workspace: "bad" },
            { craig: craig }
          ),
          "it should be hidden"
        );
        assert.isTrue(
          craig.vtl.pi_processors.hideWhen(
            { workspace: "bad" },
            { craig: craig }
          ),
          "it should be hidden"
        );
        assert.isTrue(
          craig.vtl.pi_memory.hideWhen({ workspace: "bad" }, { craig: craig }),
          "it should be hidden"
        );
        assert.isTrue(
          craig.vtl.storage_option.hideWhen(
            { workspace: "bad" },
            { craig: craig }
          ),
          "it should be hidden"
        );
        assert.isTrue(
          craig.vtl.storage_option.hideWhen(
            { workspace: "bad", zone: "" },
            { craig: craig }
          ),
          "it should be hidden"
        );
        craig.store.json.power[0].imageNames = ["VTL"];
        assert.isFalse(
          craig.vtl.storage_option.hideWhen(
            { workspace: "bad", zone: "yes" },
            { craig: craig }
          ),
          "it should not be hidden"
        );
      });
    });
    describe("vtl.pi_license_repository_capacity.invalid", () => {
      it("should return true when empty string", () => {
        assert.isTrue(
          craig.vtl.pi_license_repository_capacity.invalid({
            pi_license_repository_capacity: "",
          }),
          "it should be true"
        );
      });
      it("should return true when not whole number", () => {
        assert.isTrue(
          craig.vtl.pi_license_repository_capacity.invalid({
            pi_license_repository_capacity: "@@@",
          }),
          "it should be true"
        );
      });
      it("should return false when whole number", () => {
        assert.isFalse(
          craig.vtl.pi_license_repository_capacity.invalid({
            pi_license_repository_capacity: "1",
          }),
          "it should be true"
        );
      });
    });
    describe("vtl.images.groups", () => {
      it("should return groups when workspace", () => {
        let craig = newState();
        craig.power.create({
          name: "toad",
          images: [
            { name: "VTL", workspace: "toad" },
            { name: "goBlue", workspace: "toad" },
          ],
          zone: "dal12",
          network: [],
          imageNames: ["VTL"],
        });

        assert.deepEqual(
          craig.vtl.image.groups({ workspace: "toad" }, { craig: craig }),
          ["VTL"],
          "it should return list of images"
        );
      });
    });
  });
});
