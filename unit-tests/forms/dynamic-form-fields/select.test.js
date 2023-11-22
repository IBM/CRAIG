const { assert } = require("chai");
const {
  dynamicSelectProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields/select");

describe("dynamic select", () => {
  describe("dynamicSelectProps", () => {
    it("should throw an error if disabled does not return a boolean", () => {
      let task = () => {
        dynamicSelectProps({
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
        "dynamicSelectProps expects props.field.disabled to evaluate to boolean, got string"
      );
    });
    it("should throw an error if groups is not an array or does not return an array", () => {
      let task = () => {
        dynamicSelectProps({
          name: "frog",
          field: {
            groups: function () {
              return false;
            },
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
          parentProps: {},
          handleInputChange: function () {},
        });
      };
      assert.throws(
        task,
        "dynamicSelectProps expects props.field.groups to be an array of string or to be a function that evaluates to be an array of string. Got value boolean"
      );
    });
    it("should throw an error if groups is not an array or does not return an array", () => {
      let task = () => {
        dynamicSelectProps({
          name: "frog",
          field: {
            groups: false,
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
          parentProps: {},
          handleInputChange: function () {},
        });
      };
      assert.throws(
        task,
        "dynamicSelectProps expects props.field.groups to be an array of string or to be a function that evaluates to be an array of string. Got value boolean"
      );
    });
    it("should throw an error if invalid does not return a boolean", () => {
      let task = () => {
        dynamicSelectProps({
          name: "frog",
          field: {
            groups: ["egg"],
            onRender: function () {
              return "egg";
            },
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
        "dynamicSelectProps expects props.field.invalid to evaluate to boolean, got string"
      );
    });
    it("should throw an error if invalidText does not return a string", () => {
      let task = () => {
        dynamicSelectProps({
          name: "frog",
          field: {
            groups: [],
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
        "dynamicSelectProps expects props.field.invalidText to evaluate to string, got boolean"
      );
    });
    it("should return the correct props for text input when disabled and no value", () => {
      let actualData = dynamicSelectProps({
        name: "frog",
        field: {
          groups: ["a", "b", "c"],
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
        groups: ["", "a", "b", "c"],
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        name: "name",
        value: "",
        readOnly: undefined,
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when disabled and no value and groups is function", () => {
      let actualData = dynamicSelectProps({
        name: "frog",
        field: {
          groups: function () {
            return ["a", "b", "c"];
          },
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
        groups: ["", "a", "b", "c"],
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        name: "name",
        value: "",
        readOnly: undefined,
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when disabled and no value and groups is function with tooltip", () => {
      let actualData = dynamicSelectProps({
        name: "frog",
        field: {
          groups: function () {
            return ["a", "b", "c"];
          },
          tooltip: {},
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
        className: "leftTextAlign tooltip fieldWidth",
        disabled: true,
        groups: ["", "a", "b", "c"],
        id: "frog-name-0",
        invalid: false,
        invalidText: "uh oh",
        labelText: "",
        name: "name",
        value: "",
        readOnly: undefined,
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when not disabled and no value", () => {
      let actualData = dynamicSelectProps({
        name: "frog",
        field: {
          groups: ["a", "b", "c"],
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
        groups: ["", "a", "b", "c"],
        id: "frog-name-0",
        invalid: true,
        invalidText: "uh oh",
        labelText: "Name",
        name: "name",
        value: "",
        readOnly: undefined,
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
