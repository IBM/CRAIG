const { assert } = require("chai");
const { propsMatchState } = require("../../client/src/lib/forms");

describe("propsMatchState", () => {
  it("should return true if stateData and componentProps.data are the same", () => {
    assert.isTrue(
      propsMatchState(
        "resource_groups",
        { name: "test" },
        { data: { name: "test" } }
      ),
      "it should be true"
    );
  });
});
