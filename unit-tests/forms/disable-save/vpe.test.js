const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
