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
      };
      assert.deepEqual(
        state.store.json.scc,
        expectedData,
        "it should update values"
      );
    });
  });
});
