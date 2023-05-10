const { assert } = require("chai");
const {
  formatRoutingTable,
  formatRoutingTableRoute,
  routingTableTf,
} = require("../../client/src/lib");

describe("routing table", () => {
  describe("formatRoutingTable", () => {
    it("should format a routing table", () => {
      let actualData = formatRoutingTable(
        {
          vpc: "management",
          name: "routing-table",
          route_direct_link_ingress: true,
          route_transit_gateway_ingress: true,
          route_vpc_zone_ingress: true,
        },
        {
          _options: {
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_is_vpc_routing_table" "management_vpc_routing_table_table" {
  name                          = "\${var.prefix}-management-vpc-routing-table-table"
  vpc                           = ibm_is_vpc.management_vpc.id
  route_direct_link_ingress     = true
  route_transit_gateway_ingress = true
  route_vpc_zone_ingress        = true
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
  });
  describe("formatRoutingTableRoute", () => {
    it("should format routing table route", () => {
      let actualData = formatRoutingTableRoute(
        {
          vpc: "management",
          routing_table: "routing-table",
          name: "test-route",
          zone: 1,
          destination: "1.2.3.4/5",
          action: "delegate",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_is_vpc_routing_table_route" "management_vpc_routing_table_table_test_route_route" {
  vpc           = ibm_is_vpc.management_vpc.id
  routing_table = ibm_is_vpc_routing_table.management_vpc_routing_table_table.routing_table
  zone          = "\${var.region}-1"
  name          = "\${var.prefix}-management-routing-table-test-route-route"
  destination   = "1.2.3.4/5"
  action        = "delegate"
  next_hop      = "0.0.0.0"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
    it("should format routing table route with deliver and next hop", () => {
      let actualData = formatRoutingTableRoute(
        {
          vpc: "management",
          routing_table: "routing-table",
          name: "test-route",
          zone: 1,
          destination: "1.2.3.4/5",
          action: "deliver",
          next_hop: "5.6.7.8",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_is_vpc_routing_table_route" "management_vpc_routing_table_table_test_route_route" {
  vpc           = ibm_is_vpc.management_vpc.id
  routing_table = ibm_is_vpc_routing_table.management_vpc_routing_table_table.routing_table
  zone          = "\${var.region}-1"
  name          = "\${var.prefix}-management-routing-table-test-route-route"
  destination   = "1.2.3.4/5"
  action        = "deliver"
  next_hop      = "5.6.7.8"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
  });
  describe("routingTableTf", () => {
    it("should return correct routing table", () => {
      let actualData = routingTableTf({
        _options: {
          prefix: "iac",
          region: "us-south",
        },
        routing_tables: [
          {
            vpc: "management",
            name: "routing-table",
            route_direct_link_ingress: true,
            route_transit_gateway_ingress: true,
            route_vpc_zone_ingress: true,
            routes: [
              {
                vpc: "management",
                routing_table: "routing-table",
                name: "test-route",
                zone: 1,
                destination: "1.2.3.4/5",
                action: "delegate",
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Routing Table Routing Table
##############################################################################

resource "ibm_is_vpc_routing_table" "management_vpc_routing_table_table" {
  name                          = "\${var.prefix}-management-vpc-routing-table-table"
  vpc                           = ibm_is_vpc.management_vpc.id
  route_direct_link_ingress     = true
  route_transit_gateway_ingress = true
  route_vpc_zone_ingress        = true
}

resource "ibm_is_vpc_routing_table_route" "management_vpc_routing_table_table_test_route_route" {
  vpc           = ibm_is_vpc.management_vpc.id
  routing_table = ibm_is_vpc_routing_table.management_vpc_routing_table_table.routing_table
  zone          = "\${var.region}-1"
  name          = "\${var.prefix}-management-routing-table-test-route-route"
  destination   = "1.2.3.4/5"
  action        = "delegate"
  next_hop      = "0.0.0.0"
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
  });
});
