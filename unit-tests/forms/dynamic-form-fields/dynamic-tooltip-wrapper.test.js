const { assert } = require("chai");
const {
  dynamicToolTipWrapperProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields");

describe("dynamicToolTipWrapperProps", () => {
  it("should return correct props with labelText and no props name", () => {
    let expectedData = {
      id: "-input-key-1-tooltip",
      key: " input key 1",
      labelText: "hi",
      isModal: undefined,
      tooltip: undefined,
    };
    let actualData = dynamicToolTipWrapperProps({}, "key", 1, {
      labelText: "hi",
    });
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct props"
    );
  });
  it("should return correct props with labelText and props name", () => {
    let expectedData = {
      id: "test-input-key-1-tooltip",
      key: "test input key 1",
      labelText: "hi",
      isModal: undefined,
      tooltip: undefined,
    };
    let actualData = dynamicToolTipWrapperProps(
      {
        data: {
          name: "test",
        },
      },
      "key",
      1,
      {
        labelText: "hi",
      }
    );
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct props"
    );
  });
  it("should return correct props with no labelText and props name", () => {
    let expectedData = {
      id: "test-input-key-1-tooltip",
      key: "test input key 1",
      labelText: "Key",
      isModal: undefined,
      tooltip: undefined,
    };
    let actualData = dynamicToolTipWrapperProps(
      {
        data: {
          name: "test",
        },
      },
      "key",
      1,
      {}
    );
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct props"
    );
  });
});
