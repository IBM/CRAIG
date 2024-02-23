const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib/forms");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("vpn_gateways", () => {
  describe("vpn_gateways.init", () => {
    it("should initialize vpn for default patterns", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.json.vpn_gateways,
        [
          {
            name: "management-gateway",
            resource_group: "management-rg",
            subnet: "vpn-zone-1",
            vpc: "management",
          },
        ],
        "it should create vpn gateway"
      );
    });
  });
  describe("vpn_gatways.onStoreUpdate", () => {
    it("should remove subnet name and vpc name on deletion", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "management-rg",
          subnet: null,
          vpc: null,
          connections: [],
        },
      ];
      state.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should update gateways"
      );
    });
    it("should remove unfound subnet name if vpc exists", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "management-rg",
          subnet: null,
          vpc: "management",
          connections: [],
        },
      ];
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vpn-zone-1",
          },
        }
      );
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should update gateways"
      );
    });
    it("should remove unfound resource groups", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: null,
          subnet: "vpn-zone-1",
          vpc: "management",
          connections: [],
        },
      ];
      state.resource_groups.delete({}, { data: { name: "management-rg" } });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should update gateways"
      );
    });
  });
  describe("vpn_gateways.delete", () => {
    it("should delete a vpn gateway by name", () => {
      let state = new newState();
      state.vpn_gateways.delete({}, { data: { name: "management-gateway" } });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        [],
        "it should delete the gw"
      );
    });
  });
  describe("vpn_gateways.save", () => {
    it("should update a vpn gateway", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "todd",
          resource_group: "management-rg",
          subnet: "vpe-zone-1",
          vpc: "workload",
          connections: [],
        },
      ];
      state.vpn_gateways.save(
        {
          name: "todd",
          vpc: "workload",
          subnet: "vpe-zone-1",
        },
        {
          data: {
            name: "management-gateway",
          },
        }
      );
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should change the gw"
      );
    });
    it("should update a vpn gateway with same name different everything else", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "workload-rg",
          subnet: "vpe-zone-1",
          vpc: "workload",
          connections: [],
        },
      ];
      state.vpn_gateways.save(
        {
          name: "management-gateway",
          vpc: "workload",
          subnet: "vpe-zone-1",
          resource_group: "workload-rg",
        },
        {
          data: {
            name: "management-gateway",
          },
        }
      );
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should change the gw"
      );
    });
  });
  describe("vpn_gateways.create", () => {
    it("should add a new vpn gateway", () => {
      let expectedData = [
        {
          name: "management-gateway",
          resource_group: "management-rg",
          subnet: "vpn-zone-1",
          vpc: "management",
          connections: [],
        },
        {
          name: "todd",
          resource_group: null,
          subnet: "vpn-zone-1",
          vpc: "management",
          connections: [],
        },
      ];
      let state = new newState();
      state.vpn_gateways.create({
        name: "todd",
        subnet: "vpn-zone-1",
        vpc: "management",
      });
      assert.deepEqual(
        state.store.json.vpn_gateways,
        expectedData,
        "it should add the gw"
      );
    });
  });
  describe("schema", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    it("should reset subnet on state change", () => {
      let expectedData = {
        subnet: "",
      };
      let actualData = {};
      craig.vpn_gateways.vpc.onStateChange(actualData);
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return the correct data"
      );
    });
    describe("additional_prefixes", () => {
      it("should be valid when is undefined or empty string", () => {
        assert.isFalse(
          craig.vpn_gateways.additional_prefixes.invalid({}),
          "it should be valid"
        );
        assert.isFalse(
          craig.vpn_gateways.additional_prefixes.invalid({
            additional_prefixes: "",
          }),
          "it should be valid"
        );
      });
      it("should be invalid when not a list of CIDR blocks", () => {
        assert.isTrue(
          craig.vpn_gateways.additional_prefixes.invalid({
            additional_prefixes: "aaa",
          }),
          "it should not be valid"
        );
      });
      it("should be invalid when not a list of CIDR blocks", () => {
        assert.isTrue(
          craig.vpn_gateways.additional_prefixes.invalid({
            additional_prefixes: ["aaa"],
          }),
          "it should not be valid"
        );
      });
      it("should return empty string on render if is undefined or empty string", () => {
        assert.deepEqual(
          craig.vpn_gateways.additional_prefixes.onRender({}),
          "",
          "it should be valid"
        );
        assert.deepEqual(
          craig.vpn_gateways.additional_prefixes.onRender({
            additional_prefixes: "",
          }),
          "",
          "it should be valid"
        );
      });
      it("should render as string when array", () => {
        assert.deepEqual(
          craig.vpn_gateways.additional_prefixes.onRender({
            additional_prefixes: ["1.2.3.4/5", "2.3.4.5/6"],
          }),
          "1.2.3.4/5,2.3.4.5/6",
          "it should return string"
        );
      });
      it("should return empty array on input change if is undefined or empty string", () => {
        assert.deepEqual(
          craig.vpn_gateways.additional_prefixes.onInputChange({}),
          [],
          "it should be valid"
        );
        assert.deepEqual(
          craig.vpn_gateways.additional_prefixes.onInputChange({
            additional_prefixes: "",
          }),
          [],
          "it should be valid"
        );
      });
      it("should return array on input change when string when array", () => {
        assert.deepEqual(
          craig.vpn_gateways.additional_prefixes.onInputChange({
            additional_prefixes: "1.2.3.4/5,2.3.4.5/6",
          }),
          ["1.2.3.4/5", "2.3.4.5/6"],
          "it should return string"
        );
      });
    });
    describe("subnets", () => {
      it("should return correct groups when none vpc", () => {
        assert.deepEqual(
          craig.vpn_gateways.subnet.groups({}),
          [],
          "it should return empty array"
        );
      });
      it("should return correct groups when vpc", () => {
        assert.deepEqual(
          craig.vpn_gateways.subnet.groups(
            { vpc: "management" },
            { craig: craig }
          ),
          [
            "vsi-zone-1",
            "vpn-zone-1",
            "vsi-zone-2",
            "vsi-zone-3",
            "vpe-zone-1",
            "vpe-zone-2",
            "vpe-zone-3",
          ],
          "it should return empty array"
        );
      });
    });
  });
  describe("connections", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
      craig.update();
    });
    it("should create a connection", () => {
      craig.vpn_gateways.connections.create(
        {
          name: "connection-1",
          local_cidrs: ["10.10.10.10/24"],
          peer_cidrs: ["10.10.20.10/24"],
        },
        {
          innerFormProps: {
            arrayParentName: "management-gateway",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.vpn_gateways[0].connections,
        [
          {
            vpn: "management-gateway",
            name: "connection-1",
            local_cidrs: ["10.10.10.10/24"],
            peer_cidrs: ["10.10.20.10/24"],
          },
        ],
        "it should create connection"
      );
    });
    it("should update a connection", () => {
      craig.vpn_gateways.connections.create(
        {
          name: "connection-1",
          local_cidrs: ["10.10.10.10/24"],
          peer_cidrs: ["10.10.20.10/24"],
        },
        {
          innerFormProps: {
            arrayParentName: "management-gateway",
          },
        }
      );
      craig.vpn_gateways.connections.save(
        {
          name: "connection-2",
          local_cidrs: ["10.10.10.10/24"],
          peer_cidrs: ["10.10.20.10/24"],
        },
        {
          arrayParentName: "management-gateway",
          data: {
            name: "connection-1",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.vpn_gateways[0].connections,
        [
          {
            vpn: "management-gateway",
            name: "connection-2",
            local_cidrs: ["10.10.10.10/24"],
            peer_cidrs: ["10.10.20.10/24"],
          },
        ],
        "it should create connection"
      );
    });
    it("should delete a connection", () => {
      craig.vpn_gateways.connections.create(
        {
          name: "connection-1",
          local_cidrs: ["10.10.10.10/24"],
          peer_cidrs: ["10.10.20.10/24"],
        },
        {
          innerFormProps: {
            arrayParentName: "management-gateway",
          },
        }
      );
      craig.vpn_gateways.connections.delete(
        {
          name: "connection-2",
          local_cidrs: ["10.10.10.10/24"],
          peer_cidrs: ["10.10.20.10/24"],
        },
        {
          arrayParentName: "management-gateway",
          data: {
            name: "connection-1",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.vpn_gateways[0].connections,
        [],
        "it should create connection"
      );
    });
    describe("schema", () => {
      it("should be disabled when invalid name", () => {
        assert.isTrue(
          disableSave("connections", { name: "@@" }, { craig: craig }),
          "it should be disabled"
        );
      });
      it("should be invalid when peer address not on object", () => {
        assert.isTrue(
          craig.vpn_gateways.connections.peer_address.invalid({}),
          "it should be invalid"
        );
      });
      it("should be valid when peer address is cidr", () => {
        assert.isFalse(
          craig.vpn_gateways.connections.peer_address.invalid({
            peer_address: "131.239.211.196",
          }),
          "it should be valid"
        );
      });
      it("should be valid when peer address is valid ip", () => {
        assert.isTrue(
          craig.vpn_gateways.connections.peer_address.invalid({
            peer_address: "1.2.3.4/5",
          }),
          "it should be invalid"
        );
      });
      it("should be disabled when peer cidrs is empty", () => {
        assert.isTrue(
          craig.vpn_gateways.connections.peer_cidrs.invalid(
            { peer_cidrs: [] },
            { craig: craig }
          ),
          "it should be disabled"
        );
      });
    });
  });
});
