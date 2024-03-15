const { assert } = require("chai");
const { formatPowerVsInstance } = require("../../client/src/lib/json-to-iac");
const {
  powerInstanceTf,
  formatFalconStorInstance,
} = require("../../client/src/lib/json-to-iac/power-vs-instances");

describe("Power VS Instances", () => {
  describe("formatPowerVsInstance", () => {
    it("should correctly return power vs instance data", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
          },
        ],
        primary_subnet: "dev-nw",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_pin_policy: "none",
        pi_health_status: "WARNING",
        pi_storage_type: "tier1",
        pi_user_data: "",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with pin policy", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
          },
        ],
        primary_subnet: "dev-nw",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_health_status: "WARNING",
        pi_storage_type: "tier1",
        pi_user_data: "",
        pi_pin_policy: "soft",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_pin_policy        = "soft"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with ibm i licenses", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
          },
        ],
        primary_subnet: "dev-nw",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_pin_policy: "none",
        pi_health_status: "WARNING",
        pi_storage_type: "tier1",
        pi_user_data: "",
        pi_ibmi_css: true,
        pi_ibmi_pha: true,
        pi_ibmi_rds_users: 1,
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_ibmi_css          = true
  pi_ibmi_pha          = true
  pi_ibmi_rds_users    = 1
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with ibm i licenses", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
          },
        ],
        primary_subnet: "dev-nw",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_pin_policy: "none",
        pi_health_status: "WARNING",
        pi_storage_type: "tier1",
        pi_user_data: "",
        pi_ibmi_css: false,
        pi_ibmi_pha: false,
        pi_ibmi_rds_users: "",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data when workspace is from data", () => {
      let actualData = formatPowerVsInstance(
        {
          zone: "dal12",
          workspace: "example",
          name: "test",
          image: "SLES15-SP3-SAP",
          ssh_key: "keyname",
          network: [
            {
              name: "dev-nw",
            },
          ],
          primary_subnet: "dev-nw",
          pi_memory: "4",
          pi_processors: "2",
          pi_proc_type: "shared",
          pi_sys_type: "s922",
          pi_pin_policy: "none",
          pi_health_status: "WARNING",
          pi_storage_type: "tier1",
          pi_user_data: "",
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
          power: [
            {
              name: "example",
              resource_group: "example",
              zone: "dal10",
              use_data: true,
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
        }
      );
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = data.ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data when workspace is from data and no ws", () => {
      let actualData = formatPowerVsInstance(
        {
          zone: "dal12",
          workspace: "example",
          name: "test",
          image: "SLES15-SP3-SAP",
          ssh_key: "keyname",
          network: [
            {
              name: "dev-nw",
            },
          ],
          primary_subnet: "dev-nw",
          pi_memory: "4",
          pi_processors: "2",
          pi_proc_type: "shared",
          pi_sys_type: "s922",
          pi_pin_policy: "none",
          pi_health_status: "WARNING",
          pi_storage_type: "tier1",
          pi_user_data: "",
          index: 0,
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
          power: [],
        }
      );
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ERROR: Unfound Ref
  pi_key_pair_name     = ERROR: Unfound Ref
  pi_cloud_instance_id = ERROR: Unfound Ref
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ERROR: Unfound Ref
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data when workspace and ssh key are from data", () => {
      let actualData = formatPowerVsInstance(
        {
          zone: "dal12",
          workspace: "example",
          name: "test",
          image: "SLES15-SP3-SAP",
          ssh_key: "keyname",
          network: [
            {
              name: "dev-nw",
            },
          ],
          primary_subnet: "dev-nw",
          pi_memory: "4",
          pi_processors: "2",
          pi_proc_type: "shared",
          pi_sys_type: "s922",
          pi_pin_policy: "none",
          pi_health_status: "WARNING",
          pi_storage_type: "tier1",
          pi_user_data: "",
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
          power: [
            {
              name: "example",
              resource_group: "example",
              zone: "dal10",
              use_data: true,
              ssh_keys: [
                {
                  workspace: "example",
                  name: "keyname",
                  zone: "dal10",
                  use_data: true,
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
        }
      );
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = data.ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = data.ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data when workspace, ssh key, and network are from data", () => {
      let actualData = formatPowerVsInstance(
        {
          zone: "dal12",
          workspace: "example",
          name: "test",
          image: "SLES15-SP3-SAP",
          ssh_key: "keyname",
          network: [
            {
              name: "dev-nw",
            },
          ],
          primary_subnet: "dev-nw",
          pi_memory: "4",
          pi_processors: "2",
          pi_proc_type: "shared",
          pi_sys_type: "s922",
          pi_pin_policy: "none",
          pi_health_status: "WARNING",
          pi_storage_type: "tier1",
          pi_user_data: "",
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
          power: [
            {
              name: "example",
              resource_group: "example",
              zone: "dal10",
              use_data: true,
              ssh_keys: [
                {
                  workspace: "example",
                  name: "keyname",
                  zone: "dal10",
                  use_data: true,
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
                  use_data: true,
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
        }
      );
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = data.ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = data.ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = data.ibm_pi_network.power_network_example_dev_nw.id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data when workspace, ssh key, network, and image are from data", () => {
      let actualData = formatPowerVsInstance(
        {
          zone: "dal12",
          workspace: "example",
          name: "test",
          image: "SLES15-SP3-SAP",
          ssh_key: "keyname",
          network: [
            {
              name: "dev-nw",
            },
          ],
          primary_subnet: "dev-nw",
          pi_memory: "4",
          pi_processors: "2",
          pi_proc_type: "shared",
          pi_sys_type: "s922",
          pi_pin_policy: "none",
          pi_health_status: "WARNING",
          pi_storage_type: "tier1",
          pi_user_data: "",
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
          power: [
            {
              name: "example",
              resource_group: "example",
              zone: "dal10",
              use_data: true,
              ssh_keys: [
                {
                  workspace: "example",
                  name: "keyname",
                  zone: "dal10",
                  use_data: true,
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
                  use_data: true,
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
                  use_data: true,
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
        }
      );
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = data.ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = data.ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = data.ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = data.ibm_pi_network.power_network_example_dev_nw.id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with userdata", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
          },
        ],
        primary_subnet: "dev-nw",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_pin_policy: "none",
        pi_health_status: "WARNING",
        pi_storage_type: "tier1",
        pi_user_data: "data",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_user_data         = <<USER_DATA
data
  USER_DATA
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with sap enabled", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
          },
        ],
        sap: true,
        sap_profile: "ush1-4x256",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_pin_policy: "none",
        pi_health_status: "WARNING",
        pi_storage_type: "tier1",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_sap_profile_id    = "ush1-4x256"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with BYO IP", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
            ip_address: "1.2.3.4",
          },
        ],
        primary_subnet: "dev-nw",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_pin_policy: "none",
        pi_health_status: "WARNING",
        pi_storage_type: "tier1",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
    ip_address = "1.2.3.4"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with storage pool", () => {
      let actualData = formatPowerVsInstance({
        zone: "dal12",
        workspace: "example",
        name: "test",
        image: "SLES15-SP3-SAP",
        ssh_key: "keyname",
        network: [
          {
            name: "dev-nw",
          },
        ],
        primary_subnet: "dev-nw",
        pi_memory: "4",
        pi_processors: "2",
        pi_proc_type: "shared",
        pi_sys_type: "s922",
        pi_pin_policy: "none",
        pi_health_status: "WARNING",
        pi_storage_pool: "Tier1-Flash2",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_pool      = "Tier1-Flash2"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with affinity instance", () => {
      let actualData = formatPowerVsInstance({
        name: "test",
        workspace: "example",
        image: "SLES15-SP3-SAP",
        network: [
          {
            name: "dev-nw",
            ip_address: "",
          },
        ],
        zone: "dal10",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        storage_option: "Affinity",
        affinity_type: "Instance",
        pi_storage_pool_affinity: true,
        ssh_key: "keyname",
        pi_sys_type: "e880",
        pi_memory: "10",
        pi_storage_pool: null,
        pi_affinity_policy: "affinity",
        pi_affinity_instance: "frog",
        pi_storage_type: "tier1",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider                 = ibm.power_vs_dal10
  pi_image_id              = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name         = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id     = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name         = "\${var.prefix}-test"
  pi_health_status         = "OK"
  pi_proc_type             = "shared"
  pi_storage_pool_affinity = true
  pi_sys_type              = "e880"
  pi_memory                = "10"
  pi_affinity_policy       = "affinity"
  pi_affinity_instance     = ibm_pi_instance.example_workspace_instance_frog.instance_id
  pi_storage_type          = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with anti-affinity instance", () => {
      let actualData = formatPowerVsInstance({
        name: "test",
        workspace: "example",
        image: "SLES15-SP3-SAP",
        network: [
          {
            name: "dev-nw",
            ip_address: "",
          },
        ],
        primary_subnet: "dev-nw",
        zone: "dal10",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: null,
        storage_option: "Anti-Affinity",
        affinity_type: "Instance",
        pi_storage_pool_affinity: true,
        ssh_key: "keyname",
        pi_sys_type: "e880",
        pi_memory: "10",
        pi_processors: "0.25",
        pi_storage_pool: null,
        pi_anti_affinity_volume: null,
        pi_anti_affinity_instance: "frog",
        pi_affinity_policy: "anti-affinity",
        pi_affinity_instance: null,
        pi_affinity_volume: null,
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider                  = ibm.power_vs_dal10
  pi_image_id               = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name          = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id      = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name          = "\${var.prefix}-test"
  pi_health_status          = "OK"
  pi_proc_type              = "shared"
  pi_storage_pool_affinity  = true
  pi_sys_type               = "e880"
  pi_memory                 = "10"
  pi_processors             = "0.25"
  pi_anti_affinity_instance = ibm_pi_instance.example_workspace_instance_frog.instance_id
  pi_affinity_policy        = "anti-affinity"
  pi_storage_type           = null
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with affinity volume", () => {
      let actualData = formatPowerVsInstance({
        name: "test",
        workspace: "example",
        image: "SLES15-SP3-SAP",
        network: [
          {
            name: "dev-nw",
            ip_address: "",
          },
        ],
        primary_subnet: "dev-nw",
        zone: "dal10",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        storage_option: "Affinity",
        affinity_type: "Storage",
        pi_storage_pool_affinity: true,
        ssh_key: "keyname",
        pi_sys_type: "e880",
        pi_memory: "10",
        pi_processors: "0.25",
        pi_storage_pool: null,
        pi_anti_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_affinity_policy: "affinity",
        pi_affinity_volume: "oracle-1-db-1",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider                 = ibm.power_vs_dal10
  pi_image_id              = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name         = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id     = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name         = "\${var.prefix}-test"
  pi_health_status         = "OK"
  pi_proc_type             = "shared"
  pi_storage_type          = "tier1"
  pi_storage_pool_affinity = true
  pi_sys_type              = "e880"
  pi_memory                = "10"
  pi_processors            = "0.25"
  pi_affinity_policy       = "affinity"
  pi_affinity_volume       = ibm_pi_volume.example_volume_oracle_1_db_1.volume_id
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should correctly return power vs instance data with anti-affinity volume", () => {
      let actualData = formatPowerVsInstance({
        name: "frog",
        workspace: "example",
        image: "SLES15-SP3-SAP",
        network: [
          {
            name: "dev-nw",
            ip_address: "",
          },
        ],
        primary_subnet: "dev-nw",
        zone: "dal10",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        storage_option: "Anti-Affinity",
        affinity_type: "Volume",
        pi_storage_pool_affinity: true,
        pi_storage_pool: null,
        pi_anti_affinity_volume: "redo-1",
        pi_anti_affinity_instance: null,
        pi_affinity_policy: "anti-affinity",
        pi_affinity_volume: null,
        pi_affinity_instance: null,
        ssh_key: "keyname",
        pi_sys_type: "e880",
        pi_memory: "10",
        pi_processors: "0.25",
      });
      let expectedData = `
resource "ibm_pi_instance" "example_workspace_instance_frog" {
  provider                 = ibm.power_vs_dal10
  pi_image_id              = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name         = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id     = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name         = "\${var.prefix}-frog"
  pi_health_status         = "OK"
  pi_proc_type             = "shared"
  pi_storage_type          = "tier1"
  pi_storage_pool_affinity = true
  pi_anti_affinity_volume  = ibm_pi_volume.example_volume_redo_1.volume_id
  pi_affinity_policy       = "anti-affinity"
  pi_sys_type              = "e880"
  pi_memory                = "10"
  pi_processors            = "0.25"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    describe("formatFalconStorInstance", () => {
      it("should correctly return power vs instance data", () => {
        let actualData = formatFalconStorInstance({
          zone: "dal12",
          workspace: "example",
          name: "test",
          ssh_key: "keyname",
          network: [
            {
              name: "dev-nw",
            },
          ],
          primary_subnet: "dev-nw",
          image: "VTL-FalconStor-10_03-001",
          pi_memory: "4",
          pi_processors: "2",
          pi_proc_type: "shared",
          pi_sys_type: "s922",
          pi_pin_policy: "none",
          pi_health_status: "WARNING",
          pi_storage_type: "tier1",
          pi_license_repository_capacity: 1,
        });
        let expectedData = `
resource "ibm_pi_instance" "example_falconstor_vtl_test" {
  provider                       = ibm.power_vs_dal12
  pi_image_id                    = ibm_pi_image.power_image_example_vtl_falconstor_10_03_001.image_id
  pi_key_pair_name               = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id           = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name               = "\${var.prefix}-test"
  pi_memory                      = "4"
  pi_processors                  = "2"
  pi_proc_type                   = "shared"
  pi_sys_type                    = "s922"
  pi_pin_policy                  = "none"
  pi_health_status               = "WARNING"
  pi_storage_type                = "tier1"
  pi_license_repository_capacity = 1
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}
`;
        assert.deepEqual(
          actualData,
          expectedData,
          "it should return correct instance data"
        );
      });
    });
  });
  describe("powerInstanceTf", () => {
    it("should return power file", () => {
      let actualData = powerInstanceTf({
        power_instances: [
          {
            zone: "dal12",
            workspace: "example",
            name: "test",
            image: "SLES15-SP3-SAP",
            ssh_key: "keyname",
            network: [
              {
                name: "dev-nw",
                ip_address: "",
              },
            ],
            primary_subnet: "dev-nw",
            pi_memory: "4",
            pi_processors: "2",
            pi_proc_type: "shared",
            pi_sys_type: "s922",
            pi_pin_policy: "none",
            pi_health_status: "WARNING",
            pi_storage_type: "tier1",
          },
        ],
      });
      let expectedData = `##############################################################################
# Test Power Instance
##############################################################################

resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
  });
  describe("powerInstanceTf", () => {
    it("should return power file", () => {
      let actualData = powerInstanceTf({
        power_instances: [
          {
            zone: "dal12",
            workspace: "example",
            name: "test",
            image: "SLES15-SP3-SAP",
            ssh_key: "keyname",
            network: [
              {
                name: "dev-nw",
              },
            ],
            primary_subnet: "dev-nw",
            pi_memory: "4",
            pi_processors: "2",
            pi_proc_type: "shared",
            pi_sys_type: "s922",
            pi_pin_policy: "none",
            pi_health_status: "WARNING",
            pi_storage_type: "tier1",
          },
        ],
      });
      let expectedData = `##############################################################################
# Test Power Instance
##############################################################################

resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
    it("should return power file with vtl", () => {
      let actualData = powerInstanceTf({
        power_instances: [
          {
            zone: "dal12",
            workspace: "example",
            name: "test",
            image: "SLES15-SP3-SAP",
            ssh_key: "keyname",
            network: [
              {
                name: "dev-nw",
              },
            ],
            primary_subnet: "dev-nw",
            pi_memory: "4",
            pi_processors: "2",
            pi_proc_type: "shared",
            pi_sys_type: "s922",
            pi_pin_policy: "none",
            pi_health_status: "WARNING",
            pi_storage_type: "tier1",
          },
        ],
        vtl: [
          {
            zone: "dal12",
            workspace: "example",
            name: "test",
            ssh_key: "keyname",
            network: [
              {
                name: "dev-nw",
              },
            ],
            image: "VTL-FalconStor-10_03-001",
            pi_memory: "4",
            pi_processors: "2",
            pi_proc_type: "shared",
            pi_sys_type: "s922",
            pi_pin_policy: "none",
            pi_health_status: "WARNING",
            pi_storage_type: "tier1",
            pi_license_repository_capacity: 1,
          },
        ],
      });
      let expectedData = `##############################################################################
# Test Power Instance
##############################################################################

resource "ibm_pi_instance" "example_workspace_instance_test" {
  provider             = ibm.power_vs_dal12
  pi_image_id          = ibm_pi_image.power_image_example_sles15_sp3_sap.image_id
  pi_key_pair_name     = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name     = "\${var.prefix}-test"
  pi_memory            = "4"
  pi_processors        = "2"
  pi_proc_type         = "shared"
  pi_sys_type          = "s922"
  pi_pin_policy        = "none"
  pi_health_status     = "WARNING"
  pi_storage_type      = "tier1"
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}

##############################################################################

##############################################################################
# Test FalconStor VTL
##############################################################################

resource "ibm_pi_instance" "example_falconstor_vtl_test" {
  provider                       = ibm.power_vs_dal12
  pi_image_id                    = ibm_pi_image.power_image_example_vtl_falconstor_10_03_001.image_id
  pi_key_pair_name               = ibm_pi_key.power_vs_ssh_key_keyname.pi_key_name
  pi_cloud_instance_id           = ibm_resource_instance.power_vs_workspace_example.guid
  pi_instance_name               = "\${var.prefix}-test"
  pi_memory                      = "4"
  pi_processors                  = "2"
  pi_proc_type                   = "shared"
  pi_sys_type                    = "s922"
  pi_pin_policy                  = "none"
  pi_health_status               = "WARNING"
  pi_storage_type                = "tier1"
  pi_license_repository_capacity = 1
  pi_network {
    network_id = ibm_pi_network.power_network_example_dev_nw.network_id
  }
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct instance data"
      );
    });
  });
});
