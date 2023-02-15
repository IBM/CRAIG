const { assert } = require("chai");
const {
  formatIamAccountSettings,
  formatAccessGroup,
  formatAccessGroupPolicy,
} = require("../../client/src/lib/json-to-iac/iam");

describe("iam", () => {
  describe("formatIamAccountSettings", () => {
    it("should return correct terraform", () => {
      let actualData = formatIamAccountSettings({
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
      });
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
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return empty string when disabled", () => {
      let actualData = formatIamAccountSettings({
        enable: false,
        mfa: "NONE",
        allowed_ip_addresses: "1.2.3.4,5.6.7.8",
        include_history: true,
        if_match: 2,
        max_sessions_per_identity: 2,
        restrict_create_service_id: "RESTRICTED",
        restrict_create_platform_apikey: "RESTRICTED",
        session_expiration_in_seconds: 900,
        session_invalidation_in_seconds: 900,
      });
      let expectedData = ``;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAccessGroup", () => {
    it("should return access group terraform", () => {
      let actualData = formatAccessGroup(
        {
          name: "frog",
          description: "an access group for frogs",
        },
        {
          _options: {
            tags: ["frog"],
          },
        }
      );
      let expectedData = `
resource "ibm_iam_access_group" "frog_access_group" {
  name        = "frog"
  description = "an access group for frogs"
  tags        = ["frog"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAccessGroupPolicy", () => {
    it("should return correct access group id", () => {
      let actualData = formatAccessGroupPolicy({
        group: "frog",
        name: "frogs-only",
        roles: ["Reader"],
        resources: {
          resource_instance_id: "1234",
          region: "us-south",
          service: "cloud-object-storage",
          resource_type: "resource-group",
          attributes: {
            vpcId: "*",
          },
        },
      });
      let expectedData = `
resource "ibm_iam_access_group_policy" "frog_frogs_only_policy" {
  access_group_id = ibm_iam_access_group.frogaccess_group.id
  roles           = ["Reader"]

  resources {
    resource_instance_id = "1234"
    region               = "us-south"
    service              = "cloud-object-storage"
    resource_type        = "resource-group"

    attributes = {
      vpcId = "*"
    }
  }
}`
      console.log(actualData)
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
