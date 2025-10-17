const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("security groups", () => {
  it("should return true if a security group has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "security_groups",
        {
          name: "@@@",
        },
        {
          craig: state(),
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
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
          craig: state(),
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
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
          craig: state(),
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  describe("rules", () => {
    it("should return true if security group rule has invalid name", () => {
      assert.isTrue(
        disableSave(
          "sg_rules",
          {
            name: "@@@",
          },
          { rules: [], data: { name: "" }, craig: state() },
        ),
      );
    });
    it("should return true if security group rule has invalid source", () => {
      assert.isTrue(
        disableSave(
          "sg_rules",
          { name: "aa", source: "mm" },
          { rules: [], data: { name: "" }, craig: state() },
        ),
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
          {
            innerFormProps: { rules: [{ name: "ff" }] },
            data: { name: "aa" },
            craig: state(),
          },
        ),
      );
    });
    it("should return true if security group rule has invalid name in modal", () => {
      assert.isTrue(
        disableSave(
          "sg_rules",
          { name: "@@@" },
          { rules: [], data: { name: "" }, isModal: true, craig: state() },
        ),
      );
    });
  });
});
