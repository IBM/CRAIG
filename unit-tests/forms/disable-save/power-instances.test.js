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
        network: [
          {
            name: "good",
            ip_address: "/",
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
        pi_memory: "100000",
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
