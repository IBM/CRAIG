const { assert } = require("chai");
const { formatPowerVsWorkspace } = require("../../client/src/lib/json-to-iac");
const {
  formatPowerVsSshKey,
  formatPowerVsNetwork,
  formatPowerVsCloudConnection,
  formatPowerVsImage,
  formatCloudConnectionDataSource,
  formatPowerToTransitGatewayConnection,
  formatPowerVsNetworkAttachment,
  powerVsTf,
} = require("../../client/src/lib/json-to-iac/power-vs.js");

describe("power vs terraform", () => {
  describe("formatPowerVsWorkspace", () => {
    it("should return the correct power vs workspace", () => {
      let actualData = formatPowerVsWorkspace(
        {
          name: "example",
          resource_group: "example",
          zone: "dal10",
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
  provider          = ibm.power_vs_dal10
  name              = "\${var.prefix}-power-workspace-example"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal10"
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
          zone: "dal10",
        },
        {
          _options: {
            tags: ["hello", "world"],
          },
        }
      );
      let expectedData = `
resource "ibm_pi_key" "power_vs_ssh_key_keyname" {
  provider             = ibm.power_vs_dal10
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
        zone: "dal10",
      });
      let expectedData = `
resource "ibm_pi_network" "power_network_example_dev_nw" {
  provider             = ibm.power_vs_dal10
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
        zone: "dal10",
      });
      let expectedData = `
resource "ibm_pi_cloud_connection" "power_network_example_connection_dev_connection" {
  provider                            = ibm.power_vs_dal10
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
        zone: "dal10",
      });
      let expectedData = `
resource "ibm_pi_image" "power_image_example_sles15_sp3_sap" {
  provider             = ibm.power_vs_dal10
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
        zone: "dal10",
      });
      let expectedData = `
data "ibm_dl_gateway" "power_network_example_connection_dev_connection" {
  provider = ibm.power_vs_dal10
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
      let actualData = formatPowerToTransitGatewayConnection(
        {
          name: "dev-connection",
          workspace: "example",
          pi_cloud_connection_speed: 50,
          pi_cloud_connection_global_routing: false,
          pi_cloud_connection_metered: false,
          pi_cloud_connection_transit_enabled: true,
          zone: "dal10",
        },
        "tgw"
      );
      let expectedData = `
resource "ibm_tg_connection" "tgw_connection_power_network_example_connection_dev_connection" {
  provider     = ibm.power_vs_dal10
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
  describe("formatPowerVsNetworkAttachment", () => {
    it("should return correct code for network attachment", () => {
      let actualData = formatPowerVsNetworkAttachment({
        workspace: "example",
        connection: "dev-connection",
        network: "dev-nw",
        zone: "dal10",
      });
      let expectedData = `
resource "ibm_pi_cloud_connection_network_attach" "power_example_dev_connection_connection_dev_nw_connection" {
  provider               = ibm.power_vs_dal10
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_cloud_connection_id = ibm_pi_cloud_connection.power_network_example_connection_dev_connection.cloud_connection_id
  pi_network_id          = ibm_pi_network.power_network_example_dev_nw.network_id
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
  describe("powerVsTf", () => {
    it("should return a power vs network configuration with only workspace", () => {
      let config = {
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            use_data: false,
            name: "example",
          },
        ],
        power: [
          {
            name: "example",
            resource_group: "example",
            zone: "dal10",
            ssh_keys: [],
            network: [],
            cloud_connections: [],
            images: [],
            attachments: [],
          },
        ],
      };
      let actualData = powerVsTf(config);
      let expectedData = `##############################################################################
# Power VS Workspace Example
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_example" {
  provider          = ibm.power_vs_dal10
  name              = "\${var.prefix}-power-workspace-example"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal10"
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

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return a power vs network configuration", () => {
      let config = {
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            use_data: false,
            name: "example",
          },
        ],
        power: [
          {
            name: "example",
            resource_group: "example",
            zone: "dal10",
            ssh_keys: [
              {
                workspace: "example",
                name: "keyname",
                zone: "dal10",
              },
            ],
            network: [
              {
                workspace: "example",
                name: "dev-nw",
                pi_cidr: "1.2.3.4/5",
                pi_dns: ["127.0.0.1"],
                pi_network_type: "vlan",
                pi_network_jumbo: true,
                zone: "dal10",
              },
            ],
            cloud_connections: [
              {
                name: "dev-connection",
                workspace: "example",
                pi_cloud_connection_speed: 50,
                pi_cloud_connection_global_routing: false,
                pi_cloud_connection_metered: false,
                pi_cloud_connection_transit_enabled: true,
                transit_gateways: ["tgw", "tgw2"],
                zone: "dal10",
              },
            ],
            images: [
              {
                workspace: "example",
                pi_image_id: "e4de6683-2a42-4993-b702-c8613f132d39",
                name: "SLES15-SP3-SAP",
                zone: "dal10",
              },
            ],
            attachments: [
              {
                connections: ["dev-connection"],
                workspace: "example",
                network: "dev-nw",
                zone: "dal10",
              },
            ],
          },
        ],
      };
      let actualData = powerVsTf(config);
      let expectedData = `##############################################################################
# Power VS Workspace Example
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_example" {
  provider          = ibm.power_vs_dal10
  name              = "\${var.prefix}-power-workspace-example"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal10"
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

##############################################################################

##############################################################################
# Example Workspace SSH Keys
##############################################################################

resource "ibm_pi_key" "power_vs_ssh_key_keyname" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_key_name          = "\${var.prefix}-power-example-keyname-key"
  pi_ssh_key           = var.power_example_keyname_key
}

##############################################################################

##############################################################################
# Example Workspace Network
##############################################################################

resource "ibm_pi_network" "power_network_example_dev_nw" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_network_name      = "\${var.prefix}-power-network-dev-nw"
  pi_cidr              = "1.2.3.4/5"
  pi_network_type      = "vlan"
  pi_network_jumbo     = true
  pi_dns = [
    "127.0.0.1"
  ]
}

##############################################################################

##############################################################################
# Example Workspace Images
##############################################################################

resource "ibm_pi_image" "power_image_example_sles15_sp3_sap" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_image_id          = "e4de6683-2a42-4993-b702-c8613f132d39"
  pi_image_name        = "SLES15-SP3-SAP"
  timeouts {
    create = "9m"
  }
}

##############################################################################

##############################################################################
# Example Workspace Dev Connection
##############################################################################

resource "ibm_pi_cloud_connection" "power_network_example_connection_dev_connection" {
  provider                            = ibm.power_vs_dal10
  pi_cloud_instance_id                = ibm_resource_instance.power_vs_workspace_example.guid
  pi_cloud_connection_name            = "\${var.prefix}-power-network-dev-connection-connection"
  pi_cloud_connection_speed           = 50
  pi_cloud_connection_global_routing  = false
  pi_cloud_connection_metered         = false
  pi_cloud_connection_transit_enabled = true
}

data "ibm_dl_gateway" "power_network_example_connection_dev_connection" {
  provider = ibm.power_vs_dal10
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

##############################################################################

##############################################################################
# Example Workspace Dev Connection Transit Gateway Connections
##############################################################################

resource "ibm_tg_connection" "tgw_connection_power_network_example_connection_dev_connection" {
  provider     = ibm.power_vs_dal10
  gateway      = ibm_tg_gateway.tgw.id
  network_type = "directlink"
  name         = "\${var.prefix}-tgw-to-dev-connection-connection"
  network_id   = time_sleep.power_network_example_connection_dev_connection_sleep.triggers["crn"]
  depends_on = [
    ibm_pi_cloud_connection.power_network_example_connection_dev_connection
  ]
}

resource "ibm_tg_connection" "tgw2_connection_power_network_example_connection_dev_connection" {
  provider     = ibm.power_vs_dal10
  gateway      = ibm_tg_gateway.tgw2.id
  network_type = "directlink"
  name         = "\${var.prefix}-tgw2-to-dev-connection-connection"
  network_id   = time_sleep.power_network_example_connection_dev_connection_sleep.triggers["crn"]
  depends_on = [
    ibm_pi_cloud_connection.power_network_example_connection_dev_connection
  ]
}

##############################################################################

##############################################################################
# Example Workspace Network Attachments
##############################################################################

resource "ibm_pi_cloud_connection_network_attach" "power_example_dev_connection_connection_dev_nw_connection" {
  provider               = ibm.power_vs_dal10
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_cloud_connection_id = ibm_pi_cloud_connection.power_network_example_connection_dev_connection.cloud_connection_id
  pi_network_id          = ibm_pi_network.power_network_example_dev_nw.network_id
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return a power vs network configuration with no transit gateways", () => {
      let config = {
        _options: {
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            use_data: false,
            name: "example",
          },
        ],
        power: [
          {
            name: "example",
            resource_group: "example",
            zone: "dal10",
            ssh_keys: [
              {
                workspace: "example",
                name: "keyname",
                zone: "dal10",
              },
            ],
            network: [
              {
                workspace: "example",
                name: "dev-nw",
                pi_cidr: "1.2.3.4/5",
                pi_dns: ["127.0.0.1"],
                pi_network_type: "vlan",
                pi_network_jumbo: true,
                zone: "dal10",
              },
            ],
            cloud_connections: [
              {
                name: "dev-connection",
                workspace: "example",
                pi_cloud_connection_speed: 50,
                pi_cloud_connection_global_routing: false,
                pi_cloud_connection_metered: false,
                pi_cloud_connection_transit_enabled: true,
                transit_gateways: [],
                zone: "dal10",
              },
            ],
            images: [
              {
                workspace: "example",
                pi_image_id: "e4de6683-2a42-4993-b702-c8613f132d39",
                name: "SLES15-SP3-SAP",
                zone: "dal10",
              },
            ],
            attachments: [
              {
                connections: ["dev-connection"],
                workspace: "example",
                network: "dev-nw",
                zone: "dal10",
              },
            ],
          },
        ],
      };
      let actualData = powerVsTf(config);
      let expectedData = `##############################################################################
# Power VS Workspace Example
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_example" {
  provider          = ibm.power_vs_dal10
  name              = "\${var.prefix}-power-workspace-example"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal10"
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

##############################################################################

##############################################################################
# Example Workspace SSH Keys
##############################################################################

resource "ibm_pi_key" "power_vs_ssh_key_keyname" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_key_name          = "\${var.prefix}-power-example-keyname-key"
  pi_ssh_key           = var.power_example_keyname_key
}

##############################################################################

##############################################################################
# Example Workspace Network
##############################################################################

resource "ibm_pi_network" "power_network_example_dev_nw" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_network_name      = "\${var.prefix}-power-network-dev-nw"
  pi_cidr              = "1.2.3.4/5"
  pi_network_type      = "vlan"
  pi_network_jumbo     = true
  pi_dns = [
    "127.0.0.1"
  ]
}

##############################################################################

##############################################################################
# Example Workspace Images
##############################################################################

resource "ibm_pi_image" "power_image_example_sles15_sp3_sap" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_image_id          = "e4de6683-2a42-4993-b702-c8613f132d39"
  pi_image_name        = "SLES15-SP3-SAP"
  timeouts {
    create = "9m"
  }
}

##############################################################################

##############################################################################
# Example Workspace Dev Connection
##############################################################################

resource "ibm_pi_cloud_connection" "power_network_example_connection_dev_connection" {
  provider                            = ibm.power_vs_dal10
  pi_cloud_instance_id                = ibm_resource_instance.power_vs_workspace_example.guid
  pi_cloud_connection_name            = "\${var.prefix}-power-network-dev-connection-connection"
  pi_cloud_connection_speed           = 50
  pi_cloud_connection_global_routing  = false
  pi_cloud_connection_metered         = false
  pi_cloud_connection_transit_enabled = true
}

data "ibm_dl_gateway" "power_network_example_connection_dev_connection" {
  provider = ibm.power_vs_dal10
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

##############################################################################

##############################################################################
# Example Workspace Network Attachments
##############################################################################

resource "ibm_pi_cloud_connection_network_attach" "power_example_dev_connection_connection_dev_nw_connection" {
  provider               = ibm.power_vs_dal10
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_cloud_connection_id = ibm_pi_cloud_connection.power_network_example_connection_dev_connection.cloud_connection_id
  pi_network_id          = ibm_pi_network.power_network_example_dev_nw.network_id
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
});
