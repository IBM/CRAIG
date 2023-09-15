const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("power", () => {
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
