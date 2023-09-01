const { assert } = require("chai");
const { formatPowerVsWorkspace } = require("../../client/src/lib/json-to-iac");
const {
  formatPowerVsSshKey,
  formatPowerVsNetwork,
  formatPowerVsCloudConnection,
  formatPowerVsImage,
  formatCloudConnectionDataSource,
  formatPowerToTransitGatewayConnection,
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
          workspace: "example",
          name: "keyname",
        },
        {
          _options: {
            tags: ["hello", "world"],
          },
        }
      );
      let expectedData = `
resource "ibm_pi_key" "power_vs_ssh_key_keyname" {
  provider             = ibm.power_vs
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_key_name          = "\${var.prefix}-power-example-keyname-key"
  pi_ssh_key           = var.power_example_keyname_key
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
  describe("formatPowerVsNetwork", () => {
    it("should format pi network resource", () => {
      let actualData = formatPowerVsNetwork({
        workspace: "example",
        name: "dev-nw",
        pi_cidr: "1.2.3.4/5",
        pi_dns: ["127.0.0.1"],
        pi_network_type: "vlan",
        pi_network_jumbo: true,
      });
      let expectedData = `
resource "ibm_pi_network" "power_network_example_dev_nw" {
  provider             = ibm.power_vs
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_network_name      = "\${var.prefix}-power-network-dev-nw"
  pi_cidr              = "1.2.3.4/5"
  pi_network_type      = "vlan"
  pi_network_jumbo     = true
  pi_dns = [
    "127.0.0.1"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
  describe("formatPowerVsCloudConnection", () => {
    it("should format power cloud connection", () => {
      let actualData = formatPowerVsCloudConnection({
        name: "dev-connection",
        workspace: "example",
        pi_cloud_connection_speed: 50,
        pi_cloud_connection_global_routing: false,
        pi_cloud_connection_metered: false,
        pi_cloud_connection_transit_enabled: true,
      });
      let expectedData = `
resource "ibm_pi_cloud_connection" "power_network_example_connection_dev_connection" {
  provider                            = ibm.power_vs
  pi_cloud_instance_id                = ibm_resource_instance.power_vs_workspace_example.guid
  pi_cloud_connection_name            = "\${var.prefix}-power-network-dev-connection-connection"
  pi_cloud_connection_speed           = 50
  pi_cloud_connection_global_routing  = false
  pi_cloud_connection_metered         = false
  pi_cloud_connection_transit_enabled = true
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
  describe("formatPowerVsImage", () => {
    it("should format power image", () => {
      let actualData = formatPowerVsImage({
        workspace: "example",
        pi_image_id: "e4de6683-2a42-4993-b702-c8613f132d39",
        name: "SLES15-SP3-SAP",
      });
      let expectedData = `
resource "ibm_pi_image" "power_image_example_sles15_sp3_sap" {
  provider             = ibm.power_vs
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_image_id          = "e4de6683-2a42-4993-b702-c8613f132d39"
  pi_image_name        = "SLES15-SP3-SAP"
  timeouts {
    create = "9m"
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
  describe("formatCloudConnectionDataSource", () => {
    it("should return data source", () => {
      let actualData = formatCloudConnectionDataSource({
        name: "dev-connection",
        workspace: "example",
        pi_cloud_connection_speed: 50,
        pi_cloud_connection_global_routing: false,
        pi_cloud_connection_metered: false,
        pi_cloud_connection_transit_enabled: true,
      });
      let expectedData = `
data "ibm_dl_gateway" "power_network_example_connection_dev_connection" {
  provider = ibm.power_vs
  name     = "\${var.prefix}-power-network-dev-connection-connection"
  depends_on = [
    ibm_pi_cloud_connection.power_network_example_connection_dev_connection
  ]
}

resource "time_sleep" "power_network_example_connection_dev_connection_sleep" {
  create_duration = "120s"
  triggers = {
    crn = data.ibm_dl_gateway.power_network_example_connection_dev_connection.crn
  }
  depends_on = [
    data.ibm_dl_gateway.power_network_example_connection_dev_connection
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
  describe("formatPowerToTransitGatewayConnection", () => {
    it("should return correct transit gateway connection", () => {
      let actualData = formatPowerToTransitGatewayConnection({
        name: "dev-connection",
        workspace: "example",
        pi_cloud_connection_speed: 50,
        pi_cloud_connection_global_routing: false,
        pi_cloud_connection_metered: false,
        pi_cloud_connection_transit_enabled: true,
        gateway: "tgw",
      });
      let expectedData = `
resource "ibm_tg_connection" "tgw_connection_power_network_example_connection_dev_connection" {
  provider     = ibm.power_vs
  gateway      = ibm_tg_gateway.tgw.id
  network_type = "directlink"
  name         = "\${var.prefix}-tgw-to-dev-connection-connection"
  network_id   = time_sleep.power_network_example_connection_dev_connection_sleep.triggers["crn"]
  depends_on = [
    ibm_pi_cloud_connection.power_network_example_connection_dev_connection
  ]
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
