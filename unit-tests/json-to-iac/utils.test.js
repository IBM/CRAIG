const { assert } = require("chai");
const slzNetwork = { ...require("../data-files/slz-network.json") };
const {
  rgIdRef,
  timeouts,
  calculateNeededSubnetIps,
  getNextCidr,
  buildTitleComment,
} = require("../../client/src/lib/json-to-iac/utils");
const { transpose } = require("lazy-z");

describe("rgIdRef", () => {
  it("should return error text if resource group is null", () => {
    assert.deepEqual(
      rgIdRef(null),
      "ERROR: Unfound Ref",
      "it should return correct text",
    );
  });
  describe("timeouts", () => {
    it("should return timeouts with no destroy", () => {
      assert.deepEqual(
        timeouts("1h", "1h", ""),
        [{ create: "1h", update: "1h" }],
        "it should return data",
      );
    });
  });
  describe("calculateNeededSubnetIps", () => {
    let nw = {};
    beforeEach(() => {
      nw = {};
      transpose(slzNetwork, nw);
    });
    it("should return the correct number rounded up for cluster with worker pools", () => {
      nw.vsi = [];
      nw.virtual_private_endpoints = [];
      nw.vpn_servers = [];
      nw.vpn_gateways = [];
      let actualData = calculateNeededSubnetIps(nw);
      let expectedData = {
        workload: {
          "vpe-zone-1": 5,
          "vpe-zone-2": 5,
          "vpe-zone-3": 5,
          "vsi-zone-1": 13,
          "vsi-zone-2": 13,
          "vsi-zone-3": 13,
        },
        management: {
          "vpe-zone-1": 5,
          "vpe-zone-2": 5,
          "vpe-zone-3": 5,
          "vpn-zone-1": 5,
          "vsi-zone-1": 5,
          "vsi-zone-2": 5,
          "vsi-zone-3": 5,
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a map of ips",
      );
    });
    it("should return the correct number rounded up for cluster with worker pools and vpe", () => {
      nw.vsi = [];
      nw.vpn_servers = [];
      nw.vpn_gateways = [];
      let actualData = calculateNeededSubnetIps(nw);
      let expectedData = {
        workload: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vsi-zone-1": 13,
          "vsi-zone-2": 13,
          "vsi-zone-3": 13,
        },
        management: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vpn-zone-1": 5,
          "vsi-zone-1": 5,
          "vsi-zone-2": 5,
          "vsi-zone-3": 5,
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a map of ips",
      );
    });
    it("should return the correct number rounded up for cluster with worker pools, vpe, and vpn gw", () => {
      nw.vsi = [];
      nw.vpn_servers = [];
      let actualData = calculateNeededSubnetIps(nw);
      let expectedData = {
        workload: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vsi-zone-1": 13,
          "vsi-zone-2": 13,
          "vsi-zone-3": 13,
        },
        management: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vpn-zone-1": 9,
          "vsi-zone-1": 5,
          "vsi-zone-2": 5,
          "vsi-zone-3": 5,
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a map of ips",
      );
    });
    it("should return the correct number rounded up for cluster with worker pools, vpe, vsi, and vpn gw", () => {
      nw.vpn_servers = [];
      let actualData = calculateNeededSubnetIps(nw);
      let expectedData = {
        workload: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vsi-zone-1": 13,
          "vsi-zone-2": 13,
          "vsi-zone-3": 13,
        },
        management: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vpn-zone-1": 9,
          "vsi-zone-1": 7,
          "vsi-zone-2": 7,
          "vsi-zone-3": 7,
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a map of ips",
      );
    });
    it("should return the correct number rounded up for cluster with worker pools, vpe, vsi, vpn servers, and vpn gw", () => {
      let actualData = calculateNeededSubnetIps(nw);
      let expectedData = {
        workload: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vsi-zone-1": 13,
          "vsi-zone-2": 13,
          "vsi-zone-3": 13,
        },
        management: {
          "vpe-zone-1": 6,
          "vpe-zone-2": 6,
          "vpe-zone-3": 6,
          "vpn-zone-1": 9,
          "vsi-zone-1": 8,
          "vsi-zone-2": 8,
          "vsi-zone-3": 8,
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a map of ips",
      );
    });
  });
  describe("getNextCidr", () => {
    it("should return the correct next cidr when adding 8 ips", () => {
      assert.deepEqual(
        getNextCidr("10.0.0.0/29", 8),
        "10.0.0.8/29",
        "it should retun next cidr",
      );
    });
    it("should return the correct next cidr when adding 8 more ips", () => {
      assert.deepEqual(
        getNextCidr("10.0.0.8/29", 8),
        "10.0.0.16/29",
        "it should retun next cidr",
      );
    });
    it("should return the correct next cidr when adding 16 ips", () => {
      assert.deepEqual(
        getNextCidr("10.0.0.0/29", 16),
        "10.0.0.16/28",
        "it should retun next cidr",
      );
    });
    it("should return the correct next cidr when adding 32 ips", () => {
      assert.deepEqual(
        getNextCidr("10.0.0.0/29", 32),
        "10.0.0.32/27",
        "it should retun next cidr",
      );
    });
    it("should return the correct next cidr when adding 8 ips", () => {
      assert.deepEqual(
        getNextCidr("10.0.0.0/27", 8),
        "10.0.0.32/29",
        "it should retun next cidr",
      );
    });
    it("should return the correct next cidr when adding 8 to 256", () => {
      assert.deepEqual(
        getNextCidr("10.0.0.0/24", 8),
        "10.0.1.0/29",
        "it should retun next cidr",
      );
    });
    it("should return the correct next cidr when adding 32 ips", () => {
      assert.deepEqual(
        getNextCidr("10.0.0.32/27", 8),
        "10.0.0.64/29",
        "it should retun next cidr",
      );
    });
  });
  describe("buildTitleComment", () => {
    it("should format title comment correctly when cannot uppercase name", () => {
      let actualData = buildTitleComment("   ---@@@");
      let expectedData = `##############################################################################
# ERROR: Unable to Format Name
##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return title comment",
      );
    });
  });
});
