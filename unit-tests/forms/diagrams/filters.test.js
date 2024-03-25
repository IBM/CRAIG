const { assert } = require("chai");
const { classicGatewaysFilter, state } = require("../../../client/src/lib");

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
});
