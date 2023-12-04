const { assert } = require("chai");
const {
  dynamicIcseFormGroupsProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields");

describe("dynamicIcseFormGroupsProps", () => {
  it("should return correct props if no name, no subForms, and is last", () => {
    assert.deepEqual(
      dynamicIcseFormGroupsProps(
        {
          form: {
            groups: ["hi"],
          },
        },
        0
      ),
      {
        key: "-group-0",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return correct props if name, no subForms, and is last", () => {
    assert.deepEqual(
      dynamicIcseFormGroupsProps(
        {
          form: {
            groups: ["hi"],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return correct props if name, with subForms, and is last", () => {
    assert.deepEqual(
      dynamicIcseFormGroupsProps(
        {
          form: {
            groups: ["hi"],
            subForms: ["hi"],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: false,
      },
      "it should return correct props"
    );
  });
  it("should return correct props if name, with subForms length 0, and is last", () => {
    assert.deepEqual(
      dynamicIcseFormGroupsProps(
        {
          form: {
            groups: ["hi"],
            subForms: [],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
});
