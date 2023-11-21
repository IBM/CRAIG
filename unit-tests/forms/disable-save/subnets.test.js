const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("subnets", () => {
  describe("subnets", () => {
    it("should return true if subnet has invalid network acl", () => {
      assert.isTrue(
        disableSave("subnet", { network_acl: null }, {}, state()),
        "it should be true"
      );
    });
    it("should return true if advanced subnet has invalid cidr", () => {
      assert.isTrue(
        disableSave("subnet", { tier: "frog", cidr: "aaaa" }, {}, state()),
        "it should be true"
      );
    });
    it("should return true if advanced subnet has invalid cidr block (overlapping ok)", () => {
      assert.isTrue(
        disableSave("subnet", { tier: "frog", cidr: "1.2.3.4/5" }, {}, state()),
        "it should be true"
      );
    });
    it("should return true if advanced subnet has invalid name", () => {
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "frog", cidr: "1.2.3.4/15", name: "@@@@" },
          {
            data: {
              name: "",
            },
            vpc_name: "management",
          },
          state()
        ),
        "it should be true"
      );
    });
    it("should return true if advanced subnet has invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store = {
        json: {
          vpcs: [
            {
              name: "test",
              subnets: [
                {
                  name: "egg",
                },
              ],
            },
          ],
        },
      };
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "frog", cidr: "1.2.3.4/15", name: "egg" },
          {
            data: {
              name: "frog",
            },
            vpc_name: "test",
          },
          tempCraig
        ),
        "it should be true"
      );
    });
    it("should return true if advanced subnet has null cidr", () => {
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "fro222g", cidr: null, name: "egg" },
          {
            data: {
              name: "frog",
            },
            vpc_name: "test",
          },
          state()
        ),
        "it should be true"
      );
    });
    it("should return true if advanced subnet has invalid network acl", () => {
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "frog", cidr: "1.2.3.4/15", name: "toad", network_acl: "" },
          {
            data: {
              name: "frog",
            },
            vpc_name: "test",
          },
          state()
        ),
        "it should be true"
      );
    });
  });
  describe("subnetTiers", () => {
    it("should return true if subnet tier has invalid name", () => {
      let tempCraig = state();
      tempCraig.store = {
        subnetTiers: {
          test: [
            {
              name: "frog",
            },
          ],
        },
      };
      assert.isTrue(
        disableSave(
          "subnetTier",
          { name: "@@frog" },
          {
            vpc_name: "test",
            data: {
              name: "todd",
            },
            craig: tempCraig,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false if subnet tier has same name as props", () => {
      let tempCraig = state();
      tempCraig.store = {
        subnetTiers: {
          test: [
            {
              name: "frog",
            },
          ],
        },
      };

      assert.isFalse(
        disableSave(
          "subnetTier",
          { name: "frog", advanced: false },
          {
            vpc_name: "test",
            data: {
              name: "frog",
            },
            craig: tempCraig,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true if advanced subnet tier has no zones", () => {
      let tempCraig = state();
      tempCraig.store = {
        subnetTiers: {
          test: [
            {
              name: "frog",
            },
          ],
        },
      };

      assert.isTrue(
        disableSave(
          "subnetTier",
          {
            name: "todd",
            advanced: true,
            network_acl: "frog",
            select_zones: [],
          },
          {
            vpc_name: "test",
            data: {
              name: "todd",
            },
            craig: tempCraig,
          }
        ),
        "it should be disabled"
      );
    });
  });
});
