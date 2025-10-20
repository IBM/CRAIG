const { assert } = require("chai");
const { state } = require("../../client/src/lib");
const {
  getSubnetData,
} = require("../../client/src/lib/forms/dynamic-subnet-tile-sub-form");

describe("Dynamic Subnet Tile Form", () => {
  let craig;
  beforeEach(() => {
    craig = state();
    craig.setUpdateCallback(() => {});
  });
  describe("getSubnetData", () => {
    it("should return correct subnets when modal and not advanced", () => {
      let actualData = getSubnetData({
        isModal: true,
        parentProps: {
          craig: craig,
          data: {
            name: "vsi",
          },
          vpc_name: "management",
        },
        parentState: {
          zones: "3",
          name: "vsi",
        },
      });
      let expectedData = [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.20.0/24",
          name: "vsi-zone-1",
          network_acl: "undefined",
          resource_group: undefined,
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.20.0/24",
          name: "vsi-zone-2",
          network_acl: "undefined",
          resource_group: undefined,
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.20.0/24",
          name: "vsi-zone-3",
          network_acl: "undefined",
          resource_group: undefined,
          public_gateway: false,
          has_prefix: true,
        },
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return subnet data",
      );
    });
    it("should return correct subnets when modal and advanced", () => {
      let actualData = getSubnetData({
        isModal: true,
        parentProps: {
          craig: craig,
          data: {
            name: "vsi",
          },
          vpc_name: "management",
        },
        parentState: {
          zones: ["3"],
          name: "vsi",
        },
      });
      let expectedData = [
        {
          name: "NONE",
        },
        {
          name: "NONE",
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.20.0/24",
          name: "vsi-zone-3",
          network_acl: "undefined",
          resource_group: undefined,
          public_gateway: false,
          has_prefix: true,
        },
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return subnet data",
      );
    });
    it("should return correct subnets when not advanced", () => {
      let actualData = getSubnetData({
        parentProps: {
          craig: craig,
          data: {
            name: "vsi",
          },
          vpc_name: "management",
        },
        parentState: {
          zones: "3",
          name: "vsi",
        },
      });
      let expectedData = [
        {
          acl_name: "management",
          vpc: "management",
          zone: 1,
          cidr: "10.1.0.0/29",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          acl_name: "management",
          vpc: "management",
          zone: 2,
          cidr: "10.1.0.32/29",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          acl_name: "management",
          vpc: "management",
          zone: 3,
          cidr: "10.1.0.40/29",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return subnet data",
      );
    });
    it("should return correct subnets when advanced", () => {
      let actualData = getSubnetData({
        parentProps: {
          craig: craig,
          data: {
            name: "vsi",
          },
          vpc_name: "management",
        },
        parentState: {
          zones: "3",
          name: "vsi",
          advanced: true,
        },
      });
      let expectedData = [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.1.0.0/29",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.1.0.32/29",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.1.0.40/29",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return subnet data",
      );
    });
  });
});
