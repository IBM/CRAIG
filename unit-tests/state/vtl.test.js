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

describe("vtl", () => {
  describe("vtl.init", () => {
    it("should initialize power vs instances", () => {
      let state = newState();
      assert.deepEqual(state.store.json.vtl, [], "it should initialize data");
    });
  });
  describe("vtl.create", () => {
    it("should create a new power vs instance", () => {
      let state = newState();
      state.vtl.create({
        name: "frog",
        zone: "dal12",
      });
      assert.deepEqual(
        state.store.json.vtl,
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
      state.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      assert.deepEqual(
        state.store.json.vtl,
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
  describe("vtl.save", () => {
    it("should save a power vs instance", () => {
      let state = newState();
      state.vtl.create({
        name: "toad",
        image: null,
        ssh_key: null,
        network: [],
        workspace: null,
        zone: null,
      });
      state.vtl.save(
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
        state.store.json.vtl,
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
      state.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      state.vtl.save(
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
        state.store.json.vtl,
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
      state.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
      });
      state.vtl.save(
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
        state.store.json.vtl,
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
      state.vtl.create({
        name: "frog",
        zone: "dal12",
      });
      state.vtl.save(
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
        state.store.json.vtl,
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
      state.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
        zone: "dal12",
        workspace: "frog",
        network: [],
      });
      state.vtl.save(
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
        state.store.json.vtl,
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
    it("should delete power vs volumes when converting sap volume to non-sap", () => {
      let state = newState();
      state.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      state.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      state.vtl.save(
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
        state.store.json.vtl,
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
  describe("vtl.delete", () => {
    it("should delete a power vs instance", () => {
      let state = newState();
      state.vtl.create({
        name: "toad",
      });
      state.vtl.delete(
        {
          name: "frog",
        },
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(state.store.json.vtl, [], "it should delete instance");
    });
    it("should delete power vs volumes when deleting sap instance", () => {
      let state = newState();
      state.store.json.power_volumes.push({
        attachments: null,
        workspace: null,
        name: "ignore-me",
      });
      state.vtl.create({
        name: "frog",
        sap: true,
        sap_profile: "ush1-4x128",
      });
      state.vtl.delete(
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

      assert.deepEqual(state.store.json.vtl, [], "it should create instance");
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
  describe("vtl.onStoreUpdate", () => {
    it("should add power when not created on store update", () => {
      let state = newState();
      delete state.store.json.vtl;
      state.update();
      assert.deepEqual(state.store.json.vtl, [], "it should initialize data");
    });
    it("should update ssh key, network, image, primary subnet, and workspace when unfound", () => {
      let state = newState();
      state.vtl.create({
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
        state.store.json.vtl,
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
    it("should update ssh key, network, image, and priamry subnet when workspace is unfound", () => {
      let state = newState();
      state.power.create({
        name: "toad",
        images: [{ name: "7100-05-09", workspace: "toad" }],
        zone: "dal10",
      });
      state.vtl.create({
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
        state.store.json.vtl,
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
      state.vtl.create({
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
        state.store.json.vtl,
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
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      state.vtl.create({
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
        state.store.json.vtl,
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
        imageNames: ["7100-05-09"],
      });
      state.power.ssh_keys.create(
        { name: "test-key" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      state.power.network.create(
        { name: "test-network" },
        { innerFormProps: { arrayParentName: "toad" } }
      );
      state.vtl.create({
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
        state.store.json.vtl,
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
      state.vtl.create({
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
        state.store.json.vtl,
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
  describe("vtl.schema", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
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
    describe("vtl.pi_sys_type", () => {
      it("should return groups", () => {
        assert.deepEqual(
          craig.vtl.pi_sys_type.groups,
          ["s922", "e980"],
          "it should return groups"
        );
      });
    });
  });
});
