const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("key management", () => {
  describe("keys", () => {
    it("should return true if an encryption key has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "encryption_keys",
          { name: "@@@", use_data: false },
          {
            craig: state(),
            data: {
              name: "test",
            },
          }
        ),
        "it should be false"
      );
    });
  });
});
