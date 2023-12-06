const { assert } = require("chai");
const {
  dynamicPasswordInputProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields/password-input");

describe("dynamicPasswordInputProps", () => {
  it("should return the correct props for public key", () => {
    let actualData = dynamicPasswordInputProps({
      name: "public_key",
      parentProps: {
        formName: "power",
      },
      propsName: "ssh",
      keyIndex: 0,
      handleInputChange: function () {},
      field: {
        invalid: function () {
          return false;
        },
        invalidText: function () {
          return "uh oh";
        },
      },
      parentState: {
        public_key: "key",
      },
    });
    let expectedData = {
      invalid: false,
      invalidText: "uh oh",
      labelText: "Public Key",
      name: "public_key",
      id: "ssh-public-key-0",
      value: "key",
    };
    assert.isFunction(actualData.onChange, "it should be a function");
    delete actualData.onChange;
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
});
