const { assert } = require("chai");
const {
  formatCluster,
  formatWorkerPool,
  clusterTf,
} = require("../../client/src/lib/json-to-iac/clusters");
let slzNetwork = { ...require("../data-files/slz-network.json") };

describe("clusters", () => {
  describe("formatCluster", () => {
    it("should create terraform code for openshift cluster", () => {
      let actualData = formatCluster(
        {
          kms: "slz-kms",
          cos: "cos",
          entitlement: "cloud_pak",
          type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "workload-cluster",
          resource_group: "slz-workload-rg",
          encryption_key: "slz-vsi-volume-key",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "workload",
          worker_pools: [],
          workers_per_subnet: 2,
          private_endpoint: false,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_container_vpc_cluster" "workload_vpc_workload_cluster_cluster" {
  name                            = "slz-workload-cluster-cluster"
  vpc_id                          = module.workload_vpc.id
  resource_group_id               = ibm_resource_group.slz_workload_rg.id
  flavor                          = "bx2.16x64"
  worker_count                    = 2
  kube_version                    = "default"
  wait_till                       = "IngressReady"
  disable_public_service_endpoint = false
  entitlement                     = "cloud_pak"
  cos_instance_crn                = ibm_resource_instance.cos_object_storage.crn
  update_all_workers              = null
  tags = [
    "slz",
    "landing-zone"
  ]
  zones {
    name      = "us-south-1"
    subnet_id = module.workload_vpc.vsi_zone_1_id
  }
  zones {
    name      = "us-south-2"
    subnet_id = module.workload_vpc.vsi_zone_2_id
  }
  zones {
    name      = "us-south-3"
    subnet_id = module.workload_vpc.vsi_zone_3_id
  }
  timeouts {
    create = "3h"
    update = "3h"
    delete = "2h"
  }
  kms_config {
    crk_id           = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
    instance_id      = ibm_resource_instance.slz_kms.guid
    private_endpoint = false
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create terraform code for iks cluster with private endpoint", () => {
      let actualData = formatCluster(
        {
          kms: "slz-kms",
          cos: null,
          entitlement: "cloud_pak",
          type: "iks",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "workload",
          resource_group: "slz-workload-rg",
          encryption_key: "slz-vsi-volume-key",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: true,
          vpc: "workload",
          worker_pools: [],
          workers_per_subnet: 2,
          private_endpoint: true,
        },
        {
          _options: {
            prefix: "slz",
            region: "us-south",
            tags: ["slz", "landing-zone"],
          },
          resource_groups: [
            {
              use_prefix: true,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: true,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: true,
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
              use_random_suffix: "false",
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
              use_random_suffix: "false",
              kms: "slz-kms",
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
              vpc: "management",
              service: "cos",
              resource_group: "slz-management-rg",
              security_groups: ["management-vpe-sg"],
              subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
            },
            {
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
              public_key: "public-key",
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
              type: "iks",
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
          teleport_vsi: [],
          scc: {
            name: "",
          },
          event_streams: [],
          load_balancers: [],
        }
      );
      let expectedData = `
resource "ibm_container_vpc_cluster" "workload_vpc_workload_cluster" {
  name                            = "slz-workload-cluster"
  vpc_id                          = module.workload_vpc.id
  resource_group_id               = ibm_resource_group.slz_workload_rg.id
  flavor                          = "bx2.16x64"
  worker_count                    = 2
  kube_version                    = "default"
  update_all_workers              = true
  wait_till                       = "IngressReady"
  disable_public_service_endpoint = true
  tags = [
    "slz",
    "landing-zone"
  ]
  zones {
    name      = "us-south-1"
    subnet_id = module.workload_vpc.vsi_zone_1_id
  }
  zones {
    name      = "us-south-2"
    subnet_id = module.workload_vpc.vsi_zone_2_id
  }
  zones {
    name      = "us-south-3"
    subnet_id = module.workload_vpc.vsi_zone_3_id
  }
  timeouts {
    create = "3h"
    update = "3h"
    delete = "2h"
  }
  kms_config {
    crk_id           = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
    instance_id      = ibm_resource_instance.slz_kms.guid
    private_endpoint = true
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatWorkerPool", () => {
    it("should create terraform code for worker pool", () => {
      let actualData = formatWorkerPool(
        {
          entitlement: "cloud_pak",
          cluster: "workload",
          flavor: "bx2.16x64",
          name: "logging-pool",
          resource_group: "slz-workload-rg",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: true,
          vpc: "workload",
          workers_per_subnet: 2,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_container_vpc_worker_pool" "workload_vpc_workload_cluster_logging_pool_pool" {
  worker_pool_name  = "slz-workload-cluster-logging-pool"
  vpc_id            = module.workload_vpc.id
  resource_group_id = ibm_resource_group.slz_workload_rg.id
  cluster           = ibm_container_vpc_cluster.workload_vpc_workload_cluster.id
  flavor            = "bx2.16x64"
  worker_count      = 2
  entitlement       = "cloud_pak"
  zones {
    name      = "us-south-1"
    subnet_id = module.workload_vpc.vsi_zone_1_id
  }
  zones {
    name      = "us-south-2"
    subnet_id = module.workload_vpc.vsi_zone_2_id
  }
  zones {
    name      = "us-south-3"
    subnet_id = module.workload_vpc.vsi_zone_3_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("clusterTf", () => {
    it("should return cluster terraform", () => {
      let actualData = clusterTf(slzNetwork);
      let expectedData = `##############################################################################
# Workload Cluster
##############################################################################

resource "ibm_container_vpc_cluster" "workload_vpc_workload_cluster" {
  name                            = "slz-workload-cluster"
  vpc_id                          = module.workload_vpc.id
  resource_group_id               = ibm_resource_group.slz_workload_rg.id
  flavor                          = "bx2.16x64"
  worker_count                    = 2
  kube_version                    = "default"
  wait_till                       = "IngressReady"
  disable_public_service_endpoint = false
  entitlement                     = "cloud_pak"
  cos_instance_crn                = ibm_resource_instance.cos_object_storage.crn
  update_all_workers              = null
  tags = [
    "slz",
    "landing-zone"
  ]
  zones {
    name      = "us-south-1"
    subnet_id = module.workload_vpc.vsi_zone_1_id
  }
  zones {
    name      = "us-south-2"
    subnet_id = module.workload_vpc.vsi_zone_2_id
  }
  zones {
    name      = "us-south-3"
    subnet_id = module.workload_vpc.vsi_zone_3_id
  }
  timeouts {
    create = "3h"
    update = "3h"
    delete = "2h"
  }
  kms_config {
    crk_id           = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
    instance_id      = ibm_resource_instance.slz_kms.guid
    private_endpoint = false
  }
}

resource "ibm_container_vpc_worker_pool" "workload_vpc_workload_cluster_logging_pool_pool" {
  worker_pool_name  = "slz-workload-cluster-logging-pool"
  vpc_id            = module.workload_vpc.id
  resource_group_id = ibm_resource_group.slz_workload_rg.id
  cluster           = ibm_container_vpc_cluster.workload_vpc_workload_cluster.id
  flavor            = "bx2.16x64"
  worker_count      = 2
  entitlement       = "cloud_pak"
  zones {
    name      = "us-south-1"
    subnet_id = module.workload_vpc.vsi_zone_1_id
  }
  zones {
    name      = "us-south-2"
    subnet_id = module.workload_vpc.vsi_zone_2_id
  }
  zones {
    name      = "us-south-3"
    subnet_id = module.workload_vpc.vsi_zone_3_id
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("other use cases", () => {
    it("should create terraform code for iks worker pool", () => {
      let actualData = formatWorkerPool(
        {
          entitlement: "cloud_pak",
          cluster: "workload",
          flavor: "bx2.16x64",
          name: "logging-pool",
          resource_group: "slz-workload-rg",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: true,
          vpc: "workload",
          workers_per_subnet: 2,
        },
        {
          _options: {
            prefix: "slz",
            region: "us-south",
            tags: ["slz", "landing-zone"],
          },
          resource_groups: [
            {
              use_prefix: true,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: true,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: true,
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
              use_random_suffix: "false",
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
              use_random_suffix: "false",
              kms: "slz-kms",
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
              vpc: "management",
              service: "cos",
              resource_group: "slz-management-rg",
              security_groups: ["management-vpe-sg"],
              subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
            },
            {
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
              public_key: "public-key",
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
              type: "iks",
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
          teleport_vsi: [],
          scc: {
            name: "",
          },
          event_streams: [],
          load_balancers: [],
        }
      );

      let expectedData = `
resource "ibm_container_vpc_worker_pool" "workload_vpc_workload_cluster_logging_pool_pool" {
  worker_pool_name  = "slz-workload-cluster-logging-pool"
  vpc_id            = module.workload_vpc.id
  resource_group_id = ibm_resource_group.slz_workload_rg.id
  cluster           = ibm_container_vpc_cluster.workload_vpc_workload_cluster.id
  flavor            = "bx2.16x64"
  worker_count      = 2
  zones {
    name      = "us-south-1"
    subnet_id = module.workload_vpc.vsi_zone_1_id
  }
  zones {
    name      = "us-south-2"
    subnet_id = module.workload_vpc.vsi_zone_2_id
  }
  zones {
    name      = "us-south-3"
    subnet_id = module.workload_vpc.vsi_zone_3_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
