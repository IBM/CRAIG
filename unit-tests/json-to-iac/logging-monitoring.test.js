const { assert } = require("chai");
const {
  formatLogdnaInstance,
  formatLogdnaKey,
  formatLogdnaArchive,
  formatLogdnaProvider,
  formatSysdigKey,
  formatSysdigInstance,
  loggingMonitoringTf,
  formatAtrackerInstance,
  formatAtrackerKey,
  formatAtrackerArchive,
} = require("../../client/src/lib");

describe("logging and monitoring", () => {
  describe("logging", () => {
    describe("formatLogDnaInstance", () => {
      it("should format a logdna instance", () => {
        let expectedData = `
resource "ibm_resource_instance" "logdna" {
  name              = "\${var.prefix}-logdna"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdna"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "iac",
    "test"
  ]
}
`;
        let actualData = formatLogdnaInstance({
          _options: {
            tags: ["iac", "test"],
          },
          resource_groups: [
            {
              name: "service-rg",
              use_data: false,
              prefix: true,
            },
          ],
          logdna: {
            plan: "lite",
            endpoints: "private",
            resource_group: "service-rg",
          },
        });
        assert.deepEqual(
          actualData,
          expectedData,
          "it should return correct data"
        );
      });
      it("should format a logdna instance with platform logs", () => {
        let expectedData = `
resource "ibm_resource_instance" "logdna" {
  name              = "\${var.prefix}-logdna"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdna"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "iac",
    "test"
  ]
  parameters = {
    default_receiver = true
  }
}
`;
        let actualData = formatLogdnaInstance({
          _options: {
            tags: ["iac", "test"],
          },
          resource_groups: [
            {
              name: "service-rg",
              use_data: false,
              prefix: true,
            },
          ],
          logdna: {
            plan: "lite",
            endpoints: "private",
            platform_logs: true,
            resource_group: "service-rg",
          },
        });
        assert.deepEqual(
          actualData,
          expectedData,
          "it should return correct data"
        );
      });
    });
    describe("formatLogdnaKey", () => {
      it("should return a resource key", () => {
        let actualData = formatLogdnaKey({
          _options: {
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              name: "service-rg",
              use_data: false,
              prefix: true,
            },
          ],
          logdna: {
            plan: "lite",
            endpoints: "private",
            platform_logs: true,
            resource_group: "service-rg",
            role: "Manager",
          },
        });
        let expectedData = `
resource "ibm_resource_key" "logdna_key" {
  name                 = "\${var.prefix}-logdna-key"
  resource_instance_id = ibm_resource_instance.logdna.id
  role                 = "Manager"
  tags = [
    "hello",
    "world"
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
    describe("formatLogdnaArchive", () => {
      it("should return a resource key", () => {
        let actualData = formatLogdnaArchive({
          _options: {
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              name: "service-rg",
              use_data: false,
              prefix: true,
            },
          ],
          logdna: {
            plan: "lite",
            endpoints: "private",
            platform_logs: true,
            resource_group: "service-rg",
            role: "Manager",
            bucket: "atracker",
            cos: "cos",
            bucket_endpoint: "private",
          },
        });
        let expectedData = `
resource "logdna_archive" "logdna_archive" {
  provider    = logdna.logdna
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
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
    describe("formatLogdnaProvider", () => {
      it("should return logdna provider", () => {
        let expectedData = `
provider "logdna" {
  alias      = "logdna"
  servicekey = ibm_resource_key.logdna_key.credentials["service_key"]
  url        = "https://api.\${var.region}.logging.cloud.ibm.com"
}
`;
        let actualData = formatLogdnaProvider("logdna");
        assert.deepEqual(
          actualData,
          expectedData,
          "it should return correct data"
        );
      });
    });
  });
  describe("monitoring", () => {
    describe("formatSysdigKey", () => {
      it("should format sysdig key", () => {
        let actualData = formatSysdigKey({
          _options: {
            tags: ["hello", "world"],
          },
        });
        let expectedData = `
resource "ibm_resource_key" "sysdig_key" {
  name                 = "\${var.prefix}-sysdig-key"
  resource_instance_id = ibm_resource_instance.sysdig.id
  role                 = "Manager"
  tags = [
    "hello",
    "world"
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
    describe("formatSysdigInstance", () => {
      it("should create sysdig instance", () => {
        let actualData = formatSysdigInstance({
          _options: {
            tags: ["iac", "test"],
          },
          resource_groups: [
            {
              name: "service-rg",
              use_data: false,
              prefix: true,
            },
          ],
          sysdig: {
            plan: "lite",
            endpoints: "private",
            resource_group: "service-rg",
          },
        });
        let expectedData = `
resource "ibm_resource_instance" "sysdig" {
  name              = "\${var.prefix}-sysdig"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "sysdig"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "iac",
    "test"
  ]
}
`;
        assert.deepEqual(
          actualData,
          expectedData,
          "it should return correct data"
        );
      });
      it("should create sysdig instance with platform logs", () => {
        let actualData = formatSysdigInstance({
          _options: {
            tags: ["iac", "test"],
          },
          resource_groups: [
            {
              name: "service-rg",
              use_data: false,
              prefix: true,
            },
          ],
          sysdig: {
            plan: "lite",
            endpoints: "private",
            resource_group: "service-rg",
            platform_logs: true,
          },
        });
        let expectedData = `
resource "ibm_resource_instance" "sysdig" {
  name              = "\${var.prefix}-sysdig"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "sysdig"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "iac",
    "test"
  ]
  parameters = {
    default_receiver = true
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
  });
  describe("atracker", () => {
    describe("formatAtrackerKey", () => {
      it("should format atracker key", () => {
        let actualData = formatAtrackerKey({
          _options: {
            tags: ["hello", "world"],
          },
        });
        let expectedData = `
resource "ibm_resource_key" "atracker_key" {
  name                 = "\${var.prefix}-\${var.region}-atracker-key"
  resource_instance_id = ibm_resource_instance.atracker.id
  role                 = "Manager"
  tags = [
    "hello",
    "world"
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
    describe("formatAtrackerArchive", () => {
      it("should create atracker archive", () => {
        let actualData = formatAtrackerArchive({
          atracker: {
            enabled: true,
            name: "atracker",
            type: "cos",
            target_name: "cos",
            bucket: "atracker",
            cos_key: "atracker-cos-key",
            plan: "lite",
            endpoints: "private",
            resource_group: "service-rg",
          },
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
        });
        let expectedData = `
resource "logdna_archive" "atracker_archive" {
  provider    = logdna.atracker
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
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
    describe("formatAtrackerInstance", () => {
      it("should create atracker instance", () => {
        let actualData = formatAtrackerInstance({
          _options: {
            tags: ["iac", "test"],
          },
          resource_groups: [
            {
              name: "service-rg",
              use_data: false,
              prefix: true,
            },
          ],
          atracker: {
            plan: "lite",
            endpoints: "private",
            resource_group: "service-rg",
          },
        });
        let expectedData = `
resource "ibm_resource_instance" "atracker" {
  name              = "\${var.prefix}-\${var.region}-atracker"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdnaat"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "iac",
    "test"
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
  });
  describe("loggingMonitoringTf", () => {
    it("should return correct tf when logdna and sysdig enabled", () => {
      let actualData = loggingMonitoringTf({
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        logdna: {
          enabled: true,
          plan: "lite",
          endpoints: "private",
          platform_logs: true,
          resource_group: "service-rg",
          role: "Manager",
          bucket: "atracker",
          cos: "cos",
          bucket_endpoint: "private",
          archive: true,
        },
        sysdig: {
          enabled: true,
          plan: "lite",
          endpoints: "private",
          resource_group: "service-rg",
          platform_logs: true,
        },
        atracker: {
          enabled: false,
          name: "atracker",
          type: "cos",
          target_name: "cos",
          bucket: "atracker",
          cos_key: "atracker-cos-key",
          plan: "lite",
          endpoints: "private",
          resource_group: "service-rg",
          archive: true,
          instance: true,
        },
      });
      let expectedData = `##############################################################################
# LogDNA Instance
##############################################################################

resource "ibm_resource_instance" "logdna" {
  name              = "\${var.prefix}-logdna"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdna"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "logdna_key" {
  name                 = "\${var.prefix}-logdna-key"
  resource_instance_id = ibm_resource_instance.logdna.id
  role                 = "Manager"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# LogDNA Resources
##############################################################################

provider "logdna" {
  alias      = "logdna"
  servicekey = ibm_resource_key.logdna_key.credentials["service_key"]
  url        = "https://api.\${var.region}.logging.cloud.ibm.com"
}

resource "logdna_archive" "logdna_archive" {
  provider    = logdna.logdna
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
  }
}

##############################################################################

##############################################################################
# Sysdig Instance
##############################################################################

resource "ibm_resource_instance" "sysdig" {
  name              = "\${var.prefix}-sysdig"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "sysdig"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "sysdig_key" {
  name                 = "\${var.prefix}-sysdig-key"
  resource_instance_id = ibm_resource_instance.sysdig.id
  role                 = "Manager"
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
        "it should return correct terraform"
      );
    });
    it("should return correct tf when logdna and sysdig not enabled", () => {
      let actualData = loggingMonitoringTf({
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        logdna: {
          enabled: true,
          plan: "lite",
          endpoints: "private",
          platform_logs: true,
          resource_group: "service-rg",
          role: "Manager",
          bucket: "atracker",
          cos: "cos",
          bucket_endpoint: "private",
          archive: true,
        },
        sysdig: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          resource_group: "service-rg",
          platform_logs: true,
        },
      });
      let expectedData = `##############################################################################
# LogDNA Instance
##############################################################################

resource "ibm_resource_instance" "logdna" {
  name              = "\${var.prefix}-logdna"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdna"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "logdna_key" {
  name                 = "\${var.prefix}-logdna-key"
  resource_instance_id = ibm_resource_instance.logdna.id
  role                 = "Manager"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# LogDNA Resources
##############################################################################

provider "logdna" {
  alias      = "logdna"
  servicekey = ibm_resource_key.logdna_key.credentials["service_key"]
  url        = "https://api.\${var.region}.logging.cloud.ibm.com"
}

resource "logdna_archive" "logdna_archive" {
  provider    = logdna.logdna
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
  }
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct terraform"
      );
    });
    it("should return correct tf when logdna and sysdig not enabled and no logdna archive", () => {
      let actualData = loggingMonitoringTf({
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        logdna: {
          enabled: true,
          plan: "lite",
          endpoints: "private",
          platform_logs: true,
          resource_group: "service-rg",
          role: "Manager",
          bucket: "atracker",
          cos: "cos",
          bucket_endpoint: "private",
          archive: false,
        },
        sysdig: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          resource_group: "service-rg",
          platform_logs: true,
        },
      });
      let expectedData = `##############################################################################
# LogDNA Instance
##############################################################################

resource "ibm_resource_instance" "logdna" {
  name              = "\${var.prefix}-logdna"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdna"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "logdna_key" {
  name                 = "\${var.prefix}-logdna-key"
  resource_instance_id = ibm_resource_instance.logdna.id
  role                 = "Manager"
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
        "it should return correct terraform"
      );
    });
    it("should return correct tf when not logdna and sysdig enabled", () => {
      let actualData = loggingMonitoringTf({
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: true,
          resource_group: "service-rg",
          role: "Manager",
          bucket: "atracker",
          cos: "cos",
          bucket_endpoint: "private",
          archive: true,
        },
        sysdig: {
          enabled: true,
          plan: "lite",
          endpoints: "private",
          resource_group: "service-rg",
          platform_logs: true,
        },
      });
      let expectedData = `##############################################################################
# Sysdig Instance
##############################################################################

resource "ibm_resource_instance" "sysdig" {
  name              = "\${var.prefix}-sysdig"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "sysdig"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "sysdig_key" {
  name                 = "\${var.prefix}-sysdig-key"
  resource_instance_id = ibm_resource_instance.sysdig.id
  role                 = "Manager"
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
        "it should return correct terraform"
      );
    });
    it("should return correct tf when logdna and sysdig enabled and atracker", () => {
      let actualData = loggingMonitoringTf({
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        logdna: {
          enabled: true,
          plan: "lite",
          endpoints: "private",
          platform_logs: true,
          resource_group: "service-rg",
          role: "Manager",
          bucket: "atracker",
          cos: "cos",
          bucket_endpoint: "private",
          archive: true,
        },
        sysdig: {
          enabled: true,
          plan: "lite",
          endpoints: "private",
          resource_group: "service-rg",
          platform_logs: true,
        },
        atracker: {
          enabled: true,
          name: "atracker",
          type: "cos",
          target_name: "cos",
          bucket: "atracker",
          cos_key: "atracker-cos-key",
          plan: "lite",
          endpoints: "private",
          resource_group: "service-rg",
          archive: true,
          instance: true,
        },
      });
      let expectedData = `##############################################################################
# Atracker Instance
##############################################################################

resource "ibm_resource_instance" "atracker" {
  name              = "\${var.prefix}-\${var.region}-atracker"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdnaat"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_resource_key" "atracker_key" {
  name                 = "\${var.prefix}-\${var.region}-atracker-key"
  resource_instance_id = ibm_resource_instance.atracker.id
  role                 = "Manager"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# LogDNA Instance
##############################################################################

resource "ibm_resource_instance" "logdna" {
  name              = "\${var.prefix}-logdna"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdna"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "logdna_key" {
  name                 = "\${var.prefix}-logdna-key"
  resource_instance_id = ibm_resource_instance.logdna.id
  role                 = "Manager"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# LogDNA Resources
##############################################################################

provider "logdna" {
  alias      = "logdna"
  servicekey = ibm_resource_key.logdna_key.credentials["service_key"]
  url        = "https://api.\${var.region}.logging.cloud.ibm.com"
}

resource "logdna_archive" "logdna_archive" {
  provider    = logdna.logdna
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
  }
}

provider "logdna" {
  alias      = "atracker"
  servicekey = ibm_resource_key.atracker_key.credentials["service_key"]
  url        = "https://api.\${var.region}.logging.cloud.ibm.com"
}

resource "logdna_archive" "atracker_archive" {
  provider    = logdna.atracker
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
  }
}

##############################################################################

##############################################################################
# Sysdig Instance
##############################################################################

resource "ibm_resource_instance" "sysdig" {
  name              = "\${var.prefix}-sysdig"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "sysdig"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "hello",
    "world"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "sysdig_key" {
  name                 = "\${var.prefix}-sysdig-key"
  resource_instance_id = ibm_resource_instance.sysdig.id
  role                 = "Manager"
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
        "it should return correct terraform"
      );
    });
  });
});
