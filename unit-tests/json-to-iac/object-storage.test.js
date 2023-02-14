const { assert } = require("chai");
const {
  formatCosInstance,
  formatCosToKmsAuth,
  formatCosBucket,
  formatCosKey,
  cosInstanceTf,
  cosTf,
} = require("../../client/src/lib/json-to-iac/object-storage");

// add object-storage

describe("object storage", () => {
  describe("formatCosInstance", () => {
    it("should create an object storage resource instance", () => {
      let actualData = formatCosInstance(
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: false,
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
        }
      );
      let expectedData = `
resource "ibm_resource_instance" "cos_object_storage" {
  name              = "iac-cos-object-storage"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
  plan              = "standard"
  tags              = ["hello","world"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data for cos"
      );
    });
    it("should create an object storage resource instance with random suffix", () => {
      let actualData = formatCosInstance(
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: true,
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
        }
      );
      let expectedData = `
resource "random_string" "cos_random_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "ibm_resource_instance" "cos_object_storage" {
  name              = "iac-cos-object-storage-\${random_string.cos_random_suffix.result}"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
  plan              = "standard"
  tags              = ["hello","world"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data for cos"
      );
    });
    it("should create an object storage data instance", () => {
      let actualData = formatCosInstance(
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: false,
          use_data: true,
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
        }
      );
      let expectedData = `
data "ibm_resource_instance" "cos_object_storage" {
  name              = "cos"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data for cos"
      );
    });
    it("should create an object storage data instance with random suffix", () => {
      let actualData = formatCosInstance(
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: true,
          use_data: true,
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
        }
      );
      let expectedData = `
resource "random_string" "cos_random_suffix" {
  length  = 8
  special = false
  upper   = false
}

data "ibm_resource_instance" "cos_object_storage" {
  name              = "cos"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data for cos"
      );
    });
  });
  describe("formatCosToKmsAuth", () => {
    it("should create an authorization for cos to read from key management", () => {
      let actualData = formatCosToKmsAuth(
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: false,
          kms: "kms",
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
resource "ibm_iam_authorization_policy" "cos_cos_to_kms_kms_policy" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = split(":", ibm_resource_instance.cos_object_storage.id)[7]
  roles                       = ["Reader"]
  description                 = "Allow COS instance to read from KMS instance"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
}
`;
      assert.deepEqual(actualData, expectedData, "it should return cos tf");
    });
    it("should create an authorization for data cos to read from data hpcs", () => {
      let actualData = formatCosToKmsAuth(
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: false,
          use_data: true,
          kms: "kms",
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
              use_data: true,
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
          ],
        }
      );
      let expectedData = `
resource "ibm_iam_authorization_policy" "cos_cos_to_kms_kms_policy" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = split(":", data.ibm_resource_instance.cos_object_storage.id)[7]
  roles                       = ["Reader"]
  description                 = "Allow COS instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
}
`;
      assert.deepEqual(actualData, expectedData, "it should return cos tf");
    });
  });
  describe("formatCosBucket", () => {
    it("should create cos bucket terraform code", () => {
      let actualData = formatCosBucket(
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "key",
          name: "bucket",
          storage_class: "standard",
        },
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: false,
          use_data: false,
          kms: "kms",
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
              use_data: true,
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
          ],
        }
      );
      let expectedData = `
resource "ibm_cos_bucket" "cos_object_storage_bucket_bucket" {
  bucket_name          = "iac-cos-bucket"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  storage_class        = "standard"
  endpoint_type        = "public"
  force_delete         = true
  region_location      = "us-south"
  key_protect          = ibm_kms_key.kms_key_key.crn
  depends_on           = [ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return cos bucket tf"
      );
    });
    it("should create cos bucket terraform code from data source", () => {
      let actualData = formatCosBucket(
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "key",
          name: "bucket",
          storage_class: "standard",
        },
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: false,
          use_data: true,
          kms: "kms",
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
              use_data: true,
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
          ],
        }
      );
      let expectedData = `
resource "ibm_cos_bucket" "cos_object_storage_bucket_bucket" {
  bucket_name          = "iac-cos-bucket"
  resource_instance_id = data.ibm_resource_instance.cos_object_storage.id
  storage_class        = "standard"
  endpoint_type        = "public"
  force_delete         = true
  region_location      = "us-south"
  key_protect          = ibm_kms_key.kms_key_key.crn
  depends_on           = [ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return cos bucket tf"
      );
    });
    it("should create cos bucket terraform code from data source with random suffix", () => {
      let actualData = formatCosBucket(
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "key",
          name: "bucket",
          storage_class: "standard",
        },
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: true,
          use_data: true,
          kms: "kms",
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
              use_data: true,
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
          ],
        }
      );
      let expectedData = `
resource "ibm_cos_bucket" "cos_object_storage_bucket_bucket" {
  bucket_name          = "iac-cos-bucket-\${random_string.cos_random_suffix.result}"
  resource_instance_id = data.ibm_resource_instance.cos_object_storage.id
  storage_class        = "standard"
  endpoint_type        = "public"
  force_delete         = true
  region_location      = "us-south"
  key_protect          = ibm_kms_key.kms_key_key.crn
  depends_on           = [ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return cos bucket tf"
      );
    });
  });
  describe("formatCosKey", () => {
    it("should create cos bucket terraform code with no hmac", () => {
      let actualData = formatCosKey(
        {
          role: "Writer",
          name: "cos-key",
          enable_hmac: false,
        },
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: false,
          use_data: false,
          kms: "kms",
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
              use_data: true,
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
          ],
        }
      );
      let expectedData = `
resource "ibm_resource_key" "cos_object_storage_key_cos_key" {
  name                 = "iac-cos-key-cos-key"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  role                 = "Writer"
  tags                 = ["hello","world"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return cos bucket tf"
      );
    });
    it("should create cos bucket terraform code with hmac and random suffix", () => {
      let actualData = formatCosKey(
        {
          role: "Writer",
          name: "cos-key",
          enable_hmac: true,
        },
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: true,
          use_data: false,
          kms: "kms",
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
              use_data: true,
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
          ],
        }
      );
      let expectedData = `
resource "ibm_resource_key" "cos_object_storage_key_cos_key" {
  name                 = "iac-cos-key-cos-key-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  role                 = "Writer"
  tags                 = ["hello","world"]

  parameters = {
    HMAC = true
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return cos bucket tf"
      );
    });
  });
  describe("cosInstanceTf", () => {
    it("should return terraform for a single cos instance", () => {
      let actualData = cosInstanceTf(
        {
          name: "cos",
          plan: "standard",
          resource_group: "slz-service-rg",
          use_random_suffix: true,
          use_data: false,
          kms: "kms",
          keys: [
            {
              role: "Writer",
              name: "cos-key",
              enable_hmac: true,
            },
          ],
          buckets: [
            {
              endpoint: "public",
              force_delete: true,
              kms_key: "key",
              name: "bucket",
              storage_class: "standard",
            },
          ],
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
              use_data: true,
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
          ],
        }
      );
      let expectedData = `##############################################################################
# Object Storage Instance Cos
##############################################################################

resource "random_string" "cos_random_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "ibm_resource_instance" "cos_object_storage" {
  name              = "iac-cos-object-storage-\${random_string.cos_random_suffix.result}"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
  plan              = "standard"
  tags              = ["hello","world"]
}

resource "ibm_iam_authorization_policy" "cos_cos_to_kms_kms_policy" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = split(":", ibm_resource_instance.cos_object_storage.id)[7]
  roles                       = ["Reader"]
  description                 = "Allow COS instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
}

resource "ibm_cos_bucket" "cos_object_storage_bucket_bucket" {
  bucket_name          = "iac-cos-bucket-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  storage_class        = "standard"
  endpoint_type        = "public"
  force_delete         = true
  region_location      = "us-south"
  key_protect          = ibm_kms_key.kms_key_key.crn
  depends_on           = [ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy]
}

resource "ibm_resource_key" "cos_object_storage_key_cos_key" {
  name                 = "iac-cos-key-cos-key-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  role                 = "Writer"
  tags                 = ["hello","world"]

  parameters = {
    HMAC = true
  }
}

##############################################################################`;
      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
  });
  describe("cosTf", () => {
    it("should return terraform for cos instance from config", () => {
      let actualData = cosTf({
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
        ],
        object_storage: [
          {
            name: "cos",
            plan: "standard",
            resource_group: "slz-service-rg",
            use_random_suffix: true,
            use_data: false,
            kms: "kms",
            keys: [
              {
                role: "Writer",
                name: "cos-key",
                enable_hmac: true,
              },
            ],
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "bucket",
                storage_class: "standard",
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Object Storage Instance Cos
##############################################################################

resource "random_string" "cos_random_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "ibm_resource_instance" "cos_object_storage" {
  name              = "iac-cos-object-storage-\${random_string.cos_random_suffix.result}"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
  plan              = "standard"
  tags              = ["hello","world"]
}

resource "ibm_iam_authorization_policy" "cos_cos_to_kms_kms_policy" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = split(":", ibm_resource_instance.cos_object_storage.id)[7]
  roles                       = ["Reader"]
  description                 = "Allow COS instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
}

resource "ibm_cos_bucket" "cos_object_storage_bucket_bucket" {
  bucket_name          = "iac-cos-bucket-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  storage_class        = "standard"
  endpoint_type        = "public"
  force_delete         = true
  region_location      = "us-south"
  key_protect          = ibm_kms_key.kms_key_key.crn
  depends_on           = [ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy]
}

resource "ibm_resource_key" "cos_object_storage_key_cos_key" {
  name                 = "iac-cos-key-cos-key-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  role                 = "Writer"
  tags                 = ["hello","world"]

  parameters = {
    HMAC = true
  }
}

##############################################################################`;
      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
    it("should return terraform for cos instances from config", () => {
      let actualData = cosTf({
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
        ],
        object_storage: [
          {
            name: "cos",
            plan: "standard",
            resource_group: "slz-service-rg",
            use_random_suffix: true,
            use_data: false,
            kms: "kms",
            keys: [
              {
                role: "Writer",
                name: "cos-key",
                enable_hmac: true,
              },
            ],
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "bucket",
                storage_class: "standard",
              },
            ],
          },
          {
            name: "cos2",
            name: "cos",
            plan: "standard",
            resource_group: "slz-service-rg",
            use_random_suffix: false,
            kms: "kms",
            keys: [
              {
                role: "Writer",
                name: "cos-key",
                enable_hmac: true,
              },
            ],
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "bucket2",
                storage_class: "standard",
              },
            ],
            use_data: true,
          },
        ],
      });
      let expectedData = `##############################################################################
# Object Storage Instance Cos
##############################################################################

resource "random_string" "cos_random_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "ibm_resource_instance" "cos_object_storage" {
  name              = "iac-cos-object-storage-\${random_string.cos_random_suffix.result}"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
  plan              = "standard"
  tags              = ["hello","world"]
}

resource "ibm_iam_authorization_policy" "cos_cos_to_kms_kms_policy" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = split(":", ibm_resource_instance.cos_object_storage.id)[7]
  roles                       = ["Reader"]
  description                 = "Allow COS instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
}

resource "ibm_cos_bucket" "cos_object_storage_bucket_bucket" {
  bucket_name          = "iac-cos-bucket-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  storage_class        = "standard"
  endpoint_type        = "public"
  force_delete         = true
  region_location      = "us-south"
  key_protect          = ibm_kms_key.kms_key_key.crn
  depends_on           = [ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy]
}

resource "ibm_resource_key" "cos_object_storage_key_cos_key" {
  name                 = "iac-cos-key-cos-key-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos_object_storage.id
  role                 = "Writer"
  tags                 = ["hello","world"]

  parameters = {
    HMAC = true
  }
}

##############################################################################

##############################################################################
# Object Storage Instance Cos
##############################################################################

data "ibm_resource_instance" "cos_object_storage" {
  name              = "cos"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "cloud-object-storage"
  location          = "global"
}

resource "ibm_iam_authorization_policy" "cos_cos_to_kms_kms_policy" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = split(":", data.ibm_resource_instance.cos_object_storage.id)[7]
  roles                       = ["Reader"]
  description                 = "Allow COS instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = data.ibm_resource_instance.kms.guid
}

resource "ibm_cos_bucket" "cos_object_storage_bucket2_bucket" {
  bucket_name          = "iac-cos-bucket2"
  resource_instance_id = data.ibm_resource_instance.cos_object_storage.id
  storage_class        = "standard"
  endpoint_type        = "public"
  force_delete         = true
  region_location      = "us-south"
  key_protect          = ibm_kms_key.kms_key_key.crn
  depends_on           = [ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy]
}

resource "ibm_resource_key" "cos_object_storage_key_cos_key" {
  name                 = "iac-cos-key-cos-key"
  resource_instance_id = data.ibm_resource_instance.cos_object_storage.id
  role                 = "Writer"
  tags                 = ["hello","world"]

  parameters = {
    HMAC = true
  }
}

##############################################################################
`;
      assert.deepEqual(actualData, expectedData, "it should create correct tf");
    });
  });
});
