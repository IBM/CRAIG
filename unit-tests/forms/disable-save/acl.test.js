const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("acls", () => {
  it("should return true if a acl does not have a resource group", () => {
    assert.isTrue(
      disableSave(
        "acls",
        {
          name: "aaa",
          resource_group: "",
        },
        {
          craig: state(),
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  describe("acl rules", () => {
    it("should return false if a acl rule is valid", () => {
      assert.isFalse(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "udp",
            rule: {
              port_min: 80,
              port_max: 80,
              source_port_min: 80,
              source_port_max: 80,
            },
          },
          {
            innerFormProps: {
              craig: state(),
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
    it("should return false if a acl rule is valid in modal", () => {
      assert.isFalse(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "udp",
            rule: {
              port_min: 80,
              port_max: 80,
              source_port_min: 80,
              source_port_max: 80,
            },
          },
          {
            innerFormProps: {
              craig: new state(),
            },
            craig: new state(),
            data: {
              name: "frog",
            },
            parent_name: "frog",
            isModal: true,
          }
        ),
        "it should be true"
      );
    });
  });
});
