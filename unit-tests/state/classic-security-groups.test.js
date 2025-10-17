const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("classic security groups state", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
    craig.classic_security_groups.create({ name: "test", description: "" });
  });
  describe("classic_security_groups.init", () => {
    it("should initialize classic security groups", () => {
      craig = newState(); // test for init without creation
      assert.deepEqual(
        craig.store.json.classic_security_groups,
        [],
        "it should initialize data",
      );
    });
  });
  describe("classic_security_groups.create", () => {
    it("should create a security group", () => {
      assert.deepEqual(
        craig.store.json.classic_security_groups,
        [
          {
            name: "test",
            description: "",
            classic_sg_rules: [],
          },
        ],
        "it should return correct data",
      );
    });
  });
  describe("classic_security_groups.save", () => {
    it("should update a security group", () => {
      craig.classic_security_groups.save(
        { name: "test2", description: "" },
        {
          craig: craig,
          data: {
            name: "test",
          },
        },
      );
      assert.deepEqual(
        craig.store.json.classic_security_groups,
        [
          {
            name: "test2",
            description: "",
            classic_sg_rules: [],
          },
        ],
        "it should return correct data",
      );
    });
    it("should update a security group and rules", () => {
      craig.classic_security_groups.save(
        {
          name: "test2",
          description: "",
          classic_sg_rules: [
            {
              classic_sg: "test",
            },
          ],
        },
        {
          craig: craig,
          data: {
            name: "test",
          },
        },
      );
      assert.deepEqual(
        craig.store.json.classic_security_groups,
        [
          {
            name: "test2",
            description: "",
            classic_sg_rules: [
              {
                classic_sg: "test2",
              },
            ],
          },
        ],
        "it should return correct data",
      );
    });
  });
  describe("classic_security_groups.delete", () => {
    it("should delete a security group", () => {
      craig.classic_security_groups.delete(
        {},
        { data: { name: "test", description: "" } },
      );
      assert.deepEqual(
        craig.store.json.classic_security_groups,
        [],
        "it should return correct data",
      );
    });
  });
  describe("classic_security_groups.schema", () => {
    it("should return return false if description is valid", () => {
      assert.isFalse(
        craig.classic_security_groups.description.invalid({
          description: "toad",
        }),
        "it should return false",
      );
    });
  });
  describe("classic_security_groups.classic_sg_rules", () => {
    describe("create", () => {
      it("should create a security group rule", () => {
        craig.classic_security_groups.classic_sg_rules.create(
          { name: "example", direction: "inbound" },
          {
            craig: craig,
            innerFormProps: {
              arrayParentName: "test",
            },
          },
        );
        assert.deepEqual(
          craig.store.json.classic_security_groups[0].classic_sg_rules,
          [
            {
              name: "example",
              direction: "inbound",
              classic_sg: "test",
            },
          ],
        );
      });
    });
    describe("save", () => {
      it("should create a security group rule", () => {
        craig.classic_security_groups.classic_sg_rules.create(
          { name: "example", direction: "inbound" },
          {
            craig: craig,
            innerFormProps: {
              arrayParentName: "test",
            },
          },
        );
        craig.classic_security_groups.classic_sg_rules.save(
          { name: "example2", direction: "inbound" },
          {
            craig: craig,
            arrayParentName: "test",
            data: { name: "example", direction: "inbound" },
          },
        );
        assert.deepEqual(
          craig.store.json.classic_security_groups[0].classic_sg_rules,
          [
            {
              name: "example2",
              direction: "inbound",
              classic_sg: "test",
            },
          ],
        );
      });
    });
    describe("delete", () => {
      it("should delete a security group rule", () => {
        craig.classic_security_groups.classic_sg_rules.create(
          { name: "example", direction: "inbound" },
          {
            craig: craig,
            innerFormProps: {
              arrayParentName: "test",
            },
          },
        );
        craig.classic_security_groups.classic_sg_rules.delete(
          { name: "example2", direction: "inbound" },
          {
            craig: craig,
            arrayParentName: "test",
            data: { name: "example", direction: "inbound" },
          },
        );
        assert.deepEqual(
          craig.store.json.classic_security_groups[0].classic_sg_rules,
          [],
        );
      });
    });
    it("should disable save for rule", () => {
      assert.isTrue(
        disableSave("classic_sg_rules", {}, { craig: craig }),
        "it should be disabled",
      );
    });
    describe("schema", () => {
      it("should have an invalid name when the parent sg has a rule with the same name", () => {
        craig.classic_security_groups.classic_sg_rules.create(
          { name: "example", direction: "inbound" },
          {
            craig: craig,
            innerFormProps: {
              arrayParentName: "test",
            },
          },
        );
        assert.isTrue(
          craig.classic_security_groups.classic_sg_rules.name.invalid(
            {
              name: "example",
            },
            { craig: craig, arrayParentName: "test" },
          ),
        );
      });
      it("should return correct protocol on input change", () => {
        assert.deepEqual(
          craig.classic_security_groups.classic_sg_rules.ruleProtocol.onInputChange(
            {},
          ),
          "",
          "it should return correct data",
        );
        assert.deepEqual(
          craig.classic_security_groups.classic_sg_rules.ruleProtocol.onInputChange(
            {
              ruleProtocol: "All",
            },
          ),
          "all",
          "it should return correct data",
        );
      });
      it("should return correct provol on render", () => {
        assert.deepEqual(
          craig.classic_security_groups.classic_sg_rules.ruleProtocol.onRender(
            {},
          ),
          "",
          "it should return correct data",
        );
        assert.deepEqual(
          craig.classic_security_groups.classic_sg_rules.ruleProtocol.onRender({
            ruleProtocol: "all",
          }),
          "All",
          "it should return correct data",
        );
        assert.deepEqual(
          craig.classic_security_groups.classic_sg_rules.ruleProtocol.onRender({
            ruleProtocol: "icmp",
          }),
          "ICMP",
          "it should return correct data",
        );
      });
      describe("port_range_min", () => {
        it("should hide when rule protcol is not icmp, tcp, or udp", () => {
          assert.isTrue(
            craig.classic_security_groups.classic_sg_rules.port_range_min.hideWhen(
              {},
            ),
            "it should be hidden",
          );
        });
        it("should return correct invalid value", () => {
          assert.isFalse(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalid(
              {},
            ),
            "it should be false",
          );
          assert.isFalse(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalid(
              {
                ruleProtocol: "all",
              },
            ),
            "it should be false",
          );
          assert.isTrue(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalid(
              {
                ruleProtocol: "icmp",
                port_range_min: "9999999",
              },
            ),
            "it should be true",
          );
          assert.isFalse(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalid(
              {
                ruleProtocol: "icmp",
                port_range_min: "1",
              },
            ),
            "it should be true",
          );
          assert.isTrue(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalid(
              {
                ruleProtocol: "udp",
                port_range_min: "aaaa",
              },
            ),
            "it should be true",
          );
          assert.isTrue(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalid(
              {
                ruleProtocol: "udp",
                port_range_min: "9999999999",
              },
            ),
            "it should be true",
          );
        });
        it("should return correct invalid text value", () => {
          assert.deepEqual(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalidText(
              {},
            ),
            "",
            "it should return correct value",
          );
          assert.deepEqual(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalidText(
              {
                ruleProtocol: "all",
              },
            ),
            "",
            "it should return correct value",
          );
          assert.deepEqual(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalidText(
              {
                ruleProtocol: "icmp",
                port_range_min: "aaaa",
              },
            ),
            "Enter a whole number between 0 and 254",
            "it should be true",
          );
          assert.deepEqual(
            craig.classic_security_groups.classic_sg_rules.port_range_min.invalidText(
              {
                ruleProtocol: "udp",
                port_range_min: "aaaa",
              },
            ),
            "Enter a whole number between 1 and 65535",
            "it should be true",
          );
        });
      });
      describe("port_range_max", () => {
        it("should return values for type rather than code", () => {
          assert.isTrue(
            craig.classic_security_groups.classic_sg_rules.port_range_max.invalid(
              {
                ruleProtocol: "icmp",
                port_range_min: "aaaa",
              },
            ),
            "it should be true",
          );
          assert.isFalse(
            craig.classic_security_groups.classic_sg_rules.port_range_max.invalid(
              {
                ruleProtocol: "icmp",
                port_range_max: "1",
              },
            ),
            "it should be true",
          );
          assert.isFalse(
            craig.classic_security_groups.classic_sg_rules.port_range_max.invalid(
              {
                ruleProtocol: "icmp",
                port_range_max: "0",
              },
            ),
            "it should be true",
          );
          assert.isTrue(
            craig.classic_security_groups.classic_sg_rules.port_range_max.invalid(
              {
                ruleProtocol: "tcp",
                port_range_max: "0",
              },
            ),
            "it should be true",
          );
          assert.deepEqual(
            craig.classic_security_groups.classic_sg_rules.port_range_max.invalidText(
              {
                ruleProtocol: "icmp",
                port_range_min: "aaaa",
              },
            ),
            "Enter a whole number between 0 and 255",
            "it should be true",
          );
        });
      });
    });
  });
});
