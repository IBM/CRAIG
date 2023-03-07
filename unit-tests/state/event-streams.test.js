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

describe("event_streams", () => {
  describe("event_streams.init", () => {
    it("should initialize event_streams", () => {
      let state = new newState();
      let expectedData = [];
      assert.deepEqual(
        state.store.json.event_streams,
        expectedData,
        "it should have event_streams initialized"
      );
    });
  });
  describe("event_streams crud functions", () => {
    let event_streamsState;
    beforeEach(() => {
      event_streamsState = new newState();
    });
    it("should add an event_streams instance", () => {
      event_streamsState.event_streams.create({ name: "default" });
      assert.deepEqual(
        event_streamsState.store.json.event_streams,
        [
          {
            name: "default",
            resource_group: null,
          },
        ],
        "it should create event_streams"
      );
    });
    it("should save an event_streams instance", () => {
      event_streamsState.event_streams.create({ name: "default" });
      event_streamsState.event_streams.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        event_streamsState.store.json.event_streams,
        [
          {
            name: "default",
            resource_group: "service-rg",
          },
        ],
        "it should create event_streams"
      );
    });
    it("should delete an event_streams instance", () => {
      event_streamsState.event_streams.create({ name: "default" });
      event_streamsState.event_streams.delete({}, { data: { name: "default" } });
      assert.deepEqual(
        event_streamsState.store.json.event_streams,
        [],
        "it should create event_streams"
      );
    });
  });
});
