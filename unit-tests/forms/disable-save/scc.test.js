const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("scc", () => {
  it("should return true if scc collector description invalid", () => {
    assert.isTrue(
      disableSave(
        "scc",
        {
          collector_description: "",
        },
        {
          craig: state(),
        }
      ),
      "it should be true"
    );
  });
  it("should return true if scc scope description invalid", () => {
    assert.isTrue(
      disableSave(
        "scc",
        {
          collector_description: "words",
          scope_description: "",
        },
        {
          craig: state(),
        }
      ),
      "it should be true"
    );
  });
});
