const { assert } = require("chai");
const { getDisplayTierSubnetList, state } = require("../../../client/src/lib");

function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("subnet row functions", () => {
  describe("getDisplayTierSubnetList", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    it("should return a list of subnets for non-advanced subnet tier", () => {
      // it should not have subnets with a matching name but a different tier
      craig.store.json.vpcs[0].subnets[2].tier = "different";
      let actualData = getDisplayTierSubnetList({
        craig: craig,
        vpc: craig.store.json.vpcs[0],
        tier: craig.store.subnetTiers.management[0],
      });
      assert.deepEqual(
        actualData,
        [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.1.0.0/29",
            name: "vsi-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            display: "none",
            zone: "2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.1.0.40/29",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
        ],
        "it should return list of subnets for non-advanced tier",
      );
    });
    it("should return a list of subnets for non-advanced subnet tier when out of order", () => {
      // it should not have subnets with a matching name but a different tier
      craig.store.json.vpcs[0].subnets[2].tier = "different";
      craig.store.json.vpcs[0].subnets = [
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.0.0/29",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.0/29",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.0.0/29",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
          tier: "different",
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.16/28",
          name: "vpn-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.48/29",
          name: "vpe-zone-1",
          resource_group: "management-rg",
          network_acl: "management",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.0.16/29",
          name: "vpe-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.0.16/29",
          name: "vpe-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
      ];
      let actualData = getDisplayTierSubnetList({
        craig: craig,
        vpc: craig.store.json.vpcs[0],
        tier: craig.store.subnetTiers.management[0],
      });
      assert.deepEqual(
        actualData,
        [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.0/29",
            name: "vsi-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            display: "none",
            zone: "2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.0.0/29",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
        ],
        "it should return list of subnets for non-advanced tier",
      );
    });
    it("should return a list of subnets for non-advanced subnet tier from JSON", () => {
      craig.hardSetJson(craig.store.json, true);
      // it should not have subnets with a matching name but a different tier
      craig.store.json.vpcs[0].subnets[2].tier = "different";
      let actualData = getDisplayTierSubnetList({
        craig: craig,
        vpc: craig.store.json.vpcs[0],
        tier: craig.store.json.vpcs[0].subnetTiers[0],
      });
      assert.deepEqual(
        actualData,
        [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.1.0.0/29",
            name: "vsi-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            display: "none",
            zone: "2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.1.0.40/29",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
        ],
        "it should return list of subnets for non-advanced tier",
      );
    });
    it("should return a list of subnets for advanced subnet tier", () => {
      // it should not have subnets with a matching name but a different tier
      craig.vpcs.subnetTiers.save(
        {
          name: "vsi",
          advanced: true,
          select_zones: ["1", "2", "3"],
          zones: ["1", "2", "3"],
        },
        {
          data: {
            name: "vsi",
          },
          vpc_name: "management",
        },
      );
      let actualData = getDisplayTierSubnetList({
        craig: craig,
        vpc: craig.store.json.vpcs[0],
        tier: craig.store.subnetTiers.management[0],
      });
      assert.deepEqual(
        actualData,
        [
          {
            name: "vsi-zone-1",
            cidr: "10.1.0.0/29",
            network_acl: "management",
            public_gateway: false,
            zone: 1,
            vpc: "management",
            resource_group: "management-rg",
            has_prefix: false,
          },
          {
            name: "vsi-zone-2",
            cidr: "10.1.0.32/29",
            network_acl: "management",
            public_gateway: false,
            zone: 2,
            vpc: "management",
            resource_group: "management-rg",
            has_prefix: false,
          },
          {
            name: "vsi-zone-3",
            cidr: "10.1.0.40/29",
            network_acl: "management",
            public_gateway: false,
            zone: 3,
            vpc: "management",
            resource_group: "management-rg",
            has_prefix: false,
          },
        ],
        "it should return list of subnets for non-advanced tier",
      );
    });
    it("should return a list of subnets for advanced subnet tier from JSON", () => {
      craig.hardSetJson(craig.store.json, true);
      // it should not have subnets with a matching name but a different tier
      craig.vpcs.subnetTiers.save(
        {
          name: "vsi",
          advanced: true,
          select_zones: ["1", "2", "3"],
          zones: ["1", "2", "3"],
        },
        {
          data: {
            name: "vsi",
          },
          vpc_name: "management",
        },
      );
      let actualData = getDisplayTierSubnetList({
        craig: craig,
        vpc: craig.store.json.vpcs[0],
        tier: craig.store.json.vpcs[0].subnetTiers[0],
      });
      assert.deepEqual(
        actualData,
        [
          {
            name: "vsi-zone-1",
            cidr: "10.1.0.40/29",
            network_acl: null,
            public_gateway: false,
            zone: "1",
            vpc: "management",
            resource_group: "management-rg",
            has_prefix: false,
            tier: "vsi",
          },
          {
            name: "vsi-zone-2",
            cidr: "10.1.0.48/29",
            network_acl: null,
            public_gateway: false,
            zone: "2",
            vpc: "management",
            resource_group: "management-rg",
            has_prefix: false,
            tier: "vsi",
          },
          {
            name: "vsi-zone-3",
            cidr: "10.1.0.56/29",
            network_acl: null,
            public_gateway: false,
            zone: "3",
            vpc: "management",
            resource_group: "management-rg",
            has_prefix: false,
            tier: "vsi",
          },
        ],
        "it should return list of subnets for non-advanced tier",
      );
    });
    it("should return a list of subnets for advanced subnet tier from JSON", () => {
      craig.hardSetJson(craig.store.json, true);
      // it should not have subnets with a matching name but a different tier
      craig.vpcs.subnetTiers.save(
        {
          name: "vsi",
          advanced: true,
          select_zones: ["3"],
          zones: ["3"],
        },
        {
          data: {
            name: "vsi",
          },
          vpc_name: "management",
        },
      );
      let actualData = getDisplayTierSubnetList({
        craig: craig,
        vpc: craig.store.json.vpcs[0],
        tier: craig.store.json.vpcs[0].subnetTiers[0],
      });
      assert.deepEqual(
        actualData,
        [
          {
            display: "none",
            zone: "1",
          },
          {
            display: "none",
            zone: "2",
          },
          {
            name: "vsi-zone-3",
            cidr: "10.1.0.40/29",
            network_acl: null,
            public_gateway: false,
            zone: "3",
            vpc: "management",
            resource_group: "management-rg",
            has_prefix: false,
            tier: "vsi",
          },
        ],
        "it should return list of subnets for non-advanced tier",
      );
    });
  });
});
