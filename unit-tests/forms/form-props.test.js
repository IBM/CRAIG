const { assert } = require("chai");
const {
  state,
  defaultFormTemplate,
  setFormRgList,
  setFormVpcList,
} = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("form props", () => {
  describe("defaultFormTemplate", () => {
    it("should initialize default formTemplate", () => {
      let craig = newState();
      let actualData = defaultFormTemplate(
        {
          name: "name",
          addText: "addtext",
          innerForm: "innerForm",
        },
        "vpcs",
        craig
      );
      assert.deepEqual(
        {
          name: actualData.name,
          addText: actualData.addText,
          innerForm: "innerForm",
        },
        {
          name: "name",
          addText: "addtext",
          innerForm: "innerForm",
        },
        "it should return correct template"
      );
    });
  });
  describe("setFormRgList", () => {
    it("should set rg list if creating a form with rgs", () => {
      let craig = newState();
      let form = "appID";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {
          resourceGroups: ["service-rg", "management-rg", "workload-rg"],
        },
      };
      setFormRgList(form, formTemplate, craig);
      assert.deepEqual(formTemplate, expectedData);
    });
    it("should set not set rg list if creating a form without rgs", () => {
      let craig = newState();
      let form = "bad-form";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {},
      };
      setFormRgList(form, formTemplate, craig);
      assert.deepEqual(formTemplate, expectedData);
    });
  });
  describe("setFormVpcList", () => {
    it("should set vpc list if creating a form with rgs", () => {
      let craig = newState();
      let form = "vsi";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {
          vpcList: ["management", "workload"]
        },
      };
      setFormVpcList(form, formTemplate, craig);
      assert.deepEqual(formTemplate, expectedData);
    });
    it("should set not set vpc list if creating a form without rgs", () => {
      let craig = newState();
      let form = "bad-form";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {},
      };
      setFormVpcList(form, formTemplate, craig);
      assert.deepEqual(formTemplate, expectedData);
    });
  });
});
