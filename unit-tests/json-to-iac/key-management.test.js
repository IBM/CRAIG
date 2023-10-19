const { assert } = require("chai");
const {
  formatKmsInstance,
  formatKmsAuthPolicy,
  formatKeyRing,
  formatKmsKey,
  formatKmsKeyPolicy,
  kmsInstanceTf,
  kmsTf,
} = require("../../client/src/lib/json-to-iac/key-management");

// remove prefix when data
// ring add ring
// key add key
describe("key management", () => {
  describe("formatKmsInstance", () => {
    it("should format a key management resource", () => {
      let expectedData = `
resource "ibm_resource_instance" "kms" {
  name              = "\${var.prefix}-kms"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "kms"
  plan              = "tiered-pricing"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}
`;
      let actualData = formatKmsInstance(
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
        },
        {
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should format instance data"
      );
    });
    it("should format a key management resource with resource group from data", () => {
      let expectedData = `
resource "ibm_resource_instance" "kms" {
  name              = "\${var.prefix}-kms"
  resource_group_id = data.ibm_resource_group.slz_service_rg.id
  service           = "kms"
  plan              = "tiered-pricing"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}
`;
      let actualData = formatKmsInstance(
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
        },
        {
          resource_groups: [
            {
              name: "slz-service-rg",
              use_data: true,
            },
          ],
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should format instance data"
      );
    });
    it("should format a key management data source", () => {
      let expectedData = `
data "ibm_resource_instance" "kms" {
  name              = "kms"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "kms"
}
`;
      let actualData = formatKmsInstance(
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
          use_data: true,
        },
        {
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should format instance data"
      );
    });
    it("should format hs crypto data source", () => {
      let expectedData = `
data "ibm_resource_instance" "kms" {
  name              = "kms"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "hs-crypto"
}
`;
      let actualData = formatKmsInstance(
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
          use_hs_crypto: true,
          use_data: true,
        },
        {
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should format instance data"
      );
    });
  });
  describe("formatKmsAuthPolicy", () => {
    it("should return a correct server protect policy", () => {
      let expectedData = `
resource "ibm_iam_authorization_policy" "kms_server_protect_policy" {
  source_service_name         = "server-protect"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  roles = [
    "Reader"
  ]
}
`;
      let actualData = formatKmsAuthPolicy({
        name: "kms",
        service: "kms",
        resource_group: "slz-service-rg",
        authorize_vpc_reader_role: true,
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create the correct policy"
      );
    });
    it("should return a correct server protect policy with data source", () => {
      let expectedData = `
resource "ibm_iam_authorization_policy" "kms_server_protect_policy" {
  source_service_name         = "server-protect"
  target_service_name         = "kms"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  roles = [
    "Reader"
  ]
}
`;
      let actualData = formatKmsAuthPolicy({
        name: "kms",
        service: "kms",
        resource_group: "slz-service-rg",
        authorize_vpc_reader_role: true,
        use_data: true,
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create the correct policy"
      );
    });
    it("should return a correct server protect policy with data source and hpcs", () => {
      let expectedData = `
resource "ibm_iam_authorization_policy" "kms_server_protect_policy" {
  source_service_name         = "server-protect"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  roles = [
    "Reader"
  ]
}
`;
      let actualData = formatKmsAuthPolicy({
        name: "kms",
        service: "kms",
        resource_group: "slz-service-rg",
        authorize_vpc_reader_role: true,
        use_data: true,
        use_hs_crypto: true,
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create the correct policy"
      );
    });
    it("should return a correct server protectblock storage policy", () => {
      let expectedData = `
resource "ibm_iam_authorization_policy" "kms_block_storage_policy" {
  source_service_name         = "is"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  source_resource_type        = "share"
  roles = [
    "Reader",
    "Authorization Delegator"
  ]
}
`;
      let actualData = formatKmsAuthPolicy(
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
          authorize_vpc_reader_role: true,
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create the correct policy"
      );
    });
  });
  describe("formatKeyRing", () => {
    it("should format a key ring", () => {
      let actualData = formatKeyRing(
        "ring",
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
        }
      );
      let expectedData = `
resource "ibm_kms_key_rings" "kms_ring_ring" {
  key_ring_id = "\${var.prefix}-kms-ring"
  instance_id = ibm_resource_instance.kms.guid
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a correctly formatted ring"
      );
    });
  });
  describe("formatKmsKey", () => {
    it("should create the correct encryption key", () => {
      let actualData = formatKmsKey(
        {
          name: "key",
          root_key: true,
          key_ring: "test-ring",
          force_delete: true,
        },
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
        },
        {
          _options: {
            prefix: "iac",
            endpoints: "private",
          },
        }
      );
      let expectedData = `
resource "ibm_kms_key" "kms_key_key" {
  instance_id   = ibm_resource_instance.kms.guid
  key_name      = "\${var.prefix}-kms-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms_test_ring_ring.key_ring_id
  force_delete  = true
  endpoint_type = "private"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct key"
      );
    });
    it("should create the correct encryption key with authorization policies", () => {
      let actualData = formatKmsKey(
        {
          name: "key",
          root_key: true,
          key_ring: "test-ring",
          force_delete: true,
        },
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
          authorize_vpc_reader_role: true,
        },
        {
          _options: {
            prefix: "iac",
            endpoints: "private",
          },
        }
      );
      let expectedData = `
resource "ibm_kms_key" "kms_key_key" {
  instance_id   = ibm_resource_instance.kms.guid
  key_name      = "\${var.prefix}-kms-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms_test_ring_ring.key_ring_id
  force_delete  = true
  endpoint_type = "private"
  depends_on = [
    ibm_iam_authorization_policy.kms_server_protect_policy,
    ibm_iam_authorization_policy.kms_block_storage_policy
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct key"
      );
    });
    it("should create correct encryption key with correct endpoint", () => {
      let actualData = formatKmsKey(
        {
          name: "key",
          root_key: true,
          key_ring: "test-ring",
          force_delete: true,
          endpoint: "public",
        },
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
          authorize_vpc_reader_role: true,
        },
        {
          _options: {
            prefix: "iac",
            endpoints: "private",
          },
        }
      );
      let expectedData = `
resource "ibm_kms_key" "kms_key_key" {
  instance_id   = ibm_resource_instance.kms.guid
  key_name      = "\${var.prefix}-kms-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms_test_ring_ring.key_ring_id
  force_delete  = true
  endpoint_type = "public"
  depends_on = [
    ibm_iam_authorization_policy.kms_server_protect_policy,
    ibm_iam_authorization_policy.kms_block_storage_policy
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct key"
      );
    });
  });
  describe("formatKmsKeyPolicy", () => {
    it("should create a key policy", () => {
      let actualData = formatKmsKeyPolicy(
        {
          name: "key",
          root_key: true,
          key_ring: "test-ring",
          force_delete: true,
          rotation: 12,
          dual_auth_delete: true,
        },
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
        },
        {
          _options: {
            endpoints: "private",
          },
        }
      );
      let expectedData = `
resource "ibm_kms_key_policies" "kms_key_key_policy" {
  instance_id   = ibm_resource_instance.kms.guid
  endpoint_type = "private"
  key_id        = ibm_kms_key.kms_key_key.key_id
  rotation {
    interval_month = 12
  }
  dual_auth_delete {
    enabled = true
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
  describe("kmsInstanceTf", () => {
    it("should create all of the above items for a sigle key management instance", () => {
      let actualData = kmsInstanceTf(
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
              rotation: 12,
              dual_auth_delete: true,
            },
          ],
        },
        {
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
            endpoints: "private",
          },
        }
      );
      let expectedData = `##############################################################################
# Key Management Instance Kms
##############################################################################

resource "ibm_resource_instance" "kms" {
  name              = "\${var.prefix}-kms"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "kms"
  plan              = "tiered-pricing"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_iam_authorization_policy" "kms_server_protect_policy" {
  source_service_name         = "server-protect"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  roles = [
    "Reader"
  ]
}

resource "ibm_iam_authorization_policy" "kms_block_storage_policy" {
  source_service_name         = "is"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  source_resource_type        = "share"
  roles = [
    "Reader",
    "Authorization Delegator"
  ]
}

resource "ibm_kms_key_rings" "kms_test_ring" {
  key_ring_id = "\${var.prefix}-kms-test"
  instance_id = ibm_resource_instance.kms.guid
}

resource "ibm_kms_key" "kms_key_key" {
  instance_id   = ibm_resource_instance.kms.guid
  key_name      = "\${var.prefix}-kms-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms_test_ring.key_ring_id
  force_delete  = true
  endpoint_type = "private"
  depends_on = [
    ibm_iam_authorization_policy.kms_server_protect_policy,
    ibm_iam_authorization_policy.kms_block_storage_policy
  ]
}

resource "ibm_kms_key_policies" "kms_key_key_policy" {
  instance_id   = ibm_resource_instance.kms.guid
  endpoint_type = "private"
  key_id        = ibm_kms_key.kms_key_key.key_id
  rotation {
    interval_month = 12
  }
  dual_auth_delete {
    enabled = true
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return terraform code"
      );
    });
    it("should create all of the above items for a sigle key management instance with no iam roles", () => {
      let actualData = kmsInstanceTf(
        {
          name: "kms",
          service: "kms",
          resource_group: "slz-service-rg",
          authorize_vpc_reader_role: false,
          use_data: false,
          use_hs_crypto: false,
          keys: [
            {
              name: "key",
              root_key: true,
              key_ring: "test",
              force_delete: true,
              rotation: 12,
              dual_auth_delete: true,
            },
          ],
        },
        {
          resource_groups: [
            {
              use_data: false,
              name: "slz-service-rg",
            },
          ],
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
            endpoints: "private",
          },
        }
      );
      let expectedData = `##############################################################################
# Key Management Instance Kms
##############################################################################

resource "ibm_resource_instance" "kms" {
  name              = "\${var.prefix}-kms"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "kms"
  plan              = "tiered-pricing"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_kms_key_rings" "kms_test_ring" {
  key_ring_id = "\${var.prefix}-kms-test"
  instance_id = ibm_resource_instance.kms.guid
}

resource "ibm_kms_key" "kms_key_key" {
  instance_id   = ibm_resource_instance.kms.guid
  key_name      = "\${var.prefix}-kms-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms_test_ring.key_ring_id
  force_delete  = true
  endpoint_type = "private"
}

resource "ibm_kms_key_policies" "kms_key_key_policy" {
  instance_id   = ibm_resource_instance.kms.guid
  endpoint_type = "private"
  key_id        = ibm_kms_key.kms_key_key.key_id
  rotation {
    interval_month = 12
  }
  dual_auth_delete {
    enabled = true
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return terraform code"
      );
    });
  });
  describe("kmsTf", () => {
    it("should create code for one instance from configuration file", () => {
      let actualData = kmsTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
          endpoints: "private",
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
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Key Management Instance Kms
##############################################################################

resource "ibm_resource_instance" "kms" {
  name              = "\${var.prefix}-kms"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "kms"
  plan              = "tiered-pricing"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_iam_authorization_policy" "kms_server_protect_policy" {
  source_service_name         = "server-protect"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  roles = [
    "Reader"
  ]
}

resource "ibm_iam_authorization_policy" "kms_block_storage_policy" {
  source_service_name         = "is"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  source_resource_type        = "share"
  roles = [
    "Reader",
    "Authorization Delegator"
  ]
}

resource "ibm_kms_key_rings" "kms_test_ring" {
  key_ring_id = "\${var.prefix}-kms-test"
  instance_id = ibm_resource_instance.kms.guid
}

resource "ibm_kms_key" "kms_key_key" {
  instance_id   = ibm_resource_instance.kms.guid
  key_name      = "\${var.prefix}-kms-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms_test_ring.key_ring_id
  force_delete  = true
  endpoint_type = "private"
  depends_on = [
    ibm_iam_authorization_policy.kms_server_protect_policy,
    ibm_iam_authorization_policy.kms_block_storage_policy
  ]
}

resource "ibm_kms_key_policies" "kms_key_key_policy" {
  instance_id   = ibm_resource_instance.kms.guid
  endpoint_type = "private"
  key_id        = ibm_kms_key.kms_key_key.key_id
  rotation {
    interval_month = 12
  }
  dual_auth_delete {
    enabled = true
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return terraform code"
      );
    });
    it("should create code for more than one instance from configuration file", () => {
      let actualData = kmsTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
          endpoints: "private",
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
                rotation: 12,
                dual_auth_delete: true,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Key Management Instance Kms
##############################################################################

resource "ibm_resource_instance" "kms" {
  name              = "\${var.prefix}-kms"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "kms"
  plan              = "tiered-pricing"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_iam_authorization_policy" "kms_server_protect_policy" {
  source_service_name         = "server-protect"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  roles = [
    "Reader"
  ]
}

resource "ibm_iam_authorization_policy" "kms_block_storage_policy" {
  source_service_name         = "is"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  source_resource_type        = "share"
  roles = [
    "Reader",
    "Authorization Delegator"
  ]
}

resource "ibm_kms_key_rings" "kms_test_ring" {
  key_ring_id = "\${var.prefix}-kms-test"
  instance_id = ibm_resource_instance.kms.guid
}

resource "ibm_kms_key" "kms_key_key" {
  instance_id   = ibm_resource_instance.kms.guid
  key_name      = "\${var.prefix}-kms-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms_test_ring.key_ring_id
  force_delete  = true
  endpoint_type = "private"
  depends_on = [
    ibm_iam_authorization_policy.kms_server_protect_policy,
    ibm_iam_authorization_policy.kms_block_storage_policy
  ]
}

resource "ibm_kms_key_policies" "kms_key_key_policy" {
  instance_id   = ibm_resource_instance.kms.guid
  endpoint_type = "private"
  key_id        = ibm_kms_key.kms_key_key.key_id
  rotation {
    interval_month = 12
  }
  dual_auth_delete {
    enabled = true
  }
}

##############################################################################

##############################################################################
# Key Management Instance Kms 2
##############################################################################

resource "ibm_resource_instance" "kms2" {
  name              = "\${var.prefix}-kms2"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "kms"
  plan              = "tiered-pricing"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_iam_authorization_policy" "kms2_server_protect_policy" {
  source_service_name         = "server-protect"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms2.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  roles = [
    "Reader"
  ]
}

resource "ibm_iam_authorization_policy" "kms2_block_storage_policy" {
  source_service_name         = "is"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms2.guid
  description                 = "Allow block storage volumes to be encrypted by Key Management instance."
  source_resource_type        = "share"
  roles = [
    "Reader",
    "Authorization Delegator"
  ]
}

resource "ibm_kms_key_rings" "kms2_test_ring" {
  key_ring_id = "\${var.prefix}-kms2-test"
  instance_id = ibm_resource_instance.kms2.guid
}

resource "ibm_kms_key" "kms2_key_key" {
  instance_id   = ibm_resource_instance.kms2.guid
  key_name      = "\${var.prefix}-kms2-key"
  standard_key  = false
  key_ring_id   = ibm_kms_key_rings.kms2_test_ring.key_ring_id
  force_delete  = true
  endpoint_type = "private"
  depends_on = [
    ibm_iam_authorization_policy.kms2_server_protect_policy,
    ibm_iam_authorization_policy.kms2_block_storage_policy
  ]
}

resource "ibm_kms_key_policies" "kms2_key_key_policy" {
  instance_id   = ibm_resource_instance.kms2.guid
  endpoint_type = "private"
  key_id        = ibm_kms_key.kms2_key_key.key_id
  rotation {
    interval_month = 12
  }
  dual_auth_delete {
    enabled = true
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return terraform code"
      );
    });
  });
});
