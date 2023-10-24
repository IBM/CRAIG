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
  name           = "\${var.prefix}-management-management-vpn-gw"
  subnet         = module.management_vpc.vpn_zone_1_id
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
      let nw = { ...slzNetwork };
      nw.vpn_gateways[0].additional_prefixes = ["127.0.0.1/5"];
      let actualData = vpnTf(nw);
      let expectedData = `##############################################################################
# VPN Gateways
##############################################################################

resource "ibm_is_vpn_gateway" "management_management_gateway_vpn_gw" {
  name           = "\${var.prefix}-management-management-gateway-vpn-gw"
  subnet         = module.management_vpc.vpn_zone_1_id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  timeouts {
    delete = "1h"
  }
}

resource "ibm_is_vpc_address_prefix" "management_management_gateway_on_prem_127_0_0_1_5_prefix" {
  name = "\${var.prefix}-management-management-gateway-on-prem-127-0-0-1-5"
  vpc  = module.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "127.0.0.1/5"
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
