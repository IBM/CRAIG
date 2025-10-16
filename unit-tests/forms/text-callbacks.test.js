const { assert } = require("chai");
const { invalidProjectNameText } = require("../../client/src/lib");
const { invalidCbrRuleText } = require("../../client/src/lib/state/cbr-rules");
const {
  invalidCbrZoneText,
  cbrValueInvalidText,
} = require("../../client/src/lib/state/cbr-zones");

describe("text callbacks", () => {
  describe("invalidCbrRuleText", () => {
    it("returns error message for invalid api_type_id field", () => {
      let errorMessage = invalidCbrRuleText("api_type_id", {}, {});
      assert.equal(
        errorMessage,
        "Invalid api_type_id. Must match the regex expression /^[a-zA-Z0-9_.-:]+$/",
      );
    });
    it("returns error message for invalid description field", () => {
      let errorMessage = invalidCbrRuleText("description", {}, {});
      assert.equal(
        errorMessage,
        "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/",
      );
    });
    it("returns error message for invalid value field", () => {
      let errorMessage = invalidCbrRuleText("value", {}, {});
      assert.equal(
        errorMessage,
        "Invalid value. Must match the regex expression /^[Ss]+$/",
      );
    });
    it("returns error message for invalid operator field", () => {
      let errorMessage = invalidCbrRuleText("operator", {}, {});
      assert.equal(
        errorMessage,
        "Invalid operator. Must match the regex expression /^[a-zA-Z0-9]+$/",
      );
    });
    it("returns no invalid text for other fields", () => {
      assert.equal(invalidCbrRuleText("not real field", {}, {}), "");
    });
  });
  describe("invalidCbrZoneText", () => {
    it("returns error message for invalid description field", () => {
      let errorMessage = invalidCbrZoneText("description", {}, {});
      assert.equal(
        errorMessage,
        "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/",
      );
    });
    it("returns no invalid text for other fields", () => {
      assert.equal(
        invalidCbrZoneText("not real field"),
        "Invalid not real field. Value must match regular expression /^[0-9a-z-]+$/.",
      );
    });
  });
  describe("invalidProjectNameText", () => {
    it("it should return an empty string if name is unique", () => {
      last_save = Date.now();
      assert.deepEqual(
        invalidProjectNameText(
          { name: "blue" },
          { projects: { test: { name: "test", last_save } } },
        ),
        "",
      );
    });
    it("it should be true if name is empty string", () => {
      assert.deepEqual(
        invalidProjectNameText({ name: "" }, {}),
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
      );
    });
    it("should be true if name is already in use", () => {
      last_save = Date.now();
      assert.deepEqual(
        invalidProjectNameText(
          { name: "test" },
          { projects: { test: { name: "test", last_save } } },
        ),
        `Name "test" already in use`,
      );
    });
  });
  describe("cbrValueInvalidText", () => {
    it("should return correct string when not empty string", () => {
      assert.deepEqual(
        cbrValueInvalidText("ipAddress", ""),
        "Invalid value for type ipAddress. Cannot be empty string.",
        "it should return correct message",
      );
    });
    it("should return correct string when invalid ip address", () => {
      assert.deepEqual(
        cbrValueInvalidText("ipAddress", "/"),
        "Invalid value for type ipAddress. Value must be a valid IPV4 Address.",
        "it should return correct message",
      );
    });
    it("should return correct string when invalid ip range", () => {
      assert.deepEqual(
        cbrValueInvalidText("ipRange", "1.1.1.1"),
        "Invalid value for type ipRange. Value must be a range of IPV4 Addresses.",
        "it should return correct message",
      );
    });
    it("should return correct string when empty type", () => {
      assert.deepEqual(
        cbrValueInvalidText("", "frog"),
        "",
        "it should return correct message",
      );
    });
    it("should return empty string when valid ip range", () => {
      assert.deepEqual(
        cbrValueInvalidText("ipRange", "1.1.1.1-1.1.1.1"),
        "",
        "it should return correct message",
      );
    });
    it("should return empty string when valid ip address", () => {
      assert.deepEqual(
        cbrValueInvalidText("ipAddress", "1.1.1.1"),
        "",
        "it should return correct message",
      );
    });
  });
});
