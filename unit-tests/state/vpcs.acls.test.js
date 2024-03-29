const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { splat, distinct, splatContains } = require("lazy-z");

/**
 * initialize store
 * @param {boolean=} legacy
 * @returns {lazyZState} state store
 */
function newState(legacy) {
  let store = new state(legacy);
  store.setUpdateCallback(() => {});
  return store;
}

describe("vpc network acls", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("vpcs.network_acls", () => {
    describe("vpcs.network_acls.create", () => {
      it("should create an acl", () => {
        craig.vpcs.acls.create({ name: "new" }, { vpc_name: "management" });
        let expectedData = {
          name: "new",
          resource_group: "management-rg",
          vpc: "management",
          rules: [],
          use_data: false,
        };
        assert.deepEqual(
          craig.store.json.vpcs[0].acls[1],
          expectedData,
          "it should create acl"
        );
      });
      it("should create an acl with rg", () => {
        craig.store.json.vpcs[0].resource_group = null;
        craig.vpcs.acls.create(
          { name: "new", resource_group: "workload-rg" },
          { vpc_name: "management" }
        );
        let expectedData = {
          name: "new",
          resource_group: "workload-rg",
          vpc: "management",
          rules: [],
          use_data: false,
        };
        assert.deepEqual(
          craig.store.json.vpcs[0].acls[1],
          expectedData,
          "it should create acl"
        );
      });
      it("should create an acl and update rg when deleted", () => {
        craig.vpcs.acls.create({ name: "new" }, { vpc_name: "management" });
        craig.resource_groups.delete({}, { data: { name: "management-rg" } });
        let expectedData = {
          name: "new",
          resource_group: null,
          vpc: "management",
          rules: [],
          use_data: false,
        };
        assert.deepEqual(
          craig.store.json.vpcs[0].acls[1],
          expectedData,
          "it should create acl"
        );
      });
    });
    describe("vpcs.network_acls.delete", () => {
      it("should delete an acl", () => {
        craig.vpcs.acls.delete(
          {},
          { data: { name: "management" }, vpc_name: "management" }
        );
        let expectedData = [];
        assert.deepEqual(
          craig.store.json.vpcs[0].acls,
          expectedData,
          "it should delete acl"
        );
      });
      it("should set subnet acls to null on delete", () => {
        craig.store.json._options.dynamic_subnets = false;
        craig.vpcs.acls.delete(
          {},
          { data: { name: "management" }, vpc_name: "management" }
        );
        let expectedData = [];
        assert.deepEqual(
          craig.store.json.vpcs[0].acls,
          expectedData,
          "it should delete acl"
        );
        assert.deepEqual(
          distinct(splat(craig.store.json.vpcs[0].subnets, "network_acl")),
          [null],
          "it should have correct subnets"
        );
      });
    });
    describe("vpcs.network_acls.save", () => {
      it("should update an acl", () => {
        // control for unchanged acls
        craig.store.json.vpcs[0].subnets[1].network_acl = "frog";
        craig.vpcs.acls.save(
          { name: "new" },
          { data: { name: "management" }, vpc_name: "management" }
        );
        assert.deepEqual(
          craig.store.json.vpcs[0].acls[0].name,
          "new",
          "it should update acl"
        );
        assert.deepEqual(
          craig.store.json.vpcs[0].acls[0].rules[0].acl,
          "new",
          "it should have correct acl"
        );
        assert.deepEqual(
          craig.store.json.vpcs[0].subnets[0].network_acl,
          "new",
          "it should have correct acl"
        );
      });
      it("should update an acl with no name change", () => {
        craig.vpcs.acls.save(
          { name: "management", resource_group: "workload-rg" },
          { data: { name: "management" }, vpc_name: "management" }
        );
        assert.deepEqual(
          craig.store.json.vpcs[0].acls[0].resource_group,
          "workload-rg",
          "it should update acl rg"
        );
      });
    });
    describe("vpcs.network_acls.rules", () => {
      describe("vpcs.network_acls.rules.create", () => {
        it("should create a network acl rule", () => {
          craig.vpcs.acls.rules.create(
            {
              name: "frog",
              action: "allow",
              direction: "inbound",
              source: "8.8.8.8",
              destination: "0.0.0.0/0",
            },
            {
              vpc_name: "management",
              parent_name: "management",
            }
          );

          assert.deepEqual(
            craig.store.json.vpcs[0].acls[0].rules[4],
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "0.0.0.0/0",
              name: "frog",
              source: "8.8.8.8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            "it should add rule"
          );
        });
        it("should create a network acl rule with deny outbound", () => {
          craig.vpcs.acls.rules.create(
            {
              name: "frog",
              action: "deny",
              direction: "outbound",
              source: "8.8.8.8",
              destination: "0.0.0.0/0",
            },
            {
              vpc_name: "management",
              parent_name: "management",
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].acls[0].rules[4],
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "outbound",
              destination: "0.0.0.0/0",
              name: "frog",
              source: "8.8.8.8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            "it should add rule"
          );
        });
      });
      describe("vpcs.network_acls.rules.save", () => {
        it("should update a rule in place with all", () => {
          craig.vpcs.acls.rules.save(
            {
              name: "frog",
              allow: false,
              inbound: true,
              source: "1.2.3.4",
              destination: "5.6.7.8",
              ruleProtocol: "all",
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );

          assert.deepEqual(
            craig.store.json.vpcs[0].acls[0].rules[3],
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "inbound",
              destination: "5.6.7.8",
              name: "frog",
              source: "1.2.3.4",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            "it should update rule"
          );
        });
        it("should update a rule in place with protocol", () => {
          craig.vpcs.acls.rules.save(
            {
              name: "frog",
              allow: false,
              inbound: true,
              source: "1.2.3.4",
              destination: "5.6.7.8",
              ruleProtocol: "tcp",
              rule: {
                port_max: 8080,
                port_min: null,
              },
              port_max: 8080,
              port_min: null,
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].acls[0].rules[3],
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "inbound",
              destination: "5.6.7.8",
              name: "frog",
              source: "1.2.3.4",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 1,
                port_max: 8080,
                source_port_min: 1,
                source_port_max: 65535,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: 8080,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            "it should update rule"
          );
        });
        it("should update a rule in place with only one change protocol", () => {
          craig.vpcs.acls.rules.save(
            {
              name: "allow-all-outbound",
              allow: true,
              inbound: false,
              source: "10.0.0.0/8",
              destination: "0.0.0.0/0",
              ruleProtocol: "tcp",
              rule: {
                port_max: 8080,
                port_min: null,
              },
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );

          assert.deepEqual(
            craig.store.json.vpcs[0].acls[0].rules[3],
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "outbound",
              destination: "0.0.0.0/0",
              name: "allow-all-outbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 1,
                port_max: 8080,
                source_port_min: 1,
                source_port_max: 65535,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            "it should update rule"
          );
        });
        it("should update a rule in place with protocol and change port values to numbers from string", () => {
          craig.vpcs.acls.rules.save(
            {
              name: "frog",
              allow: false,
              inbound: true,
              source: "1.2.3.4",
              destination: "5.6.7.8",
              ruleProtocol: "tcp",
              rule: {
                port_max: "8080",
                port_min: null,
              },
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].acls[0].rules[3],
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "inbound",
              destination: "5.6.7.8",
              name: "frog",
              source: "1.2.3.4",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 1,
                port_max: 8080,
                source_port_min: 1,
                source_port_max: 65535,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            "it should update rule"
          );
        });
      });
      describe("vpcs.network_acls.rules.delete", () => {
        it("should delete an acl rule", () => {
          craig.vpcs.acls.rules.delete(
            {},
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].acls[0].rules.length,
            3,
            "it should add rule"
          );
        });
      });
    });
  });
  describe("acl shcema", () => {
    it("should hide use data when vpc does not use data", () => {
      assert.isTrue(
        craig.vpcs.acls.use_data.hideWhen(
          {},
          {
            vpc_name: "vpc",
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "iac",
                  },
                  vpcs: [
                    {
                      name: "vpc",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be hidden"
      );
    });
    it("should return correct text", () => {
      assert.deepEqual(
        craig.vpcs.acls.name.helperText(
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
    it("should return correct text when use data", () => {
      assert.deepEqual(
        craig.vpcs.acls.name.helperText(
          { name: "test", use_data: true },
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
        "test",
        "it should return correct text"
      );
    });
    it("should set data when changing rule protocol", () => {
      let data = { ruleProtocol: "all" };
      craig.vpcs.acls.rules.ruleProtocol.onInputChange(data);
      assert.deepEqual(
        data,
        {
          rule: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            type: null,
            code: null,
          },
          ruleProtocol: "all",
          tcp: {
            port_min: null,
            port_max: null,
            source_port_max: null,
            source_port_min: null,
          },
          udp: {
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            port_max: null,
          },
          icmp: {
            type: null,
            code: null,
          },
        },
        "it should return data"
      );
    });
    it("should render value for each type when present on sub rule but not main", () => {
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: "null",
          },
        }),
        "",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: "null",
          },
          type: "1234",
        }),
        "1234",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.code.onRender({
          icmp: {
            code: "null",
          },
        }),
        "",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: null,
          },
          type: "443",
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.code.onRender({
          icmp: {
            code: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.code.onRender({
          icmp: {},
          code: "443",
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.port_max.onRender({
          tcp: {
            port_max: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.port_min.onRender({
          tcp: {
            port_min: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.source_port_max.onRender({
          tcp: {
            source_port_max: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.source_port_min.onRender({
          tcp: {
            source_port_min: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.source_port_min.onRender({
          tcp: {
            source_port_min: null,
          },
          source_port_min: "443",
        }),
        "443",
        "it should set sub rule"
      );
    });
    it("should set rule data on input change", () => {
      let data = {
        ruleProtocol: "all",
      };
      craig.vpcs.acls.rules.ruleProtocol.onInputChange(data);
      assert.deepEqual(
        data,
        {
          rule: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            type: null,
            code: null,
          },
          ruleProtocol: "all",
          tcp: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
          },
          udp: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
          },
          icmp: {
            type: null,
            code: null,
          },
        },
        "it should set rule"
      );
    });
    it("should render all as rule protocol", () => {
      assert.deepEqual(
        "ALL",
        craig.vpcs.acls.rules.ruleProtocol.onRender({ ruleProtocol: "all" }),
        "it should return protocol"
      );
    });
    it("should render TCP as rule protocol", () => {
      assert.deepEqual(
        "TCP",
        craig.vpcs.acls.rules.ruleProtocol.onRender({ ruleProtocol: "tcp" }),
        "it should return protocol"
      );
    });
    it("should render empty string as rule protocol", () => {
      assert.deepEqual(
        "",
        craig.vpcs.acls.rules.ruleProtocol.onRender({ ruleProtocol: "" }),
        "it should return protocol"
      );
    });
    it("should return invalid for object when no source", () => {
      assert.isTrue(
        craig.vpcs.acls.rules.source.invalid({}),
        "it should be true"
      );
    });
    it("should return invalid for object when no destination", () => {
      assert.isTrue(
        craig.vpcs.acls.rules.destination.invalid({}),
        "it should be true"
      );
    });
  });
});
