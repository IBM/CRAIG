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

describe("options", () => {
  describe("options.init", () => {
    it("should initialize options in json", () => {
      let state = new newState();
      let expectedData = {
        prefix: "iac",
        region: "us-south",
        tags: ["hello", "world"],
      };
      assert.deepEqual(
        state.store.json._options,
        expectedData,
        "it should have options initialized"
      );
    });
  });
  describe("options.save", () => {
    let oState;
    beforeEach(() => {
      oState = new newState();
    });
    it("should change the prefix when saved", () => {
      oState.options.save({ prefix: "test" }, { data: { prefix: "iac" } });
      assert.deepEqual(oState.store.json._options.prefix, "test");
    });
    it("should update tags when saved", () => {
      oState.options.save(
        { tags: ["new", "tags", "here"] },
        { data: { tags: ["hello", "world"] } }
      );
      assert.deepEqual(oState.store.json._options.tags, [
        "new",
        "tags",
        "here",
      ]);
    });
  });
});
