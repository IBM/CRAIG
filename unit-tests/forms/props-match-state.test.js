const { assert } = require("chai");
const { propsMatchState } = require("../../client/src/lib/forms");

describe("propsMatchState", () => {
  it("should return true if stateData and componentProps.data are the same", () => {
    assert.isTrue(
      propsMatchState(
        "resource_groups",
        { name: "test" },
        { data: { name: "test" } }
      ),
      "it should be true"
    );
  });
  it("should return true if vpc and default_network_acl_name is empty string", () => {
    assert.isTrue(
      propsMatchState(
        "vpcs",
        {
          name: "test",
          default_network_acl_name: "",
        },
        { data: { name: "test", default_network_acl_name: null } }
      ),
      "it should be true"
    );
  });
  it("should set component props data show to statedata show when checking if props match for security group", () => {
    assert.isTrue(
      propsMatchState("security_groups", { show: false }, { data: {} }),
      "it should be true"
    );
  });
  it("should set component props data hide to statedata hide when checking if props match for subnet tier", () => {
    assert.isTrue(
      propsMatchState(
        "subnetTier",
        {
          hide: false,
          showUnsavedChangesModal: undefined,
          advancedSave: false,
        },
        { data: {} }
      ),
      "it should be true"
    );
  });
  it("should set component props data hide to statedata hide when checking if props match for subnet tier with modal form", () => {
    assert.isTrue(
      propsMatchState(
        "subnetTier",
        {
          hide: false,
          showUnsavedChangesModal: true,
          select_zones: undefined,
          advancedSave: true,
        },
        {
          data: {
            showUnsavedChangesModal: true,
            select_zones: undefined,
            hide: false,
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return false is select_zones and subnets are different length", () => {
    assert.isFalse(
      propsMatchState(
        "subnetTier",
        {
          hide: false,
          showUnsavedChangesModal: true,
          select_zones: [1],
          advancedSave: true,
          subnets: [],
          advanced: true,
        },
        {
          data: {
            showUnsavedChangesModal: true,
            select_zones: undefined,
            hide: false,
            select_zones: [1],
            subnets: [],
          },
        }
      ),
      "it should be true"
    );
  });
});
