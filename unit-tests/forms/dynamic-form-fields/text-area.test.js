const { assert } = require("chai");
const {
  dynamicTextAreaProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields/text-area");

describe("text area", () => {
  describe("dynamicTextAreaProps", () => {
    it("should return the correct props for text area", () => {
      let eventChangeData;
      let actualData = dynamicTextAreaProps({
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
          placeholder: function () {
            return "placeholder";
          },
          labelText: "text area",
        },
        parentState: {
          name: "frog",
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (data) {
          eventChangeData = data;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "textInputMedium",
        id: "frog-name-0",
        labelText: "text area",
        invalid: false,
        invalidText: "uh oh",
        placeholder: "placeholder",
        value: "frog",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({
        target: {
          value: "hello",
        },
      });
      assert.deepEqual(
        eventChangeData,
        {
          target: {
            name: "name",
            value: "hello",
          },
        },
        "it should evaluate correct data",
      );
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data",
      );
    });
    it("should return the correct props for text area with null value", () => {
      let eventChangeData;
      let actualData = dynamicTextAreaProps({
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
          placeholder: function () {
            return "placeholder";
          },
          labelText: "text area",
        },
        parentState: {
          name: null,
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (data) {
          eventChangeData = data;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "textInputMedium",
        id: "frog-name-0",
        labelText: "text area",
        invalid: false,
        invalidText: "uh oh",
        placeholder: "placeholder",
        value: "",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({
        target: {
          value: "hello",
        },
      });
      assert.deepEqual(
        eventChangeData,
        {
          target: {
            name: "name",
            value: "hello",
          },
        },
        "it should evaluate correct data",
      );
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data",
      );
    });
    it("should return the correct props for text area with tooltip and classname", () => {
      let eventChangeData;
      let actualData = dynamicTextAreaProps({
        name: "frog",
        field: {
          className: "my-cool-classname",
          tooltip: {},
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
          placeholder: function () {
            return "placeholder";
          },
          labelText: "text area",
        },
        parentState: {
          name: "frog",
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (data) {
          eventChangeData = data;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "my-cool-classname textInputMedium",
        id: "frog-name-0",
        labelText: "",
        invalid: false,
        invalidText: "uh oh",
        placeholder: "placeholder",
        value: "frog",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({
        target: {
          value: "hello",
        },
      });
      assert.deepEqual(
        eventChangeData,
        {
          target: {
            name: "name",
            value: "hello",
          },
        },
        "it should evaluate correct data",
      );
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data",
      );
    });
  });
});
