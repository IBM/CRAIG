const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
