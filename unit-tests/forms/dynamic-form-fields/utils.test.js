const { assert } = require("chai");
const {
  dynamicFieldId,
  addClassName,
  fieldFunctionReturnsStringCheck,
} = require("../../../client/src/lib/forms/dynamic-form-fields");

describe("dynamic form field utils", () => {
  describe("dynamicFieldId", () => {
    it("should return a dynamic id based on props", () => {
      let actualData = dynamicFieldId({
        propsName: "propsName",
        name: "field",
        keyIndex: 1,
      });
      let expectedData = "propsname-field-1";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("addClassName", () => {
    it("should return the correct additional classname with no additional params", () => {
      let actualData = addClassName("");
      let expectedData = " fieldWidth";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct className"
      );
    });
    it("should return the correct additional classname with field className", () => {
      let actualData = addClassName("", { className: "good" });
      let expectedData = " good fieldWidth";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct className"
      );
    });
    it("should return the correct additional classname with field className and size small", () => {
      let actualData = addClassName("", { className: "good", size: "small" });
      let expectedData = " good fieldWidthSmaller";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct className"
      );
    });
  });
  describe("fieldFunctionReturnsStringCheck", () => {
    it("should throw an error if the fieldFunction is not a function", () => {
      let task = () => {
        fieldFunctionReturnsStringCheck({ field: {} }, "test", "placeholder");
      };
      assert.throws(
        task,
        "test expects props.field.placeholder to evaluate to string, got undefined",
        "it should return error text"
      );
    });
  });
});
