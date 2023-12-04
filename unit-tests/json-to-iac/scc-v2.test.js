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
              attachment_name: "attachment name",
              profile_id: "01326738-c8ca-456f-8315-e4573f534869",
            },
          ],
        },
      });
      let expectedData = `##############################################################################
# Security and Compliance Center
##############################################################################

resource "ibm_resource_instance" "scc_instance" {
  name           = "\${var.prefix}-scc"
  service        = "compliance"
  plan           = "security-compliance-center-standard-plan"
  location       = "us-south"
  resource_group = "slz-service-rg"
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
              attachment_name: "attachment name",
              profile_id: "01326738-c8ca-456f-8315-e4573f534869",
            },
          ],
        },
      });
      let expectedData = ``;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct terraform"
      );
    });
  });
});
