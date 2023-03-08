const { assert } = require("chai");
const {
  formatPostureCredential,
  formatScc,
  sccTf,
} = require("../../client/src/lib/json-to-iac/scc");

describe("security compliance center resources", () => {
  describe("formatPostureCredential", () => {
    it("should create the correct posture credential", () => {
      let actualData = formatPostureCredential({
        credential_description: "scc posture credential description",
        id: "scc_group_id",
        passphrase: "scc_group_passphrase",
        name: "scc-posture-credential",
      });
      let expectedData = `##############################################################################
# Security and Compliance Center Credentials
##############################################################################

resource "ibm_scc_posture_credential" "scc_credentials" {
  description = "scc posture credential description"
  enabled     = true
  name        = "scc-posture-credential"
  type        = "ibm_cloud"
  purpose     = "discovery_fact_collection_remediation"

  display_fields {
    ibm_api_key = var.ibmcloud_api_key
  }

  group {
    id         = "scc_group_id"
    passphrase = "scc_group_passphrase"
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
  });
  describe("formatScc", () => {
    it("should create scc terraform", () => {
      let actualData = formatScc(
        {
          credential_description: "scc posture credential description",
          id: "scc_group_id",
          passphrase: "scc_group_passphrase",
          name: "scc-posture-credential",
          location: "us",
          collector_description: "scc collector",
          is_public: true,
          scope_description: "scc scope",
        },
        {
          _options: {
            prefix: "iac",
          },
        }
      );
      let expectedData = `##############################################################################
# Security and Compliance Center
##############################################################################

resource "ibm_scc_account_settings" "ibm_scc_account_settings_instance" {
  location {
    location_id = "us"
  }
}

resource "ibm_scc_posture_collector" "collector" {
  description = "scc collector"
  is_public   = true
  managed_by  = "ibm"
  name        = "iac-scc-collector"
}

resource "ibm_scc_posture_scope" "scc_scope" {
  collector_ids   = [ibm_scc_posture_collector.collector.id]
  credential_id   = ibm_scc_posture_credential.scc_credentials.id
  credential_type = "ibm"
  description     = "scc scope"
  name            = "iac-scc-scope"
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct terraform"
      );
    });
  });
  describe("sccTf", () => {
    it("should create scc terraform", () => {
      let actualData = sccTf({
        _options: {
          prefix: "iac",
        },
        scc: {
          enable: true,
          credential_description: "scc posture credential description",
          id: "scc_group_id",
          passphrase: "scc_group_passphrase",
          name: "scc-posture-credential",
          location: "us",
          collector_description: "scc collector",
          is_public: true,
          scope_description: "scc scope",
        },
      });
      let expectedData = `##############################################################################
# Security and Compliance Center Credentials
##############################################################################

resource "ibm_scc_posture_credential" "scc_credentials" {
  description = "scc posture credential description"
  enabled     = true
  name        = "scc-posture-credential"
  type        = "ibm_cloud"
  purpose     = "discovery_fact_collection_remediation"

  display_fields {
    ibm_api_key = var.ibmcloud_api_key
  }

  group {
    id         = "scc_group_id"
    passphrase = "scc_group_passphrase"
  }
}

##############################################################################

##############################################################################
# Security and Compliance Center
##############################################################################

resource "ibm_scc_account_settings" "ibm_scc_account_settings_instance" {
  location {
    location_id = "us"
  }
}

resource "ibm_scc_posture_collector" "collector" {
  description = "scc collector"
  is_public   = true
  managed_by  = "ibm"
  name        = "iac-scc-collector"
}

resource "ibm_scc_posture_scope" "scc_scope" {
  collector_ids   = [ibm_scc_posture_collector.collector.id]
  credential_id   = ibm_scc_posture_credential.scc_credentials.id
  credential_type = "ibm"
  description     = "scc scope"
  name            = "iac-scc-scope"
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
      let actualData = sccTf({
        _options: {
          prefix: "iac",
        },
        scc: {
          enable: false,
          credential_description: "scc posture credential description",
          id: "scc_group_id",
          passphrase: "scc_group_passphrase",
          name: "scc-posture-credential",
          location: "us",
          collector_description: "scc collector",
          is_public: true,
          scope_description: "scc scope",
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
