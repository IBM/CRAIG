const { assert } = require("chai");
const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
} = require("../../client/src/lib/forms");

describe("text callbacks", () => {
  describe("resourceGroupHelperTextCallback", () => {
    it("should return the correct helper text when using prefix", () => {
      let actualData = resourceGroupHelperTextCallback(
        {
          name: "test",
          use_prefix: true,
        },
        {
          craig: {
            store: {
              json: {
                _options: {
                  prefix: "iac",
                },
              },
            },
          },
        }
      );
      assert.deepEqual(actualData, "iac-test", "it should return correct data");
    });
    it("should return the correct helper text when not using prefix", () => {
      let actualData = resourceGroupHelperTextCallback(
        {
          name: "test",
          use_prefix: false,
        },
        {
          craig: {
            store: {
              json: {
                _options: {
                  prefix: "iac",
                },
              },
            },
          },
        }
      );
      assert.deepEqual(actualData, "test", "it should return correct data");
    });
  });
  describe("genericNameCallback", () => {
    it("should return correct callback text", () => {
      assert.deepEqual(
        genericNameCallback(),
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        "it should return callback text"
      );
    });
  });
  describe("invalidNameText", () => {
    it("should return the correct text when a duplicate name is passed", () => {
      let actualData = invalidNameText("resource_groups")(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "test",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        actualData,
        'Name "test" already in use',
        "it should return correct message"
      );
    });
    it("should return the correct text when an otherwise invalid name is passed", () => {
      let actualData = invalidNameText("resource_groups")(
        {
          name: "AAAAAA",
        },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "test",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        actualData,
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        "it should return correct message"
      );
    });
  });
  describe("cosResourceHelperTextCallback", () => {
    it("should return text if using data", () => {
      assert.deepEqual(
        cosResourceHelperTextCallback({ use_data: true, name: "test" }),
        "test",
        "it should display data"
      );
    });
    it("should return text if not using data and with random suffix", () => {
      assert.deepEqual(
        cosResourceHelperTextCallback(
          { use_data: false, use_random_suffix: true, name: "test" },
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "test",
                  },
                },
              },
            },
          }
        ),
        "test-test-<random-suffix>",
        "it should display data"
      );
    });
    it("should return text if not using data and without random suffix", () => {
      assert.deepEqual(
        cosResourceHelperTextCallback(
          { use_data: false, use_random_suffix: false, name: "test" },
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "test",
                  },
                },
              },
            },
          }
        ),
        "test-test",
        "it should display data"
      );
    });
  });
});
