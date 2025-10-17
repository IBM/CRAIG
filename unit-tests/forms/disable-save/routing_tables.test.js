const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

function setTempCraig(store) {
  let tempCraig = state();
  tempCraig.store = store;
  return tempCraig;
}

describe("routing_tables", () => {
  let example_routing_table = {
    name: "aaa",
    vpc: "capybara",
    service: "debug",
    resource_group: "what",
    security_groups: ["security", "group"],
    subnets: ["sub", "net"],
    routes: [
      {
        name: "aaa",
        zone: "1",
        destination: "1.2.3.4",
        next_hop: "1.2.3.4",
      },
    ],
  };
  it("should return true if a routing table has an invalid name", () => {
    let routing_table = Object.assign({}, example_routing_table);
    routing_table.name = "aaa-";
    assert.isTrue(
      disableSave("routing_tables", routing_table, {
        craig: setTempCraig({
          json: {
            vpcs: [],
            routing_tables: [
              {
                name: "frog",
              },
              {
                name: "toad",
              },
            ],
          },
        }),
        data: {
          name: "frog",
        },
      }),
      "it should be true",
    );
  });
  it("should return true if a routing table has an invalid vpc", () => {
    let routing_table = Object.assign({}, example_routing_table);
    routing_table.name = "aaa";
    routing_table.vpc = "";
    assert.isTrue(
      disableSave("routing_tables", routing_table, {
        craig: setTempCraig({
          json: {
            vpcs: [],
            routing_tables: [
              {
                name: "frog",
              },
              {
                name: "toad",
              },
            ],
          },
        }),
        data: {
          name: "frog",
        },
      }),
      "it should be true",
    );
  });
  it("should return true if a routing table route has an invalid name", () => {
    let route = Object.assign({}, example_routing_table.routes[0]);
    route.name = "aaa-";
    assert.isTrue(
      disableSave("routes", route, {
        craig: setTempCraig({
          json: {
            vpcs: [],
            routing_tables: [
              {
                name: "frog",
                routes: [],
              },
              {
                name: "toad",
                routes: [],
              },
            ],
          },
        }),
        data: {
          name: "frog",
        },
        route: {
          routes: [],
        },
      }),
      "it should be true",
    );
  });
  it("should return true if a routing table route has an invalid zone", () => {
    let route = Object.assign({}, example_routing_table.routes[0]);
    route.name = "aaa";
    route.zone = "";
    assert.isTrue(
      disableSave("routes", route, {
        craig: setTempCraig({
          json: {
            vpcs: [],
            routing_tables: [
              {
                name: "frog",
                routes: [],
              },
              {
                name: "toad",
                routes: [],
              },
            ],
          },
        }),
        data: {
          name: "frog",
        },
        route: {
          routes: [],
        },
      }),
      "it should be true",
    );
  });
  it("should return true if a routing table route has an invalid destination", () => {
    let route = Object.assign({}, example_routing_table.routes[0]);
    route.name = "aaa";
    route.zone = "1";
    route.destination = "aaaa";
    assert.isTrue(
      disableSave("routes", route, {
        craig: setTempCraig({
          json: {
            vpcs: [],
            routing_tables: [
              {
                name: "frog",
                routes: [],
              },
              {
                name: "toad",
                routes: [],
              },
            ],
          },
        }),
        data: {
          name: "frog",
        },
        route: {
          routes: [],
        },
      }),
      "it should be true",
    );
  });
  it("should return true if a routing table route has an invalid next hop", () => {
    let route = Object.assign({}, example_routing_table.routes[0]);
    route.name = "aaa";
    route.zone = "1";
    route.destination = "1.2.3.4";
    route.next_hop = "aaaa";
    route.action = "deliver";
    assert.isTrue(
      disableSave("routes", route, {
        craig: setTempCraig({
          json: {
            vpcs: [],
            routing_tables: [
              {
                name: "frog",
                routes: [],
              },
              {
                name: "toad",
                routes: [],
              },
            ],
          },
        }),
        data: {
          name: "frog",
        },
        route: {
          routes: [],
        },
      }),
      "it should be true",
    );
  });
  it("should return true if a routing table route has an invalid next hop as cidr block", () => {
    let route = Object.assign({}, example_routing_table.routes[0]);
    route.name = "aaa";
    route.zone = "1";
    route.destination = "1.2.3.4";
    route.next_hop = "1.2.3.4/5";
    route.action = "deliver";
    assert.isTrue(
      disableSave("routes", route, {
        craig: setTempCraig({
          json: {
            vpcs: [],
            routing_tables: [
              {
                name: "frog",
                routes: [],
              },
              {
                name: "toad",
                routes: [],
              },
            ],
          },
        }),
        data: {
          name: "frog",
        },
        route: {
          routes: [],
        },
      }),
      "it should be true",
    );
  });
});
