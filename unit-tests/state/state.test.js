const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { splat } = require("lazy-z");
const json = require("../data-files/craig-json.json");
const hardSetData = require("../data-files/expected-hard-set.json");
const brokenSubnets = require("../data-files/broken-subnets.json");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("state util functions", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("setStoreValue", () => {
    it("should set a store value", () => {
      craig.setStoreValue("jsonInCodeMirror", true);
      assert.isTrue(craig.store.jsonInCodeMirror, "it should be set");
    });
  });
  describe("toggleStoreValue", () => {
    it("should toggle a boolean store value", () => {
      craig.toggleStoreValue("hideCodeMirror");
      assert.isTrue(craig.store.hideCodeMirror, "it should toggle value");
    });
  });
  describe("addClusterRules", () => {
    it("should add rules and skip duplicate rules", () => {
      craig.store.json.vpcs[0].acls[0].rules.push({
        name: "roks-create-worker-nodes-inbound",
      });
      craig.addClusterRules("management", "management");
      assert.deepEqual(
        splat(craig.store.json.vpcs[0].acls[0].rules, "name"),
        [
          "allow-ibm-inbound",
          "allow-ibm-outbound",
          "allow-all-network-inbound",
          "allow-all-network-outbound",
          "roks-create-worker-nodes-inbound",
          "roks-create-worker-nodes-outbound",
          "roks-nodes-to-service-inbound",
          "roks-nodes-to-service-outbound",
          "allow-app-incoming-traffic-requests",
          "allow-app-outgoing-traffic-requests",
          "allow-lb-incoming-traffic-requests",
          "allow-lb-outgoing-traffic-requests",
        ],
        "it should add non duplicate rules"
      );
    });
  });
  describe("copySecurityGroup", () => {
    it("should copy acl from one vpc to another", () => {
      craig.store.json.vpcs[1].acls = [];
      craig.copySecurityGroup("management-vpe", "workload");
      assert.deepEqual(
        splat(craig.store.json.security_groups, "name")[3],
        "management-vpe-copy",
        "it should copy"
      );
    });
  });
  describe("copyNetworkAcl", () => {
    it("should copy acl from one vpc to another", () => {
      craig.store.json.vpcs[1].acls = [];
      craig.copyNetworkAcl("management", "management", "workload");
      assert.deepEqual(
        splat(craig.store.json.vpcs[1].acls, "name"),
        ["management-copy"],
        "it should copy"
      );
    });
  });
  describe("copyRule", () => {
    it("should copy one rule from vpc to another", () => {
      craig.store.json.vpcs[1].acls[0].rules = [];
      craig.copyRule(
        "management",
        "management",
        "allow-all-network-outbound",
        "workload"
      );
      assert.deepEqual(
        splat(craig.store.json.vpcs[1].acls[0].rules, "name"),
        ["allow-all-network-outbound"],
        "it should copy"
      );
    });
  });
  describe("copySgRule", () => {
    it("should copy one rule from sg to another", () => {
      craig.store.json.security_groups[0].rules = [];
      craig.copySgRule("workload-vpe", "allow-vpc-outbound", "management-vpe");
      assert.deepEqual(
        splat(craig.store.json.security_groups[0].rules, "name"),
        ["allow-vpc-outbound"],
        "it should copy"
      );
    });
  });
  describe("getAllSubnets", () => {
    it("should get all subnets", () => {
      let expectedData = [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.0/29",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.16/28",
          name: "vpn-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.0.0/29",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.0.0/29",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.48/29",
          name: "vpe-zone-1",
          resource_group: "management-rg",
          network_acl: "management",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.0.16/29",
          name: "vpe-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.0.16/29",
          name: "vpe-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.0.0/28",
          name: "vsi-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.0.0/28",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.0.0/28",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.0.32/29",
          name: "vpe-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.0.32/29",
          name: "vpe-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.0.32/29",
          name: "vpe-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
      ];
      craig = new newState(true);
      let actualData = craig.getAllSubnets();
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("hardSetJson", () => {
    it("should set JSON data if valid", () => {
      craig.store = {
        json: {},
      };
      craig.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      craig.hardSetJson({ ...json });
      assert.deepEqual(
        craig.store.json,
        { ...hardSetData },
        "it should set the store"
      );
      assert.deepEqual(
        craig.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should set JSON data if valid with routing tables", () => {
      let rtJson = require("../data-files/craig-json-routing-tables.json");
      craig.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      let expectedData = { ...hardSetData };
      expectedData.routing_tables = [
        {
          name: "table",
          routes: [
            {
              routing_table: "table",
              vpc: "management",
            },
          ],
          vpc: "management",
        },
      ];
      craig.hardSetJson(rtJson);
      assert.deepEqual(
        craig.store.json,
        expectedData,
        "it should set the store"
      );
      assert.deepEqual(
        craig.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should hard set json data and set edge pattern when edge resources are found", () => {
      let data = {
        _options: {
          craig_version: "1.12.0",
          prefix: "slz",
          region: "us-south",
          tags: ["slz", "landing-zone"],
          dynamic_subnets: false,
          power_vs_zones: [],
          endpoints: "private",
          account_id: null,
          enable_power_vs: false,
          fs_cloud: false,
          power_vs_high_availability: false,
          zones: 3,
          no_vpn_secrets_manager_auth: false,
        },
        access_groups: [],
        appid: [],
        atracker: {
          add_route: true,
          bucket: "atracker-bucket",
          locations: ["global"],
          enabled: true,
          type: "cos",
          name: "atracker",
          cos_key: "cos-bind-key",
          target_name: "atracker-cos",
          instance: false,
          plan: "lite",
          resource_group: null,
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
            keys: [
              {
                dual_auth_delete: false,
                name: "slz-atracker-key",
                endpoint: "private",
                force_delete: false,
                root_key: true,
                key_ring: "ring",
                rotation: 12,
              },
              {
                dual_auth_delete: false,
                name: "key",
                endpoint: "private",
                force_delete: false,
                root_key: true,
                key_ring: "ring",
                rotation: 12,
              },
              {
                dual_auth_delete: false,
                name: "slz-vsi-volume-key",
                endpoint: "private",
                force_delete: false,
                root_key: true,
                key_ring: "ring",
                rotation: 12,
              },
            ],
            authorize_vpc_reader_role: true,
            name: "kms",
            resource_group: "service-rg",
            use_data: false,
            use_hs_crypto: false,
          },
        ],
        load_balancers: [],
        logdna: {
          name: "logdna",
          archive: false,
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: "service-rg",
          cos: "atracker-cos",
          bucket: "atracker-bucket",
        },
        object_storage: [
          {
            kms: "kms",
            name: "atracker-cos",
            plan: "standard",
            resource_group: "service-rg",
            use_random_suffix: true,
            use_data: false,
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "slz-atracker-key",
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
          },
          {
            kms: "kms",
            name: "cos",
            plan: "standard",
            resource_group: "service-rg",
            use_random_suffix: true,
            use_data: false,
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
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "edge-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
            ],
            keys: [],
          },
        ],
        power: [],
        power_instances: [],
        power_volumes: [],
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            use_prefix: true,
          },
          {
            name: "management-rg",
            use_data: false,
            use_prefix: true,
          },
          {
            name: "workload-rg",
            use_data: false,
            use_prefix: true,
          },
          {
            name: "edge-rg",
            use_data: false,
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
        security_groups: [
          {
            vpc: "edge",
            name: "f5-management",
            resource_group: "edge-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-management",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-management",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-management",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-management",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-management",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-management",
                vpc: "edge",
              },
            ],
          },
          {
            vpc: "edge",
            name: "f5-external",
            resource_group: "edge-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-inbound-443",
                source: "0.0.0.0/0",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-external",
                vpc: "edge",
              },
            ],
          },
          {
            vpc: "edge",
            name: "f5-workload",
            resource_group: "edge-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-workload-subnet-1",
                source: "10.10.10.0/24",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-workload-subnet-2",
                source: "10.20.10.0/24",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-workload-subnet-3",
                source: "10.30.10.0/24",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-workload-subnet-4",
                source: "10.40.10.0/24",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-workload-subnet-5",
                source: "10.50.10.0/24",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-workload-subnet-6",
                source: "10.60.10.0/24",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-workload",
                vpc: "edge",
              },
            ],
          },
          {
            vpc: "edge",
            name: "f5-bastion",
            resource_group: "edge-rg",
            rules: [
              {
                direction: "inbound",
                name: "1-inbound-3023",
                source: "10.5.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-bastion",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "1-inbound-3080",
                source: "10.5.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-bastion",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "2-inbound-3023",
                source: "10.6.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-bastion",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "2-inbound-3080",
                source: "10.6.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-bastion",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "3-inbound-3023",
                source: "10.7.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-bastion",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "3-inbound-3080",
                source: "10.7.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "f5-bastion",
                vpc: "edge",
              },
            ],
          },
          {
            vpc: "edge",
            name: "edge-vpe",
            resource_group: "edge-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "edge-vpe",
                vpc: "edge",
              },
              {
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "edge-vpe",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "edge-vpe",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "edge-vpe",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "edge-vpe",
                vpc: "edge",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "edge-vpe",
                vpc: "edge",
              },
            ],
          },
          {
            vpc: "management",
            name: "management-vpe",
            resource_group: "management-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vpe",
                vpc: "management",
              },
              {
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vpe",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vpe",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vpe",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vpe",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vpe",
                vpc: "management",
              },
            ],
          },
          {
            vpc: "workload",
            name: "workload-vpe",
            resource_group: "workload-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vpe",
                vpc: "workload",
              },
              {
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vpe",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vpe",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vpe",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vpe",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vpe",
                vpc: "workload",
              },
            ],
          },
          {
            vpc: "management",
            name: "management-vsi",
            resource_group: "management-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vsi",
                vpc: "management",
              },
              {
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vsi",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vsi",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vsi",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vsi",
                vpc: "management",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "management-vsi",
                vpc: "management",
              },
            ],
          },
          {
            vpc: "workload",
            name: "workload-vsi",
            resource_group: "workload-rg",
            rules: [
              {
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vsi",
                vpc: "workload",
              },
              {
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vsi",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vsi",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vsi",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vsi",
                vpc: "workload",
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                sg: "workload-vsi",
                vpc: "workload",
              },
            ],
          },
        ],
        ssh_keys: [
          {
            name: "slz-ssh-key",
            use_data: false,
            resource_group: "management-rg",
            public_key: "",
          },
        ],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: "service-rg",
          name: "sysdig",
          platform_logs: false,
        },
        teleport_vsi: [],
        transit_gateways: [
          {
            global: false,
            name: "transit-gateway",
            resource_group: "service-rg",
            connections: [
              {
                tgw: "transit-gateway",
                vpc: "management",
              },
              {
                tgw: "transit-gateway",
                vpc: "workload",
              },
            ],
          },
        ],
        virtual_private_endpoints: [
          {
            name: "management-cos",
            service: "cos",
            vpc: "management",
            resource_group: "management-rg",
            security_groups: ["management-vpe"],
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
            instance: null,
          },
          {
            name: "workload-cos",
            service: "cos",
            vpc: "workload",
            resource_group: "workload-rg",
            security_groups: ["workload-vpe"],
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
            instance: null,
          },
        ],
        vpcs: [
          {
            name: "edge",
            public_gateways: [],
            acls: [
              {
                resource_group: "edge-rg",
                name: "edge",
                vpc: "edge",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "edge",
                    acl: "edge",
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "edge",
                    acl: "edge",
                  },
                  {
                    action: "allow",
                    destination: "0.0.0.0/0",
                    direction: "outbound",
                    name: "allow-all-outbound",
                    source: "0.0.0.0/0",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "edge",
                    acl: "edge",
                  },
                ],
              },
              {
                resource_group: "edge-rg",
                name: "f5-external",
                vpc: "edge",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "edge",
                    acl: "f5-external",
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "edge",
                    acl: "f5-external",
                  },
                  {
                    action: "allow",
                    destination: "0.0.0.0/0",
                    direction: "outbound",
                    name: "allow-all-outbound",
                    source: "0.0.0.0/0",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "edge",
                    acl: "f5-external",
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-f5-external-443-inbound",
                    source: "0.0.0.0/0",
                    tcp: {
                      port_max: 443,
                      port_min: 443,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "edge",
                    acl: "f5-external",
                  },
                ],
              },
            ],
            subnets: [
              {
                name: "f5-bastion-zone-1",
                network_acl: "edge",
                cidr: "10.5.60.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 1,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-external-zone-1",
                network_acl: "f5-external",
                cidr: "10.5.40.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 1,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-management-zone-1",
                network_acl: "edge",
                cidr: "10.5.30.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 1,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-workload-zone-1",
                network_acl: "edge",
                cidr: "10.5.50.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 1,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpe-zone-1",
                network_acl: "edge",
                cidr: "10.5.70.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 1,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpn-1-zone-1",
                network_acl: "edge",
                cidr: "10.5.10.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 1,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpn-2-zone-1",
                network_acl: "edge",
                cidr: "10.5.20.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 1,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-bastion-zone-2",
                network_acl: "edge",
                cidr: "10.6.60.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 2,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-external-zone-2",
                network_acl: "f5-external",
                cidr: "10.6.40.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 2,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-management-zone-2",
                network_acl: "edge",
                cidr: "10.6.30.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 2,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-workload-zone-2",
                network_acl: "edge",
                cidr: "10.6.50.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 2,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpe-zone-2",
                network_acl: "edge",
                cidr: "10.6.70.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 2,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpn-1-zone-2",
                network_acl: "edge",
                cidr: "10.6.10.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 2,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpn-2-zone-2",
                network_acl: "edge",
                cidr: "10.6.20.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 2,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-bastion-zone-3",
                network_acl: "edge",
                cidr: "10.7.60.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 3,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-external-zone-3",
                network_acl: "f5-external",
                cidr: "10.7.40.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 3,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-management-zone-3",
                network_acl: "edge",
                cidr: "10.7.30.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 3,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "f5-workload-zone-3",
                network_acl: "edge",
                cidr: "10.7.50.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 3,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpe-zone-3",
                network_acl: "edge",
                cidr: "10.7.70.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 3,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpn-1-zone-3",
                network_acl: "edge",
                cidr: "10.7.10.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 3,
                public_gateway: false,
                resource_group: "edge-rg",
              },
              {
                name: "vpn-2-zone-3",
                network_acl: "edge",
                cidr: "10.7.20.0/24",
                has_prefix: false,
                vpc: "edge",
                zone: 3,
                public_gateway: false,
                resource_group: "edge-rg",
              },
            ],
            address_prefixes: [
              {
                vpc: "edge",
                zone: 1,
                cidr: "10.5.0.0/16",
                name: "f5-zone-1",
              },
              {
                vpc: "edge",
                zone: 2,
                cidr: "10.6.0.0/16",
                name: "f5-zone-2",
              },
              {
                vpc: "edge",
                zone: 3,
                cidr: "10.7.0.0/16",
                name: "f5-zone-3",
              },
            ],
            bucket: "edge-bucket",
            manual_address_prefix_management: true,
            cos: "cos",
            classic_access: false,
            default_network_acl_name: null,
            default_routing_table_name: null,
            default_security_group_name: null,
            resource_group: "edge-rg",
            publicGateways: [],
          },
          {
            name: "management",
            public_gateways: [],
            acls: [
              {
                resource_group: "management-rg",
                name: "management",
                vpc: "management",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "management",
                    acl: "management",
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "management",
                    acl: "management",
                  },
                  {
                    action: "allow",
                    destination: "0.0.0.0/0",
                    direction: "outbound",
                    name: "allow-all-outbound",
                    source: "0.0.0.0/0",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "management",
                    acl: "management",
                  },
                ],
              },
            ],
            subnets: [
              {
                name: "vsi-zone-1",
                network_acl: "management",
                cidr: "10.10.10.0/24",
                has_prefix: true,
                vpc: "management",
                zone: 1,
                public_gateway: false,
                resource_group: "management-rg",
              },
              {
                name: "vpe-zone-1",
                network_acl: "management",
                cidr: "10.10.20.0/24",
                has_prefix: true,
                vpc: "management",
                zone: 1,
                public_gateway: false,
                resource_group: "management-rg",
              },
              {
                name: "vpn-zone-1",
                network_acl: "management",
                cidr: "10.10.30.0/24",
                has_prefix: true,
                vpc: "management",
                zone: 1,
                public_gateway: false,
                resource_group: "management-rg",
              },
              {
                name: "vsi-zone-2",
                network_acl: "management",
                cidr: "10.20.10.0/24",
                has_prefix: true,
                vpc: "management",
                zone: 2,
                public_gateway: false,
                resource_group: "management-rg",
              },
              {
                name: "vpe-zone-2",
                network_acl: "management",
                cidr: "10.20.20.0/24",
                has_prefix: true,
                vpc: "management",
                zone: 2,
                public_gateway: false,
                resource_group: "management-rg",
              },
              {
                name: "vsi-zone-3",
                network_acl: "management",
                cidr: "10.30.10.0/24",
                has_prefix: true,
                vpc: "management",
                zone: 3,
                public_gateway: false,
                resource_group: "management-rg",
              },
              {
                name: "vpe-zone-3",
                network_acl: "management",
                cidr: "10.30.20.0/24",
                has_prefix: true,
                vpc: "management",
                zone: 3,
                public_gateway: false,
                resource_group: "management-rg",
              },
            ],
            address_prefixes: [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                zone: 2,
                vpc: "management",
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                zone: 2,
                vpc: "management",
              },
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                zone: 3,
                vpc: "management",
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                zone: 3,
                vpc: "management",
              },
            ],
            bucket: "management-bucket",
            manual_address_prefix_management: true,
            cos: "cos",
            classic_access: false,
            default_network_acl_name: null,
            default_routing_table_name: null,
            default_security_group_name: null,
            resource_group: "management-rg",
            publicGateways: [],
          },
          {
            name: "workload",
            public_gateways: [],
            acls: [
              {
                resource_group: "workload-rg",
                name: "workload",
                vpc: "workload",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "workload",
                    acl: "workload",
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "workload",
                    acl: "workload",
                  },
                  {
                    action: "allow",
                    destination: "0.0.0.0/0",
                    direction: "outbound",
                    name: "allow-all-outbound",
                    source: "0.0.0.0/0",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    vpc: "workload",
                    acl: "workload",
                  },
                ],
              },
            ],
            subnets: [
              {
                name: "vsi-zone-1",
                network_acl: "workload",
                cidr: "10.40.10.0/24",
                has_prefix: true,
                vpc: "workload",
                zone: 1,
                public_gateway: false,
                resource_group: "workload-rg",
              },
              {
                name: "vpe-zone-1",
                network_acl: "workload",
                cidr: "10.40.20.0/24",
                has_prefix: true,
                vpc: "workload",
                zone: 1,
                public_gateway: false,
                resource_group: "workload-rg",
              },
              {
                name: "vsi-zone-2",
                network_acl: "workload",
                cidr: "10.50.10.0/24",
                has_prefix: true,
                vpc: "workload",
                zone: 2,
                public_gateway: false,
                resource_group: "workload-rg",
              },
              {
                name: "vpe-zone-2",
                network_acl: "workload",
                cidr: "10.50.20.0/24",
                has_prefix: true,
                vpc: "workload",
                zone: 2,
                public_gateway: false,
                resource_group: "workload-rg",
              },
              {
                name: "vsi-zone-3",
                network_acl: "workload",
                cidr: "10.60.10.0/24",
                has_prefix: true,
                vpc: "workload",
                zone: 3,
                public_gateway: false,
                resource_group: "workload-rg",
              },
              {
                name: "vpe-zone-3",
                network_acl: "workload",
                cidr: "10.60.20.0/24",
                has_prefix: true,
                vpc: "workload",
                zone: 3,
                public_gateway: false,
                resource_group: "workload-rg",
              },
            ],
            address_prefixes: [
              {
                name: "vsi-zone-1",
                cidr: "10.40.10.0/24",
                zone: 1,
                vpc: "workload",
              },
              {
                name: "vpe-zone-1",
                cidr: "10.40.20.0/24",
                zone: 1,
                vpc: "workload",
              },
              {
                name: "vsi-zone-2",
                cidr: "10.50.10.0/24",
                zone: 2,
                vpc: "workload",
              },
              {
                name: "vpe-zone-2",
                cidr: "10.50.20.0/24",
                zone: 2,
                vpc: "workload",
              },
              {
                name: "vsi-zone-3",
                cidr: "10.60.10.0/24",
                zone: 3,
                vpc: "workload",
              },
              {
                name: "vpe-zone-3",
                cidr: "10.60.20.0/24",
                zone: 3,
                vpc: "workload",
              },
            ],
            bucket: "workload-bucket",
            manual_address_prefix_management: true,
            cos: "cos",
            classic_access: false,
            default_network_acl_name: null,
            default_routing_table_name: null,
            default_security_group_name: null,
            resource_group: "workload-rg",
            publicGateways: [],
          },
        ],
        vpn_gateways: [
          {
            name: "management-gateway",
            resource_group: "management-rg",
            subnet: "vpn-zone-1",
            vpc: "management",
          },
        ],
        vpn_servers: [],
        vsi: [
          {
            kms: "kms",
            encryption_key: "slz-vsi-volume-key",
            image: "ibm-ubuntu-22-04-1-minimal-amd64-1",
            profile: "cx2-4x8",
            name: "management-server",
            security_groups: ["management-vsi"],
            ssh_keys: ["ssh-key"],
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc: "management",
            vsi_per_subnet: 1,
            resource_group: "management-rg",
            override_vsi_name: null,
            user_data: "",
            network_interfaces: [],
            volumes: [],
          },
          {
            kms: "kms",
            encryption_key: "slz-vsi-volume-key",
            image: "ibm-centos-7-9-minimal-amd64-11",
            image_name:
              "CentOS 7.x - Minimal Install (amd64) [ibm-centos-7-9-minimal-amd64-11]",
            profile: "cx2-4x8",
            name: "workload-server",
            security_groups: ["workload-vsi"],
            ssh_keys: ["ssh-key"],
            vpc: "workload",
            vsi_per_subnet: 1,
            resource_group: "workload-rg",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            volumes: [],
            subnet: "",
            enable_floating_ip: false,
          },
        ],
        classic_ssh_keys: [],
        classic_vlans: [],
      };
      delete data.ssh_keys[0]; // remove extra ssh key that should not be there lol
      craig.hardSetJson(data);
      assert.deepEqual(
        craig.store.edge_vpc_name,
        "edge",
        "it should update name"
      );
      assert.deepEqual(
        craig.store.edge_zones,
        3,
        "it should set correct number of zones"
      );
    });
    it("should set JSON data if valid with advanced subnet tiers", () => {
      let data = require("../data-files/craig-json.json");
      data.vpcs[0].subnets.forEach((subnet) => {
        if (subnet.name.indexOf("vsi-zone") !== -1) {
          subnet.tier = "frog";
        }
      });
      craig.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      craig.hardSetJson(data);
      assert.deepEqual(craig.store.json, data, "it should set the store");
      assert.deepEqual(
        craig.store.subnetTiers,
        {
          management: [
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
            {
              name: "frog",
              zones: undefined,
              select_zones: [1, 2, 3],
              advanced: true,
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should set JSON data if not valid but slz", () => {
      craig.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      craig.hardSetJson({}, true);
      assert.deepEqual(
        craig.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpn", zones: 1 },
            { name: "vpe", zones: 3 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should convert permitted networks to vpcs on hard set", () => {
      craig.setUpdateCallback(() => {});
      json.dns.push({
        name: "dns",
        resource_group: "management-rg",
        zones: [],
        records: [],
        custom_resolvers: [],
      });
      json.dns[0].zones.push({
        name: "hi",
        permitted_networks: ["management"],
      });
      craig.hardSetJson({ ...json });
      assert.deepEqual(craig.store.json.dns[0].zones[0], {
        instance: "dns",
        name: "hi",
        vpcs: ["management"],
      });
    });
    it("should not convert anything if permitted networks doesn't exist", () => {
      json._options.dynamic_subnets = true;
      craig.setUpdateCallback(() => {});
      json.dns.push({
        name: "dns",
        resource_group: "management-rg",
        zones: [],
        records: [],
        custom_resolvers: [],
      });
      json.dns[0].zones.push({
        name: "hi",
        vpcs: ["management"],
      });
      craig.hardSetJson({ ...json });
      assert.deepEqual(craig.store.json.dns[0].zones[0], {
        instance: "dns",
        name: "hi",
        vpcs: ["management"],
      });
      assert.isTrue(
        craig.store.json._options.dynamic_subnets,
        "it should be true"
      );
    });
    it("should set JSON data if valid", () => {
      craig.store = {
        json: {},
      };
      craig.setUpdateCallback(() => {});
      craig.hardSetJson({ ...brokenSubnets });
      assert.deepEqual(
        craig.store.subnetTiers,
        {
          vpc: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
  });
  describe("getAllRuleNames", () => {
    it("should return empty array if no params", () => {
      assert.deepEqual(
        craig.getAllRuleNames(),
        [],
        "it should return an empty array"
      );
    });
    it("should return the names of all rules in a security group when no source acl name", () => {
      assert.deepEqual(
        craig.getAllRuleNames("management-vpe"),
        [
          "allow-ibm-inbound",
          "allow-vpc-inbound",
          "allow-vpc-outbound",
          "allow-ibm-tcp-53-outbound",
          "allow-ibm-tcp-80-outbound",
          "allow-ibm-tcp-443-outbound",
        ],
        "it should return correct rule names"
      );
    });
    it("should return the names of all rules in an acl when two params are passed", () => {
      assert.deepEqual(
        craig.getAllRuleNames("management", "management"),
        [
          "allow-ibm-inbound",
          "allow-ibm-outbound",
          "allow-all-network-inbound",
          "allow-all-network-outbound",
        ],
        "it should return correct rule names"
      );
    });
  });
  describe("getAllOtherGroups", () => {
    it("should return empty array if rule source is null or empty string", () => {
      assert.deepEqual(
        craig.getAllOtherGroups({ ruleSource: "" }),
        [],
        "it should return empty array"
      );
    });
    it("should return all other acl names if rule source and isAclForm", () => {
      assert.deepEqual(
        craig.getAllOtherGroups(
          { ruleSource: "management" },
          { isAclForm: true }
        ),
        ["workload"],
        "it should return empty array"
      );
    });
    it("should return all other security groups if rule source and not isAclForm", () => {
      assert.deepEqual(
        craig.getAllOtherGroups(
          { ruleSource: "management-vpe" },
          { isAclForm: false }
        ),
        ["workload-vpe", "management-vsi"],
        "it should return empty array"
      );
    });
  });
  describe("getAllResourceKeys", () => {
    it("should get a list of keys from the default pattern", () => {
      assert.deepEqual(
        craig.getAllResourceKeys(),
        [
          {
            cos: "atracker-cos",
            key: "cos-bind-key",
            ref: "ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key",
          },
        ],
        "it should return correct data"
      );
      craig.store.json.appid = [
        {
          name: "default",
          keys: [
            { name: "test", appid: "default", resource_group: "service-rg" },
          ],
          resource_group: null,
        },
      ];
      assert.deepEqual(
        craig.getAllResourceKeys()[1],

        {
          appid: "default",
          key: "test",
          ref: "ibm_resource_key.default_key_test",
        },

        "it should return correct data with appid"
      );
      craig.store.json.logdna = {
        plan: "lite",
        platform_logs: true,
        resource_group: "service-rg",
        enabled: true,
      };
      craig.store.json.sysdig = {
        plan: "lite",
        resource_group: "service-rg",
        enabled: true,
      };
      assert.deepEqual(
        craig.getAllResourceKeys(),
        [
          {
            cos: "atracker-cos",
            key: "cos-bind-key",
            ref: "ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key",
          },
          {
            appid: "default",
            key: "test",
            ref: "ibm_resource_key.default_key_test",
          },
          {
            ref: "ibm_resource_key.logdna_key",
            key: "logdna-key",
          },
          {
            ref: "ibm_resource_key.sysdig_key",
            key: "sysdig-key",
          },
        ],
        "it should return correct data with appid"
      );
    });
  });
});
