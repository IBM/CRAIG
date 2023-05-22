const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { naclRuleDelete } = require("../../client/src/lib/state/vpc");

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
  describe("routing_tables.init", () => {
    it("should initialize routing_tables as a list", () => {
      let state = new newState();
      let expectedData = [];
      assert.deepEqual(
        state.store.json.routing_tables,
        expectedData,
        "it should have routing_tables initialized as a list"
      );
    });
  });
  describe("routing_tables.onStoreUpdate", () => {
    it("should set unfound vpc to null", () => {
      let state = new newState();
      let expectedData = {
        name: "test",
        vpc: null,
        routes: [
          {
            name: "frog",
            vpc: null,
            routing_table: "test",
          },
        ],
      };
      state.store.json.routing_tables.push({
        name: "test",
        vpc: "bad",
        routes: [
          {
            name: "frog",
            vpc: "bad",
          },
        ],
      });
      state.update();
      assert.deepEqual(
        state.store.json.routing_tables[0],
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("routing_tables.save", () => {
    it("should change the properties of the routing table instance", () => {
      let state = new newState();
      state.routing_tables.create({
        name: "kms",
        vpc: "management",
      });
      state.routing_tables.save(
        {
          name: "todd",
          vpc: "management",
        },
        { data: { name: "kms" } }
      );
      let expectedData = [
        {
          name: "todd",
          vpc: "management",
          routes: [],
        },
      ];
      assert.deepEqual(
        state.store.json.routing_tables,
        expectedData,
        "it should update everything"
      );
    });
  });
  describe("routing_tables.create", () => {
    it("should add a new routing table system", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "todd",
          vpc: null,
          routes: [],
        },
      ];
      state.routing_tables.create({
        name: "todd",
        vpc: "frog",
      });
      assert.deepEqual(
        state.store.json.routing_tables,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("routing_tables.delete", () => {
    it("should delete a routing_tables system", () => {
      let state = new newState();
      state.routing_tables.create({
        name: "kms",
        vpc: "management",
      });
      state.routing_tables.delete({}, { data: { name: "kms" } });
      assert.deepEqual(
        state.store.json.routing_tables,
        [],
        "it should return correct data"
      );
    });
  });
  describe("routing_tables.routes", () => {
    describe("routing_tables.routes.create", () => {
      it("should create a new route", () => {
        let state = new newState();
        state.routing_tables.create({
          name: "frog",
          vpc: "management",
        });
        state.routing_tables.routes.create(
          {
            name: "test-route",
            zone: 1,
            destination: "1.2.3.4/5",
            action: "delegate",
          },
          {
            innerFormProps: { arrayParentName: "frog" },
            arrayData: state.store.json.routing_tables[0].routes,
          }
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
          state.store.json.routing_tables[0].routes[0],
          expectedData,
          "it should add route"
        );
      });
    });
    describe("routing_tables.routes.save", () => {
      it("should update an encryption key in place", () => {
        let state = new newState();
        state.routing_tables.create({
          name: "frog",
          vpc: "management",
          routes: [],
        });
        state.routing_tables.routes.create(
          {
            routing_table: "frog",
            name: "test-route",
            zone: 1,
            destination: "1.2.3.4/5",
            action: "delegate",
          },
          {
            innerFormProps: { arrayParentName: "frog" },
            arrayData: state.store.json.routing_tables[0].routes,
          }
        );
        state.routing_tables.routes.save(
          {
            name: "aaaaa",
          },
          { arrayParentName: "frog", data: { name: "test-route" } }
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
          state.store.json.routing_tables[0].routes[0],
          expectedData,
          "it should update key"
        );
      });
    });
    describe("routing_tables.routes.delete", () => {
      it("should delete an encryption key", () => {
        let state = new newState();
        state.routing_tables.create({
          name: "frog",
          vpc: "management",
        });
        state.routing_tables.routes.create(
          {
            name: "test-route",
            zone: 1,
            destination: "1.2.3.4/5",
            action: "delegate",
          },
          {
            innerFormProps: { arrayParentName: "frog" },
            arrayData: state.store.json.routing_tables[0].routes,
          }
        );
        state.routing_tables.routes.delete(
          {},
          { arrayParentName: "frog", data: { name: "test-route" } }
        );
        assert.deepEqual(
          state.store.json.routing_tables[0].routes,
          [],
          "it should update data"
        );
      });
    });
  });
});
