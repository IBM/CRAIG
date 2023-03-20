const { assert } = require("chai");
const { disableSave } = require("../../client/src/lib/forms");

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
            name: "hi",
          },
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
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should otherwise return false", () => {
    assert.isFalse(disableSave("pretend_field", {}, {}), "it should be false");
  });
});
