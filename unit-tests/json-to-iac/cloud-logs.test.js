const { assert } = require("chai");
const {
  formatCloudLogs,
  formatCosToCloudLogsAuth,
  cloudLogsTf,
} = require("../../client/src/lib");

describe("cloud logs", () => {
  describe("formatCloudLogs", () => {
    it("should format logs with log bucket and metrics bucket", () => {
      let actualData = formatCloudLogs({
        _options: {
          tags: ["hello", "world"],
          endpoints: "private",
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        cloud_logs: {
          enabled: true,
          cos: "cos",
          logs_bucket: "atracker",
          metrics_bucket: "metrics",
          bucket_endpoint: "private",
          resource_group: "service-rg",
        },
      });
      let expectedData = `
resource "ibm_resource_instance" "cloud_logs" {
  name              = "\${var.prefix}-cloud-logs"
  service           = "logs"
  plan              = "standard"
  location          = var.region
  resource_group_id = ibm_resource_group.service_rg.id
  parameters = {
    logs_bucket_crn         = ibm_cos_bucket.cos_object_storage_atracker_bucket.crn
    logs_bucket_endpoint    = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    metrics_bucket_crn      = ibm_cos_bucket.cos_object_storage_metrics_bucket.crn
    metrics_bucket_endpoint = ibm_cos_bucket.cos_object_storage_metrics_bucket.s3_endpoint_private
  }
  depends_on = [
    ibm_iam_authorization_policy.cos_object_storage_to_cloud_logs
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted cloud logs"
      );
    });
    it("should format logs with log bucket no metrics bucket", () => {
      let actualData = formatCloudLogs({
        _options: {
          tags: ["hello", "world"],
          endpoints: "private",
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        cloud_logs: {
          enabled: true,
          cos: "cos",
          logs_bucket: "atracker",
          metrics_bucket: "(Disabled)",
          bucket_endpoint: "private",
          resource_group: "service-rg",
        },
      });
      let expectedData = `
resource "ibm_resource_instance" "cloud_logs" {
  name              = "\${var.prefix}-cloud-logs"
  service           = "logs"
  plan              = "standard"
  location          = var.region
  resource_group_id = ibm_resource_group.service_rg.id
  parameters = {
    logs_bucket_crn      = ibm_cos_bucket.cos_object_storage_atracker_bucket.crn
    logs_bucket_endpoint = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
  }
  depends_on = [
    ibm_iam_authorization_policy.cos_object_storage_to_cloud_logs
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted cloud logs"
      );
    });
    it("should format logs with log bucket no logs bucket", () => {
      let actualData = formatCloudLogs({
        _options: {
          tags: ["hello", "world"],
          endpoints: "private",
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        cloud_logs: {
          enabled: true,
          cos: "cos",
          logs_bucket: "(Disabled)",
          metrics_bucket: "metrics",
          bucket_endpoint: "private",
          resource_group: "service-rg",
        },
      });
      let expectedData = `
resource "ibm_resource_instance" "cloud_logs" {
  name              = "\${var.prefix}-cloud-logs"
  service           = "logs"
  plan              = "standard"
  location          = var.region
  resource_group_id = ibm_resource_group.service_rg.id
  parameters = {
    metrics_bucket_crn      = ibm_cos_bucket.cos_object_storage_metrics_bucket.crn
    metrics_bucket_endpoint = ibm_cos_bucket.cos_object_storage_metrics_bucket.s3_endpoint_private
  }
  depends_on = [
    ibm_iam_authorization_policy.cos_object_storage_to_cloud_logs
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted cloud logs"
      );
    });
    it("should format logs with log bucket no logs bucket and no metrics bucket", () => {
      let actualData = formatCloudLogs({
        _options: {
          tags: ["hello", "world"],
          endpoints: "private",
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        cloud_logs: {
          enabled: true,
          cos: "cos",
          logs_bucket: "(Disabled)",
          metrics_bucket: "(Disabled)",
          bucket_endpoint: "private",
          resource_group: "service-rg",
        },
      });
      let expectedData = `
resource "ibm_resource_instance" "cloud_logs" {
  name              = "\${var.prefix}-cloud-logs"
  service           = "logs"
  plan              = "standard"
  location          = var.region
  resource_group_id = ibm_resource_group.service_rg.id
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted cloud logs"
      );
    });
  });
  describe("formatCosToCloudLogsAuth", () => {
    it("should format a cloud logs authorization policy for cos", () => {
      let actualData = formatCosToCloudLogsAuth({
        _options: {
          tags: ["hello", "world"],
          endpoints: "private",
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        cloud_logs: {
          enabled: true,
          cos: "cos",
          logs_bucket: "atracker",
          metrics_bucket: "metrics",
          bucket_endpoint: "private",
          resource_group: "service-rg",
        },
        object_storage: [
          {
            name: "cos",
          },
        ],
      });
      let expectedData = `
resource "ibm_iam_authorization_policy" "cos_object_storage_to_cloud_logs" {
  source_service_name         = "logs"
  description                 = "Allow Cloud Logs to access Cos Object Storage"
  target_service_name         = "cloud-object-storage"
  target_resource_instance_id = ibm_resource_instance.cos_object_storage.guid
  roles = [
    "Writer"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct authorization policy"
      );
    });
  });
  describe("cloudLogsTf", () => {
    it("should return correct cloud logs tf", () => {
      let actualData = cloudLogsTf({
        _options: {
          tags: ["hello", "world"],
          endpoints: "private",
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        cloud_logs: {
          enabled: true,
          cos: "cos",
          logs_bucket: "atracker",
          metrics_bucket: "metrics",
          bucket_endpoint: "private",
          resource_group: "service-rg",
        },
        object_storage: [
          {
            name: "cos",
          },
        ],
      });
      let expectedData = `##############################################################################
# Cloud Logs Resources
##############################################################################

resource "ibm_iam_authorization_policy" "cos_object_storage_to_cloud_logs" {
  source_service_name         = "logs"
  description                 = "Allow Cloud Logs to access Cos Object Storage"
  target_service_name         = "cloud-object-storage"
  target_resource_instance_id = ibm_resource_instance.cos_object_storage.guid
  roles = [
    "Writer"
  ]
}

resource "ibm_resource_instance" "cloud_logs" {
  name              = "\${var.prefix}-cloud-logs"
  service           = "logs"
  plan              = "standard"
  location          = var.region
  resource_group_id = ibm_resource_group.service_rg.id
  parameters = {
    logs_bucket_crn         = ibm_cos_bucket.cos_object_storage_atracker_bucket.crn
    logs_bucket_endpoint    = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    metrics_bucket_crn      = ibm_cos_bucket.cos_object_storage_metrics_bucket.crn
    metrics_bucket_endpoint = ibm_cos_bucket.cos_object_storage_metrics_bucket.s3_endpoint_private
  }
  depends_on = [
    ibm_iam_authorization_policy.cos_object_storage_to_cloud_logs
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct authorization policy"
      );
    });
    it("should return correct cloud logs tf with no cos auth", () => {
      let actualData = cloudLogsTf({
        _options: {
          tags: ["hello", "world"],
          endpoints: "private",
        },
        resource_groups: [
          {
            name: "service-rg",
            use_data: false,
            prefix: true,
          },
        ],
        cloud_logs: {
          enabled: true,
          cos: "cos",
          logs_bucket: "(Disabled)",
          metrics_bucket: "(Disabled)",
          bucket_endpoint: "private",
          resource_group: "service-rg",
        },
        object_storage: [
          {
            name: "cos",
          },
        ],
      });
      let expectedData = `##############################################################################
# Cloud Logs Resources
##############################################################################

resource "ibm_resource_instance" "cloud_logs" {
  name              = "\${var.prefix}-cloud-logs"
  service           = "logs"
  plan              = "standard"
  location          = var.region
  resource_group_id = ibm_resource_group.service_rg.id
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct authorization policy"
      );
    });
  });
});
