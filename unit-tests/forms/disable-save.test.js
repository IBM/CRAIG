const { assert } = require("chai");
const {
  disableSave,
  invalidPort,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
} = require("../../client/src/lib");

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
  describe("key management", () => {
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
  });
  describe("secrets manager", () => {
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
  });
  describe("access groups", () => {
    it("should return true if an access group has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "access_groups",
          { name: "@@@", description: "" },
          {
            craig: {
              store: {
                json: {
                  access_groups: [
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
        "it should be true"
      );
    });
    it("should return true if an access group policy has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "policies",
          {
            name: "@@@",
            resources: {
              resource_group: "service-rg",
              resource_type: "b",
              resource: "b",
              service: "b",
              resource_instance_id: "b",
            },
          },
          {
            craig: {
              store: {
                json: {
                  access_groups: [
                    {
                      name: "frog",
                      policies: [
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
        "it should be true"
      );
    });
    it("should return true if an access group policy has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "policies",
          { name: "@@@" },
          {
            craig: {
              store: {
                json: {
                  access_groups: [
                    {
                      name: "frog",
                      policies: [
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
        "it should be true"
      );
    });
    it("should return true if an access group dynamic policy has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "dynamic_policies",
          {
            name: "@@@",
            identity_provider: "http://identity",
            expiration: 1,
            conditions: {
              claim: "c",
              operator: "",
              value: "c",
            },
          },
          {
            craig: {
              store: {
                json: {
                  access_groups: [
                    {
                      name: "frog",
                      dynamic_policies: [
                        {
                          name: "@@@",
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
        "it should be true"
      );
    });
    it("should return true if an access group dynamic policy has an invalid identity provider URI", () => {
      assert.isTrue(
        disableSave(
          "dynamic_policies",
          {
            name: "policy",
            identity_provider: "@@@",
            expiration: 1,
            conditions: {
              claim: "c",
              operator: "",
              value: "c",
            },
          },
          {
            craig: {
              store: {
                json: {
                  access_groups: [
                    {
                      name: "frog",
                      dynamic_policies: [
                        {
                          name: "@@@",
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
        "it should be true"
      );
    });
  });
  describe("appid", () => {
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
  });
  describe("icd", () => {
    it("should return true if a database instance has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "@@@",
            resource_group: "managment-rg",
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
    it("should return true if a database instance has an duplicate name", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "toad",
            resource_group: "managment-rg",
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
    it("should return true if a database instance has an invalid resource group", () => {
      assert.isTrue(
        disableSave(
          "icd",
          { name: "frog", resource_group: null, use_data: false },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
    it("should return true if a database instance has an invalid service", () => {
      assert.isTrue(
        disableSave(
          "icd",
          { name: "frog", resource_group: "managment-rg", service: null },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
    it("should return true if a database instance has a non-whole number memory input", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "frog",
            resource_group: "managment-rg",
            memory: 1.1,
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
            memoryMin: 1,
            memoryMax: 112,
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a database instance has an invalid integer memory input", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "frog",
            resource_group: "managment-rg",
            memory: -100,
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
            memoryMin: 1,
            memoryMax: 112,
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a database instance has a non-whole number disk input", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "frog",
            resource_group: "managment-rg",
            memory: 100,
            disk: 1.1,
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
            memoryMin: 1,
            memoryMax: 112,
            diskMin: 5,
            diskMax: 4096,
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a database instance has an invalid integer disk input", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "frog",
            resource_group: "managment-rg",
            memory: 100,
            disk: 2,
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
            memoryMin: 1,
            memoryMax: 112,
            diskMin: 5,
            diskMax: 4096,
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a database instance has a non-whole number cpu input", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "frog",
            resource_group: "managment-rg",
            memory: 100,
            disk: 100,
            cpu: 1.1,
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
            memoryMin: 1,
            memoryMax: 112,
            diskMin: 5,
            diskMax: 4096,
            cpuMin: 0,
            cpuMax: 28,
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a database instance has an invalid integer cpu input", () => {
      assert.isTrue(
        disableSave(
          "icd",
          {
            name: "frog",
            resource_group: "managment-rg",
            memory: 100,
            disk: 100,
            cpu: -100,
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
            memoryMin: 1,
            memoryMax: 112,
            diskMin: 5,
            diskMax: 4096,
            cpuMin: 0,
            cpuMax: 28,
          }
        ),
        "it should be true"
      );
    });
    it("should return false otherwise", () => {
      assert.isFalse(
        disableSave(
          "icd",
          {
            name: "test",
            resource_group: "managment-rg",
            use_data: false,
            plan: "standard",
            kms: null,
            encryption_key: null,
            service: "databases-for-postgresql",
            group_id: "member",
            memory: "",
            disk: "",
            cpu: 0,
          },
          {
            craig: {
              store: {
                json: {
                  icd: [
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
            cpuMin: 3,
            cpuMax: 28,
          }
        ),
        "it should be false"
      );
    });
  });
  describe("object storage", () => {
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
  });
  describe("atracker", () => {
    it("should return false if atracker is not enabled", () => {
      assert.isFalse(
        disableSave("atracker", {
          enabled: false,
        }),
        "it should be false"
      );
    });
    it("should return true if atracker does not have bucket", () => {
      assert.isTrue(
        disableSave("atracker", {
          enabled: true,
          bucket: null,
        }),
        "it should be true"
      );
    });
    it("should return true if atracker does not have cos key", () => {
      assert.isTrue(
        disableSave("atracker", {
          enabled: true,
          bucket: "bucket",
          cos_key: null,
        }),
        "it should be true"
      );
    });
    it("should return true if atracker does not have any locations", () => {
      assert.isTrue(
        disableSave("atracker", {
          enabled: true,
          bucket: "bucket",
          cos_key: "key",
          locations: [],
        }),
        "it should be true"
      );
    });
  });
  describe("scc", () => {
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
  });
  describe("vpc", () => {
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
  });
  describe("ssh keys", () => {
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
  describe("tgw", () => {
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
    it("should return false if tgw enabled with direct crn connections", () => {
      assert.isFalse(
        disableSave(
          "transit_gateways",
          {
            name: "hi",
            resource_group: "what",
            connections: [
              {
                tgw: "hi",
                crn: "crn:v1:bluemix:public:is:us-east:a/cdefe6d99f7ea459aacb25775fb88a33::vpc:r014-b4d7e79b-32fc-4625-a7e5-46b71b61ed55",
              },
            ],
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
        "it should be false"
      );
    });
  });
  describe("acls", () => {
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
  });
  describe("vpn gateway", () => {
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
  });
  describe("subnets", () => {
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
          { name: "todd", advanced: false },
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
    it("should return true if advanced subnet tier has no zones", () => {
      assert.isTrue(
        disableSave(
          "subnetTier",
          {
            name: "todd",
            advanced: true,
            network_acl: "frog",
            select_zones: [],
          },
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
        disableSave("subnet", { network_acl: null }, {}),
        "it should be true"
      );
    });
    it("should return true if advanced subnet tier has invalid cidr", () => {
      assert.isTrue(
        disableSave("subnet", { tier: "frog", cidr: "aaaa" }, {}),
        "it should be true"
      );
    });
    it("should return true if advanced subnet tier has invalid cidr block (overlapping ok)", () => {
      assert.isTrue(
        disableSave("subnet", { tier: "frog", cidr: "1.2.3.4/5" }, {}),
        "it should be true"
      );
    });
    it("should return true if advanced subnet tier has invalid name", () => {
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "frog", cidr: "1.2.3.4/15", name: "@@@@" },
          {
            data: {
              name: "",
            },
            vpc_name: "test",
          },
          {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    subnets: [
                      {
                        name: "egg",
                      },
                    ],
                  },
                ],
              },
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if advanced subnet tier has invalid duplicate name", () => {
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "frog", cidr: "1.2.3.4/15", name: "egg" },
          {
            data: {
              name: "frog",
            },
            vpc_name: "test",
          },
          {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    subnets: [
                      {
                        name: "egg",
                      },
                    ],
                  },
                ],
              },
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if advanced subnet tier has null cidr", () => {
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "fro222g", cidr: null, name: "egg" },
          {
            data: {
              name: "frog",
            },
            vpc_name: "test",
          },
          {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    subnets: [
                      {
                        name: "egg",
                      },
                    ],
                  },
                ],
              },
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if advanced subnet tier has invalid network acl", () => {
      assert.isTrue(
        disableSave(
          "subnet",
          { tier: "frog", cidr: "1.2.3.4/15", name: "toad", network_acl: "" },
          {
            data: {
              name: "frog",
            },
            vpc_name: "test",
          },
          {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    subnets: [
                      {
                        name: "egg",
                      },
                    ],
                  },
                ],
              },
            },
          }
        ),
        "it should be true"
      );
    });
  });
  describe("security groups", () => {
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
  });
  describe("iam account settings", () => {
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
    it("should return true if iam account settings page has bad mfa field", () => {
      assert.isTrue(
        disableSave("iam_account_settings", {
          mfa: null,
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
        })
      );
    });
    it("should return true if iam account settings page has bad allowed_ip_addresses field", () => {
      assert.isTrue(
        disableSave("iam_account_settings", {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.-sda,1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
        })
      );
    });
    it("should return true if iam account settings page has bad max_sessions_per_identity field", () => {
      assert.isTrue(
        disableSave("iam_account_settings", {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: null,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
        })
      );
    });
    it("should return true if iam account settings page has bad restrict_create_service_id field", () => {
      assert.isTrue(
        disableSave("iam_account_settings", {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: null,
          restrict_create_platform_apikey: "NOT_SET",
        })
      );
    });
    it("should return true if iam account settings form has bad restrict_create_platform_apikey field", () => {
      assert.isTrue(
        disableSave("iam_account_settings", {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: null,
        })
      );
    });
  });
  describe("clusters", () => {
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
  describe("event streams", () => {
    it("should return true if event streams plan is not enterprise and form has invalid name", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "lite",
          name: "-bad-name",
          resource_group: "rg",
        })
      );
    });
    it("should return true if event streams plan is not enterprise and form has invalid resource_group", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "lite",
          name: "foo-name",
          resource_group: null,
        })
      );
    });
    it("should return true if event streams plan is enterprise and form has invalid name", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "enterprise",
          name: "-bad-name",
          resource_group: "rg",
          endpoints: "private",
          throughput: "150",
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.1",
        })
      );
    });
    it("should return true if event streams plan is enterprise and form has invalid resource_group", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "enterprise",
          name: "foo-name",
          resource_group: null,
          endpoints: "private",
          throughput: "150",
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.1",
        })
      );
    });
    it("should return true if event streams plan is enterprise and form has invalid endpoints", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "enterprise",
          name: "foo-name",
          resource_group: "rg",
          endpoints: null,
          throughput: "150",
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.1",
        })
      );
    });
    it("should return true if event streams plan is enterprise and form has invalid throughput", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "enterprise",
          name: "foo-name",
          resource_group: "rg",
          endpoints: "private",
          throughput: null,
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.1",
        })
      );
    });
    it("should return true if event streams plan is enterprise and form has invalid storage_size", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "enterprise",
          name: "foo-name",
          resource_group: "rg",
          endpoints: "private",
          throughput: "150",
          storage_size: null,
          private_ip_allowlist: "1.1.1.1",
        })
      );
    });
    it("should return true if event streams plan is enterprise and form has invalid private_ip_allowlist", () => {
      assert.isTrue(
        disableSave("event_streams", {
          plan: "enterprise",
          name: "foo-name",
          resource_group: "rg",
          endpoints: "private",
          throughput: "150",
          storage_size: "2048",
          private_ip_allowlist: "1.1.1.-sda,1.1.1.1",
        })
      );
    });
  });
  describe("routing_tables", () => {
    it("should return true if a routing table has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "routing_tables",
          {
            name: "aaa-",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  routing_tables: [
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
    it("should return true if a routing table has an invalid vpc", () => {
      assert.isTrue(
        disableSave(
          "routing_tables",
          {
            name: "aaa",
            vpc: "",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  routing_tables: [
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
    it("should return true if a routing table route has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "routes",
          {
            name: "aaa-",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  routing_tables: [
                    {
                      name: "frog",
                      routes: [],
                    },
                    {
                      name: "toad",
                      routes: [],
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
            route: {
              routes: [],
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a routing table route has an invalid zone", () => {
      assert.isTrue(
        disableSave(
          "routes",
          {
            name: "aaa",
            zone: "",
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  routing_tables: [
                    {
                      name: "frog",
                      routes: [],
                    },
                    {
                      name: "toad",
                      routes: [],
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
            route: {
              routes: [],
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a routing table route has an invalid destination", () => {
      assert.isTrue(
        disableSave(
          "routes",
          {
            name: "aaa",
            zone: "1",
            destination: "aaaa",
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  routing_tables: [
                    {
                      name: "frog",
                      routes: [],
                    },
                    {
                      name: "toad",
                      routes: [],
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
            route: {
              routes: [],
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a routing table route has an invalid next hop", () => {
      assert.isTrue(
        disableSave(
          "routes",
          {
            name: "aaa",
            zone: "1",
            destination: "1.2.3.4",
            next_hop: "aaaa",
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  routing_tables: [
                    {
                      name: "frog",
                      routes: [],
                    },
                    {
                      name: "toad",
                      routes: [],
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
            route: {
              routes: [],
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a routing table route has an invalid next hop as cidr block", () => {
      assert.isTrue(
        disableSave(
          "routes",
          {
            name: "aaa",
            zone: "1",
            destination: "1.2.3.4",
            next_hop: "1.2.3.4/5",
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  routing_tables: [
                    {
                      name: "frog",
                      routes: [],
                    },
                    {
                      name: "toad",
                      routes: [],
                    },
                  ],
                },
              },
            },
            data: {
              name: "frog",
            },
            route: {
              routes: [],
            },
          }
        ),
        "it should be true"
      );
    });
  });
  describe("load_balancers", () => {
    it("should return true if a load balancer has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa-",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a listener port that is not a whole number", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: null,
            port: 456,
            health_timeout: 5,
            health_delay: 10,
            health_retries: 5,
            listener_port: 443.5,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a health delay equal to health timeout", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: null,
            port: 456,
            health_timeout: 5,
            health_delay: 5,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer has no deployment vsi", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["one"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: [],
            listener_protocol: "http",
            connection_limit: null,
            port: 456,
            health_timeout: 15,
            health_delay: 16,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer has no sg", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: [],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: null,
            port: 456,
            health_timeout: 15,
            health_delay: 16,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a non-whole number connection limit", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: 0.5,
            port: 456,
            health_timeout: 5,
            health_delay: 10,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a connection limit out of range", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: -2,
            port: 456,
            health_timeout: 5,
            health_delay: 10,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a port limit out of range", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: null,
            port: -2,
            health_timeout: 5,
            health_delay: 10,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a health_timeout limit out of range", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: null,
            port: 2,
            health_timeout: -1,
            health_delay: 10,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a health_delay limit out of range", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: null,
            port: 2,
            health_timeout: 2,
            health_delay: 1,
            health_retries: 5,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
    it("should return true if a load balancer with a health_retries limit out of range", () => {
      assert.isTrue(
        disableSave(
          "load_balancers",
          {
            name: "aaa",
            vpc: "management",
            type: "private",
            security_groups: ["management-vpe", "management-vsi"],
            algorithm: "round_robin",
            protocol: "http",
            proxy_protocol: "",
            health_type: "http",
            session_persistence_app_cookie_name: "",
            target_vsi: ["vsi"],
            listener_protocol: "http",
            connection_limit: null,
            port: 456,
            health_timeout: 5,
            health_delay: 10,
            health_retries: 0,
            listener_port: 443,
            subnets: ["subnet-1"],
          },
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                  load_balancers: [
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
  });
  describe("vpe", () => {
    it("should return true if a vpe has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa-",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
    it("should return true if a vpe has an invalid duplicate name", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
                    {
                      name: "frog",
                    },
                    {
                      name: "toad",
                    },
                    {
                      name: "aaa",
                    },
                  ],
                },
              },
            },
            data: {
              name: "hi",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a vpe has an invalid service", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            vpc: "capybara",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
            service: null,
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
    it("should return true if a vpe has an invalid rg", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            vpc: "capybara",
            service: "debug",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
            resource_group: null,
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
    it("should return true if a vpe has an invalid vpc", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            resource_group: "what",
            service: "debug",
            security_groups: ["security", "group"],
            subnets: ["sub", "net"],
            vpc: null,
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
    it("should return true if a vpe has an invalid security group", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            subnets: ["sub", "net"],
            security_groups: null,
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
    it("should return true if a vpe has no security group(s) selected", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            subnets: ["sub", "net"],
            security_groups: [],
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
    it("should return true if a vpe has an invalid subnet", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: null,
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
    it("should return true if a vpe has no subnets", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            name: "aaa",
            vpc: "capybara",
            service: "debug",
            resource_group: "what",
            security_groups: ["security", "group"],
            subnets: [],
          },
          {
            craig: {
              store: {
                json: {
                  virtual_private_endpoints: [
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
  });
  describe("vsi", () => {
    const example_vsi = {
      kms: null,
      encryption_key: "key",
      image: "ibm-centos-stream-8-amd64-1",
      profile: "bx2-2x8",
      name: "testing",
      security_groups: ["management-vpe"],
      ssh_keys: ["ssh-key"],
      vpc: "management",
      vsi_per_subnet: 1,
      resource_group: "service-rg",
      override_vsi_name: null,
      user_data: null,
      network_interfaces: [],
      subnets: ["vpe-zone-1"],
      volumes: [],
      subnet: "",
      image_name:
        "CentOS Stream 8 - Minimal Install (amd64) [ibm-centos-stream-8-amd64-1]",
      enable_floating_ip: false,
    };
    it("should return true if a vsi volume has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "volumes",
          {
            name: "@@@",
          },
          {
            craig: {
              store: {
                json: {
                  vsi: [
                    {
                      name: "frog",
                      volumes: [],
                    },
                    {
                      name: "toad",
                      volumes: [],
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
    it("should return true if a vsi volume has an invalid capacity", () => {
      assert.isTrue(
        disableSave(
          "volumes",
          {
            name: "good-name",
            capacity: "1",
          },
          {
            craig: {
              store: {
                json: {
                  vsi: [
                    {
                      name: "frog",
                      volumes: [],
                    },
                    {
                      name: "toad",
                      volumes: [],
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
    it("should return false if a vsi volume has no capacity but is valid otherwise", () => {
      assert.isFalse(
        disableSave(
          "volumes",
          {
            name: "good-name",
            encryption_key: "good-key",
            capacity: "",
          },
          {
            craig: {
              store: {
                json: {
                  vsi: [
                    {
                      name: "frog",
                      volumes: [],
                    },
                    {
                      name: "toad",
                      volumes: [],
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
        "it should be false"
      );
    });
    it("should return true if vsi has invalid name", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.name = "";
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty resource group", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.resource_group = null;
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty vpc", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.vpc = null;
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty image name", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.image_name = null;
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty profile", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.profile = null;
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty encryption key", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.encryption_key = null;
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has invalid vsis per subnet", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.vsi_per_subnet = 0;
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has invalid vsis per subnet", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.vsi_per_subnet = 11;
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty security groups", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.security_groups = [];
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty subnets", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.subnets = [];
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    it("should return true if vsi has empty ssh keys", () => {
      let vsi = Object.assign({}, example_vsi);
      vsi.ssh_keys = [];
      assert.isTrue(
        disableSave("vsi", vsi, {
          craig: { store: { json: { vsi: [{ name: "hi" }] } } },
          data: { name: "vsi" },
        })
      );
    });
    describe("f5_vsi_template", () => {
      const example_template = {
        app_id: "null",
        as3_declaration_url: "http://www.test.com/",
        default_route_gateway_cidr: "10.10.10.10/24",
        do_declaration_url: "http://www.test.com/",
        domain: "local",
        hostname: "f5-ve-01",
        license_host: "null",
        license_password: "null",
        license_pool: "null",
        license_sku_keyword_1: "null",
        license_sku_keyword_2: "null",
        license_type: "none",
        license_username: "null",
        phone_home_url: "http://www.test.com/",
        template_version: "20210201",
        tgactive_url: "http://www.test.com/",
        tgrefresh_url: "http://www.test.com/",
        tgstandby_url: "http://www.test.com/",
        tmos_admin_password: null,
        ts_declaration_url: "http://www.test.com/",
        vpc: "edge",
        zone: 1,
        template_source: "test",
      };
      it("should return true if any fields are empty, based on license_type none", () => {
        let template = Object.assign({}, example_template);
        template.template_version = "";
        template.template_source = "";
        assert.isTrue(disableSave("f5_vsi_template", template));
      });
      it("should return true if any fields are empty, based on license_type byol", () => {
        let template = Object.assign({}, example_template);
        template.license_type = "byol";
        template.byol_license_basekey = "";
        assert.isTrue(disableSave("f5_vsi_template", template));
      });
      it("should return true if any fields are empty, based on license_type regkeypool", () => {
        let template = Object.assign({}, example_template);
        template.license_type = "regkeypool";
        template.license_username = "";
        template.license_host = "";
        template.license_pool = "";
        assert.isTrue(disableSave("f5_vsi_template", template));
      });
      it("should return true if any fields are empty, based on license_type utilitypool", () => {
        let template = Object.assign({}, example_template);
        template.license_type = "utilitypool";
        template.license_unit_of_measure = "";
        assert.isTrue(disableSave("f5_vsi_template", template));
      });
      it("should return true if any of the urls are invalid", () => {
        let template = Object.assign({}, example_template);
        template.ts_declaration_url = "not a url";
        assert.isTrue(disableSave("f5_vsi_template", template));
      });
      it("should return false if all valid", () => {
        let template = Object.assign({}, example_template);
        assert.isFalse(disableSave("f5_vsi_template", template));
      });
    });
  });
  describe("f5_vsi", () => {
    it("should return true if ssh keys empty", () => {
      assert.isTrue(disableSave("f5_vsi", { ssh_keys: [] }));
    });
    it("should return true if no ssh keys", () => {
      assert.isTrue(disableSave("f5_vsi", {}));
    });
  });
  describe("forceShowForm", () => {
    it("should force forms open if save is disabled and data does not have field of enable", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "vpcs",
            innerFormProps: {
              data: {
                name: "management",
                bucket: null,
              },
            },
          }
        ),
        "it should be true"
      );
    });
    it("should not force forms open if it is not enabled", () => {
      assert.isFalse(
        forceShowForm(
          {},
          {
            submissionFieldName: "iam_account_settings",
            innerFormProps: {
              data: {
                enable: false,
              },
            },
          }
        ),
        "it should be false"
      );
    });
    it("should force forms open if save is disabled and it is enabled", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "iam_account_settings",
            innerFormProps: {
              data: {
                enable: true,
                max_sessions_per_identity: null,
              },
            },
          }
        ),
        "it should be true"
      );
    });
  });
  describe("disableSshKeyDelete", () => {
    it("should return true if ssh key is in use", () => {
      assert.isTrue(
        disableSshKeyDelete({
          craig: {
            store: {
              json: {
                vsi: [
                  {
                    ssh_keys: ["key"],
                  },
                ],
                teleport_vsi: [],
                f5_vsi: [],
              },
            },
          },
          innerFormProps: {
            data: {
              name: "key",
            },
          },
        })
      );
    });
  });
  describe("cbr", () => {
    let example_cbr_zone = {
      name: "hi",
      description: "",
      account_id: "asdfsdf",
      addresses: [
        {
          name: "asdfasdf",
          account_id: "",
          location: "",
          service_name: "",
          service_instance: "",
          service_type: "",
          type: "ipAddress",
          value: "2.2.2.2",
        },
      ],
      exclusions: [
        {
          name: "asdf",
          account_id: "",
          location: "",
          service_name: "",
          service_instance: "",
          service_type: "",
          type: "ipAddress",
          value: "2.2.2.2",
        },
      ],
    };
    let example_cbr_rule = {
      name: "hi",
      description: "description",
      enforcement_mode: "Report",
      api_type_id: "adfs",
      contexts: [
        {
          name: "hi",
          value: "hi",
        },
      ],
      resource_attributes: [
        {
          name: "hey",
          value: "hey",
        },
      ],
      tags: [
        {
          name: "hello",
          operator: "",
          value: "hello",
        },
      ],
    };

    it("should be disabled if invalid cbr rule name, description, or api type id", () => {
      let cbr_rule = Object.assign({}, example_cbr_rule);
      cbr_rule.name = "";
      cbr_rule.description = "\x00"; // char that does not match description regex
      cbr_rule.account_id = "?>@<";
      assert.isTrue(
        disableSave("cbr_rules", cbr_rule, {
          craig: { store: { json: { cbr_rules: [{ name: "hi" }] } } },
          data: { name: "hi" },
        })
      );
    });
    it("should be enabled if valid", () => {
      let cbr_rule = Object.assign({}, example_cbr_rule);
      assert.isFalse(
        disableSave("cbr_rules", cbr_rule, {
          craig: { store: { json: { cbr_rules: [{ name: "hi" }] } } },
          data: { name: "hi" },
        })
      );
    });
    it("should be disabled if invalid cbr context name or value", () => {
      let cbr_context = Object.assign({}, example_cbr_rule.contexts[0]);
      cbr_context.name = "";
      cbr_context.value = "";
      assert.isTrue(
        disableSave("contexts", cbr_context, {
          craig: {
            store: {
              json: { cbr_rules: [{ name: "hi", contexts: [{ name: "hi" }] }] },
            },
          },
          data: { name: "hi" },
        })
      );
    });
    it("should be enabled if valid cbr context", () => {
      let cbr_context = Object.assign({}, example_cbr_rule.contexts[0]);
      assert.isFalse(
        disableSave("contexts", cbr_context, {
          craig: {
            store: {
              json: { cbr_rules: [{ name: "hi", contexts: [{ name: "hi" }] }] },
            },
          },
          data: { name: "hi" },
        })
      );
    });
    it("should be disabled if invalid cbr resource attribute name or value", () => {
      let cbr_attribute = Object.assign(
        {},
        example_cbr_rule.resource_attributes[0]
      );
      cbr_attribute.name = "";
      cbr_attribute.value = "";
      assert.isTrue(
        disableSave("resource_attributes", cbr_attribute, {
          craig: {
            store: {
              json: {
                cbr_rules: [
                  { name: "hi", resource_attributes: [{ name: "hey" }] },
                ],
              },
            },
          },
          data: { name: "hey" },
        })
      );
    });
    it("should be enabled if valid cbr resource attribute", () => {
      let cbr_attribute = Object.assign(
        {},
        example_cbr_rule.resource_attributes[0]
      );
      assert.isFalse(
        disableSave("resource_attributes", cbr_attribute, {
          craig: {
            store: {
              json: {
                cbr_rules: [
                  { name: "hi", resource_attributes: [{ name: "hey" }] },
                ],
              },
            },
          },
          data: { name: "hey" },
        })
      );
    });
    it("should be disabled if invalid cbr tag name, operator, or value", () => {
      let cbr_tag = Object.assign({}, example_cbr_rule.tags[0]);
      cbr_tag.name = "";
      cbr_operator = "&5?_!?";
      cbr_tag.value = "";
      assert.isTrue(
        disableSave("tags", cbr_tag, {
          craig: {
            store: {
              json: {
                cbr_rules: [{ name: "hi", tags: [{ name: "hello" }] }],
              },
            },
          },
          data: { name: "hello" },
        })
      );
    });
    it("should be enabled if valid cbr tag", () => {
      let cbr_tag = Object.assign({}, example_cbr_rule.tags[0]);
      assert.isFalse(
        disableSave("tags", cbr_tag, {
          craig: {
            store: {
              json: {
                cbr_rules: [{ name: "hi", tags: [{ name: "hello" }] }],
              },
            },
          },
          data: { name: "hello" },
        })
      );
    });
    it("should be disabled if invalid cbr zone name, description, or account id", () => {
      let cbr_zone = Object.assign({}, example_cbr_zone);
      cbr_zone.name = "";
      cbr_zone.description = "\x00"; // char that does not match description regex
      cbr_zone.account_id = "?>@<";
      assert.isTrue(
        disableSave("cbr_zones", cbr_zone, {
          craig: { store: { json: { cbr_zones: [{ name: "hi" }] } } },
          data: { name: "hi" },
        })
      );
    });
    it("should be enabled if valid cbr zone", () => {
      let cbr_zone = Object.assign({}, example_cbr_zone);
      assert.isFalse(
        disableSave("cbr_zones", cbr_zone, {
          craig: { store: { json: { cbr_zones: [{ name: "hi" }] } } },
          data: { name: "hi" },
        })
      );
    });
    it("should be disabled if invalid cbr address", () => {
      let cbr_address = Object.assign({}, example_cbr_zone.addresses[0]);
      cbr_address.name = "hi";
      cbr_address.account_id = "?>@<";
      cbr_address.location = "\x00"; // char that does not match location regex
      cbr_address.type = "ipAddress";
      cbr_address.value = "not an IP";

      assert.isTrue(
        disableSave("addresses", cbr_address, {
          craig: {
            store: {
              json: {
                cbr_zones: [{ name: "hi", addresses: [{ name: "hi" }] }],
              },
            },
          },
          data: { name: "hi" },
        })
      );
    });
    it("should be enabled if valid cbr address", () => {
      let cbr_address = Object.assign({}, example_cbr_zone.addresses[0]);
      assert.isFalse(
        disableSave("addresses", cbr_address, {
          craig: {
            store: {
              json: {
                cbr_zones: [{ name: "hi", addresses: [{ name: "hi" }] }],
              },
            },
          },
          data: { name: "hi" },
        })
      );
    });
    it("should be disabled if invalid cbr exclusion", () => {
      let cbr_exclusion = Object.assign({}, example_cbr_zone.exclusions[0]);
      cbr_exclusion.name = "";
      cbr_exclusion.account_id = "?>@<";
      cbr_exclusion.location = "\x00"; // char that does not match location regex
      cbr_exclusion.service_name = "\x00"; // char that does not match regex
      cbr_exclusion.type = "ipAddress";
      cbr_exclusion.value = "not an IP";

      assert.isTrue(
        disableSave("exclusions", cbr_exclusion, {
          craig: {
            store: {
              json: {
                cbr_zones: [{ name: "hi", exclusions: [{ name: "hi" }] }],
              },
            },
          },
          data: { name: "hi" },
        })
      );
    });
    it("should be enabled if valid cbr exclusion", () => {
      let cbr_exclusion = Object.assign({}, example_cbr_zone.exclusions[0]);
      assert.isFalse(
        disableSave("exclusions", cbr_exclusion, {
          craig: {
            store: {
              json: {
                cbr_zones: [{ name: "hi", exclusions: [{ name: "hi" }] }],
              },
            },
          },
          data: { name: "hi" },
        })
      );
    });
  });
  describe("vpn_servers", () => {
    it("should return true if vpn server has invalid name", () => {
      let actualData = disableSave(
        "vpn_servers",
        { name: "@@@" },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if vpn server has invalid vpc", () => {
      let actualData = disableSave(
        "vpn_servers",
        { name: "hi", vpc: "" },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid port range", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "aaa",
          port: -1000,
          client_ip_pool: "aaa",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid port decimal", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "aaa",
          port: 2.3,
          client_ip_pool: "aaa",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid client_idle_timeout range", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "aaa",
          port: 200,
          client_idle_timeout: -1000,
          client_ip_pool: "aaa",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid client_idle_timeout decimal", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "aaa",
          port: 200,
          client_idle_timeout: 2.3,
          client_ip_pool: "aaa",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid certificate_crn", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "aaa",
          method: "certificate",
          port: 1,
          client_ip_pool: "aaa",
          client_ca_crn: "CHEATER",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid client_ca_crn and method is certificate", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "certificate",
          port: 1,
          client_ip_pool: "aaa",
          client_ca_crn: "",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid cidr", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "username",
          port: 1,
          client_ip_pool: "aaa",
          client_ca_crn: "",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with ip as cidr", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "username",
          port: 1,
          client_ip_pool: "1.2.3.4",
          client_ca_crn: "",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with invalid dns server ips", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          method: "username",
          port: 1,
          client_ip_pool: "1.2.3.4/23",
          client_ca_crn: "CHEATER",
          client_dns_server_ips: "asdasd",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if fields are otherwise valid with no subnets", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnets: [],
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          client_dns_server_ips: "1.2.3.4",
          method: "username",
          port: 1,
          client_ip_pool: "1.2.3.4/23",
          client_ca_crn: "CHEATER",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return false if fields are otherwise valid when method is certificate", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          subnets: ["aaa"],
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          client_dns_server_ips: "1.2.3.4",
          method: "certificate",
          port: 1,
          client_idle_timeout: 2,
          client_ip_pool: "1.2.3.4/23",
          client_ca_crn: "CHEATER",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isFalse(actualData, "it should not be disabled");
    });

    it("should return false if fields are otherwise valid when method is username", () => {
      let actualData = disableSave(
        "vpn_servers",
        {
          name: "aaa",
          resource_group: "aa",
          vpc: "aaa",
          subnet: "aaa",
          subnets: ["aaa"],
          security_groups: ["aaa"],
          certificate_crn: "CHEATER",
          client_dns_server_ips: "1.2.3.4",
          method: "username",
          port: 1,
          client_idle_timeout: 2,
          client_ip_pool: "1.2.3.4/23",
          client_ca_crn: "",
        },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isFalse(actualData, "it should not be disabled");
    });
    describe("vpn server routes", () => {
      it("should return true if route has invalid name", () => {
        let actualData = disableSave(
          "vpn_server_routes",
          { name: "@@@" },
          {
            data: {
              name: "",
            },
            craig: {
              store: {
                json: {
                  vpn_servers: [],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should return true if route has invalid cidr block", () => {
        let actualData = disableSave(
          "vpn_server_routes",
          { name: "aaa", destination: "aaa" },
          {
            data: {
              name: "",
            },
            craig: {
              store: {
                json: {
                  vpn_servers: [],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
    });
  });
  describe("dns", () => {
    it("should be disabled when dns has invalid name", () => {
      let actualData = disableSave(
        "dns",
        { name: "???" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when dns has duplicate name", () => {
      let actualData = disableSave(
        "dns",
        { name: "hi" },
        {
          data: { name: "" },
          craig: {
            store: {
              json: {
                dns: [{ name: "hi" }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should be disabled when dns has no rg", () => {
      let actualData = disableSave(
        "dns",
        { name: "hi", resource_group: null },
        {
          data: { name: "hi" },
          craig: {
            store: {
              json: {
                dns: [{ name: "" }],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    describe("dns subForms", () => {
      it("should be disabled when invalid name", () => {
        let actualData = disableSave(
          "zones",
          { name: "???" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", zones: [{ name: "" }] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when duplicate name", () => {
        let actualData = disableSave(
          "zones",
          { name: "hi", vpcs: [] },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", zones: [{ name: "hi" }] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when no vpc", () => {
        let actualData = disableSave(
          "zones",
          { name: "hi", vpcs: null },
          {
            data: { name: "hi" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", zones: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when no vpc", () => {
        let actualData = disableSave(
          "zones",
          { name: "hi", vpcs: [] },
          {
            data: { name: "hi" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", zones: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when invalid description", () => {
        let actualData = disableSave(
          "zones",
          { name: "hi", description: "@", vpcs: ["management"] },
          {
            data: { name: "hi" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", zones: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when invalid record name", () => {
        let actualData = disableSave(
          "records",
          { name: "???" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ records: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when record duplicate name", () => {
        let actualData = disableSave(
          "records",
          { name: "hi" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ records: [{ name: "hi" }] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when no dns zone", () => {
        let actualData = disableSave(
          "records",
          { name: "hi", dns_zone: "", type: "hey" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ records: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when no dns type", () => {
        let actualData = disableSave(
          "records",
          { name: "hi", type: "", dns_zone: "hi" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ records: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when invalid mx record", () => {
        let actualData = disableSave(
          "records",
          { name: "hi", type: "MX", rdata: "hi", preference: "invalid" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ records: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when invalid srv record", () => {
        let actualData = disableSave(
          "records",
          { name: "hi", type: "SRV", rdata: "hi" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ records: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when invalid custom_resolver name", () => {
        let actualData = disableSave(
          "custom_resolvers",
          { name: "???" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ custom_resolvers: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when custom resolver duplicate name", () => {
        let actualData = disableSave(
          "custom_resolvers",
          { name: "hi" },
          {
            data: { name: "" },
            craig: {
              store: {
                json: {
                  dns: [{ custom_resolvers: [{ name: "hi" }] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when custom resolver no vpc", () => {
        let actualData = disableSave(
          "custom_resolvers",
          { name: "hi", vpc: "" },
          {
            data: { name: "hi" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", custom_resolvers: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when custom resolver no subnets", () => {
        let actualData = disableSave(
          "custom_resolvers",
          { name: "hi", subnets: [] },
          {
            data: { name: "hi" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", custom_resolvers: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
      it("should be disabled when invalid description", () => {
        let actualData = disableSave(
          "custom_resolvers",
          { name: "hi", description: "@", subnets: ["hi"] },
          {
            data: { name: "hi" },
            craig: {
              store: {
                json: {
                  dns: [{ name: "hi", custom_resolvers: [] }],
                },
              },
            },
          }
        );
        assert.isTrue(actualData, "it should be disabled");
      });
    });
  });
  describe("sysdig", () => {
    it("should be disabled when invalid resource group", () => {
      let actualData = disableSave("sysdig", {
        resource_group: "",
        plan: "tier-2",
      });
      assert.isTrue(actualData, "it should be disabled");
    });
  });
  describe("invalidCidrBlock", () => {
    it("should return true for null", () => {
      assert.isTrue(invalidCidrBlock(null), "it should be true");
    });
  });
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
  });
});
