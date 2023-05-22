let { assert } = require("chai");
const validate = require("../client/src/lib/validate");
const { eachKey, splat } = require("lazy-z");
const f5nw = require("../unit-tests/data-files/f5-nw.json");

const minimumValidJson = (data) => {
  let newData = {
    _options: {
      prefix: "slz",
      region: "us-south",
      tags: ["slz", "landing-zone"],
    },
    resource_groups: [
      {
        name: "slz-service-rg",
        use_data: false,
      },
      {
        name: "slz-management-rg",
        use_data: false,
      },
      {
        name: "slz-workload-rg",
        use_data: false,
      },
    ],
    key_management: [
      {
        name: "slz-kms",
        resource_group: "slz-service-rg",
        use_hs_crypto: false,
        authorize_vpc_reader_role: true,
        use_data: false,
        keys: [
          {
            key_ring: "slz-slz-ring",
            name: "slz-slz-key",
            root_key: true,
            force_delete: true,
            endpoint: "public",
            rotation: 12,
            dual_auth_delete: false,
          },
          {
            key_ring: "slz-slz-ring",
            name: "slz-atracker-key",
            root_key: true,
            force_delete: true,
            endpoint: "public",
            rotation: 12,
            dual_auth_delete: false,
          },
          {
            key_ring: "slz-slz-ring",
            name: "slz-vsi-volume-key",
            root_key: true,
            force_delete: true,
            endpoint: "public",
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
            kms_key: "slz-atracker-key",
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
        resource_group: "slz-service-rg",
        use_data: false,
        use_random_suffix: false,
        kms: "slz-kms",
      },
      {
        buckets: [
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "slz-slz-key",
            name: "management-bucket",
            storage_class: "standard",
          },
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "slz-slz-key",
            name: "workload-bucket",
            storage_class: "standard",
          },
        ],
        keys: [],
        name: "cos",
        plan: "standard",
        resource_group: "slz-service-rg",
        use_random_suffix: false,
        kms: "slz-kms",
        use_data: false,
      },
    ],
    secrets_manager: [],
    atracker: {
      enabled: true,
      type: "cos",
      name: "slz-atracker",
      target_name: "atracker-cos",
      bucket: "atracker-bucket",
      add_route: true,
      cos_key: "cos-bind-key",
      locations: ["global", "us-south"],
    },
    vpcs: [
      {
        cos: "cos",
        bucket: "management-bucket",
        name: "management",
        resource_group: "slz-management-rg",
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
            zone: 2,
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-1",
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
            cidr: "10.20.30.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.30.10.0/24",
            name: "vpn-zone-1",
          },
        ],
        subnets: [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vsi-zone-1",
            network_acl: "management",
            resource_group: "slz-management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.30.0/24",
            name: "vpn-zone-1",
            network_acl: "management",
            resource_group: "slz-management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "slz-management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "slz-management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-1",
            resource_group: "slz-management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
            network_acl: "management",
            resource_group: "slz-management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.20.30.0/24",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "slz-management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ],
        public_gateways: [],
        acls: [
          {
            resource_group: "slz-management-rg",
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
        bucket: "management-bucket",
        name: "workload",
        resource_group: "slz-workload-rg",
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
            zone: 2,
            cidr: "10.50.10.0/24",
            name: "vsi-zone-2",
          },
          {
            vpc: "workload",
            zone: 3,
            cidr: "10.60.10.0/24",
            name: "vsi-zone-3",
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
            cidr: "10.50.20.0/24",
            name: "vpe-zone-2",
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
            resource_group: "slz-workload-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "workload",
            zone: 2,
            cidr: "10.50.20.0/24",
            name: "vsi-zone-2",
            network_acl: "workload",
            resource_group: "slz-workload-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "workload",
            zone: 3,
            cidr: "10.60.30.0/24",
            name: "vsi-zone-3",
            network_acl: "workload",
            resource_group: "slz-workload-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "workload",
            zone: 1,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-1",
            network_acl: "workload",
            resource_group: "slz-workload-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "workload",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
            network_acl: "workload",
            resource_group: "slz-workload-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "workload",
            zone: 3,
            cidr: "10.20.30.0/24",
            name: "vpe-zone-3",
            network_acl: "workload",
            resource_group: "slz-workload-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ],
        public_gateways: [],
        acls: [
          {
            resource_group: "slz-workload-rg",
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
        name: "management-cos",
        vpc: "management",
        service: "cos",
        resource_group: "slz-management-rg",
        security_groups: ["management-vpe-sg"],
        subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
      },
      {
        name: "workload-cos",
        vpc: "workload",
        service: "cos",
        resource_group: "slz-workload-rg",
        security_groups: ["workload-vpe-sg"],
        subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
      },
    ],
    security_groups: [
      {
        vpc: "management",
        name: "management-vpe-sg",
        resource_group: "slz-management-rg",
        rules: [
          {
            vpc: "management",
            sg: "management-vpe-sg",
            direction: "inbound",
            name: "allow-ibm-inbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe-sg",
            direction: "inbound",
            name: "allow-vpc-inbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe-sg",
            direction: "outbound",
            name: "allow-vpc-outbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe-sg",
            direction: "outbound",
            name: "allow-ibm-tcp-53-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 53,
              port_min: 53,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe-sg",
            direction: "outbound",
            name: "allow-ibm-tcp-80-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 80,
              port_min: 80,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe-sg",
            direction: "outbound",
            name: "allow-ibm-tcp-443-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
        ],
      },
      {
        vpc: "workload",
        name: "workload-vpe-sg",
        resource_group: "slz-workload-rg",
        rules: [
          {
            vpc: "workload",
            sg: "workload-vpe-sg",
            direction: "inbound",
            name: "allow-ibm-inbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe-sg",
            direction: "inbound",
            name: "allow-vpc-inbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe-sg",
            direction: "outbound",
            name: "allow-vpc-outbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe-sg",
            direction: "outbound",
            name: "allow-ibm-tcp-53-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 53,
              port_min: 53,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe-sg",
            direction: "outbound",
            name: "allow-ibm-tcp-80-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 80,
              port_min: 80,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe-sg",
            direction: "outbound",
            name: "allow-ibm-tcp-443-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
        ],
      },
    ],
    vpn_gateways: [
      {
        name: "management-gateway",
        resource_group: "slz-management-rg",
        subnet: "vpn-zone-1",
        vpc: "management",
      },
    ],
    ssh_keys: [
      {
        name: "slz-ssh-key",
        public_key:
          "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
        resource_group: "slz-management-rg",
        use_data: false,
      },
    ],
    transit_gateways: [
      {
        name: "transit-gateway",
        resource_group: "slz-service-rg",
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
        kms: "slz-kms",
        cos: "cos",
        entitlement: "cloud_pak",
        type: "openshift",
        kube_version: "default",
        flavor: "bx2.16x64",
        name: "workload",
        resource_group: "slz-workload-rg",
        encryption_key: "slz-vsi-volume-key",
        subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        update_all_workers: false,
        vpc: "workload",
        worker_pools: [
          {
            entitlement: "cloud_pak",
            cluster: "workload",
            flavor: "bx2.16x64",
            name: "logging-pool",
            resource_group: "slz-workload-rg",
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc: "workload",
            workers_per_subnet: 2,
          },
        ],
        workers_per_subnet: 2,
        private_endpoint: false,
      },
    ],
    vsi: [
      {
        kms: "slz-kms",
        encryption_key: "slz-vsi-volume-key",
        image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
        profile: "cx2-4x8",
        name: "management-server",
        security_groups: ["management-vpe-sg"],
        ssh_keys: ["slz-ssh-key"],
        subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vpc: "management",
        vsi_per_subnet: 2,
        resource_group: "slz-management-rg",
      },
    ],
    appid: [],
    scc: {
      name: "scc",
      enable: true,
    },
    event_streams: [],
    load_balancers: [],
    access_groups: [],
    iam_account_settings: [],
  };
  eachKey(data || {}, (key) => {
    newData[key] = data[key];
  });
  return newData;
};

function defaultCluster() {
  return {
    kms: "slz-kms",
    cos: "cos",
    entitlement: "cloud_pak",
    type: "openshift",
    kube_version: "default",
    flavor: "bx2.16x64",
    name: "workload-cluster",
    resource_group: "workload-rg",
    encryption_key: "slz-slz-key",
    subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
    update_all_workers: false,
    vpc: "workload",
    worker_pools: [
      {
        entitlement: "cloud_pak",
        cluster: "workload-cluster",
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
  };
}

function defaultAcl() {
  return {
    name: "management",
    resource_group: "slz-management-rg",
    vpc: "management",
    rules: [
      {
        acl: "management",
        vpc: "management",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
      },
      {
        acl: "management",
        vpc: "management",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-all-network-inbound",
        source: "10.0.0.0/8",
      },
    ],
  };
}

describe("validate", () => {
  describe("atracker", () => {
    it("should not throw an error if atracker is not enabled even with null bucket/key", () => {
      let testData = minimumValidJson({
        atracker: {
          enabled: false,
          bucket: null,
          cos_key: null,
        },
      });
      let task = () => {
        validate(testData);
      };
      assert.doesNotThrow(task, "should not throw if atracker is not enabled");
    });
    it("should throw an error if atracker bucket name is null", () => {
      let testData = minimumValidJson({
        atracker: {
          enabled: true,
          add_route: false,
          receive_global_events: false,
          resource_group: "slz-service-rg",
          bucket: null,
          cos_key: "key",
        },
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Activity Tracker must have a valid bucket name. Got `null`"
      );
    });
    it("should throw an error if the cos instance where the activity tracker bucket is provisioned has no keys", () => {
      let testData = minimumValidJson({
        object_storage: [
          {
            buckets: [
              {
                endpoint_type: "public",
                force_delete: true,
                kms_key: "slz-atracker-key",
                name: "atracker-bucket",
                storage_class: "standard",
              },
            ],
            keys: [],
            name: "atracker-cos",
            plan: "standard",
            resource_group: "slz-service-rg",
            use_data: false,
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "The COS instance where the Activity Tracker bucket is created must have at least one key. Got 0"
      );
    });
    it("should not throw when cos has valid key", () => {
      let testData = minimumValidJson({
        buckets: [
          {
            endpoint_type: "public",
            force_delete: true,
            kms_key: "slz-atracker-key",
            name: "atracker-bucket",
            storage_class: "standard",
          },
        ],
        keys: [
          {
            name: "cos-bind-key",
            role: "Writer",
            enable_HMAC: false,
          },
        ],
        name: "atracker-cos",
        plan: "standard",
        resource_group: "slz-service-rg",
        use_data: false,
      });
      let task = () => validate(testData);
      assert.doesNotThrow(task, "it should throw");
    });
    it("should throw an error when bucket key is not in the same kms instance as parent", () => {
      let testData = minimumValidJson({
        object_storage: [
          {
            buckets: [
              {
                endpoint_type: "public",
                force_delete: true,
                kms_key: "fake-key",
                name: "atracker-bucket",
                storage_class: "standard",
              },
            ],
            keys: [
              {
                name: "cos-bind-key",
                role: "Writer",
                enable_HMAC: false,
              },
            ],
            name: "atracker-cos",
            plan: "standard",
            resource_group: "slz-service-rg",
            use_data: false,
            kms: "slz-kms",
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        `atracker-bucket must reference a key in the kms service slz-kms used by atracker-cos. fake-key is invalid.`
      );
    });
  });
  describe("options", () => {
    it("should throw an error if options does not have a prefix", () => {
      let testData = minimumValidJson({ _options: { region: "us-south" } });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Options requires a Prefix, prefix missing from JSON."
      );
    });
    it("should throw an error if options does not have a region", () => {
      let testData = minimumValidJson({ _options: { prefix: "hi" } });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Options requires a Region, region missing from JSON."
      );
    });
  });
  describe("object_storage", () => {
    it("should throw an error if no object storage instances are provisioned", () => {
      let testData = minimumValidJson({ object_storage: [] });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "At least one Object Storage Instance is required. Got 0"
      );
    });
  });
  describe("secrets_manager", () => {
    it("should throw an error if no resource group", () => {
      let testData = minimumValidJson({
        secrets_manager: [
          {
            name: "asdf",
            resource_group: null,
            encryption_key: "key",
            use_secrets_manager: true,
            kms: "kms",
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Secrets Manager requires a resource group, Secrets Manager Resource Group is null."
      );
    });
    it("should accept valid secrets manager", () => {
      let testData = minimumValidJson({
        secrets_manager: [
          {
            name: "asdf",
            resource_group: "slz-management-rg",
            encryption_key: "key",
            use_secrets_manager: true,
            kms: "slz-kms",
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.doesNotThrow(task);
    });
    it("should throw an error if no encryption key", () => {
      let testData = minimumValidJson({
        secrets_manager: [
          {
            name: "asdf",
            resource_group: "hi",
            use_secrets_manager: true,
            kms: "kms",
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Secrets Manager requires a encryption key, encryption_key missing from JSON."
      );
    });
    it("should throw an error if no kms", () => {
      let testData = minimumValidJson({
        secrets_manager: [
          {
            name: "asdf",
            resource_group: "hi",
            encryption_key: "key",
            use_secrets_manager: true,
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Secrets Manager requires a Key Management, kms missing from JSON."
      );
    });
  });
  describe("event_streams", () => {
    it("should throw an error if no resource group", () => {
      let testData = minimumValidJson({
        event_streams: [
          {
            name: "event-stream",
            resource_group: null,
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Event Streams require a resource group, `event-stream` resource_group is null."
      );
    });
  });
  describe("clusters", () => {
    it("should throw an error if an openshift cluster has a null cos name", () => {
      let invalidCluster = defaultCluster();
      invalidCluster.cos = null;
      let testData = minimumValidJson({ clusters: [invalidCluster] });
      let task = () => validate(testData);
      assert.throws(
        task,
        "OpenShift clusters require a cos instance. Cluster `workload-cluster` cos is null."
      );
    });
    it("should throw an error if a cluster has a null vpc name", () => {
      let invalidCluster = defaultCluster();
      invalidCluster.vpc = null;
      let testData = minimumValidJson({ clusters: [invalidCluster] });
      let task = () => validate(testData);
      assert.throws(
        task,
        "Clusters require a VPC Name, `workload-cluster` vpc is null."
      );
    });
    it("should throw an error if a cluster has no subnet names", () => {
      let invalidCluster = defaultCluster();
      invalidCluster.subnets = [];
      let testData = minimumValidJson({ clusters: [invalidCluster] });
      let task = () => validate(testData);
      assert.throws(
        task,
        "Clusters require at least one subnet to provision, `workload-cluster` subnets is []."
      );
    });
    it("should throw an error if a cluster has an invalid encryption key (not in kms)", () => {
      let invalidCluster = defaultCluster();
      invalidCluster.encryption_key = "fake-key";
      let testData = minimumValidJson({ clusters: [invalidCluster] });
      let task = () => validate(testData);
      assert.throws(
        task,
        "workload-cluster must reference a key in the kms service slz-kms. fake-key is invalid."
      );
    });
    describe("worker_pools", () => {
      it("should throw an error if a cluster worker pool has no subnet names", () => {
        let invalidCluster = defaultCluster();
        invalidCluster.worker_pools[0].subnets = [];
        let testData = minimumValidJson({ clusters: [invalidCluster] });
        let task = () => validate(testData);
        assert.throws(
          task,
          "Worker Pools require at least one subnet to provision, `workload-cluster` worker_pool `logging-worker-pool` subnets is []."
        );
      });
    });
  });
  describe("ssh_keys", () => {
    it("should throw an error if no resource group", () => {
      let testData = minimumValidJson();
      delete testData.ssh_keys[0].resource_group;
      let task = () => validate(testData);
      assert.throws(
        task,
        "SSH Keys requires a resource group, resource_group missing from JSON."
      );
    });
    it("should throw an error when not using data and invalid public key", () => {
      let testData = minimumValidJson();
      testData.ssh_keys[0].public_key = "hi";
      let task = () => validate(testData);
      assert.throws(task, "Key slz-ssh-key has invalid public key.");
    });
    it("should not throw when using data despite public key", () => {
      let testData = minimumValidJson();
      testData.ssh_keys[0].public_key = "hi";
      testData.ssh_keys[0].use_data = true;
      let task = () => validate(testData);
      assert.doesNotThrow(task);
    });
  });
  describe("security_groups", () => {
    it("should test security groups when added", () => {
      let testData = minimumValidJson({
        security_groups: [
          {
            name: "todd",
            vpc: "management",
            resource_group: "slz-management-rg",
          },
        ],
      });
      let task = () => validate(testData);
      assert.doesNotThrow(task, "it should not throw when all valid");
    });
    it("should convert a security group rule with string port numbers to have number values", () => {
      let testData = minimumValidJson({
        security_groups: [
          {
            rules: [
              {
                vpc: "management",
                sg: "todd",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_min: "80",
                  port_max: "80",
                },
              },
            ],
            name: "todd",
            vpc: "management",
            resource_group: "slz-management-rg",
          },
        ],
      });
      let expectedData = [
        {
          rules: [
            {
              vpc: "management",
              sg: "todd",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              tcp: {
                port_min: 80,
                port_max: 80,
              },
              icmp: {
                code: null,
                type: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
            },
          ],
          name: "todd",
          vpc: "management",
          resource_group: "slz-management-rg",
        },
      ];
      testData.vsi[0].security_groups = ["todd"];
      validate(testData);
      assert.deepEqual(
        testData.security_groups,
        expectedData,
        "should convert port to numbers"
      );
    });
  });
  describe("virtual_private_endpoints", () => {
    it("should throw an error if a vpe has no vpc", () => {
      let testData = minimumValidJson();
      testData.virtual_private_endpoints[0].vpc = null;
      let task = () => validate(testData);
      assert.throws(
        task,
        "virtual_private_endpoints require a VPC Name, `management-cos` vpc is null."
      );
    });
    it("should throw an error if a vpe vpc has no subnets", () => {
      let testData = minimumValidJson();
      testData.virtual_private_endpoints[0].subnets = [];
      let task = () => validate(testData);
      assert.throws(
        task,
        "Virtual Private Endpoints must have at least one VPC subnet. Service name `management-cos` VPC Name `management` has 0."
      );
    });
    it("should throw an error if a vpe vpc has no security groups", () => {
      let testData = minimumValidJson();
      testData.virtual_private_endpoints[0].security_groups = [];
      let task = () => validate(testData);
      assert.throws(
        task,
        "Virtual Private Endpoints must have at least one Security Group. Service name `management-cos` has 0."
      );
    });
  });
  describe("vpn_gateways", () => {
    it("should throw an error if vpn gateway subnet is null", () => {
      let testData = minimumValidJson();
      testData.vpn_gateways[0].subnet = null;
      let task = () => validate(testData);
      assert.throws(
        task,
        "VPN Gateways require a subnet name, `management-gateway` subnet is null."
      );
    });
    it("should throw an error if vpn gateway rg is null", () => {
      let testData = minimumValidJson();
      testData.vpn_gateways[0].resource_group = null;
      let task = () => validate(testData);
      assert.throws(
        task,
        "VPN Gateways require a resource group, `management-gateway` resource_group is null."
      );
    });
    it("should throw an error if vpn gateway subnet is null", () => {
      let testData = minimumValidJson();
      testData.vpn_gateways[0].vpc = null;
      let task = () => validate(testData);
      assert.throws(
        task,
        "VPN Gateways require a VPC Name, `management-gateway` vpc is null."
      );
    });
  });
  describe("scc", () => {
    it("should throw an error if is_public is null and scc is enabled", () => {
      let testData = minimumValidJson({
        scc: {
          enable: true,
          is_public: null,
        },
      });
      let task = () => validate(testData);
      assert.throws(
        task,
        "If enable is true, location and is_public must have valid values."
      );
    });
  });
  describe("vpcs", () => {
    describe("vpcs.acls", () => {
      it("should update acl rules to match compatibility", () => {
        let invalidAcl = defaultAcl();
        let testData = minimumValidJson({
          vpcs: [
            {
              name: "vpc",
              cos: "cos",
              resource_group: "slz-management-rg",
              bucket: "bucket",
              acls: [invalidAcl],
              subnets: [],
              address_prefixes: [],
              public_gateways: [],
            },
          ],
        });
        validate(testData);
        let expectedData = {
          name: "management",
          resource_group: "slz-management-rg",
          vpc: "management",
          rules: [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: null,
                port_min: null,
                source_port_max: null,
                source_port_min: null,
              },
              icmp: {
                code: null,
                type: null,
              },
              udp: {
                port_max: null,
                port_min: null,
                source_port_max: null,
                source_port_min: null,
              },
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
                source_port_max: null,
                source_port_min: null,
              },
              icmp: {
                code: null,
                type: null,
              },
              udp: {
                port_max: null,
                port_min: null,
                source_port_max: null,
                source_port_min: null,
              },
            },
          ],
        };
        assert.deepEqual(testData.vpcs[0].acls[0], expectedData);
      });
    });
  });
  describe("appid", () => {
    it("should throw an error if no resource group", () => {
      let testData = minimumValidJson({
        appid: [
          {
            name: "appid",
            resource_group: null,
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "App ID requires a resource group, App ID resource_group is null."
      );
    });
    it("should not throw an error if valid appid", () => {
      let testData = minimumValidJson({
        appid: [
          {
            name: "appid",
            resource_group: "slz-management-rg",
            use_data: false,
            keys: [],
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.doesNotThrow(task);
    });
  });
  describe("vsi", () => {
    it("should throw an error when no ssh keys are provided", () => {
      let testData = minimumValidJson();
      testData.vsi[0].ssh_keys = [];
      let task = () => validate(testData);
      assert.throws(task, "VSIs must have at least one SSH Key, got 0.");
    });
    it("should throw an error when no subnets are provided", () => {
      let testData = minimumValidJson();
      testData.vsi[0].subnets = [];
      let task = () => validate(testData);
      assert.throws(
        task,
        "VSIs require at least one subnet to provision, `management-server` subnets is []."
      );
    });
    it("should throw an error when sg is not in the same vpc as deployment", () => {
      let testData = minimumValidJson();
      testData.vsi[0].security_groups = ["workload-vpe-sg"];
      let task = () => validate(testData);
      assert.throws(
        task,
        "Security Group workload-vpe-sg not in the same vpc as management-server's VPC, management"
      );
    });
  });
  describe("teleport vsi", () => {
    it("should not throw an error when valid subnet name is provided", () => {
      let testData = minimumValidJson({
        teleport_vsi: [
          {
            name: "test-vsi",
            profile: null,
            image: null,
            resource_group: null,
            security_group: "test-vsi-sg",
            subnet: "vsi-zone-1",
            ssh_keys: [],
            vpc: "management",
            encryption_key: null,
          },
        ],
      });
      let task = () => validate(testData);
      assert.doesNotThrow(task, "it should not throw");
    });
    it("should throw an error when no subnet names are provided", () => {
      let testData = minimumValidJson({
        teleport_vsi: [
          {
            name: "test-vsi",
            profile: null,
            image: null,
            resource_group: "slz-management-rg",
            security_group: "test-vsi-sg",
            encryption_key: "test-ek",
            subnet: null,
            ssh_keys: ["hi"],
            vpc: "management",
          },
        ],
      });
      let task = () => validate(testData);
      assert.throws(
        task,
        "Teleport VSIs must have a valid subnet at subnet, got null."
      );
    });
    it("should not throw when valid teleport", () => {
      let testData = minimumValidJson({
        teleport_vsi: [
          {
            name: "test-vsi",
            image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
            profile: "cx2-4x8",
            resource_group: "slz-management-rg",
            security_group: "management-vpe-sg",
            encryption_key: "slz-vsi-volume-key",
            subnet: "vsi-zone-1",
            ssh_keys: ["slz-ssh-key"],
            vpc: "management",
            security_groups: [],
            subnets: [],
            appid: "test_appid",
            template: {
              app_id: "test_appid",
              as3_declaration_url: "null",
              default_route_gateway_cidr: "10.10.10.10/24",
              do_declaration_url: "null",
              domain: "local",
              hostname: "f5-ve-01",
              license_host: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              license_type: "none",
              license_username: "null",
              phone_home_url: "null",
              template_version: "20210201",
              tgactive_url: "null",
              tgrefresh_url: "null",
              tgstandby_url: "null",
              tmos_admin_password: null,
              ts_declaration_url: "null",
              vpc: "management",
              zone: 1,
              claim_to_roles: [],
            },
          },
        ],
      });
      testData.appid = [
        {
          name: "test_appid",
          resource_group: "slz-management-rg",
          use_data: false,
          keys: [],
        },
      ];
      let task = () => validate(testData);
      assert.doesNotThrow(task);
    });
  });
  describe("f5 vsi", () => {
    it("should throw an error when no ssh keys and subnet names are provided", () => {
      let testData = minimumValidJson({
        f5_vsi: [
          {
            kms: "slz-kms",
            subnet: null,
            vpc: "edge",
            resource_group: "slz-edge-rg",
            ssh_keys: [],
            security_groups: ["f5-management-sg"],
            encryption_key: "slz-vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-ve-01-zone-1",
            image: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
            network_interfaces: [
              {
                subnet: "f5-bastion-zone-1",
                security_groups: ["f5-bastion-sg"],
              },
              {
                subnet: "f5-external-zone-1",
                security_groups: ["f5-external-sg"],
              },
              {
                subnet: "f5-workload-zone-1",
                security_groups: ["f5-workload-sg"],
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 1,
              vpc: "edge",
              do_declaration_url: "hi",
              as3_declaration_url: "hi",
              ts_declaration_url: "hi",
              phone_home_url: "hi",
              tgactive_url: "hi",
              tgstandby_url: "hi",
              tgrefresh_url: "hi",
              template_version: "hi",
              app_id: "hi",
              license_type: "byol",
              license_host: "host",
              license_username: "username",
              license_password: "f5bigip",
              license_pool: "pool",
              license_sku_keyword_1: "key",
              license_sku_keyword_2: "word",
              tmos_admin_password: "Goodpassword1234!",
            },
          },
        ],
      });
      let task = () => validate(testData);
      assert.throws(task, "F5 VSIs must have at least one SSH Key, got 0.");
    });
    it("should validate a valid f5 nw", () => {
      let task = () => validate(f5nw);
      assert.doesNotThrow(task, "it does not throw");
    });
  });
  describe("load_balancers", () => {
    it("should not throw when valid lb", () => {
      let testData = minimumValidJson({
        load_balancers: [
          {
            name: "lb-1",
            vpc: "management",
            type: "public",
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vsi_per_subnet: 2,
            security_groups: ["management-vpe-sg"],
            resource_group: "slz-management-rg",
            algorithm: "round_robin",
            protocol: "tcp",
            health_delay: 60,
            health_retries: 5,
            health_timeout: 30,
            health_type: "https",
            proxy_protocol: "v1",
            session_persistence_type: "app_cookie",
            session_persistence_app_cookie_name: "cookie1",
            port: 80,
            target_vsi: ["management-server"],
            listener_port: 443,
            listener_protocol: "https",
            connection_limit: 2,
          },
        ],
      });
      let task = () => validate(testData);
      assert.doesNotThrow(task);
    });
  });
  describe("event_streams", () => {
    it("should not throw when valid event stream", () => {
      let testData = minimumValidJson({
        event_streams: [
          {
            name: "es-1",
            resource_group: "slz-management-rg",
          },
        ],
      });
      let task = () => validate(testData);
      assert.doesNotThrow(task);
    });
  });
  describe("addUnfoundListFields", () => {
    it("should add unfound fields to valid json", () => {
      let testData = minimumValidJson({
        clusters: [
          {
            kms: "slz-kms",
            cos: "cos",
            entitlement: "cloud_pak",
            type: "openshift",
            kube_version: "default",
            flavor: "bx2.16x64",
            name: "workload-cluster",
            resource_group: "slz-workload-rg",
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            update_all_workers: false,
            vpc: "workload",
            encryption_key: "slz-slz-key",
            worker_pools: [
              {
                resource_group: "slz-workload-rg",
                cluster: "workload-cluster",
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc: "workload",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
          {
            kms: "slz-kms",
            cos: "cos",
            entitlement: "cloud_pak",
            type: "openshift",
            kube_version: "default",
            flavor: "bx2.16x64",
            name: "workload-cluster-two",
            resource_group: "slz-workload-rg",
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            update_all_workers: false,
            vpc: "management",
            encryption_key: "slz-slz-key",
            worker_pools: [
              {
                resource_group: "slz-workload-rg",
                cluster: "workload-cluster-two",
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc: "workload",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
        ],
      });
      validate(testData);
      assert.deepEqual(
        splat(testData.resource_groups, "use_prefix"),
        [false, false, false],
        "it should set value"
      );
      assert.deepEqual(
        testData.clusters,
        [
          {
            kms: "slz-kms",
            cos: "cos",
            entitlement: "cloud_pak",
            type: "openshift",
            kube_version: "default",
            flavor: "bx2.16x64",
            name: "workload-cluster",
            resource_group: "slz-workload-rg",
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            update_all_workers: false,
            vpc: "workload",
            private_endpoint: true,
            encryption_key: "slz-slz-key",
            worker_pools: [
              {
                cluster: "workload-cluster",
                resource_group: "slz-workload-rg",
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc: "workload",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
          {
            kms: "slz-kms",
            cos: "cos",
            entitlement: "cloud_pak",
            type: "openshift",
            kube_version: "default",
            flavor: "bx2.16x64",
            name: "workload-cluster-two",
            resource_group: "slz-workload-rg",
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            update_all_workers: false,
            encryption_key: "slz-slz-key",
            private_endpoint: true,
            vpc: "management",
            worker_pools: [
              {
                resource_group: "slz-workload-rg",
                cluster: "workload-cluster-two",
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc: "workload",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
        ],
        "it should set kms config"
      );
    });
  });
  describe("error", () => {
    it("should call sendError on parent function if provided", () => {
      let parent = {
        sendError: function (message) {
          throw new Error(message);
        },
      };
      let testData = minimumValidJson({
        vpcs: [
          {
            name: null,
            bucket: "",
            cos: "",
            resource_group: "",
          },
        ],
      });
      let task = () => {
        validate(testData, parent);
      };
      assert.throws(
        task,
        "Cannot read properties of undefined (reading 'forEach')"
      );
    });
  });
  describe("key_management", () => {
    it("should set use data to true if not found and using hs crypto", () => {
      let overrideJson = minimumValidJson();
      overrideJson.key_management[0].use_hs_crypto = true;
      validate(overrideJson);
      assert.isTrue(
        overrideJson.key_management[0].use_data,
        "use data should be true"
      );
    });
    it("should throw an error if no resource group", () => {
      let testData = minimumValidJson({
        key_management: [
          {
            name: "asdf",
            resource_group: null,
          },
        ],
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Key Management require a resource group, `asdf` resource_group is null."
      );
    });
  });
  describe("resource_groups", () => {
    it("should set use prefix to false if null", () => {
      let overrideJson = minimumValidJson();
      overrideJson.resource_groups[0].use_prefix = null;
      validate(overrideJson);
      assert.isFalse(
        overrideJson.resource_groups[0].use_prefix,
        "use data should be false"
      );
    });
  });
  describe("set unfound fields", () => {
    it("should set appid if not found", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.appid;
      let actualData = validate(goodOverride);
      let expectedAppId = [];
      assert.deepEqual(actualData.appid, expectedAppId, "it should set appid");
    });
    it("should set secrets_manager if not found", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.secrets_manager;
      let actualData = validate(goodOverride);
      let expectedData = [];
      assert.deepEqual(
        actualData.secrets_manager,
        expectedData,
        "it should set secrets manager"
      );
    });
    it("should set scc if not found", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.scc;
      let actualData = validate(goodOverride);
      let expectedData = {
        collector_description: null,
        credential_description: null,
        passphrase: null,
        enable: false,
        is_public: false,
        location: [],
        scope_description: null,
        id: null,
      };
      assert.deepEqual(actualData.scc, expectedData, "it should set scc");
    });
    it("should set scc enable false if scc found but enable missing", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.scc;
      goodOverride.scc = {};
      let actualData = validate(goodOverride);
      let expectedData = {
        enable: false,
      };
      assert.deepEqual(actualData.scc, expectedData, "it should set scc");
    });
    it("should add scc fields if enable true and missing", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.scc;
      goodOverride.scc = {
        name: "",
        enable: true,
        credential_description: "hi",
      };
      let actualData = validate(goodOverride);
      let expectedData = {
        name: "",
        credential_description: "hi",
        collector_description: null,
        passphrase: null,
        enable: true,
        scope_description: null,
        id: null,
      };
      assert.deepEqual(actualData.scc, expectedData, "it should set scc");
    });
    it("should set iam_account_settings if not found", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.iam_account_settings;
      let actualData = validate(goodOverride);
      let expectedData = {
        enable: false,
        mfa: null,
        allowed_ip_addresses: null,
        include_history: null,
        if_match: null,
        max_sessions_per_identity: null,
        restrict_create_service_id: null,
        restrict_create_platform_apikey: null,
        session_expiration_in_seconds: null,
        session_invalidation_in_seconds: null,
      };
      assert.deepEqual(
        actualData.iam_account_settings,
        expectedData,
        "it should set appid"
      );
    });
    it("should not touch iam_account_settings if found", () => {
      let json = minimumValidJson();
      validate(json);
      assert.deepEqual(json.iam_account_settings, []);
    });
    it("should set access_groups if not found", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.access_groups;
      let actualData = validate(goodOverride);
      assert.deepEqual(
        actualData.access_groups,
        [],
        "it should set access_groups"
      );
    });
    it("should not update access_groups if found", () => {
      let json = minimumValidJson();
      validate(json);
      assert.deepEqual(json.access_groups, []);
    });
    it("should set teleport_vsi if not found", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.teleport_vsi;
      let actualData = validate(goodOverride);
      assert.deepEqual(
        actualData.teleport_vsi,
        [],
        "it should set teleport_vsi"
      );
    });
    it("should set event_streams if not found", () => {
      let goodOverride = minimumValidJson();
      delete goodOverride.event_streams;
      let actualData = validate(goodOverride);
      assert.deepEqual(
        actualData.event_streams,
        [],
        "it should set event_streams"
      );
    });
  });
});
