const { assert } = require("chai");
const {
  formatCis,
  formatCisDomain,
  formatCisDnsRecord,
  cisTf,
} = require("../../client/src/lib/json-to-iac/cis");

describe("CIS", () => {
  describe("formatCis", () => {
    it("should format a CIS instance", () => {
      let expectedData = `
resource "ibm_cis" "cis_cis" {
  name              = "\${var.prefix}-cis"
  plan              = "trial"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  location          = "global"
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "15m"
    update = "15m"
    delete = "15m"
  }
}
`;
      let actualData = formatCis(
        { name: "cis", resource_group: "slz-service-rg", plan: "trial" },
        {
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
        }
      );
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
  });
  describe("formatCisDomain", () => {
    it("should format a CIS domain", () => {
      let expectedData = `
resource "ibm_cis_domain" "cis_cis_domain_example_com" {
  domain = "example.com"
  cis_id = ibm_cis.cis_cis.id
  type   = "full"
}
`;
      let actualData = formatCisDomain({
        cis: "cis",
        domain: "example.com",
        type: "full",
      });
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
  });
  describe("formatCisDnsRecord", () => {
    it("should create the correct record", () => {
      let actualData = formatCisDnsRecord({
        cis: "cis",
        domain: "example.com",
        type: "A",
        name: "test-example",
        content: "1.2.3.4",
        ttl: 900,
      });
      let expectedData = `
resource "ibm_cis_dns_record" "cis_cis_dns_record_example_com" {
  cis_id  = ibm_cis.cis_cis.id
  domain  = ibm_cis_domain.cis_cis_domain_example_com.domain_id
  name    = "test-example"
  type    = "A"
  content = "1.2.3.4"
  ttl     = 900
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should format correct record"
      );
    });
    it("should create the correct record with empty string ttl", () => {
      let actualData = formatCisDnsRecord({
        cis: "cis",
        domain: "example.com",
        type: "A",
        name: "test-example",
        content: "1.2.3.4",
        ttl: "",
      });
      let expectedData = `
resource "ibm_cis_dns_record" "cis_cis_dns_record_example_com" {
  cis_id  = ibm_cis.cis_cis.id
  domain  = ibm_cis_domain.cis_cis_domain_example_com.domain_id
  name    = "test-example"
  type    = "A"
  content = "1.2.3.4"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should format correct record"
      );
    });
  });

  describe("cisTf", () => {
    it("should return correct cis terraform", () => {
      let actualData = cisTf({
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
        cis: [
          {
            name: "cis",
            resource_group: "slz-service-rg",
            plan: "trial",
            domains: [
              {
                cis: "cis",
                domain: "example.com",
                type: "full",
              },
            ],
            dns_records: [
              {
                cis: "cis",
                domain: "example.com",
                type: "A",
                name: "test-example",
                content: "1.2.3.4",
                ttl: 900,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Cis Cloud Internet Services
##############################################################################

resource "ibm_cis" "cis_cis" {
  name              = "\${var.prefix}-cis"
  plan              = "trial"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  location          = "global"
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "15m"
    update = "15m"
    delete = "15m"
  }
}

resource "ibm_cis_domain" "cis_cis_domain_example_com" {
  domain = "example.com"
  cis_id = ibm_cis.cis_cis.id
  type   = "full"
}

resource "ibm_cis_dns_record" "cis_cis_dns_record_example_com" {
  cis_id  = ibm_cis.cis_cis.id
  domain  = ibm_cis_domain.cis_cis_domain_example_com.domain_id
  name    = "test-example"
  type    = "A"
  content = "1.2.3.4"
  ttl     = 900
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
    it("should return null when no cis", () => {
      let actualData = cisTf({
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
        cis: [],
      });

      assert.deepEqual(actualData, null, "it should return correct terraform");
    });
    it("should return null when no cis in state store", () => {
      let actualData = cisTf({
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
      });

      assert.deepEqual(actualData, null, "it should return correct terraform");
    });
  });
});
