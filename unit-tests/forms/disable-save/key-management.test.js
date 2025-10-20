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
          },
        ),
        "it should be false",
      );
    });
    it("should return true if an encryption key has an invalid key ring name", () => {
      assert.isTrue(
        disableSave(
          "encryption_keys",
          { name: "key", key_ring: "@@@", use_data: false },
          {
            craig: state(),
            data: {
              name: "test",
            },
          },
        ),
        "it should be false",
      );
    });
  });
  it("should return true if a key management instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "key_management",
        { name: "@@@", use_data: false },
        {
          craig: state(),
          data: {
            name: "test",
          },
        },
      ),
      "it should be false",
    );
  });
  it("should return true if a key management instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "key_management",
        { name: "aaa", use_data: false, resource_group: null },
        {
          craig: state(),
          data: {
            name: "test",
          },
        },
      ),
      "it should be false",
    );
  });
});
