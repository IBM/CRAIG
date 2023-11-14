const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("classic vlans", () => (
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
          craig: {
            store: {
              json: {
                classic_vlans: [{}],
              },
            },
          },
        }
      ),
      "it should be disabled"
    );
  }),
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
        craig: {
          store: {
            json: {
              classic_vlans: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  }),
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
          craig: {
            store: {
              json: {
                classic_vlans: [{}],
              },
            },
          },
        }
      ),
      "it should be disabled"
    );
  })
));
