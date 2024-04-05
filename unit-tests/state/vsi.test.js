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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("vsi.create", () => {
    it("should return the correct vsi deployment", () => {
      craig.vsi.create(
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
        craig.store.json.vsi[1],
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
        craig.store.vsiList,
        ["management-server", "test-vsi"],
        "it should set vsiList"
      );
    });
    it("should find kms based on key", () => {
      craig.vsi.create(
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
        craig.store.json.vsi[1],
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
        craig.store.vsiList,
        ["management-server", "test-vsi"],
        "it should set vsiList"
      );
    });
  });
  describe("vsi.save", () => {
    it("should update in place with new name", () => {
      craig.vsi.create(
        { name: "todd", vpc: "management" },
        { isTeleport: false }
      );
      craig.store.json.load_balancers.push({
        name: "lb",
        target_vsi: ["todd"],
        subnets: [],
        security_groups: [],
      });
      craig.store.json.load_balancers.push({
        name: "lb2",
        target_vsi: ["frog"],
        subnets: [],
        security_groups: [],
      });
      craig.vsi.save(
        { name: "test-vsi" },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        craig.store.json.vsi[1].name,
        "test-vsi",
        "it should update in place"
      );
    });
    it("should update in place with same name", () => {
      craig.vsi.create(
        {
          name: "todd",
          vpc: "management",
          security_groups: ["management-vsi"],
        },
        { isTeleport: false }
      );
      craig.vsi.save(
        { name: "todd", vpc: "workload", security_groups: ["workload-vsi"] },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        craig.store.json.vsi[1].security_groups,
        [],
        "it should update in place"
      );
      assert.deepEqual(
        craig.store.json.vsi[1].vpc,
        "workload",
        "it should have correct data"
      );
    });
    it("should update in place with same name when kms is null", () => {
      craig.vsi.create(
        {
          name: "todd",
          vpc: "management",
          security_groups: ["management-vsi"],
        },
        { isTeleport: false }
      );
      craig.vsi.save(
        {
          name: "todd",
          vpc: "workload",
          security_groups: ["workload-vsi"],
          encryption_key: "key",
        },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        craig.store.json.vsi[1].kms,
        "kms",
        "it should update in place"
      );
      assert.deepEqual(
        craig.store.json.vsi[1].encryption_key,
        "key",
        "it should update in place"
      );
    });
    it("should update in place with network interfaces", () => {
      craig.vsi.create(
        {
          name: "todd",
          vpc: "management",
        },
        { isTeleport: false }
      );
      craig.vsi.save(
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
        craig.store.json.vsi[1].network_interfaces,
        [
          {
            subnet: "f5-bastion-zone-1",
            security_groups: ["f5-bastion-sg"],
          },
          {
            subnet: "f5-external-zone-1",
            security_groups: ["f5-external-sg"],
          },
        ],
        "it should update in place"
      );
    });
    it("should update in place with image given image_name", () => {
      craig.vsi.create(
        {
          name: "todd",
          vpc: "management",
        },
        { isTeleport: false }
      );
      craig.vsi.save(
        {
          name: "todd",
          vpc: "management",
          image_name: "Description name [id]",
        },
        { data: { name: "todd" }, isTeleport: false }
      );
      assert.deepEqual(
        craig.store.json.vsi[1].image_name,
        "Description name [id]",
        "it should update in place"
      );
    });
  });
  describe("vsi.delete", () => {
    it("should delete a vsi deployment", () => {
      craig.vsi.delete({}, { data: { name: "management-server" } });
      assert.deepEqual(craig.store.json.vsi, [], "it should have none servers");
    });
  });
  describe("vsi.onStoreUpdate", () => {
    it("should set encryption key to null when deleted", () => {
      craig.key_management.keys.delete(
        {},
        {
          arrayParentName: "kms",
          data: { name: "vsi-volume-key" },
          isTeleport: false,
        }
      );
      assert.deepEqual(
        craig.store.json.vsi[0].encryption_key,
        null,
        "it should be null"
      );
    });
    it("should set ssh keys to empty array when deleted", () => {
      craig.ssh_keys.delete(
        {},
        {
          data: {
            name: "ssh-key",
          },
        }
      );
      assert.deepEqual(craig.store.json.vsi[0].ssh_keys, [], "it should be []");
    });
    it("should set subnets and security groups when vpc deleted", () => {
      craig.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(craig.store.json.vsi[0].subnets, [], "it should be []");
      assert.deepEqual(
        craig.store.json.vsi[0].security_groups,
        [],
        "it should be []"
      );
    });
    it("should set security groups when deleted", () => {
      craig.security_groups.delete({}, { data: { name: "management-vsi" } });
      assert.deepEqual(
        craig.store.json.vsi[0].security_groups,
        [],
        "it should be []"
      );
    });
  });
  describe("vsi.schema", () => {
    it("should reset security groups and subnets on state change", () => {
      let expectedData = {
        security_groups: [],
        subnets: [],
      };
      let actualData = {};
      craig.vsi.vpc.onStateChange(actualData);
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct data"
      );
    });
    it("should return api endpoint for image name with region", () => {
      assert.deepEqual(
        craig.vsi.image_name.apiEndpoint({}, { craig: craig }),
        "/api/vsi/us-south/images",
        "it should return api endpoint"
      );
    });
    it("should return api endpoint for snapshot name with region", () => {
      assert.deepEqual(
        craig.vsi.snapshot.apiEndpoint({}, { craig: craig }),
        "/api/vsi/us-south/snapshots",
        "it should return api endpoint"
      );
    });
    it("should hide image name when use snapshot", () => {
      assert.isTrue(
        craig.vsi.image_name.hideWhen({ use_snapshot: true }, { craig: craig }),
        "it should be hidden"
      );
    });
    it("should not have invalid image name when use snapshot", () => {
      assert.isFalse(
        craig.vsi.image_name.invalid({ use_snapshot: true }, { craig: craig }),
        "it should not be invalid"
      );
    });
    it("should not have invalid snapshot name when not using snapshot", () => {
      assert.isFalse(
        craig.vsi.snapshot.invalid({ use_snapshot: false }, { craig: craig }),
        "it should not be invalid"
      );
    });
    it("should have invalid snapshot name when using snapshot", () => {
      assert.isTrue(
        craig.vsi.snapshot.invalid({ use_snapshot: true }, { craig: craig }),
        "it should not be invalid"
      );
    });
    it("should not have invalid encryption key name when using snapshot", () => {
      assert.isFalse(
        craig.vsi.encryption_key.invalid(
          { use_snapshot: true },
          { craig: craig }
        ),
        "it should not be invalid"
      );
    });
    it("should hide snapshot when not using snapshot", () => {
      assert.isTrue(
        craig.vsi.snapshot.hideWhen({ use_snapshot: false }, { craig: craig }),
        "it should be hidden"
      );
    });
    it("should return api endpoint for profile with region", () => {
      assert.deepEqual(
        craig.vsi.profile.apiEndpoint({}, { craig: craig }),
        "/api/vsi/us-south/instanceProfiles",
        "it should return api endpoint"
      );
    });
    it("should return list of ssh keys", () => {
      assert.deepEqual(
        craig.vsi.ssh_keys.groups({}, { craig: craig }),
        ["ssh-key"],
        "it should return ssh keys"
      );
    });
  });
  describe("volumes", () => {
    describe("volumes.create", () => {
      it("should create a new vsi volume", () => {
        craig.vsi.volumes.create(
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
          craig.store.json.vsi[0].volumes,
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
        craig.vsi.volumes.create(
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
        craig.vsi.volumes.save(
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
          craig.store.json.vsi[0].volumes[0].name,
          "frog",
          "it should be null"
        );
      });
    });
    describe("volumes.delete", () => {
      it("should delete a vsi volume", () => {
        craig.vsi.volumes.create(
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
        craig.vsi.volumes.delete(
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
          craig.store.json.vsi[0].volumes,
          [],
          "it should be null"
        );
      });
    });
    describe("volumes.schema", () => {
      describe("capacity", () => {
        it("should be false if unfound", () => {
          assert.isFalse(
            craig.vsi.volumes.capacity.invalid({ capacity: "" }),
            "it should be valid"
          );
        });
        it("should be true if decimal", () => {
          assert.isTrue(
            craig.vsi.volumes.capacity.invalid({ capacity: "1.2" }),
            "it should be invalid"
          );
        });
        it("should be true if not in range", () => {
          assert.isTrue(
            craig.vsi.volumes.capacity.invalid({ capacity: "-1" }),
            "it should be invalid"
          );
        });
      });
    });
  });
});
