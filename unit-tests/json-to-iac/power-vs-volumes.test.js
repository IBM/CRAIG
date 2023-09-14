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
  pi_volume_type         = "tier1"
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume"
  pi_volume_shareable    = true
  pi_replication_enabled = true
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
  pi_volume_type         = "tier1"
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume"
  pi_volume_shareable    = true
  pi_replication_enabled = true
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
