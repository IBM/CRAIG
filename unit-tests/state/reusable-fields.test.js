const { assert } = require("chai");
const {
  hideWhenTcpOrUdp,
  hideWhenNotAllIcmp,
  onRuleFieldInputChange,
  invalidPort,
  invalidNewResourceName,
  hasDuplicateName,
} = require("../../client/src/lib/state/reusable-fields");
const { state } = require("../../client/src/lib");

describe("reusable fields", () => {
  describe("utility functions", () => {
    describe("duplicate name", () => {
      it("should not get a list if no id or parent name is provided for acl", () => {
        assert.isFalse(
          hasDuplicateName(
            "acls",
            {},
            {
              craig: new state(),
            },
            {},
          ),
          "it should return data",
        );
      });
      it("should not get a list if no id and parent name is provided for acl", () => {
        assert.isFalse(
          hasDuplicateName(
            "acls",
            {},
            {
              craig: new state(),
              id: "yes",
              parent_name: "hi",
            },
            {},
          ),
          "it should return data",
        );
      });
    });
    describe("invalidNewResourceName", () => {
      it("should be true if no value", () => {
        assert.isTrue(invalidNewResourceName(), "it should be false");
      });
    });
    describe("onRuleFieldInputChange", () => {
      it("should set rule when no rule is found", () => {
        let task = onRuleFieldInputChange("port_max");
        let data = {
          port_max: "1",
        };
        assert.deepEqual(task(data), "1", "it should return correct data");
        assert.deepEqual(
          data,
          {
            port_max: "1",
            rule: {
              port_max: "1",
              port_min: null,
              source_port_max: null,
              source_port_min: null,
              type: null,
              code: null,
            },
          },
          "it should send correct data",
        );
      });
      it("should set rule when no rule found", () => {
        let task = onRuleFieldInputChange("port_max");
        let data = {
          port_max: "2",
          rule: {
            port_max: "1",
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            type: null,
            code: null,
          },
        };
        assert.deepEqual(task(data), "2", "it should return correct data");
        assert.deepEqual(
          data,
          {
            port_max: "2",
            rule: {
              port_max: "2",
              port_min: null,
              source_port_max: null,
              source_port_min: null,
              type: null,
              code: null,
            },
          },
          "it should send correct data",
        );
      });
    });
    describe("hideWhenTcpOrUdp", () => {
      it("should be true when all", () => {
        assert.isTrue(
          hideWhenTcpOrUdp({ ruleProtocol: "all" }),
          "it should be hidden",
        );
      });
      it("should be true when icmp", () => {
        assert.isTrue(
          hideWhenTcpOrUdp({ ruleProtocol: "udp" }),
          "it should be hidden",
        );
      });
    });
    describe("hideWhenNotAllIcmp", () => {
      it("should be true when all", () => {
        assert.isTrue(
          hideWhenNotAllIcmp({ ruleProtocol: "all" }),
          "it should be hidden",
        );
      });
      it("should be true when icmp", () => {
        assert.isTrue(
          hideWhenNotAllIcmp({ ruleProtocol: "icmp" }),
          "it should be hidden",
        );
      });
    });
    describe("invalidPort", () => {
      it("should return false if rule protocol all", () => {
        assert.isFalse(
          invalidPort({
            ruleProtocol: "all",
          }),
          "it should be false",
        );
      });
      it("should return true if rule protocol is icmp and invalid field", () => {
        assert.isTrue(
          invalidPort({
            ruleProtocol: "icmp",
            rule: {
              code: 10000,
            },
          }),
          "it should be false",
        );
      });
      it("should return true if rule protocol is not icmp and invalid field", () => {
        assert.isTrue(
          invalidPort({
            ruleProtocol: "udp",
            rule: {
              port_min: 1000000,
            },
          }),
          "it should be false",
        );
      });
      it("should return true if rule protocol is not icmp and invalid field and security group", () => {
        assert.isTrue(
          invalidPort(
            {
              ruleProtocol: "udp",
              rule: {
                port_min: 1000000,
              },
            },
            true,
          ),
          "it should be false",
        );
      });
      it("should return true if rule protocol is not icmp and invalid field and security group when no rule object", () => {
        assert.isTrue(
          invalidPort(
            {
              ruleProtocol: "udp",
              port_min: 1000000,
            },
            true,
          ),
          "it should be false",
        );
      });
    });
  });
});
