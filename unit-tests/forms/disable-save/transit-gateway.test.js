const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
          craig: {
            store: {
              resourceGroups: ["what"],
              vpcs: ["management"],
              json: {
                transit_gateways: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        },
        "it should return true"
      )
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
          craig: {
            store: {
              resourceGroups: ["what"],
              vpcs: ["management"],
              json: {
                transit_gateways: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if tgw enabled with no vpcs", () => {
    assert.isTrue(
      disableSave(
        "transit_gateways",
        {
          name: "hi",
          resource_group: "what",
          connections: [],
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                transit_gateways: [],
              },
            },
          },
          data: {
            name: "frog",
          },
          parent_name: "frog",
        }
      ),
      "it should be true"
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
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                transit_gateways: [],
              },
            },
          },
          data: {
            name: "frog",
          },
          parent_name: "frog",
        }
      ),
      "it should be false"
    );
  });
});
