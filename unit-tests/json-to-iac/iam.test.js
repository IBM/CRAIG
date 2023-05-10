const { assert } = require("chai");
const {
  formatIamAccountSettings,
  formatAccessGroup,
  formatAccessGroupPolicy,
  formatAccessGroupDynamicRule,
  formatGroupMembers,
  iamTf,
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
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_iam_access_group" "frog_access_group" {
  name        = "iac-frog-ag"
  description = "an access group for frogs"
  tags = [
    "frog"
  ]
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
    it("should return correct access group policy", () => {
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
  access_group_id = ibm_iam_access_group.frog_access_group.id
  roles = [
    "Reader"
  ]
  resources {
    resource_instance_id = "1234"
    region               = var.region
    service              = "cloud-object-storage"
    resource_type        = "resource-group"
    attributes = {
      vpcId = "*"
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
    it("should return correct access group policy with no attributes", () => {
      let actualData = formatAccessGroupPolicy({
        group: "frog",
        name: "frogs-only",
        roles: ["Reader"],
        resources: {
          resource_instance_id: "1234",
          region: "us-south",
          service: "cloud-object-storage",
          resource_type: "resource-group",
        },
      });
      let expectedData = `
resource "ibm_iam_access_group_policy" "frog_frogs_only_policy" {
  access_group_id = ibm_iam_access_group.frog_access_group.id
  roles = [
    "Reader"
  ]
  resources {
    resource_instance_id = "1234"
    region               = var.region
    service              = "cloud-object-storage"
    resource_type        = "resource-group"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct access group policy with resource attributes", () => {
      let actualData = formatAccessGroupPolicy({
        group: "frog",
        name: "frogs-only",
        roles: ["Reader"],
        resource_attributes: [
          {
            name: "serviceName",
            value: "iac-*",
            operator: "stringEquals",
          },
        ],
      });
      let expectedData = `
resource "ibm_iam_access_group_policy" "frog_frogs_only_policy" {
  access_group_id = ibm_iam_access_group.frog_access_group.id
  roles = [
    "Reader"
  ]
  resource_attributes {
    name     = "serviceName"
    value    = "iac-*"
    operator = "stringEquals"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct access group policy with resource tags", () => {
      let actualData = formatAccessGroupPolicy({
        group: "frog",
        name: "frogs-only",
        roles: ["Reader"],
        resource_tags: [
          {
            name: "serviceName",
            value: "iac-*",
            operator: "stringEquals",
          },
        ],
      });
      let expectedData = `
resource "ibm_iam_access_group_policy" "frog_frogs_only_policy" {
  access_group_id = ibm_iam_access_group.frog_access_group.id
  roles = [
    "Reader"
  ]
  resource_tags {
    name     = "serviceName"
    value    = "iac-*"
    operator = "stringEquals"
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
  describe("formatAccessGroupDynamicRule", () => {
    it("should return correct access group rule", () => {
      let actualData = formatAccessGroupDynamicRule({
        group: "frog",
        name: "frogs-only",
        expiration: 4,
        identity_provider: "test-idp.com",
        conditions: {
          claim: "blueGroups",
          operator: "CONTAINS",
          value: '"test-bluegroup-saml"',
        },
      });
      let expectedData = `
resource "ibm_iam_access_group_dynamic_rule" "frog_frogs_only_dynamic_rule" {
  name              = "frog-frogs-only-dynamic-rule"
  access_group_id   = ibm_iam_access_group.frog_access_group.id
  expiration        = 4
  identity_provider = "test-idp.com"
  conditions {
    claim    = "blueGroups"
    operator = "CONTAINS"
    value    = "\"test-bluegroup-saml\""
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
  describe("formatGroupMembers", () => {
    it("should invite members to a group", () => {
      let actualData = formatGroupMembers({
        group: "frog",
        ibm_ids: ["Jennifer.Valle@ibm.com"],
      });
      let expectedData = `
resource "ibm_iam_access_group_members" "frog_invites" {
  access_group_id = ibm_iam_access_group.frog_access_group.id
  ibm_ids = [
    "Jennifer.Valle@ibm.com"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("iamTf", () => {
    it("should return terraform for iam and access groups", () => {
      let actualData = iamTf({
        _options: {
          prefix: "iac",
          tags: ["frog"],
        },
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
        access_groups: [
          {
            name: "frog",
            description: "an access group for frogs",
            policies: [
              {
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
              },
            ],
            dynamic_policies: [
              {
                group: "frog",
                name: "frogs-only",
                expiration: 4,
                identity_provider: "test-idp.com",
                conditions: {
                  claim: "blueGroups",
                  operator: "CONTAINS",
                  value: '"test-bluegroup-saml"',
                },
              },
            ],
            has_invites: true,
            invites: {
              group: "frog",
              ibm_ids: ["Jennifer.Valle@ibm.com"],
            },
          },
        ],
      });
      let expectedData = `##############################################################################
# IAM Account Settings
##############################################################################

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

##############################################################################

##############################################################################
# Frog Access Group
##############################################################################

resource "ibm_iam_access_group" "frog_access_group" {
  name        = "iac-frog-ag"
  description = "an access group for frogs"
  tags = [
    "frog"
  ]
}

resource "ibm_iam_access_group_policy" "frog_frogs_only_policy" {
  access_group_id = ibm_iam_access_group.frog_access_group.id
  roles = [
    "Reader"
  ]
  resources {
    resource_instance_id = "1234"
    region               = var.region
    service              = "cloud-object-storage"
    resource_type        = "resource-group"
    attributes = {
      vpcId = "*"
    }
  }
}

resource "ibm_iam_access_group_dynamic_rule" "frog_frogs_only_dynamic_rule" {
  name              = "frog-frogs-only-dynamic-rule"
  access_group_id   = ibm_iam_access_group.frog_access_group.id
  expiration        = 4
  identity_provider = "test-idp.com"
  conditions {
    claim    = "blueGroups"
    operator = "CONTAINS"
    value    = "\"test-bluegroup-saml\""
  }
}

resource "ibm_iam_access_group_members" "frog_invites" {
  access_group_id = ibm_iam_access_group.frog_access_group.id
  ibm_ids = [
    "Jennifer.Valle@ibm.com"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return terraform for iam and access groups with account settings disabled and invites disabled", () => {
      let actualData = iamTf({
        _options: {
          prefix: "iac",
          tags: ["frog"],
        },
        iam_account_settings: {
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
        },
        access_groups: [
          {
            name: "frog",
            description: "an access group for frogs",
            policies: [
              {
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
              },
            ],
            dynamic_policies: [
              {
                group: "frog",
                name: "frogs-only",
                expiration: 4,
                identity_provider: "test-idp.com",
                conditions: {
                  claim: "blueGroups",
                  operator: "CONTAINS",
                  value: '"test-bluegroup-saml"',
                },
              },
            ],
            has_invites: false,
            invites: {
              group: "frog",
              ibm_ids: ["Jennifer.Valle@ibm.com"],
            },
          },
        ],
      });
      let expectedData = `##############################################################################
# Frog Access Group
##############################################################################

resource "ibm_iam_access_group" "frog_access_group" {
  name        = "iac-frog-ag"
  description = "an access group for frogs"
  tags = [
    "frog"
  ]
}

resource "ibm_iam_access_group_policy" "frog_frogs_only_policy" {
  access_group_id = ibm_iam_access_group.frog_access_group.id
  roles = [
    "Reader"
  ]
  resources {
    resource_instance_id = "1234"
    region               = var.region
    service              = "cloud-object-storage"
    resource_type        = "resource-group"
    attributes = {
      vpcId = "*"
    }
  }
}

resource "ibm_iam_access_group_dynamic_rule" "frog_frogs_only_dynamic_rule" {
  name              = "frog-frogs-only-dynamic-rule"
  access_group_id   = ibm_iam_access_group.frog_access_group.id
  expiration        = 4
  identity_provider = "test-idp.com"
  conditions {
    claim    = "blueGroups"
    operator = "CONTAINS"
    value    = "\"test-bluegroup-saml\""
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
