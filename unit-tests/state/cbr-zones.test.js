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
    describe("cbr_zones.onStoreUpdate", () => {
      it("should initialize addresses to empty array", () => {
        let state = new newState();
        state.cbr_zones.create({
          name: "cbr-rule",
          description: "description",
          account_id: "frog",
        });
        state.update();
        assert.deepEqual(state.store.json.cbr_zones[0].addresses, []);
      });
      it("should make cbr zones empty if undefined", () => {
        let state = new newState();
        state.store.json.cbr_zones = undefined;
        state.update();
        assert.deepEqual(state.store.json.cbr_zones, []);
      });
    });
    describe("cbr-zones.schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
      });
      it("should return true when a cbr zone with the same name", () => {
        let actualData = craig.cbr_zones.name.invalid(
          {
            name: "test",
          },
          {
            craig: {
              store: {
                json: {
                  cbr_zones: [
                    {
                      name: "test",
                    },
                    {
                      name: "frog",
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return true when a cbr exclusion with the same name", () => {
        let actualData = craig.cbr_zones.exclusions.name.invalid(
          {
            name: "test",
          },
          {
            craig: {
              store: {
                json: {
                  cbr_zones: [
                    {
                      name: "hi",
                      exclusions: [
                        {
                          name: "test",
                        },
                        {
                          name: "frog",
                        },
                      ],
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return true when a cbr address with the same name", () => {
        let actualData = craig.cbr_zones.addresses.name.invalid(
          {
            name: "test",
          },
          {
            craig: {
              store: {
                json: {
                  cbr_zones: [
                    {
                      name: "hi",
                      addresses: [
                        {
                          name: "test",
                        },
                        {
                          name: "frog",
                        },
                      ],
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return correct placeholder for address value", () => {
        let state = new newState();
        assert.deepEqual(
          state.cbr_zones.addresses.value.placeholder({ type: "ipAddress" }),
          "x.x.x.x",
          "it should return correct placeholder"
        );
      });
      it("should return correct invalidText for address value", () => {
        let state = new newState();
        assert.deepEqual(
          state.cbr_zones.addresses.value.invalidText({
            type: "ipAddress",
            value: "frog",
          }),
          `Invalid value for type ipAddress. Value must be a valid IPV4 Address.`,
          "it should return correct placeholder"
        );
      });
      it("should return correct placeholder for exclusion value", () => {
        let state = new newState();
        assert.deepEqual(
          state.cbr_zones.exclusions.value.placeholder({ type: "ipAddress" }),
          "x.x.x.x",
          "it should return correct placeholder"
        );
      });
      it("should return correct placeholder for exclusion value", () => {
        let state = new newState();
        assert.deepEqual(
          state.cbr_zones.exclusions.value.placeholder({ type: "ipRange" }),
          "x.x.x.x-x.x.x.x",
          "it should return correct placeholder"
        );
      });
      it("should return correct placeholder for exclusion value", () => {
        let state = new newState();
        assert.deepEqual(
          state.cbr_zones.exclusions.value.placeholder({ type: "serviceRef" }),
          "my-cbr-zone-serviceRef",
          "it should return correct placeholder"
        );
      });
      it("should return correct invalidText for exclusion value", () => {
        let state = new newState();
        assert.deepEqual(
          state.cbr_zones.exclusions.value.invalidText({
            type: "ipAddress",
            value: "frog",
          }),
          `Invalid value for type ipAddress. Value must be a valid IPV4 Address.`,
          "it should return correct placeholder"
        );
      });
      it("should return return false if description is valid", () => {
        let state = new newState();
        assert.isFalse(
          state.cbr_zones.description.invalid({ description: "toad" }),
          "it should return false"
        );
      });
    });
  });
});
