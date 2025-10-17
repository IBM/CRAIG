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
          transit_gateway_ingress: true,
          route_vpc_zone_ingress: true,
        },
        {
          _options: {
            prefix: "iac",
          },
        },
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
        "it should return correct terraform",
      );
    });
    it("should format a routing table with vpc from data", () => {
      let actualData = formatRoutingTable(
        {
          vpc: "management",
          name: "routing-table",
          route_direct_link_ingress: true,
          transit_gateway_ingress: true,
          route_vpc_zone_ingress: true,
        },
        {
          _options: {
            prefix: "iac",
          },
          vpcs: [
            {
              name: "workload",
            },
            {
              name: "management",
              use_data: true,
            },
          ],
        },
      );
      let expectedData = `
resource "ibm_is_vpc_routing_table" "management_vpc_routing_table_table" {
  name                          = "\${var.prefix}-management-vpc-routing-table-table"
  vpc                           = data.ibm_is_vpc.management_vpc.id
  route_direct_link_ingress     = true
  route_transit_gateway_ingress = true
  route_vpc_zone_ingress        = true
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform",
      );
    });
    it("should format a routing table with advertised routes", () => {
      let actualData = formatRoutingTable(
        {
          vpc: "management",
          name: "routing-table",
          route_direct_link_ingress: true,
          transit_gateway_ingress: true,
          route_vpc_zone_ingress: true,
          advertise_routes_to: ["vpn_server"],
        },
        {
          _options: {
            prefix: "iac",
          },
        },
      );
      let expectedData = `
resource "ibm_is_vpc_routing_table" "management_vpc_routing_table_table" {
  name                          = "\${var.prefix}-management-vpc-routing-table-table"
  vpc                           = ibm_is_vpc.management_vpc.id
  route_direct_link_ingress     = true
  route_transit_gateway_ingress = true
  route_vpc_zone_ingress        = true
  advertise_routes_to = [
    "vpn_server"
  ]
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform",
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
        },
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
        "it should return correct terraform",
      );
    });
    it("should format routing table route with advertise and priority", () => {
      let actualData = formatRoutingTableRoute(
        {
          vpc: "management",
          routing_table: "routing-table",
          name: "test-route",
          zone: 1,
          destination: "1.2.3.4/5",
          action: "delegate",
          advertise: true,
          priority: "0",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        },
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
  advertise     = true
  priority      = "0"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform",
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
        },
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
        "it should return correct terraform",
      );
    });
  });
  describe("routingTableTf", () => {
    it("should return empty string when no routing tables", () => {
      let actualData = routingTableTf({});
      assert.deepEqual(actualData, "", "it should return correct data");
    });
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
            transit_gateway_ingress: true,
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
          {
            vpc: "management",
            name: "routing-table2",
            route_direct_link_ingress: true,
            transit_gateway_ingress: true,
            route_vpc_zone_ingress: true,
            routes: [
              {
                vpc: "management",
                routing_table: "routing-table",
                name: "test-route2",
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

##############################################################################
# Routing Table 2 Routing Table
##############################################################################

resource "ibm_is_vpc_routing_table" "management_vpc_routing_table2_table" {
  name                          = "\${var.prefix}-management-vpc-routing-table2-table"
  vpc                           = ibm_is_vpc.management_vpc.id
  route_direct_link_ingress     = true
  route_transit_gateway_ingress = true
  route_vpc_zone_ingress        = true
}

resource "ibm_is_vpc_routing_table_route" "management_vpc_routing_table_table_test_route2_route" {
  vpc           = ibm_is_vpc.management_vpc.id
  routing_table = ibm_is_vpc_routing_table.management_vpc_routing_table_table.routing_table
  zone          = "\${var.region}-1"
  name          = "\${var.prefix}-management-routing-table-test-route2-route"
  destination   = "1.2.3.4/5"
  action        = "delegate"
  next_hop      = "0.0.0.0"
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform",
      );
    });
  });
});
