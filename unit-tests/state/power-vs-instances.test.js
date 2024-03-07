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
        zone: "dal12",
      });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "frog",
            image: null,
            ssh_key: null,
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
      let state = newState();
      state.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "frog",
            image: null,
            ssh_key: null,
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
        state.store.json.power_volumes,
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
            primary_subnet: null,
            workspace: null,
            zone: null,
          },
        ],
        "it should save instance"
      );
    });
    it("should update power vs volume names when updating sap instance name", () => {
      let state = newState();
      state.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      state.power_instances.save(
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
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
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
        state.store.json.power_volumes,
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
            zone: undefined,
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
            zone: undefined,
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
            zone: undefined,
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
            zone: undefined,
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
            zone: undefined,
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
            zone: undefined,
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
            zone: undefined,
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
            zone: undefined,
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
            zone: undefined,
          },
        ],
        "it should create correct volumes"
      );
    });
    it("should update power vs volume sizes when updating sap instance profile", () => {
      let state = newState();
      state.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
      });
      state.power_instances.save(
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
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
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
        state.store.json.power_volumes,
        [
          {
            attachments: [],
            name: "ignore-me",
            workspace: null,
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-data-1",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 3851,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-data-2",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 3851,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-data-3",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 3851,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-data-4",
            pi_volume_type: "tier1",
            mount: "/hana/data",
            pi_volume_size: 3851,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-log-1",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 512,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-log-2",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 512,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-log-3",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 512,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-log-4",
            pi_volume_type: "tier1",
            mount: "/hana/log",
            pi_volume_size: 512,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
          {
            attachments: ["toad"],
            workspace: null,
            name: "toad-sap-shared",
            pi_volume_type: "tier3",
            mount: "/hana/shared",
            pi_volume_size: 1024,
            sap: true,
            workspace: undefined,
            storage_option: "Storage Type",
            affinity_type: null,
            zone: "dal12",
          },
        ],
        "it should create correct volumes"
      );
    });
    it("should create power vs volumes when converting non-sap instance to sap", () => {
      let state = newState();
      state.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        zone: "dal12",
      });
      state.power_instances.save(
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
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
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
        state.store.json.power_volumes,
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
      let state = newState();
      state.store.json._options.power_vs_zones = ["dal12", "dal10"];
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal12",
      });
      state.power.create({
        name: "frog",
        images: [{ name: "7100-05-09", workspace: "frog" }],
        zone: "dal12",
      });
      state.store.json.power_volumes.push({
        attachments: [],
        workspace: null,
        name: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
        workspace: "frog",
        network: [],
      });
      state.power_instances.save(
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
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
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
        state.store.json.power_volumes,
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
    it("should update power vs instance affinity values when deleting instance affinity source", () => {
      let state = newState();
      state.store.json._options.power_vs_zones = ["dal12", "dal10"];
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal12",
      });
      state.power_volumes.create({
        attachments: [],
        workspace: "frog",
        name: "ignore-me",
      });
      state.power_volumes.create({
        attachments: [],
        workspace: "frog",
        name: "ignore-me2",
      });
      state.power_instances.create({
        name: "frog",
        sap: false,
        zone: "dal12",
        workspace: "frog",
        network: [],
        storage_option: "Affinity",
        pi_affinity_volume: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: false,
        zone: "dal12",
        workspace: "frog",
        network: [],
        storage_option: "Anti-Affinity",
        pi_anti_affinity_volume: "ignore-me",
      });
      state.power_volumes.delete({}, { data: { name: "ignore-me" } });
      state.power_volumes.delete({}, { data: { name: "ignore-me2" } });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "frog",
            sap: false,
            zone: null,
            workspace: null,
            network: [],
            primary_subnet: null,
            storage_option: "Affinity",
            pi_affinity_volume: null,
            ssh_key: null,
            image: null,
          },
          {
            name: "frog",
            sap: false,
            zone: null,
            workspace: null,
            network: [],
            primary_subnet: null,
            storage_option: "Anti-Affinity",
            pi_anti_affinity_volume: null,
            ssh_key: null,
            image: null,
          },
        ],
        "it should return correct instances"
      );
    });
    it("should update power vs instance affinity values when deleting instance affinity source", () => {
      let state = newState();
      state.store.json._options.power_vs_zones = ["dal12", "dal10"];
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal12",
      });
      state.power_instances.create({
        attachments: [],
        workspace: "frog",
        name: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: false,
        zone: "dal12",
        workspace: "frog",
        network: [],
        storage_option: "Affinity",
        pi_affinity_instance: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: false,
        zone: "dal12",
        workspace: "frog",
        network: [],
        storage_option: "Anti-Affinity",
        pi_anti_affinity_instance: "ignore-me",
      });
      state.power_instances.delete({}, { data: { name: "ignore-me" } });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "frog",
            sap: false,
            zone: null,
            workspace: null,
            network: [],
            primary_subnet: null,
            storage_option: "Affinity",
            pi_affinity_instance: null,
            ssh_key: null,
            image: null,
          },
          {
            name: "frog",
            sap: false,
            zone: null,
            workspace: null,
            network: [],
            primary_subnet: null,
            storage_option: "Anti-Affinity",
            pi_anti_affinity_instance: null,
            ssh_key: null,
            image: null,
          },
        ],
        "it should return correct instances"
      );
    });
    it("should update power vs volume affinity values when deleting instance affinity source", () => {
      let state = newState();
      state.store.json._options.power_vs_zones = ["dal12", "dal10"];
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal12",
      });
      state.power.create({
        name: "frog",
        images: [{ name: "7100-05-09", workspace: "frog" }],
        zone: "dal12",
      });
      state.power_instances.create({
        name: "frog",
        sap: false,
        zone: "dal12",
        workspace: "frog",
        network: [],
      });
      state.power_volumes.create({
        attachments: ["frog"],
        workspace: "frog",
        name: "ignore-me",
        storage_option: "Affinity",
        pi_affinity_instance: "frog",
      });
      state.power_volumes.create({
        attachments: ["frog"],
        workspace: "frog",
        name: "ignore-me2",
        storage_option: "Anti-Affinity",
        pi_anti_affinity_instance: "frog",
      });
      state.power_instances.delete({}, { data: { name: "frog" } });

      assert.deepEqual(
        state.store.json.power_instances,
        [],
        "it should create instance"
      );
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            attachments: [],
            name: "ignore-me",
            workspace: "frog",
            zone: "dal12",
            pi_volume_type: null,
            pi_affinity_instance: null,
            storage_option: "Affinity",
          },
          {
            attachments: [],
            name: "ignore-me2",
            workspace: "frog",
            zone: "dal12",
            pi_volume_type: null,
            pi_anti_affinity_instance: null,
            storage_option: "Anti-Affinity",
          },
        ],
        "it should create correct volumes"
      );
      state.power_volumes.create({
        attachments: ["frog"],
        workspace: "frog",
        name: "ignore-me3",
        storage_option: "Affinity",
        pi_affinity_volume: "ignore-me",
      });
      state.power_volumes.create({
        attachments: ["frog"],
        workspace: "frog",
        name: "ignore-me4",
        storage_option: "Anti-Affinity",
        pi_anti_affinity_volume: "ignore-me",
      });
      state.power_volumes.delete(
        {},
        {
          data: {
            attachments: ["frog"],
            workspace: "frog",
            name: "ignore-me",
            storage_option: "Affinity",
            pi_affinity_instance: "frog",
          },
        }
      );
      assert.deepEqual(
        state.store.json.power_volumes,
        [
          {
            attachments: [],
            name: "ignore-me2",
            workspace: "frog",
            zone: "dal12",
            pi_volume_type: null,
            pi_anti_affinity_instance: null,
            storage_option: "Anti-Affinity",
          },
          {
            attachments: [],
            workspace: "frog",
            zone: "dal12",
            name: "ignore-me3",
            storage_option: "Affinity",
            pi_volume_type: null,
            pi_affinity_volume: null,
          },
          {
            attachments: [],
            workspace: "frog",
            zone: "dal12",
            name: "ignore-me4",
            pi_volume_type: null,
            pi_anti_affinity_volume: null,
            storage_option: "Anti-Affinity",
          },
        ],
        "it should create correct volumes"
      );
    });
    it("should delete power vs volumes when converting sap volume to non-sap", () => {
      let state = newState();
      state.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      state.power_instances.save(
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
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
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
        state.store.json.power_volumes,
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
    it("should delete power vs volumes when deleting sap instance", () => {
      let state = newState();
      state.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      state.power_instances.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      state.power_instances.delete(
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

      assert.deepEqual(
        state.store.json.power_instances,
        [],
        "it should create instance"
      );
      assert.deepEqual(
        state.store.json.power_volumes,
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
    it("should update ssh key, network, image, primary_subnet, and workspace when unfound", () => {
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
        primary_subnet: "oops",
      });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
            network: [],
            primary_subnet: null,
            workspace: null,
            zone: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should update ssh key, network, image, and primary_subnet when workspace is unfound", () => {
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
        primary_subnet: "oops",
      });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
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
        workspace: "toad",
        zone: "oops",
        primary_subnet: "oops",
      });
      assert.deepEqual(
        state.store.json.power_instances,
        [
          {
            name: "toad",
            image: null,
            ssh_key: null,
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
      let state = newState();
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal10",
        imageNames: ["7100-05-09"],
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
            primary_subnet: null,
            workspace: "toad",
            zone: null,
            pi_storage_type: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should not update ssh key when still in existing workspace", () => {
      let state = newState();
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
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
            image: null,
            ssh_key: "test-key",
            network: [
              {
                name: "test-network",
              },
            ],
            primary_subnet: null,
            workspace: "toad",
            zone: null,
            pi_storage_type: null,
          },
        ],
        "it should initialize data"
      );
    });
    it("should update image when no longer in existing workspace", () => {
      let state = newState();
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
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
            primary_subnet: null,
            workspace: "toad",
            zone: null,
            pi_storage_type: null,
          },
        ],
        "it should initialize data"
      );
    });
  });
  describe("power_instances.schema", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    describe("storage_option", () => {
      it("should be false when is modal", () => {
        assert.isFalse(
          craig.power_instances.storage_option.disabled({}, { isModal: true }),
          "it should be false for modal forms"
        );
      });
      it("should be true for an instance when it is used by another instance for anti-affinity", () => {
        let craig = state();
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
          {
            craig: craig,
            data: {
              name: "oracle-1",
              workspace: "oracle-template",
              image: "7300-00-01",
              network: [
                {
                  name: "oracle-private-1",
                  ip_address: "",
                },
                {
                  name: "oracle-private-2",
                  ip_address: "",
                },
                {
                  name: "oracle-public",
                  ip_address: "",
                },
              ],
              zone: "dal12",
              pi_health_status: "OK",
              pi_proc_type: "shared",
              pi_storage_type: "tier1",
              ssh_key: "power-ssh",
              pi_processors: "2",
              pi_memory: "32",
              pi_sys_type: "s922",
              storage_option: "Storage Type",
              affinity_type: null,
              pi_storage_pool_affinity: true,
            },
            power_instances: [
              {
                name: "oracle-1",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: "tier1",
                ssh_key: "power-ssh",
                pi_processors: "2",
                pi_memory: "32",
                pi_sys_type: "s922",
                storage_option: "Storage Type",
                affinity_type: null,
                pi_storage_pool_affinity: true,
              },
              {
                name: "oracle-2",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: null,
                ssh_key: "power-ssh",
                pi_sys_type: "s922",
                pi_processors: "2",
                pi_memory: "32",
                storage_option: "Anti-Affinity",
                affinity_type: "Instance",
                pi_storage_pool_affinity: true,
                pi_storage_pool: null,
                pi_anti_affinity_volume: null,
                pi_anti_affinity_instance: "oracle-1",
                pi_affinity_policy: "anti-affinity",
                pi_affinity_instance: null,
                pi_affinity_volume: null,
              },
            ],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should be true for an instance when it is used by a volume for affinity", () => {
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
          {
            data: {
              name: "oracle-1",
              workspace: "oracle-template",
              image: "7300-00-01",
              network: [
                {
                  name: "oracle-private-1",
                  ip_address: "",
                },
                {
                  name: "oracle-private-2",
                  ip_address: "",
                },
                {
                  name: "oracle-public",
                  ip_address: "",
                },
              ],
              zone: "dal12",
              pi_health_status: "OK",
              pi_proc_type: "shared",
              pi_storage_type: "tier1",
              ssh_key: "power-ssh",
              pi_processors: "2",
              pi_memory: "32",
              pi_sys_type: "s922",
              storage_option: "Storage Type",
              affinity_type: null,
              pi_storage_pool_affinity: true,
            },
            power_instances: [
              {
                name: "oracle-1",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: "tier1",
                ssh_key: "power-ssh",
                pi_processors: "2",
                pi_memory: "32",
                pi_sys_type: "s922",
                storage_option: "Storage Type",
                affinity_type: null,
                pi_storage_pool_affinity: true,
              },
            ],
            power_volumes: [
              {
                name: "oracle-1-db-1",
                workspace: "oracle-template",
                pi_volume_shareable: false,
                pi_replication_enabled: false,
                pi_volume_type: null,
                attachments: ["oracle-1"],
                zone: "dal12",
                pi_volume_size: "90",
                storage_option: "Affinity",
                affinity_type: "Instance",
                pi_storage_pool: null,
                pi_anti_affinity_volume: null,
                pi_anti_affinity_instance: null,
                pi_affinity_policy: "affinity",
                pi_affinity_instance: "oracle-1",
              },
            ],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should be true for an instance when it is used by a volume for anti-affinity", () => {
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
          {
            data: {
              name: "oracle-1",
              workspace: "oracle-template",
              image: "7300-00-01",
              network: [
                {
                  name: "oracle-private-1",
                  ip_address: "",
                },
                {
                  name: "oracle-private-2",
                  ip_address: "",
                },
                {
                  name: "oracle-public",
                  ip_address: "",
                },
              ],
              zone: "dal12",
              pi_health_status: "OK",
              pi_proc_type: "shared",
              pi_storage_type: "tier1",
              ssh_key: "power-ssh",
              pi_processors: "2",
              pi_memory: "32",
              pi_sys_type: "s922",
              storage_option: "Storage Type",
              affinity_type: null,
              pi_storage_pool_affinity: true,
            },
            power_instances: [
              {
                name: "oracle-1",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: "tier1",
                ssh_key: "power-ssh",
                pi_processors: "2",
                pi_memory: "32",
                pi_sys_type: "s922",
                storage_option: "Storage Type",
                affinity_type: null,
                pi_storage_pool_affinity: true,
              },
            ],
            power_volumes: [
              {
                name: "oracle-1-db-1",
                workspace: "oracle-template",
                pi_volume_shareable: false,
                pi_replication_enabled: false,
                pi_volume_type: null,
                attachments: ["oracle-1"],
                zone: "dal12",
                pi_volume_size: "90",
                storage_option: "Affinity",
                affinity_type: "Instance",
                pi_storage_pool: null,
                pi_anti_affinity_volume: null,
                pi_affinity_instance: null,
                pi_affinity_policy: "affinity",
                pi_anti_affinity_instance: "oracle-1",
              },
            ],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should be true for a volume when it is used by an instance for affinity", () => {
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "redo-1",
            workspace: "oracle-template",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier1",
            attachments: ["oracle-1", "oracle-2"],
            zone: "dal12",
            pi_volume_size: "50",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            power_volumes: [],
            data: {
              name: "redo-1",
              workspace: "oracle-template",
              pi_volume_shareable: true,
              pi_replication_enabled: false,
              pi_volume_type: "tier1",
              attachments: ["oracle-1", "oracle-2"],
              zone: "dal12",
              pi_volume_size: "50",
              storage_option: "Storage Type",
              affinity_type: null,
            },
            power_instances: [
              {
                name: "oracle-1",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: null,
                ssh_key: "power-ssh",
                pi_processors: "2",
                pi_memory: "32",
                pi_sys_type: "s922",
                storage_option: "Affinity",
                affinity_type: "Volume",
                pi_storage_pool_affinity: true,
                pi_storage_pool: null,
                pi_anti_affinity_volume: null,
                pi_anti_affinity_instance: null,
                pi_affinity_policy: "affinity",
                pi_affinity_volume: "redo-1",
              },
            ],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should be true for a volume when it is used by an instance for anti-affinity", () => {
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "redo-1",
            workspace: "oracle-template",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier1",
            attachments: ["oracle-1", "oracle-2"],
            zone: "dal12",
            pi_volume_size: "50",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            power_volumes: [],
            data: {
              name: "redo-1",
              workspace: "oracle-template",
              pi_volume_shareable: true,
              pi_replication_enabled: false,
              pi_volume_type: "tier1",
              attachments: ["oracle-1", "oracle-2"],
              zone: "dal12",
              pi_volume_size: "50",
              storage_option: "Storage Type",
              affinity_type: null,
            },
            power_instances: [
              {
                name: "oracle-1",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: null,
                ssh_key: "power-ssh",
                pi_processors: "2",
                pi_memory: "32",
                pi_sys_type: "s922",
                storage_option: "Affinity",
                affinity_type: "Volume",
                pi_storage_pool_affinity: true,
                pi_storage_pool: null,
                pi_anti_affinity_volume: "redo-1",
                pi_anti_affinity_instance: null,
                pi_affinity_policy: "affinity",
                pi_affinity_volume: null,
              },
            ],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should be true for a volume when it is used by another volume for anti-affinity", () => {
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "redo-1",
            workspace: "oracle-template",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier1",
            attachments: ["oracle-1", "oracle-2"],
            zone: "dal12",
            pi_volume_size: "50",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            power_volumes: [
              {
                name: "dev",
                workspace: "oracle-template",
                pi_volume_shareable: true,
                pi_replication_enabled: false,
                pi_volume_type: "tier1",
                attachments: ["oracle-1", "oracle-2"],
                zone: "dal12",
                pi_volume_size: "50",
                storage_option: "Storage Type",
                affinity_type: null,
                pi_anti_affinity_volume: "redo-1",
              },
            ],
            data: {
              name: "redo-1",
              workspace: "oracle-template",
              pi_volume_shareable: true,
              pi_replication_enabled: false,
              pi_volume_type: "tier1",
              attachments: ["oracle-1", "oracle-2"],
              zone: "dal12",
              pi_volume_size: "50",
              storage_option: "Storage Type",
              affinity_type: null,
            },
            power_instances: [],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should be true for a volume when it is used by another volume for affinity", () => {
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "redo-1",
            workspace: "oracle-template",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier1",
            attachments: ["oracle-1", "oracle-2"],
            zone: "dal12",
            pi_volume_size: "50",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            power_volumes: [
              {
                name: "dev",
                workspace: "oracle-template",
                pi_volume_shareable: true,
                pi_replication_enabled: false,
                pi_volume_type: "tier1",
                attachments: ["oracle-1", "oracle-2"],
                zone: "dal12",
                pi_volume_size: "50",
                storage_option: "Storage Type",
                affinity_type: null,
                pi_affinity_volume: "redo-1",
              },
            ],
            data: {
              name: "redo-1",
              workspace: "oracle-template",
              pi_volume_shareable: true,
              pi_replication_enabled: false,
              pi_volume_type: "tier1",
              attachments: ["oracle-1", "oracle-2"],
              zone: "dal12",
              pi_volume_size: "50",
              storage_option: "Storage Type",
              affinity_type: null,
            },
            power_instances: [],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should be true for an instance when it is used by another instance for affinity", () => {
        let actualData = craig.power_instances.storage_option.disabled(
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
          {
            power_volumes: [],
            data: {
              name: "oracle-1",
              workspace: "oracle-template",
              image: "7300-00-01",
              network: [
                {
                  name: "oracle-private-1",
                  ip_address: "",
                },
                {
                  name: "oracle-private-2",
                  ip_address: "",
                },
                {
                  name: "oracle-public",
                  ip_address: "",
                },
              ],
              zone: "dal12",
              pi_health_status: "OK",
              pi_proc_type: "shared",
              pi_storage_type: "tier1",
              ssh_key: "power-ssh",
              pi_processors: "2",
              pi_memory: "32",
              pi_sys_type: "s922",
              storage_option: "Storage Type",
              affinity_type: null,
              pi_storage_pool_affinity: true,
            },
            power_instances: [
              {
                name: "oracle-1",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: "tier1",
                ssh_key: "power-ssh",
                pi_processors: "2",
                pi_memory: "32",
                pi_sys_type: "s922",
                storage_option: "Storage Type",
                affinity_type: null,
                pi_storage_pool_affinity: true,
              },
              {
                name: "oracle-2",
                workspace: "oracle-template",
                image: "7300-00-01",
                network: [
                  {
                    name: "oracle-private-1",
                    ip_address: "",
                  },
                  {
                    name: "oracle-private-2",
                    ip_address: "",
                  },
                  {
                    name: "oracle-public",
                    ip_address: "",
                  },
                ],
                zone: "dal12",
                pi_health_status: "OK",
                pi_proc_type: "shared",
                pi_storage_type: null,
                ssh_key: "power-ssh",
                pi_sys_type: "s922",
                pi_processors: "2",
                pi_memory: "32",
                storage_option: "Affinity",
                affinity_type: "Instance",
                pi_storage_pool_affinity: true,
                pi_storage_pool: null,
                pi_anti_affinity_volume: null,
                pi_anti_affinity_instance: null,
                pi_affinity_policy: "affinity",
                pi_affinity_instance: "oracle-1",
              },
            ],
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
    });
    describe("power_instances.sap_profile", () => {
      describe("power_instances.schema.sap_profile.hideWhen", () => {
        it("should be true when is not sap", () => {
          let craig = state();
          assert.isTrue(
            craig.power_instances.sap_profile.hideWhen({ sap: false }),
            "it should be hidden"
          );
        });
      });
      describe("power_instances.schema.sap_profile.invalid", () => {
        it("should be false when is not sap", () => {
          let craig = state();
          assert.isFalse(
            craig.power_instances.sap_profile.invalid({ sap: false }),
            "it should be invalid"
          );
        });
        it("should be true when is sap and not sap profile", () => {
          let craig = state();
          assert.isTrue(
            craig.power_instances.sap_profile.invalid({
              sap: true,
              sap_profile: "",
            }),
            "it should be invalid"
          );
        });
      });
    });
    describe("power_instance.workspace", () => {
      describe("power_instance.workspace.groups", () => {
        it("should return groups", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.workspace.groups({}, { craig: craig }),
            [],
            "it should return list of workspaces"
          );
        });
      });
      describe("power_instance.workspace.onStateChange", () => {
        it("should set networks, primary subnet, image, and ssh key", () => {
          let craig = newState();
          craig.store.json._options.power_vs_zones = ["dal12"];
          craig.power.create({
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
            ssh_keys: [],
          });
          let data = {
            network: [{ name: "frog" }],
            primary_subnet: "frog",
            ssh_key: "toad",
            workspace: "toad",
          };
          craig.power_instances.workspace.onStateChange(data, { craig: craig });
          assert.deepEqual(
            data,
            {
              network: [],
              primary_subnet: "",
              ssh_key: "",
              image: "",
              workspace: "toad",
              zone: "dal12",
            },
            "it should return list of workspaces"
          );
        });
      });
    });
    describe("power_instance.ssh_key", () => {
      describe("power_instance.ssh_key.groups", () => {
        it("should return groups when no workspace", () => {
          let craig = newState();
          craig.power.create({
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
            ssh_keys: [],
          });
          assert.deepEqual(
            craig.power_instances.ssh_key.groups(
              { workspace: "" },
              { craig: craig }
            ),
            [],
            "it should return list of networks"
          );
        });
        it("should return groups when workspace", () => {
          let craig = newState();
          craig.power.create({
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
            ssh_keys: [],
          });
          assert.deepEqual(
            craig.power_instances.ssh_key.groups(
              { workspace: "toad" },
              { craig: craig }
            ),
            [],
            "it should return list of networks"
          );
        });
      });
      describe("power_instance.ssh_key.invalidText", () => {
        it("should return invalidText when no workspace", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.ssh_key.invalidText(
              { workspace: "" },
              { craig: craig }
            ),
            "Select a workspace",
            "it should return list of workspaces"
          );
        });
        it("should return invalidText when no workspace", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.ssh_key.invalidText(
              { workspace: "a" },
              { craig: craig }
            ),
            "Select an SSH Key",
            "it should return list of workspaces"
          );
        });
      });
    });
    describe("power_instance.network", () => {
      describe("power_instance.network.groups", () => {
        it("should return groups when no workspace", () => {
          let craig = newState();
          craig.power.create({
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
          });
          assert.deepEqual(
            craig.power_instances.network.groups(
              { workspace: "" },
              { craig: craig }
            ),
            [],
            "it should return list of networks"
          );
        });
        it("should return groups when workspace", () => {
          let craig = newState();
          craig.power.create({
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
          });
          assert.deepEqual(
            craig.power_instances.network.groups(
              { workspace: "toad" },
              { craig: craig }
            ),
            [],
            "it should return list of networks"
          );
        });
      });
      describe("power_instance.network.onStateChange", () => {
        it("should return new networks and update primary subnet with first network name value", () => {
          let craig = state();
          let data = {
            network: [{ name: "frog" }],
            primary_subnet: "frog",
          };
          craig.power_instances.network.onStateChange(data, { craig: craig }, [
            "frog",
            "toad",
          ]);
          assert.deepEqual(
            data,
            {
              network: [
                {
                  name: "frog",
                },
                {
                  name: "toad",
                  ip_address: "",
                },
              ],
              primary_subnet: "frog",
            },
            "it should return new network, clear primary subnet"
          );
        });
        it("should return new networks when deleting one and update primary subnet with first network name value or empty string", () => {
          let craig = state();
          let data = {
            network: [{ name: "frog" }],
            primary_subnet: "frog",
          };
          craig.power_instances.network.onStateChange(
            data,
            { craig: craig },
            []
          );
          assert.deepEqual(
            data,
            {
              network: [],
              primary_subnet: "",
            },
            "it should return a list of networks and clear primary subnet"
          );
        });
      });
      describe("power_instance.network.onRender", () => {
        it("should return network names", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.network.onRender({
              network: [{ name: "frog" }],
            }),
            ["frog"],
            "it should return a list of networks"
          );
        });
      });
      describe("power_instance.network.forceUpdateKey", () => {
        it("should have force update key for network", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.network.forceUpdateKey({
              workspace: "toad",
            }),
            "toad",
            "it should have correct force update key"
          );
        });
      });
      describe("power_instance.network.invalidText", () => {
        it("should return invalidText when no workspace", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.network.invalidText(
              { workspace: "" },
              { craig: craig }
            ),
            "Select a workspace",
            "it should return list of workspaces"
          );
        });
        it("should return invalidText when no workspace", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.network.invalidText(
              { workspace: "a" },
              { craig: craig }
            ),
            "Select at least one subnet",
            "it should return list of workspaces"
          );
        });
      });
      describe("power_instance.network.invalid", () => {
        it("should return invalid when empty", () => {
          assert.isTrue(
            state().power_instances.network.invalid({ network: [] }),
            "it should be true"
          );
        });
        it("should return invalid when no network", () => {
          assert.isTrue(
            state().power_instances.network.invalid({}),
            "it should be true"
          );
        });
        it("should return false when not empty and valid", () => {
          assert.isFalse(
            state().power_instances.network.invalid({
              network: [
                {
                  ip_address: "",
                },
              ],
            }),
            "it should be true"
          );
        });
      });
    });
    describe("power_instance.primary_subnet", () => {
      describe("power_instance.primary_subnet.groups", () => {
        it("should return groups when no network", () => {
          let craig = state();
          let data = {
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
          };
          assert.deepEqual(
            craig.power_instances.primary_subnet.groups(data, { craig: craig }),
            [],
            "it should return list of networks"
          );
        });
        it("should return groups when network", () => {
          let craig = state();
          let data = {
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [{ name: "frog" }],
          };
          assert.deepEqual(
            craig.power_instances.primary_subnet.groups(data, { craig: craig }),
            ["frog"],
            "it should return list of networks"
          );
        });
      });
      describe("power_instance.primary_subnet.onRender", () => {
        it("should return empty string if no network and no primary_subnet", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.primary_subnet.onRender({
              network: [],
              primary_subnet: "",
            }),
            "",
            "it should return a list of networks"
          );
        });
        it("should return first string in network if no primary subnet selected", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.primary_subnet.onRender({
              network: [{ name: "frog" }, { name: "toad" }, { name: "turtle" }],
              primary_subnet: "",
            }),
            "frog",
            "it should return a list of networks"
          );
        });
        it("should return primary subnet if already selected", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.primary_subnet.onRender({
              network: [{ name: "frog" }, { name: "toad" }, { name: "turtle" }],
              primary_subnet: "frog",
            }),
            "frog",
            "it should return a list of networks"
          );
        });
      });
      describe("power_instance.primary_subnet.onStateChange", () => {
        it("should return updated network array and update primary subnet", () => {
          let craig = state();
          let data = {
            network: [{ name: "frog" }, { name: "toad" }, { name: "turtle" }],
            primary_subnet: "",
          };
          craig.power_instances.primary_subnet.onStateChange(
            data,
            { craig: craig },
            "turtle"
          );
          assert.deepEqual(
            data,
            {
              network: [
                {
                  name: "turtle",
                },
                {
                  name: "frog",
                },
                {
                  name: "toad",
                },
              ],
              primary_subnet: "turtle",
            },
            "it should return new network and update primary subnet"
          );
        });
        it("should update primary subnet when no network", () => {
          let craig = state();
          let data = {
            network: [],
            primary_subnet: "toad",
          };
          craig.power_instances.primary_subnet.onStateChange(data);
          assert.deepEqual(
            data,
            {
              network: [],
              primary_subnet: "",
            },
            "it should return empty primary subnet"
          );
        });
      });
      describe("power_instance.primary_subnet.invalidText", () => {
        it("should return invalidText when no workspace", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.primary_subnet.invalidText(
              { workspace: "" },
              { craig: craig }
            ),
            "Select a workspace",
            "it should return invalid text"
          );
        });
        it("should return invalidText when no network", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.primary_subnet.invalidText(
              { workspace: "a", network: [] },
              { craig: craig }
            ),
            "Select at least one subnet",
            "it should return invalid text"
          );
        });
      });
    });
    describe("power_instance.image", () => {
      describe("power_instance.network.image", () => {
        it("should return image when no workspace", () => {
          let craig = newState();
          craig.power.create({
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
          });
          assert.deepEqual(
            craig.power_instances.image.groups(
              { workspace: "" },
              { craig: craig }
            ),
            [],
            "it should return list of networks"
          );
        });
        it("should return groups when workspace", () => {
          let craig = newState();
          craig.power.create({
            name: "toad",
            images: [
              { name: "7100-05-09", workspace: "toad" },
              { name: "VTL" },
            ],
            imageNames: ["7100-05-09"],
            zone: "dal12",
            network: [],
          });
          assert.deepEqual(
            craig.power_instances.image.groups(
              { workspace: "toad" },
              { craig: craig }
            ),
            ["7100-05-09"],
            "it should return list of images"
          );
        });
        it("should return groups when workspace", () => {
          let craig = newState();
          craig.power.create({
            name: "toad",
            images: [
              { name: "7100-05-09", workspace: "toad" },
              { name: "VTL" },
            ],
            imageNames: ["7100-05-09", "VTL"],
            zone: "dal12",
            network: [],
          });
          assert.deepEqual(
            craig.vtl.image.groups({ workspace: "toad" }, { craig: craig }),
            ["VTL"],
            "it should return list of images"
          );
        });
      });
    });
    describe("power_instances.pi_proc_type", () => {
      describe("power_instances.pi_proc_type.onRender", () => {
        it("should return empty string on render if no selection", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_proc_type.onRender({
              pi_proc_type: "",
            }),
            "",
            "it should render correct text"
          );
        });
        it("should return capitalized name on render", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_proc_type.onRender({
              pi_proc_type: "shared",
            }),
            "Shared",
            "it should render correct text"
          );
        });
      });
      describe("power_instances.pi_proc_type.onInputChange", () => {
        it("should return lower case name on change", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_proc_type.onInputChange({
              pi_proc_type: "Shared",
            }),
            "shared",
            "it should render correct text"
          );
        });
      });
    });
    describe("power_instances.pi_processors", () => {
      it("should return true when sap", () => {
        let craig = state();
        assert.isTrue(
          craig.power_instances.pi_processors.hideWhen({ sap: true }),
          "it should be true when sap"
        );
      });
    });
    describe("power_instances.pi_memory", () => {
      it("should return true when sap", () => {
        let craig = state();
        assert.isTrue(
          craig.power_instances.pi_memory.hideWhen({ sap: true }),
          "it should be true when sap"
        );
      });
    });
    describe("power_instances.storage_option", () => {
      describe("power_instances.storage_option.onStateChange", () => {
        let craig;
        beforeEach(() => {
          craig = state();
        });
        it("should set state when storage option is storage type", () => {
          let actualData = {
            storage_option: "None",
          };
          let expectedData = {
            storage_option: "None",
            pi_affinity_instance: null,
            pi_affinity_policy: null,
            pi_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_anti_affinity_volume: null,
            pi_storage_pool: null,
            affinity_type: null,
          };
          craig.power_instances.storage_option.onStateChange(actualData);
          assert.deepEqual(actualData, expectedData, "it should set data");
        });
        it("should set state when storage option is storage pool", () => {
          let actualData = {
            storage_option: "Storage Pool",
          };
          let expectedData = {
            storage_option: "Storage Pool",
            pi_affinity_instance: null,
            pi_affinity_policy: null,
            pi_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_anti_affinity_volume: null,
            affinity_type: null,
          };
          craig.power_instances.storage_option.onStateChange(actualData);
          assert.deepEqual(actualData, expectedData, "it should set data");
        });
        it("should set state when storage option is affinity", () => {
          let actualData = {
            storage_option: "Affinity",
          };
          let expectedData = {
            storage_option: "Affinity",
            pi_affinity_policy: "affinity",
            pi_anti_affinity_instance: null,
            pi_anti_affinity_volume: null,
            pi_storage_pool: null,
            affinity_type: null,
          };
          craig.power_instances.storage_option.onStateChange(actualData);
          assert.deepEqual(actualData, expectedData, "it should set data");
        });
        it("should set state when storage option is anti-affinity", () => {
          let actualData = {
            storage_option: "Anti-Affinity",
          };
          let expectedData = {
            storage_option: "Anti-Affinity",
            pi_affinity_policy: "anti-affinity",
            pi_affinity_instance: null,
            pi_affinity_volume: null,
            pi_storage_pool: null,
            affinity_type: null,
          };
          craig.power_instances.storage_option.onStateChange(actualData);
          assert.deepEqual(actualData, expectedData, "it should set data");
        });
      });
      describe("power_instances.storage_option.invalidText", () => {
        it("should return correct text when option is storage pool and no workspace", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.storage_option.invalidText({ workspace: "" }),
            "Select a workspace",
            "it should be equal"
          );
        });
        it("should return correct text when workspace is selected", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.storage_option.invalidText({
              workspace: "foo",
            }),
            "Select a storage option",
            "it should be equal"
          );
        });
      });
    });
    describe("power_instances.pi_storage_type", () => {
      describe("power_instances.pi_storage_type.onRender", () => {
        it("should return correct api endpoint", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_type.apiEndpoint({
              zone: "dal10",
            }),
            `/api/power/dal10/storage-tiers`,
            "it should return list of tiers"
          );
        });
        it("should hidden when no zone", () => {
          let craig = state();
          assert.isTrue(
            craig.power_instances.pi_storage_type.hideWhen({}),
            "it should not be hidden"
          );
        });
        it("should not be hidden when type is tier-1", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_type.onRender({
              storage_option: "",
              pi_storage_type: "tier1",
            }),
            "Tier-1",
            "it should return correct text"
          );
        });
        it("should render for tier5k", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_type.onRender({
              storage_option: "",
              pi_storage_type: "tier5k",
            }),
            "Fixed IOPs",
            "it should return correct text"
          );
        });
        it("should render for tier5k", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_type.onRender({
              storage_option: "",
              pi_storage_type: "tier5k",
            }),
            "Fixed IOPs",
            "it should return correct text"
          );
        });
        it("should return value for tier5k", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_type.onInputChange({
              storage_option: "",
              pi_storage_type: "Fixed IOPs",
            }),
            "tier5k",
            "it should return correct text"
          );
        });
        it("should not be hidden when type is not selected", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_type.onRender({
              storage_option: "",
              pi_storage_type: "",
            }),
            "",
            "it should return correct text"
          );
        });
      });
      describe("power_instances.pi_storage_type.onInputChange", () => {
        it("should not be hidden when type is tier-1", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_type.onInputChange({
              storage_option: "",
              pi_storage_type: "Tier-1",
            }),
            "tier1",
            "it should return correct text"
          );
        });
      });
    });
    describe("power_instances.pi_storage_pool", () => {
      describe("power_instances.pi_storage_pool.hideWhen", () => {
        it("should be shown when options is storage pool", () => {
          let craig = state();
          assert.isFalse(
            craig.power_instances.pi_storage_pool.hideWhen({
              storage_option: "Storage Pool",
            }),
            "it should be shown"
          );
        });
      });
      describe("power_instances.pi_storage_pool.apiEndpoint", () => {
        it("should return api endpoint for pi_storage_pool with region", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.pi_storage_pool.apiEndpoint(
              { zone: "us-south" },
              { craig: craig }
            ),
            "/api/power/us-south/storage-pools",
            "it should return api endpoint"
          );
        });
      });
    });
    describe("power_instance.affinity_type", () => {
      describe("power_instance.affinity_type.hideWhen", () => {
        it("should not be hidden when storage option is affinity", () => {
          assert.isFalse(
            state().power_instances.affinity_type.hideWhen({
              storage_option: "Affinity",
            }),
            "it should be shown"
          );
        });
      });
      describe("power_instance.affinity_type.onRender", () => {
        it("should return empty string when affinity type is null", () => {
          assert.deepEqual(
            state().power_instances.affinity_type.onRender({
              affinity_type: null,
            }),
            "",
            "it should be empty string"
          );
        });
        it("should return type when affinity type is null", () => {
          assert.deepEqual(
            state().power_instances.affinity_type.onRender({
              affinity_type: "Affinity",
            }),
            "Affinity",
            "it should be empty string"
          );
        });
      });
      describe("power_instances.affinity_type.invalid", () => {
        it("should be true when affinity option is selected and is null or empty string", () => {
          let craig = state();
          assert.isTrue(
            craig.power_instances.affinity_type.invalid({
              storage_option: "Affinity",
              affinity_type: "",
            }),
            "it should be invalid"
          );
        });
      });
      describe("power_instances.affinity_type.invalidText", () => {
        it("should return correct invalid text", () => {
          let craig = state();
          assert.deepEqual(
            craig.power_instances.affinity_type.invalidText({
              storage_option: "Affinity",
            }),
            "Select an Affinity option",
            "it should return correct invalid text"
          );
        });
      });
    });
    describe("power_instances.ip_address", () => {
      describe("power_instances.ip_address.invalidText", () => {
        it("should return correct invalid text", () => {
          assert.deepEqual(
            state().power_instances.ip_address.invalidText(),
            "Invalid IP address",
            "It should return correct error text"
          );
        });
      });
      describe("power_instances.ip_address.invalid", () => {
        it("should return false if empty string", () => {
          assert.isFalse(
            state().power_instances.ip_address.invalid(
              {
                network: [
                  {
                    ip_address: "",
                  },
                ],
              },
              {},
              0
            ),
            "it should not be invalid"
          );
        });
        it("should return true if not ipv4 string", () => {
          assert.isTrue(
            state().power_instances.ip_address.invalid(
              {
                network: [
                  {
                    ip_address: "aaa",
                  },
                ],
              },
              {},
              0
            ),
            "it should not be invalid"
          );
        });
        it("should return true if cidr block", () => {
          assert.isTrue(
            state().power_instances.ip_address.invalid(
              {
                network: [
                  {
                    ip_address: "1.2.3.4/5",
                  },
                ],
              },
              {},
              0
            ),
            "it should not be invalid"
          );
        });
      });
    });
    describe("power_instances.pi_anti_affinity_instance", () => {
      describe("power_instances.pi_anti_affinity_instance.groups", () => {
        it("should return list of groups", () => {
          let craig = newState();
          assert.deepEqual(
            craig.power_instances.pi_anti_affinity_instance.groups(
              { zone: "dal10", workspace: "frog" },
              {
                data: {
                  name: "hello",
                },
                craig: {
                  store: {
                    json: {
                      power_instances: [
                        {
                          workspace: "frog",
                          name: "hi",
                        },
                        {
                          workspace: "frog",
                          name: "hi",
                          pi_anti_affinity_policy: "egg",
                        },
                        {
                          workspace: "toad",
                          name: "hello",
                        },
                      ],
                    },
                  },
                },
              }
            ),
            ["hi", "hi"],
            "it should return fultered list of groups"
          );
        });
        it("should return list of groups", () => {
          let craig = newState();
          assert.deepEqual(
            craig.power_instances.pi_anti_affinity_instance.groups(
              { zone: "dal10", workspace: "frog" },
              {
                data: {
                  name: "hello",
                },
                craig: {
                  store: {
                    json: {
                      power_instances: [
                        {
                          workspace: "frog",
                          name: "hi",
                          pi_anti_affinity_policy: "egg",
                        },
                        {
                          workspace: "toad",
                          name: "hello",
                        },
                      ],
                    },
                  },
                },
              }
            ),
            ["hi"],
            "it should return fultered list of groups"
          );
        });
      });
    });
    describe("power_instances.pi_anti_affinity_volume", () => {
      describe("power_instances.pi_anti_affinity_volume.groups", () => {
        it("should return list of groups", () => {
          let craig = newState();
          assert.deepEqual(
            craig.power_instances.pi_anti_affinity_volume.groups(
              { zone: "dal10", workspace: "frog", pi_volume_size: "yes" },
              {
                data: {
                  name: "egg",
                },
                craig: {
                  store: {
                    json: {
                      power_volumes: [
                        {
                          workspace: "frog",
                          name: "hi",
                        },
                        {
                          workspace: "frog",
                          name: "hi",
                          pi_anti_affinity_policy: "egg",
                        },
                        {
                          workspace: "toad",
                          name: "hello",
                        },
                      ],
                    },
                  },
                },
              }
            ),
            ["hi", "hi"],
            "it should return fultered list of groups"
          );
        });
        it("should return list of groups", () => {
          let craig = newState();
          assert.deepEqual(
            craig.power_instances.pi_anti_affinity_volume.groups(
              { zone: "dal10", workspace: "frog" },
              {
                data: {
                  name: "egg",
                },
                craig: {
                  store: {
                    json: {
                      power_volumes: [
                        {
                          workspace: "frog",
                          name: "hi",
                        },
                        {
                          workspace: "frog",
                          name: "hi",
                          pi_anti_affinity_policy: "egg",
                        },
                        {
                          workspace: "toad",
                          name: "hello",
                        },
                      ],
                    },
                  },
                },
              }
            ),
            ["hi", "hi"],
            "it should return fultered list of groups"
          );
        });
      });
      describe("power_instances.pi_anti_affinity_volume.hideWhen", () => {
        let craig = newState();
        beforeEach(() => {
          craig = newState();
        });
        it("should be false when storage option is anti-affinity and type is volume", () => {
          assert.isFalse(
            craig.power_instances.pi_anti_affinity_volume.hideWhen({
              storage_option: "Anti-Affinity",
              affinity_type: "Volume",
            }),
            "It should be shown"
          );
        });
        it("should be true when storage option is anti-affinity and type is volume", () => {
          assert.isTrue(
            craig.power_instances.pi_anti_affinity_volume.hideWhen({
              storage_option: "Affinity",
              affinity_type: "Volume",
            }),
            "It should be shown"
          );
        });
      });
    });
    describe("power_instances ibmi license fields", () => {
      it("should hide toggle when image is not ibmi", () => {
        assert.isTrue(
          craig.power_instances.pi_ibmi_css.hideWhen({}),
          "it should be hidden"
        );
        assert.isTrue(
          craig.power_instances.pi_ibmi_css.hideWhen({
            image: "other",
          }),
          "it should be hidden"
        );
      });
      it("should return invalid for pi_ibmi_rds_users", () => {
        assert.isFalse(
          craig.power_instances.pi_ibmi_rds_users.invalid({}),
          "it should be false when no state object"
        );
        assert.isTrue(
          craig.power_instances.pi_ibmi_rds_users.invalid({
            pi_ibmi_rds_users: "aaa",
          }),
          "it should be true when not a number"
        );
        assert.isTrue(
          craig.power_instances.pi_ibmi_rds_users.invalid({
            pi_ibmi_rds_users: "-1",
          }),
          "it should be true when not in range"
        );
      });
    });
  });
});
