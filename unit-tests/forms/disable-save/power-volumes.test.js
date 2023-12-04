const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("power vs volumes", () => {
  it("should disable save for volume with an invalid name", () => {
    assert.isTrue(
      disableSave(
        "power_volumes",
        {
          name: "@@@@",
        },
        {
          data: {
            name: "test",
          },
          craig: state(),
        }
      ),
      "it should be disabled"
    );
  });
  it("should be disabled when valid name and no workspace", () => {
    let actualData = disableSave(
      "power_volumes",
      {
        name: "toad",
        workspace: "",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should disable save for volume with an invalid capacity", () => {
    assert.isTrue(
      disableSave(
        "power_volumes",
        {
          name: "frog",
          pi_volume_size: 0,
        },
        {
          data: {
            name: "test",
          },
          craig: state(),
        }
      ),
      "it should be disabled"
    );
  });
  it("should disable save for volume with an invalid capacity", () => {
    assert.isTrue(
      disableSave(
        "power_volumes",
        {
          name: "frog",
          pi_volume_size: "",
        },
        {
          data: {
            name: "test",
          },
          craig: state(),
        }
      ),
      "it should be disabled"
    );
  });
});
