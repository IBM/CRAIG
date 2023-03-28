const { assert } = require("chai");
const { disableSave, invalidPort } = require("../../client/src/lib/forms");

describe("disableSave", () => {
  it("should return true if a resource group has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "resource_groups",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a key management instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "key_management",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a key management instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "key_management",
        { name: "aaa", use_data: false, resource_group: null },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                    resource_group: null,
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a object storage instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "object_storage",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                object_storage: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a secrets manager instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "secrets_manager",
        {
          name: "@@@",
          resource_group: "managment-rg",
          encryption_key: "key",
        },
        {
          craig: {
            store: {
              json: {
                secrets_manager: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a secrets manager instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "secrets_manager",
        { name: "frog", resource_group: null, use_data: false },
        {
          craig: {
            store: {
              json: {
                secrets_manager: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an appid instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "appid",
        {
          name: "@@@",
          resource_group: "managment-rg",
        },
        {
          craig: {
            store: {
              json: {
                appid: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if an appid instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "appid",
        { name: "frog", resource_group: null, use_data: false },
        {
          craig: {
            store: {
              json: {
                appid: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if an appid key has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "appid_key",
        {
          name: "@@@",
        },
        {
          craig: {
            store: {
              json: {
                appid: [
                  {
                    name: "frog",
                    keys: [],
                  },
                  {
                    name: "toad",
                    keys: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a secrets manager instance has an invalid encryption key", () => {
    assert.isTrue(
      disableSave(
        "secrets_manager",
        {
          name: "frog2",
          resource_group: "management-rg",
          encryption_key: null,
          use_data: false,
        },
        {
          craig: {
            store: {
              json: {
                secrets_manager: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a object storage instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "object_storage",
        { name: "aaa", use_data: false, resource_group: null },
        {
          craig: {
            store: {
              json: {
                object_storage: [
                  {
                    name: "frog",
                    resource_group: null,
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a object storage instance has an invalid kms instance", () => {
    assert.isTrue(
      disableSave(
        "object_storage",
        {
          name: "aaa",
          use_data: false,
          resource_group: "management-rg",
          kms: null,
        },
        {
          craig: {
            store: {
              json: {
                object_storage: [
                  {
                    name: "frog",
                    resource_group: null,
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an object storage bucket has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "buckets",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                object_storage: [
                  {
                    name: "frog",
                    buckets: [
                      {
                        name: "test",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an object storage bucket has an invalid encryption key name", () => {
    assert.isTrue(
      disableSave(
        "buckets",
        { name: "key", kms_key: null, use_data: false },
        {
          craig: {
            store: {
              json: {
                object_storage: [
                  {
                    name: "frog",
                    buckets: [
                      {
                        name: "test",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an object storage key has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "cos_keys",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                object_storage: [
                  {
                    name: "frog",
                    keys: [
                      {
                        name: "test",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an encryption key has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "encryption_keys",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                    keys: [
                      {
                        name: "test",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an encryption key has an invalid key ring name", () => {
    assert.isTrue(
      disableSave(
        "encryption_keys",
        { name: "key", key_ring: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                    keys: [
                      {
                        name: "test",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if atracker does not have bucket", () => {
    assert.isTrue(
      disableSave("atracker", {
        bucket: null,
      }),
      "it should be true"
    );
  });
  it("should return true if atracker does not have cos key", () => {
    assert.isTrue(
      disableSave("atracker", {
        bucket: "bucket",
        cos_key: null,
      }),
      "it should be true"
    );
  });
  it("should return true if atracker does not have any locations", () => {
    assert.isTrue(
      disableSave("atracker", {
        bucket: "bucket",
        cos_key: "key",
        locations: [],
      }),
      "it should be true"
    );
  });
  it("should return true if scc collector description invalid", () => {
    assert.isTrue(
      disableSave("scc", {
        collector_description: "",
      }),
      "it should be true"
    );
  });
  it("should return true if scc scope description invalid", () => {
    assert.isTrue(
      disableSave("scc", {
        collector_description: "words",
        scope_description: "",
      }),
      "it should be true"
    );
  });
  it("should return true if vpc does not have bucket", () => {
    assert.isTrue(
      disableSave("vpcs", {
        bucket: null,
      }),
      "it should be true"
    );
  });
  it("should return true if vpc does not have resource group", () => {
    assert.isTrue(
      disableSave("vpcs", {
        bucket: "bucket",
        resource_group: null,
      }),
      "it should be true"
    );
  });
  it("should return true if a vpc has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "vpcs",
        {
          name: "@@@",
          resource_group: "managment-rg",
          bucket: "bucket",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a vpc has an invalid default network acl name", () => {
    assert.isTrue(
      disableSave(
        "vpcs",
        {
          name: "aaa",
          default_network_acl_name: "@@@",
          resource_group: "managment-rg",
          bucket: "bucket",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                    acls: [],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a vpc has an invalid default security group name", () => {
    assert.isTrue(
      disableSave(
        "vpcs",
        {
          name: "aaa",
          default_network_acl_name: "aaa",
          default_security_group_name: "@@@",
          resource_group: "managment-rg",
          bucket: "bucket",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                    acls: [],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a vpc has an invalid default routing table name", () => {
    assert.isTrue(
      disableSave(
        "vpcs",
        {
          name: "aaa",
          default_network_acl_name: "aaa",
          default_security_group_name: "aaa",
          default_routing_table_name: "@@@",
          resource_group: "managment-rg",
          bucket: "bucket",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                    acls: [],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
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
          craig: {
            store: {
              resourceGroups: ["hi"],
              json: {
                ssh_keys: [{ name: "honk", public_key: "1234" }],
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
          resource_group: "",
          public_key:
            "ssh-rsAAAAB3NzaC1yc2thisisaninvalidsshkey... test@fakeemail.com",
        },
        {
          data: {
            data: "test",
          },
          craig: {
            store: {
              resourceGroups: ["hi"],
              json: {
                ssh_keys: [],
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
  it("should return true if tgw has invalid name", () => {
    assert.isTrue(
      disableSave(
        "transit_gateways",
        {
          name: "@@@",
          resource_group: "what",
          connections: [{ tgw: "@@@", vpc: "management" }],
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              vpcs: ["management"],
              json: {
                transit_gateways: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        },
        "it should return true"
      )
    );
  });
  it("should return true if a acl does not have a resource group", () => {
    assert.isTrue(
      disableSave(
        "acls",
        {
          name: "aaa",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                    acls: [],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a acl has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "acls",
        {
          name: "aaa",
          resource_group: "aaa",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if tgw with no rg", () => {
    assert.isTrue(
      disableSave(
        "transit_gateways",
        {
          name: "hi",
          resource_group: "",
          connections: [{ tgw: "hi", vpc: "management" }],
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              vpcs: ["management"],
              json: {
                transit_gateways: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return false if network order card", () => {
    assert.isFalse(
      disableSave(
        "acls",
        {
          name: "aaa",
          resource_group: "aaa",
        },
        {
          id: "frog",
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a acl rule has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "acl_rules",
        {
          name: "aaa",
        },
        {
          innerFormProps: {
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "frog",
                      acls: [
                        {
                          name: "frog",
                          rules: [
                            {
                              name: "frog",
                            },
                            {
                              name: "aaa",
                            },
                          ],
                        },
                        {
                          name: "aaa",
                        },
                      ],
                    },
                    {
                      name: "toad",
                      acls: [],
                    },
                  ],
                  security_groups: [],
                },
              },
            },
          },
          data: {
            name: "hi",
          },
          parent_name: "frog",
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if a acl rule in a modal has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "acl_rules",
        {
          name: "aaa",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "aaa",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          isModal: true,
          data: {
            name: "hi",
          },
          parent_name: "frog",
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if tgw enabled with no vpcs", () => {
    assert.isTrue(
      disableSave(
        "transit_gateways",
        {
          name: "hi",
          resource_group: "what",
          connections: [],
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                transit_gateways: [],
              },
            },
          },
          data: {
            name: "frog",
          },
          parent_name: "frog",
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a acl rule has an invalid source", () => {
    assert.isTrue(
      disableSave(
        "acl_rules",
        {
          name: "aaa",
          source: "fff",
        },
        {
          innerFormProps: {
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "frog",
                      acls: [
                        {
                          name: "frog",
                          rules: [
                            {
                              name: "frog",
                            },
                            {
                              name: "mmm",
                            },
                          ],
                        },
                        {
                          name: "aaa",
                        },
                      ],
                    },
                    {
                      name: "toad",
                      acls: [],
                    },
                  ],
                  security_groups: [],
                },
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if vpn gateway with invalid name", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "@@@",
          resource_group: "what",
          subnet: "hi",
          vpc: "hi",
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
          data: {
            name: "@@@",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if vpn gateway with no subnet", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "hi",
          resource_group: "what",
          subnet: "",
          vpc: "hi",
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if vpn gateway with no vpc", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "hi",
          resource_group: "what",
          subnet: "hi",
          vpc: "",
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if vpn gateway with no rg", () => {
    assert.isTrue(
      disableSave(
        "vpn_gateways",
        {
          name: "hi",
          resource_group: "",
          subnet: "hi",
          vpc: "hi",
        },
        {
          craig: {
            store: {
              resourceGroups: ["what"],
              json: {
                vpn_gateways: [],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if a acl rule has an invalid destination", () => {
    assert.isTrue(
      disableSave(
        "acl_rules",
        {
          name: "aaa",
          source: "1.2.3.4",
          destination: "fff",
        },
        {
          innerFormProps: {
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "frog",
                      acls: [
                        {
                          name: "frog",
                          rules: [
                            {
                              name: "frog",
                            },
                            {
                              name: "mmm",
                            },
                          ],
                        },
                        {
                          name: "aaa",
                        },
                      ],
                    },
                    {
                      name: "toad",
                      acls: [],
                    },
                  ],
                  security_groups: [],
                },
              },
            },
          },
          data: {
            name: "frog",
          },
          parent_name: "frog",
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a acl rule has an invalid port", () => {
    assert.isTrue(
      disableSave(
        "acl_rules",
        {
          name: "aaa",
          source: "1.2.3.4",
          destination: "1.2.3.4",
          ruleProtocol: "udp",
          rule: {
            source_port_max: -1,
          },
        },
        {
          innerFormProps: {
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "frog",
                      acls: [
                        {
                          name: "frog",
                          rules: [
                            {
                              name: "frog",
                            },
                            {
                              name: "mmm",
                            },
                          ],
                        },
                        {
                          name: "aaa",
                        },
                      ],
                    },
                    {
                      name: "toad",
                      acls: [],
                    },
                  ],
                  security_groups: [],
                },
              },
            },
          },
          data: {
            name: "frog",
          },
          parent_name: "frog",
        }
      ),
      "it should be true"
    );
  });
  it("should return true if subnet tier has invalid name", () => {
    assert.isTrue(
      disableSave(
        "subnetTier",
        { name: "frog" },
        {
          vpc_name: "test",
          data: {
            name: "todd",
          },
          craig: {
            store: {
              subnetTiers: {
                test: [
                  {
                    name: "frog",
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
  it("should return false if subnet tier has same name as props", () => {
    assert.isFalse(
      disableSave(
        "subnetTier",
        { name: "todd" },
        {
          vpc_name: "test",
          data: {
            name: "todd",
          },
          craig: {
            store: {
              subnetTiers: {
                test: [
                  {
                    name: "frog",
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
  it("should return true if subnet has invalid network acl", () => {
    assert.isTrue(
      disableSave("subnet", { network_acl: null }),
      "it should be true"
    );
  });
  it("should return true if a security group has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "security_groups",
        {
          name: "@@@",
        },
        {
          craig: {
            store: {
              json: {
                security_groups: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a security group has an invalid rg", () => {
    assert.isTrue(
      disableSave(
        "security_groups",
        {
          name: "aaa",
          resource_group: null,
        },
        {
          craig: {
            store: {
              json: {
                security_groups: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a security group has an invalid vpc", () => {
    assert.isTrue(
      disableSave(
        "security_groups",
        {
          name: "aaa",
          resource_group: "null",
          vpc: null,
        },
        {
          craig: {
            store: {
              json: {
                security_groups: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if security group rule has invalid name", () => {
    assert.isTrue(
      disableSave(
        "sg_rules",
        {
          name: "@@@",
        },
        { innerFormProps: { rules: [] }, data: { name: "" } }
      )
    );
  });
  it("should return true if security group rule has invalid source", () => {
    assert.isTrue(
      disableSave(
        "sg_rules",
        { name: "aa", source: "mm" },
        { innerFormProps: { rules: [] }, data: { name: "" } }
      )
    );
  });
  it("should return true if security group rule has invalid port", () => {
    assert.isTrue(
      disableSave(
        "sg_rules",
        {
          name: "aa",
          source: "1.2.3.4",
          ruleProtocol: "udp",
          rule: {
            port_min: -1,
            port_max: null,
          },
        },
        { innerFormProps: { rules: [{ name: "ff" }] }, data: { name: "aa" } }
      )
    );
  });
  it("should return true if security group rule has invalid name in modal", () => {
    assert.isTrue(
      disableSave(
        "sg_rules",
        { name: "@@@" },
        { rules: [], data: { name: "" }, isModal: true }
      )
    );
  });
  it("should return true if iam_account_settings mfa invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        { mfa: null },
        { rules: [], data: { name: "" }, isModal: true }
      )
    );
  });
  it("should return true if iam_account_settings restrict_create_platform_apikey invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        { mfa: "1", restrict_create_platform_apikey: null },
        { rules: [], data: { name: "" }, isModal: true }
      )
    );
  });
  it("should return true if iam_account_settings restrict_create_service_id invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "1",
          restrict_create_platform_apikey: "null",
          restrict_create_service_id: null,
        },
        { rules: [], data: { name: "" }, isModal: true }
      )
    );
  });
  it("should return true if iam_account_settings max_sessions_per_identity invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "1",
          restrict_create_platform_apikey: "null",
          restrict_create_service_id: "null",
          max_sessions_per_identity: null,
        },
        { rules: [], data: { name: "" }, isModal: true }
      )
    );
  });
  it("should return true if a cluster has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "@@@",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "toad",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster is openshift and has no cos", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "toad2",
          kube_type: "openshift",
          cos: null,
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster is openshift and has cos but invalid subnets", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "toad2",
          kube_type: "openshift",
          cos: "cos",
          wokrers_per_subnet: 1,
          subnets: [],
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster worker pool has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "worker_pools",
        {
          name: "a",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "a",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "a",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster worker pool has no flavor", () => {
    assert.isTrue(
      disableSave(
        "worker_pools",
        {
          name: "aaaa",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "toad",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "aaaa",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster worker pool has no subnets", () => {
    assert.isTrue(
      disableSave(
        "worker_pools",
        {
          name: "toad",
          flavor: "spicy",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "toad",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster worker pool has empty subnets", () => {
    assert.isTrue(
      disableSave(
        "worker_pools",
        {
          name: "aaa",
          flavor: "spicy",
          subnets: [],
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "toad",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should otherwise return false", () => {
    assert.isFalse(disableSave("pretend_field", {}, {}), "it should be false");
  });
  describe("invalidPort", () => {
    it("should return false if rule protocol all", () => {
      assert.isFalse(
        invalidPort({
          ruleProtocol: "all",
        }),
        "it should be false"
      );
    });
    it("should return true if rule protocol is icmp and invalid field", () => {
      assert.isTrue(
        invalidPort({
          ruleProtocol: "icmp",
          rule: {
            code: 10000,
          },
        }),
        "it should be false"
      );
    });
    it("should return true if rule protocol is not icmp and invalid field", () => {
      assert.isTrue(
        invalidPort({
          ruleProtocol: "udp",
          rule: {
            port_min: 1000000,
          },
        }),
        "it should be false"
      );
    });
    it("should return true if rule protocol is not icmp and invalid field and security group", () => {
      assert.isTrue(
        invalidPort(
          {
            ruleProtocol: "udp",
            rule: {
              port_min: 1000000,
            },
          },
          true
        ),
        "it should be false"
      );
    });
  });
});
