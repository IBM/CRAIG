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

describe("cbr_zones", () => {
  describe("cbr_zones.init", () => {
    it("should initialize cbr zones", () => {
      let state = new newState();
      assert.deepEqual(state.store.json.cbr_zones, [], "it should return data");
    });
  });
  describe("cbr_zone crud functions", () => {
    let state;
    beforeEach(() => {
      state = new newState();
    });
    it("should create a new cbr zone", () => {
      state.cbr_zones.create({
        name: "cbr-zone",
        account_id: "test-id",
        description: "",
        addresses: [],
        exclusions: [],
      });
      let expectedData = [
        {
          name: "cbr-zone",
          account_id: "test-id",
          description: "",
          addresses: [],
          exclusions: [],
        },
      ];
      assert.deepEqual(state.store.json.cbr_zones, expectedData);
    });
    it("should update a cbr zone", () => {
      state.cbr_zones.create({
        name: "cbr-zone",
        account_id: "test-id",
        description: "",
        addresses: [],
        exclusions: [],
      });
      state.cbr_zones.save(
        {
          account_id: "new",
          description: "hi",
          name: "frog",
        },
        {
          data: {
            name: "cbr-zone",
          },
        }
      );
      let expectedData = [
        {
          name: "frog",
          account_id: "new",
          description: "hi",
          addresses: [],
          exclusions: [],
        },
      ];
      assert.deepEqual(state.store.json.cbr_zones, expectedData);
    });
    it("should delete a cbr zone", () => {
      state.cbr_zones.create({
        name: "cbr-zone",
        account_id: "test-id",
        description: "",
        addresses: [],
        exclusions: [],
      });
      state.cbr_zones.delete({}, { data: { name: "cbr-zone" } });
      assert.deepEqual(state.store.json.cbr_zones, []);
    });
    describe("cbr zone addresses crud functions", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        state.cbr_zones.create({
          name: "cbr-zone",
          account_id: "test-id",
          description: "",
          addresses: [],
          exclusions: [],
        });
      });
      it("should create an address", () => {
        state.cbr_zones.addresses.create(
          {
            name: "name",
            account_id: "id",
            location: "us",
            service_instance: "resource-group",
            service_name: "frog",
            type: "ipAddress",
            value: "2.2.2.2",
          },
          {
            innerFormProps: { arrayParentName: "cbr-zone" },
            arrayData: state.store.json.cbr_zones[0].addresses,
          }
        );
        let expectedData = {
          name: "name",
          account_id: "id",
          location: "us",
          service_instance: "resource-group",
          service_name: "frog",
          type: "ipAddress",
          value: "2.2.2.2",
        };
        assert.deepEqual(
          state.store.json.cbr_zones[0].addresses[0],
          expectedData
        );
      });
      it("should update an address", () => {
        state.cbr_zones.addresses.create(
          {
            name: "name",
            account_id: "id",
            location: "us",
            service_instance: "resource-group",
            service_name: "frog",
            type: "ipAddress",
            value: "2.2.2.2",
          },
          {
            innerFormProps: { arrayParentName: "cbr-zone" },
            arrayData: state.store.json.cbr_zones[0].addresses,
          }
        );
        state.cbr_zones.addresses.save(
          {
            name: "blah",
            account_id: "hi",
            location: "eu",
            service_instance: "resource-group",
            service_name: "tree",
            type: "ipAddress",
            value: "2.2.2.3",
          },
          {
            arrayParentName: "cbr-zone",
            data: { name: "name" },
          }
        );
        let expectedData = {
          name: "blah",
          account_id: "hi",
          location: "eu",
          service_instance: "resource-group",
          service_name: "tree",
          type: "ipAddress",
          value: "2.2.2.3",
        };
        assert.deepEqual(
          state.store.json.cbr_zones[0].addresses[0],
          expectedData
        );
      });
      it("should delete an address", () => {
        state.cbr_zones.addresses.create(
          {
            name: "name",
            account_id: "id",
            location: "us",
            service_instance: "resource-group",
            service_name: "frog",
            type: "ipAddress",
            value: "2.2.2.2",
          },
          {
            innerFormProps: { arrayParentName: "cbr-zone" },
            arrayData: state.store.json.cbr_zones[0].addresses,
          }
        );
        state.cbr_zones.addresses.delete(
          {},
          { arrayParentName: "cbr-zone", data: { name: "name" } }
        );
        assert.deepEqual(state.store.json.cbr_zones[0].addresses, []);
      });
    });
    describe("cbr zone exclusions crud functions", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        state.cbr_zones.create({
          name: "cbr-zone",
          account_id: "test-id",
          description: "",
          addresses: [],
          exclusions: [],
        });
      });
      it("should create an exclusion", () => {
        state.cbr_zones.exclusions.create(
          {
            name: "name",
            account_id: "id",
            location: "us",
            service_instance: "resource-group",
            service_name: "frog",
            type: "ipAddress",
            value: "2.2.2.2",
          },
          {
            innerFormProps: { arrayParentName: "cbr-zone" },
            arrayData: state.store.json.cbr_zones[0].exclusions,
          }
        );
        let expectedData = {
          name: "name",
          account_id: "id",
          location: "us",
          service_instance: "resource-group",
          service_name: "frog",
          type: "ipAddress",
          value: "2.2.2.2",
        };
        assert.deepEqual(
          state.store.json.cbr_zones[0].exclusions[0],
          expectedData
        );
      });
      it("should update an address", () => {
        state.cbr_zones.exclusions.create(
          {
            name: "name",
            account_id: "id",
            location: "us",
            service_instance: "resource-group",
            service_name: "frog",
            type: "ipAddress",
            value: "2.2.2.2",
          },
          {
            innerFormProps: { arrayParentName: "cbr-zone" },
            arrayData: state.store.json.cbr_zones[0].exclusions,
          }
        );
        state.cbr_zones.exclusions.save(
          {
            name: "blah",
            account_id: "hi",
            location: "eu",
            service_instance: "resource-group",
            service_name: "tree",
            type: "ipAddress",
            value: "2.2.2.3",
          },
          {
            arrayParentName: "cbr-zone",
            data: { name: "name" },
          }
        );
        let expectedData = {
          name: "blah",
          account_id: "hi",
          location: "eu",
          service_instance: "resource-group",
          service_name: "tree",
          type: "ipAddress",
          value: "2.2.2.3",
        };
        assert.deepEqual(
          state.store.json.cbr_zones[0].exclusions[0],
          expectedData
        );
      });
      it("should delete an address", () => {
        state.cbr_zones.exclusions.create(
          {
            name: "name",
            account_id: "id",
            location: "us",
            service_instance: "resource-group",
            service_name: "frog",
            type: "ipAddress",
            value: "2.2.2.2",
          },
          {
            innerFormProps: { arrayParentName: "cbr-zone" },
            arrayData: state.store.json.cbr_zones[0].exclusions,
          }
        );
        state.cbr_zones.exclusions.delete(
          {},
          { arrayParentName: "cbr-zone", data: { name: "name" } }
        );
        assert.deepEqual(state.store.json.cbr_zones[0].exclusions, []);
      });
    });
  });
});
