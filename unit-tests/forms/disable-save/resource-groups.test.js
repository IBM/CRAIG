const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("resource groups", () => {
  it("should return true if a resource group has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "resource_groups",
        { name: "@@@", use_data: false },
        {
          craig: state(),
          data: {
            name: "test",
          },
        },
      ),
      "it should be false",
    );
  });
});
