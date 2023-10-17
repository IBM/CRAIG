const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("power", () => {
  it("should be disabled when invalid power workspace name", () => {
    let actualData = disableSave(
      "power",
      {
        name: "@@@",
        ssh_keys: [],
        imageNames: [],
      },
      {
        arrayParentName: "workspace",
        craig: {
          store: {
            json: {
              power: [
                {
                  name: "workspace",
                  ssh_keys: [],
                  imageNames: [],
                },
              ],
            },
          },
        },
        data: {
          name: "test",
          ssh_keys: [],
          imageNames: [],
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when valid power workspace name and image maps is not found", () => {
    let actualData = disableSave(
      "power",
      {
        name: "aaa",
        ssh_keys: [],
      },
      {
        arrayParentName: "workspace",
        craig: {
          store: {
            json: {
              power: [
                {
                  name: "workspace",
                  ssh_keys: [],
                  imageNames: [],
                },
              ],
            },
          },
        },
        data: {
          name: "test",
          ssh_keys: [],
          imageNames: [],
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when invalid duplicate power workspace name", () => {
    let actualData = disableSave(
      "power",
      {
        name: "workspace",
        ssh_keys: [],
      },
      {
        arrayParentName: "workspace",
        data: {
          name: "test",
          ssh_keys: [],
          imageNames: [],
        },
        craig: {
          store: {
            json: {
              power: [
                {
                  name: "workspace",
                },
                {
                  name: "test",
                },
              ],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when no images selected for workspace", () => {
    let actualData = disableSave(
      "power",
      {
        name: "workspace",
        imageNames: [],
        ssh_keys: [],
      },
      {
        arrayParentName: "workspace",
        craig: {
          store: {
            json: {
              power: [
                {
                  name: "workspace",
                  imageNames: ["7200-05-05"],
                },
              ],
            },
          },
        },
        data: {
          name: "test",
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be not be disabled when everything is valid", () => {
    let actualData = disableSave(
      "power",
      {
        name: "workspace",
        ssh_keys: [
          {
            name: "power-ssh",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
            use_data: false,
            resource_group: "management-rg",
            workspace: "oracle-template",
            zone: "dal12",
          },
        ],
        imageNames: ["7200-05-05"],
      },
      {
        arrayParentName: "workspace",
        craig: {
          store: {
            json: {
              power: [
                {
                  name: "workspace",
                  ssh_keys: [
                    {
                      name: "power-ssh",
                      public_key: "good",
                      use_data: false,
                      resource_group: "management-rg",
                      workspace: "oracle-template",
                      zone: "dal12",
                    },
                  ],
                  imageNames: ["7200-05-05"],
                },
              ],
            },
          },
        },
        data: {
          name: "workspace",
          ssh_keys: [],
          imageNames: [],
        },
      }
    );
    assert.isFalse(actualData, "it should be disabled");
  });
  describe("network", () => {
    it("should be disabled when invalid duplicate power network name", () => {
      let actualData = disableSave(
        "network",
        {
          name: "frog",
        },
        {
          arrayParentName: "workspace",
          data: {
            name: "toad",
          },
          craig: {
            store: {
              json: {
                power: [
                  {
                    name: "workspace",
                    network: [
                      {
                        name: "frog",
                      },
                      {
                        name: "horse",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid power cidr", () => {
      let actualData = disableSave(
        "network",
        {
          name: "egg",
          pi_cidr: "aaa",
        },
        {
          arrayParentName: "workspace",
          data: {
            name: "toad",
          },
          craig: {
            store: {
              json: {
                power: [
                  {
                    name: "workspace",
                    network: [
                      {
                        name: "frog",
                      },
                      {
                        name: "horse",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when invalid power dns ip", () => {
      let actualData = disableSave(
        "network",
        {
          name: "egg",
          pi_cidr: "10.10.10.10/10",
          pi_dns: ["aaa"],
        },
        {
          arrayParentName: "workspace",
          data: {
            name: "toad",
          },
          craig: {
            store: {
              json: {
                power: [
                  {
                    name: "workspace",
                    network: [
                      {
                        name: "frog",
                      },
                      {
                        name: "horse",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be not be disabled when everything is valid", () => {
      let actualData = disableSave(
        "network",
        {
          name: "egg",
          pi_cidr: "10.10.10.10/24",
          pi_dns: ["10.02.03.04"],
        },
        {
          arrayParentName: "workspace",
          data: {
            name: "toad",
          },
          craig: {
            store: {
              json: {
                power: [
                  {
                    name: "workspace",
                    network: [
                      {
                        name: "frog",
                      },
                      {
                        name: "horse",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      );
      assert.isFalse(actualData, "it should be disabled");
    });
  });
  describe("cloud_connections", () => {
    it("should be disabled when invalid duplicate power connection name", () => {
      let actualData = disableSave(
        "cloud_connections",
        {
          name: "frog",
        },
        {
          arrayParentName: "workspace",
          data: {
            name: "toad",
          },
          craig: {
            store: {
              json: {
                power: [
                  {
                    name: "workspace",
                    cloud_connections: [
                      {
                        name: "frog",
                      },
                      {
                        name: "horse",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when transit gateway is true but no gatways selected", () => {
      let actualData = disableSave(
        "cloud_connections",
        {
          name: "pizza",
          pi_cloud_connection_transit_enabled: true,
          transit_gateways: [],
        },
        {
          arrayParentName: "workspace",
          data: {
            name: "toad",
          },
          craig: {
            store: {
              json: {
                power: [
                  {
                    name: "workspace",
                    cloud_connections: [
                      {
                        name: "frog",
                      },
                      {
                        name: "egg",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
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
  });
  describe("power vs ssh keys", () => {
    it("should return true when the ssh key name already exists", () => {
      assert.isTrue(
        disableSave(
          "ssh_keys",
          {
            name: "honk",
            resource_group: "hi",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            data: {
              data: "test",
            },
            arrayParentName: "workspace",
            craig: {
              store: {
                resourceGroups: ["hi"],
                json: {
                  ssh_keys: [],
                  power: [
                    {
                      name: "workspace",
                      ssh_keys: [
                        {
                          name: "honk",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true when the ssh key has no rg", () => {
      assert.isTrue(
        disableSave(
          "ssh_keys",
          {
            name: "honk",
            resource_group: null,
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            data: {
              data: "test",
            },
            arrayParentName: "workspace",
            craig: {
              store: {
                resourceGroups: ["hi"],
                json: {
                  ssh_keys: [],
                  power: [
                    {
                      name: "workspace",
                      ssh_keys: [
                        {
                          name: "ddd",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true when the public key value already exists", () => {
      assert.isTrue(
        disableSave(
          "ssh_keys",
          {
            name: "test",
            resource_group: "hi",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            data: {
              data: "test",
            },
            arrayParentName: "workspace",
            craig: {
              store: {
                resourceGroups: ["hi"],
                json: {
                  ssh_keys: [
                    {
                      name: "honk",
                      public_key:
                        "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                    },
                  ],
                  power: [
                    {
                      name: "workspace",
                      ssh_keys: [
                        {
                          name: "ddd",
                          public_key:
                            "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should not check invalidSshKey when using data", () => {
      assert.isFalse(
        disableSave(
          "ssh_keys",
          {
            name: "test",
            resource_group: "hi",
            public_key: "honk",
            use_data: true,
          },
          {
            data: {
              data: "test",
            },
            craig: {
              store: {
                resourceGroups: ["hi"],
                json: {
                  ssh_keys: [
                    {
                      name: "honk",
                      public_key:
                        "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
});
