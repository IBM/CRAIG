const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("atracker", () => {
  it("should return false if atracker is not enabled", () => {
    assert.isFalse(
      disableSave("atracker", {
        enabled: false,
      }),
      "it should be false"
    );
  });
  it("should return true if atracker does not have bucket", () => {
    assert.isTrue(
      disableSave("atracker", {
        enabled: true,
        bucket: null,
      }),
      "it should be true"
    );
  });
  it("should return true if atracker does not have cos key", () => {
    assert.isTrue(
      disableSave("atracker", {
        enabled: true,
        bucket: "bucket",
        cos_key: null,
      }),
      "it should be true"
    );
  });
  it("should return true if atracker does not have any locations", () => {
    assert.isTrue(
      disableSave("atracker", {
        enabled: true,
        bucket: "bucket",
        cos_key: "key",
        locations: [],
      }),
      "it should be true"
    );
  });
});
