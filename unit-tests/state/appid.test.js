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
});
