const { assert } = require("chai");
const { getServices } = require("../../client/src/lib/forms/overview");
const { state } = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("overview", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("getServices", () => {
    it("should return a map of services", () => {
      let actualData = getServices(craig, [
        "appid",
        "icd",
        "event_streams",
        "key_management",
        "object_storage",
      ]);
      let expectedData = {
        serviceResourceGroups: ["management-rg", "service-rg", "workload-rg"],
        serviceMap: {
          "management-rg": [],
          "service-rg": [
            {
              name: "kms",
              type: "key_management",
              overrideType: undefined,
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
            },
          ],
          "workload-rg": [],
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return a map of services with no rg", () => {
      craig.store.json.key_management[0].resource_group = null;
      craig.store.json.logdna.enabled = true;
      craig.icd.create({ name: "default" });
      craig.icd.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      let actualData = getServices(craig, [
        "appid",
        "icd",
        "event_streams",
        "key_management",
        "object_storage",
      ]);
      let expectedData = {
        serviceResourceGroups: [
          "No Resource Group",
          "management-rg",
          "service-rg",
          "workload-rg",
        ],
        serviceMap: {
          "No Resource Group": [
            {
              name: "kms",
              type: "key_management",
              overrideType: undefined,
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              overrideType: "cloud_databases",
              type: "icd",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
            },
            {
              name: "logdna",
              type: "logdna",
            },
          ],
          "workload-rg": [],
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return a map of services with no rg", () => {
      craig.store.json.key_management[0].resource_group = null;
      craig.store.json.logdna.enabled = true;
      craig.store.json.logdna.resource_group = null;
      craig.icd.create({ name: "default" });
      craig.icd.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      let actualData = getServices(craig, [
        "appid",
        "icd",
        "event_streams",
        "key_management",
        "object_storage",
      ]);
      let expectedData = {
        serviceResourceGroups: [
          "No Resource Group",
          "management-rg",
          "service-rg",
          "workload-rg",
        ],
        serviceMap: {
          "No Resource Group": [
            {
              name: "kms",
              type: "key_management",
              overrideType: undefined,
            },
            {
              name: "logdna",
              type: "logdna",
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              overrideType: "cloud_databases",
              type: "icd",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
            },
          ],
          "workload-rg": [],
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return a map of services with atracker when instance is true", () => {
      craig.store.json.key_management[0].resource_group = null;
      craig.store.json.logdna.enabled = true;
      craig.store.json.logdna.resource_group = null;
      craig.icd.create({ name: "default" });
      craig.icd.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      craig.store.json.atracker.instance = true;
      let actualData = getServices(craig, [
        "appid",
        "icd",
        "event_streams",
        "key_management",
        "object_storage",
      ]);
      let expectedData = {
        serviceResourceGroups: [
          "No Resource Group",
          "management-rg",
          "service-rg",
          "workload-rg",
        ],
        serviceMap: {
          "No Resource Group": [
            {
              name: "kms",
              type: "key_management",
              overrideType: undefined,
            },
            {
              name: "logdna",
              type: "logdna",
            },
            {
              name: "atracker",
              type: "atracker",
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              overrideType: "cloud_databases",
              type: "icd",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
            },
          ],
          "workload-rg": [],
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return a map of services with scc when enabled", () => {
      craig.store.json.key_management[0].resource_group = null;
      craig.store.json.logdna.enabled = true;
      craig.store.json.logdna.resource_group = null;
      craig.icd.create({ name: "default" });
      craig.icd.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      craig.store.json.atracker.instance = true;
      craig.store.json.scc_v2.enable = true;
      let actualData = getServices(craig, [
        "appid",
        "icd",
        "event_streams",
        "key_management",
        "object_storage",
      ]);
      let expectedData = {
        serviceResourceGroups: [
          "No Resource Group",
          "management-rg",
          "service-rg",
          "workload-rg",
        ],
        serviceMap: {
          "No Resource Group": [
            {
              name: "kms",
              type: "key_management",
              overrideType: undefined,
            },
            {
              name: "logdna",
              type: "logdna",
            },
            {
              name: "atracker",
              type: "atracker",
            },
            {
              name: "scc_v2",
              type: "scc_v2",
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              overrideType: "cloud_databases",
              type: "icd",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
            },
          ],
          "workload-rg": [],
        },
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
