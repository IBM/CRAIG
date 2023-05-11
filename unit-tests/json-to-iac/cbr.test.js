const { assert } = require("chai");
const {
  formatCbrZone,
  formatCbrRule,
} = require("../../client/src/lib/json-to-iac/cbr");
const craigJson = require("../data-files/craig-json.json");

describe("cbr", () => {
  describe("formatCbrZone", () => {
    it("should create terraform code for cbr zone", () => {
      let actualData = formatCbrZone(
        {
          name: "foo-cbr-name",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          description: "this is a cbr zone description",
          addresses: [
            {
              account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
              type: "ipAddress",
              value: "169.23.56.234",
              location: "us-south",
              service_instance: "fake-service-instance",
              service_name: "frog-service-name",
              service_type: "frog-service",
            },
            {
              account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
              location: "us-south",
              service_instance: "fake-service-instance",
              service_name: "frog-service-name",
              service_type: "frog-service",
            },
          ],
          exclusions: [
            {
              type: "ipAddress",
              value: "169.23.22.11",
            },
            {
              type: "ipAddress",
              value: "169.23.22.10",
            },
          ],
        },
        craigJson
      );
      let expectedData = `
resource "ibm_cbr_zone" "slz_foo_cbr_name_zone" {
  name        = "\${var.prefix}-zone-foo-cbr-name"
  account_id  = "12ab34cd56ef78ab90cd12ef34ab56cd"
  description = "this is a cbr zone description"
  addresses {
    type  = "ipAddress"
    value = "169.23.56.234"
    ref {
      account_id       = "12ab34cd56ef78ab90cd12ef34ab56cd"
      location         = var.region
      service_instance = "fake-service-instance"
      service_name     = "frog-service-name"
      service_type     = "frog-service"
    }
  }
  addresses {
    ref {
      account_id       = "12ab34cd56ef78ab90cd12ef34ab56cd"
      location         = var.region
      service_instance = "fake-service-instance"
      service_name     = "frog-service-name"
      service_type     = "frog-service"
    }
  }
  excluded {
    type  = "ipAddress"
    value = "169.23.22.11"
  }
  excluded {
    type  = "ipAddress"
    value = "169.23.22.10"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create terraform code for cbr zone with null values", () => {
      let actualData = formatCbrZone(
        {
          name: "foo-cbr-name",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          description: "this is a cbr zone description",
          addresses: [
            {
              account_id: "",
              type: "",
              value: "",
              location: "us-south",
              service_instance: "",
              service_name: "",
              service_type: "",
            },
          ],
          exclusions: [
            {
              type: "ipAddress",
              value: "169.23.22.11",
            },
            {
              type: "ipAddress",
              value: "169.23.22.10",
            },
          ],
        },
        craigJson
      );
      let expectedData = `
resource "ibm_cbr_zone" "slz_foo_cbr_name_zone" {
  name        = "\${var.prefix}-zone-foo-cbr-name"
  account_id  = "12ab34cd56ef78ab90cd12ef34ab56cd"
  description = "this is a cbr zone description"
  addresses {
    type  = null
    value = null
    ref {
      location         = var.region
      account_id       = null
      service_instance = null
      service_name     = null
      service_type     = null
    }
  }
  excluded {
    type  = "ipAddress"
    value = "169.23.22.11"
  }
  excluded {
    type  = "ipAddress"
    value = "169.23.22.10"
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
  describe("formatCbrRule", () => {
    it("should create terraform code for cbr rule", () => {
      let actualData = formatCbrRule(
        {
          name: "test",
          description: "test cbr rule description",
          enforcement_mode: "enabled",
          api_type_id: "api_type_id",
          contexts: [
            {
              name: "networkZoneId",
              value:
                "559052eb8f43302824e7ae490c0281eb, bf823d4f45b64ceaa4671bee0479346e",
            },
            {
              name: "endpointType",
              value: "private",
            },
          ],
          resource_attributes: [
            {
              name: "accountId",
              value: "12ab34cd56ef78ab90cd12ef34ab56cd",
            },
            {
              name: "serviceName",
              value: "network-policy-enabled",
            },
          ],
          tags: [
            {
              name: "tag_name",
              value: "tag_value",
            },
          ],
        },
        craigJson
      );
      let expectedData = `
resource "ibm_cbr_rule" "slz_cbr_rule_test" {
  description      = "test cbr rule description"
  enforcement_mode = "enabled"
  contexts {
    attributes {
      name  = "networkZoneId"
      value = "559052eb8f43302824e7ae490c0281eb, bf823d4f45b64ceaa4671bee0479346e"
    }
    attributes {
      name  = "endpointType"
      value = "private"
    }
  }
  resources {
    tags {
      name  = "tag_name"
      value = "tag_value"
    }
    attributes {
      name  = "accountId"
      value = "12ab34cd56ef78ab90cd12ef34ab56cd"
    }
    attributes {
      name  = "serviceName"
      value = "network-policy-enabled"
    }
  }
  operations {
    api_types {
      api_type_id = "api_type_id"
    }
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create terraform code for cbr rule with no sub objects", () => {
      let actualData = formatCbrRule(
        {
          name: "test",
          description: "test cbr rule description",
          enforcement_mode: "enabled",
          api_type_id: "api_type_id",
          contexts: [],
          resource_attributes: [],
          tags: [
            {
              name: "tag_name",
              value: "tag_value",
            },
          ],
        },
        craigJson
      );
      let expectedData = `
resource "ibm_cbr_rule" "slz_cbr_rule_test" {
  description      = "test cbr rule description"
  enforcement_mode = "enabled"
  resources {
    tags {
      name  = "tag_name"
      value = "tag_value"
    }
  }
  operations {
    api_types {
      api_type_id = "api_type_id"
    }
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
