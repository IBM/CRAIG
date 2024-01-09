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
        assert.isTrue(
          craig.store.json._options.enable_classic,
          "it should enable classic"
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
        assert.isFalse(
          craig.store.json._options.enable_classic,
          "it should disable classic"
        );
      });
    });
    describe("classic_ssh_keys.schema", () => {
      describe("classic_ssh_keys.public_key", () => {
        describe("classic_ssh_keys.public_key.invalidText", () => {
          it("should return correct invalid text for ssh key with invalid public key", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_ssh_keys.public_key.invalidText(
                {
                  name: "classic-key",
                  public_key: "wrong",
                },
                {
                  classic: true,
                  craig: craig,
                  data: {
                    name: "hi",
                  },
                }
              ),
              "Provide a unique SSH public key that does not exist in the IBM Cloud account in your region",
              "it should return correct invalid text"
            );
          });
        });
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
              router_hostname: "",
            },
          ],
          "it should create key"
        );
        assert.isTrue(
          craig.store.json._options.enable_classic,
          "it should enable classic"
        );
      });
    });
    describe("classic_vlans.onStoreUpdate", () => {
      it("should remove unfound classic vlans from router hostname", () => {
        let craig = newState();
        craig.classic_vlans.create({
          name: "vsrx-public",
          datacenter: "dal10",
          type: "PUBLIC",
          router_hostname: "fake",
        });
        assert.deepEqual(
          craig.store.json.classic_vlans,
          [
            {
              name: "vsrx-public",
              datacenter: "dal10",
              type: "PUBLIC",
              router_hostname: "",
            },
          ],
          "it should create vlan"
        );
      });
      it("should not remove found classic vlans from router hostname", () => {
        let craig = newState();
        craig.classic_vlans.create({
          name: "vsrx-public",
          datacenter: "dal10",
          type: "PUBLIC",
        });
        craig.classic_vlans.create({
          name: "vsrx-public2",
          datacenter: "dal10",
          type: "PUBLIC",
          router_hostname: "vsrx-public",
        });
        assert.deepEqual(
          craig.store.json.classic_vlans,
          [
            {
              name: "vsrx-public",
              datacenter: "dal10",
              type: "PUBLIC",
              router_hostname: "",
            },
            {
              datacenter: "dal10",
              name: "vsrx-public2",
              router_hostname: "vsrx-public",
              type: "PUBLIC",
            },
          ],
          "it should create vlan"
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
              router_hostname: "",
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
    describe("classic_vlans.schema", () => {
      describe("classic_vlans.name", () => {
        describe("classic_vlans.name.helperText", () => {
          it("should return helper text", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.name.helperText(
                { name: "frog" },
                {
                  craig: {
                    store: {
                      json: {
                        _options: {
                          prefix: "frog",
                        },
                      },
                    },
                  },
                }
              ),
              "frog-frog",
              "it should return correct helper text"
            );
          });
        });
      });
      describe("classic_vlans.type", () => {
        describe("classic_vlans.type.onRender", () => {
          it("should return correct name on render", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.type.onRender({ type: "PUBLIC" }),
              "Public",
              "it should set to titlecase"
            );
          });
          it("should return correct name on render when no type", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.type.onRender({ type: undefined }),
              "",
              "it should set to titlecase"
            );
          });
        });
        describe("classic_vlans.type.invalidText", () => {
          it("should return invalid text", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.type.invalidText(),
              "Select a type",
              "it should return correct text"
            );
          });
        });
        describe("classic_vlans.type.onInputChange", () => {
          it("should return correct name on input change", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.type.onInputChange({ type: "Public" }),
              "PUBLIC",
              "it should set to ALLCAPS"
            );
          });
        });
      });
      describe("classic_vlans.datacenter", () => {
        describe("classic_vlans.datacenters.invalidText", () => {
          it("should return correct text", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.datacenter.invalidText(),
              "Select a datacenter",
              "It should return correct invalid text"
            );
          });
        });
      });
      describe("classic_vlans.router_hostname", () => {
        describe("classic_vlans.router_hostname.invalid", () => {
          it("should return false", () => {
            let craig = newState();
            assert.isFalse(
              craig.classic_vlans.router_hostname.invalid(),
              "It should return correct invalid text"
            );
          });
        });
        describe("classic_vlans.router_hostname.groups", () => {
          it("should return groups when modal", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.router_hostname.groups(
                {
                  datacenter: "dal10",
                },
                {
                  isModal: true,
                  craig: {
                    store: {
                      json: {
                        classic_vlans: [
                          {
                            name: "hi",
                            datacenter: "wdc06",
                          },
                          {
                            name: "mom",
                            datacenter: "dal10",
                          },
                        ],
                      },
                    },
                  },
                }
              ),
              ["mom"],
              "It should return correct groups"
            );
          });
          it("should return groups when not modal", () => {
            let craig = newState();
            assert.deepEqual(
              craig.classic_vlans.router_hostname.groups(
                {
                  datacenter: "dal10",
                  name: "hi",
                },
                {
                  data: {
                    name: "hi",
                  },
                  craig: {
                    store: {
                      json: {
                        classic_vlans: [
                          {
                            name: "hi",
                            datacenter: "wdc06",
                          },
                          {
                            name: "mom",
                            datacenter: "dal10",
                          },
                        ],
                      },
                    },
                  },
                }
              ),
              ["mom"],
              "It should return correct groups"
            );
          });
        });
      });
    });
  });
});
