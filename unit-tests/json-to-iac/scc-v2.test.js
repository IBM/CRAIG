const { assert } = require("chai");
const { scc2Tf } = require("../../client/src/lib/json-to-iac/scc-v2");

describe("security compliance center resources", () => {
  describe("scc2Tf", () => {
    it("should create scc terraform", () => {
      let actualData = scc2Tf({
        _options: {
          prefix: "iac",
        },
        scc_v2: {
          enable: true,
          resource_group: "slz-service-rg",
          region: "us-south",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          profile_attachments: [
            {
              name: "attachment name",
              profile: "FS Cloud",
              schedule: "every_30_days",
            },
          ],
        },
        resource_groups: [
          {
            name: "slz-service-rg",
            use_data: false,
          },
        ],
      });
      let expectedData = `##############################################################################
# Security and Compliance Center
##############################################################################

resource "ibm_resource_instance" "scc_instance" {
  name              = "\${var.prefix}-scc"
  service           = "compliance"
  plan              = "security-compliance-center-standard-plan"
  location          = "us-south"
  resource_group_id = ibm_resource_group.slz_service_rg.id
}

resource "ibm_scc_profile_attachment" "attachment_name_profile_attachment" {
  name        = "\${var.prefix}-scc-attachment-name"
  profile_id  = "01326738-c8ca-456f-8315-e4573f534869"
  description = "example description"
  instance_id = ibm_resource_instance.scc_instance.id
  schedule    = "every_30_days"
  status      = "enabled"
  scope {
    environment = "ibm-cloud"
    properties {
      name  = "scope_type"
      value = "account"
    }
  }
  notifications {
    enabled = true
    controls {
      threshold_limit = 14
      failed_control_ids = [
      ]
    }
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct terraform"
      );
    });
    it("should create scc terraform with cos instance settings", () => {
      let actualData = scc2Tf({
        _options: {
          prefix: "iac",
        },
        scc_v2: {
          enable: true,
          resource_group: "slz-service-rg",
          region: "us-south",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          profile_attachments: [
            {
              name: "attachment name",
              profile: "FS Cloud",
              schedule: "every_30_days",
            },
          ],
          use_cos: true,
          cos: "cos",
          bucket: "bucket",
        },
        resource_groups: [
          {
            name: "slz-service-rg",
            use_data: false,
          },
        ],
        object_storage: [
          {
            name: "cos",
          },
        ],
      });
      let expectedData = `##############################################################################
# Security and Compliance Center
##############################################################################

resource "ibm_resource_instance" "scc_instance" {
  name              = "\${var.prefix}-scc"
  service           = "compliance"
  plan              = "security-compliance-center-standard-plan"
  location          = "us-south"
  resource_group_id = ibm_resource_group.slz_service_rg.id
}

resource "ibm_scc_profile_attachment" "attachment_name_profile_attachment" {
  name        = "\${var.prefix}-scc-attachment-name"
  profile_id  = "01326738-c8ca-456f-8315-e4573f534869"
  description = "example description"
  instance_id = ibm_resource_instance.scc_instance.id
  schedule    = "every_30_days"
  status      = "enabled"
  scope {
    environment = "ibm-cloud"
    properties {
      name  = "scope_type"
      value = "account"
    }
  }
  notifications {
    enabled = true
    controls {
      threshold_limit = 14
      failed_control_ids = [
      ]
    }
  }
}

resource "ibm_iam_authorization_policy" "scc_to_cos_object_storage_policy" {
  source_service_name         = "compliance"
  description                 = "Allow Security and Compliance Center to access Cos Object Storage"
  target_service_name         = "cloud-object-storage"
  target_resource_instance_id = ibm_resource_instance.cos_object_storage.guid
  roles = [
    "Writer"
  ]
}

resource "ibm_scc_instance_settings" "scc_instance_settings" {
  instance_id = ibm_resource_instance.scc_instance.guid
  object_storage {
    instance_crn = ibm_resource_instance.cos_object_storage.crn
    bucket       = ibm_cos_bucket.cos_object_storage_bucket_bucket.bucket_name
  }
  event_notifications {}
  depends_on = [
    ibm_iam_authorization_policy.scc_to_cos_object_storage_policy
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct terraform"
      );
    });
    it("should create scc terraform with cos instance settings from data", () => {
      let actualData = scc2Tf({
        _options: {
          prefix: "iac",
        },
        scc_v2: {
          enable: true,
          resource_group: "slz-service-rg",
          region: "us-south",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          profile_attachments: [
            {
              name: "attachment name",
              profile: "FS Cloud",
              schedule: "every_30_days",
            },
          ],
          use_cos: true,
          cos: "cos",
          bucket: "bucket",
        },
        resource_groups: [
          {
            name: "slz-service-rg",
            use_data: false,
          },
        ],
        object_storage: [
          {
            name: "cos",
            use_data: true,
          },
        ],
      });
      let expectedData = `##############################################################################
# Security and Compliance Center
##############################################################################

resource "ibm_resource_instance" "scc_instance" {
  name              = "\${var.prefix}-scc"
  service           = "compliance"
  plan              = "security-compliance-center-standard-plan"
  location          = "us-south"
  resource_group_id = ibm_resource_group.slz_service_rg.id
}

resource "ibm_scc_profile_attachment" "attachment_name_profile_attachment" {
  name        = "\${var.prefix}-scc-attachment-name"
  profile_id  = "01326738-c8ca-456f-8315-e4573f534869"
  description = "example description"
  instance_id = ibm_resource_instance.scc_instance.id
  schedule    = "every_30_days"
  status      = "enabled"
  scope {
    environment = "ibm-cloud"
    properties {
      name  = "scope_type"
      value = "account"
    }
  }
  notifications {
    enabled = true
    controls {
      threshold_limit = 14
      failed_control_ids = [
      ]
    }
  }
}

resource "ibm_iam_authorization_policy" "scc_to_cos_object_storage_policy" {
  source_service_name         = "compliance"
  description                 = "Allow Security and Compliance Center to access Cos Object Storage"
  target_service_name         = "cloud-object-storage"
  target_resource_instance_id = data.ibm_resource_instance.cos_object_storage.guid
  roles = [
    "Writer"
  ]
}

resource "ibm_scc_instance_settings" "scc_instance_settings" {
  instance_id = ibm_resource_instance.scc_instance.guid
  object_storage {
    instance_crn = data.ibm_resource_instance.cos_object_storage.crn
    bucket       = ibm_cos_bucket.cos_object_storage_bucket_bucket.bucket_name
  }
  event_notifications {}
  depends_on = [
    ibm_iam_authorization_policy.scc_to_cos_object_storage_policy
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct terraform"
      );
    });
    it("should return empty string when not enabled", () => {
      let actualData = scc2Tf({
        _options: {
          prefix: "iac",
        },
        scc_v2: {
          enable: false,
          resource_group: "slz-service-rg",
          region: "us-south",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          profile_attachments: [
            {
              name: "attachment name",
              profile: "FS Cloud",
              schedule: "every_30_days",
            },
          ],
        },
      });
      let expectedData = null;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct terraform"
      );
    });
  });
});
