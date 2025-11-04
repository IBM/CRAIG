const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("routing_tables", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("routing_tables.init", () => {
    it("should initialize routing_tables as a list", () => {
      assert.deepEqual(
        craig.store.json.routing_tables,
        [],
        "it should have routing_tables initialized as a list",
      );
    });
  });
  describe("routing_tables.onStoreUpdate", () => {
    it("should set unfound vpc to null", () => {
      craig.store.json.routing_tables.push({
        name: "test",
        vpc: "bad",
        routes: [
          {
            name: "frog",
            vpc: "bad",
          },
        ],
      });
      craig.update();
      assert.deepEqual(
        craig.store.json.routing_tables[0].vpc,
        null,
        "it should return correct data",
      );
      assert.deepEqual(
        craig.store.json.routing_tables[0].routes[0].vpc,
        null,
        "it should return correct data",
      );
    });
  });
  describe("routing_tables.save", () => {
    it("should change the properties of the routing table instance", () => {
      craig.routing_tables.create({
        name: "kms",
        vpc: "management",
      });
      craig.routing_tables.save(
        {
          name: "todd",
          vpc: "management",
        },
        { data: { name: "kms" } },
      );
      assert.deepEqual(
        craig.store.json.routing_tables[0].name,
        "todd",
        "it should update everything",
      );
    });
  });
  describe("routing_tables.create", () => {
    it("should add a new routing table system", () => {
      craig.routing_tables.create({
        name: "todd",
        vpc: "frog",
      });
      assert.deepEqual(
        craig.store.json.routing_tables,
        [
          {
            name: "todd",
            vpc: null,
            routes: [],
          },
        ],
        "it should return correct data",
      );
    });
  });
  describe("routing_tables.delete", () => {
    it("should delete a routing_tables system", () => {
      craig.routing_tables.create({
        name: "kms",
        vpc: "management",
      });
      craig.routing_tables.delete({}, { data: { name: "kms" } });
      assert.deepEqual(
        craig.store.json.routing_tables,
        [],
        "it should return correct data",
      );
    });
  });
  describe("routing tables schema", () => {
    it("should return list of routes on render", () => {
      assert.deepEqual(
        craig.routing_tables.accept_routes_from_resource_type.onRender({
          accept_routes_from_resource_type: ["vpn_server", "vpn_gateway"],
        }),
        ["VPN Server", "VPN Gateway"],
        "it should return groups",
      );
    });
    it("should return list of routes on input change", () => {
      assert.deepEqual(
        craig.routing_tables.accept_routes_from_resource_type.onInputChange({
          accept_routes_from_resource_type: ["VPN Server", "VPN Gateway"],
        }),
        ["vpn_server", "vpn_gateway"],
        "it should return groups",
      );
    });
    it("should return correct advertise groups", () => {
      assert.deepEqual(
        craig.routing_tables.advertise_routes_to.groups({}),
        [],
        "it should return groups",
      );
      assert.deepEqual(
        craig.routing_tables.advertise_routes_to.groups({
          route_direct_link_ingress: true,
        }),
        ["Direct Link"],
        "it should return groups",
      );
      assert.isTrue(
        craig.routing_tables.route_direct_link_ingress.disabled({
          advertise_routes_to: ["direct_link"],
        }),
        "it should be disabled",
      );
      assert.isTrue(
        craig.routing_tables.transit_gateway_ingress.disabled({
          advertise_routes_to: ["transit_gateway"],
        }),
        "it should be disabled",
      );
      assert.deepEqual(
        craig.routing_tables.advertise_routes_to.groups({
          transit_gateway_ingress: true,
        }),
        ["Transit Gateway"],
        "it should return groups",
      );
    });
    it("should return list of routes on render", () => {
      assert.deepEqual(
        craig.routing_tables.advertise_routes_to.onRender({
          advertise_routes_to: ["vpn_server", "vpn_gateway"],
        }),
        ["VPN Server", "VPN Gateway"],
        "it should return groups",
      );
    });
    it("should return list of routes on input change", () => {
      assert.deepEqual(
        craig.routing_tables.advertise_routes_to.onInputChange({
          advertise_routes_to: ["VPN Server", "VPN Gateway"],
        }),
        ["vpn_server", "vpn_gateway"],
        "it should return groups",
      );
    });
    it("should have the correct name helper text", () => {
      assert.deepEqual(
        craig.routing_tables.name.helperText(
          {},
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "hi",
                  },
                },
              },
            },
          },
        ),
        "hi-undefined-vpc-undefined-table",
        "it should have correct helper text",
      );
    });
  });
  describe("routing_tables.routes", () => {
    beforeEach(() => {
      craig.routing_tables.create({
        name: "frog",
        vpc: "management",
      });
    });
    describe("routing_tables.routes.create", () => {
      it("should create a new route", () => {
        craig.routing_tables.routes.create(
          {
            name: "test-route",
            zone: 1,
            destination: "1.2.3.4/5",
            action: "delegate",
          },
          {
            innerFormProps: { arrayParentName: "frog" },
            arrayData: craig.store.json.routing_tables[0].routes,
          },
        );
        let expectedData = {
          vpc: "management",
          routing_table: "frog",
          name: "test-route",
          zone: 1,
          destination: "1.2.3.4/5",
          action: "delegate",
        };
        assert.deepEqual(
          craig.store.json.routing_tables[0].routes[0],
          expectedData,
          "it should add route",
        );
      });
    });
    describe("routing_tables.routes.save", () => {
      it("should update an encryption key in place", () => {
        craig.routing_tables.routes.create(
          {
            routing_table: "frog",
            name: "test-route",
            zone: 1,
            destination: "1.2.3.4/5",
            action: "delegate",
          },
          {
            innerFormProps: { arrayParentName: "frog" },
            arrayData: craig.store.json.routing_tables[0].routes,
          },
        );
        craig.routing_tables.routes.save(
          {
            name: "aaaaa",
          },
          { arrayParentName: "frog", data: { name: "test-route" } },
        );
        let expectedData = {
          routing_table: "frog",
          name: "aaaaa",
          zone: 1,
          destination: "1.2.3.4/5",
          vpc: "management",
          action: "delegate",
        };
        assert.deepEqual(
          craig.store.json.routing_tables[0].routes[0],
          expectedData,
          "it should update key",
        );
      });
    });
    describe("routing_tables.routes.delete", () => {
      it("should delete an encryption key", () => {
        craig.routing_tables.routes.create(
          {
            name: "test-route",
            zone: 1,
            destination: "1.2.3.4/5",
            action: "delegate",
          },
          {
            innerFormProps: { arrayParentName: "frog" },
            arrayData: craig.store.json.routing_tables[0].routes,
          },
        );
        craig.routing_tables.routes.delete(
          {},
          { arrayParentName: "frog", data: { name: "test-route" } },
        );
        assert.deepEqual(
          craig.store.json.routing_tables[0].routes,
          [],
          "it should update data",
        );
      });
    });
    describe("routing tables route schema", () => {
      it("should return correct action on render when not set", () => {
        assert.deepEqual(
          craig.routing_tables.routes.action.onRender({}),
          "",
          "it should return correct data",
        );
      });
      it("should return correct action on render", () => {
        assert.deepEqual(
          craig.routing_tables.routes.action.onRender({
            action: "delegate_vpc",
          }),
          "Delegate VPC",
          "it should return correct data",
        );
      });
      it("should return correct action on input change", () => {
        assert.deepEqual(
          craig.routing_tables.routes.action.onInputChange({
            action: "Delegate VPC",
          }),
          "delegate_vpc",
          "it should return correct data",
        );
      });
      it("should disable next hop when ", () => {
        assert.isTrue(
          craig.routing_tables.routes.next_hop.hideWhen({
            action: "delegate_vpc",
          }),
          "it should be disabled",
        );
      });
      it("should return true if a routing table route has an invalid destination", () => {
        assert.isTrue(
          craig.routing_tables.routes.destination.invalid({
            name: "aaa",
            destination: "",
            action: "deliver",
          }),
          "it should be true",
        );
        assert.isTrue(
          craig.routing_tables.routes.destination.invalid({
            name: "aaa",
            destination: "aaaa",
            action: "deliver",
          }),
          "it should be true",
        );
      });
      it("should return true if a routing table route has an invalid next hop", () => {
        assert.isTrue(
          craig.routing_tables.routes.next_hop.invalid({
            name: "aaa",
            next_hop: "aaa",
            action: "deliver",
          }),
          "it should be true",
        );
      });
      it("should return true if a routing table route has an invalid next hop as cidr block", () => {
        assert.isTrue(
          craig.routing_tables.routes.next_hop.invalid({
            name: "aaa",
            next_hop: "1.2.3.4/5",
            action: "deliver",
          }),
          "it should be true",
        );
      });
    });
  });
});
