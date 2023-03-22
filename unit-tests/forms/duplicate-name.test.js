const { assert } = require("chai");
const { hasDuplicateName } = require("../../client/src/lib/forms");

describe("hasDuplicateName", () => {
  it("should return false when no props", () => {
    assert.isFalse(hasDuplicateName("bad field"), "it should be false");
  });
});
