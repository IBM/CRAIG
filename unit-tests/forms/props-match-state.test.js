const { assert } = require("chai");
const { propsMatchState } = require("../../client/src/lib/forms");

describe("propsMatchState", () => {
  it("should return true if a function that causes deep equal to crash is sent", () => {
    assert.isTrue(
      propsMatchState(
        "sysdig",
        {
          fn: () => {},
        },
        {
          data: {
            fn: "egg",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if stateData and componentProps.data are the same", () => {
    assert.isTrue(
      propsMatchState(
        "resource_groups",
        { name: "test" },
        { data: { name: "test" } },
      ),
      "it should be true",
    );
  });
  it("should return true if vpc uses data", () => {
    assert.isTrue(
      propsMatchState(
        "vpcs",
        {
          name: "test",
          use_data: true,
        },
        {
          data: {
            name: "test",
            use_data: true,
          },
        },
      ),
      "it should be true",
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
        {
          data: {
            name: "test",
            default_network_acl_name: null,
            acls: [],
            subnets: [],
            address_prefixes: [],
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if vpc and default_routing_table_name is null", () => {
    assert.isTrue(
      propsMatchState(
        "vpcs",
        {
          name: "test",
          default_routing_table_name: "",
        },
        {
          data: {
            name: "test",
            default_routing_table_name: null,
            acls: [],
            subnets: [],
            address_prefixes: [],
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if vpc and default_security_group_name is empty string", () => {
    assert.isTrue(
      propsMatchState(
        "vpcs",
        {
          default_security_group_name: "",
        },
        {
          data: {
            default_security_group_name: null,
            acls: [],
            subnets: [],
            address_prefixes: [],
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if vpc and default_network_acl_name is null", () => {
    assert.isTrue(
      propsMatchState(
        "vpcs",
        {
          name: "test",
          default_network_acl_name: null,
        },
        {
          data: {
            name: "test",
            default_network_acl_name: "",
            acls: [],
            subnets: [],
            address_prefixes: [],
          },
        },
      ),
      "it should be true",
    );
  });
  it("should set component props data show to statedata show when checking if props match for security group", () => {
    assert.isTrue(
      propsMatchState(
        "security_groups",
        { show: false },
        { data: { show: true } },
      ),
      "it should be true",
    );
  });
  it("should set component props data show to statedata show when checking if props match for security group when no show", () => {
    assert.isTrue(
      propsMatchState("security_groups", {}, { data: {} }),
      "it should be true",
    );
  });
  it("should set component props data hide to statedata hide when checking if props match for subnet tier in dynamic form", () => {
    assert.isTrue(
      propsMatchState(
        "subnetTier",
        {
          hide: false,
          showUnsavedChangesModal: undefined,
          advancedSave: false,
          advanced: true,
        },
        { data: {}, formName: "subnetTier" },
      ),
      "it should be false",
    );
  });
  it("should set component props data hide to statedata hide when checking if props match for subnet tier", () => {
    assert.isFalse(
      propsMatchState(
        "subnetTier",
        {
          hide: false,
          showUnsavedChangesModal: undefined,
          advancedSave: false,
          advanced: false,
        },
        { data: {}, formName: "asdd" },
      ),
      "it should be true",
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
        { data: {} },
      ),
      "it should be true",
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
        },
      ),
      "it should be true",
    );
  });
  it("should set component props data archive value to statedata archive value for logdna instance if missing", () => {
    assert.isTrue(
      propsMatchState(
        "logdna",
        {
          name: "logdna",
          archive: false,
          enabled: false,
          plan: "14-day",
          endpoints: "private",
          platform_logs: false,
          resource_group: "frog-rg",
          cos: "toad-cos",
          bucket: "toad-bucket",
        },
        {
          data: {
            name: "logdna",
            enabled: false,
            plan: "14-day",
            endpoints: "private",
            platform_logs: false,
            resource_group: "frog-rg",
            cos: "toad-cos",
            bucket: "toad-bucket",
          },
        },
      ),
      "it should be true",
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
        },
      ),
      "it should be true",
    );
  });
  describe("power vs", () => {
    it("should set not zone when field is power", () => {
      assert.isFalse(
        propsMatchState(
          "power",
          {
            zone: "frog",
          },
          {
            data: {
              zone: "toad",
            },
          },
        ),
      );
    });
    it("should set zone when field is not power", () => {
      assert.isTrue(
        propsMatchState(
          "test",
          {
            zone: "frog",
          },
          {
            data: {
              zone: "toad",
            },
          },
        ),
      );
    });
    it("should return false if power image names are different", () => {
      assert.isFalse(
        propsMatchState(
          "power",
          {
            imageNames: [],
            zone: "frog",
          },
          {
            data: {
              zone: "frog",
              imageNames: ["names"],
            },
          },
        ),
        "should not match",
      );
    });
    it("should remove attachments when field is power and attachments is non-empty", () => {
      assert.isTrue(
        propsMatchState(
          "power",
          { attachments: ["foo"] },
          { data: { attachments: [] } },
        ),
      );
    });
    it("should do nothing to attachments when field is power and attachments is empty", () => {
      assert.isTrue(
        propsMatchState(
          "power",
          { attachments: [] },
          { data: { attachments: [] } },
        ),
      );
    });
    it("should return true when field is options and state matches props.craig.store.json._options", () => {
      assert.isTrue(
        propsMatchState(
          "options",
          {
            prefix: "",
            region: "us-south",
            tags: ["hello", "world"],
            zones: 3,
            endpoints: "private",
            account_id: "",
            fs_cloud: false,
            dynamic_subnets: true,
            enable_classic: false,
            enable_power_vs: false,
            power_vs_zones: [],
            craig_version: "1.8.0",
          },
          {
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "",
                    region: "us-south",
                    tags: ["hello", "world"],
                    zones: 3,
                    endpoints: "private",
                    account_id: "",
                    fs_cloud: false,
                    dynamic_subnets: true,
                    enable_classic: false,
                    enable_power_vs: false,
                    power_vs_zones: [],
                    craig_version: "1.8.0",
                  },
                },
              },
            },
            data: {
              name: "frog",
            },
          },
        ),
      );
    });
  });
});
