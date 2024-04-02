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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("event_streams.init", () => {
    it("should initialize event_streams", () => {
      assert.deepEqual(
        craig.store.json.event_streams,
        [],
        "it should have event_streams initialized"
      );
    });
  });
  describe("event_streams crud functions", () => {
    beforeEach(() => {
      craig.event_streams.create({ name: "default" });
    });
    it("should add an event_streams instance", () => {
      assert.deepEqual(
        craig.store.json.event_streams,
        [
          {
            name: "default",
            resource_group: null,
            kms: null,
            encryption_key: null,
          },
        ],
        "it should create event_streams"
      );
    });
    it("should save an event_streams instance", () => {
      craig.event_streams.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        craig.store.json.event_streams,
        [
          {
            name: "default",
            resource_group: "service-rg",
            kms: null,
            encryption_key: null,
          },
        ],
        "it should create event_streams"
      );
    });
    it("should delete an event_streams instance", () => {
      craig.event_streams.delete({}, { data: { name: "default" } });
      assert.deepEqual(
        craig.store.json.event_streams,
        [],
        "it should create event_streams"
      );
    });
  });
});
