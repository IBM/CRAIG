const { assert } = require("chai");
const {
  dynamicToggleProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields/toggle");

describe("dynamic toggle", () => {
  describe("dynamicToggleProps", () => {
    it("should throw an error if disabled does not return a boolean", () => {
      let task = () => {
        dynamicToggleProps({
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
            labelText: "Use Data",
          },
          parentState: {},
          parentProps: {},
          handleInputChange: function () {},
        });
      };
      assert.throws(
        task,
        "dynamicToggleProps expects props.field.disabled to evaluate to boolean, got string"
      );
    });
    it("should return props form properly formatted toggle", () => {
      let toggleData;
      let actualData = dynamicToggleProps({
        parentProps: {},
        parentState: {},
        name: "use_data",
        propsName: "data-name",
        field: {
          disabled: function () {
            return false;
          },
          labelText: "Use Data",
        },
        handleInputChange: function (name) {
          toggleData = name;
        },
      });
      let expectedData = {
        className: "leftTextAlign fitContent fieldWidth cds--form-item",
        defaultToggled: undefined,
        id: "use-data-toggle-data-name",
        labelA: "False",
        labelB: "True",
        labelText: "Use Data",
        disabled: false,
      };
      assert.isFunction(actualData.onToggle, "it should be a function");
      actualData.onToggle();
      assert.deepEqual(
        toggleData,
        "use_data",
        "it should return name to parent function"
      );
      delete actualData.onToggle;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct props"
      );
    });
    it("should return props form properly formatted toggle with on render", () => {
      let toggleData;
      let actualData = dynamicToggleProps({
        parentProps: {},
        parentState: {},
        name: "use_data",
        propsName: "data-name",
        field: {
          disabled: function () {
            return false;
          },
          labelText: "Use Data",
          onRender: function () {
            return true;
          },
        },
        handleInputChange: function (name) {
          toggleData = name;
        },
      });
      let expectedData = {
        className: "leftTextAlign fitContent fieldWidth cds--form-item",
        defaultToggled: true,
        id: "use-data-toggle-data-name",
        labelA: "False",
        labelB: "True",
        labelText: "Use Data",
        disabled: false,
      };
      assert.isFunction(actualData.onToggle, "it should be a function");
      actualData.onToggle();
      assert.deepEqual(
        toggleData,
        "use_data",
        "it should return name to parent function"
      );
      delete actualData.onToggle;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct props"
      );
    });
    it("should return props form properly formatted toggle with tooltip", () => {
      let toggleData;
      let actualData = dynamicToggleProps({
        parentProps: {},
        parentState: {},
        name: "use_data",
        propsName: "data-name",
        field: {
          disabled: function () {
            return false;
          },
          labelText: "Use Data",
          tooltip: {},
        },
        handleInputChange: function (name) {
          toggleData = name;
        },
      });
      let expectedData = {
        className: "leftTextAlign fitContent fieldWidth cds--form-item tooltip",
        defaultToggled: undefined,
        id: "use-data-toggle-data-name",
        labelA: "False",
        labelB: "True",
        labelText: " ",
        disabled: false,
      };
      assert.isFunction(actualData.onToggle, "it should be a function");
      actualData.onToggle();
      assert.deepEqual(
        toggleData,
        "use_data",
        "it should return name to parent function"
      );
      delete actualData.onToggle;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct props"
      );
    });
    it("should return props form properly formatted toggle with tooltip", () => {
      let toggleData;
      let actualData = dynamicToggleProps({
        parentProps: {},
        parentState: {},
        name: "use_data",
        propsName: "data-name",
        field: {
          disabled: function () {
            return false;
          },
          labelText: "Use Data",
          tooltip: {},
        },
        handleInputChange: function (name) {
          toggleData = name;
        },
      });
      let expectedData = {
        className: "leftTextAlign fitContent fieldWidth cds--form-item tooltip",
        defaultToggled: undefined,
        id: "use-data-toggle-data-name",
        labelA: "False",
        labelB: "True",
        labelText: " ",
        disabled: false,
      };
      assert.isFunction(actualData.onToggle, "it should be a function");
      actualData.onToggle();
      assert.deepEqual(
        toggleData,
        "use_data",
        "it should return name to parent function"
      );
      delete actualData.onToggle;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct props"
      );
    });
    it("should return props form properly formatted toggle with tooltip and use on off", () => {
      let toggleData;
      let actualData = dynamicToggleProps({
        parentProps: {},
        parentState: {},
        name: "use_data",
        propsName: "data-name",
        field: {
          disabled: function () {
            return false;
          },
          labelText: "Use Data",
          tooltip: {},
          useOnOff: true,
        },
        handleInputChange: function (name) {
          toggleData = name;
        },
      });
      let expectedData = {
        className: "leftTextAlign fitContent fieldWidth cds--form-item tooltip",
        defaultToggled: undefined,
        id: "use-data-toggle-data-name",
        labelA: "Off",
        labelB: "On",
        labelText: " ",
        disabled: false,
      };
      assert.isFunction(actualData.onToggle, "it should be a function");
      actualData.onToggle();
      assert.deepEqual(
        toggleData,
        "use_data",
        "it should return name to parent function"
      );
      delete actualData.onToggle;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct props"
      );
    });
  });
});
