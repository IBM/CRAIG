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

describe("automate schema generation", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("buildFieldSchema", () => {
    it("should return the correct schema for resource groups", () => {
      let expectedData = {
        resource_groups: {
          Array: {
            use_prefix: {
              type: "boolean",
              default: true,
            },
            name: {
              type: "string",
              default: null,
            },
            use_data: {
              type: "boolean",
              default: false,
            },
          },
        },
      };
      let actualData = craig.buildFieldSchema("resource_groups");
      assert.deepEqual(actualData, expectedData, "it should return schema");
    });
    it("should return correct schema for key management", () => {
      let expectedData = {
        key_management: {
          Array: {
            authorize_vpc_reader_role: {
              type: "boolean",
              default: true,
            },
            name: {
              default: null,
              type: "string",
            },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            use_data: {
              type: "boolean",
              default: false,
            },
            use_hs_crypto: {
              type: "boolean",
              default: false,
            },
            keys: {
              Array: {
                dual_auth_delete: {
                  default: false,
                  type: "boolean",
                },
                endpoint: {
                  type: "string",
                  default: null,
                  groups: ["public", "private"],
                },
                force_delete: {
                  type: "boolean",
                  default: false,
                },
                key_ring: {
                  default: null,
                  type: "string",
                },
                name: {
                  default: null,
                  type: "string",
                },
                root_key: {
                  default: true,
                  type: "boolean",
                },
                rotation: {
                  default: "1",
                  groups: [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                  ],
                  type: "string",
                },
              },
            },
          },
        },
      };
      let actualData = craig.buildFieldSchema("key_management");
      assert.deepEqual(actualData, expectedData, "it should return schema");
    });
    it("should return correct schema for object storage", () => {
      let expectedData = {
        object_storage: {
          Array: {
            use_data: { type: "boolean", default: false },
            use_random_suffix: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            kms: { type: "string", default: null, groups: "<calculated>" },
            plan: {
              type: "string",
              default: null,
              groups: [
                "standard",
                "lite",
                "cos-one-rate-plan",
                "cos-satellite-12tb-plan",
                "cos-satellite-24tb-plan",
                "cos-satellite-48tb-plan",
                "cos-satellite-96tb-plan",
              ],
            },
            buckets: {
              Array: {
                name: { type: "string", default: null },
                storage_class: {
                  type: "string",
                  default: null,
                  groups: ["standard", "vault", "storage", "smart"],
                },
                kms_key: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                force_delete: { type: "boolean", default: false },
                read_data_events: { type: "boolean", default: false },
                write_data_events: { type: "boolean", default: false },
                activity_tracking: { type: "boolean", default: false },
                activity_tracking_crn: { type: "string", default: null },
                metrics_monitoring: { type: "boolean", default: false },
                usage_metrics_enabled: { type: "boolean", default: false },
                request_metrics_enabled: { type: "boolean", default: false },
                metrics_monitoring_crn: { type: "string", default: null },
              },
            },
            keys: {
              Array: {
                name: { type: "string", default: null },
                role: {
                  type: "string",
                  default: null,
                  groups: [
                    "Object Writer",
                    "Object Reader",
                    "Content Reader",
                    "Reader",
                    "Writer",
                    "Manager",
                  ],
                },
                enable_hmac: { type: "boolean", default: true },
              },
            },
          },
        },
      };
      let actualData = craig.buildFieldSchema("object_storage");
      assert.deepEqual(actualData, expectedData, "it should return schema");
    });
    it("should return correct schema for iam account settings", () => {
      let expectedData = {
        iam_account_settings: {
          object: {
            enable: { type: "boolean", default: false },
            mfa: {
              type: "string",
              default: null,
              groups: [
                "NONE",
                "TOTP",
                "TOTP4ALL",
                "Email-Based MFA",
                "TOTP MFA",
                "U2F MFA",
              ],
            },
            allowed_ip_addresses: { type: "string", default: null },
            include_history: { type: "boolean", default: false },
            if_match: { type: "string", default: null },
            max_sessions_per_identity: { type: "string", default: null },
            restrict_create_service_id: {
              type: "string",
              default: null,
              groups: ["Unset", "Yes", "No"],
            },
            restrict_create_platform_apikey: {
              type: "string",
              default: null,
              groups: ["Unset", "Yes", "No"],
            },
            session_expiration_in_seconds: { type: "string", default: null },
            session_invalidation_in_seconds: { type: "string", default: null },
          },
        },
      };
      let actualData = craig.buildFieldSchema("iam_account_settings");
      assert.deepEqual(actualData, expectedData, "it should return schema");
    });
  });
  describe("buildSchema", () => {
    it("should build a full schema", () => {
      let expectedData = {
        _options: {
          object: {
            fs_cloud: { type: "boolean", default: false },
            prefix: { type: "string", default: "iac" },
            region: { type: "string", default: null, groups: "<calculated>" },
            zones: { type: "string", default: "3", groups: ["1", "2", "3"] },
            endpoints: {
              type: "string",
              default: "Private",
              groups: ["private", "public", "public-and-private"],
            },
            account_id: { type: "string", default: null },
            dynamic_subnets: { type: "boolean", default: true },
            enable_power_vs: { type: "boolean", default: false },
            power_vs_high_availability: { type: "boolean", default: false },
            power_vs_ha_zone_1: {
              type: "string",
              default: null,
              groups: ["mad02", "mad04", "us-east", "wdc06", "wdc07"],
            },
            power_vs_ha_zone_2: {
              type: "string",
              default: null,
              groups: ["eu-de-1", "eu-de-2", "us-south", "dal10", "dal12"],
            },
            power_vs_zones: { type: "Array", default: [] },
            enable_classic: { type: "boolean", default: false },
            tags: { type: "Array", default: ["hello", "world"] },
            manual_power_vsi_naming: {
              default: false,
              type: "boolean",
            },
            no_vpn_secrets_manager_auth: { type: "boolean", default: false },
          },
        },
        access_groups: {
          Array: {
            name: { type: "string", default: null },
            description: { type: "string", default: null },
            policies: {
              Array: {
                name: { type: "string", default: null },
                resource: { type: "string", default: null },
                resource_group: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                resource_instance_id: { type: "string", default: null },
                service: { type: "string", default: null },
                resource_type: { type: "string", default: null },
              },
            },
            dynamic_policies: {
              Array: {
                name: { type: "string", default: null },
                identity_provider: { type: "string", default: null },
                expiration: {
                  type: "string",
                  default: "24",
                  groups: [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "13",
                    "14",
                    "15",
                    "16",
                    "17",
                    "18",
                    "19",
                    "20",
                    "21",
                    "22",
                    "23",
                    "24",
                  ],
                },
                conditions: { type: "string", default: {} },
                claim: { type: "string", default: null },
                operator: {
                  type: "string",
                  default: null,
                  groups: [
                    "Equals",
                    "Equals (Ignore Case)",
                    "In",
                    "Not Equals (Ignore Case)",
                    "Not Equals",
                    "Contains",
                  ],
                },
                value: { type: "string", default: null },
              },
            },
          },
        },
        appid: {
          Array: {
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            encryption_key: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            keys: { Array: { name: { type: "string", default: null } } },
          },
        },
        atracker: {
          object: {
            enabled: { type: "boolean", default: true },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            type: { type: "string", default: null },
            target_name: { type: "string", default: null },
            bucket: { type: "string", default: null, groups: "<calculated>" },
            cos_key: { type: "string", default: null, groups: "<calculated>" },
            add_route: { type: "boolean", default: false },
            locations: { type: "Array", default: [] },
            instance: { type: "boolean", default: false },
            plan: {
              type: "string",
              default: "lite",
              groups: ["lite", "7-day", "14-day", "30-day"],
            },
            archive: { type: "boolean", default: false },
          },
        },
        cbr_rules: {
          Array: {
            name: { type: "string", default: null },
            description: { type: "string", default: null },
            api_type_id: { type: "string", default: null },
            enforcement_mode: {
              type: "string",
              default: "Enabled",
              groups: "<calculated>",
            },
            contexts: {
              Array: {
                name: { type: "string", default: null },
                value: { type: "string", default: null },
              },
            },
            resource_attributes: {
              Array: {
                name: { type: "string", default: null },
                value: { type: "string", default: null },
              },
            },
            tags: {
              Array: {
                name: { type: "string", default: null },
                value: { type: "string", default: null },
                operator: { type: "string", default: null },
              },
            },
          },
        },
        cbr_zones: {
          Array: {
            name: { type: "string", default: null },
            description: { type: "string", default: null },
            account_id: { type: "string", default: null },
            addresses: {
              Array: {
                name: { type: "string", default: null },
                account_id: { type: "string", default: null },
                location: { type: "string", default: null },
                service_name: { type: "string", default: null },
                service_type: { type: "string", default: null },
                service_instance: { type: "string", default: null },
                type: {
                  type: "string",
                  default: "ipAddress",
                  groups: [
                    "ipAddress",
                    "ipRange",
                    "subnet",
                    "vpc",
                    "serviceRef",
                  ],
                },
                value: { type: "string", default: null },
              },
            },
            exclusions: {
              Array: {
                name: { type: "string", default: null },
                account_id: { type: "string", default: null },
                location: { type: "string", default: null },
                service_name: { type: "string", default: null },
                service_type: { type: "string", default: null },
                service_instance: { type: "string", default: null },
                type: {
                  type: "string",
                  default: "ipAddress",
                  groups: [
                    "ipAddress",
                    "ipRange",
                    "subnet",
                    "vpc",
                    "serviceRef",
                  ],
                },
                value: { type: "string", default: null },
              },
            },
          },
        },
        cis: {
          Array: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            plan: {
              type: "string",
              default: null,
              groups: [
                "standard-next",
                "trial",
                "enterprise-advanced",
                "enterprise-essential",
                "enterprise-package",
                "enterprise-premier",
                "enterprise-usage",
                "global-load-balancer",
                "security",
              ],
            },
            domains: {
              Array: {
                domain: { type: "string", default: null },
                type: {
                  type: "string",
                  default: null,
                  groups: ["full", "partial"],
                },
              },
            },
            dns_records: {
              Array: {
                name: { type: "string", default: null },
                type: {
                  type: "string",
                  default: null,
                  groups: [
                    "A",
                    "AAAA",
                    "CNAME",
                    "NS",
                    "MX",
                    "TXT",
                    "CAA",
                    "PTR",
                  ],
                },
                domain: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                ttl: { type: "string", default: null },
                content: { type: "string", default: null },
              },
            },
          },
        },
        cis_glbs: {
          Array: {
            name: { type: "string", default: null },
            cis: { type: "string", default: null, groups: "<calculated>" },
            enabled: { type: "boolean", default: true },
            description: { type: "string", default: null },
            minimum_origins: { type: "string", default: "1" },
            notification_email: { type: "string", default: null },
            origins: {
              Array: {
                name: { type: "string", default: null },
                address: { type: "string", default: null },
                enabled: { type: "boolean", default: true },
              },
            },
            glbs: {
              Array: {
                domain: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                fallback_pool: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                default_pools: { type: "Array", default: [] },
                enabled: { type: "boolean", default: true },
                proxied: { type: "boolean", default: false },
                ttl: { type: "string", default: null },
                name: { type: "string", default: null },
              },
            },
            health_checks: {
              Array: {
                name: { type: "string", default: null },
                allow_insecure: { type: "boolean", default: false },
                follow_redirects: { type: "boolean", default: false },
                expected_codes: { type: "string", default: null },
                method: {
                  type: "string",
                  default: null,
                  groups: ["GET", "PUT", "POST", "PATCH", "DELETE"],
                },
                timeout: { type: "string", default: null },
                interval: { type: "string", default: null },
                path: { type: "string", default: null },
                port: { type: "string", default: null },
                type: {
                  type: "string",
                  default: null,
                  groups: ["http", "https"],
                },
                retries: { type: "string", default: null },
              },
            },
          },
        },
        classic_bare_metal: {
          Array: {
            name: { type: "string", default: null },
            domain: { type: "string", default: null },
            datacenter: {
              type: "string",
              default: null,
              groups: [
                "dal10",
                "dal12",
                "eu-de-1",
                "eu-de-2",
                "lon04",
                "lon06",
                "osa21",
                "sao01",
                "syd04",
                "syd05",
                "tok04",
                "tor01",
                "us-east",
                "us-south",
                "wdc06",
                "wdc07",
              ],
            },
            os_key_name: { type: "string", default: null },
            package_key_name: { type: "string", default: null },
            process_key_name: { type: "string", default: null },
            memory: { type: "string", default: null },
            network_speed: { type: "string", default: null },
            disk_key_names: { type: "Array", default: [] },
            private_network_only: { type: "boolean", default: false },
            private_vlan: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            public_vlan: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            public_bandwidth: { type: "string", default: null },
          },
        },
        classic_gateways: {
          Array: {
            name: { type: "string", default: null },
            domain: { type: "string", default: null },
            datacenter: {
              type: "string",
              default: null,
              groups: [
                "dal10",
                "dal12",
                "eu-de-1",
                "eu-de-2",
                "lon04",
                "lon06",
                "osa21",
                "sao01",
                "syd04",
                "syd05",
                "tok04",
                "tor01",
                "us-east",
                "us-south",
                "wdc06",
                "wdc07",
              ],
            },
            network_speed: {
              type: "string",
              default: null,
              groups: ["1000", "10000"],
            },
            public_bandwidth: {
              type: "string",
              default: null,
              groups: ["500", "1000", "5000", "10000", "20000"],
            },
            memory: { type: "string", default: "64" },
            package_key_name: {
              type: "string",
              default: null,
              groups: ["VIRTUAL_ROUTER_APPLIANCE_1_GPBS"],
            },
            os_key_name: {
              type: "string",
              default: null,
              groups: ["OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV"],
            },
            process_key_name: {
              type: "string",
              default: null,
              groups: ["INTEL_XEON_4210_2_20"],
            },
            private_vlan: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            ssh_key: { type: "string", default: null, groups: "<calculated>" },
            public_vlan: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            disk_key_names: { type: "Array", default: [] },
            private_network_only: { type: "boolean", default: false },
            tcp_monitoring: { type: "boolean", default: false },
            redundant_network: { type: "boolean", default: false },
            ipv6_enabled: { type: "boolean", default: false },
            hadr: { type: "boolean", default: false },
          },
        },
        classic_security_groups: {
          Array: {
            name: { type: "string", default: null },
            description: { type: "string", default: null },
            classic_sg_rules: {
              Array: {
                name: { type: "string", default: null },
                direction: {
                  type: "string",
                  default: null,
                  groups: ["inbound", "outbound"],
                },
                ruleProtocol: {
                  type: "string",
                  default: "all",
                  groups: ["all", "icmp", "tcp", "udp"],
                },
                port_range_min: { type: "string", default: null },
                port_range_max: { type: "string", default: null },
              },
            },
          },
        },
        classic_ssh_keys: {
          Array: {
            name: { type: "string", default: null },
            public_key: { type: "string", default: null },
          },
        },
        classic_vlans: {
          Array: {
            name: { type: "string", default: null },
            type: {
              type: "string",
              default: null,
              groups: ["PUBLIC", "PRIVATE"],
            },
            datacenter: {
              type: "string",
              default: null,
              groups: [
                "dal10",
                "dal12",
                "eu-de-1",
                "eu-de-2",
                "lon04",
                "lon06",
                "osa21",
                "sao01",
                "syd04",
                "syd05",
                "tok04",
                "tor01",
                "us-east",
                "us-south",
                "wdc06",
                "wdc07",
              ],
            },
            router_hostname: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
          },
        },
        classic_vsi: {
          Array: {
            name: { type: "string", default: null },
            domain: { type: "string", default: null },
            datacenter: {
              type: "string",
              default: null,
              groups: [
                "dal10",
                "dal12",
                "eu-de-1",
                "eu-de-2",
                "lon04",
                "lon06",
                "osa21",
                "sao01",
                "syd04",
                "syd05",
                "tok04",
                "tor01",
                "us-east",
                "us-south",
                "wdc06",
                "wdc07",
              ],
            },
            private_vlan: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            public_vlan: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            cores: { type: "string", default: null },
            memory: { type: "string", default: null },
            image_id: { type: "string", default: null },
            network_speed: { type: "string", default: "100" },
            local_disk: { type: "boolean", default: null },
            private_network_only: { type: "boolean", default: false },
            ssh_keys: { type: "Array", default: [] },
            private_security_groups: { type: "Array", default: [] },
            public_security_groups: { type: "Array", default: [] },
          },
        },
        clusters: {
          Array: {
            kube_type: {
              type: "string",
              default: null,
              groups: ["openshift", "iks"],
            },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            cos: { type: "string", default: null, groups: "<calculated>" },
            entitlement: {
              type: "string",
              default: "null",
              groups: ["null", "cloud_pak"],
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            subnets: { type: "Array", default: [] },
            workers_per_subnet: {
              type: "string",
              default: "1",
              groups: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            },
            flavor: { type: "string", default: null },
            update_all_workers: { type: "boolean", default: false },
            encryption_key: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            kube_version: { type: "string", default: null },
            private_endpoint: { type: "boolean", default: false },
            worker_pools: {
              Array: {
                name: { type: "string", default: null },
                flavor: { type: "string", default: null },
                subnets: { type: "Array", default: [] },
                workers_per_subnet: {
                  type: "string",
                  default: "1",
                  groups: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                },
                entitlement: {
                  type: "string",
                  default: "null",
                  groups: ["null", "cloud_pak"],
                },
              },
            },
            opaque_secrets: {
              Array: {
                name: { type: "string", default: null },
                namespace: { type: "string", default: null },
                persistence: { type: "boolean", default: false },
                secrets_group: { type: "string", default: null },
                arbitrary_secret_name: { type: "string", default: null },
                username_password_secret_name: {
                  type: "string",
                  default: null,
                },
                labels: { type: "Array", default: [] },
                secrets_manager: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                arbitrary_secret_data: { type: "string", default: null },
                username_password_secret_username: {
                  type: "string",
                  default: null,
                },
                username_password_secret_password: {
                  type: "string",
                  default: null,
                },
                expiration_date: { type: "string", default: null },
                username_password_secret_description: {
                  type: "string",
                  default: null,
                },
                arbitrary_secret_description: { type: "string", default: null },
                auto_rotate: { type: "boolean", default: false },
                interval: { type: "string", default: "1" },
                unit: {
                  type: "string",
                  default: "day",
                  groups: ["day", "month"],
                },
              },
            },
          },
        },
        dns: {
          Array: {
            name: { type: "string", default: null },
            plan: {
              type: "string",
              default: "free",
              groups: ["free", "standard"],
            },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            zones: {
              Array: {
                name: { type: "string", default: null },
                vpcs: { type: "Array", default: [] },
                label: { type: "string", default: null },
                description: { type: "string", default: null },
              },
            },
            records: {
              Array: {
                use_vsi: { type: "boolean", default: false },
                vpc: { type: "string", default: null, groups: "<calculated>" },
                vsi: { type: "string", default: null, groups: "<calculated>" },
                name: { type: "string", default: null },
                dns_zone: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                rdata: { type: "string", default: null },
                ttl: { type: "string", default: null },
                type: {
                  type: "string",
                  default: null,
                  groups: ["A", "AAAA", "CNAME", "PTR", "TXT", "MX", "SRV"],
                },
                preference: { type: "string", default: null },
                port: { type: "string", default: null },
                protocol: {
                  type: "string",
                  default: null,
                  groups: ["TCP", "UDP"],
                },
                priority: { type: "string", default: null },
                service: { type: "string", default: null },
                weight: { type: "string", default: null },
              },
            },
            custom_resolvers: {
              Array: {
                name: { type: "string", default: null },
                vpc: { type: "string", default: null, groups: "<calculated>" },
                subnets: { type: "Array", default: [] },
                description: { type: "string", default: null },
              },
            },
          },
        },
        event_streams: {
          Array: {
            name: { type: "string", default: null },
            plan: {
              type: "string",
              default: "lite",
              groups: ["lite", "standard", "enterprise"],
            },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            throughput: {
              type: "string",
              default: null,
              groups: ["150MB/s", "300MB/s", "450MB/s"],
            },
            storage_size: {
              type: "string",
              default: null,
              groups: ["2TB", "4TB", "6TB", "8TB", "10TB", "12TB"],
            },
            private_ip_allowlist: { type: "string", default: null },
            endpoints: { type: "string", default: null },
          },
        },
        fortigate_vnf: {
          Array: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            primary_subnet: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            secondary_subnet: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            profile: { type: "string", default: null },
            security_groups: { type: "Array", default: [] },
            ssh_keys: { type: "Array", default: [] },
          },
        },
        iam_account_settings: {
          object: {
            enable: { type: "boolean", default: false },
            mfa: {
              type: "string",
              default: null,
              groups: [
                "NONE",
                "TOTP",
                "TOTP4ALL",
                "Email-Based MFA",
                "TOTP MFA",
                "U2F MFA",
              ],
            },
            allowed_ip_addresses: { type: "string", default: null },
            include_history: { type: "boolean", default: false },
            if_match: { type: "string", default: null },
            max_sessions_per_identity: { type: "string", default: null },
            restrict_create_service_id: {
              type: "string",
              default: null,
              groups: ["Unset", "Yes", "No"],
            },
            restrict_create_platform_apikey: {
              type: "string",
              default: null,
              groups: ["Unset", "Yes", "No"],
            },
            session_expiration_in_seconds: { type: "string", default: null },
            session_invalidation_in_seconds: { type: "string", default: null },
          },
        },
        icd: {
          Array: {
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            service: {
              type: "string",
              default: null,
              groups: [
                "databases-for-postgresql",
                "databases-for-etcd",
                "databases-for-redis",
                "databases-for-mongodb",
                "databases-for-mysql",
              ],
            },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            plan: {
              type: "string",
              default: "standard",
              groups: "<calculated>",
            },
            group_id: {
              type: "string",
              default: "member",
              groups: "<calculated>",
            },
            memory: { type: "string", default: null },
            disk: { type: "string", default: null },
            cpu: { type: "string", default: null },
            encryption_key: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
          },
        },
        key_management: {
          Array: {
            use_hs_crypto: { type: "boolean", default: false },
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            authorize_vpc_reader_role: { type: "boolean", default: true },
            keys: {
              Array: {
                name: { type: "string", default: null },
                key_ring: { type: "string", default: null },
                endpoint: {
                  type: "string",
                  default: null,
                  groups: ["public", "private"],
                },
                rotation: {
                  type: "string",
                  default: "1",
                  groups: [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                  ],
                },
                force_delete: { type: "boolean", default: false },
                dual_auth_delete: { type: "boolean", default: false },
                root_key: { type: "boolean", default: true },
              },
            },
          },
        },
        load_balancers: {
          Array: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            type: {
              type: "string",
              default: null,
              groups: ["private", "public"],
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            security_groups: { type: "Array", default: [] },
            target_vsi: { type: "Array", default: [] },
            algorithm: {
              type: "string",
              default: null,
              groups: [
                "round_robin",
                "weighted_round_robin",
                "least_connections",
              ],
            },
            protocol: {
              type: "string",
              default: null,
              groups: ["https", "http", "tcp", "udp"],
            },
            health_type: {
              type: "string",
              default: null,
              groups: ["https", "http", "tcp"],
            },
            health_timeout: { type: "string", default: null },
            health_delay: { type: "string", default: null },
            health_retries: { type: "string", default: null },
            listener_port: { type: "string", default: null },
            listener_protocol: {
              type: "string",
              default: null,
              groups: ["https", "http", "tcp", "udp"],
            },
            connection_limit: { type: "string", default: null },
            proxy_protocol: {
              type: "string",
              default: "disabled",
              groups: ["disabled", "v1", "v2"],
            },
            session_persistence_type: {
              type: "string",
              default: null,
              groups: ["source_ip", "app_cookie", "http_cookie"],
            },
            session_persistence_app_cookie_name: {
              type: "string",
              default: null,
            },
            port: { type: "string", default: null },
          },
        },
        logdna: {
          object: {
            name: { type: "string", default: "logdna" },
            enabled: { type: "boolean", default: false },
            plan: {
              type: "string",
              default: null,
              groups: ["lite", "7-day", "14-day", "30-day"],
            },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            bucket: { type: "string", default: null, groups: "<calculated>" },
            archive: { type: "boolean", default: false },
            platform_logs: { type: "boolean", default: false },
          },
        },
        object_storage: {
          Array: {
            use_data: { type: "boolean", default: false },
            use_random_suffix: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            kms: { type: "string", default: null, groups: "<calculated>" },
            plan: {
              type: "string",
              default: null,
              groups: [
                "standard",
                "lite",
                "cos-one-rate-plan",
                "cos-satellite-12tb-plan",
                "cos-satellite-24tb-plan",
                "cos-satellite-48tb-plan",
                "cos-satellite-96tb-plan",
              ],
            },
            buckets: {
              Array: {
                name: { type: "string", default: null },
                storage_class: {
                  type: "string",
                  default: null,
                  groups: ["standard", "vault", "storage", "smart"],
                },
                kms_key: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                force_delete: { type: "boolean", default: false },
                read_data_events: { type: "boolean", default: false },
                write_data_events: { type: "boolean", default: false },
                activity_tracking: { type: "boolean", default: false },
                activity_tracking_crn: { type: "string", default: null },
                metrics_monitoring: { type: "boolean", default: false },
                usage_metrics_enabled: { type: "boolean", default: false },
                request_metrics_enabled: { type: "boolean", default: false },
                metrics_monitoring_crn: { type: "string", default: null },
              },
            },
            keys: {
              Array: {
                name: { type: "string", default: null },
                role: {
                  type: "string",
                  default: null,
                  groups: [
                    "Object Writer",
                    "Object Reader",
                    "Content Reader",
                    "Reader",
                    "Writer",
                    "Manager",
                  ],
                },
                enable_hmac: { type: "boolean", default: true },
              },
            },
          },
        },
        power: {
          Array: {
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            zone: { type: "string", default: null, groups: "<calculated>" },
            imageNames: { type: "string", default: null },
            ssh_keys: {
              Array: {
                name: { type: "string", default: null },
                public_key: { type: "string", default: null },
                use_data: { type: "boolean", default: false },
              },
            },
            network: {
              Array: {
                use_data: { type: "boolean", default: false },
                name: { type: "string", default: null },
                pi_network_type: {
                  type: "string",
                  default: null,
                  groups: ["vlan", "pub-vlan"],
                },
                pi_cidr: { type: "string", default: null },
                pi_dns: { type: "string", default: null },
                pi_network_mtu: { type: "string", default: null },
                pi_network_jumbo: { type: "boolean", default: false },
              },
            },
            cloud_connections: {
              Array: {
                name: { type: "string", default: null },
                pi_cloud_connection_speed: {
                  type: "string",
                  default: null,
                  groups: [
                    "50",
                    "100",
                    "200",
                    "500",
                    "1000",
                    "2000",
                    "5000",
                    "10000",
                  ],
                },
                pi_cloud_connection_global_routing: {
                  type: "boolean",
                  default: false,
                },
                pi_cloud_connection_metered: {
                  type: "boolean",
                  default: false,
                },
                pi_cloud_connection_transit_enabled: {
                  type: "boolean",
                  default: false,
                },
                transit_gateways: { type: "Array", default: [] },
              },
            },
            attachments: {
              Array: { connections: { type: "string", default: null } },
            },
          },
        },
        power_instances: {
          Array: {
            name: { type: "string", default: null },
            sap: { type: "boolean", default: false },
            sap_profile: {
              type: "string",
              default: null,
              groups: [
                "ush1-4x128",
                "ush1-4x256",
                "ush1-4x384",
                "ush1-4x512",
                "ush1-4x768",
                "bh1-16x1600",
                "bh1-20x2000",
                "bh1-22x2200",
                "bh1-25x2500",
                "bh1-30x3000",
                "bh1-35x3500",
                "bh1-40x4000",
                "bh1-50x5000",
                "bh1-60x6000",
                "bh1-70x7000",
                "bh1-80x8000",
                "bh1-100x10000",
                "bh1-120x12000",
                "bh1-140x14000",
                "ch1-60x3000",
                "ch1-70x3500",
                "ch1-80x4000",
                "ch1-100x5000",
                "ch1-120x6000",
                "ch1-140x7000",
                "mh1-8x1440",
                "mh1-10x1800",
                "mh1-12x2160",
                "mh1-16x2880",
                "mh1-20x3600",
                "mh1-22x3960",
                "mh1-25x4500",
                "mh1-30x5400",
                "mh1-35x6300",
                "mh1-40x7200",
                "mh1-50x9000",
                "mh1-60x10800",
                "mh1-70x12600",
                "mh1-80x14400",
                "umh-4x960",
                "umh-6x1440",
                "umh-8x1920",
                "umh-10x2400",
                "umh-12x2880",
                "umh-16x3840",
                "umh-20x4800",
                "umh-22x5280",
                "umh-25x6000",
                "umh-30x7200",
                "umh-35x8400",
                "umh-40x9600",
                "umh-50x12000",
                "umh-60x14400",
              ],
            },
            workspace: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            ip_address: { type: "string", default: null },
            network: { type: "Array", default: [] },
            primary_subnet: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            ssh_key: { type: "string", default: null, groups: "<calculated>" },
            image: { type: "string", default: null, groups: "<calculated>" },
            pi_sys_type: {
              type: "string",
              default: null,
            },
            pi_proc_type: {
              type: "string",
              default: null,
              groups: ["shared", "capped", "dedicated"],
            },
            pi_processors: { type: "string", default: null },
            pi_memory: { type: "string", default: null },
            pi_storage_pool_affinity: { type: "boolean", default: false },
            pi_storage_pool: { type: "string", default: null },
            storage_option: {
              type: "string",
              default: null,
              groups: ["None", "Storage Pool", "Affinity", "Anti-Affinity"],
            },
            pi_storage_type: { type: "string", default: null },
            affinity_type: {
              type: "string",
              default: null,
              groups: ["Instance", "Volume"],
            },
            pi_affinity_policy: { type: "string", default: null },
            pi_affinity_volume: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_affinity_instance: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_anti_affinity_volume: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_anti_affinity_instance: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_license_repository_capacity: { type: "string", default: null },
            pi_ibmi_css: { type: "boolean", default: false },
            pi_ibmi_pha: { type: "boolean", default: false },
            pi_ibmi_rds_users: { type: "string", default: null },
            pi_user_data: { type: "string", default: null },
            pi_pin_policy: {
              type: "string",
              default: "none",
              groups: ["soft", "hard", "none"],
            },
            pi_health_status: {
              type: "string",
              default: "OK",
              groups: ["OK", "WARNING"],
            },
          },
        },
        power_volumes: {
          Array: {
            name: { type: "string", default: null },
            workspace: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_volume_size: { type: "string", default: null },
            storage_option: {
              type: "string",
              default: null,
              groups: ["None", "Storage Pool", "Affinity", "Anti-Affinity"],
            },
            pi_volume_type: { type: "string", default: null },
            affinity_type: {
              type: "string",
              default: null,
              groups: ["Instance", "Volume"],
            },
            pi_volume_pool: { type: "string", default: null },
            pi_affinity_policy: { type: "string", default: null },
            pi_affinity_volume: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_affinity_instance: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_anti_affinity_volume: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_anti_affinity_instance: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_replication_enabled: { type: "boolean", default: false },
            pi_volume_shareable: { type: "boolean", default: false },
            attachments: { type: "string", default: null },
            count: { type: "string", default: null },
          },
        },
        resource_groups: {
          Array: {
            name: { type: "string", default: null },
            use_data: { type: "boolean", default: false },
            use_prefix: { type: "boolean", default: true },
          },
        },
        routing_tables: {
          Array: {
            name: { type: "string", default: null },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            internet_ingress: { type: "boolean", default: false },
            route_direct_link_ingress: { type: "boolean", default: false },
            transit_gateway_ingress: { type: "boolean", default: false },
            route_vpc_zone_ingress: { type: "boolean", default: false },
            accept_routes_from_resource_type: { type: "Array", default: [] },
            advertise_routes_to: { type: "Array", default: [] },
            routes: {
              Array: {
                name: { type: "string", default: null },
                zone: {
                  type: "string",
                  default: null,
                  groups: ["1", "2", "3"],
                },
                action: {
                  type: "string",
                  default: null,
                  groups: ["delegate", "deliver", "delegate_vpc", "drop"],
                },
                advertise: {
                  default: false,
                  type: "boolean",
                },
                next_hop: { type: "string", default: null },
                destination: { type: "string", default: null },
                priority: {
                  default: null,
                  groups: ["0", "1", "2", "3", "4"],
                  type: "string",
                },
              },
            },
          },
        },
        scc: {
          object: {
            collector_description: { type: "string", default: null },
            scope_description: { type: "string", default: null },
          },
        },
        scc_v2: {
          object: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            region: {
              type: "string",
              default: null,
              groups: ["us-south", "us-east", "eu-de"],
            },
            profile_attachments: {
              Array: {
                name: { type: "string", default: null },
                profile: {
                  type: "string",
                  default: null,
                  groups: [
                    "FS Cloud",
                    "Kubernetes Benchmark",
                    "Cloud Internet Services Benchmark",
                  ],
                },
                schedule: {
                  type: "string",
                  default: null,
                  groups: ["daily", "every_7_days", "every_30_days"],
                },
              },
            },
          },
        },
        secrets_manager: {
          Array: {
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            plan: {
              type: "string",
              default: "standard",
              groups: ["standard", "trial"],
            },
            encryption_key: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
          },
        },
        security_groups: {
          Array: {
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            rules: {
              Array: {
                name: { type: "string", default: null },
                source: { type: "string", default: null },
                direction: {
                  type: "string",
                  default: null,
                  groups: ["inbound", "outbound"],
                },
                ruleProtocol: {
                  type: "string",
                  default: "all",
                  groups: ["all", "tcp", "udp", "icmp"],
                },
                port_min: { type: "string", default: null },
                port_max: { type: "string", default: null },
                type: { type: "string", default: null },
                code: { type: "string", default: null },
              },
            },
          },
        },
        ssh_keys: {
          Array: {
            name: { type: "string", default: null },
            public_key: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            use_data: { type: "boolean", default: false },
          },
        },
        sysdig: {
          object: {
            enabled: { type: "boolean", default: false },
            name: { type: "string", default: "sysdig" },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            plan: { type: "string", default: null, groups: ["graduated-tier"] },
            platform_logs: { type: "boolean", default: false },
          },
        },
        transit_gateways: {
          Array: {
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            global: { type: "boolean", default: true },
            crns: { type: "string", default: null },
            connections: { type: "Array", default: [] },
            vpc_connections: { type: "string", default: null },
            power_connections: { type: "string", default: null },
            classic: { type: "boolean", default: false },
            gre_tunnels: {
              Array: {
                gateway: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                zone: {
                  type: "string",
                  default: null,
                  groups: ["1", "2", "3"],
                },
                local_tunnel_ip: { type: "string", default: null },
                remote_tunnel_ip: { type: "string", default: null },
                remote_bgp_asn: { type: "string", default: null },
              },
            },
            prefix_filters: {
              Array: {
                name: { type: "string", default: null },
                connection_type: {
                  type: "string",
                  default: null,
                  groups: ["VPC", "Power VS", "GRE Tunnel"],
                },
                target: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                action: {
                  type: "string",
                  default: null,
                  groups: ["Permit", "Deny"],
                },
                prefix: { type: "string", default: null },
                le: { type: "string", default: "0" },
                ge: { type: "string", default: "0" },
              },
            },
          },
        },
        virtual_private_endpoints: {
          Array: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            service: {
              type: "string",
              default: null,
              groups: ["hpcs", "kms", "cos", "icr", "secrets-manager"],
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            security_groups: { type: "Array", default: [] },
            subnets: { type: "Array", default: [] },
            instance: { type: "string", default: null, groups: "<calculated>" },
          },
        },
        vpcs: {
          Array: {
            use_data: { type: "boolean", default: false },
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            bucket: { type: "string", default: null, groups: "<calculated>" },
            default_network_acl_name: { type: "string", default: null },
            default_security_group_name: { type: "string", default: null },
            default_routing_table_name: { type: "string", default: null },
            pgw_zone_1: { type: "boolean", default: false },
            pgw_zone_2: { type: "boolean", default: false },
            pgw_zone_3: { type: "boolean", default: false },
            classic_access: { type: "boolean", default: null },
            acls: {
              Array: {
                use_data: { type: "boolean", default: false },
                name: { type: "string", default: null },
                resource_group: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                rules: {
                  Array: {
                    name: { type: "string", default: null },
                    source: { type: "string", default: null },
                    action: {
                      type: "string",
                      default: null,
                      groups: ["allow", "deny"],
                    },
                    direction: {
                      type: "string",
                      default: null,
                      groups: ["inbound", "outbound"],
                    },
                    ruleProtocol: {
                      type: "string",
                      default: "all",
                      groups: ["all", "tcp", "udp", "icmp"],
                    },
                    destination: { type: "string", default: null },
                    port_min: { type: "string", default: null },
                    port_max: { type: "string", default: null },
                    source_port_min: { type: "string", default: null },
                    source_port_max: { type: "string", default: null },
                    type: { type: "string", default: null },
                    code: { type: "string", default: null },
                  },
                },
              },
            },
            subnets: {
              Array: {
                name: { type: "string", default: null },
                cidr: { type: "string", default: null },
                network_acl: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                public_gateway: { type: "boolean", default: false },
              },
            },
            subnetTiers: {
              Array: {
                name: { type: "string", default: null },
                zones: { type: "string", default: "3" },
                advanced: { type: "boolean", default: false },
                networkAcl: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                addPublicGateway: { type: "boolean", default: false },
              },
            },
          },
        },
        vpn_gateways: {
          Array: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            subnet: { type: "string", default: null, groups: "<calculated>" },
            policy_mode: { type: "boolean", default: false },
            additional_prefixes: { type: "Array", default: [] },
            connections: {
              Array: {
                name: { type: "string", default: null },
                peer_address: { type: "string", default: null },
                peer_cidrs: { type: "Array", default: [] },
                local_cidrs: { type: "Array", default: [] },
                admin_state_up: { type: "boolean", default: true },
              },
            },
          },
        },
        vpn_servers: {
          Array: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            subnets: { type: "Array", default: [] },
            security_groups: { type: "Array", default: [] },
            method: {
              type: "string",
              default: null,
              groups: ["certificate", "username", "byo", "INSECURE"],
            },
            certificate_crn: { type: "string", default: null },
            client_ca_crn: { type: "string", default: null },
            secrets_manager: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            client_ip_pool: { type: "string", default: null },
            port: { type: "string", default: null },
            protocol: { type: "string", default: null, groups: ["tcp", "udp"] },
            enable_split_tunneling: { type: "boolean", default: false },
            client_idle_timeout: { type: "string", default: null },
            client_dns_server_ips: { type: "string", default: null },
            additional_prefixes: { type: "Array", default: [] },
            zone: { type: "string", default: null, groups: ["1", "2", "3"] },
            routes: {
              Array: {
                name: { type: "string", default: null },
                destination: { type: "string", default: null },
                action: {
                  type: "string",
                  default: null,
                  groups: ["translate", "deliver", "drop"],
                },
              },
            },
          },
        },
        vsi: {
          Array: {
            name: { type: "string", default: null },
            resource_group: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            reserved_ips: {
              default: [],
              type: "Array",
            },
            enable_static_ips: {
              type: "boolean",
              default: false,
            },
            vpc: { type: "string", default: null, groups: "<calculated>" },
            subnets: { type: "Array", default: [] },
            image_name: { type: "string", default: null },
            profile: { type: "string", default: null },
            encryption_key: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            vsi_per_subnet: { type: "string", default: null },
            security_groups: { type: "Array", default: [] },
            ssh_keys: { type: "Array", default: [] },
            enable_floating_ip: { type: "boolean", default: false },
            primary_interface_ip_spoofing: { type: "boolean", default: false },
            user_data: { type: "string", default: null },
            use_variable_names: { type: "boolean", default: false },
            use_snapshot: { type: "boolean", default: false },
            snapshot: { type: "string", default: null },
            volumes: {
              Array: {
                name: { type: "string", default: null },
                profile: {
                  type: "string",
                  default: null,
                  groups: ["3iops-tier", "5iops-tier", "10iops-tier"],
                },
                encryption_key: {
                  type: "string",
                  default: null,
                  groups: "<calculated>",
                },
                capacity: { type: "string", default: null },
              },
            },
          },
        },
        vtl: {
          Array: {
            name: { type: "string", default: null },
            sap: { type: "boolean", default: false },
            sap_profile: {
              type: "string",
              default: null,
              groups: [
                "ush1-4x128",
                "ush1-4x256",
                "ush1-4x384",
                "ush1-4x512",
                "ush1-4x768",
                "bh1-16x1600",
                "bh1-20x2000",
                "bh1-22x2200",
                "bh1-25x2500",
                "bh1-30x3000",
                "bh1-35x3500",
                "bh1-40x4000",
                "bh1-50x5000",
                "bh1-60x6000",
                "bh1-70x7000",
                "bh1-80x8000",
                "bh1-100x10000",
                "bh1-120x12000",
                "bh1-140x14000",
                "ch1-60x3000",
                "ch1-70x3500",
                "ch1-80x4000",
                "ch1-100x5000",
                "ch1-120x6000",
                "ch1-140x7000",
                "mh1-8x1440",
                "mh1-10x1800",
                "mh1-12x2160",
                "mh1-16x2880",
                "mh1-20x3600",
                "mh1-22x3960",
                "mh1-25x4500",
                "mh1-30x5400",
                "mh1-35x6300",
                "mh1-40x7200",
                "mh1-50x9000",
                "mh1-60x10800",
                "mh1-70x12600",
                "mh1-80x14400",
                "umh-4x960",
                "umh-6x1440",
                "umh-8x1920",
                "umh-10x2400",
                "umh-12x2880",
                "umh-16x3840",
                "umh-20x4800",
                "umh-22x5280",
                "umh-25x6000",
                "umh-30x7200",
                "umh-35x8400",
                "umh-40x9600",
                "umh-50x12000",
                "umh-60x14400",
              ],
            },
            workspace: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            ip_address: { type: "string", default: null },
            network: { type: "Array", default: [] },
            primary_subnet: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            ssh_key: { type: "string", default: null, groups: "<calculated>" },
            image: { type: "string", default: null, groups: "<calculated>" },
            pi_sys_type: {
              type: "string",
              default: null,
            },
            pi_proc_type: {
              type: "string",
              default: null,
              groups: ["shared", "capped", "dedicated"],
            },
            pi_processors: { type: "string", default: null },
            pi_memory: { type: "string", default: null },
            pi_storage_pool_affinity: { type: "boolean", default: false },
            pi_storage_pool: { type: "string", default: null },
            storage_option: {
              type: "string",
              default: null,
              groups: ["None", "Storage Pool", "Affinity", "Anti-Affinity"],
            },
            pi_storage_type: { type: "string", default: null },
            affinity_type: {
              type: "string",
              default: null,
              groups: ["Instance", "Volume"],
            },
            pi_affinity_policy: { type: "string", default: null },
            pi_affinity_volume: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_affinity_instance: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_anti_affinity_volume: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_anti_affinity_instance: {
              type: "string",
              default: null,
              groups: "<calculated>",
            },
            pi_license_repository_capacity: { type: "string", default: null },
            pi_ibmi_css: { type: "boolean", default: false },
            pi_ibmi_pha: { type: "boolean", default: false },
            pi_ibmi_rds_users: { type: "string", default: null },
            pi_user_data: { type: "string", default: null },
            pi_pin_policy: {
              type: "string",
              default: "none",
              groups: ["soft", "hard", "none"],
            },
            pi_health_status: {
              type: "string",
              default: "OK",
              groups: ["OK", "WARNING"],
            },
          },
        },
      };
      let actualData = craig.buildSchema();
      assert.deepEqual(actualData, expectedData, "it should create a schema");
    });
  });
});
