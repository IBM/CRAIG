const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state(true);
  store.setUpdateCallback(() => {});
  return store;
}

describe("options", () => {
  describe("options.init", () => {
    it("should initialize options in json", () => {
      let state = new newState();
      let expectedData = {
        prefix: "iac",
        region: "us-south",
        tags: ["hello", "world"],
        zones: 3,
        endpoints: "private",
        account_id: "",
        fs_cloud: true,
        dynamic_subnets: true,
        enable_power_vs: false,
        power_vs_zones: [],
      };
      assert.deepEqual(
        state.store.json._options,
        expectedData,
        "it should have options initialized"
      );
    });
  });
  describe("options.save", () => {
    let oState;
    beforeEach(() => {
      oState = new newState(true);
    });
    it("should change the prefix when saved", () => {
      oState.options.save(
        { prefix: "test", showModal: false },
        { data: { prefix: "iac" } }
      );
      assert.deepEqual(oState.store.json._options.prefix, "test");
    });
    it("should update tags when saved", () => {
      oState.options.save(
        { tags: ["new", "tags", "here"] },
        { data: { tags: ["hello", "world"] } }
      );
      assert.deepEqual(oState.store.json._options.tags, [
        "new",
        "tags",
        "here",
      ]);
    });
    it("should update subnetTier zones when saved", () => {
      oState.options.save({ zones: 2 }, { data: { prefix: "iac" } });
      let expectedData = {
        management: [
          {
            name: "vsi",
            zones: 2,
          },
          {
            name: "vpe",
            zones: 2,
          },
          {
            name: "vpn",
            zones: 2,
          },
        ],
        workload: [
          {
            name: "vsi",
            zones: 2,
          },
          {
            name: "vpe",
            zones: 2,
          },
        ],
      };
      assert.deepEqual(
        expectedData,
        oState.store.subnetTiers,
        "all zones should be 2"
      );
    });
    it("should update subnets when saved", () => {
      oState.store.json._options.dynamic_subnets = false;
      oState.options.save({ zones: 1 }, { data: { prefix: "iac" } });
      let expectedData = [
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
          zone: 1,
          cidr: "10.10.20.0/24",
          name: "vpe-zone-1",
          resource_group: "management-rg",
          network_acl: "management",
          public_gateway: false,
          has_prefix: true,
        },
      ];
      assert.deepEqual(oState.store.json.vpcs[0].subnets, expectedData);
    });
  });
});
