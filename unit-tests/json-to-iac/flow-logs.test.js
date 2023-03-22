const { assert } = require("chai");
const {
  formatFlowLogs,
  formatFlowLogsPolicy,
  flowLogsTf,
} = require("../../client/src/lib/json-to-iac/flow-logs");
const slzNetwork = require("../data-files/slz-network.json");
describe("flow logs", () => {
  describe("formatFlowLogs", () => {
    it("should create flow logs terraform", () => {
      let actualData = formatFlowLogs(
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
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "iac-management-vpc-logs"
  target         = ibm_is_vpc.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["hello","world"]

  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct code"
      );
    });
    it("should create flow logs terraform when no cos but bucket", () => {
      let actualData = formatFlowLogs(
        {
          cos: null,
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
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "iac-management-vpc-logs"
  target         = ibm_is_vpc.management_vpc.id
  active         = true
  storage_bucket = ERROR: Unfound ref
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["hello","world"]
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct code"
      );
    });
    it("should create flow logs terraform when no bucket but cos", () => {
      let actualData = formatFlowLogs(
        {
          cos: "null",
          bucket: null,
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
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "iac-management-vpc-logs"
  target         = ibm_is_vpc.management_vpc.id
  active         = true
  storage_bucket = ERROR: Unfound ref
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["hello","world"]
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct code"
      );
    });
  });
  describe("formatFlowLogsPolicy", () => {
    it("should create flow logs terraform", () => {
      let actualData = formatFlowLogsPolicy("cos", {
        _options: {
          prefix: "iac",
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            use_prefix: false,
            name: "slz-service-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-management-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-workload-rg",
            use_data: false,
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
      });
      let expectedData = `
resource "ibm_iam_authorization_policy" "flow_logs_to_cos_object_storage_policy" {
  source_service_name         = "is"
  source_resource_type        = "flow-log-collector"
  description                 = "Allow flow logs write access cloud object storage instance"
  roles                       = ["Writer"]
  target_service_name         = "cloud-object-storage"
  target_resource_instance_id = split(":", ibm_resource_instance.cos_object_storage.id)[7]
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct code"
      );
    });
  });
  describe("flowLogsTf", () => {
    it("should create tf for flow logs", () => {
      let actualData = flowLogsTf(slzNetwork);
      let expectedData = `##############################################################################
# Flow Logs Resources
##############################################################################

resource "ibm_iam_authorization_policy" "flow_logs_to_cos_object_storage_policy" {
  source_service_name         = "is"
  source_resource_type        = "flow-log-collector"
  description                 = "Allow flow logs write access cloud object storage instance"
  roles                       = ["Writer"]
  target_service_name         = "cloud-object-storage"
  target_resource_instance_id = split(":", ibm_resource_instance.cos_object_storage.id)[7]
}

resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "slz-management-vpc-logs"
  target         = ibm_is_vpc.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["slz","landing-zone"]

  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}

resource "ibm_is_flow_log" "workload_flow_log_collector" {
  name           = "slz-workload-vpc-logs"
  target         = ibm_is_vpc.workload_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.slz_workload_rg.id
  tags           = ["slz","landing-zone"]

  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
  });
});
