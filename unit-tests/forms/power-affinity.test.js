const { assert } = require("chai");
const { storageChangeDisabledCallback } = require("../../client/src/lib");

describe("storageChangeDisabledCallback", () => {
  it("should be true for an instance when it is used by another instance for affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "oracle-1",
        workspace: "oracle-template",
        image: "7300-00-01",
        network: [
          {
            name: "oracle-private-1",
            ip_address: "",
          },
          {
            name: "oracle-private-2",
            ip_address: "",
          },
          {
            name: "oracle-public",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        ssh_key: "power-ssh",
        pi_processors: "2",
        pi_memory: "32",
        pi_sys_type: "s922",
        storage_option: "Storage Type",
        affinity_type: null,
        pi_storage_pool_affinity: true,
      },
      {
        power_volumes: [],
        data: {
          name: "oracle-1",
          workspace: "oracle-template",
          image: "7300-00-01",
          network: [
            {
              name: "oracle-private-1",
              ip_address: "",
            },
            {
              name: "oracle-private-2",
              ip_address: "",
            },
            {
              name: "oracle-public",
              ip_address: "",
            },
          ],
          zone: "dal12",
          pi_health_status: "OK",
          pi_proc_type: "shared",
          pi_storage_type: "tier1",
          ssh_key: "power-ssh",
          pi_processors: "2",
          pi_memory: "32",
          pi_sys_type: "s922",
          storage_option: "Storage Type",
          affinity_type: null,
          pi_storage_pool_affinity: true,
        },
        power_instances: [
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
          {
            name: "oracle-2",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: null,
            ssh_key: "power-ssh",
            pi_sys_type: "s922",
            pi_processors: "2",
            pi_memory: "32",
            storage_option: "Affinity",
            affinity_type: "Instance",
            pi_storage_pool_affinity: true,
            pi_storage_pool: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_affinity_policy: "affinity",
            pi_affinity_instance: "oracle-1",
          },
        ],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should be true for an instance when it is used by another instance for anti-affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "oracle-1",
        workspace: "oracle-template",
        image: "7300-00-01",
        network: [
          {
            name: "oracle-private-1",
            ip_address: "",
          },
          {
            name: "oracle-private-2",
            ip_address: "",
          },
          {
            name: "oracle-public",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        ssh_key: "power-ssh",
        pi_processors: "2",
        pi_memory: "32",
        pi_sys_type: "s922",
        storage_option: "Storage Type",
        affinity_type: null,
        pi_storage_pool_affinity: true,
      },
      {
        power_volumes: [],
        data: {
          name: "oracle-1",
          workspace: "oracle-template",
          image: "7300-00-01",
          network: [
            {
              name: "oracle-private-1",
              ip_address: "",
            },
            {
              name: "oracle-private-2",
              ip_address: "",
            },
            {
              name: "oracle-public",
              ip_address: "",
            },
          ],
          zone: "dal12",
          pi_health_status: "OK",
          pi_proc_type: "shared",
          pi_storage_type: "tier1",
          ssh_key: "power-ssh",
          pi_processors: "2",
          pi_memory: "32",
          pi_sys_type: "s922",
          storage_option: "Storage Type",
          affinity_type: null,
          pi_storage_pool_affinity: true,
        },
        power_instances: [
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
          {
            name: "oracle-2",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: null,
            ssh_key: "power-ssh",
            pi_sys_type: "s922",
            pi_processors: "2",
            pi_memory: "32",
            storage_option: "Anti-Affinity",
            affinity_type: "Instance",
            pi_storage_pool_affinity: true,
            pi_storage_pool: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: "oracle-1",
            pi_affinity_policy: "anti-affinity",
            pi_affinity_instance: null,
            pi_affinity_volume: null,
          },
        ],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should be true for an instance when it is used by a volume for affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "oracle-1",
        workspace: "oracle-template",
        image: "7300-00-01",
        network: [
          {
            name: "oracle-private-1",
            ip_address: "",
          },
          {
            name: "oracle-private-2",
            ip_address: "",
          },
          {
            name: "oracle-public",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        ssh_key: "power-ssh",
        pi_processors: "2",
        pi_memory: "32",
        pi_sys_type: "s922",
        storage_option: "Storage Type",
        affinity_type: null,
        pi_storage_pool_affinity: true,
      },
      {
        data: {
          name: "oracle-1",
          workspace: "oracle-template",
          image: "7300-00-01",
          network: [
            {
              name: "oracle-private-1",
              ip_address: "",
            },
            {
              name: "oracle-private-2",
              ip_address: "",
            },
            {
              name: "oracle-public",
              ip_address: "",
            },
          ],
          zone: "dal12",
          pi_health_status: "OK",
          pi_proc_type: "shared",
          pi_storage_type: "tier1",
          ssh_key: "power-ssh",
          pi_processors: "2",
          pi_memory: "32",
          pi_sys_type: "s922",
          storage_option: "Storage Type",
          affinity_type: null,
          pi_storage_pool_affinity: true,
        },
        power_instances: [
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
        ],
        power_volumes: [
          {
            name: "oracle-1-db-1",
            workspace: "oracle-template",
            pi_volume_shareable: false,
            pi_replication_enabled: false,
            pi_volume_type: null,
            attachments: ["oracle-1"],
            zone: "dal12",
            pi_volume_size: "90",
            storage_option: "Affinity",
            affinity_type: "Instance",
            pi_storage_pool: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_affinity_policy: "affinity",
            pi_affinity_instance: "oracle-1",
          },
        ],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should be true for an instance when it is used by a volume for anti-affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "oracle-1",
        workspace: "oracle-template",
        image: "7300-00-01",
        network: [
          {
            name: "oracle-private-1",
            ip_address: "",
          },
          {
            name: "oracle-private-2",
            ip_address: "",
          },
          {
            name: "oracle-public",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        ssh_key: "power-ssh",
        pi_processors: "2",
        pi_memory: "32",
        pi_sys_type: "s922",
        storage_option: "Storage Type",
        affinity_type: null,
        pi_storage_pool_affinity: true,
      },
      {
        data: {
          name: "oracle-1",
          workspace: "oracle-template",
          image: "7300-00-01",
          network: [
            {
              name: "oracle-private-1",
              ip_address: "",
            },
            {
              name: "oracle-private-2",
              ip_address: "",
            },
            {
              name: "oracle-public",
              ip_address: "",
            },
          ],
          zone: "dal12",
          pi_health_status: "OK",
          pi_proc_type: "shared",
          pi_storage_type: "tier1",
          ssh_key: "power-ssh",
          pi_processors: "2",
          pi_memory: "32",
          pi_sys_type: "s922",
          storage_option: "Storage Type",
          affinity_type: null,
          pi_storage_pool_affinity: true,
        },
        power_instances: [
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_storage_pool_affinity: true,
          },
        ],
        power_volumes: [
          {
            name: "oracle-1-db-1",
            workspace: "oracle-template",
            pi_volume_shareable: false,
            pi_replication_enabled: false,
            pi_volume_type: null,
            attachments: ["oracle-1"],
            zone: "dal12",
            pi_volume_size: "90",
            storage_option: "Affinity",
            affinity_type: "Instance",
            pi_storage_pool: null,
            pi_anti_affinity_volume: null,
            pi_affinity_instance: null,
            pi_affinity_policy: "affinity",
            pi_anti_affinity_instance: "oracle-1",
          },
        ],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should be true for a volume when it is used by an instance for affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "redo-1",
        workspace: "oracle-template",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier1",
        attachments: ["oracle-1", "oracle-2"],
        zone: "dal12",
        pi_volume_size: "50",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        power_volumes: [],
        data: {
          name: "redo-1",
          workspace: "oracle-template",
          pi_volume_shareable: true,
          pi_replication_enabled: false,
          pi_volume_type: "tier1",
          attachments: ["oracle-1", "oracle-2"],
          zone: "dal12",
          pi_volume_size: "50",
          storage_option: "Storage Type",
          affinity_type: null,
        },
        power_instances: [
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: null,
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Affinity",
            affinity_type: "Volume",
            pi_storage_pool_affinity: true,
            pi_storage_pool: null,
            pi_anti_affinity_volume: null,
            pi_anti_affinity_instance: null,
            pi_affinity_policy: "affinity",
            pi_affinity_volume: "redo-1",
          },
        ],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should be true for a volume when it is used by an instance for anti-affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "redo-1",
        workspace: "oracle-template",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier1",
        attachments: ["oracle-1", "oracle-2"],
        zone: "dal12",
        pi_volume_size: "50",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        power_volumes: [],
        data: {
          name: "redo-1",
          workspace: "oracle-template",
          pi_volume_shareable: true,
          pi_replication_enabled: false,
          pi_volume_type: "tier1",
          attachments: ["oracle-1", "oracle-2"],
          zone: "dal12",
          pi_volume_size: "50",
          storage_option: "Storage Type",
          affinity_type: null,
        },
        power_instances: [
          {
            name: "oracle-1",
            workspace: "oracle-template",
            image: "7300-00-01",
            network: [
              {
                name: "oracle-private-1",
                ip_address: "",
              },
              {
                name: "oracle-private-2",
                ip_address: "",
              },
              {
                name: "oracle-public",
                ip_address: "",
              },
            ],
            zone: "dal12",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: null,
            ssh_key: "power-ssh",
            pi_processors: "2",
            pi_memory: "32",
            pi_sys_type: "s922",
            storage_option: "Affinity",
            affinity_type: "Volume",
            pi_storage_pool_affinity: true,
            pi_storage_pool: null,
            pi_anti_affinity_volume: "redo-1",
            pi_anti_affinity_instance: null,
            pi_affinity_policy: "affinity",
            pi_affinity_volume: null,
          },
        ],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should be true for a volume when it is used by another volume for anti-affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "redo-1",
        workspace: "oracle-template",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier1",
        attachments: ["oracle-1", "oracle-2"],
        zone: "dal12",
        pi_volume_size: "50",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        power_volumes: [
          {
            name: "dev",
            workspace: "oracle-template",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier1",
            attachments: ["oracle-1", "oracle-2"],
            zone: "dal12",
            pi_volume_size: "50",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_anti_affinity_volume: "redo-1",
          },
        ],
        data: {
          name: "redo-1",
          workspace: "oracle-template",
          pi_volume_shareable: true,
          pi_replication_enabled: false,
          pi_volume_type: "tier1",
          attachments: ["oracle-1", "oracle-2"],
          zone: "dal12",
          pi_volume_size: "50",
          storage_option: "Storage Type",
          affinity_type: null,
        },
        power_instances: [],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should be true for a volume when it is used by another volume for affinity", () => {
    let actualData = storageChangeDisabledCallback(
      {
        name: "redo-1",
        workspace: "oracle-template",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier1",
        attachments: ["oracle-1", "oracle-2"],
        zone: "dal12",
        pi_volume_size: "50",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        power_volumes: [
          {
            name: "dev",
            workspace: "oracle-template",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier1",
            attachments: ["oracle-1", "oracle-2"],
            zone: "dal12",
            pi_volume_size: "50",
            storage_option: "Storage Type",
            affinity_type: null,
            pi_affinity_volume: "redo-1",
          },
        ],
        data: {
          name: "redo-1",
          workspace: "oracle-template",
          pi_volume_shareable: true,
          pi_replication_enabled: false,
          pi_volume_type: "tier1",
          attachments: ["oracle-1", "oracle-2"],
          zone: "dal12",
          pi_volume_size: "50",
          storage_option: "Storage Type",
          affinity_type: null,
        },
        power_instances: [],
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
});
