const { assert } = require("chai");
const {
  dynamicHeadingProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields");

describe("dynamicHeadingProps", () => {
  it("should return props based on group", () => {
    assert.deepEqual(
      dynamicHeadingProps({
        heading: {
          name: "heading",
          type: "type",
          tooltip: {},
        },
      }),
      {
        name: "heading",
        type: "type",
        tooltip: {},
        key: "heading-heading",
        className: undefined,
      },
      "it should return props",
    );
  });
});
