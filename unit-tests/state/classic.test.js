const { state } = require("../../client/src/lib/state");
const { assert } = require("chai");

function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("classic", () => {
  describe("classic ssh keys", () => {
    describe("classic_ssh_keys.init", () => {
      it("should initialize classic ssh keys", () => {
        let craig = newState();
        assert.deepEqual(
          craig.store.json.classic_ssh_keys,
          [],
          "it should initialize value"
        );
      });
    });
    describe("classic_ssh_keys.create", () => {
      it("should create an ssh key", () => {
        let craig = newState();
        craig.classic_ssh_keys.create({
          name: "example-classic",
          public_key: "1234",
          datacenter: "dal10",
        });
        assert.deepEqual(
          craig.store.json.classic_ssh_keys,
          [
            {
              name: "example-classic",
              public_key: "1234",
              datacenter: "dal10",
            },
          ],

          "it should create key"
        );
      });
    });
    describe("classic_ssh_keys.save", () => {
      it("should update an ssh key", () => {
        let craig = newState();
        craig.classic_ssh_keys.create({
          name: "example-classic",
          public_key: "1234",
          datacenter: "dal10",
        });
        craig.classic_ssh_keys.save(
          {
            name: "update-classic",
            public_key: "1234",
            datacenter: "dal10",
          },
          {
            data: {
              name: "example-classic",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.classic_ssh_keys,
          [
            {
              name: "update-classic",
              public_key: "1234",
              datacenter: "dal10",
            },
          ],

          "it should create key"
        );
      });
    });
    describe("classic_ssh_keys.delete", () => {
      it("should update an ssh key", () => {
        let craig = newState();
        craig.classic_ssh_keys.create({
          name: "example-classic",
          public_key: "1234",
          datacenter: "dal10",
        });
        craig.classic_ssh_keys.delete(
          {
            name: "update-classic",
            public_key: "1234",
            datacenter: "dal10",
          },
          {
            data: {
              name: "example-classic",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.classic_ssh_keys,
          [],
          "it should create key"
        );
      });
    });
  });
  describe("classic vlans", () => {
    describe("classic_vlans.init", () => {
      it("should initialize classic ssh keys", () => {
        let craig = newState();
        assert.deepEqual(
          craig.store.json.classic_vlans,
          [],
          "it should initialize value"
        );
      });
    });
    describe("classic_vlans.create", () => {
      it("should create a vlan", () => {
        let craig = newState();
        craig.classic_vlans.create({
          name: "vsrx-public",
          datacenter: "dal10",
          type: "PUBLIC",
        });
        assert.deepEqual(
          craig.store.json.classic_vlans,
          [
            {
              name: "vsrx-public",
              datacenter: "dal10",
              type: "PUBLIC",
            },
          ],
          "it should create key"
        );
      });
    });
    describe("classic_vlans.save", () => {
      it("should update a vlan", () => {
        let craig = newState();
        craig.classic_vlans.create({
          name: "vsrx-public",
          datacenter: "dal10",
          type: "PUBLIC",
        });
        craig.classic_vlans.save(
          {
            name: "aaa-public",
            datacenter: "dal10",
            type: "PUBLIC",
          },
          {
            data: {
              name: "vsrx-public",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.classic_vlans,
          [
            {
              name: "aaa-public",
              datacenter: "dal10",
              type: "PUBLIC",
            },
          ],

          "it should create key"
        );
      });
    });
    describe("classic_vlans.delete", () => {
      it("should update an ssh key", () => {
        let craig = newState();
        craig.classic_vlans.create({
          name: "vsrx-public",
          datacenter: "dal10",
          type: "PUBLIC",
        });
        craig.classic_vlans.delete(
          {
            name: "update-classic",
            public_key: "1234",
            datacenter: "dal10",
          },
          {
            data: {
              name: "vsrx-public",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.classic_vlans,
          [],
          "it should create key"
        );
      });
    });
  });
});
