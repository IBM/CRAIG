const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const {
  invalidPowerVsProcessorTextCallback,
  invalidPowerVsMemoryTextCallback,
} = require("../../../client/src/lib/state/power-vs-instances/power-instances-schema.js");

describe("power vs instances", () => {
  it("should be disabled when invalid duplicate power instance name", () => {
    let tempCraig = state();
    tempCraig.store = {
      json: {
        power_instances: [
          {
            name: "frog",
          },
          {
            name: "toad",
          },
        ],
      },
    };
    let actualData = disableSave(
      "power_instances",
      {
        name: "frog",
      },
      {
        data: {
          name: "egg",
        },
        craig: tempCraig,
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
        craig: state(),
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
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
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
        pi_storage_type: "good",
        network: [],
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
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
        pi_storage_type: "good",
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
        craig: state(),
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
        pi_storage_type: "good",
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
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid values but network ip address is invalid", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_type: "good",
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
        craig: state(),
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
        storage_option: "Storage Type",
        pi_storage_type: "",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when processors is an empty string", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when processors is not a number", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "oops",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when processors is invalid for non-dedicated, non-e980 instance", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_proc_type: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "16",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when processors is invalid for non-dedicated, e980 instance", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_proc_type: "good",
        pi_sys_type: "e980",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "`18`",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when processors is invalid for dedicated, non-e980 instance", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_proc_type: "dedicated",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "1.1",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when processors is invalid for dedicated, e980 instance", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_proc_type: "dedicated",
        pi_sys_type: "e980",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "1.1",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when memory is not a number", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "e980",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "7",
        pi_memory: "oops",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when invalid memory for e980 instance", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "e980",
        pi_health_status: "good",
        pi_storage_type: "good",
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
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when invalid memory for non-e980 instance", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "7",
        pi_memory: "1000",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when invalid memory for FalconStor VTL instance", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "7",
        pi_memory: "21",
        pi_license_repository_capacity: "3",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Storage Type` and pi_storage_type is empty string", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        storage_option: "Storage Type",
        pi_storage_type: "",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Storage Pool` and pi_storage_pool is empty string", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        storage_option: "Storage Pool",
        pi_storage_pool: "",
        network: [
          {
            name: "frog",
            ip_address: "",
          },
        ],
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Affinity` and no instance is selected", () => {
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
        pi_proc_type: "shared",
        pi_storage_type: null,
        storage_option: "Affinity",
        affinity_type: "Instance",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_instance: null,
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
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Affinity` and no volume is selected", () => {
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
        affinity_type: "Volume",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_instance: null,
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
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Anti-Affinity` and no instance is selected", () => {
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
        affinity_type: "Instance",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_instance: null,
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
        pi_storage_pool: null,
        pi_affinity_policy: "anti-affinity",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when storage type is `Anti-Affinity` and no volume is selected", () => {
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
        affinity_type: "Volume",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x128",
        pi_memory: "256",
        pi_processors: "4",
        ssh_key: "a",
        pi_affinity_instance: null,
        pi_affinity_volume: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        pi_sys_type: "e880",
        pi_storage_pool: null,
        pi_affinity_policy: "anti-affinity",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
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
        affinity_type: "Instance",
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
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should not be disabled when values are valid with storage option: storage type", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "good",
        pi_health_status: "good",
        storage_option: "Storage Type",
        pi_storage_type: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "4",
        pi_memory: "12",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });
  it("should not be disabled when values are valid with storage option: storage pool", () => {
    let actualData = disableSave(
      "power_instances",
      {
        name: "toad",
        workspace: "good",
        ssh_key: "good",
        image: "good",
        pi_sys_type: "e980",
        pi_health_status: "good",
        storage_option: "Storage Pool",
        pi_storage_pool: "good",
        network: [
          {
            name: "good",
            ip_address: "",
          },
        ],
        pi_processors: "4",
        pi_memory: "12",
      },
      {
        data: {
          name: "egg",
        },
        craig: state(),
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });
});
describe("invalidPowerVsProcessorTextCallback", () => {
  it("should return correct invalid processor text for a dedicated, e980 PowerVs Instance", () => {
    assert.deepEqual(
      invalidPowerVsProcessorTextCallback({
        pi_proc_type: "dedicated",
        pi_sys_type: "e980",
      }),
      "Must be a whole number between 1 and 17.",
      "it should return correct invalid text"
    );
  });
  it("should return correct invalid processor text for a dedicated, non-e980 PowerVs Instance", () => {
    assert.deepEqual(
      invalidPowerVsProcessorTextCallback({
        pi_proc_type: "dedicated",
      }),
      "Must be a whole number between 1 and 13.",
      "it should return correct invalid text"
    );
  });
  it("should return correct invalid processor text for a non-dedicated, e980 PowerVs Instance", () => {
    assert.deepEqual(
      invalidPowerVsProcessorTextCallback({
        pi_sys_type: "e980",
      }),
      "Must be a number between 0.25 and 17.",
      "it should return correct invalid text"
    );
  });
  it("should return correct invalid processor text for a non-dedicated, non-e980 PowerVs Instance", () => {
    assert.deepEqual(
      invalidPowerVsProcessorTextCallback({}),
      "Must be a number between 0.25 and 13.75.",
      "it should return correct invalid text"
    );
  });
});
describe("invalidPowerVsMemoryTextCallback", () => {
  it("should return correct invalid memory text for a e980 PowerVs Instance", () => {
    assert.deepEqual(
      invalidPowerVsMemoryTextCallback({
        pi_sys_type: "e980",
      }),
      "Must be a whole number between 2 and 15400.",
      "it should return correct invalid text"
    );
  });
  it("should return correct invalid memory text for a non-e980 PowerVs Instance", () => {
    assert.deepEqual(
      invalidPowerVsMemoryTextCallback({}),
      "Must be a whole number between 2 and 934.",
      "it should return correct invalid text"
    );
  });
  it("should return correct invalid memory text for a FalconStor VTL Instance", () => {
    assert.deepEqual(
      invalidPowerVsMemoryTextCallback({
        pi_license_repository_capacity: 3,
      }),
      "Must be a whole number between 2 and 934. For FalconStor VTL Instances, memory must be greater than or equal to 22.",
      "it should return correct invalid text"
    );
  });
});
