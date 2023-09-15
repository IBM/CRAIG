const { assert } = require("chai");
const {
  disableSave,
  invalidPort,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
} = require("../../client/src/lib");

describe("disableSave", () => {
  it("should otherwise return false", () => {
    assert.isFalse(disableSave("pretend_field", {}, {}), "it should be false");
  });
  describe("invalidPort", () => {
    it("should return false if rule protocol all", () => {
      assert.isFalse(
        invalidPort({
          ruleProtocol: "all",
        }),
        "it should be false"
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
        "it should be false"
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
        "it should be false"
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
          true
        ),
        "it should be false"
      );
    });
  });
  describe("forceShowForm", () => {
    it("should force forms open if save is disabled and data does not have field of enable", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "vpcs",
            innerFormProps: {
              data: {
                name: "management",
                bucket: null,
              },
            },
          }
        ),
        "it should be true"
      );
    });
    it("should not force forms open if it is not enabled", () => {
      assert.isFalse(
        forceShowForm(
          {},
          {
            submissionFieldName: "iam_account_settings",
            innerFormProps: {
              data: {
                enable: false,
              },
            },
          }
        ),
        "it should be false"
      );
    });
    it("should force forms open if save is disabled and it is enabled", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "iam_account_settings",
            innerFormProps: {
              data: {
                enable: true,
                max_sessions_per_identity: null,
              },
            },
          }
        ),
        "it should be true"
      );
    });
  });
  describe("disableSshKeyDelete", () => {
    it("should return true if ssh key is in use", () => {
      assert.isTrue(
        disableSshKeyDelete({
          craig: {
            store: {
              json: {
                vsi: [
                  {
                    ssh_keys: ["key"],
                  },
                ],
                teleport_vsi: [],
                f5_vsi: [],
              },
            },
          },
          innerFormProps: {
            data: {
              name: "key",
            },
          },
        })
      );
    });
  });
  describe("invalidCidrBlock", () => {
    it("should return true for null", () => {
      assert.isTrue(invalidCidrBlock(null), "it should be true");
    });
  });
});
