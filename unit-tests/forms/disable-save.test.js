const { assert } = require("chai");
const { disableSave } = require("../../client/src/lib/forms");

describe("disableSave", () => {
  it("should return true if a resource group has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "resource_groups",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a key management instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "key_management",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if a key management instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "key_management",
        { name: "aaa", use_data: false, resource_group: null },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                    resource_group: null,
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an encryption key has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "encryption_keys",
        { name: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                    keys: [
                      {
                        name: "test",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if an encryption key has an invalid key ring name", () => {
    assert.isTrue(
      disableSave(
        "encryption_keys",
        { name: "key", key_ring: "@@@", use_data: false },
        {
          craig: {
            store: {
              json: {
                key_management: [
                  {
                    name: "frog",
                    keys: [
                      {
                        name: "test",
                      },
                    ],
                  },
                ],
              },
            },
          },
          data: {
            name: "test",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should otherwise return false", () => {
    assert.isFalse(disableSave("pretend_field", {}, {}), "it should be false");
  });
});
