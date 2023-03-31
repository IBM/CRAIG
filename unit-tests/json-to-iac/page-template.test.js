const { assert } = require("chai");
const {
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
} = require("../../client/src/lib/json-to-iac/page-template");

describe("page template", () => {
  describe("vpc", () => {
    describe("codeMirrorVpcTf", () => {
      it("should create vpc code mirror terraform with public gateway", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
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
              publicGateways: [1],
              public_gateways: [
                {
                  vpc: "management",
                  zone: 1,
                  resource_group: "management-rg",
                },
              ],
            },
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = ibm_resource_group.management_rg.id
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags                        = ["hello","world"]
  address_prefix_management   = "manual"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "iac-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.management_rg.id
  zone           = "us-south-1"
  tags           = ["hello","world"]
}

##############################################################################

##############################################################################
# Management Flow Logs
##############################################################################

resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "iac-management-vpc-logs"
  target         = ibm_is_vpc.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.management_rg.id
  tags           = ["hello","world"]

  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorVpcTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
      it("should create vpc code mirror terraform without public gateway", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
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
              publicGateways: [],
            },
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = ibm_resource_group.management_rg.id
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags                        = ["hello","world"]
  address_prefix_management   = "manual"
}

##############################################################################

##############################################################################
# Management Flow Logs
##############################################################################

resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "iac-management-vpc-logs"
  target         = ibm_is_vpc.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.management_rg.id
  tags           = ["hello","world"]

  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorVpcTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
    });
    describe("codeMirrorAclTf", () => {
      it("should create vpc acl code mirror terraform", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
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
              publicGateways: [],
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
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "iac-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.management_rg.id
  tags           = ["hello","world"]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
  source      = "161.26.0.0/16"
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_all_network_inbound" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-all-network-inbound"
  source      = "10.0.0.0/8"
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_all_outbound" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "0.0.0.0/0"
  direction   = "outbound"
  name        = "allow-all-outbound"
  source      = "0.0.0.0/0"
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorAclTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
    });
    describe("codeMirrorSubnetsTf", () => {
      it("should create vpc subnets code mirror terraform", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
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
              publicGateways: [],
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
                  cidr: "10.30.20.0/24",
                  name: "vpe-zone-3",
                  network_acl: "management",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: true,
                },
              ],
            },
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_subnet" "management_vsi_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-zone-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_1_prefix.cidr
}

resource "ibm_is_subnet" "management_vpn_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpn-zone-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpn_zone_1_prefix.cidr
}

resource "ibm_is_subnet" "management_vsi_zone_2" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-zone-2"
  zone            = "us-south-2"
  resource_group  = ibm_resource_group.management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_2_prefix.cidr
}

resource "ibm_is_subnet" "management_vsi_zone_3" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-zone-3"
  zone            = "us-south-3"
  resource_group  = ibm_resource_group.management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_3_prefix.cidr
}

resource "ibm_is_subnet" "management_vpe_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpe-zone-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_1_prefix.cidr
}

resource "ibm_is_subnet" "management_vpe_zone_2" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpe-zone-2"
  zone            = "us-south-2"
  resource_group  = ibm_resource_group.management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_2_prefix.cidr
}

resource "ibm_is_subnet" "management_vpe_zone_3" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpe-zone-3"
  zone            = "us-south-3"
  resource_group  = ibm_resource_group.management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_3_prefix.cidr
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorSubnetsTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
    });
  });
});
