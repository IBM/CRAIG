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

describe("icd", () => {
  describe("icd.init", () => {
    it("should initialize icd", () => {
      let state = new newState();
      let expectedData = [];
      assert.deepEqual(
        state.store.json.icd,
        expectedData,
        "it should have icd initialized"
      );
    });
  });
  describe("icd.onStoreUpdate", () => {
    it("should set unfound icd to empty array", () => {
      let state = newState();
      state.store.json.icd = null;
      state.update();
      assert.deepEqual(state.store.json.icd, [], 'it should be an empty array');
    });
  });
  describe("icd crud functions", () => {
    let icdState;
    beforeEach(() => {
      icdState = new newState();
    });
    it("should add an icd instance", () => {
      icdState.icd.create({ name: "default" });
      assert.deepEqual(
        icdState.store.json.icd,
        [
          {
            name: "default",
            resource_group: null,
            kms: null,
            encryption_key: null,
          },
        ],
        "it should create icd"
      );
    });
    it("should save an icd instance", () => {
      icdState.icd.create({ name: "default" });
      icdState.icd.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        icdState.store.json.icd,
        [
          {
            name: "default",
            resource_group: "service-rg",
            kms: null,
            encryption_key: null,
          },
        ],
        "it should create icd"
      );
    });
    it("should delete an icd instance", () => {
      icdState.icd.create({ name: "default" });
      icdState.icd.delete({}, { data: { name: "default" } });
      assert.deepEqual(icdState.store.json.icd, [], "it should create icd");
    });
  });
});
