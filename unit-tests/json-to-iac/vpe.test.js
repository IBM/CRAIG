const { assert } = require("chai");
const {
  formatReservedIp,
  fortmatVpeGateway,
  fortmatVpeGatewayIp,
  vpeTf,
} = require("../../client/src/lib/json-to-iac/vpe");
const slzNetwork = require("../data-files/slz-network.json");

describe("virtual private endpoints", () => {
  describe("formatReservedIp", () => {
    it("should format reserved ip", () => {
      let actualData = formatReservedIp("management", "test", 1);
      let expectedData = `
resource "ibm_is_subnet_reserved_ip" "management_vpc_test_subnet_vpe_ip" {
  subnet = module.management_vpc.test_id
}
`;

      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
  });
  describe("fortmatVpeGateway", () => {
    it("should format vpe gateway", () => {
      let actualData = fortmatVpeGateway(
        {
          vpc: "management",
          service: "cos",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
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
resource "ibm_is_virtual_endpoint_gateway" "management_vpc_cos_vpe_gateway" {
  name           = "\${var.prefix}-management-cos-vpe-gw"
  vpc            = module.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "hello",
    "world"
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.\${var.region}.cloud-object-storage.appdomain.cloud"
    resource_type = "provider_cloud_service"
  }
}
`;

      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
    it("should format vpe gateway for secrets manager", () => {
      let actualData = fortmatVpeGateway(
        {
          vpc: "management",
          service: "secrets-manager",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          account_id: "1234",
          instance: "secrets-manager"
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
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
          ]
        }
      );
      let expectedData = `
resource "ibm_is_virtual_endpoint_gateway" "management_vpc_secrets_manager_vpe_gateway" {
  name           = "\${var.prefix}-management-secrets-manager-vpe-gw"
  vpc            = module.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "hello",
    "world"
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
  target {
    crn           = "crn:v1:bluemix:public:secrets-manager:\${var.region}:a/1234:\${ibm_resource_instance.secrets_manager_secrets_manager.guid}::"
    resource_type = "provider_cloud_service"
  }
}
`;

      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
    it("should format vpe gateway with no security groups", () => {
      let actualData = fortmatVpeGateway(
        {
          vpc: "management",
          service: "cos",
          resource_group: "slz-management-rg",
          security_groups: [],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
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
resource "ibm_is_virtual_endpoint_gateway" "management_vpc_cos_vpe_gateway" {
  name           = "\${var.prefix}-management-cos-vpe-gw"
  vpc            = module.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "hello",
    "world"
  ]
  security_groups = []
  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.\${var.region}.cloud-object-storage.appdomain.cloud"
    resource_type = "provider_cloud_service"
  }
}
`;

      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
  });
  describe("fortmatVpeGatewayIp", () => {
    it("should format vpe gateway", () => {
      let actualData = fortmatVpeGatewayIp(
        {
          vpc: "management",
          service: "cos",
          resource_group: "slz-management-rg",
          security_groups: [],
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
        },
        "vpe-zone-1"
      );
      let expectedData = `
resource "ibm_is_virtual_endpoint_gateway_ip" "management_vpc_cos_gw_vpe_zone_1_gateway_ip" {
  gateway     = ibm_is_virtual_endpoint_gateway.management_vpc_cos_vpe_gateway.id
  reserved_ip = ibm_is_subnet_reserved_ip.management_vpc_vpe_zone_1_subnet_vpe_ip.reserved_ip
}
`;

      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
  });
  describe("vpeTf", () => {
    it("should create vpe terraform", () => {
      let actualData = vpeTf(slzNetwork);
      let expectedData = `##############################################################################
# Management VPE Resources
##############################################################################

resource "ibm_is_subnet_reserved_ip" "management_vpc_vpe_zone_1_subnet_vpe_ip" {
  subnet = module.management_vpc.vpe_zone_1_id
}

resource "ibm_is_subnet_reserved_ip" "management_vpc_vpe_zone_2_subnet_vpe_ip" {
  subnet = module.management_vpc.vpe_zone_2_id
}

resource "ibm_is_subnet_reserved_ip" "management_vpc_vpe_zone_3_subnet_vpe_ip" {
  subnet = module.management_vpc.vpe_zone_3_id
}

resource "ibm_is_virtual_endpoint_gateway" "management_vpc_cos_vpe_gateway" {
  name           = "\${var.prefix}-management-cos-vpe-gw"
  vpc            = module.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.\${var.region}.cloud-object-storage.appdomain.cloud"
    resource_type = "provider_cloud_service"
  }
}

resource "ibm_is_virtual_endpoint_gateway_ip" "management_vpc_cos_gw_vpe_zone_1_gateway_ip" {
  gateway     = ibm_is_virtual_endpoint_gateway.management_vpc_cos_vpe_gateway.id
  reserved_ip = ibm_is_subnet_reserved_ip.management_vpc_vpe_zone_1_subnet_vpe_ip.reserved_ip
}

resource "ibm_is_virtual_endpoint_gateway_ip" "management_vpc_cos_gw_vpe_zone_2_gateway_ip" {
  gateway     = ibm_is_virtual_endpoint_gateway.management_vpc_cos_vpe_gateway.id
  reserved_ip = ibm_is_subnet_reserved_ip.management_vpc_vpe_zone_2_subnet_vpe_ip.reserved_ip
}

resource "ibm_is_virtual_endpoint_gateway_ip" "management_vpc_cos_gw_vpe_zone_3_gateway_ip" {
  gateway     = ibm_is_virtual_endpoint_gateway.management_vpc_cos_vpe_gateway.id
  reserved_ip = ibm_is_subnet_reserved_ip.management_vpc_vpe_zone_3_subnet_vpe_ip.reserved_ip
}

##############################################################################

##############################################################################
# Workload VPE Resources
##############################################################################

resource "ibm_is_subnet_reserved_ip" "workload_vpc_vpe_zone_1_subnet_vpe_ip" {
  subnet = module.workload_vpc.vpe_zone_1_id
}

resource "ibm_is_subnet_reserved_ip" "workload_vpc_vpe_zone_2_subnet_vpe_ip" {
  subnet = module.workload_vpc.vpe_zone_2_id
}

resource "ibm_is_subnet_reserved_ip" "workload_vpc_vpe_zone_3_subnet_vpe_ip" {
  subnet = module.workload_vpc.vpe_zone_3_id
}

resource "ibm_is_virtual_endpoint_gateway" "workload_vpc_cos_vpe_gateway" {
  name           = "\${var.prefix}-workload-cos-vpe-gw"
  vpc            = module.workload_vpc.id
  resource_group = ibm_resource_group.slz_workload_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  security_groups = [
    module.workload_vpc.workload_vpe_sg_id
  ]
  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.\${var.region}.cloud-object-storage.appdomain.cloud"
    resource_type = "provider_cloud_service"
  }
}

resource "ibm_is_virtual_endpoint_gateway_ip" "workload_vpc_cos_gw_vpe_zone_1_gateway_ip" {
  gateway     = ibm_is_virtual_endpoint_gateway.workload_vpc_cos_vpe_gateway.id
  reserved_ip = ibm_is_subnet_reserved_ip.workload_vpc_vpe_zone_1_subnet_vpe_ip.reserved_ip
}

resource "ibm_is_virtual_endpoint_gateway_ip" "workload_vpc_cos_gw_vpe_zone_2_gateway_ip" {
  gateway     = ibm_is_virtual_endpoint_gateway.workload_vpc_cos_vpe_gateway.id
  reserved_ip = ibm_is_subnet_reserved_ip.workload_vpc_vpe_zone_2_subnet_vpe_ip.reserved_ip
}

resource "ibm_is_virtual_endpoint_gateway_ip" "workload_vpc_cos_gw_vpe_zone_3_gateway_ip" {
  gateway     = ibm_is_virtual_endpoint_gateway.workload_vpc_cos_vpe_gateway.id
  reserved_ip = ibm_is_subnet_reserved_ip.workload_vpc_vpe_zone_3_subnet_vpe_ip.reserved_ip
}

##############################################################################
`;
      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
  });
});
