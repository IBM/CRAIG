const { assert } = require("chai");
const {
  invalidName,
  invalidSshPublicKey,
  invalidIamAccountSettings,
  invalidTagList,
  invalidIpCommaList,
} = require("../../client/src/lib/forms");

describe("invalid callbacks", () => {
  describe("invalidName", () => {
    it("should return true if resource group has a duplicate name", () => {
      let actualData = invalidName("resource_groups")(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "test",
                  },
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
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if resource group has empty string as name", () => {
      let actualData = invalidName("resource_groups")(
        {
          name: "",
        },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "egg",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "egg",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if resource group is not using data and name invalid", () => {
      let actualData = invalidName("resource_groups")(
        {
          name: "AAA",
          use_data: false,
        },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "egg",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "egg",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });

    it("should return true if scc has an invalid name", () => {
      assert.isTrue(
        invalidName("scc")({ name: "@@@", scope_description: null }),
        "it should be true"
      );
    });
    it("should return true if scc has an empty string name", () => {
      assert.isTrue(
        invalidName("scc")({ name: "", scope_description: null }),
        "it should be true"
      );
    });
    it("should return true if vpc has a duplicate name", () => {
      let actualData = invalidName("vpcs")(
        "name",
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                  },
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
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc acl has a duplicate name", () => {
      let actualData = invalidName("vpcs")(
        "default_network_acl_name",
        {
          name: "test2",
          default_network_acl_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                  },
                  {
                    name: "frog",
                    default_network_acl_name: "frog",
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
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc acl has a duplicate name with existing acl", () => {
      let actualData = invalidName("vpcs")(
        "default_network_acl_name",
        {
          name: "test2",
          default_network_acl_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    default_network_acl_name: "egg",
                    acls: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                  {
                    name: "frog",
                    default_network_acl_name: null,
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
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return false if vpc routing table name is empty string", () => {
      let actualData = invalidName("vpcs")("default_routing_table_name", {
        default_routing_table_name: "",
      });
      assert.isFalse(actualData, "it should be false");
    });
    it("should return true if vpc routing table has a duplicate name", () => {
      let actualData = invalidName("vpcs")(
        "default_routing_table_name",
        {
          name: "test2",
          default_routing_table_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                    default_routing_table_name: null,
                  },
                  {
                    name: "frog",
                    default_routing_table_name: "frog",
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
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc security group has a duplicate name", () => {
      let actualData = invalidName("vpcs")(
        "default_security_group_name",
        {
          name: "test2",
          default_security_group_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                  },
                  {
                    name: "frog",
                    default_security_group_name: "frog",
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
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc acl has a duplicate name with existing sg", () => {
      let actualData = invalidName("vpcs")(
        "default_security_group_name",
        {
          name: "test2",
          default_security_group_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    default_security_group_name: "egg",
                    acls: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                  {
                    name: "frog",
                    default_security_group_name: null,
                    acls: [],
                  },
                ],
                security_groups: [
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
      );
      assert.isTrue(actualData, "it should be true");
    });
  });
  describe("invalidSshKey", () => {
    it("should return false when updating name", () => {
      let actualData = invalidSshPublicKey(
        {
          name: "new-name",
          resource_group: "management-rg",
          public_key:
            "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
        },
        {
          craig: {
            store: {
              json: {
                ssh_keys: [
                  {
                    name: "ssh-key",
                    resource_group: "management-rg",
                    public_key:
                      "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                  },
                ],
              },
            },
          },
          data: {
            name: "ssh-key",
          },
        }
      ).invalid;
      assert.isFalse(actualData);
    });
    it("should return true when adding duplicate public key", () => {
      let actualData = invalidSshPublicKey(
        {
          name: "hi",
          public_key:
            "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
        },
        {
          craig: {
            store: {
              json: {
                ssh_keys: [
                  {
                    name: "ssh-key",
                    resource_group: "management-rg",
                    public_key:
                      "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                  },
                ],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ).invalid;
      assert.isTrue(actualData);
    });
    it("should return true when key invalid", () => {
      let actualData = invalidSshPublicKey(
        {
          name: "hi",
          public_key: "honk",
        },
        {
          craig: {
            store: {
              json: {
                ssh_keys: [],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ).invalid;
      assert.isTrue(actualData);
    });
    it("should return false when adding valid key", () => {
      let actualData = invalidSshPublicKey(
        {
          name: "hi",
          resource_group: "management-rg",
          public_key:
            "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
        },
        {
          craig: {
            store: {
              json: {
                ssh_keys: [],
              },
            },
          },
          data: {
            name: "hi",
          },
        }
      ).invalid;
      assert.isFalse(actualData);
    });
    describe("invalidSshKey", () => {
      it("should return false when updating name", () => {
        let actualData = invalidSshPublicKey(
          {
            name: "new-name",
            resource_group: "management-rg",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            craig: {
              store: {
                json: {
                  ssh_keys: [
                    {
                      name: "ssh-key",
                      resource_group: "management-rg",
                      public_key:
                        "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                    },
                  ],
                },
              },
            },
            data: {
              name: "ssh-key",
            },
          }
        ).invalid;
        assert.isFalse(actualData);
      });
      it("should return true when adding duplicate public key", () => {
        let actualData = invalidSshPublicKey(
          {
            name: "hi",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            craig: {
              store: {
                json: {
                  ssh_keys: [
                    {
                      name: "ssh-key",
                      resource_group: "management-rg",
                      public_key:
                        "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                    },
                  ],
                },
              },
            },
            data: {
              name: "hi",
            },
          }
        ).invalid;
        assert.isTrue(actualData);
      });
      it("should return true when key invalid", () => {
        let actualData = invalidSshPublicKey(
          {
            name: "hi",
            public_key: "honk",
          },
          {
            craig: {
              store: {
                json: {
                  ssh_keys: [],
                },
              },
            },
            data: {
              name: "hi",
            },
          }
        ).invalid;
        assert.isTrue(actualData);
      });
      it("should return false when adding valid key", () => {
        let actualData = invalidSshPublicKey(
          {
            name: "hi",
            resource_group: "management-rg",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            craig: {
              store: {
                json: {
                  ssh_keys: [],
                },
              },
            },
            data: {
              name: "hi",
            },
          }
        ).invalid;
        assert.isFalse(actualData);
      });
      it("should return true when ssh key is null", () => {
        let actualData = invalidSshPublicKey(
          {
            name: "hi",
            resource_group: "management-rg",
            public_key: null,
          },
          {
            craig: {
              store: {
                json: {
                  ssh_keys: [],
                },
              },
            },
            data: {
              name: "hi",
            },
          }
        ).invalid;
        assert.isTrue(actualData);
      });
    });
  });
  describe("invalidIamAccountSettings", () => {
    it("should return true when max_sessions_per_identity is invalid", () => {
      let actualData = invalidIamAccountSettings("max_sessions_per_identity", {
        enable: false,
        mfa: null,
        allowed_ip_addresses: null,
        include_history: false,
        if_match: null,
        max_sessions_per_identity: 100,
        restrict_create_service_id: null,
        restrict_create_platform_apikey: null,
        session_expiration_in_seconds: null,
        session_invalidation_in_seconds: null,
      });
      assert.isTrue(actualData);
    });
    it("should return false when max_sessions_per_identity is valid", () => {
      let actualData = invalidIamAccountSettings("max_sessions_per_identity", {
        enable: false,
        mfa: null,
        allowed_ip_addresses: null,
        include_history: false,
        if_match: null,
        max_sessions_per_identity: 5,
        restrict_create_service_id: null,
        restrict_create_platform_apikey: null,
        session_expiration_in_seconds: null,
        session_invalidation_in_seconds: null,
      });
      assert.isFalse(actualData);
    });
  });
  describe("invalidTagList", () => {
    it("should return true when invalid tag list", () => {
      assert.isTrue(invalidTagList(["hi", "2@@@2"]));
    });
    it("should return false when no tags", () => {
      assert.isFalse(invalidTagList([]));
    });
  });
  describe("invalidIpCommaList", () => {
    it("should return false when invalid comma separated ip list is provided", () => {
      assert.isFalse(invalidIpCommaList("1.1.1.1/10, 2.2.2.2"));
    });
    it("should return true when valid comma separated ip list is provided", () => {
      assert.isTrue(invalidIpCommaList("1.1.1.-2,2.2.2.2,124.2/2"));
    });
    it("should return false when null is provided", () => {
      assert.isFalse(invalidIpCommaList(null));
    });
  });
});
