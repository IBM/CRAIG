const { assert } = require("chai");
const { slzToCraig } = require("../client/src/lib/slz-to-craig");
const { transpose } = require("lazy-z");
const slz = require("./data-files/slz-convert.json");
const slzMin = require("./data-files/slz-minimum-valid-json.json");
const craigFromMin = require("./data-files/craig-from-slz-minimum-json.json");
const { configToFilesJson } = require("../client/src/lib");
let slzDupe = {}; // use duplicate here to prevent editing slz during run for edge cases
transpose(slz, slzDupe);

let expectedData = {
  _options: {
    prefix: "slz",
    region: "",
    tags: ["slz", "landing-zone"],
  },
  resource_groups: [
    {
      use_data: false,
      name: "service-rg",
      use_prefix: true,
    },
    {
      use_data: false,
      name: "management-rg",
      use_prefix: true,
    },
    {
      use_data: false,
      name: "workload-rg",
      use_prefix: true,
    },
    {
      use_data: false,
      use_prefix: true,
      name: "edge-rg",
    },
  ],
  key_management: [
    {
      name: "kms",
      use_data: false,
      use_hs_crypto: false,
      resource_group: "service-rg",
      authorize_vpc_reader_role: true,
      keys: [
        {
          key_ring: "slz-ring",
          name: "atracker-key",
          root_key: true,
          force_delete: true,
          endpoint: "public",
          rotation: 12,
          dual_auth_delete: false,
        },
        {
          key_ring: "slz-ring",
          name: "slz-key",
          root_key: true,
          force_delete: false,
          endpoint: "private",
          rotation: 12,
          dual_auth_delete: false,
        },
        {
          key_ring: "slz-ring",
          name: "roks-key",
          root_key: true,
          force_delete: false,
          endpoint: "private",
          rotation: 12,
          dual_auth_delete: false,
        },
        {
          key_ring: "slz-ring",
          name: "vsi-volume-key",
          root_key: true,
          force_delete: false,
          endpoint: "private",
          rotation: 12,
          dual_auth_delete: false,
        },
      ],
    },
  ],
  object_storage: [
    {
      buckets: [
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "atracker-bucket",
          storage_class: "standard",
        },
      ],
      keys: [
        {
          name: "cos-bind-key",
          role: "Writer",
          enable_hmac: false,
        },
      ],
      name: "atracker-cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false,
      use_random_suffix: true,
      kms: "kms",
    },
    {
      buckets: [
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "slz-key",
          name: "management-bucket",
          storage_class: "standard",
        },
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "slz-key",
          name: "edge-bucket",
          storage_class: "standard",
        },
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "slz-key",
          name: "workload-bucket",
          storage_class: "standard",
        },
      ],
      keys: [],
      name: "cos",
      plan: "standard",
      resource_group: "service-rg",
      use_random_suffix: true,
      use_data: false,
      kms: "kms",
    },
  ],
  secrets_manager: [
    {
      name: "management-vpe-sg",
      kms: "kms",
      encryption_key: "slz-key",
      resource_group: "management-rg",
    },
  ],
  atracker: {
    enabled: true,
    type: "cos",
    name: "atracker",
    target_name: "atracker-cos",
    bucket: "atracker-bucket",
    add_route: true,
    cos_key: "cos-bind-key",
    locations: ["global"],
  },
  vpcs: [
    {
      cos: "cos",
      bucket: "edge-bucket",
      name: "edge",
      resource_group: "edge-rg",
      classic_access: false,
      manual_address_prefix_management: true,
      default_network_acl_name: null,
      default_security_group_name: null,
      default_routing_table_name: null,
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
      subnets: [
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.5.60.0/24",
          name: "f5-bastion-zone-1",
          public_gateway: false,
        },
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "f5-external",
          cidr: "10.5.40.0/24",
          name: "f5-external-zone-1",
          public_gateway: false,
        },
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.5.30.0/24",
          name: "f5-management-zone-1",
          public_gateway: false,
        },
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.5.50.0/24",
          name: "f5-workload-zone-1",
          public_gateway: false,
        },
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.5.70.0/24",
          name: "vpe-zone-1",
          public_gateway: false,
        },
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.5.10.0/24",
          name: "vpn-1-zone-1",
          public_gateway: false,
        },
        {
          zone: 1,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.5.20.0/24",
          name: "vpn-2-zone-1",
          public_gateway: false,
        },
        {
          zone: 2,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.6.60.0/24",
          name: "f5-bastion-zone-2",
          public_gateway: false,
        },
        {
          zone: 2,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "f5-external",
          cidr: "10.6.40.0/24",
          name: "f5-external-zone-2",
          public_gateway: false,
        },
        {
          zone: 2,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.6.30.0/24",
          name: "f5-management-zone-2",
          public_gateway: false,
        },
        {
          zone: 2,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.6.50.0/24",
          name: "f5-workload-zone-2",
          public_gateway: false,
        },
        {
          zone: 2,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.6.70.0/24",
          name: "vpe-zone-2",
          public_gateway: false,
        },
        {
          zone: 2,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.6.10.0/24",
          name: "vpn-1-zone-2",
          public_gateway: false,
        },
        {
          zone: 2,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.6.20.0/24",
          name: "vpn-2-zone-2",
          public_gateway: false,
        },
        {
          zone: 3,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.7.60.0/24",
          name: "f5-bastion-zone-3",
          public_gateway: false,
        },
        {
          zone: 3,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "f5-external",
          cidr: "10.7.40.0/24",
          name: "f5-external-zone-3",
          public_gateway: false,
        },
        {
          zone: 3,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.7.30.0/24",
          name: "f5-management-zone-3",
          public_gateway: false,
        },
        {
          zone: 3,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.7.50.0/24",
          name: "f5-workload-zone-3",
          public_gateway: false,
        },
        {
          zone: 3,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.7.70.0/24",
          name: "vpe-zone-3",
          public_gateway: false,
        },
        {
          zone: 3,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.7.10.0/24",
          name: "vpn-1-zone-3",
          public_gateway: false,
        },
        {
          zone: 3,
          vpc: "edge",
          has_prefix: false,
          resource_group: "edge-rg",
          network_acl: "edge",
          cidr: "10.7.20.0/24",
          name: "vpn-2-zone-3",
          public_gateway: false,
        },
      ],
      public_gateways: [],
      acls: [
        {
          name: "edge",
          resource_group: "edge-rg",
          vpc: "edge",
          rules: [
            {
              acl: "edge",
              vpc: "edge",
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
            },
            {
              acl: "edge",
              vpc: "edge",
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
            },
            {
              acl: "edge",
              vpc: "edge",
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
            },
          ],
        },
        {
          name: "f5-external",
          vpc: "edge",
          resource_group: "edge-rg",
          rules: [
            {
              acl: "f5-external",
              vpc: "edge",
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
            },
            {
              acl: "f5-external",
              vpc: "edge",
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
            },
            {
              acl: "f5-external",
              vpc: "edge",
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
            },
            {
              acl: "f5-external",
              vpc: "edge",
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
            },
          ],
        },
      ],
    },
    {
      cos: "cos",
      bucket: "management-bucket",
      name: "management",
      resource_group: "management-rg",
      classic_access: false,
      manual_address_prefix_management: true,
      default_network_acl_name: null,
      default_security_group_name: null,
      default_routing_table_name: null,
      address_prefixes: [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.10.0/24",
          name: "vsi-zone-1",
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.20.0/24",
          name: "vpe-zone-1",
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.10.0/24",
          name: "vsi-zone-2",
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.20.0/24",
          name: "vpe-zone-2",
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.10.0/24",
          name: "vsi-zone-3",
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.20.0/24",
          name: "vpe-zone-3",
        },
      ],
      subnets: [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.10.0/24",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.20.0/24",
          name: "vpe-zone-1",
          resource_group: "management-rg",
          network_acl: "management",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.10.0/24",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.20.0/24",
          name: "vpe-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.10.0/24",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.20.0/24",
          name: "vpe-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
      ],
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
              acl: "management",
              vpc: "management",
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
            },
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              acl: "management",
              vpc: "management",
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
            },
            {
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
              acl: "management",
              vpc: "management",
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
            },
          ],
        },
      ],
    },
    {
      cos: "cos",
      bucket: "workload-bucket",
      name: "workload",
      resource_group: "workload-rg",
      classic_access: false,
      manual_address_prefix_management: true,
      default_network_acl_name: null,
      default_security_group_name: null,
      default_routing_table_name: null,
      address_prefixes: [
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.10.0/24",
          name: "vsi-zone-1",
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.20.0/24",
          name: "vpe-zone-1",
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.10.0/24",
          name: "vsi-zone-2",
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.20.0/24",
          name: "vpe-zone-2",
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.10.0/24",
          name: "vsi-zone-3",
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.20.0/24",
          name: "vpe-zone-3",
        },
      ],
      subnets: [
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.10.0/24",
          name: "vsi-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.20.0/24",
          name: "vpe-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.10.0/24",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.20.0/24",
          name: "vpe-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.10.0/24",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.20.0/24",
          name: "vpe-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true,
        },
      ],
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
              acl: "workload",
              vpc: "workload",
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
            },
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              acl: "workload",
              vpc: "workload",
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
            },
            {
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
              acl: "workload",
              vpc: "workload",
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
            },
          ],
        },
      ],
    },
  ],
  virtual_private_endpoints: [
    {
      vpc: "management-cos",
      service: "cos",
      resource_group: "service-rg",
      security_groups: ["management-vpe"],
      subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
    },
    {
      vpc: "workload-cos",
      service: "cos",
      resource_group: "service-rg",
      security_groups: ["workload-vpe"],
      subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
    },
  ],
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
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-management",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-management",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-management",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 53, port_min: 53 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-management",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 80, port_min: 80 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-management",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
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
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
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
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-workload-subnet-2",
          source: "10.20.10.0/24",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-workload-subnet-3",
          source: "10.30.10.0/24",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-workload-subnet-4",
          source: "10.40.10.0/24",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-workload-subnet-5",
          source: "10.50.10.0/24",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-workload-subnet-6",
          source: "10.60.10.0/24",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 53, port_min: 53 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 80, port_min: 80 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-workload",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
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
          tcp: { port_max: 3025, port_min: 3023 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-bastion",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "1-inbound-3080",
          source: "10.5.80.0/24",
          tcp: { port_max: 3080, port_min: 3080 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-bastion",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "2-inbound-3023",
          source: "10.6.80.0/24",
          tcp: { port_max: 3025, port_min: 3023 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-bastion",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "2-inbound-3080",
          source: "10.6.80.0/24",
          tcp: { port_max: 3080, port_min: 3080 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-bastion",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "3-inbound-3023",
          source: "10.7.80.0/24",
          tcp: { port_max: 3025, port_min: 3023 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "f5-bastion",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "3-inbound-3080",
          source: "10.7.80.0/24",
          tcp: { port_max: 3080, port_min: 3080 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
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
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "edge-vpe",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "edge-vpe",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "edge-vpe",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 53, port_min: 53 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "edge-vpe",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 80, port_min: 80 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "edge-vpe",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
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
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vpe",
          vpc: "management",
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vpe",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vpe",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 53, port_min: 53 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vpe",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 80, port_min: 80 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vpe",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
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
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "workload-vpe",
          vpc: "workload",
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "workload-vpe",
          vpc: "workload",
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "workload-vpe",
          vpc: "workload",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 53, port_min: 53 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "workload-vpe",
          vpc: "workload",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 80, port_min: 80 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "workload-vpe",
          vpc: "workload",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
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
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vsi",
          vpc: "management",
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vsi",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vsi",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 53, port_min: 53 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vsi",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 80, port_min: 80 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vsi",
          vpc: "management",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "management-vsi",
          vpc: "management",
        },
      ],
    },
    {
      vpc: "edge",
      name: "teleport-sg-vsi",
      resource_group: "management-rg",
      rules: [
        {
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 53, port_min: 53 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 80, port_min: 80 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
        {
          direction: "inbound",
          name: "allow-inbound-443",
          source: "0.0.0.0/0",
          tcp: { port_max: 443, port_min: 443 },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
        {
          direction: "outbound",
          name: "allow-all-outbound",
          source: "0.0.0.0/0",
          tcp: { port_max: null, port_min: null },
          icmp: { code: null, type: null },
          udp: { port_max: null, port_min: null },
          sg: "teleport-sg-vsi",
          vpc: "edge",
        },
      ],
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
  ssh_keys: [
    {
      name: "ssh-key",
      public_key: "<user-determined-value>",
      resource_group: "management-rg",
      use_data: false,
    },
  ],
  transit_gateways: [
    {
      name: "transit-gateway",
      resource_group: "service-rg",
      global: false,
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
  clusters: [
    {
      kms: "kms",
      cos: "cos",
      entitlement: "cloud_pak",
      kube_type: "openshift",
      kube_version: "default",
      flavor: "bx2.16x64",
      name: "workload",
      resource_group: "workload-rg",
      encryption_key: "roks-key",
      subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
      update_all_workers: false,
      vpc: "workload",
      worker_pools: [
        {
          entitlement: "cloud_pak",
          cluster: "workload",
          flavor: "bx2.16x64",
          name: "logging-worker-pool",
          resource_group: "workload-rg",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vpc: "workload",
          workers_per_subnet: 2,
        },
      ],
      workers_per_subnet: 2,
      private_endpoint: true,
    },
  ],
  vsi: [
    {
      kms: "kms",
      encryption_key: "vsi-volume-key",
      image: "ibm-ubuntu-22-04-1-minimal-amd64-1",
      profile: "cx2-4x8",
      name: "management-server",
      security_groups: ["management-vsi", "management-vpe"],
      ssh_keys: ["ssh-key"],
      subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
      vpc: "management",
      vsi_per_subnet: 2,
      resource_group: "management-rg",
    },
  ],
  appid: [
    {
      name: "sadasd",
      use_data: false,
      resource_group: "management-rg",
      keys: [
        {
          appid: "sadasd",
          name: "a",
        },
        {
          appid: "sadasd",
          name: "b",
        },
        {
          appid: "sadasd",
          name: "v",
        },
      ],
    },
  ],
  teleport_vsi: [
    {
      appid: "sadasd",
      name: "test-deployment",
      kms: "kms",
      encryption_key: "vsi-volume-key",
      image: "ibm-centos-stream-9-amd64-1",
      profile: "bx2d-4x16",
      security_groups: ["teleport-sg-vsi", "management-vpe"],
      ssh_keys: ["ssh-key"],
      subnet: "f5-management-zone-1",
      vpc: "edge",
      resource_group: "management-rg",
      template: {
        deployment: "test-deployment",
        license: "sdfsdf",
        https_cert: "this.props.saveFromChildForm.disableSave",
        https_key: "sdfgsdfg",
        hostname: "saveFromChildForm",
        domain: "saveFromChildForm",
        cos: "atracker-cos",
        bucket: "atracker-bucket",
        appid: "sadasd",
        appid_key: "b",
        cos_key: "cos-bind-key",
        message_of_the_day: "sadsdasd",
        version: "2",
        claim_to_roles: [
          {
            email: "Jennifer.Valle@ibm.com",
            roles: ["sdfdsfsdfdsfsdf"],
          },
        ],
      },
    },
  ],
  scc: {
    enable: true,
    credential_description: null,
    id: null,
    passphrase: "",
    name: null,
    collector_description: "asdasd",
    scope_description: "sdfsdfsdfsdfsdsdfdsfsdf",
    is_public: true,
    location: "us",
  },
  f5_vsi: [
    {
      kms: "kms",
      subnet: "f5-management-zone-1",
      vpc: "edge",
      resource_group: "edge-rg",
      ssh_keys: ["ssh-key"],
      security_groups: ["f5-management"],
      encryption_key: "vsi-volume-key",
      profile: "cx2-4x8",
      name: "f5-zone-1",
      image: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
      network_interfaces: [
        {
          subnet: "f5-bastion-zone-1",
          security_groups: ["f5-bastion"],
        },
        {
          subnet: "f5-external-zone-1",
          security_groups: ["f5-external"],
        },
        {
          subnet: "f5-workload-zone-1",
          security_groups: ["f5-workload"],
        },
      ],
      template: {
        hostname: "f5-ve-01",
        domain: "local",
        zone: 1,
        vpc: "edge",
        do_declaration_url: "https://www.ibm.com/2",
        as3_declaration_url: "https://www.ibm.com/3",
        ts_declaration_url: "https://www.ibm.com/5",
        phone_home_url: "https://www.ibm.com/1",
        tgactive_url: "hi",
        tgstandby_url: "https://www.ibm.com/4",
        tgrefresh_url: "https://www.ibm.com/6",
        template_version: "20210201",
        tgactive_url: "https://www.ibm.com/7",
        app_id: "1196201_jennifer.valle@ibm.com",
        license_type: "none",
        license_host: "null",
        license_username: "null",
        license_password: "null",
        license_pool: "null",
        license_sku_keyword_1: "null",
        license_sku_keyword_2: "null",
        tmos_admin_password: "This1isaPasswordlol",
        byol_license_basekey: "null",
        license_unit_of_measure: "hourly",
        template_source:
          "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
      },
    },
    {
      kms: "kms",
      subnet: "f5-management-zone-2",
      vpc: "edge",
      resource_group: "edge-rg",
      ssh_keys: ["ssh-key"],
      security_groups: ["f5-management"],
      encryption_key: "vsi-volume-key",
      profile: "cx2-4x8",
      name: "f5-zone-2",
      image: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
      network_interfaces: [
        {
          subnet: "f5-bastion-zone-2",
          security_groups: ["f5-bastion"],
        },
        {
          subnet: "f5-external-zone-2",
          security_groups: ["f5-external"],
        },
        {
          subnet: "f5-workload-zone-2",
          security_groups: ["f5-workload"],
        },
      ],
      template: {
        hostname: "f5-ve-01",
        domain: "local",
        zone: 2,
        vpc: "edge",
        do_declaration_url: "https://www.ibm.com/2",
        as3_declaration_url: "https://www.ibm.com/3",
        ts_declaration_url: "https://www.ibm.com/5",
        phone_home_url: "https://www.ibm.com/1",
        tgactive_url: "hi",
        tgstandby_url: "https://www.ibm.com/4",
        tgrefresh_url: "https://www.ibm.com/6",
        template_version: "20210201",
        tgactive_url: "https://www.ibm.com/7",
        app_id: "1196201_jennifer.valle@ibm.com",
        license_type: "none",
        license_host: "null",
        license_username: "null",
        license_password: "null",
        license_pool: "null",
        license_sku_keyword_1: "null",
        license_sku_keyword_2: "null",
        tmos_admin_password: "This1isaPasswordlol",
        byol_license_basekey: "null",
        license_unit_of_measure: "hourly",
        template_source:
          "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
      },
    },
    {
      kms: "kms",
      subnet: "f5-management-zone-3",
      vpc: "edge",
      resource_group: "edge-rg",
      ssh_keys: ["ssh-key"],
      security_groups: ["f5-management"],
      encryption_key: "vsi-volume-key",
      profile: "cx2-4x8",
      name: "f5-zone-3",
      image: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
      network_interfaces: [
        {
          subnet: "f5-bastion-zone-3",
          security_groups: ["f5-bastion"],
        },
        {
          subnet: "f5-external-zone-3",
          security_groups: ["f5-external"],
        },
        {
          subnet: "f5-workload-zone-3",
          security_groups: ["f5-workload"],
        },
      ],
      template: {
        hostname: "f5-ve-01",
        domain: "local",
        zone: 3,
        vpc: "edge",
        byol_license_basekey: "null",
        do_declaration_url: "https://www.ibm.com/2",
        as3_declaration_url: "https://www.ibm.com/3",
        ts_declaration_url: "https://www.ibm.com/5",
        phone_home_url: "https://www.ibm.com/1",
        tgactive_url: "hi",
        tgstandby_url: "https://www.ibm.com/4",
        tgrefresh_url: "https://www.ibm.com/6",
        template_version: "20210201",
        tgactive_url: "https://www.ibm.com/7",
        app_id: "1196201_jennifer.valle@ibm.com",
        license_type: "none",
        license_host: "null",
        license_username: "null",
        license_password: "null",
        license_pool: "null",
        license_sku_keyword_1: "null",
        license_sku_keyword_2: "null",
        tmos_admin_password: "This1isaPasswordlol",
        license_unit_of_measure: "hourly",
        template_source:
          "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
      },
    },
  ],
};

describe("slzToCraig", () => {
  it("should create options from slz data", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz")._options,
      expectedData._options,
      "it should return correct options"
    );
  });
  it("should create resource groups", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").resource_groups,
      expectedData.resource_groups,
      "it should return correct options"
    );
  });
  it("should create key management", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").key_management,
      expectedData.key_management,
      "it should return correct options"
    );
  });
  it("should create object storage", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").object_storage,
      expectedData.object_storage,
      "it should return correct options"
    );
  });
  it("should create secrets manager", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").secrets_manager,
      expectedData.secrets_manager,
      "it should return correct options"
    );
  });
  it("should not create secrets manager if not enabled in slz", () => {
    slzDupe.secrets_manager.use_secrets_manager = false;
    assert.deepEqual(
      slzToCraig(slzDupe, "slz").secrets_manager,
      [],
      "it should return correct options"
    );
  });
  it("should create atracker", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").atracker,
      expectedData.atracker,
      "it should return correct options"
    );
  });
  it("should create atracker when no cos key is found and set ref to null", () => {
    slzDupe.cos.forEach((instance) => (instance.keys = []));
    assert.deepEqual(
      slzToCraig(slzDupe, "slz").atracker.cos_key,
      null,
      "it should return correct options"
    );
  });
  it("should create vpcs", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").vpcs[0],
      expectedData.vpcs[0],
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slz, "slz").vpcs[1],
      expectedData.vpcs[1],
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slz, "slz").vpcs[2],
      expectedData.vpcs[2],
      "it should return correct options"
    );
  });
  it("should create virtual_private_endpoints", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").virtual_private_endpoints,
      expectedData.virtual_private_endpoints,
      "it should return correct options"
    );
  });
  it("should create security_groups", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").security_groups,
      expectedData.security_groups,
      "it should return correct options"
    );
  });
  it("should create vpn_gateways", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").vpn_gateways,
      expectedData.vpn_gateways,
      "it should return correct options"
    );
  });
  it("should create ssh_keys", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").ssh_keys,
      expectedData.ssh_keys,
      "it should return correct options"
    );
  });
  it("should create transit_gateways", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").transit_gateways,
      expectedData.transit_gateways,
      "it should return correct options"
    );
  });
  it("should not create transit_gateways when not enabled", () => {
    slzDupe.enable_transit_gateway = false;
    assert.deepEqual(
      slzToCraig(slzDupe, "slz").transit_gateways,
      [],
      "it should return correct options"
    );
  });
  it("should create clusters", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").clusters,
      expectedData.clusters,
      "it should return correct options"
    );
  });
  it("should create iks cluster", () => {
    slzDupe.clusters[0].cos_name = null;
    slzDupe.clusters[0].entitlement = null;
    slzDupe.clusters[0].worker_pools[0].entitlement = null;
    assert.deepEqual(
      slzToCraig(slzDupe, "slz").clusters,
      [
        {
          kms: "kms",
          cos: null,
          entitlement: null,
          kube_type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "workload",
          resource_group: "workload-rg",
          encryption_key: "roks-key",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "workload",
          worker_pools: [
            {
              entitlement: null,
              cluster: "workload",
              flavor: "bx2.16x64",
              name: "logging-worker-pool",
              resource_group: "workload-rg",
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              vpc: "workload",
              workers_per_subnet: 2,
            },
          ],
          workers_per_subnet: 2,
          private_endpoint: true,
        },
      ],
      "it should return correct options"
    );
  });
  it("should create vsi", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").vsi,
      expectedData.vsi,
      "it should return correct options"
    );
  });
  it("should create appid", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").appid,
      expectedData.appid,
      "it should return correct options"
    );
  });
  it("should not create appid when disabled in slz", () => {
    slzDupe.appid.use_appid = false;
    assert.deepEqual(
      slzToCraig(slzDupe, "slz").appid,
      [],
      "it should return correct options"
    );
  });
  it("should create teleport_vsi", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").teleport_vsi,
      expectedData.teleport_vsi,
      "it should return correct options"
    );
  });
  it("should create scc", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").scc,
      expectedData.scc,
      "it should return correct options"
    );
  });
  it("should create scc when not enabled in slz", () => {
    slzDupe.security_compliance_center.enable_scc = false;
    assert.deepEqual(
      slzToCraig(slzDupe, "slz").scc,
      {
        enable: false,
        credential_description: null,
        id: null,
        name: null,
      },
      "it should return correct options"
    );
  });
  it("should create f5_vsi", () => {
    assert.deepEqual(
      slzToCraig(slz, "slz").f5_vsi,
      expectedData.f5_vsi,
      "it should return correct options"
    );
  });
  it("should correctly return json for minimum valid slz json", () => {
    assert.deepEqual(
      slzToCraig(slzMin, "slz").vpcs,
      craigFromMin.vpcs,
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slzMin, "slz").virtual_private_endpoints,
      craigFromMin.virtual_private_endpoints,
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slzMin, "slz").security_groups,
      craigFromMin.security_groups,
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slzMin, "slz").vpn_gateways,
      craigFromMin.vpn_gateways,
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slzMin, "slz").ssh_keys,
      craigFromMin.ssh_keys,
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slzMin, "slz").transit_gateways,
      craigFromMin.transit_gateways,
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slzMin, "slz").vsi,
      craigFromMin.vsi,
      "it should return correct options"
    );
    assert.deepEqual(
      slzToCraig(slzMin, "slz"),
      craigFromMin,
      "it should return correct options"
    );
    let task = () => {
      return configToFilesJson(slzToCraig(slzDupe, "slz"));
    };
    assert.doesNotThrow(task, "it should not throw");
  });
});
