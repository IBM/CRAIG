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

describe("state util functions", () => {
  describe("toggleStoreValue", () => {
    it("should toggle a boolean store value", () => {
      let state = newState();
      state.toggleStoreValue("hideCodeMirror");
      assert.isTrue(state.store.hideCodeMirror, "it should toggle value");
    });
  });
});
