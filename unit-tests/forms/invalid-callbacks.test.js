const { assert } = require("chai");
const { invalidName } = require("../../client/src/lib/forms");

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
});
