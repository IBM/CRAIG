const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
