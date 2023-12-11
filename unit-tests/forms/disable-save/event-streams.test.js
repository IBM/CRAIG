const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("event streams", () => {
  it("should return true if event streams plan is not enterprise and form has invalid name", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
        {
          plan: "lite",
          name: "-bad-name",
          resource_group: "rg",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if event streams plan is not enterprise and form has invalid resource_group", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
        {
          plan: "lite",
          name: "foo-name",
          resource_group: null,
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid name", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
        {
          plan: "enterprise",
          name: "-bad-name",
          resource_group: "rg",
          endpoints: "private",
          throughput: "150",
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.1",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid resource_group", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
        {
          plan: "enterprise",
          name: "foo-name",
          resource_group: null,
          endpoints: "private",
          throughput: "150",
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.1",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid endpoints", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
        {
          plan: "enterprise",
          name: "foo-name",
          resource_group: "rg",
          endpoints: null,
          throughput: "150",
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.1",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid throughput", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
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
  it("should return true if event streams plan is enterprise and form has invalid storage_size", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
        {
          plan: "enterprise",
          name: "foo-name",
          resource_group: "rg",
          endpoints: "private",
          throughput: "150",
          storage_size: null,
          private_ip_allowlist: "1.1.1.1",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if event streams plan is enterprise and form has invalid private_ip_allowlist", () => {
    assert.isTrue(
      disableSave(
        "event_streams",
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
  });
  it("should return false if event streams plan is standard and name and rg are filled", () => {
    assert.isFalse(
      disableSave(
        "event_streams",
        {
          plan: "standard",
          name: "foo-name",
          resource_group: "rg",
        },
        {
          craig: craig,
        }
      )
    );
  });
});

describe("event_streams.schema", () => {
  describe("plan", () => {
    it("should return correct groups for plan", () => {
      assert.deepEqual(
        craig.event_streams.plan.groups,
        ["Lite", "Standard", "Enterprise"],
        "it should return plan types"
      );
    });
  });
  it("should return correct plan on render", () => {
    assert.deepEqual(
      craig.event_streams.plan.onRender({ plan: "Lite" }),
      "Lite",
      "it should set to title  case"
    );
  });
  it("should return correct plan on render when no type", () => {
    assert.deepEqual(
      craig.event_streams.plan.onRender({ plan: undefined }),
      "",
      "it should set to empty string"
    );
  });
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
  });
  describe("storage_size", () => {
    it("should be hidden when plan is not enterprise", () => {
      assert.isTrue(
        craig.event_streams.storage_size.hideWhen({ plan: "lite" }),
        "it should be hidden"
      );
    });
    it("should return correct groups for storage_size", () => {
      assert.deepEqual(
        craig.event_streams.storage_size.groups,
        ["2TB", "4TB", "6TB", "8TB", "10TB", "12TB"],
        "it should return storage_size types"
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
  });
});
