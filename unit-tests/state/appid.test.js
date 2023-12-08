const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("appid", () => {
  describe("appid.init", () => {
    it("should initialize appid", () => {
      let state = new newState();
      let expectedData = [];
      assert.deepEqual(
        state.store.json.appid,
        expectedData,
        "it should have appid initialized"
      );
    });
  });
  describe("appid crud functions", () => {
    let appidState;
    beforeEach(() => {
      appidState = new newState();
    });
    describe("appid on store update", () => {
      beforeEach(() => {
        appidState = new newState();
      });
      it("should add keys to object when unfound", () => {
        appidState.appid.create({
          name: "frog",
        });
        assert.deepEqual(
          appidState.store.json.appid,
          [{ name: "frog", keys: [], resource_group: null }],
          "it should set keys"
        );
      });
      it("should set encryption key to null when deleted", () => {
        appidState.appid.create({
          name: "default",
          keys: [],
          kms: "kms",
          encryption_key: "key",
        });
        appidState.key_management.keys.delete(
          {},
          {
            arrayParentName: "kms",
            data: { name: "key" },
            isTeleport: false,
          }
        );
        assert.deepEqual(
          appidState.store.json.appid[0].encryption_key,
          null,
          "it should be null"
        );
      });
      it("should set encryption key and kms to null when kms deleted", () => {
        appidState.appid.create({
          name: "default",
          keys: [],
          kms: "kms",
          encryption_key: "key",
        });
        appidState.key_management.delete(
          {},
          {
            data: { name: "kms" },
            isTeleport: false,
          }
        );
        assert.deepEqual(
          appidState.store.json.appid[0].kms,
          null,
          "it should be null"
        );
        assert.deepEqual(
          appidState.store.json.appid[0].encryption_key,
          null,
          "it should be null"
        );
      });
    });
    it("should add an appid instance", () => {
      appidState.appid.create({ name: "default", keys: [] });
      assert.deepEqual(
        appidState.store.json.appid,
        [
          {
            name: "default",
            resource_group: null,
            keys: [],
          },
        ],
        "it should create appid"
      );
    });
    it("should save an appid instance", () => {
      appidState.appid.create({ name: "default", keys: [] });
      appidState.appid.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        appidState.store.json.appid,
        [
          {
            name: "default",
            resource_group: "service-rg",
            keys: [],
          },
        ],
        "it should create appid"
      );
    });
    it("should delete an appid instance", () => {
      appidState.appid.create({ name: "default", keys: [] });
      appidState.appid.delete({}, { data: { name: "default" } });
      assert.deepEqual(
        appidState.store.json.appid,
        [],
        "it should create appid"
      );
    });
  });
  describe("appid key crud functions", () => {
    let appidState;
    beforeEach(() => {
      appidState = new newState();
      appidState.appid.create({ name: "default", keys: [] });
    });
    it("should add an appid instance", () => {
      appidState.appid.keys.create(
        {
          name: "test",
        },
        {
          innerFormProps: {
            arrayParentName: "default",
          },
        }
      );
      assert.deepEqual(
        appidState.store.json.appid,
        [
          {
            name: "default",
            resource_group: null,
            keys: [
              {
                appid: "default",
                name: "test",
              },
            ],
          },
        ],
        "it should create appid key"
      );
    });
    it("should save an appid instance", () => {
      appidState.appid.keys.create(
        {
          name: "test",
        },
        {
          innerFormProps: {
            arrayParentName: "default",
          },
        }
      );
      appidState.appid.keys.save(
        { resource_group: "service-rg" },
        {
          data: { name: "test" },
          arrayParentName: "default",
        }
      );
      assert.deepEqual(
        appidState.store.json.appid,
        [
          {
            name: "default",
            keys: [
              { name: "test", appid: "default", resource_group: "service-rg" },
            ],
            resource_group: null,
          },
        ],
        "it should save key"
      );
    });
    it("should delete an appid key", () => {
      appidState.appid.keys.create(
        {
          name: "test",
        },
        {
          innerFormProps: {
            arrayParentName: "default",
          },
        }
      );
      appidState.appid.keys.delete(
        {},
        {
          data: { name: "test" },
          arrayParentName: "default",
        }
      );
      assert.deepEqual(
        appidState.store.json.appid.keys.length,
        0,
        "it should delete appid key"
      );
    });
  });
  describe("appid form functions", () => {
    describe("appid form", () => {
      describe("appid.shouldDisableSave", () => {
        it("should return true if the name is invalid", () => {
          let state = newState();
          let actualData = disableSave(
            "appid",
            {
              name: "@@@",
              resource_group: null,
            },
            {
              craig: state,
              data: {
                name: "",
              },
            }
          );
          assert.isTrue(actualData, "it should be disabled");
        });
        it("should return false when name is valid, rg is invalid, and use data", () => {
          let state = newState();
          assert.isFalse(
            state.appid.resource_group.invalid({
              name: "name",
              resource_group: "",
              use_data: true,
            }),
            "it should be enabled"
          );
        });
        it("should return true if name is valid and resource group is invalid", () => {
          let state = newState();
          let actualData = disableSave(
            "appid",
            {
              name: "valid",
              resource_group: null,
            },
            {
              craig: state,
              data: {
                name: "",
              },
            }
          );
          assert.isTrue(actualData, "it should be disabled");
        });
      });
      describe("name", () => {
        it("should return true if appid has invalid name", () => {
          let state = newState();
          let actualData = state.appid.name.invalid(
            { name: "@@@" },
            {
              craig: state,
              data: {
                name: "",
              },
            }
          );
          assert.isTrue(actualData, "it should return true if name is invalid");
        });
        it("should return correct invalid text when appid has invalid name", () => {
          let state = newState();
          let actualData = state.appid.name.invalidText(
            { name: "@@@" },
            {
              craig: state,
              data: {
                name: "",
              },
            }
          );
          assert.deepEqual(
            actualData,
            "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
            "it should return correct text"
          );
        });
        it("should return true if appid has invalid duplicate name", () => {
          let state = newState();
          state.appid.create({ name: "egg" });
          let actualData = state.appid.name.invalid(
            { name: "egg" },
            {
              craig: state,
              data: {
                name: "",
              },
            }
          );
          assert.isTrue(actualData, "it should return true if name is invalid");
        });
        it("should return correct text if appid has invalid duplicate name", () => {
          let state = newState();
          state.appid.create({ name: "egg" });
          let actualData = state.appid.name.invalidText(
            { name: "egg" },
            {
              craig: state,
              data: {
                name: "",
              },
            }
          );
          assert.deepEqual(
            actualData,
            'Name "egg" already in use',
            "it should return correct text"
          );
        });
      });
      describe("encryption_keys", () => {
        it("should return correct groups for encryption keys", () => {
          let state = newState();
          assert.deepEqual(
            state.appid.encryption_key.groups({}, { craig: state }),
            ["key", "atracker-key", "vsi-volume-key", "roks-key"],
            "it should return groups"
          );
        });
      });
      describe("keys subform", () => {
        describe("name", () => {
          it("should return true if appid key has invalid name", () => {
            let state = newState();
            let actualData = state.appid.keys.name.invalid(
              { name: "@@@" },
              {
                craig: state,
                data: {
                  name: "",
                },
              }
            );
            assert.isTrue(
              actualData,
              "it should return true if name is invalid"
            );
          });
          it("should return correct text if appid key has invalid name", () => {
            let state = newState();
            let actualData = state.appid.keys.name.invalidText(
              { name: "@@@" },
              {
                craig: state,
                data: {
                  name: "",
                },
              }
            );
            assert.deepEqual(
              actualData,
              "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
              "it should return correct text"
            );
          });
          it("should return true if appid key has invalid duplicate name", () => {
            let state = newState();
            state.appid.create({ name: "egg" });
            state.appid.keys.create(
              { name: "egg" },
              {
                innerFormProps: {
                  arrayParentName: "egg",
                },
              }
            );
            let actualData = state.appid.keys.name.invalid(
              { name: "egg" },
              {
                craig: state,
                data: {
                  name: "",
                },
              }
            );
            assert.isTrue(
              actualData,
              "it should return true if name is invalid"
            );
          });
          it("should return correct text if appid key has invalid duplicate name", () => {
            let state = newState();
            state.appid.create({ name: "egg" });
            state.appid.keys.create(
              { name: "egg" },
              {
                innerFormProps: {
                  arrayParentName: "egg",
                },
              }
            );
            let actualData = state.appid.keys.name.invalidText(
              { name: "egg" },
              {
                craig: state,
                data: {
                  name: "aa",
                },
              }
            );
            assert.deepEqual(
              actualData,
              'Name "egg" already in use',
              "it should return correct text"
            );
          });
        });
      });
    });
  });
  describe("appid key function", () => {
    it("should disable save when invalid name", () => {
      assert.isTrue(
        disableSave("keys", { name: "@@@" }, { craig: newState() }),
        "it should be disabled"
      );
    });
  });
});
