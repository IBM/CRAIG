const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("vpn_servers", () => {
  it("should return true if vpn server has invalid name", () => {
    let actualData = disableSave(
      "vpn_servers",
      { name: "@@@" },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if vpn server has invalid vpc", () => {
    let actualData = disableSave(
      "vpn_servers",
      { name: "hi", vpc: "" },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid port range", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "aaa",
        port: -1000,
        client_ip_pool: "aaa",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid port decimal", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "aaa",
        port: 2.3,
        client_ip_pool: "aaa",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid client_idle_timeout range", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "aaa",
        port: 200,
        client_idle_timeout: -1000,
        client_ip_pool: "aaa",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid client_idle_timeout decimal", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "aaa",
        port: 200,
        client_idle_timeout: 2.3,
        client_ip_pool: "aaa",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid certificate_crn", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "aaa",
        method: "certificate",
        port: 1,
        client_ip_pool: "aaa",
        client_ca_crn: "CHEATER",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid client_ca_crn and method is certificate", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "certificate",
        port: 1,
        client_ip_pool: "aaa",
        client_ca_crn: "",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid cidr", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "username",
        port: 1,
        client_ip_pool: "aaa",
        client_ca_crn: "",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with ip as cidr", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "username",
        port: 1,
        client_ip_pool: "1.2.3.4",
        client_ca_crn: "",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with invalid dns server ips", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        method: "username",
        port: 1,
        client_ip_pool: "1.2.3.4/23",
        client_ca_crn: "CHEATER",
        client_dns_server_ips: "asdasd",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return true if fields are otherwise valid with no subnets", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnets: [],
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        client_dns_server_ips: "1.2.3.4",
        method: "username",
        port: 1,
        client_ip_pool: "1.2.3.4/23",
        client_ca_crn: "CHEATER",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should return false if fields are otherwise valid when method is certificate", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        subnets: ["aaa"],
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        client_dns_server_ips: "1.2.3.4",
        method: "certificate",
        port: 1,
        client_idle_timeout: 2,
        client_ip_pool: "1.2.3.4/23",
        client_ca_crn: "CHEATER",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });

  it("should return false if fields are otherwise valid when method is username", () => {
    let actualData = disableSave(
      "vpn_servers",
      {
        name: "aaa",
        resource_group: "aa",
        vpc: "aaa",
        subnet: "aaa",
        subnets: ["aaa"],
        security_groups: ["aaa"],
        certificate_crn: "CHEATER",
        client_dns_server_ips: "1.2.3.4",
        method: "username",
        port: 1,
        client_idle_timeout: 2,
        client_ip_pool: "1.2.3.4/23",
        client_ca_crn: "",
      },
      {
        data: {
          name: "",
        },
        craig: {
          store: {
            json: {
              vpn_servers: [],
            },
          },
        },
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });
  describe("vpn server routes", () => {
    it("should return true if route has invalid name", () => {
      let actualData = disableSave(
        "vpn_server_routes",
        { name: "@@@" },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
    it("should return true if route has invalid cidr block", () => {
      let actualData = disableSave(
        "vpn_server_routes",
        { name: "aaa", destination: "aaa" },
        {
          data: {
            name: "",
          },
          craig: {
            store: {
              json: {
                vpn_servers: [],
              },
            },
          },
        }
      );
      assert.isTrue(actualData, "it should be disabled");
    });
  });
});
