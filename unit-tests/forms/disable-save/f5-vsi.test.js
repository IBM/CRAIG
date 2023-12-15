const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("f5_vsi", () => {
  it("should return true if ssh keys empty", () => {
    assert.isTrue(
      disableSave("f5_vsi", { ssh_keys: [] }, { craig: state() }),
      "it should be disabled"
    );
  });
  it("should return true if no ssh keys", () => {
    assert.isTrue(
      disableSave("f5_vsi", {}, { craig: state() }),
      "it should be disabled"
    );
  });
});
