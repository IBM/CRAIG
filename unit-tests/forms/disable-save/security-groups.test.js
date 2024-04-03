const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("security groups", () => {
  describe("rules", () => {
    it("should return true if security group rule has invalid name", () => {
      assert.isTrue(
        disableSave(
          "sg_rules",
          {
            name: "@@@",
          },
          { rules: [], data: { name: "" }, craig: state() }
        )
      );
    });
  });
});
