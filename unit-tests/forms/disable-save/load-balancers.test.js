const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

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
