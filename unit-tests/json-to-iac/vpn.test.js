const { assert } = require("chai");
const { formatVpn, vpnTf } = require("../../client/src/lib/json-to-iac/vpn");
const slzNetwork = require("../data-files/slz-network.json");

describe("vpn gateways", () => {
  describe("formatVpn", () => {
    it("should create tf code for vpn gateway", () => {
      let actualData = formatVpn(
        {
          name: "management",
          resource_group: "slz-management-rg",
          subnet: "vpn-zone-1",
          vpc: "management",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_gateway" "management_management_vpn_gw" {
  name           = "slz-management-management-vpn-gw"
  subnet         = ibm_is_subnet.management_vpn_zone_1.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  timeouts {
    delete = "1h"
  }
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vpnTf", () => {
    it("should create tf code for vpn gateway", () => {
      let actualData = vpnTf(
        slzNetwork
      );
      let expectedData = `##############################################################################
# VPN Gateways
##############################################################################

resource "ibm_is_vpn_gateway" "management_management_gateway_vpn_gw" {
  name           = "slz-management-management-gateway-vpn-gw"
  subnet         = ibm_is_subnet.management_vpn_zone_1.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  timeouts {
    delete = "1h"
  }
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
