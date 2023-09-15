const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
