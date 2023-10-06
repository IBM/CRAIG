const { assert } = require("chai");
const {
  formatPowerVsVolume,
  formatPowerVsVolumeAttachment,
  powerVsVolumeTf,
} = require("../../client/src/lib/json-to-iac");

describe("power vs volumes", () => {
  describe("formatPowerVsVolume", () => {
    it("should return correct volume terraform", () => {
      let actualData = formatPowerVsVolume({
        zone: "dal12",
        pi_volume_size: 20,
        name: "test-volume",
        workspace: "example",
        pi_volume_shareable: true,
        pi_replication_enabled: true,
        pi_volume_type: "tier1",
      });
      let expectedData = `
resource "ibm_pi_volume" "example_volume_test_volume" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format volume terraform with affinity policy for instance", () => {
      let actualData = formatPowerVsVolume({
        name: "oracle-1-db-1",
        workspace: "oracle-template",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier1",
        attachments: ["oracle-1"],
        zone: "dal12",
        pi_volume_size: "90",
        storage_option: "Affinity",
        affinity_type: "Instance",
        pi_storage_type: null,
        pi_storage_pool: null,
        pi_anti_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_affinity_policy: "affinity",
        pi_affinity_volume: "oracle-2-db-2",
        pi_affinity_instance: "oracle-1",
      });
      let expectedData = `
resource "ibm_pi_volume" "oracle_template_volume_oracle_1_db_1" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_oracle_template.guid
  pi_volume_size         = "90"
  pi_volume_name         = "\${var.prefix}-oracle_template-oracle-1-db-1"
  pi_volume_shareable    = true
  pi_replication_enabled = false
  pi_affinity_policy     = "affinity"
  pi_affinity_instance   = ibm_pi_instance.oracle_template_workspace_instance_oracle_1.instance_id
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format volume terraform with anti-affinity policy for volume", () => {
      let actualData = formatPowerVsVolume({
        name: "oracle-1-db-1",
        workspace: "oracle-template",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier1",
        attachments: ["oracle-1"],
        zone: "dal12",
        pi_volume_size: "90",
        storage_option: "Anti-Affinity",
        affinity_type: "Volume",
        pi_storage_type: null,
        pi_storage_pool: null,
        pi_anti_affinity_volume: "oracle-2-db-1",
        pi_anti_affinity_instance: null,
        pi_affinity_policy: "anti-affinity",
        pi_affinity_volume: null,
        pi_affinity_instance: null,
      });
      let expectedData = `
resource "ibm_pi_volume" "oracle_template_volume_oracle_1_db_1" {
  provider                = ibm.power_vs_dal12
  pi_cloud_instance_id    = ibm_resource_instance.power_vs_workspace_oracle_template.guid
  pi_volume_size          = "90"
  pi_volume_name          = "\${var.prefix}-oracle_template-oracle-1-db-1"
  pi_volume_shareable     = true
  pi_replication_enabled  = false
  pi_affinity_policy      = "anti-affinity"
  pi_anti_affinity_volume = ibm_pi_volume.oracle_template_volume_oracle_2_db_1.volume_id
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format volume terraform with storage pool for volume", () => {
      let actualData = formatPowerVsVolume({
        name: "oracle-1-db-1",
        workspace: "oracle-template",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: null,
        attachments: ["oracle-1"],
        zone: "dal12",
        pi_volume_size: "90",
        storage_option: "Storage Pool",
        affinity_type: null,
        pi_affinity_policy: null,
        pi_affinity_volume: null,
        pi_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_storage_pool: "Tier1-Flash-4",
      });
      let expectedData = `
resource "ibm_pi_volume" "oracle_template_volume_oracle_1_db_1" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_oracle_template.guid
  pi_volume_size         = "90"
  pi_volume_name         = "\${var.prefix}-oracle_template-oracle-1-db-1"
  pi_volume_shareable    = true
  pi_replication_enabled = false
  pi_storage_pool        = "Tier1-Flash-4"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatPowerVsVolumeAttachment", () => {
    it("should return correctly formatted data", () => {
      let actualData = formatPowerVsVolumeAttachment(
        {
          workspace: "example",
          name: "test-volume",
          zone: "dal12",
        },
        "test"
      );
      let expectedData = `
resource "ibm_pi_volume_attach" "example_attach_test_volume_to_test_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_test.instance_id
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("powerVsVolumeTf", () => {
    it("should return power volume terraform file", () => {
      let actualData = powerVsVolumeTf({
        power_volumes: [
          {
            zone: "dal12",
            pi_volume_size: 20,
            name: "test-volume",
            workspace: "example",
            pi_volume_shareable: true,
            pi_replication_enabled: true,
            pi_volume_type: "tier1",
            attachments: ["instance-1", "instance-2"],
          },
        ],
      });
      let expectedData = `##############################################################################
# Power VS Volume Test Volume
##############################################################################

resource "ibm_pi_volume" "example_volume_test_volume" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_to_instance_1_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_1.instance_id
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_to_instance_2_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_2.instance_id
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
