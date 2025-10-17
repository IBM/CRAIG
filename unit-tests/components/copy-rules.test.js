const { assert } = require("chai");
const { copyRuleFormName } = require("../../client/src/lib");

describe("copy rule functions", () => {
  describe("copyRuleFormName", () => {
    it("should return correct name when acl", () => {
      assert.deepEqual(
        copyRuleFormName({
          data: {
            name: "test",
          },
        })("test"),
        "copy-rule-acl-test-test",
        "it should return correct data",
      );
    });
    it("should return correct name when sg", () => {
      assert.deepEqual(
        copyRuleFormName({
          data: {
            name: "test",
          },
          isSecurityGroup: true,
        })("test"),
        "copy-rule-sg-test",
        "it should return correct data",
      );
    });
  });
});
