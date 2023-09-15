const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
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
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
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
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
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
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
});
