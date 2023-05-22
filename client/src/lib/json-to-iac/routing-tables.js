const { varDotRegion } = require("../constants");
const { kebabName, vpcRef, jsonToTfPrint, tfRef, tfBlock } = require("./utils");

/**
 * create routing table object
 * @param {*} table
 * @param {string} table.vpc
 * @param {string} table.name
 * @param {boolean} table.route_direct_link_ingress
 * @param {boolean} table.route_transit_gateway_ingress
 * @param {boolean} table.route_vpc_zone_ingress
 * @param {*} config
 * @returns {object} terraform
 */
function ibmIsVpcRoutingTable(table, config) {
  return {
    name: `${table.vpc}-vpc-${table.name}-table`,
    data: {
      name: kebabName([table.vpc, "vpc", table.name, "table"]),
      vpc: vpcRef(table.vpc),
      route_direct_link_ingress: table.route_direct_link_ingress,
      route_transit_gateway_ingress: table.route_transit_gateway_ingress,
      route_vpc_zone_ingress: table.route_vpc_zone_ingress,
    },
  };
}

/**
 * create routing table string
 * @param {*} table
 * @param {string} table.vpc
 * @param {string} table.name
 * @param {boolean} table.route_direct_link_ingress
 * @param {boolean} table.route_transit_gateway_ingress
 * @param {boolean} table.route_vpc_zone_ingress
 * @param {*} config
 * @returns {string} terraform string
 */
function formatRoutingTable(table, config) {
  let data = ibmIsVpcRoutingTable(table, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_vpc_routing_table",
    data.name,
    data.data
  );
}

/**
 * create routing table route
 * @param {*} route
 * @param {string} route.vpc
 * @param {string} route.routing_table
 * @param {string} route.name
 * @param {number} route.zone
 * @param {string} route.destination
 * @param {string} route.action
 * @param {string=} route.next_hop
 * @param {*} config
 * @param {*} config._options
 * @param {string} config._options.
 * @returns {object} terraform
 */
function ibmIsVpcRoutingTableRoute(route, config) {
  return {
    name: `${route.vpc}-vpc-${route.routing_table}-table-${route.name}-route`,
    data: {
      vpc: vpcRef(route.vpc),
      routing_table: tfRef(
        "ibm_is_vpc_routing_table",
        `${route.vpc}-vpc-${route.routing_table}-table`,
        "routing_table"
      ),
      zone: `${varDotRegion}-${route.zone}`,
      name: kebabName([route.vpc, route.routing_table, route.name, "route"]),
      destination: route.destination,
      action: route.action,
      next_hop: route.action === "deliver" ? route.next_hop : "0.0.0.0",
    },
  };
}

/**
 * create routing table route
 * @param {*} route
 * @param {string} route.vpc
 * @param {string} route.routing_table
 * @param {string} route.name
 * @param {number} route.zone
 * @param {string} route.destination
 * @param {string} route.action
 * @param {string=} route.next_hop
 * @param {*} config
 * @param {*} config._options
 * @param {string} config._options.
 * @returns {string} terraform string
 */
function formatRoutingTableRoute(route, config) {
  let data = ibmIsVpcRoutingTableRoute(route, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_vpc_routing_table_route",
    data.name,
    data.data
  );
}

/**
 * format routing table tf file
 * @param {*} config
 * @returns {string} terraform string
 */
function routingTableTf(config) {
  let tf = "";
  if (config.routing_tables)
    config.routing_tables.forEach((table) => {
      let blockText = formatRoutingTable(table, config);
      table.routes.forEach((route) => {
        blockText += formatRoutingTableRoute(route, config);
      });
      tf += tfBlock(`${table.name} routing table`, blockText);
    });
  return tf;
}

module.exports = {
  formatRoutingTable,
  ibmIsVpcRoutingTable,
  ibmIsVpcRoutingTableRoute,
  formatRoutingTableRoute,
  routingTableTf,
};
