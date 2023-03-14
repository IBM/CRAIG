const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize slz with store update callback
 * @returns {slzStore} slz state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("scc", () => {
  describe("scc.init", () => {
    it("should initialize scc", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.json.scc,
        {
          credential_description: null,
          id: null,
          passphrase: null,
          name: "",
          location: "us",
          collector_description: null,
          is_public: false,
          scope_description: null,
          enable: false,
        },
        "it should set defaults"
      );
    });
  });
  describe("scc.save", () => {
    it("should update", () => {
      let state = new newState();
      state.scc.save({
        credential_description: "test",
        id: "frog",
        name: "todd",
        is_public: true,
        enable: false,
      });
      let expectedData = {
        credential_description: "test",
        id: "frog",
        passphrase: null,
        name: "todd",
        location: "us",
        collector_description: null,
        is_public: true,
        scope_description: null,
        enable: false,
      };
      assert.deepEqual(
        state.store.json.scc,
        expectedData,
        "it should update values"
      );
    });
    it("should update enable from false to true when scope description is provided", () => {
      let state = new newState();
      state.scc.save({
        credential_description: "test",
        id: "frog",
        name: "todd",
        is_public: true,
        scope_description: "frog",
        enable: false,
      });
      let expectedData = {
        credential_description: "test",
        id: "frog",
        passphrase: null,
        name: "todd",
        location: "us",
        collector_description: null,
        is_public: true,
        scope_description: "frog",
        enable: true,
      };
      assert.deepEqual(
        state.store.json.scc,
        expectedData,
        "it should update values"
      );
    });
  });
  describe("scc.delete", () => {
    it("should update", () => {
      let state = new newState();
      state.scc.delete();
      let expectedData = {
        credential_description: null,
        id: null,
        passphrase: null,
        name: null,
        location:  null,
        collector_description: null,
        is_public: false,
        scope_description: null,
        enable: false,
      };
      assert.deepEqual(
        state.store.json.scc,
        expectedData,
        "it should update values"
      );
    });
  });
});
