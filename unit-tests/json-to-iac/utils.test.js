const { assert } = require("chai");
const { rgIdRef, timeouts } = require("../../client/src/lib/json-to-iac/utils");

describe("rgIdRef", () => {
  it("should return error text if resource group is null", () => {
    assert.deepEqual(
      rgIdRef(null),
      "ERROR: Unfound Ref",
      "it should return correct text"
    );
  });
  describe("timeouts", () => {
    it("should return timeouts with no destroy", () => {
      assert.deepEqual(
        timeouts("1h", "1h", ""),
        [{ create: "1h", update: "1h" }],
        "it should return data"
      );
    });
  });
});
