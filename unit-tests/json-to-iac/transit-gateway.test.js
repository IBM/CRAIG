const { assert } = require("chai");
const {
  formatTgw,
  formatTgwConnection,
  tgwTf,
} = require("../../client/src/lib/json-to-iac/transit-gateway");
const slzNetwork = require("../data-files/slz-network.json");

describe("transit gateway", () => {
  describe("formatTgw", () => {
    it("should return correctly formatted transit gateway", () => {
      let actualData = formatTgw(
        {
          name: "transit-gateway",
          resource_group: "slz-service-rg",
          global: false,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_tg_gateway" "transit_gateway" {
  name           = "slz-transit-gateway"
  location       = "us-south"
  global         = false
  resource_group = ibm_resource_group.slz_service_rg.id
  timeouts {
    create = "30m"
    delete = "30m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return dorrect data"
      );
    });
  });
  describe("formatTgwConnection", () => {
    it("should return correctly formatted transit gateway", () => {
      let actualData = formatTgwConnection(
        {
          name: "transit-gateway",
          resource_group: "slz-service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "management",
            },
          ],
        }.connections[0],
        slzNetwork
      );
      let expectedData = `
resource "ibm_tg_connection" "transit_gateway_to_management_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "slz-transit-gateway-management-hub-connection"
  network_id   = ibm_is_vpc.management_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return dorrect data"
      );
    });
  });
  describe("tgwTf", () => {
    it("should return correctly formatted transit gateway", () => {
      let actualData = tgwTf(slzNetwork);
      let expectedData = `##############################################################################
# Transit Gateway Transit Gateway
##############################################################################

resource "ibm_tg_gateway" "transit_gateway" {
  name           = "slz-transit-gateway"
  location       = "us-south"
  global         = false
  resource_group = ibm_resource_group.slz_service_rg.id
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

resource "ibm_tg_connection" "transit_gateway_to_management_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "slz-transit-gateway-management-hub-connection"
  network_id   = ibm_is_vpc.management_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

resource "ibm_tg_connection" "transit_gateway_to_workload_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "slz-transit-gateway-workload-hub-connection"
  network_id   = ibm_is_vpc.workload_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return dorrect data"
      );
    });
  });
});
