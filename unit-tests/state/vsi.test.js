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
          image: null,
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
        },
        "it should return correct server"
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
        },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        state.store.json.vsi[1],
        expectedData,
        "it should update in place"
      );
    });
    it("should save a teleport vsi", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
        },
        { isTeleport: true }
      );
      state.vsi.save(
        { subnet: "vsi-zone-1" },
        { isTeleport: true, data: { name: "todd" } }
      );
      assert.deepEqual(
        state.store.json.teleport_vsi[0].subnet,
        "vsi-zone-1",
        "it should have subnet set"
      );
    });
  });
  describe("vsi.delete", () => {
    it("should delete a vsi deployment", () => {
      let state = new newState();
      state.vsi.delete({}, { data: { name: "management-server" } });
      assert.deepEqual(state.store.json.vsi, [], "it should have none servers");
    });
    it("should delete a teleport vsi", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
        },
        { isTeleport: true }
      );
      state.vsi.delete({}, { isTeleport: true, data: { name: "todd" } });
      assert.deepEqual(
        state.store.json.teleport_vsi,
        [],
        "it should have no servers"
      );
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
    it("should set subnet to null for teleport vsi if subnet is deleted", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
          security_groups: ["management-vsi"],
          subnet: "vsi-zone-1",
        },
        { isTeleport: true }
      );
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          subnet: {
            name: "vsi-zone-1",
          },
        }
      );
      assert.deepEqual(
        state.store.json.teleport_vsi[0].subnet,
        null,
        "it should be null"
      );
    });
    it("should set vpc and subnet to null for teleport vsi if vpc is deleted", () => {
      let state = new newState();
      state.vsi.create(
        {
          name: "todd",
          vpc: "management",
          security_groups: ["management-vsi"],
          subnet: "vsi-zone-1",
        },
        { isTeleport: true }
      );
      state.vpcs.delete(
        {},
        {
          data: {
            name: "management",
          },
        }
      );
      assert.deepEqual(
        state.store.json.teleport_vsi[0].vpc,
        null,
        "it should be null"
      );
      assert.deepEqual(
        state.store.json.teleport_vsi[0].subnet,
        null,
        "it should be null"
      );
    });
  });
});
