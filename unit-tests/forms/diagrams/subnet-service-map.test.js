const { assert } = require("chai");
const { shouldDisplayService } = require("../../../client/src/lib");

describe("subnet service map functions", () => {
  describe("shouldDisplayService", () => {
    it("should return true if the item vpc is null and no vpc is found", () => {
      assert.isTrue(
        shouldDisplayService({}, "vsi", { vpc: null }),
        "it should render vsi",
      );
    });
    it("should return true if the item has the matching vpc and contains the subnet", () => {
      assert.isTrue(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
            subnet: {
              name: "test-zone-1",
            },
          },
          "vsi",
          {
            vpc: "test",
            subnets: ["test-zone-1"],
          },
        ),
      );
    });
    it("should return true if the item has the matching vpc with no subnets & no subnet param", () => {
      assert.isTrue(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
          },
          "vsi",
          {
            vpc: "test",
            subnets: [],
          },
        ),
      );
    });
    it("should return true if a vpn gateway the matching vpc and matching subnet", () => {
      assert.isTrue(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
            subnet: {
              name: "test-zone-1",
            },
          },
          "vpn_gateways",
          {
            vpc: "test",
            subnet: "test-zone-1",
          },
        ),
      );
    });
    it("should return false if a vpn gateway the matching vpc but not matching subnet", () => {
      assert.isFalse(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
            subnet: {
              name: "test-zone-1",
            },
          },
          "vpn_gateways",
          {
            vpc: "test",
            subnet: "test-zone-2",
          },
        ),
      );
    });
    it("should return true if a vpn gateway the matching vpc and matching subnet", () => {
      assert.isTrue(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
          },
          "vpn_gateways",
          {
            vpc: "test",
            subnet: null,
          },
        ),
      );
    });
    it("should return true if a fortigate the matching vpc and matching primary subnet", () => {
      assert.isTrue(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
            subnet: {
              name: "test-zone-1",
            },
          },
          "fortigate_vnf",
          {
            vpc: "test",
            primary_subnet: "test-zone-1",
          },
        ),
      );
    });
    it("should return true if a fortigate the matching vpc and matching secondary subnet", () => {
      assert.isTrue(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
            subnet: {
              name: "test-zone-1",
            },
          },
          "fortigate_vnf",
          {
            vpc: "test",
            primary_subnet: null,
            secondary_subnet: "test-zone-1",
          },
        ),
      );
    });
    it("should return false if the item does not have the matching vpc but contains the subnet", () => {
      assert.isFalse(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
            subnet: {
              name: "test-zone-1",
            },
          },
          "vsi",
          {
            vpc: "test2",
            subnets: ["test-zone-1"],
          },
        ),
      );
    });
    it("should return false if the item is unfound", () => {
      assert.isFalse(
        shouldDisplayService(
          {
            vpc: {
              name: "test",
            },
          },
          "oops",
          {
            vpc: "hi",
          },
        ),
      );
    });
  });
});
