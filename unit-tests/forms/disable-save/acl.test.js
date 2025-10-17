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
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a acl has an invalid duplicate name", () => {
    let tempCraig = state();
    tempCraig.store = {
      json: {
        vpcs: [
          {
            name: "frog",
            acls: [
              {
                name: "frog",
              },
              {
                name: "aaa",
              },
            ],
          },
          {
            name: "toad",
            acls: [],
          },
        ],
        security_groups: [],
      },
    };
    assert.isTrue(
      disableSave(
        "acls",
        {
          name: "aaa",
          resource_group: "aaa",
        },
        {
          craig: tempCraig,
          data: {
            name: "hi",
          },
        },
      ),
      "it should be disabled",
    );
  });
  it("should return false if network order card", () => {
    assert.isFalse(
      disableSave(
        "acls",
        {
          name: "aaa",
          resource_group: "aaa",
        },
        {
          id: "frog",
          craig: state(),
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  describe("acl rules", () => {
    it("should return true if a acl rule has an invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store = {
        json: {
          vpcs: [
            {
              name: "frog",
              acls: [
                {
                  name: "frog",
                  rules: [
                    {
                      name: "frog",
                    },
                    {
                      name: "aaa",
                    },
                  ],
                },
                {
                  name: "aaa",
                },
              ],
            },
            {
              name: "toad",
              acls: [],
            },
          ],
          security_groups: [],
        },
      };
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
          },
          {
            innerFormProps: {
              craig: tempCraig,
            },
            data: {
              name: "hi",
            },
            parent_name: "frog",
          },
        ),
        "it should be disabled",
      );
    });
    it("should return true if a acl rule in a modal has an invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store.json.vpcs[0].acls[0].rules[0].name = "aaa";
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
          },
          {
            craig: tempCraig,
            isModal: true,
            data: {
              name: "hi",
            },
            parent_name: "management",
          },
        ),
        "it should be disabled",
      );
    });
    it("should return true if a acl rule has an invalid source", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "fff",
          },
          {
            innerFormProps: {
              craig: state(),
            },
            data: {
              name: "hi",
            },
          },
        ),
        "it should be disabled",
      );
    });
    it("should return true if a acl rule has an invalid destination", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "fff",
          },
          {
            innerFormProps: {
              craig: state(),
            },
            data: {
              name: "frog",
            },
            parent_name: "frog",
          },
        ),
        "it should be true",
      );
    });
    it("should return true if a acl rule has an invalid source_port_max", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "udp",
            rule: {
              source_port_max: -1,
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
          },
        ),
        "it should be true",
      );
    });
    it("should return true if a acl rule has an invalid source_port_min", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "udp",
            rule: {
              source_port_min: -1,
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
          },
        ),
        "it should be true",
      );
    });
    it("should return true if a acl rule has an invalid port_max", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "udp",
            rule: {
              port_max: -1,
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
          },
        ),
        "it should be true",
      );
    });
    it("should return true if a acl rule has an invalid port_min", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "udp",
            rule: {
              port_min: -1,
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
          },
        ),
        "it should be true",
      );
    });
    it("should return true if a icmp rule has invalid code", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "icmp",
            rule: {
              code: -1,
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
          },
        ),
        "it should be true",
      );
    });
    it("should return true if a icmp rule has invalid type", () => {
      assert.isTrue(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "icmp",
            rule: {
              code: 1,
              type: -10,
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
          },
        ),
        "it should be true",
      );
    });
    it("should return false if a acl rule with icmp protocol is valid", () => {
      assert.isFalse(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "icmp",
            rule: {
              code: 2,
              type: 2,
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
          },
        ),
        "it should be true",
      );
    });
    it("should return false if a acl rule with all protocol is valid", () => {
      assert.isFalse(
        disableSave(
          "acl_rules",
          {
            name: "aaa",
            source: "1.2.3.4",
            destination: "1.2.3.4",
            ruleProtocol: "all",
            rule: {},
          },
          {
            innerFormProps: {
              craig: state(),
            },
            data: {
              name: "frog",
            },
            parent_name: "frog",
          },
        ),
        "it should be true",
      );
    });
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
          },
        ),
        "it should be true",
      );
    });
  });
});
