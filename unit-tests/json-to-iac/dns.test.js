const { assert } = require("chai");
const {
  formatDnsService,
  formatDnsZone,
  formatDnsRecord,
  formatDnsPermittedNetwork,
  formatDnsCustomResolver,
  dnsTf,
} = require("../../client/src/lib");

describe("dns service", () => {
  describe("formatDnsService", () => {
    it("should return terraform", () => {
      let actualData = formatDnsService(
        {
          name: "test",
          plan: "free",
          resource_group: "service-rg",
        },
        {
          _options: {
            prefix: "iac",
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
        }
      );
      let expectedData = `
resource "ibm_resource_instance" "test_dns_instance" {
  name              = "\${var.prefix}-test-dns-instance"
  resource_group_id = ibm_resource_group.service_rg.id
  location          = "global"
  service           = "dns-svcs"
  plan              = "free-plan"
}
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
  });
  describe("formatDnsZone", () => {
    it("should return terraform", () => {
      let actualData = formatDnsZone({
        name: "test.com",
        instance: "test",
        description: "test description",
        label: "test",
      });
      let expectedData = `
resource "ibm_dns_zone" "test_dns_instance_test_dot_com" {
  name        = "test.com"
  instance_id = ibm_resource_instance.test_dns_instance.guid
  description = "test description"
  label       = "test"
}
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
  });
  describe("formatDnsRecord", () => {
    it("should return terraform for minimal record", () => {
      let actualData = formatDnsRecord({
        instance: "test",
        dns_zone: "test.com",
        type: "A",
        name: "testA",
        rdata: "test.com",
      });
      let expectedData = `
resource "ibm_dns_resource_record" "test_dns_instance_test_dot_com_testa" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  type        = "A"
  name        = "testA"
  rdata       = "test.com"
}
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
    it("should return terraform for record with all the props", () => {
      let actualData = formatDnsRecord({
        instance: "test",
        dns_zone: "test.com",
        type: "A",
        name: "testA",
        rdata: "test.com",
        ttl: 900,
        weight: 100,
        priority: 100,
        port: 8000,
        service: "_sip",
        protocol: "udp",
        use_vsi: false,
        vsi: "vsi",
      });
      let expectedData = `
resource "ibm_dns_resource_record" "test_dns_instance_test_dot_com_testa" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  type        = "A"
  name        = "testA"
  rdata       = "test.com"
  ttl         = 900
  weight      = 100
  priority    = 100
  port        = 8000
  service     = "_sip"
  protocol    = "udp"
}
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
    it("should return terraform for minimal record with reference to vsi", () => {
      let actualData = formatDnsRecord({
        instance: "test",
        dns_zone: "test.com",
        type: "A",
        name: "testA",
        rdata: "test.com",
        vpc: "management",
        vsi: "management-server-1-1",
        use_vsi: true,
      });
      let expectedData = `
resource "ibm_dns_resource_record" "test_dns_instance_test_dot_com_testa" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  type        = "A"
  name        = "testA"
  rdata       = ibm_is_instance.management_vpc_management_server_vsi_1_1.primary_network_interface.0.primary_ip.0.address
}
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
  });
  describe("formatDnsPermittedNetwork", () => {
    it("should return the correct permitted network", () => {
      let actualData = formatDnsPermittedNetwork({
        instance: "test",
        dns_zone: "test.com",
        vpc: "management",
      });
      let expectedData = `
resource "ibm_dns_permitted_network" "test_dns_instance_test_dot_com_permitted_network_management" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  vpc_crn     = module.management_vpc.crn
  type        = "vpc"
}
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
  });
  describe("formatDnsCustomResolver", () => {
    it("should create custom resolver", () => {
      let actualData = formatDnsCustomResolver(
        {
          name: "dev-res",
          instance: "test",
          description: "new resolve",
          high_availability: true,
          enabled: true,
          vpc: "management",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        },
        {
          vpcs: [
            {
              name: "management",
              subnets: [
                {
                  name: "vsi-zone-1",
                },
                {
                  name: "vsi-zone-2",
                },
                {
                  name: "vsi-zone-3",
                },
              ],
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_dns_custom_resolver" "test_dns_instance_resolver_dev_res" {
  name              = "dev-res"
  instance_id       = ibm_resource_instance.test_dns_instance.guid
  description       = "new resolve"
  high_availability = true
  enabled           = true
  locations {
    subnet_crn = module.management_vpc.subnet_vsi_zone_1_crn
    enabled    = true
  }
  locations {
    subnet_crn = module.management_vpc.subnet_vsi_zone_2_crn
    enabled    = true
  }
  locations {
    subnet_crn = module.management_vpc.subnet_vsi_zone_3_crn
    enabled    = true
  }
}
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
  });
  describe("dnsTf", () => {
    it("should return correct dns tf", () => {
      let actualData = dnsTf({
        _options: {
          prefix: "iac",
        },
        dns: [
          {
            name: "test",
            plan: "standard",
            resource_group: "service-rg",
            zones: [
              {
                name: "test.com",
                instance: "test",
                description: "test description",
                label: "test",
                vpcs: ["management"],
              },
            ],
            records: [
              {
                instance: "test",
                dns_zone: "test.com",
                type: "A",
                name: "testA",
                rdata: "test.com",
              },
              {
                instance: "test",
                dns_zone: "fake-zone", // pretend zone for unit test coverage
                type: "A",
                name: "testA",
                rdata: "test.com",
              },
            ],
            custom_resolvers: [
              {
                name: "dev-res",
                instance: "test",
                description: "new resolve",
                high_availability: true,
                enabled: true,
                vpc: "management",
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              },
            ],
          },
        ],
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
        vpcs: [
          {
            name: "management",
            subnets: [
              {
                use_data: true,
                name: "vsi-zone-1",
              },
              {
                name: "vsi-zone-2",
              },
              {
                name: "vsi-zone-3",
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Test DNS Service
##############################################################################

resource "ibm_resource_instance" "test_dns_instance" {
  name              = "\${var.prefix}-test-dns-instance"
  resource_group_id = ibm_resource_group.service_rg.id
  location          = "global"
  service           = "dns-svcs"
  plan              = "standard-dns"
}

##############################################################################

##############################################################################
# Test DNS Zone Test.com
##############################################################################

resource "ibm_dns_zone" "test_dns_instance_test_dot_com" {
  name        = "test.com"
  instance_id = ibm_resource_instance.test_dns_instance.guid
  description = "test description"
  label       = "test"
}

resource "ibm_dns_resource_record" "test_dns_instance_test_dot_com_testa" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  type        = "A"
  name        = "testA"
  rdata       = "test.com"
}

resource "ibm_dns_permitted_network" "test_dns_instance_test_dot_com_permitted_network_management" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  vpc_crn     = module.management_vpc.crn
  type        = "vpc"
}

##############################################################################

##############################################################################
# Test DNS Custom Resolvers
##############################################################################

resource "ibm_dns_custom_resolver" "test_dns_instance_resolver_dev_res" {
  name              = "dev-res"
  instance_id       = ibm_resource_instance.test_dns_instance.guid
  description       = "new resolve"
  high_availability = true
  enabled           = true
  locations {
    subnet_crn = module.management_vpc.import_vsi_zone_1_crn
    enabled    = true
  }
  locations {
    subnet_crn = module.management_vpc.subnet_vsi_zone_2_crn
    enabled    = true
  }
  locations {
    subnet_crn = module.management_vpc.subnet_vsi_zone_3_crn
    enabled    = true
  }
}

##############################################################################
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
    it("should return correct dns tf with no resolvers", () => {
      let actualData = dnsTf({
        _options: {
          prefix: "iac",
        },
        dns: [
          {
            name: "test",
            plan: "standard",
            resource_group: "service-rg",
            zones: [
              {
                name: "test.com",
                instance: "test",
                description: "test description",
                label: "test",
                vpcs: ["management"],
              },
            ],
            records: [
              {
                instance: "test",
                dns_zone: "test.com",
                type: "A",
                name: "testA",
                rdata: "test.com",
              },
              {
                instance: "test",
                dns_zone: "fake-zone", // pretend zone for unit test coverage
                type: "A",
                name: "testA",
                rdata: "test.com",
              },
            ],
            custom_resolvers: [],
          },
        ],
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
      });
      let expectedData = `##############################################################################
# Test DNS Service
##############################################################################

resource "ibm_resource_instance" "test_dns_instance" {
  name              = "\${var.prefix}-test-dns-instance"
  resource_group_id = ibm_resource_group.service_rg.id
  location          = "global"
  service           = "dns-svcs"
  plan              = "standard-dns"
}

##############################################################################

##############################################################################
# Test DNS Zone Test.com
##############################################################################

resource "ibm_dns_zone" "test_dns_instance_test_dot_com" {
  name        = "test.com"
  instance_id = ibm_resource_instance.test_dns_instance.guid
  description = "test description"
  label       = "test"
}

resource "ibm_dns_resource_record" "test_dns_instance_test_dot_com_testa" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  type        = "A"
  name        = "testA"
  rdata       = "test.com"
}

resource "ibm_dns_permitted_network" "test_dns_instance_test_dot_com_permitted_network_management" {
  instance_id = ibm_resource_instance.test_dns_instance.guid
  zone_id     = ibm_dns_zone.test_dns_instance_test_dot_com.zone_id
  vpc_crn     = module.management_vpc.crn
  type        = "vpc"
}

##############################################################################
`;
      assert.deepEqual(actualData, expectedData, "it should return terraform");
    });
  });
});
