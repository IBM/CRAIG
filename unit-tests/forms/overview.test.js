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
              data: {
                name: "kms",
                resource_group: "service-rg",
                use_hs_crypto: false,
                authorize_vpc_reader_role: true,
                use_data: false,
                keys: [
                  {
                    key_ring: "ring",
                    name: "key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "atracker-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "vsi-volume-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "roks-key",
                    root_key: true,
                    force_delete: null,
                    endpoint: null,
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                ],
              },
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "atracker-key",
                    name: "atracker-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                keys: [
                  {
                    name: "cos-bind-key",
                    role: "Writer",
                    enable_hmac: false,
                    use_random_suffix: true,
                  },
                ],
                name: "atracker-cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                use_random_suffix: true,
                kms: "kms",
              },
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "management-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "workload-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                use_random_suffix: true,
                keys: [],
                name: "cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                kms: "kms",
              },
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
              data: {
                name: "kms",
                resource_group: null,
                use_hs_crypto: false,
                authorize_vpc_reader_role: true,
                use_data: false,
                keys: [
                  {
                    key_ring: "ring",
                    name: "key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "atracker-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "vsi-volume-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "roks-key",
                    root_key: true,
                    force_delete: null,
                    endpoint: null,
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                ],
              },
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              type: "icd",
              data: {
                name: "default",
                resource_group: "service-rg",
                kms: null,
                encryption_key: null,
              },
              overrideType: "cloud_databases",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "atracker-key",
                    name: "atracker-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                keys: [
                  {
                    name: "cos-bind-key",
                    role: "Writer",
                    enable_hmac: false,
                    use_random_suffix: true,
                  },
                ],
                name: "atracker-cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                use_random_suffix: true,
                kms: "kms",
              },
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "management-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "workload-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                use_random_suffix: true,
                keys: [],
                name: "cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                kms: "kms",
              },
            },
            {
              name: "logdna",
              type: "logdna",
              data: {
                enabled: true,
                plan: "lite",
                endpoints: "private",
                platform_logs: false,
                resource_group: "service-rg",
                cos: "atracker-cos",
                bucket: "atracker-bucket",
                secrets_manager: null,
              },
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
              data: {
                name: "kms",
                resource_group: null,
                use_hs_crypto: false,
                authorize_vpc_reader_role: true,
                use_data: false,
                keys: [
                  {
                    key_ring: "ring",
                    name: "key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "atracker-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "vsi-volume-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "roks-key",
                    root_key: true,
                    force_delete: null,
                    endpoint: null,
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                ],
              },
            },
            {
              name: "logdna",
              type: "logdna",
              data: {
                enabled: true,
                plan: "lite",
                endpoints: "private",
                platform_logs: false,
                resource_group: null,
                cos: "atracker-cos",
                bucket: "atracker-bucket",
                secrets_manager: null,
              },
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              type: "icd",
              data: {
                name: "default",
                resource_group: "service-rg",
                kms: null,
                encryption_key: null,
              },
              overrideType: "cloud_databases",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "atracker-key",
                    name: "atracker-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                keys: [
                  {
                    name: "cos-bind-key",
                    role: "Writer",
                    enable_hmac: false,
                    use_random_suffix: true,
                  },
                ],
                name: "atracker-cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                use_random_suffix: true,
                kms: "kms",
              },
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "management-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "workload-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                use_random_suffix: true,
                keys: [],
                name: "cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                kms: "kms",
              },
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
              data: {
                name: "kms",
                resource_group: null,
                use_hs_crypto: false,
                authorize_vpc_reader_role: true,
                use_data: false,
                keys: [
                  {
                    key_ring: "ring",
                    name: "key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "atracker-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "vsi-volume-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "roks-key",
                    root_key: true,
                    force_delete: null,
                    endpoint: null,
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                ],
              },
            },
            {
              name: "logdna",
              type: "logdna",
              data: {
                enabled: true,
                plan: "lite",
                endpoints: "private",
                platform_logs: false,
                resource_group: null,
                cos: "atracker-cos",
                bucket: "atracker-bucket",
                secrets_manager: null,
              },
            },
            {
              name: "atracker",
              type: "atracker",
              data: {
                enabled: true,
                type: "cos",
                name: "atracker",
                target_name: "atracker-cos",
                bucket: "atracker-bucket",
                add_route: true,
                cos_key: "cos-bind-key",
                locations: ["global", "us-south"],
                instance: true,
              },
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              type: "icd",
              data: {
                name: "default",
                resource_group: "service-rg",
                kms: null,
                encryption_key: null,
              },
              overrideType: "cloud_databases",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "atracker-key",
                    name: "atracker-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                keys: [
                  {
                    name: "cos-bind-key",
                    role: "Writer",
                    enable_hmac: false,
                    use_random_suffix: true,
                  },
                ],
                name: "atracker-cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                use_random_suffix: true,
                kms: "kms",
              },
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "management-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "workload-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                use_random_suffix: true,
                keys: [],
                name: "cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                kms: "kms",
              },
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
              data: {
                name: "kms",
                resource_group: null,
                use_hs_crypto: false,
                authorize_vpc_reader_role: true,
                use_data: false,
                keys: [
                  {
                    key_ring: "ring",
                    name: "key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "atracker-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "vsi-volume-key",
                    root_key: true,
                    force_delete: true,
                    endpoint: "public",
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                  {
                    key_ring: "ring",
                    name: "roks-key",
                    root_key: true,
                    force_delete: null,
                    endpoint: null,
                    rotation: 1,
                    dual_auth_delete: false,
                  },
                ],
              },
            },
            {
              name: "logdna",
              type: "logdna",
              data: {
                enabled: true,
                plan: "lite",
                endpoints: "private",
                platform_logs: false,
                resource_group: null,
                cos: "atracker-cos",
                bucket: "atracker-bucket",
                secrets_manager: null,
              },
            },
            {
              name: "atracker",
              type: "atracker",
              data: {
                enabled: true,
                type: "cos",
                name: "atracker",
                target_name: "atracker-cos",
                bucket: "atracker-bucket",
                add_route: true,
                cos_key: "cos-bind-key",
                locations: ["global", "us-south"],
                instance: true,
              },
            },
          ],
          "management-rg": [],
          "service-rg": [
            {
              name: "default",
              type: "icd",
              overrideType: undefined,
              data: {
                name: "default",
                resource_group: "service-rg",
                kms: null,
                encryption_key: null,
              },
              overrideType: "cloud_databases",
            },
            {
              name: "atracker-cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "atracker-key",
                    name: "atracker-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                keys: [
                  {
                    name: "cos-bind-key",
                    role: "Writer",
                    enable_hmac: false,
                    use_random_suffix: true,
                  },
                ],
                name: "atracker-cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                use_random_suffix: true,
                kms: "kms",
              },
            },
            {
              name: "cos",
              type: "object_storage",
              overrideType: undefined,
              data: {
                buckets: [
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "management-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                  {
                    endpoint: "public",
                    force_delete: true,
                    kms_key: "key",
                    name: "workload-bucket",
                    storage_class: "standard",
                    use_random_suffix: true,
                  },
                ],
                use_random_suffix: true,
                keys: [],
                name: "cos",
                plan: "standard",
                resource_group: "service-rg",
                use_data: false,
                kms: "kms",
              },
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
