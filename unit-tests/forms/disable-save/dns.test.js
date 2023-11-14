const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("dns", () => {
  it("should be disabled when dns has invalid name", () => {
    let actualData = disableSave(
      "dns",
      { name: "???" },
      {
        data: { name: "" },
        craig: {
          store: {
            json: {
              dns: [],
            },
          },
        },
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
        craig: {
          store: {
            json: {
              dns: [{ name: "hi" }],
            },
          },
        },
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
        craig: {
          store: {
            json: {
              dns: [{ name: "" }],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  describe("dns subForms", () => {
    it("should be disabled when invalid name", () => {
      let actualData = disableSave(
        "zones",
        { name: "???" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", zones: [{ name: "" }] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when duplicate name", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", vpcs: [] },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", zones: [{ name: "hi" }] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no vpc", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", vpcs: null },
        {
          data: { name: "hi" },
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", zones: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no vpc", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", vpcs: [] },
        {
          data: { name: "hi" },
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", zones: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid description", () => {
      let actualData = disableSave(
        "zones",
        { name: "hi", description: "@", vpcs: ["management"] },
        {
          data: { name: "hi" },
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", zones: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid record name", () => {
      let actualData = disableSave(
        "records",
        { name: "???" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ records: [] }],
              },
            },
          },
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
          craig: {
            store: {
              json: {
                dns: [{ records: [{ name: "hi" }] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no dns zone", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", dns_zone: "", type: "hey" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ records: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when no dns type", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", type: "", dns_zone: "hi" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ records: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid mx record", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", type: "MX", rdata: "hi", preference: "invalid" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ records: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid srv record", () => {
      let actualData = disableSave(
        "records",
        { name: "hi", type: "SRV", rdata: "hi" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ records: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid custom_resolver name", () => {
      let actualData = disableSave(
        "custom_resolvers",
        { name: "???" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ custom_resolvers: [] }],
              },
            },
          },
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
          craig: {
            store: {
              json: {
                dns: [{ custom_resolvers: [{ name: "hi" }] }],
              },
            },
          },
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
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", custom_resolvers: [] }],
              },
            },
          },
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
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", custom_resolvers: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid description", () => {
      let actualData = disableSave(
        "custom_resolvers",
        { name: "hi", description: "@", subnets: ["hi"] },
        {
          data: { name: "hi" },
          craig: {
            store: {
              json: {
                dns: [{ name: "hi", custom_resolvers: [] }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
  });
});
