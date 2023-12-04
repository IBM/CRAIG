const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("options", () => {
  it("should return true for invalid prefix", () => {
    assert.isTrue(
      disableSave(
        "options",
        {
          prefix: "",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 3,
          endpoints: "private",
          account_id: "",
          fs_cloud: false,
          dynamic_subnets: true,
          enable_classic: false,
          enable_power_vs: false,
          power_vs_zones: [],
          craig_version: "1.7.1",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  }),
    it("should return true if power vs enabled and no zones", () => {
      assert.isTrue(
        disableSave(
          "options",
          {
            prefix: "iac",
            region: "us-south",
            tags: ["hello", "world"],
            zones: 3,
            endpoints: "private",
            account_id: "",
            fs_cloud: false,
            dynamic_subnets: true,
            enable_classic: false,
            enable_power_vs: true,
            power_vs_zones: [],
            craig_version: "1.7.1",
          },
          {
            craig: craig,
            data: {
              name: "frog",
            },
          }
        ),
        "it should be true"
      );
    });
});
