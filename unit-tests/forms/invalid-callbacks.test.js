const { assert } = require("chai");
const {
  invalidName,
} = require("../../client/src/lib/forms");

describe("invalid callbacks", () => {
  describe("invalidName", () => {
    it("should return true if resource group has a duplicate name", () => {
      let actualData = invalidName("resource_groups")(
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
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if resource group has empty string as name", () => {
      let actualData = invalidName("resource_groups")(
        {
          name: "",
        },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "egg",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "egg",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if resource group is not using data and name invalid", () => {
      let actualData = invalidName("resource_groups")(
        {
          name: "AAA",
          use_data: false,
        },
        {
          craig: {
            store: {
              json: {
                resource_groups: [
                  {
                    name: "egg",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "egg",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
  });
});
