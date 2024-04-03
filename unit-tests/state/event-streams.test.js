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
  describe("event streams schema", () => {
    describe("throughput", () => {
      it("should be hidden when plan is not enterprise", () => {
        assert.isTrue(
          craig.event_streams.throughput.hideWhen({ plan: "lite" }),
          "it should be hidden"
        );
      });
      it("should return correct groups for throughput", () => {
        assert.deepEqual(
          craig.event_streams.throughput.groups,
          ["150MB/s", "300MB/s", "450MB/s"],
          "it should return throughput types"
        );
      });
      it("should return true if event streams plan is enterprise and form has invalid throughput", () => {
        assert.isTrue(
          craig.event_streams.throughput.invalid(
            {
              plan: "enterprise",
              name: "foo-name",
              resource_group: "rg",
              endpoints: "private",
              throughput: null,
              storage_size: "2048",
              private_ip_allowlist: "1.1.1.1",
            },
            {
              craig: craig,
            }
          )
        );
      });
      it("should return true if event streams plan is not enterprise and form has invalid throughput", () => {
        assert.isFalse(
          craig.event_streams.throughput.invalid(
            {
              plan: "umm",
              name: "foo-name",
              resource_group: "rg",
              endpoints: "private",
              throughput: null,
              storage_size: "2048",
              private_ip_allowlist: "1.1.1.1",
            },
            {
              craig: craig,
            }
          )
        );
      });
    });
    describe("private_ip_allowlist", () => {
      it("should be hidden when plan is not enterprise", () => {
        assert.isTrue(
          craig.event_streams.private_ip_allowlist.hideWhen({ plan: "lite" }),
          "it should be hidden"
        );
      });
      it("should return true if event streams plan is enterprise and form has invalid private_ip_allowlist", () => {
        assert.isTrue(
          craig.event_streams.private_ip_allowlist.invalid(
            {
              plan: "enterprise",
              name: "foo-name",
              resource_group: "rg",
              endpoints: "private",
              throughput: "150",
              storage_size: "2048",
              private_ip_allowlist: "1.1.1.-sda,1.1.1.1",
            },
            {
              craig: craig,
            }
          )
        );
        assert.isFalse(
          craig.event_streams.private_ip_allowlist.invalid(
            {
              plan: "eee",
              name: "foo-name",
              resource_group: "rg",
              endpoints: "private",
              throughput: "150",
              storage_size: "2048",
              private_ip_allowlist: "1.1.1.-sda,1.1.1.1",
            },
            {
              craig: craig,
            }
          )
        );
      });
    });
  });
});
