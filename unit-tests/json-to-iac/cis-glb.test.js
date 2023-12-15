const { assert } = require("chai");
const {
  formatCisOriginPool,
  formatCisGlb,
  formatCisHealthCheck,
  cisGlbTf,
} = require("../../client/src/lib/json-to-iac/cis-glb");

describe("CIS Global Load Balancers", () => {
  describe("formatCisOriginPool", () => {
    it("should format an origin pool with no origins", () => {
      let actualData = formatCisOriginPool({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: [],
        notification_email: "someone@example.com",
      });
      let expectedData = `
resource "ibm_cis_origin_pool" "cis_cis_origin_pool_pool" {
  cis_id             = ibm_cis.cis_cis.id
  name               = "\${var.prefix}-cis-pool-pool"
  enabled            = false
  description        = "example load balancer pool"
  minimum_origins    = 1
  notification_email = "someone@example.com"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
    it("should format an origin pool with no origins and check regions", () => {
      let actualData = formatCisOriginPool({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
      });
      let expectedData = `
resource "ibm_cis_origin_pool" "cis_cis_origin_pool_pool" {
  cis_id             = ibm_cis.cis_cis.id
  name               = "\${var.prefix}-cis-pool-pool"
  enabled            = false
  description        = "example load balancer pool"
  minimum_origins    = 1
  notification_email = "someone@example.com"
  check_regions = [
    "WEU"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
    it("should format an origin pool with origins and check regions", () => {
      let actualData = formatCisOriginPool({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
        origins: [
          {
            name: "example",
            enabled: false,
            address: "1.2.3.4",
          },
          {
            name: "example-2",
            enabled: false,
            address: "1.2.3.4",
            weight: 12,
          },
        ],
      });
      let expectedData = `
resource "ibm_cis_origin_pool" "cis_cis_origin_pool_pool" {
  cis_id             = ibm_cis.cis_cis.id
  name               = "\${var.prefix}-cis-pool-pool"
  enabled            = false
  description        = "example load balancer pool"
  minimum_origins    = 1
  notification_email = "someone@example.com"
  check_regions = [
    "WEU"
  ]
  origins {
    name    = "example"
    enabled = false
    address = "1.2.3.4"
  }
  origins {
    name    = "example-2"
    enabled = false
    address = "1.2.3.4"
    weight  = 12
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
  });
  describe("formatCisGlb", () => {
    it("should return cis glb terraform data", () => {
      let actualData = formatCisGlb({
        cis: "cis",
        domain: "example.com",
        fallback_pool: "pool",
        default_pools: ["pool"],
        enabled: false,
        proxied: false,
        ttl: 900,
        name: "www.example.com",
      });
      let expectedData = `
resource "ibm_cis_global_load_balancer" "cis_cis_glb_www_example_com" {
  cis_id           = ibm_cis.cis_cis.id
  domain_id        = ibm_cis_domain.cis_cis_domain_example_com.id
  name             = "www.example.com"
  fallback_pool_id = ibm_cis_origin_pool.cis_cis_origin_pool_pool.id
  enabled          = false
  proxied          = false
  default_pools = [
    ibm_cis_origin_pool.cis_cis_origin_pool_pool.id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "it should return glb data");
    });
  });
  describe("formatCisHealthCheck", () => {
    it("should return cis health check", () => {
      let actualData = formatCisHealthCheck({
        cis: "cis",
        name: "check",
        allow_insecure: true,
        expected_codes: 200,
        follow_redirects: true,
        interval: 60,
        method: "GET",
        timeout: 5,
        path: "/",
        port: 443,
        retries: 2,
        type: "https",
      });
      let expectedData = `
resource "ibm_cis_healthcheck" "cis_cis_healthcheck_check" {
  cis              = ibm_cis.cis_cis.id
  allow_insecure   = true
  expected_codes   = 200
  follow_redirects = true
  interval         = 60
  method           = "GET"
  timeout          = 5
  path             = "/"
  port             = 443
  retries          = 2
  type             = "https"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return health check data"
      );
    });
  });
  describe("cisGlbTf", () => {
    it("should return null when none cis_glb", () => {
      assert.isNull(cisGlbTf({}), "it should be null");
    });
    it("should return cis glb data", () => {
      let expectedData = `##############################################################################
# CIS Origin Pool Pool
##############################################################################

resource "ibm_cis_origin_pool" "cis_cis_origin_pool_pool" {
  cis_id             = ibm_cis.cis_cis.id
  name               = "\${var.prefix}-cis-pool-pool"
  enabled            = false
  description        = "example load balancer pool"
  minimum_origins    = 1
  notification_email = "someone@example.com"
  check_regions = [
    "WEU"
  ]
  origins {
    name    = "example"
    enabled = false
    address = "1.2.3.4"
  }
  origins {
    name    = "example-2"
    enabled = false
    address = "1.2.3.4"
    weight  = 12
  }
}

resource "ibm_cis_global_load_balancer" "cis_cis_glb_www_example_com" {
  cis_id           = ibm_cis.cis_cis.id
  domain_id        = ibm_cis_domain.cis_cis_domain_example_com.id
  name             = "www.example.com"
  fallback_pool_id = ibm_cis_origin_pool.cis_cis_origin_pool_pool.id
  enabled          = false
  proxied          = false
  default_pools = [
    ibm_cis_origin_pool.cis_cis_origin_pool_pool.id
  ]
}

resource "ibm_cis_healthcheck" "cis_cis_healthcheck_check" {
  cis              = ibm_cis.cis_cis.id
  allow_insecure   = true
  expected_codes   = 200
  follow_redirects = true
  interval         = 60
  method           = "GET"
  timeout          = 5
  path             = "/"
  port             = 443
  retries          = 2
  type             = "https"
}

##############################################################################
`;
      let actualData = cisGlbTf({
        cis_glbs: [
          {
            cis: "cis",
            name: "pool",
            enabled: false,
            description: "example load balancer pool",
            minimum_origins: 1,
            check_regions: ["WEU"],
            notification_email: "someone@example.com",
            origins: [
              {
                name: "example",
                enabled: false,
                address: "1.2.3.4",
              },
              {
                name: "example-2",
                enabled: false,
                address: "1.2.3.4",
                weight: 12,
              },
            ],
            glbs: [
              {
                cis: "cis",
                domain: "example.com",
                fallback_pool: "pool",
                default_pools: ["pool"],
                enabled: false,
                proxied: false,
                ttl: 900,
                name: "www.example.com",
              },
            ],
            health_checks: [
              {
                cis: "cis",
                name: "check",
                allow_insecure: true,
                expected_codes: 200,
                follow_redirects: true,
                interval: 60,
                method: "GET",
                timeout: 5,
                path: "/",
                port: 443,
                retries: 2,
                type: "https",
              },
            ],
          },
        ],
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
  });
});
