const { assert } = require("chai");
const {
  hasDuplicateName,
} = require("../../../client/src/lib/state/reusable-fields");
const { state } = require("../../../client/src/lib");

describe("reusable fields", () => {
  describe("duplicate name", () => {
    it("should not get a list if no id or parent name is provided for acl", () => {
      assert.isFalse(
        hasDuplicateName(
          "acls",
          {},
          {
            craig: new state(),
          },
          {},
        ),
        "it should return data",
      );
    });
    it("should not get a list if no id and parent name is provided for acl", () => {
      assert.isFalse(
        hasDuplicateName(
          "acls",
          {},
          {
            craig: new state(),
            id: "yes",
            parent_name: "hi",
          },
          {},
        ),
        "it should return data",
      );
    });
  });
});
