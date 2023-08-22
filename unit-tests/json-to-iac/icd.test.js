const { assert } = require("chai");
const {
  formatIcdToKmsAuth,
  formatIcd,
  icdTf,
} = require("../../client/src/lib/json-to-iac");

describe("ICD", () => {
  describe("formatIcdToKmsAuth", () => {
    it("should return correct data", () => {
      let actualData = formatIcdToKmsAuth("kms", "databases-for-postgresql", {
        _options: {
          prefix: "iac",
          tags: ["hello", "world"],
          region: "us-south",
        },
        resource_groups: [
          {
            use_prefix: false,
            name: "slz-service-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-management-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-workload-rg",
            use_data: false,
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
      let expectedData = `
resource "ibm_iam_authorization_policy" "icd_to_kms_kms_policy" {
  source_service_name         = "databases-for-postgresql"
  description                 = "Allow ICD service instance to read from KMS instance"
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
        "it should return correct data"
      );
    });
  });
  describe("formatIcd", () => {
    it("should create the correct icd instance", () => {
      let actualData = formatIcd(
        {
          kms: "kms",
          encryption_key: "key",
          resource_group: "slz-service-rg",
          use_data: false,
          name: "icd-db",
          service: "databases-for-postgresql",
          group_id: "member",
          memory: 1024,
          disk: 1024,
          cpu: 0,
        },
        {
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
            region: "us-south",
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
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
        }
      );
      let expectedData = `
resource "ibm_resource_instance" "icd_db" {
  name              = "\${var.prefix}-icd-db"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-postgresql"
  plan              = "standard"
  location          = var.region
  key_protect_key   = ibm_kms_key.kms_key_key.crn
  group {
    group_id = "member"
    memory {
      allocation_mb = 1024
    }
    disk {
      allocation_mb = 1024
    }
    cpu {
      allocation_count = 0
    }
  }
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "120m"
    update = "120m"
    delete = "15m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create the correct icd instance from data", () => {
      let actualData = formatIcd(
        {
          kms: "kms",
          encryption_key: "key",
          resource_group: "slz-service-rg",
          use_data: true,
          name: "icd-db",
          service: "databases-for-postgresql",
          group_id: "member",
          memory: 1024,
          disk: 1024,
          cpu: 0,
        },
        {
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
            region: "us-south",
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
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
        }
      );
      let expectedData = `
data "ibm_resource_instance" "icd_db" {
  name              = "icd-db"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-postgresql"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("icdTf", () => {
    it("should return correct databases", () => {
      let actualData = icdTf({
        _options: {
          prefix: "iac",
          tags: ["hello", "world"],
          region: "us-south",
        },
        resource_groups: [
          {
            use_prefix: false,
            name: "slz-service-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-management-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-workload-rg",
            use_data: false,
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
        icd: [
          {
            kms: "kms",
            encryption_key: "key",
            resource_group: "slz-service-rg",
            use_data: false,
            name: "icd-psql",
            service: "databases-for-postgresql",
            group_id: "member",
            memory: 1024,
            disk: 1024,
            cpu: 0,
          },
          {
            kms: "kms",
            encryption_key: "key",
            resource_group: "slz-service-rg",
            use_data: true,
            name: "icd-psql-2",
            service: "databases-for-postgresql",
            group_id: "member",
            memory: 1024,
            disk: 1024,
            cpu: 0,
          },
          {
            kms: "kms",
            encryption_key: "key",
            resource_group: "slz-service-rg",
            use_data: false,
            name: "icd-psql-3",
            service: "databases-for-postgresql",
            group_id: "member",
            memory: 1024,
            disk: 1024,
            cpu: 0,
          },
          {
            kms: "kms",
            encryption_key: "key",
            resource_group: "slz-service-rg",
            use_data: false,
            name: "icd-mysql",
            service: "databases-for-mysql",
            group_id: "member",
            memory: 1024,
            disk: 1024,
            cpu: 0,
          },
          {
            kms: null,
            encryption_key: null,
            resource_group: "slz-service-rg",
            use_data: false,
            name: "icd-etcd",
            service: "databases-for-etcd",
            group_id: "member",
            memory: 1024,
            disk: 1024,
            cpu: 0,
          },
        ],
      });
      let expectedData = `##############################################################################
# Database Authorizations
##############################################################################

resource "ibm_iam_authorization_policy" "icd_to_kms_kms_policy" {
  source_service_name         = "databases-for-postgresql"
  description                 = "Allow ICD service instance to read from KMS instance"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles = [
    "Reader"
  ]
}

resource "ibm_iam_authorization_policy" "icd_to_kms_kms_policy" {
  source_service_name         = "databases-for-mysql"
  description                 = "Allow ICD service instance to read from KMS instance"
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles = [
    "Reader"
  ]
}

##############################################################################

##############################################################################
# Database Services
##############################################################################

resource "ibm_resource_instance" "icd_psql" {
  name              = "\${var.prefix}-icd-psql"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-postgresql"
  plan              = "standard"
  location          = var.region
  key_protect_key   = ibm_kms_key.kms_key_key.crn
  group {
    group_id = "member"
    memory {
      allocation_mb = 1024
    }
    disk {
      allocation_mb = 1024
    }
    cpu {
      allocation_count = 0
    }
  }
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "120m"
    update = "120m"
    delete = "15m"
  }
}

data "ibm_resource_instance" "icd_psql_2" {
  name              = "icd-psql-2"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-postgresql"
}

resource "ibm_resource_instance" "icd_psql_3" {
  name              = "\${var.prefix}-icd-psql-3"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-postgresql"
  plan              = "standard"
  location          = var.region
  key_protect_key   = ibm_kms_key.kms_key_key.crn
  group {
    group_id = "member"
    memory {
      allocation_mb = 1024
    }
    disk {
      allocation_mb = 1024
    }
    cpu {
      allocation_count = 0
    }
  }
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "120m"
    update = "120m"
    delete = "15m"
  }
}

resource "ibm_resource_instance" "icd_mysql" {
  name              = "\${var.prefix}-icd-mysql"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-mysql"
  plan              = "standard"
  location          = var.region
  key_protect_key   = ibm_kms_key.kms_key_key.crn
  group {
    group_id = "member"
    memory {
      allocation_mb = 1024
    }
    disk {
      allocation_mb = 1024
    }
    cpu {
      allocation_count = 0
    }
  }
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "120m"
    update = "120m"
    delete = "15m"
  }
}

resource "ibm_resource_instance" "icd_etcd" {
  name              = "\${var.prefix}-icd-etcd"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-etcd"
  plan              = "standard"
  location          = var.region
  group {
    group_id = "member"
    memory {
      allocation_mb = 1024
    }
    disk {
      allocation_mb = 1024
    }
    cpu {
      allocation_count = 0
    }
  }
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "120m"
    update = "120m"
    delete = "15m"
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
