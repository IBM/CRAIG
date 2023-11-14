const { assert } = require("chai");
const { state, invalidForms } = require("../client/src/lib");
const failingComponents = require("./data-files/every-component-fails.json");
const craig = require("./data-files/craig-json.json");
const failingSubComponents = require("./data-files/sub-components-fail.json");

describe("invalidForms", () => {
  it("should return a list of disabled components", () => {
    let updatedState = new state();
    updatedState.store.json = failingComponents;
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [
      "key_management",
      "object_storage",
      "secrets_manager",
      "atracker",
      "event_streams",
      "appid",
      "vpcs",
      "/form/nacls",
      "/form/subnets",
      "routing_tables",
      "transit_gateways",
      "security_groups",
      "virtual_private_endpoints",
      "vpn_gateways",
      "clusters",
      "ssh_keys",
      "vsi",
      "/form/observability",
      "power",
      "power_instances",
      "power_volumes",
      "load_balancers",
      "dns",
      "vpn_servers",
      "access_groups",
      "/form/cbr",
    ];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when no components fail", () => {
    let updatedState = new state();
    updatedState.store.json = craig;
    craig.vpn_servers = [];
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when sub components fail", () => {
    let updatedState = new state();
    updatedState.store.json = failingSubComponents;
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [
      "key_management",
      "object_storage",
      "routing_tables",
      "clusters",
      "vsi",
      "power",
      "power_instances",
      "power_volumes",
      "dns",
      "vpn_servers",
      "access_groups",
      "/form/cbr",
    ];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when sub components fail", () => {
    let updatedState = new state();
    updatedState.store.json = failingSubComponents;
    updatedState.updateCallback = () => {};
    updatedState.update();
    updatedState.store.json._options.power_vs_zones = ["dal10"];
    let expectedData = [
      "key_management",
      "object_storage",
      "routing_tables",
      "clusters",
      "vsi",
      "power",
      "power_instances",
      "power_volumes",
      "dns",
      "vpn_servers",
      "access_groups",
      "/form/cbr",
    ];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // dynamic policies and cbr exclusions and dns custom resolvers
    updatedState.store.json.access_groups[0].policies = [];
    updatedState.store.json.access_groups[0].dynamic_policies = [
      {
        name: "@@@@",
      },
    ];
    updatedState.store.json.cbr_zones[0].addresses = [];
    updatedState.store.json.cbr_zones[0].exclusions = [
      {
        name: "@@@",
      },
    ];
    updatedState.store.json.dns[0].zones = [];
    updatedState.store.json.dns[0].custom_resolvers = [
      {
        name: "@@@",
      },
    ];
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // cbr rules contexts, dns records
    updatedState.store.json.cbr_zones[0].exclusions = [];
    updatedState.store.json.dns[0].custom_resolvers = [];
    updatedState.store.json.dns[0].records = [
      {
        name: "@@@",
      },
    ];
    updatedState.store.json.cbr_rules.push({
      name: "good",
      description: "",
      api_type_id: "good",
      contexts: [
        {
          name: "@@@",
        },
      ],
      resource_attributes: [],
      tags: [],
    });
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // cbr resource attributes
    updatedState.store.json.cbr_rules[0].contexts = [];
    updatedState.store.json.cbr_rules[0].resource_attributes = [
      {
        name: "@@@",
      },
    ];
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // tags
    updatedState.store.json.cbr_rules[0].resource_attributes = [];
    updatedState.store.json.cbr_rules[0].tags = [
      {
        name: "@@@",
      },
    ];
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when no components invalid and vpc has default acl name", () => {
    let updatedState = new state();
    updatedState.store.json = craig;
    craig.vpn_servers = [];
    updatedState.store.json.vpcs[0].default_network_acl_name = "frog";
    updatedState.store.json.vpcs[0].default_routing_table_name = "frog";
    updatedState.store.json.vpcs[0].default_security_group_name = "frog";
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    updatedState.store.json.vpcs[0].default_network_acl_name = null;
    updatedState.store.json.vpcs[0].default_routing_table_name = null;
    updatedState.store.json.vpcs[0].default_security_group_name = null;
  });
  it("should not show access as disabled when valid", () => {
    let updatedState = new state();
    updatedState.store.json = {
      _options: {
        prefix: "fums-dt",
        region: "eu-de",
        tags: ["fums", "devtest", "fumsdt"],
        zones: 3,
        endpoints: "public-and-private",
        account_id: "",
        fs_cloud: false,
        dynamic_subnets: true,
        enable_power_vs: false,
        craig_version: "1.5.0",
        power_vs_zones: [],
      },
      access_groups: [
        {
          name: "fums-dt-ag",
          description: "Access group for FUMS dev test team",
          policies: [
            {
              name: "fums-dt-accpolicy",
              resources: {
                resource_group: "fums-dt-rg",
                resource_type: "",
                resource: "",
                service: "containers-kubernetes",
                resource_instance_id: "",
              },
            },
          ],
          dynamic_policies: [],
          has_invites: false,
          invites: {
            group: "fums-dt-ag",
            ibm_ids: [],
          },
        },
        {
          name: "fums-ap-ag",
          description: "Access group for FUMS Acceptance and Prod team",
          policies: [],
          dynamic_policies: [],
          has_invites: false,
          invites: {
            group: "fums-ap-ag",
            ibm_ids: [],
          },
        },
        {
          name: "fums-audit-ag",
          description: "Access group for auditors of FUMS",
          policies: [],
          dynamic_policies: [],
          has_invites: false,
          invites: {
            group: "fums-audit-ag",
            ibm_ids: [],
          },
        },
        {
          name: "testdev-ag",
          description: "test för att se hur det funkar",
          policies: [
            {
              name: "testpol",
              resources: {
                resource_group: "fums-dt-rg",
                resource_type: "resource-group",
                resource: "All",
                service: "Kubernetes Service",
                resource_instance_id: "",
              },
            },
          ],
          dynamic_policies: [],
          has_invites: false,
          invites: {
            group: "testdev-ag",
            ibm_ids: [],
          },
        },
      ],
      appid: [],
      atracker: {
        enabled: false,
        type: "cos",
        name: "atracker",
        target_name: "atracker-cos",
        bucket: null,
        add_route: true,
        cos_key: null,
        locations: ["global", "us-south"],
      },
      cbr_rules: [],
      cbr_zones: [],
      clusters: [],
      dns: [],
      event_streams: [],
      f5_vsi: [],
      iam_account_settings: {
        enable: false,
        mfa: null,
        allowed_ip_addresses: null,
        include_history: false,
        if_match: null,
        max_sessions_per_identity: null,
        restrict_create_service_id: null,
        restrict_create_platform_apikey: null,
        session_expiration_in_seconds: null,
        session_invalidation_in_seconds: null,
      },
      icd: [],
      key_management: [
        {
          use_hs_crypto: false,
          use_data: false,
          name: "rgnsthlm-keym",
          resource_group: "rgnsthlm-common-srvcs",
          authorize_vpc_reader_role: false,
          keys: [],
        },
      ],
      load_balancers: [],
      logdna: {
        enabled: false,
        plan: "lite",
        endpoints: "private",
        platform_logs: false,
        resource_group: null,
        cos: null,
        bucket: null,
      },
      object_storage: [
        {
          name: "rgnsthlm-cos",
          use_data: false,
          resource_group: "rgnsthlm-common-srvcs",
          plan: "standard",
          use_random_suffix: true,
          kms: "rgnsthlm-keym",
          buckets: [],
          keys: [],
        },
      ],
      power: [],
      power_instances: [],
      power_volumes: [],
      resource_groups: [
        {
          use_prefix: true,
          name: "fums-dt-rg",
          use_data: false,
        },
        {
          use_data: false,
          name: "fums-ap-rg",
          use_prefix: true,
        },
        {
          use_data: false,
          name: "rgnsthlm-common-srvcs",
          use_prefix: true,
        },
      ],
      routing_tables: [],
      scc: {
        credential_description: null,
        id: null,
        passphrase: null,
        name: "",
        location: "us",
        collector_description: null,
        is_public: false,
        scope_description: null,
        enable: false,
      },
      secrets_manager: [],
      security_groups: [],
      ssh_keys: [],
      sysdig: {
        enabled: false,
        plan: "graduated-tier",
        resource_group: null,
      },
      teleport_vsi: [],
      transit_gateways: [],
      virtual_private_endpoints: [],
      vpcs: [],
      vpn_gateways: [],
      vpn_servers: [],
      vsi: [],
    };
    let expectedData = [];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
});
