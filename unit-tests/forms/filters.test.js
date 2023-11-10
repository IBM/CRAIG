const { state } = require("../../client/src/lib");
const { tgwVpcFilter } = require("../../client/src/lib/forms/filters");
const { assert } = require("chai");
const craig = state();
describe("filters", () => {
  describe("tgwVpcFilter", () => {
    it("should return list of vpcs not connected via transit gateway", () => {
      let actualData = tgwVpcFilter(craig);
      assert.deepEqual(actualData, [], "it should return empty array");
    });
    it("should return list of vpcs not connected via transit gateway", () => {
      craig.setUpdateCallback(() => {});
      craig.vpcs.create(
        {
          name: "hi",
        },
        {}
      );
      craig.store.json.transit_gateways[0].connections.push({
        crn: "crn",
      });
      let actualData = tgwVpcFilter(craig);
      assert.deepEqual(actualData, ["hi"], "it should return unconnected vpcs");
    });
  });
});
