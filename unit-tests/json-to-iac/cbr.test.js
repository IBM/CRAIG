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
  });
  describe("formatCbrRule", () => {
    it("should create terraform code for cbr rule", () => {
      let actualData = formatCbrRule(
        {
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
resource "ibm_cbr_rule" "slz_cbr_rule" {
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
    attributes {
      name  = "accountId"
      value = "12ab34cd56ef78ab90cd12ef34ab56cd"
    }
    attributes {
      name  = "serviceName"
      value = "network-policy-enabled"
    }
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
