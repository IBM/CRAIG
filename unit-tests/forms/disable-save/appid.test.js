const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("appid", () => {
  it("should return true if an appid instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "appid",
        {
          name: "@@@",
          resource_group: "managment-rg",
        },
        {
          craig: {
            store: {
              json: {
                appid: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if an appid instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "appid",
        { name: "frog", resource_group: null, use_data: false },
        {
          craig: {
            store: {
              json: {
                appid: [
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
      ),
      "it should be true"
    );
  });
  it("should return true if an appid key has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "appid_key",
        {
          name: "@@@",
        },
        {
          craig: {
            store: {
              json: {
                appid: [
                  {
                    name: "frog",
                    keys: [],
                  },
                  {
                    name: "toad",
                    keys: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
});
