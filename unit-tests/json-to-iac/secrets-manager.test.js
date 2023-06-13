const { assert } = require("chai");
const {
  formatSecretsManagerToKmsAuth,
  formatSecretsManagerInstance,
  secretsManagerTf,
  formatSecretsManagerSecret,
} = require("../../client/src/lib/json-to-iac/secrets-manager");

describe("secrets manager", () => {
  describe("formatSecretsManagerToKmsAuth", () => {
    it("should return correct data for secrets manager", () => {
      let actualData = formatSecretsManagerToKmsAuth("kms", {
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
      });
      let expectedData = `
resource "ibm_iam_authorization_policy" "secrets_manager_to_kms_kms_policy" {
  source_service_name         = "secrets-manager"
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles = [
    "Reader"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return auth policy tf"
      );
    });
    it("should return correct data for secrets manager with kms from data", () => {
      let actualData = formatSecretsManagerToKmsAuth("kms", {
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
      });
      let expectedData = `
resource "ibm_iam_authorization_policy" "secrets_manager_to_kms_kms_policy" {
  source_service_name         = "secrets-manager"
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = "kms"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
  roles = [
    "Reader"
  ]
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
          encryption_key: "key",
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
  name              = "\${var.prefix}-secrets-manager"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_iam_authorization_policy.secrets_manager_to_kms_kms_policy
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return auth policy tf"
      );
    });
    it("should return correct data for secrets manager with invalid encryption key", () => {
      let actualData = formatSecretsManagerInstance(
        {
          name: "secrets-manager",
          resource_group: "slz-service-rg",
          kms: null,
          encryption_key: null,
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
  name              = "\${var.prefix}-secrets-manager"
  location          = var.region
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  parameters = {
    kms_key = "ERROR: Unfound Reference"
  }
  timeouts {
    create = "1h"
    delete = "1h"
  }
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return auth policy tf"
      );
    });
  });
  describe("formatSecretsManagerSecret", () => {
    it("should return correct data for secrets manager secret with reference to cos key", () => {
      let actualData = formatSecretsManagerSecret(
        {
          name: "cos-secret",
          secrets_manager: "secrets-manager",
          credentials: "cos-bind-key",
          credential_instance: "cos",
          credential_type: "cos",
          description: "Credentials for COS instance",
          type: "kv",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_sm_kv_secret" "secrets_manager_cos_secret" {
  name        = "\${var.prefix}-secrets-manager-cos-secret"
  instance_id = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region      = var.region
  description = "Credentials for COS instance"
  data = {
    credentials = ibm_resource_key.cos_object_storage_key_cos_bind_key.credentials
  }
}
`;
      assert.deepEqual(actualData, expectedData, "it should return secret tf");
    });
    it("should return correct data for secrets manager secret with imported cert", () => {
      let actualData = formatSecretsManagerSecret(
        {
          name: "imported-cert",
          secrets_manager: "secrets-manager",
          credentials: "cos-bind-key",
          credential_instance: "cos",
          credential_type: "cos",
          description: "Credentials for COS instance",
          type: "imported",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_sm_kv_secret" "secrets_manager_imported_cert" {
  name        = "\${var.prefix}-secrets-manager-imported-cert"
  instance_id = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region      = var.region
  description = "Credentials for COS instance"
  certificate = var.secrets_manager_imported_cert_data
}
`;
      assert.deepEqual(actualData, expectedData, "it should return secret tf");
    });
    it("should return correct data for secrets manager secret with reference to local craig cos key", () => {
      let actualData = formatSecretsManagerSecret(
        {
          secrets_manager: "secrets-manager",
          cos: "atracker-cos",
          key: "cos-bind-key",
          ref: "ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_sm_kv_secret" "secrets_manager_cos_bind_key" {
  name        = "\${var.prefix}-secrets-manager-cos-bind-key"
  instance_id = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region      = var.region
  description = "Credentials for COS instance"
  data = {
    credentials = ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key.credentials
  }
}
`;
      assert.deepEqual(actualData, expectedData, "it should return secret tf");
    });
    it("should return correct data for secrets manager secret with reference to local craig appid key", () => {
      let actualData = formatSecretsManagerSecret(
        {
          secrets_manager: "secrets-manager",
          appid: "default",
          key: "test",
          ref: "ibm_resource_key.default_key_test",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_sm_kv_secret" "secrets_manager_appid_default_key_test" {
  name        = "\${var.prefix}-secrets-manager-appid-default-key-test"
  instance_id = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region      = var.region
  description = "Credentials for AppID instance"
  data = {
    credentials = ibm_resource_key.default_key_test.credentials
  }
}
`;
      assert.deepEqual(actualData, expectedData, "it should return secret tf");
    });
    it("should return correct data for secrets manager secret with reference to local craig logdna key", () => {
      let actualData = formatSecretsManagerSecret(
        {
          secrets_manager: "secrets-manager",
          ref: "ibm_resource_key.logdna_key",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_sm_kv_secret" "secrets_manager_logdna_key" {
  name        = "\${var.prefix}-secrets-manager-logdna-key"
  instance_id = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region      = var.region
  description = "LogDNA Credentials"
  data = {
    credentials = ibm_resource_key.logdna_key.credentials
  }
}
`;
      assert.deepEqual(actualData, expectedData, "it should return secret tf");
    });
    it("should return correct data for secrets manager secret with reference to local craig sysdig key", () => {
      let actualData = formatSecretsManagerSecret(
        {
          secrets_manager: "secrets-manager",
          ref: "ibm_resource_key.sysdig_key",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_sm_kv_secret" "secrets_manager_sysdig_key" {
  name        = "\${var.prefix}-secrets-manager-sysdig-key"
  instance_id = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region      = var.region
  description = "Sysdig Credentials"
  data = {
    credentials = ibm_resource_key.sysdig_key.credentials
  }
}
`;
      assert.deepEqual(actualData, expectedData, "it should return secret tf");
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
            use_hs_crypto: true,
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
            encryption_key: "key",
          },
          {
            name: "secrets-manager2",
            resource_group: "slz-service-rg",
            kms: "kms2",
            encryption_key: "key",
          },
          {
            name: "secrets-manager3",
            resource_group: "slz-service-rg",
            kms: "kms3",
            encryption_key: "key",
          },
        ],
      });
      let expectedData = `##############################################################################
# Key Management Authorizations
##############################################################################

resource "ibm_iam_authorization_policy" "secrets_manager_to_kms_kms_policy" {
  source_service_name         = "secrets-manager"
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles = [
    "Reader"
  ]
}

resource "ibm_iam_authorization_policy" "secrets_manager_to_kms2_kms_policy" {
  source_service_name         = "secrets-manager"
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = ibm_resource_instance.kms2.guid
  roles = [
    "Reader"
  ]
}

##############################################################################

##############################################################################
# Secrets Manager Instances
##############################################################################

resource "ibm_resource_instance" "secrets_manager_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_iam_authorization_policy.secrets_manager_to_kms_kms_policy
  ]
}

resource "ibm_resource_instance" "secrets_manager2_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager2"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_iam_authorization_policy.secrets_manager_to_kms2_kms_policy
  ]
}

resource "ibm_resource_instance" "secrets_manager3_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager3"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should have the correct terraform code"
      );
    });
    it("should create the correct terraform code when invalid kms ref", () => {
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
            kms: null,
            encryption_key: null,
          },
        ],
      });
      let expectedData = `##############################################################################
# Secrets Manager Instances
##############################################################################

resource "ibm_resource_instance" "secrets_manager_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager"
  location          = var.region
  plan              = "standard"
  service           = "secrets-manager"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  parameters = {
    kms_key = "ERROR: Unfound Reference"
  }
  timeouts {
    create = "1h"
    delete = "1h"
  }
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should have the correct terraform code"
      );
    });
    it("should create the correct terraform code with no secrets manager instances", () => {
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
        secrets_manager: [],
      });
      let expectedData = ``;
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
            encryption_key: "key",
          },
          {
            name: "secrets-manager2",
            resource_group: "slz-service-rg",
            kms: "kms2",
            encryption_key: "key",
          },
          {
            name: "secrets-manager3",
            resource_group: "slz-service-rg",
            kms: "kms3",
            encryption_key: "key",
          },
        ],
      });
      let expectedData = `##############################################################################
# Secrets Manager Instances
##############################################################################

resource "ibm_resource_instance" "secrets_manager_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_resource_instance" "secrets_manager2_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager2"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_resource_instance" "secrets_manager3_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager3"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should have the correct terraform code"
      );
    });
    it("should create the correct terraform code with a secret", () => {
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
            use_hs_crypto: true,
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
            encryption_key: "key",
            secrets: [
              {
                name: "cos-secret",
                secrets_manager: "secrets-manager",
                credentials: "cos-bind-key",
                credential_instance: "cos",
                credential_type: "cos",
                description: "Credentials for COS instance",
              },
            ],
          },
          {
            name: "secrets-manager2",
            resource_group: "slz-service-rg",
            kms: "kms2",
            encryption_key: "key",
          },
          {
            name: "secrets-manager3",
            resource_group: "slz-service-rg",
            kms: "kms3",
            encryption_key: "key",
          },
        ],
      });
      let expectedData = `##############################################################################
# Key Management Authorizations
##############################################################################

resource "ibm_iam_authorization_policy" "secrets_manager_to_kms_kms_policy" {
  source_service_name         = "secrets-manager"
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles = [
    "Reader"
  ]
}

resource "ibm_iam_authorization_policy" "secrets_manager_to_kms2_kms_policy" {
  source_service_name         = "secrets-manager"
  description                 = "Allow Secets Manager instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = ibm_resource_instance.kms2.guid
  roles = [
    "Reader"
  ]
}

##############################################################################

##############################################################################
# Secrets Manager Instances
##############################################################################

resource "ibm_resource_instance" "secrets_manager_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_iam_authorization_policy.secrets_manager_to_kms_kms_policy
  ]
}

resource "ibm_sm_kv_secret" "secrets_manager_cos_secret" {
  name        = "\${var.prefix}-secrets-manager-cos-secret"
  instance_id = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region      = var.region
  description = "Credentials for COS instance"
  data = {
    credentials = ibm_resource_key.cos_object_storage_key_cos_bind_key.credentials
  }
}

resource "ibm_resource_instance" "secrets_manager2_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager2"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_iam_authorization_policy.secrets_manager_to_kms2_kms_policy
  ]
}

resource "ibm_resource_instance" "secrets_manager3_secrets_manager" {
  name              = "\${var.prefix}-secrets-manager3"
  location          = var.region
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
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should have the correct terraform code"
      );
    });
  });
});
