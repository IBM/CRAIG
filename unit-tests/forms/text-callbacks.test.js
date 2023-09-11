const { assert } = require("chai");
const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  aclHelperTextCallback,
  invalidSubnetTierText,
  iamAccountSettingInvalidText,
  invalidSecurityGroupRuleText,
  clusterHelperTestCallback,
  accessGroupPolicyHelperTextCallback,
  invalidCidrText,
  invalidProjectNameText,
} = require("../../client/src/lib");
const {
  invalidCbrZoneText,
  invalidCbrRuleText,
} = require("../../client/src/lib/forms");
const {
  invalidDNSDescriptionText,
  invalidCrnText,
  invalidCpuTextCallback,
  powerVsWorkspaceHelperText,
} = require("../../client/src/lib/forms/text-callbacks");

describe("text callbacks", () => {
  describe("resourceGroupHelperTextCallback", () => {
    it("should return the correct helper text when using prefix", () => {
      let actualData = resourceGroupHelperTextCallback(
        {
          name: "test",
          use_prefix: true,
        },
        {
          craig: {
            store: {
              json: {
                _options: {
                  prefix: "iac",
                },
              },
            },
          },
        }
      );
      assert.deepEqual(actualData, "iac-test", "it should return correct data");
    });
    it("should return the correct helper text when not using prefix", () => {
      let actualData = resourceGroupHelperTextCallback(
        {
          name: "test",
          use_prefix: false,
        },
        {
          craig: {
            store: {
              json: {
                _options: {
                  prefix: "iac",
                },
              },
            },
          },
        }
      );
      assert.deepEqual(actualData, "test", "it should return correct data");
    });
  });
  describe("genericNameCallback", () => {
    it("should return correct callback text", () => {
      assert.deepEqual(
        genericNameCallback(),
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        "it should return callback text"
      );
    });
  });
  describe("invalidNameText", () => {
    it("should return the correct text when a duplicate name is passed", () => {
      let actualData = invalidNameText("resource_groups")(
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
      assert.deepEqual(
        actualData,
        'Name "test" already in use',
        "it should return correct message"
      );
    });
    it("should return the correct text when an otherwise invalid name is passed", () => {
      let actualData = invalidNameText("resource_groups")(
        {
          name: "AAAAAA",
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
      assert.deepEqual(
        actualData,
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        "it should return correct message"
      );
    });
    it("should return true if subnet has a duplicate name", () => {
      let actualData = invalidNameText("subnet", {
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
      })(
        { tier: "frog", cidr: "1.2.3.4/15", name: "@@@@" },
        {
          data: {
            name: "",
          },
          vpc_name: "test",
        }
      );
      assert.deepEqual(
        actualData,
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        "it should be true"
      );
    });
    it("should return true if vpc has a duplicate name", () => {
      let actualData = invalidNameText("vpcs")(
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
      assert.deepEqual(
        actualData,
        'Name "test" already in use',
        "it should be true"
      );
    });
    it("should return true if vpc acl has a duplicate name", () => {
      let actualData = invalidNameText("vpcs")(
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
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should return true if vpc acl has a duplicate name with existing acl", () => {
      let actualData = invalidNameText("vpcs")(
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
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should return false if vpc routing table name is empty string", () => {
      let actualData = invalidNameText("vpcs")("default_routing_table_name", {
        default_routing_table_name: "",
      });
      assert.deepEqual(actualData, "", "it should be false");
    });
    it("should return true if vpc routing table has a duplicate name", () => {
      let actualData = invalidNameText("vpcs")(
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
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should return true if vpc security group has a duplicate name", () => {
      let actualData = invalidNameText("vpcs")(
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
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should return true if vpc acl has a duplicate name with existing sg", () => {
      let actualData = invalidNameText("vpcs")(
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
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
  });
  describe("cosResourceHelperTextCallback", () => {
    it("should return text if using data", () => {
      assert.deepEqual(
        cosResourceHelperTextCallback({ use_data: true, name: "test" }),
        "test",
        "it should display data"
      );
    });
    it("should return text if not using data and with random suffix", () => {
      assert.deepEqual(
        cosResourceHelperTextCallback(
          { use_data: false, use_random_suffix: true, name: "test" },
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "test",
                  },
                },
              },
            },
          }
        ),
        "test-test-<random-suffix>",
        "it should display data"
      );
    });
    it("should return text if not using data and without random suffix", () => {
      assert.deepEqual(
        cosResourceHelperTextCallback(
          { use_data: false, use_random_suffix: false, name: "test" },
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "test",
                  },
                },
              },
            },
          }
        ),
        "test-test",
        "it should display data"
      );
    });
  });
  describe("aclHelperTextCallback", () => {
    it("should return correct text", () => {
      assert.deepEqual(
        aclHelperTextCallback(
          { name: "test" },
          {
            vpc_name: "vpc",
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "iac",
                  },
                },
              },
            },
          }
        ),
        "iac-vpc-test-acl",
        "it should return correct text"
      );
    });
  });
  describe("clusterHelperTestCallback", () => {
    it("should return correct text", () => {
      assert.deepEqual(
        clusterHelperTestCallback(
          { name: "test" },
          {
            vpc_name: "vpc",
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "iac",
                  },
                },
              },
            },
          }
        ),
        "iac-test-cluster",
        "it should return correct text"
      );
    });
  });
  describe("invalidSubnetTierText", () => {
    it("should return true when name invalid", () => {
      let actualData = invalidSubnetTierText(
        { name: "@@@" },
        {
          vpc_name: "test",
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
      );
      let expectedData =
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return true when name duplicate", () => {
      let actualData = invalidSubnetTierText(
        { name: "frog" },
        {
          vpc_name: "test",
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
      );
      let expectedData = 'Name "frog" already in use';
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("iamAccountSettingInvalidText", () => {
    it("should return correct text when max_sessions_per_identity is invalid", () => {
      let actualData = iamAccountSettingInvalidText(
        "max_sessions_per_identity"
      );
      let expectedData = "Value must be in range [1-10]";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct text"
      );
    });
    it("should return correct text when any other field is invalid", () => {
      let actualData = iamAccountSettingInvalidText("frog");
      let expectedData = "Invalid";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct text"
      );
    });
  });
  describe("invalidSecurityGroupRuleText", () => {
    it("should return generic name callback when an invalid name is passed", () => {
      assert.deepEqual(
        invalidSecurityGroupRuleText(
          { name: "@@@" },
          { innerFormProps: { rules: [] }, data: { name: "" } }
        ),
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        "it should return error text"
      );
    });
    it("should return generic name callback when an invalid duplicate name is passed", () => {
      assert.deepEqual(
        invalidSecurityGroupRuleText(
          { name: "aaa" },
          { innerFormProps: { rules: [{ name: "aaa" }] }, data: { name: "" } }
        ),
        'Name "aaa" already in use',
        "it should return error text"
      );
    });
  });
  describe("accessGroupPolicyHelperTextCallback", () => {
    it("should return text with prefix and random suffix", () => {
      assert.deepEqual(
        accessGroupPolicyHelperTextCallback(
          { name: "policy" },
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "test",
                  },
                },
              },
            },
          }
        ),
        "test-policy",
        "it should display data"
      );
    });
  });
  describe("invalidCidrText", () => {
    it("should return correct text if cidr is null", () => {
      assert.deepEqual(
        invalidCidrText({})({ cidr: null }, { data: { cidr: "1.2.3.4/5" } }),
        "Invalid CIDR block",
        "it should return correct data"
      );
    });
    it("should return correct text if cidr is not valid", () => {
      assert.deepEqual(
        invalidCidrText({})({ cidr: "aaa" }, { data: { cidr: "1.2.3.4/5" } }),
        "Invalid CIDR block",
        "it should return correct data"
      );
    });
    it("should return correct text if cidr is too many addresses", () => {
      assert.deepEqual(
        invalidCidrText({})(
          { cidr: "10.0.0.0/11" },
          { data: { cidr: "1.2.3.4/5" } }
        ),
        "CIDR ranges of /17 or less are not supported",
        "it should return correct data"
      );
    });
    it("should return correct text if cidr overlaps with existing cidr", () => {
      let craig = {
        store: {
          json: require("../data-files/craig-json.json"),
        },
      };
      assert.deepEqual(
        invalidCidrText(craig)({ cidr: "10.10.30.0/24" }, { data: {} }),
        "Warning: CIDR overlaps with 10.10.30.0/24",
        "it should return correct data"
      );
    });
    it("should return correct text if cidr does not overlap with existing cidr", () => {
      let craig = {
        store: {
          json: require("../data-files/craig-json.json"),
        },
      };
      assert.deepEqual(
        invalidCidrText(craig)({ cidr: "10.10.80.0/24" }, { data: {} }),
        "",
        "it should return correct data"
      );
    });
    it("should return correct text if cidr matches previous cidr", () => {
      let craig = {
        store: {
          json: require("../data-files/craig-json.json"),
        },
      };
      assert.deepEqual(
        invalidCidrText(craig)(
          { cidr: "10.10.80.0/24" },
          { data: { cidr: "10.10.80.0/24" } }
        ),
        "",
        "it should return correct data"
      );
    });
  });
  describe("invalidCbrRuleText", () => {
    it("returns error message for invalid api_type_id field", () => {
      let errorMessage = invalidCbrRuleText("api_type_id", {}, {});
      assert.equal(
        errorMessage,
        "Invalid api_type_id. Must match the regex expression /^[a-zA-Z0-9_.-:]+$/"
      );
    });
    it("returns error message for invalid description field", () => {
      let errorMessage = invalidCbrRuleText("description", {}, {});
      assert.equal(
        errorMessage,
        "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/"
      );
    });
    it("returns error message for invalid value field", () => {
      let errorMessage = invalidCbrRuleText("value", {}, {});
      assert.equal(
        errorMessage,
        "Invalid value. Must match the regex expression /^[Ss]+$/"
      );
    });
    it("returns error message for invalid operator field", () => {
      let errorMessage = invalidCbrRuleText("operator", {}, {});
      assert.equal(
        errorMessage,
        "Invalid operator. Must match the regex expression /^[a-zA-Z0-9]+$/"
      );
    });
    it("returns no invalid text for other fields", () => {
      assert.equal(invalidCbrRuleText("not real field", {}, {}), "");
    });
  });
  describe("invalidCbrZoneText", () => {
    it("returns error message for invalid description field", () => {
      let errorMessage = invalidCbrZoneText("description", {}, {});
      assert.equal(
        errorMessage,
        "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/"
      );
    });
    it("returns no invalid text for other fields", () => {
      assert.equal(invalidCbrZoneText("not real field", {}, {}), "");
    });
  });
  describe("invalidProjectNameText", () => {
    it("it should return an empty string if name is unique", () => {
      last_save = Date.now();
      assert.deepEqual(
        invalidProjectNameText(
          { name: "blue" },
          { projects: { test: { name: "test", last_save } } }
        ),
        ""
      );
    });
    it("it should be true if name is empty string", () => {
      assert.deepEqual(
        invalidProjectNameText({ name: "" }, {}),
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s"
      );
    });
    it("should be true if name is already in use", () => {
      last_save = Date.now();
      assert.deepEqual(
        invalidProjectNameText(
          { name: "test" },
          { projects: { test: { name: "test", last_save } } }
        ),
        `Name "test" already in use`
      );
    });
  });
  describe("invalidDNSDescriptionText", () => {
    assert.deepEqual(
      invalidDNSDescriptionText({}, {}),
      "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/."
    );
  });
  describe("invalidCrnText", () => {
    it("should return empty string when not invalid", () => {
      assert.deepEqual(
        invalidCrnText({
          crns: undefined,
        }),
        "",
        "it should return correct message"
      );
    });
    it("should return empty string when invalid", () => {
      assert.deepEqual(
        invalidCrnText({
          crns: ["aaa"],
        }),
        "Enter a valid comma separated list of CRNs",
        "it should return correct message"
      );
    });
  });
  describe("invalidCpuTextCallback", () => {
    let minCpu = 0;
    let maxCpu = 28;
    assert.deepEqual(
      invalidCpuTextCallback(
        {},
        {
          cpuMin: minCpu,
          cpuMax: maxCpu,
        }
      ),
      `Using dedicated cores requires a minimum of ${minCpu} cores and a maximum of ${maxCpu} cores per member. For shared CPU, select 0 cores.`
    );
  });
  describe("powerVsWorkspaceHelperText", () => {
    it("should return correct helper text", () => {
      assert.deepEqual(
        powerVsWorkspaceHelperText(
          { name: "frog" },
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "toad",
                  },
                },
              },
            },
          }
        ),
        "toad-power-workspace-frog",
        "it should return correct helper text"
      );
    });
  });
});
