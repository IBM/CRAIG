const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("classic vlans", () => {
  it("should disable save for vlan with an invalid name", () => {
    assert.isTrue(
      disableSave(
        "classic_vlans",
        {
          name: "@@@@",
        },
        {
          data: {
            name: "test",
          },
          craig: craig,
        },
      ),
      "it should be disabled",
    );
  });
  it("should disable save for vlan with a name with more than twenty characters including the prefix", () => {
    assert.isTrue(
      disableSave(
        "classic_vlans",
        {
          name: "sixteencharacters",
        },
        {
          data: {
            name: "test",
          },
          craig: craig,
        },
      ),
      "it should be disabled",
    );
  });
  it("should be disabled when valid name and no datacenter", () => {
    let actualData = disableSave(
      "classic_vlans",
      {
        name: "toad",
        datacenter: "",
      },
      {
        data: {
          name: "egg",
        },
        craig: craig,
      },
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should disable save for vlan with an type", () => {
    assert.isTrue(
      disableSave(
        "classic_vlans",
        {
          name: "frog",
          type: "",
        },
        {
          data: {
            name: "test",
          },
          craig: craig,
        },
      ),
      "it should be disabled",
    );
  });
});
