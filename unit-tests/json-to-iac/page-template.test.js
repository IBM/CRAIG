const { assert } = require("chai");
const {
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
  codeMirrorGetDisplay,
} = require("../../client/src/lib/json-to-iac/page-template");
const resourceGroupTf = require("../../client/src/lib/json-to-iac/resource-groups");
const { f5Tf, cbrTf, loggingMonitoringTf } = require("../../client/src/lib");

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
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.management_rg_id
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "\${var.prefix}-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# Management Flow Logs
##############################################################################

resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "\${var.prefix}-management-vpc-logs"
  target         = module.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.management_rg.id
  tags = [
    "hello",
    "world"
  ]
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
      it("should create vpc code mirror terraform with disabled flow logs", () => {
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
              bucket: "$disabled",
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
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.management_rg_id
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "\${var.prefix}-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.management_rg_id
  zone           = "\${var.region}-1"
  tags = [
    "hello",
    "world"
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
  name                        = "\${var.prefix}-management-vpc"
  resource_group              = var.management_rg_id
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# Management Flow Logs
##############################################################################

resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "\${var.prefix}-management-vpc-logs"
  target         = module.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.management_rg.id
  tags = [
    "hello",
    "world"
  ]
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
  name           = "\${var.prefix}-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.management_rg_id
  tags = [
    "hello",
    "world"
  ]
  rules {
    source      = "161.26.0.0/16"
    action      = "allow"
    destination = "10.0.0.0/8"
    direction   = "inbound"
    name        = "allow-ibm-inbound"
  }
  rules {
    source      = "10.0.0.0/8"
    action      = "allow"
    destination = "10.0.0.0/8"
    direction   = "inbound"
    name        = "allow-all-network-inbound"
  }
  rules {
    source      = "0.0.0.0/0"
    action      = "allow"
    destination = "0.0.0.0/0"
    direction   = "outbound"
    name        = "allow-all-outbound"
  }
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
  name            = "\${var.prefix}-management-vsi-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_1_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpn_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vpn-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpn_zone_1_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_zone_2" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_2_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_zone_3" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vsi-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_3_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpe_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vpe-zone-1"
  zone            = "\${var.region}-1"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_1_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpe_zone_2" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vpe-zone-2"
  zone            = "\${var.region}-2"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_2_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpe_zone_3" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "\${var.prefix}-management-vpe-zone-3"
  zone            = "\${var.region}-3"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_3_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
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
  describe("codeMirrorEventStreamsTf", () => {
    it("should return empty string when event streams length is 0", () => {
      let testData = { event_streams: [] };
      let expectedData = ``;
      assert.deepEqual(
        codeMirrorEventStreamsTf(testData),
        expectedData,
        "it should return an empty string"
      );
    });
    it("should return event streams tf", () => {
      let testData = {
        _options: {
          tags: ["hello", "world"],
          prefix: "iac",
          region: "us-south",
          endpoints: "private",
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
        event_streams: [
          {
            name: "event-streams",
            plan: "enterprise",
            resource_group: "slz-service-rg",
            private_ip_allowlist: ["10.0.0.0/32", "10.0.0.1/32"],
            throughput: "150MB/s",
            storage_size: "2TB",
          },
        ],
      };
      let expectedData = `##############################################################################
# Event Streams
##############################################################################

resource "ibm_resource_instance" "event_streams_es" {
  name              = "\${var.prefix}-event-streams"
  service           = "messagehub"
  plan              = "enterprise"
  location          = var.region
  resource_group_id = ibm_resource_group.slz_service_rg.id
  parameters = {
    service-endpoints    = "private"
    private_ip_allowlist = "[10.0.0.0/32,10.0.0.1/32]"
    throughput           = "150"
    storage_size         = "2048"
  }
  timeouts {
    create = "3h"
    update = "1h"
    delete = "1h"
  }
}

##############################################################################
`;
      assert.deepEqual(
        codeMirrorEventStreamsTf(testData),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("codeMirrorFormatIamAccountSettingsTf", () => {
    it("should return correct terraform", () => {
      let testData = {
        iam_account_settings: {
          enable: true,
          mfa: "NONE",
          allowed_ip_addresses: "1.2.3.4,5.6.7.8",
          include_history: true,
          if_match: 2,
          max_sessions_per_identity: 2,
          restrict_create_service_id: "RESTRICTED",
          restrict_create_platform_apikey: "RESTRICTED",
          session_expiration_in_seconds: 900,
          session_invalidation_in_seconds: 900,
        },
      };
      let expectedData = `
resource "ibm_iam_account_settings" "iam_account_settings" {
  mfa                             = "NONE"
  allowed_ip_addresses            = "1.2.3.4,5.6.7.8"
  include_history                 = true
  if_match                        = 2
  max_sessions_per_identity       = 2
  restrict_create_service_id      = "RESTRICTED"
  restrict_create_platform_apikey = "RESTRICTED"
  session_expiration_in_seconds   = 900
  session_invalidation_in_seconds = 900
}
`;
      assert.deepEqual(
        codeMirrorFormatIamAccountSettingsTf(testData),
        expectedData,
        "should return iam account settings terraform"
      );
    });
  });
  describe("codeMirrorGetDisplay", () => {
    it("should return correct terraform for home page", () => {
      let testData = {};
      let expectedData = `{}`;
      assert.deepEqual(
        codeMirrorGetDisplay(testData, false, undefined, undefined, undefined),
        expectedData,
        "should return code mirror display"
      );
    });
    it("should return correct terraform for nacl when jsonInCodeMirror is true", () => {
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
      let expectedData = `[
  {
    "resource_group": "management-rg",
    "name": "management",
    "vpc": "management",
    "rules": [
      {
        "action": "allow",
        "destination": "10.0.0.0/8",
        "direction": "inbound",
        "name": "allow-ibm-inbound",
        "source": "161.26.0.0/16",
        "acl": "management",
        "vpc": "management",
        "icmp": {
          "type": null,
          "code": null
        },
        "tcp": {
          "port_min": null,
          "port_max": null,
          "source_port_min": null,
          "source_port_max": null
        },
        "udp": {
          "port_min": null,
          "port_max": null,
          "source_port_min": null,
          "source_port_max": null
        }
      },
      {
        "action": "allow",
        "destination": "10.0.0.0/8",
        "direction": "inbound",
        "name": "allow-all-network-inbound",
        "source": "10.0.0.0/8",
        "acl": "management",
        "vpc": "management",
        "icmp": {
          "type": null,
          "code": null
        },
        "tcp": {
          "port_min": null,
          "port_max": null,
          "source_port_min": null,
          "source_port_max": null
        },
        "udp": {
          "port_min": null,
          "port_max": null,
          "source_port_min": null,
          "source_port_max": null
        }
      },
      {
        "action": "allow",
        "destination": "0.0.0.0/0",
        "direction": "outbound",
        "name": "allow-all-outbound",
        "source": "0.0.0.0/0",
        "acl": "management",
        "vpc": "management",
        "icmp": {
          "type": null,
          "code": null
        },
        "tcp": {
          "port_min": null,
          "port_max": null,
          "source_port_min": null,
          "source_port_max": null
        },
        "udp": {
          "port_min": null,
          "port_max": null,
          "source_port_min": null,
          "source_port_max": null
        }
      }
    ]
  }
]`;
      assert.deepEqual(
        codeMirrorGetDisplay(
          testData,
          true,
          "/form/nacls",
          codeMirrorAclTf,
          undefined
        ),
        expectedData,
        "should return code mirror display"
      );
    });
    it("should return correct terraform for subnets when jsonInCodeMirror is true", () => {
      let testData = {
        vpcs: [
          {
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
                cidr: "10.60.20.0/24",
                name: "vpe-zone-3",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: true,
              },
            ],
          },
        ],
      };
      let expectedData = `[
  {
    "vpc": "workload",
    "zone": 1,
    "cidr": "10.40.10.0/24",
    "name": "vsi-zone-1",
    "network_acl": "workload",
    "resource_group": "workload-rg",
    "public_gateway": false,
    "has_prefix": true
  },
  {
    "vpc": "workload",
    "zone": 2,
    "cidr": "10.50.10.0/24",
    "name": "vsi-zone-2",
    "network_acl": "workload",
    "resource_group": "workload-rg",
    "public_gateway": false,
    "has_prefix": true
  },
  {
    "vpc": "workload",
    "zone": 3,
    "cidr": "10.60.10.0/24",
    "name": "vsi-zone-3",
    "network_acl": "workload",
    "resource_group": "workload-rg",
    "public_gateway": false,
    "has_prefix": true
  },
  {
    "vpc": "workload",
    "zone": 1,
    "cidr": "10.40.20.0/24",
    "name": "vpe-zone-1",
    "network_acl": "workload",
    "resource_group": "workload-rg",
    "public_gateway": false,
    "has_prefix": true
  },
  {
    "vpc": "workload",
    "zone": 2,
    "cidr": "10.50.20.0/24",
    "name": "vpe-zone-2",
    "network_acl": "workload",
    "resource_group": "workload-rg",
    "public_gateway": false,
    "has_prefix": true
  },
  {
    "vpc": "workload",
    "zone": 3,
    "cidr": "10.60.20.0/24",
    "name": "vpe-zone-3",
    "network_acl": "workload",
    "resource_group": "workload-rg",
    "public_gateway": false,
    "has_prefix": true
  }
]`;
      assert.deepEqual(
        codeMirrorGetDisplay(
          testData,
          true,
          "/form/subnets",
          codeMirrorSubnetsTf,
          undefined
        ),
        expectedData,
        "should return code mirror display"
      );
    });
    it("should return correct terraform for resource_groups when jsonInCodeMirror is true", () => {
      let testData = {
        _options: {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 3,
        },
        resource_groups: [
          {
            use_prefix: true,
            name: "service-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "workload-rg",
            use_data: false,
          },
        ],
        f5_vsi: [{}],
      };
      let expectedData = `[
  {
    "use_prefix": true,
    "name": "service-rg",
    "use_data": false
  },
  {
    "use_prefix": true,
    "name": "management-rg",
    "use_data": false
  },
  {
    "use_prefix": true,
    "name": "workload-rg",
    "use_data": false
  }
]`;
      assert.deepEqual(
        codeMirrorGetDisplay(
          testData,
          true,
          "/form/resourceGroups",
          resourceGroupTf,
          "resource_groups"
        ),
        expectedData,
        "should return code mirror display"
      );
    });
    it("should return correct terraform for resource_groups page", () => {
      let testData = {
        _options: {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 3,
        },
        resource_groups: [
          {
            use_prefix: true,
            name: "service-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "workload-rg",
            use_data: false,
          },
        ],
      };
      let expectedData = `##############################################################################
# Resource Groups
##############################################################################

resource "ibm_resource_group" "service_rg" {
  name = "\${var.prefix}-service-rg"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_resource_group" "management_rg" {
  name = "\${var.prefix}-management-rg"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_resource_group" "workload_rg" {
  name = "\${var.prefix}-workload-rg"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        codeMirrorGetDisplay(
          testData,
          false,
          "/form/resourceGroups",
          resourceGroupTf,
          "resource_groups"
        ),
        expectedData,
        "should return code mirror display"
      );
    });
    it("should return correct terraform for f5 when jsonInCodeMirror is true and tmos_admin_password is not undefined", () => {
      let testData = {
        f5_vsi: [
          {
            tmos_admin_password: "secretpassword",
            license_password: "secretpassword",
          },
        ],
      };
      let expectedData = `[
  {
    "tmos_admin_password": "****************************",
    "license_password": "****************************"
  }
]`;
      assert.deepEqual(
        codeMirrorGetDisplay(testData, true, "/form/f5", f5Tf, "f5_vsi"),
        expectedData,
        "should return code mirror display"
      );
    });
    it("should return correct terraform for f5 when pageObj.jsonField is undefined", () => {
      let testData = {
        f5_vsi: [
          {
            tmos_admin_password: "secretpassword",
            license_password: "null",
          },
        ],
      };
      let expectedData = `{
  "f5_vsi": [
    {
      "tmos_admin_password": "****************************",
      "license_password": "null"
    }
  ]
}`;
      assert.deepEqual(
        codeMirrorGetDisplay(testData, true, "/form/f5", f5Tf, undefined),
        expectedData,
        "should return code mirror display"
      );
    });
  });
  it("should return correct cbr json", () => {
    let testData = {
      cbr_zones: [
        {
          name: "adfadsf",
          description: "",
          account_id: "asdfsdf",
          addresses: [],
          exclusions: [],
        },
      ],
      cbr_rules: [],
    };
    let expectedData = `[
  {
    "cbr_zones": [
      {
        "name": "adfadsf",
        "description": "",
        "account_id": "asdfsdf",
        "addresses": [],
        "exclusions": []
      }
    ]
  },
  {
    "cbr_rules": []
  }
]`;
    assert.deepEqual(
      codeMirrorGetDisplay(testData, true, "/form/cbr", cbrTf, undefined),
      expectedData,
      "should return code mirror display"
    );
  });
  it("should return correct observability json", () => {
    let testData = {
      logdna: {
        enabled: true,
        plan: "lite",
        endpoints: "private",
        platform_logs: false,
        resource_group: "service-rg",
        cos: "atracker-cos",
        bucket: "atracker-bucket",
      },
      sysdig: {
        enabled: true,
        plan: "tier-1",
        resource_group: "service-rg",
      },
    };
    let expectedData = `{
  "logdna": {
    "enabled": true,
    "plan": "lite",
    "endpoints": "private",
    "platform_logs": false,
    "resource_group": "service-rg",
    "cos": "atracker-cos",
    "bucket": "atracker-bucket"
  },
  "sysdig": {
    "enabled": true,
    "plan": "tier-1",
    "resource_group": "service-rg"
  }
}`;
    assert.deepEqual(
      codeMirrorGetDisplay(
        testData,
        true,
        "/form/observability",
        loggingMonitoringTf,
        undefined
      ),
      expectedData,
      "should return code mirror display"
    );
  });
});
