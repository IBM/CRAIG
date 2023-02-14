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
  subnet = ibm_is_subnet.management_test.id
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
  name            = "iac-management-cos-vpe-gw"
  vpc             = ibm_is_vpc.management_vpc.id
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]
  security_groups = [
    ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  ]

  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.us-south.cloud-object-storage.appdomain.cloud"
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
  name            = "iac-management-cos-vpe-gw"
  vpc             = ibm_is_vpc.management_vpc.id
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]
  security_groups = []

  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.us-south.cloud-object-storage.appdomain.cloud"
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
  subnet = ibm_is_subnet.management_vpe_zone_1.id
}

resource "ibm_is_subnet_reserved_ip" "management_vpc_vpe_zone_2_subnet_vpe_ip" {
  subnet = ibm_is_subnet.management_vpe_zone_2.id
}

resource "ibm_is_subnet_reserved_ip" "management_vpc_vpe_zone_3_subnet_vpe_ip" {
  subnet = ibm_is_subnet.management_vpe_zone_3.id
}

resource "ibm_is_virtual_endpoint_gateway" "management_vpc_cos_vpe_gateway" {
  name            = "slz-management-cos-vpe-gw"
  vpc             = ibm_is_vpc.management_vpc.id
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["slz","landing-zone"]
  security_groups = [
    ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  ]

  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.us-south.cloud-object-storage.appdomain.cloud"
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
  subnet = ibm_is_subnet.workload_vpe_zone_1.id
}

resource "ibm_is_subnet_reserved_ip" "workload_vpc_vpe_zone_2_subnet_vpe_ip" {
  subnet = ibm_is_subnet.workload_vpe_zone_2.id
}

resource "ibm_is_subnet_reserved_ip" "workload_vpc_vpe_zone_3_subnet_vpe_ip" {
  subnet = ibm_is_subnet.workload_vpe_zone_3.id
}

resource "ibm_is_virtual_endpoint_gateway" "workload_vpc_cos_vpe_gateway" {
  name            = "slz-workload-cos-vpe-gw"
  vpc             = ibm_is_vpc.workload_vpc.id
  resource_group  = ibm_resource_group.slz_workload_rg.id
  tags            = ["slz","landing-zone"]
  security_groups = [
    ibm_is_security_group.workload_vpc_workload_vpe_sg_sg.id
  ]

  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.us-south.cloud-object-storage.appdomain.cloud"
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
