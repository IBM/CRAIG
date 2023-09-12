const { assert } = require("chai");
const {
  formatPowerVsVolume,
  formatPowerVsVolumeAttachment,
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
      let actualData = formatPowerVsVolumeAttachment({
        workspace: "example",
        volume: "test-volume",
        instance: "test",
        zone: "dal12",
      });
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
});
