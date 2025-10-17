const { assert } = require("chai");
const {
  dynamicIcseHeadingProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields/icse-heading");

describe("dynamicIcseHeadingProps", () => {
  it("should return props based on group", () => {
    assert.deepEqual(
      dynamicIcseHeadingProps({
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
      },
      "it should return props",
    );
  });
});
