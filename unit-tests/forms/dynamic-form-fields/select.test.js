const { assert } = require("chai");
const {
  dynamicSelectProps,
  dynamicFetchSelectDataToGroups,
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
        key: '["","a","b","c"]',
        readOnly: false,
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
        readOnly: false,
        key: '["","a","b","c"]',
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
        readOnly: false,
        key: '["","a","b","c"]',
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it('should return the correct props for select when not disabled and fetch select and unmounted and stateData is ["Loading..."] and no value', () => {
      let actualData = dynamicSelectProps(
        {
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
            type: "fetchSelect",
          },
          parentState: {},
          parentProps: {
            formName: "atracker",
          },
          handleInputChange: function () {},
          keyIndex: 0,
          name: "name",
          propsName: "frog",
        },
        false,
        ["Loading..."]
      );
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
        readOnly: false,
        key: '["","a","b","c"]',
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
          readOnly: true,
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
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        name: "name",
        value: "",
        readOnly: true,
        key: '["","a","b","c"]',
      };
      assert.isFunction(actualData.onChange, "it should be a function");
      delete actualData.onChange;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correctly formatted data"
      );
    });
    it("should return the correct props for text input when not disabled and no value and read only is function", () => {
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
          readOnly: function () {
            return false;
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
        invalid: false,
        invalidText: "uh oh",
        labelText: "Name",
        name: "name",
        value: "",
        readOnly: false,
        key: '["","a","b","c"]',
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
  describe("dynamicFetchSelectDataToGroups", () => {
    it("should return correct list of versions based on kube type of openshift", () => {
      let expectedData = ["1_openshift"];
      let actualData = dynamicFetchSelectDataToGroups(
        {
          data: ["1_openshift", "2"],
        },
        {
          field: {
            apiEndpoint: function () {
              return "/api/cluster/versions";
            },
          },
          parentProps: {},
          parentState: {
            kube_version: "yes",
            kube_type: "openshift",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct list of versions based on kube type of iks", () => {
      let expectedData = ["", "2"];
      let actualData = dynamicFetchSelectDataToGroups(
        {
          data: ["1_openshift", "2"],
        },
        {
          field: {
            apiEndpoint: function () {
              return "/api/cluster/versions";
            },
          },
          parentProps: {},
          parentState: {
            kube_version: null,
            kube_type: "iks",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct list of versions based on kube type of iks and modal", () => {
      let expectedData = ["", "2"];
      let actualData = dynamicFetchSelectDataToGroups(
        {
          data: ["1_openshift", "2"],
        },
        {
          field: {
            apiEndpoint: function () {
              return "/api/cluster/versions";
            },
          },
          parentProps: {
            isModal: true,
          },
          parentState: {
            kube_version: "none",
            kube_type: "iks",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct list for other endpoints when mounted and loaded", () => {
      let expectedData = ["", "frog", "toad"];
      let actualData = dynamicFetchSelectDataToGroups(
        {
          data: ["frog", "toad"],
        },
        {
          name: "hi",
          field: {
            apiEndpoint: function () {
              return "/api/frog/toad";
            },
            disabled: () => {
              return false;
            },
            invalid: () => {
              return false;
            },
            invalidText: () => {
              return "oops";
            },
            groups: [],
          },
          parentProps: {},
          parentState: {
            hi: "",
          },
          handleInputChange: () => {},
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct list for other endpoints when mounted and loaded but selected", () => {
      let expectedData = ["frog", "toad"];
      let actualData = dynamicFetchSelectDataToGroups(
        {
          data: ["frog", "toad"],
        },
        {
          name: "hi",
          field: {
            apiEndpoint: function () {
              return "/api/frog/toad";
            },
            disabled: () => {
              return false;
            },
            invalid: () => {
              return false;
            },
            invalidText: () => {
              return "oops";
            },
            groups: [],
          },
          parentProps: {},
          parentState: {
            hi: "frog",
          },
          handleInputChange: () => {},
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct list for other endpoints when mounted and loaded but selected with on render function", () => {
      let expectedData = ["FROG", "TOAD"];
      let actualData = dynamicFetchSelectDataToGroups(
        {
          data: ["frog", "toad"],
        },
        {
          name: "hi",
          field: {
            apiEndpoint: function () {
              return "/api/frog/toad";
            },
            disabled: () => {
              return false;
            },
            invalid: () => {
              return false;
            },
            invalidText: () => {
              return "oops";
            },
            groups: [],
            onRender: function (stateData) {
              return stateData.hi.toUpperCase();
            },
          },
          parentProps: {},
          parentState: {
            hi: "frog",
          },
          handleInputChange: () => {},
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
