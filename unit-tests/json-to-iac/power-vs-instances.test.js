const { assert } = require("chai");
const { formatPowerVsInstance } = require("../../client/src/lib/json-to-iac");
const {
  powerInstanceTf,
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
});
