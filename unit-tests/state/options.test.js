const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const releaseNotes = require("../../client/src/lib/docs/release-notes.json");

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
        fs_cloud: false,
        dynamic_subnets: true,
        enable_classic: false,
        enable_power_vs: false,
        power_vs_zones: [],
        craig_version: releaseNotes[0].version,
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
    it("should update craig version when saved", () => {
      oState.options.save(
        { craig_version: "1.3.0" },
        { data: oState.store.json._options.craig_version }
      );
      let expectedData = {
        prefix: "iac",
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
        craig_version: "1.3.0",
      };
      assert.deepEqual(
        oState.store.json._options,
        expectedData,
        "it should have correct craig version"
      );
    });
    it("should update atracker location when changing region", () => {
      oState.options.save(
        { region: "eu-de" },
        { data: { region: "us-south" } }
      );
      assert.deepEqual(
        oState.store.json.atracker.locations,
        ["global", "eu-de"],
        "it should update region"
      );
    });
    describe("options.schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
      });
      it("should return region groups when fs cloud", () => {
        assert.deepEqual(
          craig.options.region.groups({ fs_cloud: true }),
          ["eu-de", "eu-es", "eu-gb", "us-east", "us-south"],
          "it should return correct groups"
        );
      });
      it("should return region groups when not fs cloud", () => {
        assert.deepEqual(
          craig.options.region.groups({ fs_cloud: false }),
          [
            "au-syd",
            "br-sao",
            "ca-tor",
            "eu-de",
            "eu-es",
            "eu-gb",
            "jp-osa",
            "jp-tok",
            "us-east",
            "us-south",
          ],
          "it should return correct groups"
        );
      });
      it("should have invalid prefix when none prefix", () => {
        assert.isTrue(craig.options.prefix.invalid({}), "it should be invalid");
      });
      it("should have invalid prefix when longer than 16 characters", () => {
        assert.isTrue(
          craig.options.prefix.invalid({ prefix: "looooooooooooooooooong" }),
          "it should be invalid"
        );
      });
      it("should have invalid prefix when bad value", () => {
        assert.isTrue(
          craig.options.prefix.invalid({ prefix: "@@@" }),
          "it should be invalid"
        );
      });
      it("should set power vs regions to [] and return region on input change", () => {
        let data = {
          region: "us-south",
        };
        assert.deepEqual(
          craig.options.region.onInputChange(data),
          "us-south",
          "it should return correct region"
        );
        assert.deepEqual(
          data,
          {
            region: "us-south",
            power_vs_zones: [],
          },
          "it should set power vs zones"
        );
      });
      it("should render public and private endpoints in title case", () => {
        assert.deepEqual(
          craig.options.endpoints.onRender({ endpoints: "public-and-private" }),
          "Public and Private",
          "it should return endpoints"
        );
      });
      it("should disable dynamic subnets toggle when advanced subnets is true", () => {
        assert.isTrue(
          craig.options.dynamic_subnets.disabled(
            {},
            {
              craig: {
                store: { json: { _options: { advanced_subnets: true } } },
              },
            }
          ),
          "it should be disabled"
        );
      });
      it("should disable dynamic subnets toggle when advanced subnets not found", () => {
        assert.isFalse(
          craig.options.dynamic_subnets.disabled(
            {},
            {
              craig: {
                store: { json: { _options: {} } },
              },
            }
          ),
          "it should be disabled"
        );
      });
      it("should change enable_power_vs from false to true", () => {
        let data = { enable_power_vs: false };
        craig.options.enable_power_vs.onStateChange(data);
        assert.deepEqual(
          data,
          {
            enable_power_vs: true,
          },
          "it should change value"
        );
      });
      it("should change enable_power_vs from true to false and reset zones", () => {
        let data = { enable_power_vs: true };
        craig.options.enable_power_vs.onStateChange(data);
        assert.deepEqual(
          data,
          {
            enable_power_vs: false,
            power_vs_zones: [],
          },
          "it should change value"
        );
      });
      it("should change power_vs_high_availability from false to true", () => {
        let data = { power_vs_high_availability: false };
        craig.options.power_vs_high_availability.onStateChange(data);
        assert.deepEqual(
          data,
          {
            power_vs_high_availability: true,
            power_vs_zones: ["dal12", "wdc06"],
          },
          "it should change value"
        );
      });
      it("should change power_vs_high_availability from true to false and reset zones", () => {
        let data = { power_vs_high_availability: true };
        craig.options.power_vs_high_availability.onStateChange(data);
        assert.deepEqual(
          data,
          {
            power_vs_high_availability: false,
            power_vs_zones: [],
          },
          "it should change value"
        );
      });
      it("should hide power_vs_high_availability when not using power vs", () => {
        assert.isTrue(
          craig.options.power_vs_high_availability.hideWhen({
            enable_power_vs: false,
          }),
          "it should be hidden"
        );
      });
      it("should return correct invalid text when region does not have power vs zones", () => {
        assert.deepEqual(
          craig.options.power_vs_zones.invalidText({ region: "invalid" }),
          "The region invalid does not have any available Power VS zones",
          "it should return correct invalid text"
        );
      });
      it("should be invalid when region does not have power vs zones", () => {
        assert.isTrue(
          craig.options.power_vs_zones.invalid({
            region: "invalid",
            enable_power_vs: true,
            power_vs_zones: [],
          }),
          "it should be invalid"
        );
      });
      it("should be invalid when region does not have power vs zones", () => {
        assert.isTrue(
          craig.options.power_vs_zones.invalid({
            region: "invalid",
            enable_power_vs: true,
            power_vs_zones: ["dal12", "wdc06"],
          }),
          "it should be invalid"
        );
      });
      it("should be valid when region does not have power vs zones and power vs not enabled", () => {
        assert.isFalse(
          craig.options.power_vs_zones.invalid({
            region: "invalid",
            enable_power_vs: false,
            power_vs_zones: [],
          }),
          "it should be invalid"
        );
      });
      it("should return correct invalid text when does have power vs zones", () => {
        assert.deepEqual(
          craig.options.power_vs_zones.invalidText({ region: "us-south" }),
          "Select at least one Availability Zone",
          "it should return correct invalid text"
        );
      });
      it("should force update zones on power vs high availability toggle", () => {
        assert.deepEqual(
          craig.options.power_vs_zones.forceUpdateKey({
            power_vs_high_availability: true,
          }),
          "trueundefined",
          "it should return value"
        );
      });
      it("should return correct power_vs_zones groups when power_vs_high_availability true", () => {
        assert.deepEqual(
          craig.options.power_vs_zones.groups({
            power_vs_high_availability: true,
          }),
          ["dal12", "wdc06"],
          "it should return correct groups"
        );
      });
      it("should return correct power_vs_zones groups when power_vs_high_availability false", () => {
        assert.deepEqual(
          craig.options.power_vs_zones.groups({
            power_vs_high_availability: false,
            region: "ca-tor",
          }),
          ["tor01"],
          "it should return correct groups"
        );
      });
      it("should return tags when no value", () => {
        assert.deepEqual(
          craig.options.tags.onInputChange({}),
          [],
          "it should return empty array"
        );
      });
      it("should return tags when value", () => {
        assert.deepEqual(
          craig.options.tags.onInputChange({
            tags: "hello,world",
          }),
          ["hello", "world"],
          "it should return empty array"
        );
      });
    });
  });
});
