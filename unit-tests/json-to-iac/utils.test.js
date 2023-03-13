const { assert } = require("chai");
const { rgIdRef } = require("../../client/src/lib/json-to-iac/utils");

describe("rgIdRef", () => {
  it("should return error text if resource group is null", () => {
    assert.deepEqual(
      rgIdRef(null),
      "ERROR: Unfound Ref",
      "it should return correct text"
    );
  });
});
