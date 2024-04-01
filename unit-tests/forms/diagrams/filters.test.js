const { assert } = require("chai");
const {
  classicGatewaysFilter,
  classicBareMetalFilter,
  classicSubnetsFilter,
  state,
  powerSubnetFilter,
  powerMapFilter,
  classicVsiFilter,
  aclMapFilter,
} = require("../../../client/src/lib");

function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("filter functions", () => {
  describe("classicGatewaysFilter", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
      craig.store.json.classic_vlans[0] = {
        name: "classic-priv-vlan",
        datacenter: "dal10",
        type: "PRIVATE",
      };
      craig.store.json.classic_vlans[1] = {
        name: "classic-pub-vlan",
        datacenter: "dal10",
        type: "PUBLIC",
      };
    });
    it("should return a list of filtered classic gateways for a non-HADR gateway with a private vlan only", () => {
      craig.store.json.classic_gateways[0] = {
        name: "test-gw",
        datacenter: "dal10",
        hadr: false,
        private_vlan: "classic-priv-vlan",
      };
      let actualData = classicGatewaysFilter({
        craig: craig,
        datacenter: "dal10",
        vlan: craig.store.json.classic_vlans[0].name,
      });
      assert.deepEqual(
        actualData,
        [
          {
            name: "test-gw",
            datacenter: "dal10",
            hadr: false,
            index: 0,
            private_vlan: "classic-priv-vlan",
          },
        ],
        "it should return list of filtered classic gateways"
      );
    });
    it("should return a list of filtered classic gateways for a non-HADR gateway with a private and public vlan", () => {
      craig.store.json.classic_gateways[0] = {
        name: "test-gw",
        datacenter: "dal10",
        hadr: false,
        private_vlan: "classic-priv-vlan",
        public_vlan: "classic-pub-vlan",
      };
      let actualData = classicGatewaysFilter({
        craig: craig,
        datacenter: "dal10",
        vlan: craig.store.json.classic_vlans[1].name,
      });
      assert.deepEqual(
        actualData,
        [
          {
            name: "test-gw",
            datacenter: "dal10",
            hadr: false,
            index: 0,
            private_vlan: "classic-priv-vlan",
            public_vlan: "classic-pub-vlan",
          },
        ],
        "it should return list of filtered classic gateways"
      );
    });
    it("should return a list of filtered classic gateways for a HADR gateway", () => {
      craig.store.json.classic_gateways[0] = {
        name: "test-gw",
        datacenter: "dal10",
        hadr: true,
        private_vlan: "classic-priv-vlan",
      };
      let actualData = classicGatewaysFilter({
        craig: craig,
        datacenter: "dal10",
        vlan: craig.store.json.classic_vlans[0].name,
      });
      assert.deepEqual(
        actualData,
        [
          {
            name: "test-gw-1",
            datacenter: "dal10",
            hadr: true,
            index: 0,
            private_vlan: "classic-priv-vlan",
          },
          {
            name: "test-gw-2",
            datacenter: "dal10",
            hadr: true,
            index: 0,
            private_vlan: "classic-priv-vlan",
          },
        ],
        "it should return list of filtered classic gateways"
      );
    });
    it("should return an empty list if no vlans provided in props", () => {
      craig.store.json.classic_gateways[0] = {
        name: "test-gw",
        datacenter: "dal10",
        hadr: false,
        private_vlan: "classic-priv-vlan",
        public_vlan: "classic-pub-vlan",
      };
      let actualData = classicGatewaysFilter({
        craig: craig,
        datacenter: "dal10",
      });
      assert.deepEqual(
        actualData,
        [],
        "it should return list of filtered classic gateways"
      );
    });
  });
  describe("classicBareMetalFilter", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
      craig.store.json.classic_vlans[0] = {
        name: "classic-priv-vlan",
        datacenter: "dal10",
        type: "PRIVATE",
      };
      craig.store.json.classic_vlans[1] = {
        name: "classic-pub-vlan",
        datacenter: "dal10",
        type: "PUBLIC",
      };
      craig.store.json.classic_vlans[2] = {
        name: "other-priv-vlan",
        datacenter: "dal10",
        type: "PRIVATE",
      };
      craig.store.json.classic_vlans[3] = {
        name: "other-pub-vlan",
        datacenter: "dal10",
        type: "PRIVATE",
      };
    });
    it("should return a list of filtered bare metals that match the public or private vlan", () => {
      craig.store.json.classic_bare_metal[0] = {
        name: "bm1",
        datacenter: "dal10",
        private_vlan: "classic-priv-vlan",
        public_vlan: "classic-pub-vlan",
      };
      craig.store.json.classic_bare_metal[1] = {
        name: "bm2",
        datacenter: "dal10",
        private_vlan: "classic-priv-vlan",
        public_vlan: "other-pub-vlan",
      };
      craig.store.json.classic_bare_metal[2] = {
        name: "bm3",
        datacenter: "dal10",
        private_vlan: "other-priv-vlan",
        public_vlan: "classic-pub-vlan",
      };
      craig.store.json.classic_bare_metal[3] = {
        name: "bm4",
        datacenter: "dal10",
        private_vlan: "other-priv-vlan",
        public_vlan: "other-pub-vlan",
      };
      let actualData = classicBareMetalFilter({
        craig: craig,
        datacenter: "dal10",
        vlan: craig.store.json.classic_vlans[0].name,
      });
      assert.deepEqual(
        actualData,
        [
          {
            name: "bm1",
            datacenter: "dal10",
            private_vlan: "classic-priv-vlan",
            public_vlan: "classic-pub-vlan",
            index: 0,
          },
          {
            name: "bm2",
            datacenter: "dal10",
            private_vlan: "classic-priv-vlan",
            public_vlan: "other-pub-vlan",
            index: 1,
          },
        ],
        "it should return list of filtered classic gateways"
      );
    });
  });
  describe("powerSubnetFilter", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    it("should return a list of subnets when no vtl or instances have unfound subnets", () => {
      assert.deepEqual(
        powerSubnetFilter({
          craig: craig,
          power: {
            name: "test",
            network: [
              {
                name: "hi",
              },
            ],
          },
        }),
        [{ name: "hi" }],
        "it should return list"
      );
    });
    it("should return a list of subnets when no vtl has unfound subnets in a different workspace subnets", () => {
      craig.store.json.vtl = [
        {
          subnets: [],
          workspace: "oops",
        },
      ];
      assert.deepEqual(
        powerSubnetFilter({
          craig: craig,
          power: {
            name: "test",
            network: [
              {
                name: "hi",
              },
            ],
          },
        }),
        [{ name: "hi" }],
        "it should return list"
      );
    });
    it("should return a list of subnets when no vtl has unfound subnets in workspace", () => {
      craig.store.json.vtl = [
        {
          subnets: [],
          workspace: "test",
          network: [],
        },
      ];
      assert.deepEqual(
        powerSubnetFilter({
          craig: craig,
          power: {
            name: "test",
            network: [
              {
                name: "hi",
              },
            ],
          },
        }),
        [
          {
            name: "No Subnets Selected",
          },
          { name: "hi" },
        ],
        "it should return list"
      );
    });
  });
  describe("powerMapFilter", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    it("should return a list of workspaces when no instances", () => {
      assert.deepEqual(
        powerMapFilter({ craig: craig }),
        [],
        "it should send list of workspaces"
      );
    });
    it("should return a list of workspaces when instances have null workspace", () => {
      craig.store.json.power_instances = [{ workspace: null }];
      craig.store.json.vtl = [{ workspace: null }];
      assert.deepEqual(
        powerMapFilter({ craig: craig }),
        [{ name: null }],
        "it should send list of workspaces"
      );
    });
  });
  describe("classicVsiFilter", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    it("should return the vsi that contains mathcing public vlan", () => {
      craig.store.json.classic_vsi = [
        {
          name: "classic-vsi",
          private_vlan: "priv-vlan",
          public_vlan: "pub-vlan",
        },
      ];
      assert.deepEqual(
        classicVsiFilter({ craig: craig, vlan: "pub-vlan" }),
        [
          {
            name: "classic-vsi",
            private_vlan: "priv-vlan",
            public_vlan: "pub-vlan",
            index: 0,
          },
        ],
        "it should return filtered vsi"
      );
    });
    it("should return the vsi that contains the matching private vlan", () => {
      craig.store.json.classic_vsi = [
        {
          name: "classic-vsi",
          private_vlan: "priv-vlan",
          public_vlan: "pub-vlan",
        },
      ];
      assert.deepEqual(
        classicVsiFilter({ craig: craig, vlan: "priv-vlan" }),
        [
          {
            name: "classic-vsi",
            private_vlan: "priv-vlan",
            public_vlan: "pub-vlan",
            index: 0,
          },
        ],
        "it should return filtered vsi"
      );
    });
    it("should return empty array if no vlans match", () => {
      craig.store.json.classic_vsi = [
        {
          name: "classic-vsi",
          private_vlan: "priv-vlan",
          public_vlan: "pub-vlan",
        },
      ];
      assert.deepEqual(
        classicVsiFilter({ craig: craig, vlan: "fake-vlan" }),
        [],
        "it should return empty array"
      );
    });
  });
  describe("aclMapFilter", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
      craig.store.json.vpcs[0] = {
        name: "vpc1",
        subnets: [
          {
            use_data: true,
            network_acl: {
              name: "subnet_acl",
            },
          },
          {
            use_data: false,
            network_acl: null,
          },
        ],
        acls: [
          {
            name: "acl1",
          },
        ],
      };
      craig.store.json.vpcs[1] = {
        name: "vpc2",
        subnets: [
          {
            use_data: false,
            network_acl: null,
          },
        ],
        acls: [
          {
            name: "acl1",
          },
          {
            name: "acl2",
          },
        ],
      };
      craig.store.json.vpcs[2] = {
        name: "vpc3",
        subnets: null,
        acls: null,
      };
    });
    it("should return list of acls when use_data is true", () => {
      let actualData = aclMapFilter({
        vpc: craig.store.json.vpcs[0],
      });
      assert.deepEqual(
        actualData,
        [{ name: null }, { name: "acl1" }],
        "should be equal"
      );
    });
    it("should return list of acls when use_data is false", () => {
      let actualData = aclMapFilter({
        vpc: craig.store.json.vpcs[1],
      });
      assert.deepEqual(
        actualData,
        [{ name: null }, { name: "acl1" }, { name: "acl2" }],
        "should be equal"
      );
    });
    it("should return empty array when no subnets or acls", () => {
      let actualData = aclMapFilter({
        vpc: craig.store.json.vpcs[2],
      });
      assert.deepEqual(actualData, [], "should be equal");
    });
  });
  describe("classicSubnetsFilter", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
      craig.store.json.classic_vlans[0] = {
        name: "classic-priv-vlan",
        datacenter: "dal10",
        type: "PRIVATE",
      };
    });
    it("should return no subnets with no vlans exist in datacenter", () => {
      assert.deepEqual(
        classicSubnetsFilter({ craig: craig, datacenter: "wdc07" }),
        [],
        "it should be empty"
      );
    });
    it("should return subnets when vlans exist in datacenter", () => {
      assert.deepEqual(
        classicSubnetsFilter({ craig: craig, datacenter: "dal10" }),
        [
          {
            name: "classic-priv-vlan",
            datacenter: "dal10",
            type: "PRIVATE",
          },
        ],
        "it should return one vlan"
      );
    });
  });
});
