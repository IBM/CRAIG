const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("event streams", () => {
  it("should return true if event streams plan is not enterprise and form has invalid name", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "lite",
        name: "-bad-name",
        resource_group: "rg",
      })
    );
  });
  it("should return true if event streams plan is not enterprise and form has invalid resource_group", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "lite",
        name: "foo-name",
        resource_group: null,
      })
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid name", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "enterprise",
        name: "-bad-name",
        resource_group: "rg",
        endpoints: "private",
        throughput: "150",
        storage_size: "2048",
        private_ip_allowlist: "1.1.1.1",
      })
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid resource_group", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "enterprise",
        name: "foo-name",
        resource_group: null,
        endpoints: "private",
        throughput: "150",
        storage_size: "2048",
        private_ip_allowlist: "1.1.1.1",
      })
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid endpoints", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "enterprise",
        name: "foo-name",
        resource_group: "rg",
        endpoints: null,
        throughput: "150",
        storage_size: "2048",
        private_ip_allowlist: "1.1.1.1",
      })
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid throughput", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "enterprise",
        name: "foo-name",
        resource_group: "rg",
        endpoints: "private",
        throughput: null,
        storage_size: "2048",
        private_ip_allowlist: "1.1.1.1",
      })
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid storage_size", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "enterprise",
        name: "foo-name",
        resource_group: "rg",
        endpoints: "private",
        throughput: "150",
        storage_size: null,
        private_ip_allowlist: "1.1.1.1",
      })
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid private_ip_allowlist", () => {
    assert.isTrue(
      disableSave("event_streams", {
        plan: "enterprise",
        name: "foo-name",
        resource_group: "rg",
        endpoints: "private",
        throughput: "150",
        storage_size: "2048",
        private_ip_allowlist: "1.1.1.-sda,1.1.1.1",
      })
    );
  });
});
