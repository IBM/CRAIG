const { assert } = require("chai");
const {
  formatSecretsManagerToKmsAuth,
  formatSecretsManagerInstance,
  secretsManagerTf,
} = require("../../lib/json-to-iac/secrets-manager");

describe("secrets manager", () => {
  describe("formatSecretsManagerToKmsAuth", () => {
    it("should return correct data for secrets manager", () => {
      let actualData = formatSecretsManagerToKmsAuth(
        "kms",
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          key_management: [
            {
              name: "kms",
              service: "kms",
              resource_group: "slz-service-rg",
              authorize_vpc_reader_role: true,
              use_data: false,
              use_hs_crypto: false,
              keys: [
                {
                  name: "key",
                  root_key: true,
                  key_ring: "test",
                  force_delete: true,
                  endpoint: "private",
                  rotation: 12,
                  dual_auth_delete: true,
                },
              ],
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_iam_authorization_policy" "secrets_manager_to_kms_kms_policy" {
  source_service_name         = "secrets-manager"
  roles                       = ["Reader"]
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = ibm_resource_instance.kms.name
  target_resource_instance_id = ibm_resource_instance.kms.guid
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return auth policy tf"
      );
    });
    it("should return correct data for secrets manager with kms from data", () => {
      let actualData = formatSecretsManagerToKmsAuth(
        "kms",
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          key_management: [
            {
              name: "kms",
              service: "kms",
              resource_group: "slz-service-rg",
              authorize_vpc_reader_role: true,
              use_data: true,
              use_hs_crypto: false,
              keys: [
                {
                  name: "key",
                  root_key: true,
                  key_ring: "test",
                  force_delete: true,
                  endpoint: "private",
                  rotation: 12,
                  dual_auth_delete: true,
                },
              ],
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_iam_authorization_policy" "secrets_manager_to_kms_kms_policy" {
  source_service_name         = "secrets-manager"
  roles                       = ["Reader"]
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = data.ibm_resource_instance.kms.name
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return auth policy tf"
      );
    });
  });
  describe("formatSecretsManagerInstance", () => {
    it("should return correct data for secrets manager", () => {
      let actualData = formatSecretsManagerInstance(
        {
          name: "secrets-manager",
          resource_group: "slz-service-rg",
          kms: "kms",
          kms_key: "key",
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          key_management: [
            {
              name: "kms",
              service: "kms",
              resource_group: "slz-service-rg",
              authorize_vpc_reader_role: true,
              use_data: false,
              use_hs_crypto: false,
              keys: [
                {
                  name: "key",
                  root_key: true,
                  key_ring: "test",
                  force_delete: true,
                  endpoint: "private",
                  rotation: 12,
                  dual_auth_delete: true,
                },
              ],
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_resource_instance" "secrets_manager_secrets_manager" {
  name              = "iac-secrets-manager"
  location          = "us-south"
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id

  parameters = {
    kms_key = ibm_kms_key.kms_key_key.crn
  }

  timeouts {
    create = "1h"
    delete = "1h"
  }
  
  depends_on = [ibm_iam_authorization_policy.secrets_manager_to_kms_kms_policy]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return auth policy tf"
      );
    });
  });
  describe("secretsManagerTf", () => {
    it("should create the correct terraform code", () => {
      let actualData = secretsManagerTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_data: false,
            name: "slz-service-rg",
          },
        ],
        key_management: [
          {
            name: "kms",
            service: "kms",
            resource_group: "slz-service-rg",
            authorize_vpc_reader_role: true,
            use_data: false,
            use_hs_crypto: false,
            keys: [
              {
                name: "key",
                root_key: true,
                key_ring: "test",
                force_delete: true,
                endpoint: "private",
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
          {
            name: "kms2",
            service: "kms",
            resource_group: "slz-service-rg",
            authorize_vpc_reader_role: true,
            use_data: false,
            use_hs_crypto: false,
            keys: [
              {
                name: "key",
                root_key: true,
                key_ring: "test",
                force_delete: true,
                endpoint: "private",
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
          {
            name: "kms3",
            service: "kms",
            resource_group: "slz-service-rg",
            authorize_vpc_reader_role: true,
            use_data: false,
            use_hs_crypto: false,
            has_secrets_manager_auth: true,
            keys: [
              {
                name: "key",
                root_key: true,
                key_ring: "test",
                force_delete: true,
                endpoint: "private",
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
        ],
        secrets_manager: [
          {
            name: "secrets-manager",
            resource_group: "slz-service-rg",
            kms: "kms",
            kms_key: "key",
          },
          {
            name: "secrets-manager2",
            resource_group: "slz-service-rg",
            kms: "kms2",
            kms_key: "key",
          },
          {
            name: "secrets-manager3",
            resource_group: "slz-service-rg",
            kms: "kms3",
            kms_key: "key",
          },
        ],
      });
      let expectedData = `##############################################################################
# Key Management Authorizations
##############################################################################

resource "ibm_iam_authorization_policy" "secrets_manager_to_kms_kms_policy" {
  source_service_name         = "secrets-manager"
  roles                       = ["Reader"]
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = ibm_resource_instance.kms.name
  target_resource_instance_id = ibm_resource_instance.kms.guid
}

resource "ibm_iam_authorization_policy" "secrets_manager_to_kms2_kms_policy" {
  source_service_name         = "secrets-manager"
  roles                       = ["Reader"]
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = ibm_resource_instance.kms2.name
  target_resource_instance_id = ibm_resource_instance.kms2.guid
}

##############################################################################

##############################################################################
# Secrets Manager Instances
##############################################################################

resource "ibm_resource_instance" "secrets_manager_secrets_manager" {
  name              = "iac-secrets-manager"
  location          = "us-south"
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id

  parameters = {
    kms_key = ibm_kms_key.kms_key_key.crn
  }

  timeouts {
    create = "1h"
    delete = "1h"
  }
  
  depends_on = [ibm_iam_authorization_policy.secrets_manager_to_kms_kms_policy]
}

resource "ibm_resource_instance" "secrets_manager2_secrets_manager" {
  name              = "iac-secrets-manager2"
  location          = "us-south"
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id

  parameters = {
    kms_key = ibm_kms_key.kms2_key_key.crn
  }

  timeouts {
    create = "1h"
    delete = "1h"
  }
  
  depends_on = [ibm_iam_authorization_policy.secrets_manager_to_kms2_kms_policy]
}

resource "ibm_resource_instance" "secrets_manager3_secrets_manager" {
  name              = "iac-secrets-manager3"
  location          = "us-south"
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id

  parameters = {
    kms_key = ibm_kms_key.kms3_key_key.crn
  }

  timeouts {
    create = "1h"
    delete = "1h"
  }
}

##############################################################################`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should have the correct terraform code"
      );
    });
        it("should create the correct terraform code when all kms have secrets auth", () => {
      let actualData = secretsManagerTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_data: false,
            name: "slz-service-rg",
          },
        ],
        key_management: [
          {
            name: "kms",
            service: "kms",
            resource_group: "slz-service-rg",
            authorize_vpc_reader_role: true,
            has_secrets_manager_auth: true,
            use_data: false,
            use_hs_crypto: false,
            keys: [
              {
                name: "key",
                root_key: true,
                key_ring: "test",
                force_delete: true,
                endpoint: "private",
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
          {
            name: "kms2",
            service: "kms",
            resource_group: "slz-service-rg",
            authorize_vpc_reader_role: true,
            has_secrets_manager_auth: true,
            use_data: false,
            use_hs_crypto: false,
            keys: [
              {
                name: "key",
                root_key: true,
                key_ring: "test",
                force_delete: true,
                endpoint: "private",
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
          {
            name: "kms3",
            service: "kms",
            resource_group: "slz-service-rg",
            authorize_vpc_reader_role: true,
            use_data: false,
            use_hs_crypto: false,
            has_secrets_manager_auth: true,
            keys: [
              {
                name: "key",
                root_key: true,
                key_ring: "test",
                force_delete: true,
                endpoint: "private",
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
        ],
        secrets_manager: [
          {
            name: "secrets-manager",
            resource_group: "slz-service-rg",
            kms: "kms",
            kms_key: "key",
          },
          {
            name: "secrets-manager2",
            resource_group: "slz-service-rg",
            kms: "kms2",
            kms_key: "key",
          },
          {
            name: "secrets-manager3",
            resource_group: "slz-service-rg",
            kms: "kms3",
            kms_key: "key",
          },
        ],
      });
      let expectedData = `##############################################################################
# Secrets Manager Instances
##############################################################################

resource "ibm_resource_instance" "secrets_manager_secrets_manager" {
  name              = "iac-secrets-manager"
  location          = "us-south"
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id

  parameters = {
    kms_key = ibm_kms_key.kms_key_key.crn
  }

  timeouts {
    create = "1h"
    delete = "1h"
  }
}

resource "ibm_resource_instance" "secrets_manager2_secrets_manager" {
  name              = "iac-secrets-manager2"
  location          = "us-south"
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id

  parameters = {
    kms_key = ibm_kms_key.kms2_key_key.crn
  }

  timeouts {
    create = "1h"
    delete = "1h"
  }
}

resource "ibm_resource_instance" "secrets_manager3_secrets_manager" {
  name              = "iac-secrets-manager3"
  location          = "us-south"
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id

  parameters = {
    kms_key = ibm_kms_key.kms3_key_key.crn
  }

  timeouts {
    create = "1h"
    delete = "1h"
  }
}

##############################################################################`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should have the correct terraform code"
      );
    });
  });
});
