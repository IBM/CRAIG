const { assert } = require("chai");
const { outputsTf } = require("../../client/src/lib");

describe("outputs", () => {
  describe("outputsTf", () => {
    it("should return correct outputs file", () => {
      let config = {
        _options: {
          craig_version: "1.12.1",
          prefix: "jv-dev",
          region: "eu-de",
          tags: ["hello", "world"],
          dynamic_subnets: false,
          power_vs_zones: [],
          zones: "1",
          endpoints: "private",
          account_id: null,
          power_vs_high_availability: false,
          fs_cloud: false,
          enable_power_vs: false,
          template: "VSI",
          enable_classic: false,
        },
        access_groups: [],
        appid: [],
        atracker: {
          add_route: true,
          bucket: null,
          locations: ["global"],
          enabled: false,
          type: "cos",
          name: "atracker",
          cos_key: null,
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
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: "service-rg",
          cos: null,
          bucket: null,
        },
        object_storage: [
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
            name: "asset-development",
            use_data: true,
            use_prefix: true,
          },
          {
            name: "workload-rg",
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
            vpc: "workload",
          },
          {
            vpc: "management",
            name: "management-vsi",
            resource_group: "asset-development",
            rules: [
              {
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "0.0.0.0/0",
                tcp: {
                  port_min: 443,
                  port_max: 443,
                  source_port_max: null,
                  source_port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                sg: "management-vsi",
                vpc: "management",
                ruleProtocol: "tcp",
                port_min: "443",
                port_max: "443",
                type: null,
                code: null,
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_min: 343,
                  port_max: null,
                  source_port_max: null,
                  source_port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                sg: "management-vsi",
                vpc: "management",
                ruleProtocol: "tcp",
                port_min: "343",
                port_max: null,
                type: null,
                code: null,
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
                ruleProtocol: "tcp",
                port_min: null,
                port_max: null,
                type: null,
                code: null,
              },
              {
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_min: 443,
                  port_max: 443,
                  source_port_max: null,
                  source_port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                },
                sg: "management-vsi",
                vpc: "management",
                ruleProtocol: "tcp",
                port_min: "443",
                port_max: "443",
                type: null,
                code: null,
              },
            ],
          },
        ],
        ssh_keys: [
          {
            name: "jv-dev",
            use_data: false,
            resource_group: "asset-development",
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
            ],
            use_data: false,
            prefix_filters: [],
            gre_tunnels: [],
          },
        ],
        virtual_private_endpoints: [],
        vpcs: [
          {
            name: "management",
            public_gateways: [],
            acls: [
              {
                resource_group: "asset-development",
                name: "management",
                vpc: "management",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
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
                    ruleProtocol: "all",
                    port_min: null,
                    port_max: null,
                    type: null,
                    code: null,
                    source_port_min: null,
                    source_port_max: null,
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
                    ruleProtocol: "all",
                    port_min: null,
                    port_max: null,
                    type: null,
                    code: null,
                    source_port_min: null,
                    source_port_max: null,
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
                    ruleProtocol: "all",
                    port_min: null,
                    port_max: null,
                    type: null,
                    code: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  {
                    name: "frog",
                    action: "allow",
                    direction: "inbound",
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
                    source: "161.26.0.0/16",
                    destination: "0.0.0.0",
                    acl: "management",
                    vpc: "management",
                    ruleProtocol: "all",
                    port_min: null,
                    port_max: null,
                    type: null,
                    code: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                ],
                use_data: false,
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
                resource_group: "asset-development",
              },
            ],
            address_prefixes: [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                zone: 1,
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
            resource_group: "asset-development",
            publicGateways: [],
            subnetTiers: [
              {
                name: "vsi",
                zones: 1,
              },
            ],
            use_data: false,
          },
        ],
        vpn_gateways: [],
        vpn_servers: [],
        vsi: [
          {
            kms: "kms",
            encryption_key: "slz-vsi-volume-key",
            image: "ibm-ubuntu-20-04-6-minimal-amd64-3",
            profile: "cx2-4x8",
            name: "jv-dev-server",
            security_groups: ["management-vsi"],
            ssh_keys: ["jv-dev"],
            subnets: ["vsi-zone-1"],
            vpc: "management",
            vsi_per_subnet: 1,
            resource_group: "asset-development",
            override_vsi_name: null,
            user_data: null,
            network_interfaces: [],
            volumes: [],
            image_name:
              "Ubuntu Linux 20.04 LTS Focal Fossa Minimal Install (amd64) [ibm-ubuntu-20-04-6-minimal-amd64-3]",
            enable_floating_ip: true,
            primary_interface_ip_spoofing: false,
          },
        ],
        classic_ssh_keys: [],
        classic_vlans: [],
        vtl: [],
        classic_gateways: [],
        cis: [],
        scc_v2: {
          enable: false,
          resource_group: null,
          region: "",
          account_id: "${var.account_id}",
          profile_attachments: [],
        },
        cis_glbs: [],
        fortigate_vnf: [],
        _schematics: {
          workspace_name: "jv-dev",
          workspace_url:
            "https://cloud.ibm.com/schematics/workspaces/us-south.workspace.jv-dev.81837d43",
        },
      };
      let actualData = outputsTf(config);
      let expectedData = `##############################################################################
# Management VPC Outputs
##############################################################################

output "management_vpc_name" {
  value = module.management_vpc.name
}

output "management_vpc_id" {
  value = module.management_vpc.id
}

output "management_vpc_crn" {
  value = module.management_vpc.crn
}

output "management_vpc_subnet_vsi_zone_1_name" {
  value = module.management_vpc.vsi_zone_1_name
}

output "management_vpc_subnet_vsi_zone_1_id" {
  value = module.management_vpc.vsi_zone_1_id
}

output "management_vpc_subnet_vsi_zone_1_crn" {
  value = module.management_vpc.vsi_zone_1_crn
}

output "management_vpc_security_group_management_vsi_name" {
  value = module.management_vpc.management_vsi_name
}

output "management_vpc_security_group_management_vsi_id" {
  value = module.management_vpc.management_vsi_id
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct outputs"
      );
    });
  });
});
