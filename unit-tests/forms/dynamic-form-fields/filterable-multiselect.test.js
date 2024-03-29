const { assert } = require("chai");
const {
  dynamicMultiSelectProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields/filterable-multiselect");

describe("filterable multiselect", () => {
  describe("dynamicMultiSelectProps", () => {
    it("should return the correct props for multiselect when not disabled", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
        name: "frog",
        field: {
          disabled: function () {
            return false;
          },
          invalid: function () {
            return true;
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
          groups: [],
        },
        parentState: {},
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-name-0",
        invalid: true,
        items: [],
        key: undefined,
        label: "Name",
        titleText: "Name",
        useTitleInItem: false,
        initialSelectedItems: [],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "name",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for multiselect when not disabled", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
        name: "frog",
        field: {
          disabled: function () {
            return false;
          },
          invalid: function () {
            return true;
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
          groups: [],
        },
        parentState: {
          name: [],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-name-0",
        invalid: true,
        items: [],
        key: undefined,
        label: "Name",
        titleText: "Name",
        useTitleInItem: false,
        initialSelectedItems: [],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "name",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for multiselect when not disabled and force update using key prop", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
        name: "frog",
        field: {
          forceUpdateKey: function () {
            return "ham";
          },
          disabled: function () {
            return false;
          },
          invalid: function () {
            return true;
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
          groups: [],
        },
        parentState: {
          name: [],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-name-0",
        invalid: true,
        items: [],
        key: "ham",
        label: "Name",
        titleText: "Name",
        useTitleInItem: false,
        initialSelectedItems: [],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "name",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for multiselect when not disabled and has tooltip", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
        name: "frog",
        field: {
          tooltip: {},
          disabled: function () {
            return false;
          },
          invalid: function () {
            return true;
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
          groups: [],
        },
        parentState: {
          name: [],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-name-0",
        invalid: true,
        items: [],
        key: undefined,
        label: null,
        titleText: "Name",
        useTitleInItem: false,
        initialSelectedItems: [],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "name",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for multiselect when not disabled and onrender is used", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
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
          groups: ["egg", "salad"],
          onRender: function () {
            return ["egg", "salad"];
          },
        },
        parentState: {
          name: ["frog", "toad"],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-name-0",
        invalid: false,
        items: ["egg", "salad"],
        key: undefined,
        label: "Name",
        titleText: "Name",
        useTitleInItem: false,
        initialSelectedItems: ["egg", "salad"],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "name",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for multiselect when not disabled, items are none, and is optional", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
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
          groups: [],
        },
        parentState: {
          name: [],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-name-0",
        invalid: false,
        items: [],
        key: undefined,
        label: "Name",
        titleText: "Name",
        useTitleInItem: false,
        initialSelectedItems: [],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "name",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for multiselect when not disabled, items are not none, and is network", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
        name: "network",
        field: {
          disabled: function () {
            return false;
          },
          invalid: function () {
            return true;
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
          groups: [],
        },
        parentState: {
          network: ["egg"],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "network",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-network-0",
        invalid: false,
        items: [],
        key: undefined,
        label: "Network",
        titleText: "Network",
        useTitleInItem: false,
        initialSelectedItems: ["egg"],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "network",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for multiselect when not disabled, items are none, and is optional and is invalid", () => {
      let inputChangeValue = "";
      let actualData = dynamicMultiSelectProps({
        name: "frog",
        field: {
          optional: true,
          disabled: function () {
            return false;
          },
          invalid: function () {
            return true;
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
          groups: [],
        },
        parentState: {
          name: ["oops"],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      });
      let expectedData = {
        className: "leftTextAlign fieldWidth",
        disabled: false,
        id: "frog-name-0",
        invalid: true,
        items: [],
        key: undefined,
        label: "Name",
        titleText: "Name",
        useTitleInItem: false,
        initialSelectedItems: ["oops"],
        invalidText: "uh oh",
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      actualData.onChange({ selectedItems: ["items"] });
      assert.deepEqual(
        inputChangeValue,
        {
          target: {
            name: "name",
            value: ["items"],
          },
        },
        "it should return correct value"
      );
      delete actualData.onChange;
      assert.isFunction(actualData.itemToString, "it should be a function");
      assert.deepEqual(
        actualData.itemToString(),
        "",
        "it should return empty string"
      );
      assert.deepEqual(
        actualData.itemToString("hi"),
        "hi",
        "it should return string"
      );
      delete actualData.itemToString;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
  });
  it("should return name of item if it has a name field", () => {
    let actualData = dynamicMultiSelectProps({
      name: "frog",
      field: {
        optional: true,
        disabled: function () {
          return false;
        },
        invalid: function () {
          return true;
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
        groups: [],
      },
      parentState: {
        name: ["oops"],
      },
      parentProps: {
        formName: "atracker",
      },
      handleInputChange: function (event) {
        inputChangeValue = event;
      },
      keyIndex: 0,
      name: "name",
      propsName: "frog",
    });
    assert.deepEqual(
      actualData.itemToString({ name: "frog" }),
      "frog",
      "it should return string"
    );
  });
  it("should append Loading... to labelText if data is being fetched", () => {
    let inputChangeValue = "";
    let actualData = dynamicMultiSelectProps(
      {
        name: "frog",
        field: {
          type: "fetchMultiSelect",
          optional: true,
          disabled: function () {
            return false;
          },
          invalid: function () {
            return true;
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
          groups: [],
        },
        parentState: {
          name: ["oops"],
        },
        parentProps: {
          formName: "atracker",
        },
        handleInputChange: function (event) {
          inputChangeValue = event;
        },
        keyIndex: 0,
        name: "name",
        propsName: "frog",
      },
      ["Loading..."]
    );
    let expectedData = {
      className: "leftTextAlign fieldWidth",
      disabled: true,
      id: "frog-name-0",
      invalid: true,
      items: [],
      key: undefined,
      label: "Loading name...",
      titleText: "Loading name...",
      useTitleInItem: false,
      initialSelectedItems: ["oops"],
      invalidText: "uh oh",
    };
    delete actualData.itemToString;
    delete actualData.onChange;
    assert.deepEqual(
      actualData,
      expectedData,
      "it should add Loading... to name"
    );
  });
});
