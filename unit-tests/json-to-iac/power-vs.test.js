const { assert } = require("chai");
const { formatPowerVsWorkspace } = require("../../client/src/lib/json-to-iac");
const {
  formatPowerVsSshKey,
} = require("../../client/src/lib/json-to-iac/power-vs.js");

describe("power vs terraform", () => {
  describe("formatPowerVsWorkspace", () => {
    it("should return the correct power vs workspace", () => {
      let actualData = formatPowerVsWorkspace(
        {
          name: "example",
          resource_group: "example",
        },
        {
          _options: {
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "example",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_resource_instance" "power_vs_workspace_example" {
  provider          = ibm.power_vs
  name              = "\${var.prefix}-power-workspace-example"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = var.power_vs_zone
  resource_group_id = ibm_resource_group.example.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
  describe("formatPowerVsSshKey", () => {
    it("should return the correct power vs workspace ssh keys", () => {
      let actualData = formatPowerVsSshKey(
        {
          name: "example",
        },
        {
          _options: {
            tags: ["hello", "world"],
          },
        },
        "keyname"
      );
      let expectedData = `
resource "ibm_pi_key" "power_vs_ssh_key_keyname" {
  provider             = ibm.power_vs
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_key_name          = "\${var.prefix}-power-example-keyname-public-key"
  pi_ssh_key           = var.power_example_keyname_public_key
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
});
