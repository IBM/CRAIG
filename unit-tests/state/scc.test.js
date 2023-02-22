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

describe("security_compliance_center", () => {
  describe("security_compliance_center.init", () => {
    it("should initialize scc", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.json.security_compliance_center,
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
  describe("security_compliance_center.save", () => {
    it("should update", () => {
      let state = new newState();
      state.security_compliance_center.save({
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
        state.store.json.security_compliance_center,
        expectedData,
        "it should update values"
      );
    });
  });
});
