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
    it("should return the correct teleport vsi deployment", () => {
      let state = new newState();
      state.appid.create({
        name: "test-appid",
        keys: [],
      });
      state.vsi.create(
        {
          appid: "test-appid",
          name: "test-deployment",
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          image_name: "Ubuntu Minimal [ibm-ubuntu-18-04-6-minimal-amd64-2]",
          profile: "cx2-4x8",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          resource_group: "slz-management-rg",
          template: {
            deployment: "test-deployment",
            license: "TELEPORT_LICENSE",
            https_cert: "HTTPS_CERT",
            https_key: "HTTPS_KEY",
            hostname: "HOSTNAME",
            domain: "DOMAIN",
            bucket: "COS_BUCKET",
            bucket_endpoint: "COS_BUCKET_ENDPOINT",
            hmac_key_id: "HMAC_ACCESS_KEY_ID",
            hmac_secret_key_id: "HMAC_SECRET_ACCESS_KEY_ID",
            appid: "APPID_CLIENT_ID",
            appid_secret: "APPID_CLIENT_SECRET",
            appid_url: "APPID_ISSUER_URL",
            message_of_the_day: "MESSAGE_OF_THE_DAY",
            version: "TELEPORT_VERSION",
            claim_to_roles: [
              {
                email: "email@email.email",
                roles: ["role1", "role2"],
              },
              {
                email: "email2@email.email",
                roles: ["role1", "role2"],
              },
            ],
          },
          volumes: [],
        },
        {
          isTeleport: true,
        }
      );
      assert.deepEqual(
        state.store.json.teleport_vsi[0],
        {
          appid: "test-appid",
          name: "test-deployment",
          kms: "slz-kms",
          encryption_key: null,
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          image_name: "Ubuntu Minimal [ibm-ubuntu-18-04-6-minimal-amd64-2]",
          profile: "cx2-4x8",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          volumes: [],
          resource_group: null,
          template: {
            deployment: "test-deployment",
            license: "TELEPORT_LICENSE",
            https_cert: "HTTPS_CERT",
            https_key: "HTTPS_KEY",
            hostname: "HOSTNAME",
            domain: "DOMAIN",
            bucket: "COS_BUCKET",
            bucket_endpoint: "COS_BUCKET_ENDPOINT",
            hmac_key_id: "HMAC_ACCESS_KEY_ID",
            hmac_secret_key_id: "HMAC_SECRET_ACCESS_KEY_ID",
            appid: "APPID_CLIENT_ID",
            appid_secret: "APPID_CLIENT_SECRET",
            appid_url: "APPID_ISSUER_URL",
            message_of_the_day: "MESSAGE_OF_THE_DAY",
            version: "TELEPORT_VERSION",
            claim_to_roles: [
              {
                email: "email@email.email",
                roles: ["role1", "role2"],
              },
              {
                email: "email2@email.email",
                roles: ["role1", "role2"],
              },
            ],
          },
        },
        "it should return correct server"
      );
      assert.deepEqual(
        state.store.teleportVsiList,
        ["test-deployment"],
        "it should set teleportVsiList"
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
    it("should update teleport vsi in place with new name", () => {
      let state = new newState();
      state.vsi.create(
        {
          appid: "test-appid",
          name: "test-deployment",
          kms: "slz-kms",
          encryption_key: null,
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          image_name: "Ubuntu Minimal [ibm-ubuntu-18-04-6-minimal-amd64-2]",
          profile: "cx2-4x8",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          resource_group: null,
          template: {
            deployment: "test-deployment",
            license: "TELEPORT_LICENSE",
            https_cert: "HTTPS_CERT",
            https_key: "HTTPS_KEY",
            hostname: "HOSTNAME",
            domain: "DOMAIN",
            bucket: "COS_BUCKET",
            bucket_endpoint: "COS_BUCKET_ENDPOINT",
            hmac_key_id: "HMAC_ACCESS_KEY_ID",
            hmac_secret_key_id: "HMAC_SECRET_ACCESS_KEY_ID",
            appid: "APPID_CLIENT_ID",
            appid_secret: "APPID_CLIENT_SECRET",
            appid_url: "APPID_ISSUER_URL",
            message_of_the_day: "MESSAGE_OF_THE_DAY",
            version: "TELEPORT_VERSION",
            claim_to_roles: [
              {
                email: "email@email.email",
                roles: ["role1", "role2"],
              },
              {
                email: "email2@email.email",
                roles: ["role1", "role2"],
              },
            ],
          },
        },
        { isTeleport: true }
      );
      let expectedData = {
        appid: null,
        name: "todd",
        kms: "slz-kms",
        encryption_key: null,
        image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
        image_name: "Ubuntu Minimal [ibm-ubuntu-18-04-6-minimal-amd64-2]",
        profile: "cx2-4x8",
        security_groups: ["management-vpe-sg"],
        ssh_keys: ["slz-ssh-key"],
        subnet: "vsi-zone-1",
        vpc: "management",
        volumes: [],
        resource_group: null,
        template: {
          deployment: "todd",
          license: "TELEPORT_LICENSE",
          https_cert: "HTTPS_CERT",
          https_key: "HTTPS_KEY",
          hostname: "HOSTNAME",
          domain: "DOMAIN",
          bucket: "COS_BUCKET",
          bucket_endpoint: "COS_BUCKET_ENDPOINT",
          hmac_key_id: "HMAC_ACCESS_KEY_ID",
          hmac_secret_key_id: "HMAC_SECRET_ACCESS_KEY_ID",
          appid: "APPID_CLIENT_ID",
          appid_secret: "APPID_CLIENT_SECRET",
          appid_url: "APPID_ISSUER_URL",
          message_of_the_day: "MESSAGE_OF_THE_DAY",
          version: "TELEPORT_VERSION",
          claim_to_roles: [
            {
              email: "email@email.email",
              roles: ["role1", "role2"],
            },
            {
              email: "email2@email.email",
              roles: ["role1", "role2"],
            },
          ],
        },
      };
      state.vsi.save(
        {
          appid: "test-appid",
          name: "todd",
          kms: "slz-kms",
          encryption_key: null,
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          volumes: [],
          resource_group: null,
          template: {
            deployment: "test-deployment",
            license: "TELEPORT_LICENSE",
            https_cert: "HTTPS_CERT",
            https_key: "HTTPS_KEY",
            hostname: "HOSTNAME",
            domain: "DOMAIN",
            bucket: "COS_BUCKET",
            bucket_endpoint: "COS_BUCKET_ENDPOINT",
            hmac_key_id: "HMAC_ACCESS_KEY_ID",
            hmac_secret_key_id: "HMAC_SECRET_ACCESS_KEY_ID",
            appid: "APPID_CLIENT_ID",
            appid_secret: "APPID_CLIENT_SECRET",
            appid_url: "APPID_ISSUER_URL",
            message_of_the_day: "MESSAGE_OF_THE_DAY",
            version: "TELEPORT_VERSION",
            claim_to_roles: [
              {
                email: "email@email.email",
                roles: ["role1", "role2"],
              },
              {
                email: "email2@email.email",
                roles: ["role1", "role2"],
              },
            ],
          },
        },
        { data: { name: "test-deployment" }, isTeleport: true }
      );
      assert.deepEqual(
        state.store.json.teleport_vsi[0],
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
          data: {
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
