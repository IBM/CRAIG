const { assert } = require("chai");
const { prettyJSON } = require("lazy-z");
const { formatConfig } = require("../../client/src/lib/forms");

describe("formatJson", () => {
  let testJson = { craig1: { craig: "test1" }, craig2: { craig: "test2" } };

  it("should return formatted json when isCopy is false", () => {
    assert.deepEqual(
      formatConfig(testJson, false),
      prettyJSON(testJson),
      "it should return formatted json when isCopy is false"
    );
  });

  it("should return stringified json when isCopy is true", () => {
    assert.deepEqual(
      formatConfig(testJson, true),
      JSON.stringify(testJson),
      "it should return stringified json when isCopy is true"
    );
  });
});
