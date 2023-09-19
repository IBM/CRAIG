const { assert } = require("chai");
const {
  invalidName,
  invalidSshPublicKey,
  invalidIamAccountSettings,
  invalidTagList,
  invalidCrnList,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  invalidF5Vsi,
  isValidUrl,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidNewResourceName,
  invalidProjectDescription,
  invalidProjectName,
  invalidCbrRule,
  invalidCbrZone,
  validRecord,
} = require("../../client/src/lib/forms");
const {
  invalidDescription,
  nullOrEmptyStringCheckCallback,
  invalidDnsZoneName,
  invalidCrns,
  invalidCpuCallback,
} = require("../../client/src/lib/forms/invalid-callbacks");

describe("invalid callbacks", () => {
  describe("invalidNewResourceName", () => {
    it("should return true if name has no value", () => {
      assert.isTrue(invalidNewResourceName(null), "it should be true");
    });
  });
  describe("cidrBlocksOverlap", () => {
    it("should return true to the overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "192.168.0.1/18";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "10.0.0.0/16";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
    it("should return true since they are the same cidr blocks", () => {
      let testCidr = "10.0.0.0/16";
      let actualResp = cidrBlocksOverlap(testCidr, testCidr);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "10.0.0.0/16";
      let testCidrB = "192.168.0.1/24";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
  });
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
    it("should return false if subnet and no vpc_name (unloaded modals)", () => {
      let actualData = invalidName("subnet")({}, {});
      assert.isFalse(actualData, "it should be false");
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
    it("should return true when a cbr rule with the same name", () => {
      let actualData = invalidName("cbr_rules")(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                cbr_rules: [
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
    it("should return true when a cbr context with the same name", () => {
      let actualData = invalidName("contexts")(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                cbr_rules: [
                  {
                    name: "hi",
                    contexts: [
                      {
                        name: "test",
                      },
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
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true when a cbr resource attribute with the same name", () => {
      let actualData = invalidName("resource_attributes")(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                cbr_rules: [
                  {
                    name: "hi",
                    resource_attributes: [
                      {
                        name: "test",
                      },
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
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true when a cbr tag with the same name", () => {
      let actualData = invalidName("tags")(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                cbr_rules: [
                  {
                    name: "hi",
                    tags: [
                      {
                        name: "test",
                      },
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
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if arbitrary_secret_name has empty string as name", () => {
      let actualData = invalidName("arbitrary_secret_name")(
        {
          arbitrary_secret_name: "",
        },
        {
          craig: {
            store: {
              json: {
                secrets_manager: [],
                clusters: [
                  {
                    opaque_secrets: [{ arbitrary_secret_name: "frog" }],
                  },
                ],
              },
            },
          },
          data: {
            arbitrary_secret_name: "egg",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if opaque_secrets has a duplicate name", () => {
      let actualData = invalidName("opaque_secrets")(
        {
          name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    opaque_secrets: [{ name: "frog" }],
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
    it("should return true if opaque_secrets has an invalid name", () => {
      let actualData = invalidName("opaque_secrets")(
        {
          name: "AAAA",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    opaque_secrets: [{ name: "frog" }],
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
    it("should return true if secrets_group has is empty", () => {
      let actualData = invalidName("secrets_group")(
        {
          secrets_group: "",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    opaque_secrets: [{ secrets_group: "frog" }],
                  },
                ],
              },
            },
          },
          data: {
            secerts_group: "egg",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if username_password_secret_name is a duplicate", () => {
      let actualData = invalidName("username_password_secret_name")(
        {
          username_password_secret_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                secrets_manager: [],
                clusters: [
                  {
                    opaque_secrets: [{ username_password_secret_name: "frog" }],
                  },
                ],
              },
            },
          },
          data: {
            username_password_secret_name: "egg",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
  });
  it("should return true when a cbr rule with the same name", () => {
    let actualData = invalidName("cbr_zones")(
      {
        name: "test",
      },
      {
        craig: {
          store: {
            json: {
              cbr_zones: [
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
  it("should return true when a cbr address with the same name", () => {
    let actualData = invalidName("addresses")(
      {
        name: "test",
      },
      {
        craig: {
          store: {
            json: {
              cbr_zones: [
                {
                  name: "hi",
                  addresses: [
                    {
                      name: "test",
                    },
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
          name: "frog",
        },
      }
    );
    assert.isTrue(actualData, "it should be true");
  });
  it("should return true when a cbr exclusion with the same name", () => {
    let actualData = invalidName("exclusions")(
      {
        name: "test",
      },
      {
        craig: {
          store: {
            json: {
              cbr_zones: [
                {
                  name: "hi",
                  exclusions: [
                    {
                      name: "test",
                    },
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
          name: "frog",
        },
      }
    );
    assert.isTrue(actualData, "it should be true");
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
  describe("invalidF5Vsi", () => {
    it("should return false if the fields have their own validation or is optional", () => {
      assert.isFalse(
        invalidF5Vsi("tmos_admin_password", { tmos_admin_password: "" })
      );
      assert.isFalse(invalidF5Vsi("app_id", { app_id: "" }));
      assert.isFalse(invalidF5Vsi("home_phone_url", { home_phone_url: "" }));
    });
    it("should return true if null or empty string for other fields", () => {
      assert.isTrue(invalidF5Vsi("template_version", { template_version: "" }));
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
  describe("invalidCrnList", () => {
    it("should return true when invalid crn in list", () => {
      assert.isTrue(
        invalidCrnList([
          "crn:v1:bluemix:public:abcdf",
          "mooseeeeeeeeeeeeeeeeee",
        ])
      );
    });
    it("should return false when no crns", () => {
      assert.isFalse(invalidCrnList([]));
    });
    it("should return true when null crns", () => {
      assert.isTrue(invalidCrnList([null]));
    });
    it("should return false when valid crn list", () => {
      assert.isFalse(
        invalidCrnList([
          "crn:v1:bluemix:public:abcdf",
          "crn:v1:bluemix:public:abcde",
        ])
      );
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
  describe("invalidIdentityProviderURI", () => {
    it("should return true when identity_provider is invalid", () => {
      let actualData = invalidIdentityProviderURI({
        identity_provider: "",
      });
      assert.isTrue(actualData);
    });
    it("should return false when identity_provider is valid", () => {
      let actualData = invalidIdentityProviderURI({
        identity_provider: "http://identity",
      });
      assert.isFalse(actualData);
    });
  });
  describe("isValidUrl", () => {
    it("should be true for empty or null string", () => {
      assert.isTrue(isValidUrl("") && isValidUrl(null) && isValidUrl("null"));
    });
    it("should be false for invalid url", () => {
      assert.isFalse(isValidUrl("invalid.url"));
    });
    it("should be true for valid url", () => {
      assert.isTrue(
        isValidUrl(
          "https://declarations.s3.us-east.cloud-object-storage.appdomain.cloud/do_declaration.json"
        )
      );
    });
  });
  describe("hasOverlappingCidr", () => {
    it("should return true if cidr exists already", () => {
      let craigData = require("../data-files/craig-json.json");
      let actualData = hasOverlappingCidr({
        store: {
          json: craigData,
        },
      })(
        {
          name: "test",
          cidr: "10.20.10.0/24",
        },
        {
          data: {
            name: "",
          },
        }
      );
      assert.isTrue(
        actualData.invalid,
        "it should return true when overlapping cidr"
      );
    });
    it("should return true if cidr does not already exist but does overlap", () => {
      let craigData = require("../data-files/craig-json.json");
      let actualData = hasOverlappingCidr({
        store: {
          json: craigData,
        },
      })(
        {
          name: "vsi-zone-1",
          cidr: "10.20.20.1/32",
        },
        {
          data: {
            name: "vsi-zone-1",
          },
        }
      );
      assert.isTrue(
        actualData.invalid,
        "it should return true when overlapping cidr"
      );
    });
  });
  describe("invalidCidr", () => {
    it("should return true if cidr is null", () => {
      assert.isTrue(
        invalidCidr({})({ cidr: null }, { data: { cidr: "1.2.3.4/5" } }),
        "it should return correct data"
      );
    });
    it("should return false if cidr is equal to props", () => {
      assert.isFalse(
        invalidCidr({})({ cidr: "1.2.3.4/5" }, { data: { cidr: "1.2.3.4/5" } }),
        "it should return correct data"
      );
    });
    it("should return true if cidr is not valid", () => {
      assert.isTrue(
        invalidCidr({})({ cidr: "aaa" }, { data: { cidr: "1.2.3.4/5" } }),
        "it should return correct data"
      );
    });
    it("should return true if cidr is too many addresses", () => {
      assert.isTrue(
        invalidCidr({})(
          { cidr: "10.0.0.0/11" },
          { data: { cidr: "1.2.3.4/5" } }
        ),
        "it should return correct data"
      );
    });
    it("should return true if cidr overlaps with existing cidr", () => {
      let craig = {
        store: {
          json: require("../data-files/craig-json.json"),
        },
      };
      assert.isTrue(
        invalidCidr(craig)({ cidr: "10.10.30.0/24" }, { data: {} }),
        "Warning: CIDR overlaps with 10.10.30.0/24",
        "it should return correct data"
      );
    });
    it("should return false if cidr does not overlap with existing cidr", () => {
      let craig = {
        store: {
          json: require("../data-files/craig-json.json"),
        },
      };
      assert.isFalse(
        invalidCidr(craig)({ cidr: "10.10.80.0/24" }, { data: {} }),
        "it should be true"
      );
    });
  });
  describe("invalidProjectName", () => {
    it("it should be false if name is unique", () => {
      last_save = Date.now();
      assert.isFalse(
        invalidProjectName(
          { name: "blue", description: "test description", json: {} },
          { projects: { test: { name: "test", last_save } } }
        ),
        "it should be false"
      );
    });
    it("it should be true if name is empty string", () => {
      assert.isTrue(
        invalidProjectName(
          { name: "", description: "test description", json: {} },
          { projects: { test: { name: "test", last_save } } }
        ),
        "it should be true"
      );
    });
    it("should be true if name is already in use", () => {
      last_save = Date.now();
      assert.isTrue(
        invalidProjectName(
          { name: "test", description: "test description", json: {} },
          { projects: { test: { name: "test", last_save } } }
        ),
        "it should be true"
      );
    });
  });
  describe("invalidProjectDescription", () => {
    it("should be false if description is empty string", () => {
      assert.isFalse(invalidProjectDescription(""), "it should be false");
    });
    it("should be true if more than 100 characters", () => {
      assert.isTrue(
        invalidProjectDescription(
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        ),
        "it should be true"
      );
    });
    it("should be true if contains invalid characters", () => {
      assert.isTrue(
        invalidProjectDescription("%%%$$@@@;{}"),
        "it should be true"
      );
    });
  });
  describe("invalidCbrRule", () => {
    it("should return false when api_type_id empty string", () => {
      assert.isFalse(invalidCbrRule("api_type_id", { api_type_id: "" }));
    });
    it("should return true when api_type_id is invalid string", () => {
      assert.isTrue(invalidCbrRule("api_type_id", { api_type_id: "?" }));
    });
    it("should return true when description contains invalid character", () => {
      assert.isTrue(invalidCbrRule("description", { description: "\x00" }));
    });
    it("should return true when description is more than 300 chars", () => {
      let longDescription = "*".repeat(301);
      assert.isTrue(
        invalidCbrRule("description", {
          description: longDescription,
        })
      );
    });
    it("should return true when empty string", () => {
      assert.isTrue(invalidCbrRule("value", { value: "" }));
    });
    it("should return true if enforcement_mode not selected", () => {
      assert.isTrue(
        invalidCbrRule("enforcement_mode", { enforcement_mode: "" })
      );
    });
    it("should return false when operator is empty", () => {
      assert.isFalse(invalidCbrRule("operator", { operator: "" }));
    });
    it("should return true when operator is not empty and doesn't match regex", () => {
      assert.isTrue(invalidCbrRule("operator", { operator: "??" }));
    });
  });
  describe("invalidCbrZone", () => {
    it("should return true when description contains invalid character", () => {
      assert.isTrue(invalidCbrZone("description", { description: "\x00" }));
    });
    it("should return true when description is more than 300 chars", () => {
      let longDescription = "*".repeat(301);
      assert.isTrue(
        invalidCbrRule("description", {
          description: longDescription,
        })
      );
    });
    it("should return true when invalid ip when type is ipAddress and ip is cidr", () => {
      assert.isTrue(
        invalidCbrZone("value", { type: "ipAddress", value: "2.2.2.2/12" })
      );
    });
    it("should return true when not ip", () => {
      assert.isTrue(
        invalidCbrZone("value", { type: "ipAddress", value: "blah" })
      );
    });
    it("should return false when valid ip range", () => {
      assert.isFalse(
        invalidCbrZone("value", { type: "ipRange", value: "2.2.2.2-2.2.2.2" })
      );
    });
    it("should check that all other value/type combos match regex", () => {
      assert.isTrue(invalidCbrZone("value", { type: "vpc", value: "?@?" }));
    });
    it("should allow empty fields if not value", () => {
      assert.isFalse(invalidCbrZone("service_type", { service_type: "" }));
    });
    it("should return true if invalid field that is typed in", () => {
      assert.isTrue(
        invalidCbrZone("service_instance", { service_instance: "?@?#(#*" })
      );
    });
  });
  describe("validRecord", () => {
    let validSRV = {
      type: "SRV",
      port: 2,
      protocol: "TCP",
      priority: 1,
      service: "_hi",
      weight: 2,
    };
    it("should be valid if type is MX and preference is between 1 and 65535", () => {
      assert.isTrue(validRecord({ type: "MX", preference: 2 }, {}));
    });
    it("should be true when all values are valid for type SRV", () => {
      assert.isTrue(validRecord(validSRV, {}));
    });
    it("should be false if invalid service when type SRV", () => {
      validSRV.service = null;
      assert.isFalse(validRecord(validSRV, {}));
    });
    it("should be false when service undefined", () => {
      validSRV.service = undefined;
      assert.isFalse(validRecord(validSRV, {}));
    });
    it("should be false if any value is invalid when type SRV", () => {
      validSRV.port = -1;
      assert.isFalse(validRecord(validSRV, {}));
    });
    it("should return true when type is not MX or SRV", () => {
      assert.isTrue(validRecord({ type: "A" }, {}));
    });
  });
  describe("invalidDescription", () => {
    it("should return false when description is empty string", () => {
      assert.isFalse(invalidDescription("", {}));
    });
    it("should return true when description has invalid chars", () => {
      assert.isTrue(invalidDescription("@", {}));
    });
  });
  describe("nullOrEmptyStringCheckCallback", () => {
    assert.isTrue(nullOrEmptyStringCheckCallback("rdata")({ rdata: "" }, {}));
  });
  describe("invalidDnsZoneName", () => {
    it("should return if string is not valid", () => {
      assert.isTrue(
        invalidDnsZoneName(
          { name: null },
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
        )
      );
    });
    it("should allow periods within the name", () => {
      assert.isFalse(
        invalidDnsZoneName(
          { name: "example.com" },
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
        )
      );
    });
    it("should not allow periods at the end of the name", () => {
      assert.isTrue(
        invalidDnsZoneName(
          { name: "example.com." },
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
        )
      );
    });
  });
  describe("invalidCrns", () => {
    it("should return true if invalid crn list", () => {
      assert.isTrue(
        invalidCrns(
          {
            crns: ["aaa"],
          },
          "it should be true"
        )
      );
    });
  });
  describe("invalidCpuCallback", () => {
    it("should be true for non integer value", () => {
      assert.isTrue(
        invalidCpuCallback(
          {
            cpu: 2.5,
          },
          {
            cpuMin: 0,
            cpuMax: 28,
          },
          "it should be true"
        )
      );
    });
    it("should be true for invalid range", () => {
      assert.isTrue(
        invalidCpuCallback(
          {
            cpu: 100,
          },
          {
            cpuMin: 0,
            cpuMax: 28,
          },
          "it should be true"
        )
      );
    });
    it("should be false for valid range", () => {
      assert.isFalse(
        invalidCpuCallback(
          {
            cpu: 25,
          },
          {
            cpuMin: 0,
            cpuMax: 28,
          },
          "it should be false"
        )
      );
    });
    it("should be false for value of zero", () => {
      assert.isFalse(
        invalidCpuCallback(
          {
            cpu: 0,
          },
          {
            cpuMin: 0,
            cpuMax: 28,
          },
          "it should be false"
        )
      );
    });
    it("should be false for empty string and null", () => {
      assert.isFalse(
        invalidCpuCallback(
          {
            cpu: "",
          },
          {
            cpuMin: 0,
            cpuMax: 28,
          },
          "it should be false"
        )
      );
      assert.isFalse(
        invalidCpuCallback(
          {
            cpu: null,
          },
          {
            cpuMin: 0,
            cpuMax: 28,
          },
          "it should be false"
        )
      );
    });
  });
});
