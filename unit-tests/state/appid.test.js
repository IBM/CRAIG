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
    it("should add an appid instance", () => {
      appidState.appid.create({ name: "default" });
      assert.deepEqual(
        appidState.store.json.appid,
        [
          {
            name: "default",
            resource_group: null,
          },
        ],
        "it should create appid"
      );
    });
    it("should save an appid instance", () => {
      appidState.appid.create({ name: "default" });
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
          },
        ],
        "it should create appid"
      );
    });
    it("should delete an appid instance", () => {
      appidState.appid.create({ name: "default" });
      appidState.appid.delete({}, { data: { name: "default" } });
      assert.deepEqual(
        appidState.store.json.appid,
        [],
        "it should create appid"
      );
    });
  });
});
