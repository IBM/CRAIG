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

describe("cloud_logs", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("onStoreUpdate", () => {
    it("should update unfound object storage buckets when cloud logs is enabled", () => {
      craig.cloud_logs.save({
        enabled: true,
        cos: "atracker-cos",
        logs_bucket: "oops",
        metrics_bucket: "oops again",
      });
      assert.deepEqual(
        craig.store.json.cloud_logs,
        {
          cos: "atracker-cos",
          resource_group: null,
          logs_bucket: null,
          metrics_bucket: null,
          enabled: true,
        },
        "it should update cloud logs"
      );
    });
  });
  describe("schema", () => {
    it("should return helper text for name", () => {
      assert.deepEqual(
        craig.cloud_logs.name.helperText(
          {},
          {
            craig: craig,
          }
        ),
        "iac-cloud-logs",
        "it should return correct helper text"
      );
    });
    it("should return false when not enabled for resource group invalid", () => {
      assert.isFalse(
        craig.cloud_logs.resource_group.invalid({ enabled: false }),
        "it should be false"
      );
    });
    it("should return a list of cos bucksts", () => {
      assert.deepEqual(
        craig.cloud_logs.cos.groups({}, { craig: craig }),
        ["(Disabled)", "atracker-cos", "cos"],
        "it should return list of groups"
      );
    });
    it("should have correct groups for logs bucket", () => {
      assert.deepEqual(
        craig.cloud_logs.logs_bucket.groups({ cos: "cos" }, { craig: craig }),
        ["(Disabled)", "management-bucket", "workload-bucket"],
        "it should return list of buckets"
      );
      assert.deepEqual(
        craig.cloud_logs.logs_bucket.groups(
          { cos: "(Disabled)" },
          { craig: craig }
        ),
        ["(Disabled)"],
        "it should return list of buckets"
      );
    });

    it("should have correct groups for logs bucket", () => {
      assert.deepEqual(
        craig.cloud_logs.metrics_bucket.groups(
          { cos: "cos" },
          { craig: craig }
        ),
        ["(Disabled)", "management-bucket", "workload-bucket"],
        "it should return list of buckets"
      );
      assert.deepEqual(
        craig.cloud_logs.metrics_bucket.groups(
          { cos: "(Disabled)" },
          { craig: craig }
        ),
        ["(Disabled)"],
        "it should return list of buckets"
      );
    });
  });
});
