const { assert } = require("chai");
const {
  state,
  defaultFormTemplate,
  setFormRgList,
  setFormVpcList,
  setFormEncryptionKeyList,
  setFormSubnetList,
  setDeleteDisabledMessage,
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
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
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
          vpcList: ["management", "workload"],
        },
      };
      setFormVpcList(form, formTemplate, craig);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
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
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
  });
  describe("setFormEncryptionKeyList", () => {
    it("should set encryption key list if creating a form with keys", () => {
      let craig = newState();
      let form = "vsi";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {
          encryptionKeys: ["key", "atracker-key", "vsi-volume-key", "roks-key"],
        },
      };
      setFormEncryptionKeyList(form, formTemplate, craig);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
    it("should set not set encryption key list if creating a form without encryption keys", () => {
      let craig = newState();
      let form = "bad-form";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {},
      };
      setFormEncryptionKeyList(form, formTemplate, craig);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
  });
  describe("setFormSubnetList", () => {
    it("should set subnet list if creating a form with subnets", () => {
      let craig = newState();
      let form = "vsi";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {
          subnetList: [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.10.0/24",
              name: "vsi-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.10.0/24",
              name: "vsi-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 1,
              cidr: "10.40.10.0/24",
              name: "vsi-zone-1",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 2,
              cidr: "10.50.10.0/24",
              name: "vsi-zone-2",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 3,
              cidr: "10.60.10.0/24",
              name: "vsi-zone-3",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 1,
              cidr: "10.40.20.0/24",
              name: "vpe-zone-1",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 2,
              cidr: "10.50.20.0/24",
              name: "vpe-zone-2",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 3,
              cidr: "10.60.20.0/24",
              name: "vpe-zone-3",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ],
        },
      };
      setFormSubnetList(form, formTemplate, craig);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
    it("should set not set subnet list if creating a form without subnets", () => {
      let craig = newState();
      let form = "bad-form";
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {},
      };
      setFormSubnetList(form, formTemplate, craig);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
  });
  describe("setDeleteDisabledMessage", () => {
    it("should not set message if not form with delete message", () => {
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        innerFormProps: {},
      };
      setDeleteDisabledMessage("bad-form", formTemplate);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
    it("should set message for rg", () => {
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        deleteDisabledMessage: "Cannot delete only resource group",
        innerFormProps: {},
      };
      setDeleteDisabledMessage("resourceGroups", formTemplate);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
    it("should set message for ssh keys", () => {
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        deleteDisabledMessage:
          "Cannot delete SSH Keys in use by Virtual Servers",
        innerFormProps: {},
      };
      setDeleteDisabledMessage("sshKeys", formTemplate);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
    it("should set message for kms", () => {
      let formTemplate = {
        innerFormProps: {},
      };
      let expectedData = {
        deleteDisabledMessage: "Cannot delete only Key Management instance",
        innerFormProps: {},
      };
      setDeleteDisabledMessage("keyManagement", formTemplate);
      assert.deepEqual(
        formTemplate,
        expectedData,
        "it should have correct data"
      );
    });
  });
});
