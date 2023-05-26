const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("vsi", () => {
  describe("vsi.create", () => {
    it("should return the correct vsi deployment", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "test-vsi",
          vpc: "management",
          image_name: "frog",
        },
        {
          isTeleport: false,
        }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        {
          kms: null,
          encryption_key: null,
          image: "frog",
          image_name: "frog",
          profile: null,
          name: "test-vsi",
          security_groups: [],
          ssh_keys: [],
          subnets: [],
          vpc: "management",
          vsi_per_subnet: null,
          resource_group: null,
          override_vsi_name: null,
          user_data: null,
          network_interfaces: [],
          volumes: [],
        },
        "it should return correct server"
      );
      assert.deepEqual(
        state.store.vsiList,
        ["management-server", "test-vsi"],
        "it should set vsiList"
      );
    });
    it("should find kms based on key", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "test-vsi",
          vpc: "management",
          encryption_key: "atracker-key",
        },
        {
          isTeleport: false,
        }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        {
          kms: "kms",
          encryption_key: "atracker-key",
          image: null,
          image_name: null,
          profile: null,
          name: "test-vsi",
          security_groups: [],
          ssh_keys: [],
          subnets: [],
          vpc: "management",
          vsi_per_subnet: null,
          resource_group: null,
          override_vsi_name: null,
          user_data: null,
          network_interfaces: [],
          volumes: [],
        },
        "it should return correct server"
      );
      assert.deepEqual(
        state.store.vsiList,
        ["management-server", "test-vsi"],
        "it should set vsiList"
      );
    });
  });
  describe("vsi.save", () => {
    it("should update in place with new name", () => {
      let state = new newState();
      state.vsi.create(
        { name: "todd", vpc: "management" },
        { isTeleport: false }
      );
      let expectedData = {
        kms: null,
        encryption_key: null,
        image: null,
        image_name: null,
        profile: null,
        name: "test-vsi",
        security_groups: [],
        ssh_keys: [],
        subnets: [],
        vpc: "management",
        vsi_per_subnet: null,
        resource_group: null,
        override_vsi_name: null,
        user_data: null,
        network_interfaces: [],
        volumes: [],
      };
      state.vsi.save(
        { name: "test-vsi" },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        expectedData,
        "it should update in place"
      );
    });
    it("should update in place with same name", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
          security_groups: ["management-vsi"],
        },
        { isTeleport: false }
      );
      let expectedData = {
        kms: null,
        encryption_key: null,
        image: null,
        image_name: null,
        profile: null,
        name: "todd",
        security_groups: ["workload-vsi-sg"],
        ssh_keys: [],
        subnets: [],
        vpc: "workload",
        vsi_per_subnet: null,
        resource_group: null,
        override_vsi_name: null,
        user_data: null,
        network_interfaces: [],
        volumes: [],
      };
      state.vsi.save(
        { name: "todd", vpc: "workload", security_groups: ["workload-vsi-sg"] },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        expectedData,
        "it should update in place"
      );
    });
    it("should update in place with same name when kms is null", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
          security_groups: ["management-vsi"],
        },
        { isTeleport: false }
      );
      let expectedData = {
        kms: "kms",
        encryption_key: "key",
        image: null,
        image_name: null,
        profile: null,
        name: "todd",
        security_groups: ["workload-vsi-sg"],
        ssh_keys: [],
        subnets: [],
        vpc: "workload",
        vsi_per_subnet: null,
        resource_group: null,
        override_vsi_name: null,
        user_data: null,
        network_interfaces: [],
        volumes: [],
      };
      state.vsi.save(
        {
          name: "todd",
          vpc: "workload",
          security_groups: ["workload-vsi-sg"],
          encryption_key: "key",
        },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        expectedData,
        "it should update in place"
      );
    });
    it("should update in place with network interfaces", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
        },
        { isTeleport: false }
      );
      let expectedData = {
        kms: null,
        encryption_key: null,
        image: null,
        image_name: null,
        profile: null,
        name: "todd",
        security_groups: [],
        ssh_keys: [],
        subnets: [],
        vpc: "management",
        vsi_per_subnet: null,
        resource_group: null,
        override_vsi_name: null,
        user_data: null,
        network_interfaces: [
          {
            subnet: "f5-bastion-zone-1",
            security_groups: ["f5-bastion-sg"],
          },
          {
            subnet: "f5-external-zone-1",
            security_groups: ["f5-external-sg"],
          },
        ],
        volumes: [],
      };
      state.vsi.save(
        {
          name: "todd",
          vpc: "management",
          network_interfaces: [
            {
              subnet: "f5-bastion-zone-1",
              security_groups: ["f5-bastion-sg"],
            },
            {
              subnet: "f5-external-zone-1",
              security_groups: ["f5-external-sg"],
            },
          ],
          volumes: [],
        },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        expectedData,
        "it should update in place"
      );
    });
    it("should update in place with image given image_name", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
        },
        { isTeleport: false }
      );
      let expectedData = {
        kms: null,
        encryption_key: null,
        image: "id",
        image_name: "Description name [id]",
        profile: null,
        name: "todd",
        security_groups: [],
        ssh_keys: [],
        subnets: [],
        vpc: "management",
        vsi_per_subnet: null,
        resource_group: null,
        override_vsi_name: null,
        user_data: null,
        network_interfaces: [],
        volumes: [],
      };
      state.vsi.save(
        {
          name: "todd",
          vpc: "management",
          image_name: "Description name [id]",
        },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        expectedData,
        "it should update in place"
      );
    });
  });
  describe("vsi.delete", () => {
    it("should delete a vsi deployment", () => {
      let state = new newState();
      state.vsi.delete({}, { data: { name: "management-server" } });
      assert.deepEqual(state.store.json.vsi, [], "it should have none servers");
    });
  });
  describe("vsi.onStoreUpdate", () => {
    it("should set encryption key to null when deleted", () => {
      let state = new newState();
      state.key_management.keys.delete(
        {},
        {
          arrayParentName: "kms",
          data: { name: "vsi-volume-key" },
          isTeleport: false,
        }
      );
      assert.deepEqual(
        state.store.json.vsi[0].encryption_key,
        null,
        "it should be null"
      );
    });
  });
  describe("volumes", () => {
    describe("volumes.create", () => {
      it("should create a new vsi volume", () => {
        let state = new newState();
        state.vsi.volumes.create(
          {
            name: "block-storage-1",
            profile: "custom",
            capacity: 200,
            iops: 1000,
            encryption_key: "slz-vsi-volume-key",
          },
          {
            innerFormProps: {
              arrayParentName: "management-server",
            },
          }
        );
        assert.deepEqual(
          state.store.json.vsi[0].volumes,
          [
            {
              name: "block-storage-1",
              profile: "custom",
              capacity: 200,
              iops: 1000,
              encryption_key: "slz-vsi-volume-key",
            },
          ],
          "it should be null"
        );
      });
    });
    describe("volumes.save", () => {
      it("should save a vsi volume", () => {
        let state = new newState();
        state.vsi.volumes.create(
          {
            name: "block-storage-1",
            profile: "custom",
            capacity: 200,
            iops: 1000,
            encryption_key: "slz-vsi-volume-key",
          },
          {
            data: {
              name: "block-storage-1",
            },
            arrayParentName: "management-server",
            innerFormProps: {
              arrayParentName: "management-server",
            },
          }
        );
        state.vsi.volumes.save(
          {
            name: "frog",
            profile: "custom",
            capacity: 200,
            iops: 1000,
            encryption_key: "slz-vsi-volume-key",
          },
          {
            data: {
              name: "block-storage-1",
            },
            arrayParentName: "management-server",
          }
        );
        assert.deepEqual(
          state.store.json.vsi[0].volumes,
          [
            {
              name: "frog",
              profile: "custom",
              capacity: 200,
              iops: 1000,
              encryption_key: "slz-vsi-volume-key",
            },
          ],
          "it should be null"
        );
      });
    });
    describe("volumes.delete", () => {
      let state = new newState();
      state.vsi.volumes.create(
        {
          name: "block-storage-1",
          profile: "custom",
          capacity: 200,
          iops: 1000,
          encryption_key: "slz-vsi-volume-key",
        },
        {
          data: {
            name: "block-storage-1",
          },
          innerFormProps: {
            arrayParentName: "management-server",
          },
        }
      );
      it("should delete a vsi volume", () => {
        state.vsi.volumes.delete(
          {},
          {
            data: {
              name: "block-storage-1",
            },
            arrayParentName: "management-server",
            innerFormProps: {},
          }
        );
        assert.deepEqual(
          state.store.json.vsi[0].volumes,
          [],
          "it should be null"
        );
      });
    });
  });
});
