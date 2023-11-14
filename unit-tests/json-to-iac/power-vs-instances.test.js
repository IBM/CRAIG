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
        pi_storage_type: null,
        storage_option: "Affinity",
        affinity_type: "Instance",
        pi_storage_pool_affinity: true,
        ssh_key: "keyname",
        pi_sys_type: "e880",
        pi_memory: "10",
        pi_storage_pool: null,
        pi_affinity_policy: "affinity",
        pi_affinity_instance: "frog",
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
        zone: "dal10",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: null,
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
        zone: "dal10",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: null,
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
