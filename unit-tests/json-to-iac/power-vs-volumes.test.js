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
        storage_option: "None",
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
    it("should return correct volume terraform with existing workspace", () => {
      let actualData = formatPowerVsVolume(
        {
          zone: "dal12",
          pi_volume_size: 20,
          name: "test-volume",
          workspace: "example",
          pi_volume_shareable: true,
          pi_replication_enabled: true,
          pi_volume_type: "tier1",
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
resource "ibm_pi_volume" "example_volume_test_volume" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = data.ibm_resource_instance.power_vs_workspace_example.guid
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
    it("should return correct volume terraform with unfound workspace", () => {
      let actualData = formatPowerVsVolume(
        {
          zone: "dal12",
          pi_volume_size: 20,
          name: "test-volume",
          workspace: "example",
          pi_volume_shareable: true,
          pi_replication_enabled: true,
          pi_volume_type: "tier1",
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
resource "ibm_pi_volume" "example_volume_test_volume" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = "ERROR: Unfound Ref"
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
    it("should return correct volume terraform when count is empty string", () => {
      let actualData = formatPowerVsVolume({
        zone: "dal12",
        pi_volume_size: 20,
        name: "test-volume",
        workspace: "example",
        pi_volume_shareable: true,
        pi_replication_enabled: true,
        pi_volume_type: "tier1",
        count: "",
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
    it("should return correct volume and remove index", () => {
      let actualData = formatPowerVsVolume({
        name: "aixtgtvols1",
        workspace: "workspace",
        pi_volume_shareable: false,
        pi_replication_enabled: false,
        pi_volume_type: null,
        attachments: ["aixtarget"],
        storage_option: "Affinity",
        affinity_type: "Instance",
        pi_storage_pool: null,
        pi_anti_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_affinity_policy: "affinity",
        zone: "dal10",
        pi_volume_size: "100",
        pi_affinity_instance: "aixtarget",
        index: 0,
      });
      let expectedData = `
resource "ibm_pi_volume" "workspace_volume_aixtgtvols1" {
  provider               = ibm.power_vs_dal10
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_workspace.guid
  pi_volume_size         = 100
  pi_volume_name         = "\${var.prefix}-workspace-aixtgtvols1"
  pi_volume_shareable    = false
  pi_replication_enabled = false
  pi_affinity_policy     = "affinity"
  pi_affinity_instance   = ibm_pi_instance.workspace_workspace_instance_aixtarget.instance_id
  pi_volume_type         = null
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct volume terraform with multiples", () => {
      let actualData = formatPowerVsVolume({
        count: "4",
        zone: "dal12",
        pi_volume_size: "20",
        name: "test-volume",
        workspace: "example",
        pi_volume_shareable: true,
        pi_replication_enabled: true,
        pi_volume_type: "tier1",
      });
      let expectedData = `
resource "ibm_pi_volume" "example_volume_test_volume_1" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume-1"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}

resource "ibm_pi_volume" "example_volume_test_volume_2" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume-2"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}

resource "ibm_pi_volume" "example_volume_test_volume_3" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume-3"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}

resource "ibm_pi_volume" "example_volume_test_volume_4" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume-4"
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
  pi_volume_size         = 90
  pi_volume_name         = "\${var.prefix}-oracle-template-oracle-1-db-1"
  pi_volume_shareable    = true
  pi_replication_enabled = false
  pi_volume_type         = "tier1"
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
  pi_volume_size          = 90
  pi_volume_name          = "\${var.prefix}-oracle-template-oracle-1-db-1"
  pi_volume_shareable     = true
  pi_replication_enabled  = false
  pi_volume_type          = "tier1"
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
    it("should format volume terraform with storage pool passed in as pi_volume_pool", () => {
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
        pi_volume_pool: "Tier1-Flash-4",
      });
      let expectedData = `
resource "ibm_pi_volume" "oracle_template_volume_oracle_1_db_1" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_oracle_template.guid
  pi_volume_size         = 90
  pi_volume_name         = "\${var.prefix}-oracle-template-oracle-1-db-1"
  pi_volume_shareable    = true
  pi_replication_enabled = false
  pi_volume_pool         = "Tier1-Flash-4"
  pi_volume_type         = null
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
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correctly formatted data when using data", () => {
      let actualData = formatPowerVsVolumeAttachment(
        {
          workspace: "example",
          name: "test-volume",
          zone: "dal12",
        },
        "test",
        undefined,
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
resource "ibm_pi_volume_attach" "example_attach_test_volume_to_test_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = data.ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_test.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
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
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_to_instance_2_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_2.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.example_attach_test_volume_to_instance_1_instance
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return power volume terraform file with count", () => {
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
            count: 2,
          },
        ],
      });
      let expectedData = `##############################################################################
# Power VS Volume Test Volume
##############################################################################

resource "ibm_pi_volume" "example_volume_test_volume_1" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume-1"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}

resource "ibm_pi_volume" "example_volume_test_volume_2" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume-2"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_1_to_instance_1_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume_1.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_1.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_2_to_instance_1_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume_2.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_1.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.example_attach_test_volume_1_to_instance_1_instance
  ]
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_1_to_instance_2_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume_1.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_2.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.example_attach_test_volume_2_to_instance_1_instance
  ]
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_2_to_instance_2_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume_2.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_2.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.example_attach_test_volume_1_to_instance_2_instance
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return power volume terraform file", () => {
      let actualData = powerVsVolumeTf({
        _options: {
          prefix: "sm",
          region: "us-south",
          tags: ["smatzek"],
          zones: 3,
          endpoints: "private",
          account_id: null,
          fs_cloud: false,
          enable_classic: false,
          dynamic_subnets: true,
          enable_power_vs: true,
          craig_version: "1.9.0",
          power_vs_zones: ["dal10"],
          power_vs_high_availability: false,
          template: "Empty Project",
        },
        access_groups: [],
        appid: [],
        atracker: {
          enabled: false,
          type: "cos",
          name: "atracker",
          target_name: "atracker-cos",
          bucket: null,
          add_route: true,
          cos_key: null,
          locations: ["global", "us-south"],
          instance: false,
          plan: "lite",
          resource_group: null,
        },
        cbr_rules: [],
        cbr_zones: [],
        clusters: [],
        dns: [],
        event_streams: [],
        f5_vsi: [],
        iam_account_settings: {
          enable: false,
          mfa: null,
          allowed_ip_addresses: null,
          include_history: false,
          if_match: null,
          max_sessions_per_identity: null,
          restrict_create_service_id: null,
          restrict_create_platform_apikey: null,
          session_expiration_in_seconds: null,
          session_invalidation_in_seconds: null,
        },
        icd: [],
        key_management: [],
        load_balancers: [],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: null,
          cos: null,
          bucket: null,
        },
        object_storage: [],
        power: [
          {
            use_data: false,
            name: "smatzek-storage-test",
            zone: "dal10",
            resource_group: "powervs-coe",
            imageNames: ["7300-00-01"],
            images: [
              {
                creationDate: "2023-02-14T23:16:04.000Z",
                description: "",
                href: "/pcloud/v1/cloud-instances/d839ff9f75e2465a81707aa69ee9a9b7/stock-images/24083f6f-6ab7-4b59-bbd1-3ccb9e24a8db",
                imageID: "24083f6f-6ab7-4b59-bbd1-3ccb9e24a8db",
                lastUpdateDate: "2023-02-15T16:15:55.000Z",
                name: "7300-00-01",
                specifications: {
                  architecture: "ppc64",
                  containerFormat: "bare",
                  diskFormat: "raw",
                  endianness: "big-endian",
                  hypervisorType: "phyp",
                  operatingSystem: "aix",
                },
                state: "active",
                storagePool: "Tier3-Flash-1",
                storageType: "tier3",
                workspace: "smatzek-storage-test",
                zone: "dal10",
                workspace_use_data: false,
              },
            ],
            ssh_keys: [
              {
                workspace_use_data: false,
                use_data: true,
                name: "smatzek",
                public_key: null,
                workspace: "smatzek-storage-test",
                zone: "dal10",
              },
            ],
            network: [
              {
                workspace_use_data: false,
                name: "test-net",
                use_data: false,
                pi_network_type: "vlan",
                pi_cidr: "192.168.31.0/24",
                pi_dns: ["127.0.0.1"],
                pi_network_jumbo: false,
                workspace: "smatzek-storage-test",
                zone: "dal10",
              },
            ],
            cloud_connections: [],
            attachments: [],
          },
        ],
        power_instances: [
          {
            sap: false,
            sap_profile: null,
            name: "tier0vm",
            workspace: "smatzek-storage-test",
            network: [
              {
                name: "test-net",
                ip_address: "",
              },
            ],
            ssh_key: "smatzek",
            image: "7300-00-01",
            pi_sys_type: "s922",
            pi_proc_type: "shared",
            pi_processors: ".25",
            pi_memory: "4",
            pi_storage_pool_affinity: false,
            pi_storage_type: "tier0",
            storage_option: "None",
            pi_storage_pool: null,
            affinity_type: null,
            pi_affinity_volume: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_affinity_instance: null,
            pi_user_data: null,
            pi_affinity_policy: null,
            zone: "dal10",
          },
        ],
        power_volumes: [
          {
            name: "tier3vol",
            workspace: "smatzek-storage-test",
            pi_volume_size: "1",
            pi_volume_type: "tier3",
            count: null,
            storage_option: "Affinity",
            pi_volume_pool: null,
            affinity_type: "Instance",
            pi_affinity_volume: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_affinity_instance: "tier0vm",
            pi_replication_enabled: false,
            pi_volume_shareable: false,
            attachments: ["tier0vm"],
            pi_affinity_policy: "affinity",
          },
          {
            name: "tier1vol",
            workspace: "smatzek-storage-test",
            pi_volume_size: "1",
            pi_volume_type: "tier1",
            count: null,
            storage_option: "Affinity",
            pi_volume_pool: null,
            affinity_type: "Instance",
            pi_affinity_volume: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_affinity_instance: "tier0vm",
            pi_replication_enabled: false,
            pi_volume_shareable: false,
            attachments: ["tier0vm"],
            pi_affinity_policy: "affinity",
          },
          {
            name: "tier0vol",
            workspace: "smatzek-storage-test",
            pi_volume_size: "1",
            pi_volume_type: "tier0",
            count: null,
            storage_option: "Affinity",
            pi_volume_pool: null,
            affinity_type: "Instance",
            pi_affinity_volume: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_affinity_instance: "tier0vm",
            pi_replication_enabled: false,
            pi_volume_shareable: false,
            attachments: ["tier0vm"],
            pi_affinity_policy: "affinity",
          },
        ],
        resource_groups: [
          {
            use_prefix: true,
            name: "powervs-coe",
            use_data: true,
          },
        ],
        routing_tables: [],
        scc: {
          credential_description: null,
          id: null,
          passphrase: null,
          name: "",
          location: "us",
          collector_description: null,
          is_public: false,
          scope_description: null,
          enable: false,
        },
        secrets_manager: [],
        security_groups: [],
        ssh_keys: [],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: null,
          name: "sysdig",
          platform_logs: false,
        },
        teleport_vsi: [],
        transit_gateways: [],
        virtual_private_endpoints: [],
        vpcs: [],
        vpn_gateways: [],
        vpn_servers: [],
        vsi: [],
        classic_ssh_keys: [],
        classic_vlans: [],
        vtl: [],
        classic_gateways: [],
        cis: [],
        scc_v2: {
          enable: false,
          resource_group: null,
          region: "",
          account_id: "${var.account_id}",
          profile_attachments: [],
        },
        cis_glbs: [],
        fortigate_vnf: [],
      });
      let expectedData = `##############################################################################
# Power VS Volume Tier 3vol
##############################################################################

resource "ibm_pi_volume" "smatzek_storage_test_volume_tier3vol" {
  provider               = ibm.power_vs_dal10
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_smatzek_storage_test.guid
  pi_volume_size         = 1
  pi_volume_name         = "\${var.prefix}-smatzek-storage-test-tier3vol"
  pi_volume_shareable    = false
  pi_replication_enabled = false
  pi_volume_type         = "tier3"
  pi_affinity_policy     = "affinity"
  pi_affinity_instance   = ibm_pi_instance.smatzek_storage_test_workspace_instance_tier0vm.instance_id
}

resource "ibm_pi_volume_attach" "smatzek_storage_test_attach_tier3vol_to_tier0vm_instance" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_smatzek_storage_test.guid
  pi_volume_id         = ibm_pi_volume.smatzek_storage_test_volume_tier3vol.volume_id
  pi_instance_id       = ibm_pi_instance.smatzek_storage_test_workspace_instance_tier0vm.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
}

##############################################################################

##############################################################################
# Power VS Volume Tier 1vol
##############################################################################

resource "ibm_pi_volume" "smatzek_storage_test_volume_tier1vol" {
  provider               = ibm.power_vs_dal10
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_smatzek_storage_test.guid
  pi_volume_size         = 1
  pi_volume_name         = "\${var.prefix}-smatzek-storage-test-tier1vol"
  pi_volume_shareable    = false
  pi_replication_enabled = false
  pi_volume_type         = "tier1"
  pi_affinity_policy     = "affinity"
  pi_affinity_instance   = ibm_pi_instance.smatzek_storage_test_workspace_instance_tier0vm.instance_id
}

resource "ibm_pi_volume_attach" "smatzek_storage_test_attach_tier1vol_to_tier0vm_instance" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_smatzek_storage_test.guid
  pi_volume_id         = ibm_pi_volume.smatzek_storage_test_volume_tier1vol.volume_id
  pi_instance_id       = ibm_pi_instance.smatzek_storage_test_workspace_instance_tier0vm.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.smatzek_storage_test_attach_tier3vol_to_tier0vm_instance
  ]
}

##############################################################################

##############################################################################
# Power VS Volume Tier 0vol
##############################################################################

resource "ibm_pi_volume" "smatzek_storage_test_volume_tier0vol" {
  provider               = ibm.power_vs_dal10
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_smatzek_storage_test.guid
  pi_volume_size         = 1
  pi_volume_name         = "\${var.prefix}-smatzek-storage-test-tier0vol"
  pi_volume_shareable    = false
  pi_replication_enabled = false
  pi_volume_type         = "tier0"
  pi_affinity_policy     = "affinity"
  pi_affinity_instance   = ibm_pi_instance.smatzek_storage_test_workspace_instance_tier0vm.instance_id
}

resource "ibm_pi_volume_attach" "smatzek_storage_test_attach_tier0vol_to_tier0vm_instance" {
  provider             = ibm.power_vs_dal10
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_smatzek_storage_test.guid
  pi_volume_id         = ibm_pi_volume.smatzek_storage_test_volume_tier0vol.volume_id
  pi_instance_id       = ibm_pi_instance.smatzek_storage_test_workspace_instance_tier0vm.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.smatzek_storage_test_attach_tier1vol_to_tier0vm_instance
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
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
          {
            zone: "dal12",
            pi_volume_size: 20,
            name: "test-volume2",
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
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
}

resource "ibm_pi_volume_attach" "example_attach_test_volume_to_instance_2_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_2.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.example_attach_test_volume_to_instance_1_instance
  ]
}

##############################################################################

##############################################################################
# Power VS Volume Test Volume 2
##############################################################################

resource "ibm_pi_volume" "example_volume_test_volume2" {
  provider               = ibm.power_vs_dal12
  pi_cloud_instance_id   = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_size         = 20
  pi_volume_name         = "\${var.prefix}-example-test-volume2"
  pi_volume_shareable    = true
  pi_replication_enabled = true
  pi_volume_type         = "tier1"
}

resource "ibm_pi_volume_attach" "example_attach_test_volume2_to_instance_1_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume2.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_1.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.example_attach_test_volume_to_instance_2_instance
  ]
}

resource "ibm_pi_volume_attach" "example_attach_test_volume2_to_instance_2_instance" {
  provider             = ibm.power_vs_dal12
  pi_cloud_instance_id = ibm_resource_instance.power_vs_workspace_example.guid
  pi_volume_id         = ibm_pi_volume.example_volume_test_volume2.volume_id
  pi_instance_id       = ibm_pi_instance.example_workspace_instance_instance_2.instance_id
  lifecycle {
    ignore_changes = [
      pi_cloud_instance_id,
      pi_volume_id
    ]
  }
  depends_on = [
    ibm_pi_volume_attach.example_attach_test_volume2_to_instance_1_instance
  ]
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
