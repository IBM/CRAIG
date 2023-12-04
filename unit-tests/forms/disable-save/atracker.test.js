const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("atracker", () => {
  it("should return false if atracker is not enabled", () => {
    assert.isFalse(
      disableSave(
        "atracker",
        {
          enabled: false,
        },
        {
          craig: craig,
        }
      ),
      "it should be false"
    );
  });
  it("should return true if atracker does not have bucket", () => {
    assert.isTrue(
      disableSave(
        "atracker",
        {
          enabled: true,
          bucket: null,
        },
        {
          craig: craig,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if atracker does not have cos key", () => {
    assert.isTrue(
      disableSave(
        "atracker",
        {
          enabled: true,
          bucket: "bucket",
          cos_key: null,
        },
        {
          craig: craig,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if atracker does not have any locations", () => {
    assert.isTrue(
      disableSave(
        "atracker",
        {
          enabled: true,
          bucket: "bucket",
          cos_key: "key",
          locations: [],
        },
        {
          craig: craig,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if instance is enabled and no resource group is selected", () => {
    assert.isTrue(
      disableSave(
        "atracker",
        {
          enabled: true,
          instance: true,
          bucket: "bucket",
          cos_key: "key",
          locations: ["dal10"],
          resource_group: "",
          plan: "lite",
        },
        {
          craig: craig,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if instance is enabled and no plan is selected", () => {
    assert.isTrue(
      disableSave(
        "atracker",
        {
          enabled: true,
          instance: true,
          bucket: "bucket",
          cos_key: "key",
          locations: ["dal10"],
          resource_group: "default",
          plan: "",
        },
        {
          craig: craig,
        }
      ),
      "it should be true"
    );
  });
  describe("invalidText", () => {
    it("should return invalid text for resource group", () => {
      assert.deepEqual(
        craig.atracker.resource_group.invalidText(),
        "Select a Resource Group",
        "it should return text"
      );
    });
    it("should return invalid text for bucket", () => {
      assert.deepEqual(
        craig.atracker.bucket.invalidText(),
        "Select an Object Storage bucket.",
        "it should return text"
      );
    });
    it("should return invalid text for cos_key", () => {
      assert.deepEqual(
        craig.atracker.cos_key.invalidText(),
        "Select an Object Storage key.",
        "it should return text"
      );
    });
    it("should return invalid text for locations", () => {
      assert.deepEqual(
        craig.atracker.locations.invalidText(),
        "Select at least one location.",
        "it should return text"
      );
    });
    it("should return invalid text for plan", () => {
      assert.deepEqual(
        craig.atracker.plan.invalidText(),
        "Select a plan.",
        "it should return text"
      );
    });
  });
});
