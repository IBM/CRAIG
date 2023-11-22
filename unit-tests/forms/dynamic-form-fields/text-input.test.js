const { assert } = require("chai");
const {
  dynamicFieldId,
  addClassName,
  dynamicTextInputProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields/text-input");

describe("text input functions", () => {
  describe("dynamicTextInputProps", () => {
    it("should throw an error if disabled does not return a boolean", () => {
      let task = () => {
        dynamicTextInputProps({
          name: "frog",
          field: {
            disabled: function () {
              return "oops";
            },
            invalid: function () {
              return false;
            },
            invalidText: function () {
              return "uh oh";
            },
            helperText: function () {
              return "helper text";
            },
            disabledText: function () {
              return "oops";
            },
          },
          parentState: {},
          parentProps: {},
          handleInputChange: function () {},
        });
      };
      assert.throws(
        task,
        "dynamicTextInputProps expects props.field.disabled to evaluate to boolean, got string"
      );
    });
    it("should throw an error if invalid does not return a boolean", () => {
      let task = () => {
        dynamicTextInputProps({
          name: "frog",
          field: {
            disabled: function () {
              return false;
            },
            invalid: function () {
              return "oops";
            },
            invalidText: function () {
              return "uh oh";
            },
            helperText: function () {
              return "helper text";
            },
            disabledText: function () {
              return "oops";
            },
          },
          parentState: {},
          parentProps: {},
          handleInputChange: function () {},
        });
      };
      assert.throws(
        task,
        "dynamicTextInputProps expects props.field.invalid to evaluate to boolean, got string"
      );
    });
    it("should throw an error if invalidText does not return a string", () => {
      let task = () => {
        dynamicTextInputProps({
          name: "frog",
          field: {
            disabled: function () {
              return false;
            },
            invalid: function () {
              return false;
            },
            invalidText: function () {
              return false;
            },
            helperText: function () {
              return "helper text";
            },
            disabledText: function () {
              return "oops";
            },
          },
          parentState: {},
          parentProps: {},
          handleInputChange: function () {},
        });
      };
      assert.throws(
        task,
        "dynamicTextInputProps expects props.field.invalidText to evaluate to string, got boolean"
      );
    });
    it("should throw an error if disabledText does not return a string", () => {
      let task = () => {
        dynamicTextInputProps({
          name: "frog",
          field: {
            disabled: function () {
              return false;
            },
            invalid: function () {
              return false;
            },
            invalidText: function () {
              return "helper text";
            },
            helperText: function () {
              return "helper text";
            },
            disabledText: function () {
              return 2;
            },
          },
          parentState: {},
          parentProps: {},
          handleInputChange: function () {},
        });
      };
      assert.throws(
        task,
        "dynamicTextInputProps expects props.field.disabledText to evaluate to string, got number"
      );
    });
    it("should return the correct props for text input when not disabled", () => {
      let actualData = dynamicTextInputProps({
        name: "frog",
        field: {
          disabled: function () {
            return false;
          },
          invalid: function () {
            return false;
          },
          invalidText: function () {
            return "uh oh";
          },
          helperText: function () {
            return "helper text";
          },
          disabledText: function () {
            return "oops";
          },
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function () {},
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        helperText: "helper text",
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        maxLength: undefined,
        name: "name",
        placeholder: "my-atracker-name",
        readOnly: false,
        value: "",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when disabled", () => {
      let actualData = dynamicTextInputProps({
        name: "frog",
        field: {
          disabled: function () {
            return true;
          },
          invalid: function () {
            return false;
          },
          invalidText: function () {
            return "uh oh";
          },
          helperText: function () {
            return "helper text";
          },
          disabledText: function () {
            return "oops";
          },
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function () {},
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: true,
        helperText: "oops",
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        maxLength: undefined,
        name: "name",
        placeholder: "my-atracker-name",
        readOnly: false,
        value: "",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when not disabled and has override label text", () => {
      let actualData = dynamicTextInputProps({
        name: "frog",
        field: {
          disabled: function () {
            return false;
          },
          invalid: function () {
            return false;
          },
          invalidText: function () {
            return "uh oh";
          },
          helperText: function () {
            return "helper text";
          },
          labelText: "My Cool Label",
          disabledText: function () {
            return "oops";
          },
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function () {},
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        helperText: "helper text",
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "My Cool Label",
        maxLength: undefined,
        name: "name",
        placeholder: "my-atracker-name",
        readOnly: false,
        value: "",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when not disabled and has a tooltip", () => {
      let actualData = dynamicTextInputProps({
        name: "frog",
        field: {
          disabled: function () {
            return false;
          },
          invalid: function () {
            return false;
          },
          invalidText: function () {
            return "uh oh";
          },
          helperText: function () {
            return "helper text";
          },
          tooltip: {},
          disabledText: function () {
            return "oops";
          },
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function () {},
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        helperText: "helper text",
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "",
        maxLength: undefined,
        name: "name",
        placeholder: "my-atracker-name",
        readOnly: false,
        value: "",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when not disabled and is optional", () => {
      let actualData = dynamicTextInputProps({
        name: "frog",
        field: {
          optional: true,
          disabled: function () {
            return false;
          },
          invalid: function () {
            return false;
          },
          invalidText: function () {
            return "uh oh";
          },
          helperText: function () {
            return "helper text";
          },
          disabledText: function () {
            return "oops";
          },
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function () {},
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        helperText: "helper text",
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        maxLength: undefined,
        name: "name",
        placeholder: "(Optional) my-atracker-name",
        readOnly: false,
        value: "",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when not disabled and no helper text", () => {
      let actualData = dynamicTextInputProps({
        name: "frog",
        field: {
          optional: true,
          disabled: function () {
            return false;
          },
          invalid: function () {
            return false;
          },
          invalidText: function () {
            return "uh oh";
          },
          disabledText: function () {
            return "oops";
          },
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function () {},
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        helperText: null,
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        maxLength: undefined,
        name: "name",
        placeholder: "(Optional) my-atracker-name",
        readOnly: false,
        value: "",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when not disabled and field.onRender is a function", () => {
      let actualData = dynamicTextInputProps({
        name: "frog",
        field: {
          disabled: function () {
            return false;
          },
          invalid: function () {
            return false;
          },
          invalidText: function () {
            return "uh oh";
          },
          helperText: function () {
            return "helper text";
          },
          onRender: function () {
            return "haha!";
          },
          disabledText: function () {
            return "oops";
          },
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function () {},
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        helperText: "haha!",
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        maxLength: undefined,
        name: "name",
        placeholder: "my-atracker-name",
        readOnly: false,
        value: "haha!",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
});
