const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("power vs instances", () => {
  it("should be disabled when invalid duplicate power instance name", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid name and no workspace", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid name and workspace but no ssh key", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid values but empty network", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "good",
        network: [],
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid values but invalid network ip", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "good",
        network: [
          {
            name: "good",
            ip_address: "bad",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid values but invalid network ip is cidr block", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "good",
        pi_memory: "256",
        network: [
          {
            name: "good",
            ip_address: "ssss",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid values but invalid network ip is invalid ip", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "good",
        network: [
          {
            name: "good",
            ip_address: "999999.10.10.10000",
          },
          {
            name: "good",
            ip_address: "300.10.300.10000",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid values but no storage type", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "",
        network: [
          {
            name: "good",
            ip_address: "1.3.4.5",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should not be disabled when processors is invalid", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "8",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Storage Type` and pi_storage_type is empty string", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
        workspace: "workspace",
        image: "7100-05-09",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "",
        storage_option: "Storage Type",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Storage Pool` and pi_storage_type is empty string", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
        workspace: "workspace",
        image: "7100-05-09",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "",
        storage_option: "Storage Pool",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
        pi_storage_pool: null,
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Affinity` and no instance or volume is selected", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
        workspace: "workspace",
        image: "7100-05-09",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: null,
        storage_option: "Affinity",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
        pi_storage_pool: null,
        pi_affinity_policy: "affinity",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Affinity` and no instance or volume is selected", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
        workspace: "workspace",
        image: "7100-05-09",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: null,
        storage_option: "Affinity",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
        pi_storage_pool: null,
        pi_affinity_policy: "affinity",
        pi_affinity_instance: null,
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Affinity` and no instance or volume is selected", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
        workspace: "workspace",
        image: "7100-05-09",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: null,
        storage_option: "Anti-Affinity",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
        pi_storage_pool: null,
        pi_affinity_policy: "affinity",
        pi_affinity_instance: null,
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should not be disabled when storage type is `Affinity` and instance or volume is selected", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
        workspace: "workspace",
        image: "7100-05-09",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: null,
        storage_option: "Affinity",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
        pi_storage_pool: null,
        pi_affinity_policy: "affinity",
        pi_affinity_instance: "selected",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [],
            },
          },
        },
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });
  it("should be disabled when processors is not a number", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
        workspace: "workspace",
        image: "7100-05-09",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
        zone: "dal12",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        storage_option: "Storage Type",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "oops",
        ssh_key: "a",
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should not be disabled when invalid memory", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "7",
        pi_memory: "0",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should not be disabled when ip address is empty string", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_tier: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "7",
        pi_memory: "12",
      },
      {
        data: {
          name: "egg",
        },
        craig: {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });
});
