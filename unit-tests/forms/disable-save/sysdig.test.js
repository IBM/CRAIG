const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("sysdig", () => {
  it("should be disabled when invalid resource group", () => {
    let actualData = disableSave("sysdig", {
      resource_group: "",
      plan: "tier-2",
    });
    assert.isTrue(actualData, "it should be disabled");
  });
});
