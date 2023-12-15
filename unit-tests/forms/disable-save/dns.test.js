const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
/**
 * create a temporary state
 * @param {*} store
 * @returns {lazyZstate} craig state store
 */
function setTempCraig(store) {
  let tempCraig = state();
  tempCraig.store = store;
  return tempCraig;
}

describe("dns", () => {
  it("should be disabled when dns has invalid name", () => {
    let actualData = disableSave(
      "dns",
      { name: "???" },
      {
        data: { name: "" },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when dns has duplicate name", () => {
    let actualData = disableSave(
      "dns",
      { name: "hi" },
      {
        data: { name: "" },
        craig: setTempCraig({
          json: {
            dns: [
              {
                name: "hi",
              },
              {
                name: "toad",
              },
            ],
          },
        }),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when dns has no rg", () => {
    let actualData = disableSave(
      "dns",
      { name: "hi", resource_group: null },
      {
        data: { name: "hi" },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  describe("dns zone subForm", () => {
    it("should be disabled when invalid zone name", () => {
      let actualData = disableSave(
        "zones",
        { name: "???" },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when duplicate zone name", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", vpcs: [] },
        {
          data: { name: "" },
          craig: state(),
          isModal: true,
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no vpc selected for zone", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", vpcs: null },
        {
          data: { name: "hi" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no vpc for zone", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", vpcs: [] },
        {
          data: { name: "hi" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid description for zone", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", description: "@", vpcs: ["management"] },
        {
          data: { name: "hi" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
  });
  describe("dns record subForm", () => {
    it("should be disabled when invalid record name", () => {
      let actualData = disableSave(
        "records",
        { name: "???" },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when record duplicate name", () => {
      let actualData = disableSave(
        "records",
        { name: "hi" },
        {
          data: { name: "" },
          craig: setTempCraig({
            json: {
              dns: [
                {
                  records: [{ name: "hi" }],
                },
              ],
            },
          }),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no dns zone selected for record", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", dns_zone: "", type: "hey" },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no dns type for record", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", type: "", dns_zone: "hi" },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid mx record", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", type: "MX", rdata: "hi", preference: null },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should not be disabled if type is MX and preference is valid", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", dns_zone: "hi", type: "MX", rdata: "hi", preference: 2 },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isFalse(actualData, "it should not be disabled");
    });
    it("should be disabled when srv record service empty string", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: 2,
          protocol: "TCP",
          priority: 1,
          service: "",
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when srv record service null", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: 2,
          protocol: "TCP",
          priority: 1,
          service: null,
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when srv record service undefined", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: 2,
          protocol: "TCP",
          priority: 1,
          service: undefined,
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when srv record port is empty string", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: "",
          protocol: "TCP",
          priority: 1,
          service: undefined,
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid srv record port", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: -2,
          protocol: "TCP",
          priority: 1,
          service: undefined,
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid record service value for type SRV", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: 2,
          protocol: "TCP",
          priority: 1,
          service: "hi",
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid record priority value for type SRV", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: 2,
          protocol: "TCP",
          priority: "",
          service: "_hi",
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid record weight value for type SRV", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: 2,
          protocol: "TCP",
          priority: 1,
          service: "_hi",
          weight: "",
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should not be disabled when valid record values for type that is not MX or SRV", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", type: "A", rdata: "hi" },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isFalse(actualData, "it should not be disabled");
    });
    it("should not be disabled when valid record values for type SRV", () => {
      let actualData = disableSave(
        "records",
        {
          name: "hi",
          type: "SRV",
          rdata: "hi",
          port: 2,
          protocol: "TCP",
          priority: 1,
          service: "_hi",
          weight: 2,
        },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isFalse(actualData, "it should not be disabled");
    });
  });
  describe("dns custom_resolver subForm", () => {
    it("should be disabled when invalid custom_resolver name", () => {
      let actualData = disableSave(
        "custom_resolvers",
        { name: "???" },
        {
          data: { name: "" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when custom resolver duplicate name", () => {
      let actualData = disableSave(
        "custom_resolvers",
        { name: "hi" },
        {
          data: { name: "" },
          craig: setTempCraig({
            json: {
              dns: [
                {
                  custom_resolvers: [{ name: "hi" }],
                },
              ],
            },
          }),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when custom resolver no vpc", () => {
      let actualData = disableSave(
        "custom_resolvers",
        { name: "hi", vpc: "" },
        {
          data: { name: "hi" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when custom resolver no subnets", () => {
      let actualData = disableSave(
        "custom_resolvers",
        { name: "hi", subnets: [] },
        {
          data: { name: "hi" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when custom resolver invalid description", () => {
      let actualData = disableSave(
        "custom_resolvers",
        { name: "hi", description: "@", subnets: ["hi"] },
        {
          data: { name: "hi" },
          craig: state(),
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
  });
});
