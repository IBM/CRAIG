const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
