const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("f5_vsi", () => {
  it("should return true if ssh keys empty", () => {
    assert.isTrue(disableSave("f5_vsi", { ssh_keys: [] }));
  });
  it("should return true if no ssh keys", () => {
    assert.isTrue(disableSave("f5_vsi", {}));
  });
});
