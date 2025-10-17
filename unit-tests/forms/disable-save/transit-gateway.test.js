const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("tgw", () => {
  it("should return true if tgw has invalid name", () => {
    assert.isTrue(
      disableSave(
        "transit_gateways",
        {
          name: "@@@",
          resource_group: "what",
          connections: [{ tgw: "@@@", vpc: "management" }],
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
        "it should return true",
      ),
    );
  });
  it("should return true if tgw with no rg", () => {
    assert.isTrue(
      disableSave(
        "transit_gateways",
        {
          name: "hi",
          resource_group: "",
          connections: [{ tgw: "hi", vpc: "management" }],
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return false if tgw enabled with direct crn connections", () => {
    assert.isFalse(
      disableSave(
        "transit_gateways",
        {
          name: "hi",
          resource_group: "what",
          connections: [
            {
              tgw: "hi",
              crn: "crn:v1:bluemix:public:is:us-east:a/cdefe6d99f7ea459aacb25775fb88a33::vpc:r014-b4d7e79b-32fc-4625-a7e5-46b71b61ed55",
            },
          ],
        },
        {
          craig: craig,

          data: {
            name: "frog",
          },
          parent_name: "frog",
        },
      ),
      "it should be false",
    );
  });
  describe("gre tunnels", () => {
    it("should return true if no gateway", () => {
      assert.isTrue(
        disableSave(
          "gre_tunnels",
          {
            gateway: "",
            remote_tunnel_ip: "",
            local_tunnel_ip: "",
            zone: "",
          },
          { craig: craig },
        ),
        "it should be disabled",
      );
    });
  });
});
