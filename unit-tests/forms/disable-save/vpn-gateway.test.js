const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("vpn gateway", () => {
  it("should return true if vpn gateway with invalid name", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "@@@",
          resource_group: "what",
          subnet: "hi",
          vpc: "hi",
        },
        {
          craig: state(),
          data: {
            name: "@@@",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if vpn gateway with no subnet", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "hi",
          resource_group: "what",
          subnet: "",
          vpc: "hi",
        },
        {
          craig: state(),
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if vpn gateway with no vpc", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "hi",
          resource_group: "what",
          subnet: "hi",
          vpc: "",
        },
        {
          craig: state(),
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if vpn gateway with no rg", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "hi",
          resource_group: "",
          subnet: "hi",
          vpc: "hi",
        },
        {
          craig: state(),
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
});
