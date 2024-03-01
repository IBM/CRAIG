const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { contains } = require("lazy-z");

/**
 * initialize store
 * @param {boolean=} legacy
 * @returns {lazyZState} state store
 */
function newState(legacy) {
  let store = new state(legacy);
  store.setUpdateCallback(() => {});
  return store;
}

describe("vpcs", () => {
  describe("vpcs.save", () => {
    it("should rename a vpc", () => {
      let state = new newState();
      state.store.json.dns = [
        {
          name: "frog",
          resource_group: "frog",
          custom_resolvers: [
            {
              vpc: "management",
              subnets: [],
            },
          ],
          zones: [],
        },
      ];
      state.vpcs.save(
        { name: "todd", default_network_acl_name: "" },
        { data: { name: "management" } }
      );
      assert.isTrue(
        contains(state.store.vpcList, "todd"),
        "todd should be there"
      );
      assert.isNull(
        state.store.json.vpcs[0].default_network_acl_name,
        "it should be null"
      );
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers[0].vpc,
        "todd",
        "it should update custom resolvers"
      );
      assert.deepEqual(
        state.store.subnetTiers,
        {
          todd: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should update subnet tiers"
      );
    });
    it("should rename a vpc", () => {
      let state = new newState();
      state.store.json.dns = [
        {
          name: "frog",
          resource_group: "frog",
          custom_resolvers: [
            {
              vpc: "management",
              subnets: [],
            },
          ],
          zones: [],
        },
      ];
      state.vpcs.save(
        { name: "todd", default_network_acl_name: "", use_data: false },
        { data: { name: "management" } }
      );
      assert.isTrue(
        contains(state.store.vpcList, "todd"),
        "todd should be there"
      );
      assert.isNull(
        state.store.json.vpcs[0].default_network_acl_name,
        "it should be null"
      );
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers[0].vpc,
        "todd",
        "it should update custom resolvers"
      );
      assert.deepEqual(
        state.store.subnetTiers,
        {
          todd: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should update subnet tiers"
      );
    });
    it("should add a pgw to a vpc", () => {
      let state = new newState();
      state.vpcs.save(
        { name: "todd", default_network_acl_name: "", publicGateways: [1] },
        { data: { name: "management" } }
      );
      assert.isTrue(
        contains(state.store.vpcList, "todd"),
        "todd should be there"
      );
      assert.isNull(
        state.store.json.vpcs[0].default_network_acl_name,
        "it should be null"
      );
      assert.deepEqual(
        state.store.subnetTiers,
        {
          todd: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should update subnet tiers"
      );
    });
    it("should change edge vpc name when updating edge vpc", () => {
      let state = new newState();
      state.store.edge_vpc_name = "management";
      state.store.json.dns = [
        {
          name: "frog",
          resource_group: "frog",
          custom_resolvers: [
            {
              vpc: "egg",
              subnets: [],
            },
          ],
          zones: [],
        },
      ];
      state.vpcs.save({ name: "todd" }, { data: { name: "management" } });
      assert.isTrue(
        contains(state.store.vpcList, "todd"),
        "todd should be there"
      );
      assert.deepEqual(
        state.store.subnetTiers,
        {
          todd: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should update subnet tiers"
      );
      assert.deepEqual(state.store.edge_vpc_name, "todd", "it should be todd");
    });
    it("should update another field", () => {
      let state = new newState();
      state.vpcs.save(
        {
          name: "management",
          classic_access: true,
        },
        {
          data: {
            name: "management",
          },
        }
      );
      assert.isTrue(
        contains(state.store.vpcList, "management"),
        "todd should be there"
      );
      assert.deepEqual(
        state.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should update subnet tiers"
      );
    });
    it("should correctly save a vpc with no subnet tiers", () => {
      let state = new newState();
      state.vpcs.create({ name: "test" });
      state.vpcs.save(
        { default_network_acl_name: "todd" },
        { data: { name: "test" } }
      );
      assert.deepEqual(
        state.store.json.vpcs[2].default_network_acl_name,
        "todd",
        "todd should be there"
      );
    });
    it("should update pgw vpc on store update", () => {
      let craig = newState();
      craig.store.json.vpcs[0].use_data = false;
      craig.store.json.vpcs[0].acls[0].use_data = true;
      craig.vpcs.save(
        { publicGateways: [1, 2, 3], use_data: false },
        {
          data: {
            name: "management",
          },
          craig: craig,
        }
      );
      let expectedData = {
        cos: "cos",
        bucket: "management-bucket",
        name: "management",
        resource_group: "management-rg",
        classic_access: false,
        manual_address_prefix_management: true,
        default_network_acl_name: null,
        default_security_group_name: null,
        default_routing_table_name: null,
        use_data: false,
        publicGateways: [1, 2, 3],
        address_prefixes: [
          {
            vpc: "management",
            zone: 1,
            name: "management-zone-1",
            cidr: "10.10.0.0/22",
          },
          {
            vpc: "management",
            zone: 2,
            name: "management-zone-2",
            cidr: "10.20.0.0/22",
          },
          {
            vpc: "management",
            zone: 3,
            name: "management-zone-3",
            cidr: "10.30.0.0/22",
          },
        ],
        subnets: [
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
            zone: 1,
            cidr: "10.10.0.16/29",
            name: "vpn-zone-1",
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
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.32/29",
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
        ],
        public_gateways: [
          {
            zone: 1,
            vpc: "management",
            resource_group: "management-rg",
          },
          {
            zone: 2,
            vpc: "management",
            resource_group: "management-rg",
          },
          {
            zone: 3,
            vpc: "management",
            resource_group: "management-rg",
          },
        ],
        acls: [
          {
            resource_group: "management-rg",
            name: "management",
            vpc: "management",
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
              {
                action: "allow",
                source: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-ibm-outbound",
                destination: "161.26.0.0/16",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-all-network-outbound",
                source: "10.0.0.0/8",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
            ],
            use_data: true,
          },
        ],
      };
      assert.deepEqual(
        craig.store.json.vpcs[0],
        expectedData,
        "it should return correct data"
      );
    });
    it("should update pgw and subnet rg on rg name change", () => {
      let craig = newState();
      craig.resource_groups.save(
        { name: "frog" },
        { data: { name: "management-rg" }, craig: craig }
      );
      craig.vpcs.save(
        { publicGateways: [1, 2, 3] },
        {
          data: {
            name: "management",
          },
          craig: craig,
        }
      );
      let expectedData = {
        cos: "cos",
        bucket: "management-bucket",
        name: "management",
        resource_group: "frog",
        use_data: false,
        classic_access: false,
        manual_address_prefix_management: true,
        default_network_acl_name: null,
        default_security_group_name: null,
        default_routing_table_name: null,
        publicGateways: [1, 2, 3],
        address_prefixes: [
          {
            vpc: "management",
            zone: 1,
            name: "management-zone-1",
            cidr: "10.10.0.0/22",
          },
          {
            vpc: "management",
            zone: 2,
            name: "management-zone-2",
            cidr: "10.20.0.0/22",
          },
          {
            vpc: "management",
            zone: 3,
            name: "management-zone-3",
            cidr: "10.30.0.0/22",
          },
        ],
        subnets: [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.0/29",
            name: "vsi-zone-1",
            network_acl: "management",
            resource_group: "frog",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.16/29",
            name: "vpn-zone-1",
            network_acl: "management",
            resource_group: "frog",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.0.0/29",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "frog",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.0.0/29",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "frog",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.32/29",
            name: "vpe-zone-1",
            resource_group: "frog",
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
            resource_group: "frog",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.0.16/29",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "frog",
            public_gateway: false,
            has_prefix: false,
          },
        ],
        public_gateways: [
          {
            zone: 1,
            vpc: "management",
            resource_group: "frog",
          },
          {
            zone: 2,
            vpc: "management",
            resource_group: "frog",
          },
          {
            zone: 3,
            vpc: "management",
            resource_group: "frog",
          },
        ],
        acls: [
          {
            resource_group: "frog",
            name: "management",
            vpc: "management",
            use_data: false,
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
              {
                action: "allow",
                source: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-ibm-outbound",
                destination: "161.26.0.0/16",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-all-network-outbound",
                source: "10.0.0.0/8",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
                type: null,
                code: null,
                ruleProtocol: "all",
              },
            ],
          },
        ],
      };
      assert.deepEqual(
        craig.store.json.vpcs[0],
        expectedData,
        "it should return correct data"
      );
    });
    it("should disable bucket when use data", () => {
      let state = newState();
      state.vpcs.save(
        { use_data: true },
        {
          data: state.store.json.vpcs[0],
          craig: state,
        }
      );
      assert.deepEqual(
        state.store.json.vpcs[0].bucket,
        "$disabled",
        "it should be disabled"
      );
    });
  });
  describe("vpcs.create", () => {
    it("should create a new vpc with a name and resource group", () => {
      let state = new newState();
      state.store.json._options.dynamic_subnets = false;
      state.vpcs.create({ name: "test" });
      let expectedData = {
        cos: null,
        bucket: null,
        name: "test",
        resource_group: null,
        classic_access: false,
        manual_address_prefix_management: false,
        default_network_acl_name: null,
        default_security_group_name: null,
        default_routing_table_name: null,
        address_prefixes: [],
        subnets: [],
        public_gateways: [],
        publicGateways: [],
        acls: [],
        subnetTiers: [],
        use_data: false,
      };
      let actualData = state.store.json.vpcs[2];
      assert.deepEqual(actualData, expectedData, "it should create new vpc");
    });
  });
  describe("vpcs.delete", () => {
    it("should delete a vpc from config", () => {
      let state = new newState(true);
      state.store.json._options.dynamic_subnets = false;
      state.vpcs.delete({}, { data: { name: "management" } });
      let expectedData = [
        {
          cos: "cos",
          bucket: "workload-bucket",
          name: "workload",
          resource_group: "workload-rg",
          classic_access: false,
          manual_address_prefix_management: true,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
          use_data: false,
          address_prefixes: [
            {
              vpc: "workload",
              zone: 1,
              cidr: "10.40.10.0/24",
              name: "vsi-zone-1",
            },
            {
              vpc: "workload",
              zone: 2,
              cidr: "10.50.10.0/24",
              name: "vsi-zone-2",
            },
            {
              vpc: "workload",
              zone: 3,
              cidr: "10.60.10.0/24",
              name: "vsi-zone-3",
            },
            {
              vpc: "workload",
              zone: 1,
              cidr: "10.40.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "workload",
              zone: 2,
              cidr: "10.50.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "workload",
              zone: 3,
              cidr: "10.60.20.0/24",
              name: "vpe-zone-3",
            },
          ],
          subnets: [
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
          public_gateways: [],
          publicGateways: [],
          acls: [
            {
              use_data: false,
              resource_group: "workload-rg",
              name: "workload",
              vpc: "workload",
              rules: [
                {
                  action: "allow",
                  destination: "10.0.0.0/8",
                  direction: "inbound",
                  name: "allow-ibm-inbound",
                  source: "161.26.0.0/16",
                  acl: "workload",
                  vpc: "workload",
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                  type: null,
                  code: null,
                  ruleProtocol: "all",
                },
                {
                  action: "allow",
                  source: "10.0.0.0/8",
                  direction: "outbound",
                  name: "allow-ibm-outbound",
                  destination: "161.26.0.0/16",
                  acl: "workload",
                  vpc: "workload",
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                  type: null,
                  code: null,
                  ruleProtocol: "all",
                },
                {
                  action: "allow",
                  destination: "10.0.0.0/8",
                  direction: "inbound",
                  name: "allow-all-network-inbound",
                  source: "10.0.0.0/8",
                  acl: "workload",
                  vpc: "workload",
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                  type: null,
                  code: null,
                  ruleProtocol: "all",
                },
                {
                  action: "allow",
                  destination: "10.0.0.0/8",
                  direction: "outbound",
                  name: "allow-all-network-outbound",
                  source: "10.0.0.0/8",
                  acl: "workload",
                  vpc: "workload",
                  icmp: {
                    type: null,
                    code: null,
                  },
                  tcp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  udp: {
                    port_min: null,
                    port_max: null,
                    source_port_min: null,
                    source_port_max: null,
                  },
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                  type: null,
                  code: null,
                  ruleProtocol: "all",
                },
              ],
            },
          ],
        },
      ];
      assert.deepEqual(
        state.store.json.vpcs,
        expectedData,
        "it should have only one vpcs"
      );
    });
  });
  describe("vpcs.schema", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    it("should return true if vpc has a duplicate name", () => {
      let actualData = craig.vpcs.name.invalid(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc acl has a duplicate name", () => {
      let actualData = craig.vpcs.default_network_acl_name.invalid(
        {
          name: "test2",
          default_network_acl_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                  },
                  {
                    name: "frog",
                    default_network_acl_name: "frog",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc acl has a duplicate name with existing acl", () => {
      let actualData = craig.vpcs.default_network_acl_name.invalid(
        {
          name: "test2",
          default_network_acl_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    default_network_acl_name: "egg",
                    acls: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                  {
                    name: "frog",
                    default_network_acl_name: null,
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return false if vpc routing table name is empty string", () => {
      let actualData = craig.vpcs.default_routing_table_name.invalid({
        default_routing_table_name: "",
      });
      assert.isFalse(actualData, "it should be false");
    });
    it("should return true if vpc routing table has a duplicate name", () => {
      let actualData = craig.vpcs.default_routing_table_name.invalid(
        {
          name: "test2",
          default_routing_table_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                    default_routing_table_name: null,
                  },
                  {
                    name: "frog",
                    default_routing_table_name: "frog",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc security group has a duplicate name", () => {
      let actualData = craig.vpcs.default_security_group_name.invalid(
        {
          name: "test2",
          default_security_group_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                  },
                  {
                    name: "frog",
                    default_security_group_name: "frog",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc acl has a duplicate name with existing sg", () => {
      let actualData = craig.vpcs.default_security_group_name.invalid(
        {
          name: "test2",
          default_security_group_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    default_security_group_name: "egg",
                    acls: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                  {
                    name: "frog",
                    default_security_group_name: null,
                    acls: [],
                  },
                ],
                security_groups: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.isTrue(actualData, "it should be true");
    });
    it("should return true if vpc has a duplicate name", () => {
      let actualData = craig.vpcs.name.invalidText(
        {
          name: "test",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                  },
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        actualData,
        'Name "test" already in use',
        "it should be true"
      );
    });
    it("should return true if vpc acl has a duplicate name", () => {
      let actualData = craig.vpcs.default_network_acl_name.invalidText(
        {
          name: "test2",
          default_network_acl_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                  },
                  {
                    name: "frog",
                    default_network_acl_name: "frog",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should return false if vpc routing table name is empty string", () => {
      let actualData = craig.vpcs.default_network_acl_name.invalidText(
        {
          default_routing_table_name: "",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [],
              },
            },
          },
        }
      );
      assert.deepEqual(
        actualData,
        "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        "it should be false"
      );
    });
    it("should return true if vpc acl has a duplicate name with existing acl", () => {
      let actualData = craig.vpcs.default_network_acl_name.invalidText(
        {
          name: "test2",
          default_network_acl_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    default_network_acl_name: "egg",
                    acls: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                  {
                    name: "frog",
                    default_network_acl_name: null,
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should return true if vpc routing table has a duplicate name", () => {
      let actualData = craig.vpcs.default_routing_table_name.invalidText(
        {
          name: "test2",
          default_routing_table_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    acls: [],
                    default_routing_table_name: null,
                  },
                  {
                    name: "frog",
                    default_routing_table_name: "frog",
                    acls: [],
                  },
                ],
                security_groups: [],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should return true if vpc sg has a duplicate name with existing sg", () => {
      let actualData = craig.vpcs.default_security_group_name.invalidText(
        {
          name: "test2",
          default_security_group_name: "frog",
        },
        {
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "test",
                    default_security_group_name: "egg",
                    acls: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                  {
                    name: "frog",
                    default_security_group_name: null,
                    acls: [],
                  },
                ],
                security_groups: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        actualData,
        'Name "frog" already in use',
        "it should be true"
      );
    });
    it("should disable use data when use data is true", () => {
      let craig = newState();
      assert.isTrue(
        craig.vpcs.use_data.disabled(
          {},
          {
            data: {
              use_data: true,
            },
          }
        ),
        "it should be disabled"
      );
    });
    describe("vpcs.schema.name", () => {
      describe("vpcs.schema.name.invalidText", () => {
        it("should return vpc invalid name text", () => {
          let craig = newState();
          assert.deepEqual(
            craig.vpcs.name.invalidText({ name: "" }, { craig: craig }),
            "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
            "it should return invalid text"
          );
        });
      });
    });
    describe("vpcs.schema public gateway toggles", () => {
      it("should add a zone number to publicGateways if it is not present", () => {
        let craig = newState();
        let stateData = {
          publicGateways: [2, 3],
        };
        let expectedData = {
          publicGateways: [2, 3, 1],
        };
        craig.vpcs.pgw_zone_1.onStateChange(stateData);
        assert.deepEqual(
          stateData,
          expectedData,
          "it should return correct data"
        );
      });
      it("should remove a zone number from publicGateways if it is already present", () => {
        let craig = newState();
        let stateData = {
          publicGateways: [2, 3, 1],
        };
        let expectedData = {
          publicGateways: [2, 3],
        };
        craig.vpcs.pgw_zone_1.onStateChange(stateData);
        assert.deepEqual(
          stateData,
          expectedData,
          "it should return correct data"
        );
      });
      it("should render an unfound public gateway as false", () => {
        let craig = newState();
        let stateData = {
          publicGateways: [2, 3],
        };
        assert.isFalse(
          craig.vpcs.pgw_zone_1.onRender(stateData),
          "it should return false"
        );
      });
      it("should render a found public gateway as true", () => {
        let craig = newState();
        let stateData = {
          publicGateways: [1, 2, 3],
        };
        assert.isTrue(
          craig.vpcs.pgw_zone_1.onRender(stateData),
          "it should return false"
        );
      });
    });
    describe("vpcs.schema.buckets", () => {
      describe("vpcs.schema.buckets.groups", () => {
        it("should return groups for vpc", () => {
          let craig = newState();
          assert.deepEqual(
            craig.vpcs.bucket.groups({}, { craig: craig }),
            [
              "atracker-bucket",
              "management-bucket",
              "workload-bucket",
              "Disabled",
            ],
            "it should return buckets"
          );
        });
      });
      describe("vpcs.schema.buckets.onRender", () => {
        it("should render the correct bucket when disabled", () => {
          let craig = newState();
          assert.deepEqual(
            craig.vpcs.bucket.onRender({ bucket: "$disabled" }),
            "Disabled",
            "it should return correct name"
          );
        });
        it("should render the correct bucket when not disabled", () => {
          let craig = newState();
          assert.deepEqual(
            craig.vpcs.bucket.onRender({ bucket: "management-bucket" }),
            "management-bucket",
            "it should return correct name"
          );
        });
      });
      describe("vpcs.schema.buckets.onInputChange", () => {
        it("should send the correct bucket when disabled", () => {
          let craig = newState();
          assert.deepEqual(
            craig.vpcs.bucket.onInputChange({ bucket: "Disabled" }),
            "$disabled",
            "it should return correct name"
          );
        });
        it("should render the correct bucket when not disabled", () => {
          let craig = newState();
          assert.deepEqual(
            craig.vpcs.bucket.onInputChange({ bucket: "management-bucket" }),
            "management-bucket",
            "it should return correct name"
          );
        });
      });
    });
  });
  describe("vpcs.subnets", () => {
    describe("vpcs.subnets.save", () => {
      it("should update a subnet in place", () => {
        let state = new newState();
        state.vpcs.subnets.save(
          {
            name: "frog",
          },
          {
            vpc_name: "management",
            data: { name: "vpn-zone-1" },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].name,
          "frog",
          "it should be frog"
        );
      });
      it("should update a subnet in place", () => {
        let state = new newState(true);
        state.store.json._options.dynamic_subnets = false;
        state.vpcs.subnets.save(
          {
            name: "frog",
            acl_name: "",
          },
          {
            vpc_name: "management",
            data: { name: "vpn-zone-1" },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].acl_name,
          null,
          "it should be null"
        );
      });
      it("should update a subnet in place", () => {
        let state = new newState(true);
        state.store.json._options.dynamic_subnets = false;
        state.vpcs.subnets.save(
          {
            name: "frog",
            acl_name: "",
          },
          {
            vpc_name: "workload",
            data: { name: "vsi-zone-1" },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[1].subnets[0].acl_name,
          null,
          "it should be null"
        );
      });
      it("should update an advanced subnet in place", () => {
        let state = new newState(true);
        state.store.json._options.dynamic_subnets = false;
        let expectedPrefixes = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vsi-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "vsi-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.10.0/24",
            name: "vsi-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.20.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "1.2.3.4/5",
            name: "frog",
          },
        ];
        state.vpcs.subnetTiers.save(
          {
            advanced: true,
            select_zones: [1],
            name: "vpn",
          },
          {
            vpc_name: "management",
            data: {
              name: "vpn",
              craig: {
                store: state.store.json.vpcs[0],
              },
            },
          }
        );
        state.store.subnetTiers.management[2].subnets.push("lol");
        state.store.json.dns.push({
          name: "dns",
          zones: [],
          custom_resolvers: [
            {
              vpc: "management",
              subnets: ["vpn-zone-1", "vpe-zone-1"],
            },
          ],
        });
        state.store.json.dns.push({
          name: "dns2",
          zones: [],
          custom_resolvers: [
            {
              vpc: "management",
              subnets: [],
            },
          ],
        });
        state.vpcs.subnets.save(
          {
            name: "frog",
            acl_name: "",
            tier: "vpn",
            cidr: "1.2.3.4/5",
          },
          {
            vpc_name: "management",
            data: { name: "vpn-zone-1" },
          }
        );

        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].name,
          "frog",
          "it should be null"
        );
        assert.deepEqual(
          state.store.subnetTiers.management[2].subnets,
          ["frog", "lol"],
          "it should update subnets"
        );
        assert.deepEqual(
          state.store.json.dns[0].custom_resolvers[0].subnets,
          ["frog", "vpe-zone-1"],
          "it should update subnets"
        );
        assert.deepEqual(
          state.store.json.vpcs[0].address_prefixes,
          expectedPrefixes,
          "it should add address prefix"
        );
      });
      it("should update an advanced subnet in place when no matching prefix", () => {
        let state = new newState(true);
        state.store.json._options.dynamic_subnets = false;
        let expectedPrefixes = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vsi-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "vsi-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.10.0/24",
            name: "vsi-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.20.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "1.2.3.4/5",
            name: "frog",
          },
        ];
        state.vpcs.subnetTiers.save(
          {
            advanced: true,
            select_zones: [1],
            name: "vpn",
          },
          {
            vpc_name: "management",
            data: {
              name: "vpn",
              craig: {
                store: state.store.json.vpcs[0],
              },
            },
          }
        );
        state.store.subnetTiers.management[2].subnets.push("lol");
        state.store.json.dns.push({
          name: "dns",
          zones: [],
          custom_resolvers: [
            {
              vpc: "management",
              subnets: ["vpn-zone-1", "vpe-zone-1"],
            },
          ],
        });
        state.store.json.dns.push({
          name: "dns2",
          zones: [],
          custom_resolvers: [
            {
              vpc: "management",
              subnets: [],
            },
          ],
        });
        state.store.json.vpcs[0].address_prefixes = [];
        state.vpcs.subnets.save(
          {
            name: "frog",
            acl_name: "",
            tier: "vpn",
            cidr: "1.2.3.4/5",
          },
          {
            vpc_name: "management",
            data: { name: "vpn-zone-1" },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].name,
          "frog",
          "it should be null"
        );
        assert.deepEqual(
          state.store.subnetTiers.management[2].subnets,
          ["frog", "lol"],
          "it should update subnets"
        );
        assert.deepEqual(
          state.store.json.dns[0].custom_resolvers[0].subnets,
          ["frog", "vpe-zone-1"],
          "it should update subnets"
        );
      });
      it("should update a subnet in place using field other than name", () => {
        let state = new newState();
        state.setUpdateCallback(() => {});
        state.vpcs.subnets.save(
          {
            cidr: "1.2.3.4/32",
          },
          {
            vpc_name: "management",
            data: {
              name: "vpn-zone-1",
            },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].cidr,
          "10.10.0.16/28",
          "it should be frog"
        );
      });
      describe("vpcs.subnets.save (from tier JSON)", () => {
        let craig;
        beforeEach(() => {
          craig = new newState(true);
          craig.store.json._options.dynamic_subnets = false;
          craig.hardSetJson(craig.store.json, true);
        });
        it("should update an advanced subnet in place", () => {
          let expectedPrefixes = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.10.0/24",
              name: "vsi-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.10.0/24",
              name: "vsi-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "1.2.3.4/5",
              name: "frog",
            },
          ];
          craig.vpcs.subnetTiers.save(
            {
              advanced: true,
              select_zones: [1],
              name: "vpn",
            },
            {
              vpc_name: "management",
              data: {
                name: "vpn",
                craig: {
                  store: craig.store.json.vpcs[0],
                },
              },
            }
          );
          craig.store.json.vpcs[0].subnetTiers[1].subnets.push("lol");
          craig.store.json.dns.push({
            name: "dns",
            zones: [],
            custom_resolvers: [
              {
                vpc: "management",
                subnets: ["vpn-zone-1", "vpe-zone-1"],
              },
            ],
          });
          craig.store.json.dns.push({
            name: "dns2",
            zones: [],
            custom_resolvers: [
              {
                vpc: "management",
                subnets: [],
              },
            ],
          });
          craig.vpcs.subnets.save(
            {
              name: "frog",
              acl_name: "",
              tier: "vpn",
              cidr: "1.2.3.4/5",
            },
            {
              vpc_name: "management",
              data: { name: "vpn-zone-1" },
            }
          );

          assert.deepEqual(
            craig.store.json.vpcs[0].subnets[1].name,
            "frog",
            "it should be null"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[1].subnets,
            ["frog", "lol"],
            "it should update subnets"
          );
          assert.deepEqual(
            craig.store.json.dns[0].custom_resolvers[0].subnets,
            ["frog", "vpe-zone-1"],
            "it should update subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].address_prefixes,
            expectedPrefixes,
            "it should add address prefix"
          );
        });
        it("should update an advanced subnet in place when no matching prefix", () => {
          craig.vpcs.subnetTiers.save(
            {
              advanced: true,
              select_zones: [1],
              name: "vpn",
            },
            {
              vpc_name: "management",
              data: {
                name: "vpn",
                craig: {
                  store: craig.store.json.vpcs[0],
                },
              },
            }
          );
          craig.store.json.vpcs[0].subnetTiers[1].subnets.push("lol");
          craig.store.json.dns.push({
            name: "dns",
            zones: [],
            custom_resolvers: [
              {
                vpc: "management",
                subnets: ["vpn-zone-1", "vpe-zone-1"],
              },
            ],
          });
          craig.store.json.dns.push({
            name: "dns2",
            zones: [],
            custom_resolvers: [
              {
                vpc: "management",
                subnets: [],
              },
            ],
          });
          craig.store.json.vpcs[0].address_prefixes = [];
          craig.vpcs.subnets.save(
            {
              name: "frog",
              acl_name: "",
              tier: "vpn",
              cidr: "1.2.3.4/5",
            },
            {
              vpc_name: "management",
              data: { name: "vpn-zone-1" },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets[1].name,
            "frog",
            "it should be null"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[1].subnets,
            ["frog", "lol"],
            "it should update subnets"
          );
          assert.deepEqual(
            craig.store.json.dns[0].custom_resolvers[0].subnets,
            ["frog", "vpe-zone-1"],
            "it should update subnets"
          );
        });
      });
    });
    describe("vpcs.subnets.delete", () => {
      it("should delete a subnet from a vpc", () => {
        let state = new newState(true);
        state.store.json._options.dynamic_subnets = false;
        state.setUpdateCallback(() => {});
        state.vpcs.subnets.delete(
          {},
          {
            name: "management",
            data: {
              name: "vpn-zone-1",
            },
          }
        );
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
        ];
        assert.deepEqual(
          state.store.json.vpcs[0].subnets,
          expectedData,
          "vpn-zone-1 should be deleted"
        );
      });
    });
    describe("vpcs.subnets.create", () => {
      it("should create a subnet in a zone", () => {
        let state = new newState();
        let index = state.store.json.vpcs[0].subnets.length; // new vpc should be stored here
        state.setUpdateCallback(() => {});
        state.store.json._options.dynamic_subnets = false;
        let testData = {
          name: "frog-zone-1",
          cidr: "10.2.3.4/32",
          network_acl: "management-acl",
          public_gateway: true,
        };
        state.vpcs.subnets.create(testData, { name: "management" });
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[index],
          testData,
          "it should be frog"
        );
      });
    });
    describe("vpcs.subnets.schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
      });
      it("should return correct helper text for subnet", () => {
        assert.deepEqual(
          craig.vpcs.subnets.name.helperText(
            { name: "iac-subnet" },
            { craig: craig }
          ),
          "iac-iac-subnet",
          "it should return correct helper text"
        );
      });
      it("should return correct helper text if subnet is imported", () => {
        assert.deepEqual(
          craig.vpcs.subnets.name.helperText({ use_data: true }),
          "",
          "it should return correct helper text"
        );
      });
      it("should return false if subnet and no vpc_name (unloaded modals)", () => {
        let actualData = craig.vpcs.subnets.name.invalid(
          {},
          {
            craig: {
              store: {
                json: {
                  vpcs: [],
                },
              },
            },
          }
        );
        assert.isFalse(actualData, "it should be false");
      });
      it("should return true if subnet has a duplicate name", () => {
        let actualData = craig.vpcs.subnets.name.invalidText(
          { tier: "frog", cidr: "1.2.3.4/15", name: "@@@@" },
          {
            data: {
              name: "",
            },
            vpc_name: "test",
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "test",
                      subnets: [
                        {
                          name: "egg",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          actualData,
          "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
          "it should be true"
        );
      });
      it("should hide name when not advanced tier", () => {
        assert.isTrue(
          craig.vpcs.subnets.name.hideWhen({ advanced: false }),
          "it should be hidden"
        );
      });
      it("should not show network acl as invalid when in modal", () => {
        assert.isFalse(
          craig.vpcs.subnets.network_acl.invalid({}, { isModal: "true" })
        ),
          "it should be valid";
      });
      it("should disable public gateway toggle when subnet zone unfound in publicGateways array of parent vpc", () => {
        assert.isTrue(
          craig.vpcs.subnets.public_gateway.disabled(
            {
              name: "vsi-zone-1",
            },
            {
              vpc_name: "management",
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          )
        );
      });
    });
  });
  describe("vpcs.subnetTiers", () => {
    describe("vpcs.subnetTiers.save", () => {
      it("should update a subnet tier in place", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
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
            name: "frog-zone-2",
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
        ];
        vpcState.store.json.dns.push({
          name: "dns",
          zones: [],
          custom_resolvers: [
            {
              vpc: "management",
              subnets: ["vsi-zone-1"],
            },
          ],
        });
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            zones: 2,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.dns[0].custom_resolvers[0].subnets,
          ["frog-zone-1"],
          "it should replace subnet name"
        );
      });
      it("should update a subnet tier in place and update address prefixes", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "frog-zone-2",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.20.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.30.0/24",
            name: "vpn-zone-1",
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            zones: 2,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );

        assert.deepEqual(
          vpcState.store.json.vpcs[0].address_prefixes,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier in place with nacl and gateway", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        vpcState.vpcs.acls.create({ name: "todd" }, { vpc_name: "management" });
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
            network_acl: "todd",
            resource_group: "management-rg",
            public_gateway: true,
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
            name: "frog-zone-2",
            network_acl: "todd",
            resource_group: "management-rg",
            public_gateway: true,
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
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            zones: 2,
            networkAcl: "todd",
            addPublicGateway: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [1, 2],
                      public_gateways: [
                        {
                          vpc: "management",
                          zone: 1,
                        },
                        {
                          vpc: "management",
                          zone: 2,
                        },
                        {
                          vpc: "management",
                          zone: 3,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier in place with nacl and gateway when only one gateway is enabled", () => {
        let vpcState = newState();
        vpcState.vpcs.acls.create({ name: "todd" }, { vpc_name: "management" });
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.0/29",
            name: "frog-zone-1",
            network_acl: "todd",
            resource_group: "management-rg",
            public_gateway: true,
            has_prefix: false,
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
            zone: 2,
            cidr: "10.20.0.0/29",
            name: "frog-zone-2",
            network_acl: "todd",
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
            cidr: "10.30.0.0/29",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            zones: 2,
            networkAcl: "todd",
            addPublicGateway: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [1],
                      public_gateways: [
                        {
                          vpc: "management",
                          zone: 1,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier in place with additional zones and with no acl", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
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
            network_acl: null,
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
            vpc: "management",
            zone: 2,
            cidr: "10.20.30.0/24",
            name: "vpn-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "vpn",
            zones: 2,
            networkAcl: "",
          },
          {
            vpc_name: "management",
            data: { name: "vpn" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier address prefixes in place with additional zones and with no acl", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vsi-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "vsi-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.10.0/24",
            name: "vsi-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.20.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.30.0/24",
            name: "vpn-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.30.0/24",
            name: "vpn-zone-2",
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "vpn",
            zones: 2,
            networkAcl: "",
          },
          {
            vpc_name: "management",
            data: { name: "vpn" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].address_prefixes,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier in place with additional zones and with no acl and 1 zone pgw", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
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
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: true,
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
            vpc: "management",
            zone: 2,
            cidr: "10.20.30.0/24",
            name: "vpn-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "vpn",
            zones: 2,
            networkAcl: "",
            addPublicGateway: true,
          },
          {
            vpc_name: "management",
            data: { name: "vpn" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [1],
                      public_gateways: [
                        {
                          vpc: "management",
                          zone: 1,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier in place with additional zones and with no acl and 2 zone pgw", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
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
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: true,
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
            vpc: "management",
            zone: 2,
            cidr: "10.20.30.0/24",
            name: "vpn-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: true,
            has_prefix: true,
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "vpn",
            zones: 2,
            networkAcl: "",
            addPublicGateway: true,
          },
          {
            vpc_name: "management",
            data: { name: "vpn" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [1, 2],
                      public_gateways: [
                        {
                          vpc: "management",
                          zone: 1,
                        },
                        {
                          vpc: "management",
                          zone: 2,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should expand a reserved edge subnet tier in place with additional zones", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
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
            vpc: "management",
            zone: 1,
            cidr: "10.5.60.0/24",
            name: "f5-bastion-zone-1",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.6.60.0/24",
            name: "f5-bastion-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.7.60.0/24",
            name: "f5-bastion-zone-3",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        vpcState.store.edge_vpc_name = "management";
        vpcState.store.subnetTiers.management.unshift({
          name: "f5-bastion",
          zones: 1,
        });
        vpcState.vpcs.subnetTiers.save(
          {
            name: "f5-bastion",
            zones: 3,
          },
          {
            vpc_name: "management",
            data: { name: "f5-bastion" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [1, 2],
                      public_gateways: [
                        {
                          vpc: "management",
                          zone: 1,
                        },
                        {
                          vpc: "management",
                          zone: 2,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should save advanced subnet tier", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
            name: "frog-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
        ];
        vpcState.store.json.dns.push({
          name: "dns",
          zones: [],
          custom_resolvers: [
            {
              vpc: "management",
              subnets: ["vsi-zone-1"],
            },
          ],
        });
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            select_zones: [1, 2],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        let expectedTier = {
          name: "frog",
          select_zones: [1, 2],
          advanced: true,
          subnets: ["frog-zone-1", "frog-zone-2"],
          zones: undefined,
          networkAcl: "-",
        };
        let expectedPrefixes = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "frog-zone-2",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.20.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.30.0/24",
            name: "vpn-zone-1",
          },
        ];
        assert.deepEqual(
          vpcState.store.json.dns[0].custom_resolvers[0].subnets,
          ["frog-zone-1"],
          "it should update dns subnet name"
        );
        assert.deepEqual(
          vpcState.store.subnetTiers.management[0],
          expectedTier,
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].address_prefixes,
          expectedPrefixes,
          "it should change address prefixes"
        );
        assert.isTrue(
          vpcState.store.json._options.advanced_subnets,
          "it should set advanced subnets"
        );
      });
      it("should save advanced subnet tier", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
            name: "frog-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
        ];
        vpcState.store.json.dns.push({
          name: "dns",
          zones: [],
          custom_resolvers: [
            {
              vpc: "management",
              subnets: ["vsi-zone-1"],
            },
          ],
        });
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            zones: [1, 2],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        let expectedTier = {
          name: "frog",
          select_zones: [1, 2],
          advanced: true,
          subnets: ["frog-zone-1", "frog-zone-2"],
          zones: undefined,
          networkAcl: "-",
        };
        let expectedPrefixes = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "frog-zone-2",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.20.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.30.0/24",
            name: "vpn-zone-1",
          },
        ];
        assert.deepEqual(
          vpcState.store.json.dns[0].custom_resolvers[0].subnets,
          ["frog-zone-1"],
          "it should update dns subnet name"
        );
        assert.deepEqual(
          vpcState.store.subnetTiers.management[0],
          expectedTier,
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].address_prefixes,
          expectedPrefixes,
          "it should change address prefixes"
        );
        assert.isTrue(
          vpcState.store.json._options.advanced_subnets,
          "it should set advanced subnets"
        );
      });
      it("should save advanced subnet tier with an existing advanced tier and both should have correct tier data in store", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
            name: "frog-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "toad-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: true,
            tier: "toad",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "toad-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "toad",
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            select_zones: [1, 2],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.subnetTiers.management,
          [
            {
              name: "frog",
              select_zones: [1, 2],
              advanced: true,
              subnets: ["frog-zone-1", "frog-zone-2"],
              zones: undefined,
              networkAcl: "-",
            },
            {
              name: "vpe",
              zones: 3,
            },
            {
              name: "vpn",
              zones: 1,
            },
          ],
          "it should change subnets"
        );
        vpcState.vpcs.subnetTiers.save(
          {
            name: "toad",
            select_zones: [1, 2],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vpe" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.subnetTiers.management,
          [
            {
              name: "frog",
              zones: undefined,
              advanced: true,
              networkAcl: "-",
              select_zones: [1, 2],
              subnets: ["frog-zone-1", "frog-zone-2"],
            },
            {
              name: "toad",
              zones: undefined,
              advanced: true,
              networkAcl: "-",
              select_zones: [1, 2],
              subnets: ["toad-zone-1", "toad-zone-2"],
            },
            { name: "vpn", zones: 1 },
          ],
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should save advanced subnet tier with an existing advanced tier and both should have correct tier data in store", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
            name: "frog-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "toad-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: true,
            tier: "toad",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "toad-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "toad",
          },
        ];
        vpcState.store.json.f5_vsi = [
          {
            name: "hi",
            vpc: "no",
            template: {},
            ssh_keys: [],
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            select_zones: [1, 2],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.subnetTiers.management,
          [
            {
              name: "frog",
              select_zones: [1, 2],
              advanced: true,
              subnets: ["frog-zone-1", "frog-zone-2"],
              zones: undefined,
              networkAcl: "-",
            },
            {
              name: "vpe",
              zones: 3,
            },
            {
              name: "vpn",
              zones: 1,
            },
          ],
          "it should change subnets"
        );
        vpcState.vpcs.subnetTiers.save(
          {
            name: "toad",
            select_zones: [1, 2],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vpe" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        assert.deepEqual(
          vpcState.store.subnetTiers.management,
          [
            {
              name: "frog",
              zones: undefined,
              advanced: true,
              networkAcl: "-",
              select_zones: [1, 2],
              subnets: ["frog-zone-1", "frog-zone-2"],
            },
            {
              name: "toad",
              zones: undefined,
              advanced: true,
              networkAcl: "-",
              select_zones: [1, 2],
              subnets: ["toad-zone-1", "toad-zone-2"],
            },
            { name: "vpn", zones: 1 },
          ],
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should save advanced subnet tier when expanding zones", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
            vpc: "management",
            zone: 2,
            cidr: "",
            name: "frog-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "",
            name: "frog-zone-3",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            select_zones: [1],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            select_zones: [1, 2, 3],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "frog", advanced: true },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        let expectedTier = {
          name: "frog",
          select_zones: [1, 2, 3],
          advanced: true,
          subnets: ["frog-zone-1", "frog-zone-2", "frog-zone-3"],
          zones: undefined,
          networkAcl: "-",
        };
        assert.deepEqual(
          vpcState.store.subnetTiers.management[0],
          expectedTier,
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should save advanced subnet tier when expanding zones and f5 zones has none subnets", () => {
        let vpcState = newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        vpcState.store.json.f5_vsi = [
          {
            template: {},
            name: "aa",
            ssh_keys: [],
          },
        ];
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "frog-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
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
            vpc: "management",
            zone: 2,
            cidr: "",
            name: "frog-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "",
            name: "frog-zone-3",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "frog",
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            select_zones: [1],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        vpcState.vpcs.subnetTiers.save(
          {
            name: "frog",
            select_zones: [1, 2, 3],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "frog", advanced: true },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        let expectedTier = {
          name: "frog",
          select_zones: [1, 2, 3],
          advanced: true,
          subnets: ["frog-zone-1", "frog-zone-2", "frog-zone-3"],
          zones: undefined,
          networkAcl: "-",
        };
        assert.deepEqual(
          vpcState.store.subnetTiers.management[0],
          expectedTier,
          "it should change subnets"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      describe("vpcs.subnetTiers.save (from JSON)", () => {
        let craig;
        beforeEach(() => {
          craig = new newState(true);
          craig.store.json._options.dynamic_subnets = false;
          craig.store.json.vpcs[0].subnets.push({
            name: "test",
            use_data: true,
          });
          craig.hardSetJson(craig.store.json, true);
        });
        it("should update a subnet tier in place", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
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
              name: "frog-zone-2",
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.store.json.dns.push({
            name: "dns",
            zones: [],
            custom_resolvers: [
              {
                vpc: "management",
                subnets: ["vsi-zone-1"],
              },
            ],
          });
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
              networkAcl: "management",
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.dns[0].custom_resolvers[0].subnets,
            ["frog-zone-1"],
            "it should replace subnet name"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[0],
            { name: "frog", zones: 2, networkAcl: "management" },
            "it should have correct subnet tiers"
          );
        });
        it("should update a subnet tier in place and update address prefixes", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.10.0/24",
              name: "frog-zone-2",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
            },
          ];
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          );

          assert.deepEqual(
            craig.store.json.vpcs[0].address_prefixes,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with nacl and gateway", () => {
          craig.vpcs.acls.create({ name: "todd" }, { vpc_name: "management" });
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "todd",
              resource_group: "management-rg",
              public_gateway: true,
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
              name: "frog-zone-2",
              network_acl: "todd",
              resource_group: "management-rg",
              public_gateway: true,
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.store.json.vpcs[0].publicGateways = [1, 2];
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
              networkAcl: "todd",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with nacl and gateway when only one gateway is enabled", () => {
          craig.store.json._options.dynamic_subnets = true;
          craig.vpcs.acls.create({ name: "todd" }, { vpc_name: "management" });
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.0.0/29",
              name: "frog-zone-1",
              network_acl: "todd",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: false,
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
              zone: 2,
              cidr: "10.20.0.0/29",
              name: "frog-zone-2",
              network_acl: "todd",
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
              cidr: "10.30.0.0/29",
              name: "vpe-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: false,
            },
            {
              has_prefix: false,
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.store.json.vpcs[0].publicGateways = [1];
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
              networkAcl: "todd",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl", () => {
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
              network_acl: null,
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpn-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          craig.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
            },
            {
              vpc_name: "management",
              data: { name: "vpn" },
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier address prefixes in place with additional zones and with no acl", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.10.0/24",
              name: "vsi-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.10.0/24",
              name: "vsi-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpn-zone-2",
            },
          ];
          craig.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
            },
            {
              vpc_name: "management",
              data: { name: "vpn" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].address_prefixes,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl and 1 zone pgw", () => {
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
              network_acl: null,
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpn-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          craig.store.json.vpcs[0].publicGateways = [2];
          craig.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              data: { name: "vpn" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl and 2 zone pgw", () => {
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
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: true,
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.30.0/24",
              name: "vpn-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
          ];
          craig.store.json.vpcs[0].publicGateways = [1];
          craig.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              data: { name: "vpn" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should expand a reserved edge subnet tier in place with additional zones", () => {
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.5.60.0/24",
              name: "f5-bastion-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.6.60.0/24",
              name: "f5-bastion-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.7.60.0/24",
              name: "f5-bastion-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          craig.store.edge_vpc_name = "management";
          craig.store.json.vpcs[0].subnetTiers.unshift({
            name: "f5-bastion",
            zones: 1,
          });
          craig.vpcs.subnetTiers.save(
            {
              name: "f5-bastion",
              zones: 3,
            },
            {
              vpc_name: "management",
              data: { name: "f5-bastion" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should save advanced subnet tier", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
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
              name: "frog-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.store.json.dns.push({
            name: "dns",
            zones: [],
            custom_resolvers: [
              {
                vpc: "management",
                subnets: ["vsi-zone-1"],
              },
            ],
          });
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              select_zones: [1, 2],
              advanced: true,
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          );
          let expectedTier = {
            name: "frog",
            select_zones: [1, 2],
            advanced: true,
            subnets: ["frog-zone-1", "frog-zone-2"],
            zones: undefined,
            networkAcl: "-",
          };
          let expectedPrefixes = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.10.0/24",
              name: "frog-zone-2",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
            },
          ];
          assert.deepEqual(
            craig.store.json.dns[0].custom_resolvers[0].subnets,
            ["frog-zone-1"],
            "it should update dns subnet name"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[0],
            expectedTier,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].address_prefixes,
            expectedPrefixes,
            "it should change address prefixes"
          );
          assert.isTrue(
            craig.store.json._options.advanced_subnets,
            "it should set advanced subnets"
          );
        });
        it("should save advanced subnet tier", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
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
              name: "frog-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.store.json.dns.push({
            name: "dns",
            zones: [],
            custom_resolvers: [
              {
                vpc: "management",
                subnets: ["vsi-zone-1"],
              },
            ],
          });
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: [1, 2],
              advanced: true,
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          );
          let expectedTier = {
            name: "frog",
            select_zones: [1, 2],
            advanced: true,
            subnets: ["frog-zone-1", "frog-zone-2"],
            zones: undefined,
            networkAcl: "-",
          };
          let expectedPrefixes = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.10.0/24",
              name: "frog-zone-2",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
            },
          ];
          assert.deepEqual(
            craig.store.json.dns[0].custom_resolvers[0].subnets,
            ["frog-zone-1"],
            "it should update dns subnet name"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[0],
            expectedTier,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].address_prefixes,
            expectedPrefixes,
            "it should change address prefixes"
          );
          assert.isTrue(
            craig.store.json._options.advanced_subnets,
            "it should set advanced subnets"
          );
        });
        it("should save advanced subnet tier", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "vsi",
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
              zone: 3,
              cidr: "10.30.10.0/24",
              name: "vsi-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "vsi",
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
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.vpcs.subnetTiers.save(
            {
              name: "vsi",
              zones: ["1", "2", "3"],
              advanced: true,
            },
            {
              vpc_name: "management",
              data: {
                addPublicGateway: false,
                advanced: false,
                hide: true,
                name: "vsi",
                networkAcl: "workload",
                select_zones: 3,
                zones: 3,
              },
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[0],
            {
              name: "vsi",
              zones: undefined,
              advanced: true,
              networkAcl: "-",
              select_zones: ["1", "2", "3"],
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            },
            "it should set subnets"
          );

          craig.vpcs.subnetTiers.save(
            {
              hide: true,
              networkAcl: "-",
              addPublicGateway: false,
              name: "vsi",
              zones: ["1", "3"],
              advanced: true,
              select_zones: ["1", "3"],
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            },
            {
              vpc_name: "management",
              data: {
                hide: true,
                networkAcl: "-",
                addPublicGateway: false,
                name: "vsi",
                advanced: true,
                select_zones: ["1", "3", "2"],
                subnets: ["vsi-zone-1", "vsi-zone-3", "vsi-zone-2"],
              },
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          );

          let expectedTier = {
            addPublicGateway: false,
            name: "vsi",
            select_zones: ["1", "3"],
            advanced: true,
            subnets: ["vsi-zone-1", "vsi-zone-3"],
            zones: undefined,
            networkAcl: "-",
            hide: true,
            zones: ["1", "3"],
          };
          let expectedPrefixes = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.10.0/24",
              name: "vsi-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
            },
          ];
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[0],
            expectedTier,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].address_prefixes,
            expectedPrefixes,
            "it should change address prefixes"
          );
          assert.isTrue(
            craig.store.json._options.advanced_subnets,
            "it should set advanced subnets"
          );
          craig.vpcs.subnetTiers.save(
            {
              hide: true,
              networkAcl: "-",
              addPublicGateway: false,
              name: "vsi",
              zones: ["1", "3", "2"],
              advanced: true,
              select_zones: ["1", "3", "2"],
              subnets: ["vsi-zone-1", "vsi-zone-3"],
            },
            {
              vpc_name: "management",
              data: {
                hide: true,
                networkAcl: "-",
                addPublicGateway: false,
                name: "vsi",
                zones: ["1", "3"],
                advanced: true,
                select_zones: ["1", "3"],
                subnets: ["vsi-zone-1", "vsi-zone-3"],
              },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[0].subnets,
            ["vsi-zone-1", "vsi-zone-3", "vsi-zone-2"],
            "it should return names"
          );
          craig.vpcs.subnetTiers.save(
            {
              hide: true,
              networkAcl: "-",
              addPublicGateway: false,
              name: "frog",
              zones: ["1", "3", "2"],
              advanced: true,
              select_zones: ["1", "3", "2"],
              subnets: ["vsi-zone-1", "vsi-zone-3"],
            },
            {
              vpc_name: "management",
              data: {
                hide: true,
                networkAcl: "-",
                addPublicGateway: false,
                name: "vsi",
                zones: ["1", "3"],
                advanced: true,
                select_zones: ["1", "3"],
                subnets: ["vsi-zone-1", "vsi-zone-3"],
              },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[0].subnets,
            ["frog-zone-1", "frog-zone-3", "frog-zone-2"],
            "it should return names"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets[0].tier,
            "frog",
            "it should have correct tier"
          );
        });
        it("should save advanced subnet tier with an existing advanced tier and both should have correct tier data in store", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
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
              name: "frog-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "toad-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
              tier: "toad",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "toad-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "toad",
            },
            {
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              select_zones: [1, 2],
              advanced: true,
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "frog",
                select_zones: [1, 2],
                advanced: true,
                subnets: ["frog-zone-1", "frog-zone-2"],
                zones: undefined,
                networkAcl: "-",
              },
              {
                name: "vpn",
                zones: 1,
              },
              {
                name: "vpe",
                zones: 3,
              },
            ],
            "it should change subnets"
          );
          craig.vpcs.subnetTiers.save(
            {
              name: "toad",
              select_zones: [1, 2],
              advanced: true,
            },
            {
              vpc_name: "management",
              data: { name: "vpe" },
              craig: {
                store: {
                  json: {
                    vpcs: [
                      {
                        name: "management",
                        publicGateways: [],
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "frog",
                zones: undefined,
                advanced: true,
                networkAcl: "-",
                select_zones: [1, 2],
                subnets: ["frog-zone-1", "frog-zone-2"],
              },
              { name: "vpn", zones: 1 },
              {
                name: "toad",
                zones: undefined,
                advanced: true,
                networkAcl: "-",
                select_zones: [1, 2],
                subnets: ["toad-zone-1", "toad-zone-2"],
              },
            ],
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should save advanced subnet tier with an existing advanced tier and both should have correct tier data in store", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "frog-zone-1",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
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
              name: "frog-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "frog",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "toad-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
              tier: "toad",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "toad-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "toad",
            },
            {
              name: "test",
              network_acl: null,
              resource_group: "management-rg",
              use_data: true,
              vpc: "management",
            },
          ];
          craig.store.json.f5_vsi = [
            {
              name: "hi",
              vpc: "no",
              template: {},
              ssh_keys: [],
            },
          ];
          craig.vpcs.subnetTiers.save(
            {
              name: "frog",
              select_zones: [1, 2],
              advanced: true,
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "frog",
                select_zones: [1, 2],
                advanced: true,
                subnets: ["frog-zone-1", "frog-zone-2"],
                zones: undefined,
                networkAcl: "-",
              },
              {
                name: "vpn",
                zones: 1,
              },
              {
                name: "vpe",
                zones: 3,
              },
            ],
            "it should change subnets"
          );
          craig.vpcs.subnetTiers.save(
            {
              name: "toad",
              select_zones: [1, 2],
              advanced: true,
            },
            {
              vpc_name: "management",
              data: { name: "vpe" },
              craig: craig,
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "frog",
                zones: undefined,
                advanced: true,
                networkAcl: "-",
                select_zones: [1, 2],
                subnets: ["frog-zone-1", "frog-zone-2"],
              },
              { name: "vpn", zones: 1 },
              {
                name: "toad",
                zones: undefined,
                advanced: true,
                networkAcl: "-",
                select_zones: [1, 2],
                subnets: ["toad-zone-1", "toad-zone-2"],
              },
            ],
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should save correct vpn subnet tier subnets when changing to advanced", () => {
          craig.vpcs.subnetTiers.save(
            { name: "vpn", advanced: true, select_zones: ["1"], zones: ["1"] },
            {
              data: {
                name: "vpn",
                zones: 1,
              },
              craig: craig,
              vpc_name: "management",
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "vsi",
                zones: 3,
              },
              {
                advanced: true,
                name: "vpn",
                networkAcl: "-",
                select_zones: ["1"],
                subnets: ["vpn-zone-1"],
                zones: undefined,
              },
              {
                name: "vpe",
                zones: 3,
              },
            ],
            "it should have correct subnet tiers"
          );
        });
        it("should save correct vsi subnet tier subnets when changing to advanced", () => {
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
                zones: 3,
              },
              craig: craig,
              vpc_name: "management",
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "vsi",
                networkAcl: "-",
                select_zones: ["1", "2", "3"],
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                zones: undefined,
                advanced: true,
              },
              {
                name: "vpn",
                zones: 1,
              },
              {
                name: "vpe",
                zones: 3,
              },
            ],
            "it should have correct subnet tiers"
          );
        });
        it("should save correct vsi subnet tier subnets when changing to advanced", () => {
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
                zones: 3,
              },
              craig: craig,
              vpc_name: "management",
            }
          );
          craig.vpcs.subnetTiers.save(
            {
              name: "vsi",
              advanced: true,
              select_zones: ["1"],
              zones: ["1"],
            },
            {
              data: {
                name: "vsi",
                zones: 3,
              },
              craig: craig,
              vpc_name: "management",
            }
          );
          craig.vpcs.subnetTiers.save(
            {
              name: "vsi",
              advanced: true,
              select_zones: ["1", "2"],
              zones: ["1", "2"],
            },
            {
              data: {
                name: "vsi",
                zones: 3,
              },
              craig: craig,
              vpc_name: "management",
            }
          );
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
                zones: 3,
              },
              craig: craig,
              vpc_name: "management",
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets.length,
            8,
            "it should have correct"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "vsi",
                networkAcl: "-",
                select_zones: ["1", "2", "3"],
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                zones: ["1", "2", "3"],
                advanced: true,
              },
              {
                name: "vpn",
                zones: 1,
              },
              {
                name: "vpe",
                zones: 3,
              },
            ],
            "it should have correct subnet tiers"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets.length,
            8,
            "it should have correct"
          );
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
                zones: ["1", "2", "3"],
                select_zones: ["1", "2", "3"],
                advanced: true,
              },
              craig: craig,
              vpc_name: "management",
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets.length,
            6,
            "it should have correct"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "vsi",
                networkAcl: "-",
                select_zones: ["3"],
                subnets: ["vsi-zone-3"],
                zones: ["3"],
                advanced: true,
              },
              {
                name: "vpn",
                zones: 1,
              },
              {
                name: "vpe",
                zones: 3,
              },
            ],
            "it should have correct subnet tiers"
          );
        });
      });
    });
    describe("vpcs.subnetTiers.create", () => {
      it("should add a subnet tier to vpc", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        vpcState.vpcs.subnetTiers.create(
          {
            name: "test",
            zones: 3,
            networkAcl: "management",
          },
          { vpc_name: "management" }
        );
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
            vpc: "management",
            zone: 1,
            cidr: "10.10.40.0/24",
            name: "test-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.40.0/24",
            name: "test-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.40.0/24",
            name: "test-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should add a subnet tier to vpc with pgw", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        vpcState.vpcs.subnetTiers.create(
          {
            name: "test",
            zones: 3,
            networkAcl: "management",
            addPublicGateway: true,
          },
          { vpc_name: "management" }
        );
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
            vpc: "management",
            zone: 1,
            cidr: "10.10.40.0/24",
            name: "test-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: true,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.40.0/24",
            name: "test-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: true,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.40.0/24",
            name: "test-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: true,
            has_prefix: true,
          },
        ];
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should add a subnet tier to vpc with no subnet tier", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        vpcState.vpcs.subnetTiers.create(
          {
            name: "test",
            zones: 3,
          },
          { vpc_name: "management" }
        );
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
            vpc: "management",
            zone: 1,
            cidr: "10.10.40.0/24",
            name: "test-zone-1",
            resource_group: "management-rg",
            network_acl: null,
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.40.0/24",
            name: "test-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.40.0/24",
            name: "test-zone-3",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should add an advanced subnet tier to vpc", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        vpcState.vpcs.subnetTiers.create(
          {
            name: "test",
            advanced: true,
            select_zones: [1, 2, 3],
            networkAcl: "management",
          },
          { vpc_name: "management" }
        );
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
            vpc: "management",
            zone: 1,
            cidr: null,
            name: "test-zone-1",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "test",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: null,
            name: "test-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "test",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: null,
            name: "test-zone-3",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
            tier: "test",
          },
        ];
        assert.deepEqual(
          vpcState.store.subnetTiers.management[
            vpcState.store.subnetTiers.management.length - 1
          ],
          {
            advanced: true,
            name: "test",
            select_zones: [1, 2, 3],
            subnets: ["test-zone-1", "test-zone-2", "test-zone-3"],
            zones: undefined,
          },
          "it should return correct tiers"
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      describe("vpcs.subnetTiers.create (from JSON)", () => {
        let craig;
        beforeEach(() => {
          craig = new newState(true);
          craig.store.json._options.dynamic_subnets = false;
          craig.hardSetJson(craig.store.json, true);
        });
        it("should add a subnet tier to vpc", () => {
          craig.store.json._options.dynamic_subnets = false;
          craig.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management",
            },
            { vpc_name: "management" }
          );
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
              vpc: "management",
              zone: 1,
              cidr: "10.10.40.0/24",
              name: "test-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.40.0/24",
              name: "test-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "test-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "vsi",
                zones: 3,
              },
              {
                name: "vpn",
                zones: 1,
              },
              {
                name: "vpe",
                zones: 3,
              },
              {
                advanced: false,
                name: "test",
                select_zones: 3,
                subnets: [],
                zones: 3,
              },
            ],
            "it should have correct subnet tiers"
          );
        });
        it("should add a subnet tier to vpc new", () => {
          craig.store.json._options.dynamic_subnets = false;
          craig.vpcs.create({ name: "frog" });
          craig.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management",
            },
            { vpc_name: "frog" }
          );
          let expectedData = [
            {
              cidr: "10.70.10.0/24",
              has_prefix: true,
              name: "test-zone-1",
              network_acl: null,
              public_gateway: false,
              resource_group: null,
              vpc: "frog",
              zone: 1,
            },
            {
              cidr: "10.80.10.0/24",
              has_prefix: true,
              name: "test-zone-2",
              network_acl: null,
              public_gateway: false,
              resource_group: null,
              vpc: "frog",
              zone: 2,
            },
            {
              cidr: "10.90.10.0/24",
              has_prefix: true,
              name: "test-zone-3",
              network_acl: null,
              public_gateway: false,
              resource_group: null,
              vpc: "frog",
              zone: 3,
            },
          ];
          assert.deepEqual(
            craig.store.json.vpcs[2].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[2].subnetTiers,
            [
              {
                name: "test",
                select_zones: 3,
                advanced: false,
                subnets: [],
                zones: 3,
              },
            ],
            "it should have correct subnet tiers"
          );
        });
        it("should add a subnet tier to vpc with pgw", () => {
          craig.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management",
              addPublicGateway: true,
            },
            { vpc_name: "management" }
          );
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
              vpc: "management",
              zone: 1,
              cidr: "10.10.40.0/24",
              name: "test-zone-1",
              resource_group: "management-rg",
              network_acl: "management",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.40.0/24",
              name: "test-zone-2",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "test-zone-3",
              network_acl: "management",
              resource_group: "management-rg",
              public_gateway: true,
              has_prefix: true,
            },
          ];
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers,
            [
              {
                name: "vsi",
                zones: 3,
              },
              {
                name: "vpn",
                zones: 1,
              },
              {
                name: "vpe",
                zones: 3,
              },
              {
                advanced: false,
                name: "test",
                select_zones: 3,
                subnets: [],
                zones: 3,
              },
            ],
            "it should have correct subnet tiers"
          );
        });
        it("should add a subnet tier to vpc with no subnet tier", () => {
          craig.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
            },
            { vpc_name: "management" }
          );
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
              vpc: "management",
              zone: 1,
              cidr: "10.10.40.0/24",
              name: "test-zone-1",
              resource_group: "management-rg",
              network_acl: null,
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.40.0/24",
              name: "test-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.40.0/24",
              name: "test-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ];
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should add an advanced subnet tier to vpc", () => {
          craig.vpcs.subnetTiers.create(
            {
              name: "test",
              advanced: true,
              select_zones: [1, 2, 3],
              networkAcl: "management",
            },
            { vpc_name: "management" }
          );
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
              vpc: "management",
              zone: 1,
              cidr: null,
              name: "test-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "test",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: null,
              name: "test-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "test",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: null,
              name: "test-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "test",
            },
          ];
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[3],
            {
              advanced: true,
              name: "test",
              select_zones: [1, 2, 3],
              subnets: ["test-zone-1", "test-zone-2", "test-zone-3"],
              zones: undefined,
            },
            "it should return correct tiers"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should add an advanced subnet tier to vpc", () => {
          craig.vpcs.subnetTiers.create(
            {
              networkAcl: "management",
              name: "test",
              zones: ["1", "2", "3"],
              advanced: true,
              addPublicGateway: false,
              select_zones: ["1", "2", "3"],
            },
            { vpc_name: "management" }
          );
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
              vpc: "management",
              zone: 1,
              cidr: null,
              name: "test-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "test",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: null,
              name: "test-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "test",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: null,
              name: "test-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
              tier: "test",
            },
          ];
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers[3],
            {
              advanced: true,
              name: "test",
              select_zones: ["1", "2", "3"],
              subnets: ["test-zone-1", "test-zone-2", "test-zone-3"],
              zones: ["1", "2", "3"],
            },
            "it should return correct tiers"
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should not have the double create error from state store", () => {
          craig.vpcs.subnetTiers.delete(
            {},
            { vpc_name: "management", data: { name: "vsi" } }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers.length,
            2,
            "it should have correct tiers"
          );
          craig.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management",
            },
            { vpc_name: "management" }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnetTiers.length,
            3,
            "it should have correct tiers"
          );
        });
      });
    });
    describe("vpcs.subnetTiers.delete", () => {
      it("should delete a subnet tier", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpn-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vpe-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.10.0/24",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        vpcState.vpcs.subnetTiers.delete(
          {},
          { vpc_name: "management", data: { name: "vsi" } }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should delete a subnet tier and update address prefixes", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.10.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpn-zone-1",
          },
        ];
        vpcState.vpcs.subnetTiers.delete(
          {},
          { vpc_name: "management", data: { name: "vsi" } }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].address_prefixes,
          expectedData,
          "it should change subnets"
        );
      });
      it("should delete a subnet tier and leave F5 subnets in place", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        // push f5-management to subnets
        vpcState.store.json.vpcs[0].subnets.push({
          cidr: "10.5.60.0/24",
          has_prefix: true,
          name: "f5-bastion-zone-1",
          network_acl: "management",
          public_gateway: false,
          resource_group: "edge-rg",
          vpc: "edge",
          zone: 1,
        });
        vpcState.store.json.vpcs[0].subnets.push({
          cidr: "10.6.60.0/24",
          has_prefix: true,
          name: "f5-bastion-zone-2",
          network_acl: "management",
          public_gateway: false,
          resource_group: "edge-rg",
          vpc: "edge",
          zone: 2,
        });
        vpcState.store.json.vpcs[0].subnets.push({
          cidr: "10.7.60.0/24",
          has_prefix: true,
          name: "f5-bastion-zone-3",
          network_acl: "management",
          public_gateway: false,
          resource_group: "edge-rg",
          vpc: "edge",
          zone: 3,
        });
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpn-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vpe-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.10.0/24",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            cidr: "10.5.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-1",
            network_acl: "management",
            public_gateway: false,
            resource_group: "management-rg",
            vpc: "management",
            zone: 1,
          },
          {
            cidr: "10.6.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-2",
            network_acl: "management",
            public_gateway: false,
            resource_group: "management-rg",
            vpc: "management",
            zone: 2,
          },
          {
            cidr: "10.7.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-3",
            network_acl: "management",
            public_gateway: false,
            resource_group: "management-rg",
            vpc: "management",
            zone: 3,
          },
        ];
        vpcState.vpcs.subnetTiers.delete(
          { name: "vsi", zones: 3 },
          { vpc_name: "management", data: { name: "vsi", zones: 3 } }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should delete an advanced subnet tier", () => {
        let vpcState = new newState(true);
        vpcState.store.json._options.dynamic_subnets = false;
        let expectedData = [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.20.0/24",
            name: "vpn-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vpe-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.10.0/24",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        vpcState.vpcs.subnetTiers.save(
          {
            name: "vsi",
            select_zones: [1, 2],
            advanced: true,
          },
          {
            vpc_name: "management",
            data: { name: "vsi" },
            craig: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
                      publicGateways: [],
                    },
                  ],
                },
              },
            },
          }
        );
        vpcState.vpcs.subnetTiers.delete(
          { advanced: true },
          { vpc_name: "management", data: { name: "vsi", advanced: true } }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      describe("vpc.subnetTiers.delete (from JSON)", () => {
        let craig;
        beforeEach(() => {
          craig = new newState(true);
          craig.store.json._options.dynamic_subnets = false;
          craig.hardSetJson(craig.store.json, true);
        });
        it("should delete a subnet tier", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
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
          ];
          craig.vpcs.subnetTiers.delete(
            {},
            { vpc_name: "management", data: { name: "vsi" } }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
          assert.deepEqual(craig.store.json.vpcs[0].subnetTiers, [
            {
              name: "vpn",
              zones: 1,
            },
            {
              name: "vpe",
              zones: 3,
            },
          ]);
        });
        it("should delete a subnet tier and update address prefixes", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vpn-zone-1",
            },
          ];
          craig.vpcs.subnetTiers.delete(
            {},
            { vpc_name: "management", data: { name: "vsi" } }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].address_prefixes,
            expectedData,
            "it should change subnets"
          );
        });
        it("should delete a subnet tier and leave F5 subnets in place", () => {
          // push f5-management to subnets
          craig.store.json.vpcs[0].subnets.push({
            cidr: "10.5.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-1",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 1,
          });
          craig.store.json.vpcs[0].subnets.push({
            cidr: "10.6.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-2",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 2,
          });
          craig.store.json.vpcs[0].subnets.push({
            cidr: "10.7.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-3",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 3,
          });
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
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
              cidr: "10.5.60.0/24",
              has_prefix: true,
              name: "f5-bastion-zone-1",
              network_acl: "management",
              public_gateway: false,
              resource_group: "management-rg",
              vpc: "management",
              zone: 1,
            },
            {
              cidr: "10.6.60.0/24",
              has_prefix: true,
              name: "f5-bastion-zone-2",
              network_acl: "management",
              public_gateway: false,
              resource_group: "management-rg",
              vpc: "management",
              zone: 2,
            },
            {
              cidr: "10.7.60.0/24",
              has_prefix: true,
              name: "f5-bastion-zone-3",
              network_acl: "management",
              public_gateway: false,
              resource_group: "management-rg",
              vpc: "management",
              zone: 3,
            },
          ];
          craig.vpcs.subnetTiers.delete(
            { name: "vsi", zones: 3 },
            { vpc_name: "management", data: { name: "vsi", zones: 3 } }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should delete an advanced subnet tier", () => {
          let expectedData = [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
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
          ];
          craig.vpcs.subnetTiers.save(
            {
              name: "vsi",
              select_zones: [1, 2],
              advanced: true,
              subnets: ["vsi-zone-1", "vsi-zone-2"],
            },
            {
              vpc_name: "management",
              data: { name: "vsi" },
              craig: craig,
            }
          );
          craig.vpcs.subnetTiers.delete(
            { advanced: true, zones: 0 },
            {
              vpc_name: "management",
              data: {
                name: "vsi",
                advanced: true,
                subnets: ["vsi-zone-1", "vsi-zone-2"],
              },
            }
          );
          assert.deepEqual(
            craig.store.json.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
      });
    });
    describe("vpcs.subnetTiers.schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
      });
      it("should return true when name invalid", () => {
        let actualData = craig.vpcs.subnetTiers.name.invalidText(
          { name: "@@@" },
          {
            vpc_name: "test",
            craig: {
              store: {
                subnetTiers: {
                  test: [
                    {
                      name: "frog",
                    },
                  ],
                },
              },
            },
          }
        );
        let expectedData =
          "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s";
        assert.deepEqual(
          actualData,
          expectedData,
          "it should return correct data"
        );
      });
      it("should return true when name duplicate", () => {
        let actualData = craig.vpcs.subnetTiers.name.invalidText(
          { name: "frog" },
          {
            vpc_name: "test",
            craig: {
              store: {
                subnetTiers: {
                  test: [
                    {
                      name: "frog",
                    },
                  ],
                },
              },
            },
          }
        );
        let expectedData = 'Name "frog" already in use';
        assert.deepEqual(
          actualData,
          expectedData,
          "it should return correct data"
        );
      });
      it("should disable advanced toggle when dynamic subnets", () => {
        assert.isTrue(
          craig.vpcs.subnetTiers.advanced.disabled({}, { craig: craig }),
          "it should be disabled"
        );
      });
      it("should disable advanced toggle when advanced", () => {
        craig.store.json._options.dynamic_subnets = false;
        assert.isTrue(
          craig.vpcs.subnetTiers.advanced.disabled(
            { vpc: "vpc", name: "vpn-2" },
            { craig: craig, data: { advanced: true } }
          ),
          "it should be disabled"
        );
      });
      it("should disable advanced toggle when not advanced", () => {
        craig.store.json._options.dynamic_subnets = false;
        assert.isFalse(
          craig.vpcs.subnetTiers.advanced.disabled(
            { vpc: "vpc", name: "vpn-2" },
            { craig: craig, data: { advanced: false } }
          ),
          "it should be disabled"
        );
      });
      it("should disable advanced toggle when dedicated edge tier", () => {
        craig.store.edge_vpc_name = "vpc";
        assert.isTrue(
          craig.vpcs.subnetTiers.advanced.disabled(
            { vpc: "vpc", name: "vpn-2" },
            { craig: craig, data: { advanced: false } }
          ),
          "it should be disabled"
        );
      });
      it("should show zones as multiselect when advanced", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.zones.type({ advanced: true }),
          "multiselect",
          "it should have correct type"
        );
      });
      it("should show zones as multiselect when nor advanced", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.zones.type({}),
          "select",
          "it should have correct type"
        );
      });
      it("should change zones to array when advanced", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.zones.onRender({ advanced: true, zones: "3" }),
          ["1", "2", "3"],
          "it should return zones"
        );
      });
      it("should change zones to array when advanced", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.zones.onRender({ advanced: true, zones: "1" }),
          ["1"],
          "it should return zones"
        );
      });
      it("should change zones to array when advanced", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.zones.onRender({
            advanced: true,
            zones: "3",
            select_zones: ["2", "3"],
          }),
          ["2", "3"],
          "it should return zones"
        );
      });
      it("should not change zones when already advanced", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.zones.onRender({
            advanced: true,
            zones: ["3"],
          }),
          ["3"],
          "it should return zones"
        );
      });
      it("should be disabled when state data is advanced and component props is not", () => {
        assert.isTrue(
          craig.vpcs.subnetTiers.zones.disabled(
            {
              advanced: true,
              zones: ["3"],
            },
            {
              data: {
                advanced: false,
              },
            }
          ),
          "it should return zones"
        );
      });
      it("should reset zones to component props zones when changing state data.advanced to true", () => {
        let data = {
          zones: 3,
        };
        craig.vpcs.subnetTiers.advanced.onInputChange(
          data,
          {},
          { data: { zones: 2 } }
        );
        assert.deepEqual(data.zones, 2, "it should reset zones");
      });
      it("should change zones to string when not advanced", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.zones.onRender({
            advanced: false,
            zones: ["1", "2", "3"],
          }),
          "3",
          "it should return zones"
        );
      });
      it("should disable advanced toggle when not dynamic subnets but is advanced", () => {
        assert.isTrue(
          craig.vpcs.subnetTiers.advanced.disabled(
            {},
            {
              craig: {
                store: {
                  json: {
                    _options: {
                      dynamic_subnets: false,
                    },
                  },
                },
              },
              data: {
                advanced: true,
              },
            }
          ),
          "it should be disabled"
        );
      });
      it("should get correct groups for vpc network acl", () => {
        assert.deepEqual(
          craig.vpcs.subnetTiers.networkAcl.groups(
            {},
            { craig: craig, vpc_name: "management" }
          ),
          ["management"],
          "it should return list of acls"
        );
      });
      it("should disable network acl when advanced", () => {
        assert.isTrue(
          craig.vpcs.subnetTiers.networkAcl.disabled({ advanced: true }),
          "it should be disabled"
        );
      });
      it("should read only network acl when dedicated edge tier", () => {
        craig.store.edge_vpc_name = "vpc";
        assert.isTrue(
          craig.vpcs.subnetTiers.networkAcl.readOnly(
            { name: "vpn-2", vpc: "vpc" },
            { craig: craig }
          ),
          "it should be read only"
        );
      });
      it("should show network acl as invalid when in modal and no acl selected", () => {
        assert.isTrue(
          craig.vpcs.subnetTiers.networkAcl.invalid({}, { isModal: true }),
          "it should be invalid"
        );
      });
      it("should disable add public gateway when advanced", () => {
        assert.isTrue(
          craig.vpcs.subnetTiers.addPublicGateway.disabled({ advanced: true }),
          "it should be disabled"
        );
      });
      it("should disable add public gateway when dedicated edge tier", () => {
        craig.store.edge_vpc_name = "vpc";
        assert.isTrue(
          craig.vpcs.subnetTiers.addPublicGateway.disabled(
            { name: "vpn-2", vpc: "vpc" },
            { craig: craig }
          ),
          "it should be disabled"
        );
      });
      it("should disable add public gateway toggle when no gateways", () => {
        assert.isTrue(
          craig.vpcs.subnetTiers.addPublicGateway.disabled(
            { name: "hi" },
            { craig: craig, vpc: "management" }
          ),
          "it should be disabled"
        );
      });
    });
  });
  describe("vpcs.network_acls", () => {
    describe("vpcs.network_acls.create", () => {
      it("should create an acl", () => {
        let state = newState();
        state.vpcs.acls.create({ name: "new" }, { vpc_name: "management" });
        let expectedData = {
          name: "new",
          resource_group: "management-rg",
          vpc: "management",
          rules: [],
          use_data: false,
        };
        assert.deepEqual(
          state.store.json.vpcs[0].acls[1],
          expectedData,
          "it should create acl"
        );
      });
      it("should create an acl with rg", () => {
        let state = newState();
        state.store.json.vpcs[0].resource_group = null;
        state.vpcs.acls.create(
          { name: "new", resource_group: "workload-rg" },
          { vpc_name: "management" }
        );
        let expectedData = {
          name: "new",
          resource_group: "workload-rg",
          vpc: "management",
          rules: [],
          use_data: false,
        };
        assert.deepEqual(
          state.store.json.vpcs[0].acls[1],
          expectedData,
          "it should create acl"
        );
      });
      it("should create an acl and update rg when deleted", () => {
        let state = newState();
        state.vpcs.acls.create({ name: "new" }, { vpc_name: "management" });
        state.resource_groups.delete({}, { data: { name: "management-rg" } });
        let expectedData = {
          name: "new",
          resource_group: null,
          vpc: "management",
          rules: [],
          use_data: false,
        };
        assert.deepEqual(
          state.store.json.vpcs[0].acls[1],
          expectedData,
          "it should create acl"
        );
      });
    });
    describe("vpcs.network_acls.delete", () => {
      it("should delete an acl", () => {
        let state = newState();
        state.vpcs.acls.delete(
          {},
          { data: { name: "management" }, vpc_name: "management" }
        );
        let expectedData = [];
        assert.deepEqual(
          state.store.json.vpcs[0].acls,
          expectedData,
          "it should delete acl"
        );
      });
      it("should set subnet acls to null on delete", () => {
        let state = newState(true);
        state.store.json._options.dynamic_subnets = false;
        state.vpcs.acls.delete(
          {},
          { data: { name: "management" }, vpc_name: "management" }
        );
        let expectedData = [];
        assert.deepEqual(
          state.store.json.vpcs[0].acls,
          expectedData,
          "it should delete acl"
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets,
          [
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.10.0/24",
              name: "vsi-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.10.0/24",
              name: "vsi-zone-3",
              network_acl: null,
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
              network_acl: null,
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.30.20.0/24",
              name: "vpe-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ],
          "it should have correct subnets"
        );
      });
    });
    describe("vpcs.network_acls.save", () => {
      it("should update an acl", () => {
        let state = newState();
        // control for unchanged acls
        state.store.json.vpcs[0].subnets[1].network_acl = "frog";
        state.vpcs.acls.save(
          { name: "new" },
          { data: { name: "management" }, vpc_name: "management" }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].acls[0].name,
          "new",
          "it should update acl"
        );
        assert.deepEqual(
          state.store.json.vpcs[0].acls[0].rules[0].acl,
          "new",
          "it should have correct acl"
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[0].network_acl,
          "new",
          "it should have correct acl"
        );
      });
      it("should update an acl with no name change", () => {
        let state = newState();
        state.vpcs.acls.save(
          { name: "management", resource_group: "workload-rg" },
          { data: { name: "management" }, vpc_name: "management" }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].acls[0].resource_group,
          "workload-rg",
          "it should update acl rg"
        );
      });
    });
    describe("vpcs.network_acls.rules", () => {
      describe("vpcs.network_acls.rules.create", () => {
        it("should create a network acl rule", () => {
          let state = newState();
          state.vpcs.acls.rules.create(
            {
              name: "frog",
              action: "allow",
              direction: "inbound",
              source: "8.8.8.8",
              destination: "0.0.0.0/0",
            },
            {
              vpc_name: "management",
              parent_name: "management",
            }
          );
          let expectedData = [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              action: "allow",
              source: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-ibm-outbound",
              destination: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-all-network-outbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "0.0.0.0/0",
              name: "frog",
              source: "8.8.8.8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].rules,
            expectedData,
            "it should add rule"
          );
        });
        it("should create a network acl rule with deny outbound", () => {
          let state = newState();
          state.vpcs.acls.rules.create(
            {
              name: "frog",
              action: "deny",
              direction: "outbound",
              source: "8.8.8.8",
              destination: "0.0.0.0/0",
            },
            {
              vpc_name: "management",
              parent_name: "management",
            }
          );
          let expectedData = [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              action: "allow",
              source: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-ibm-outbound",
              destination: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-all-network-outbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "outbound",
              destination: "0.0.0.0/0",
              name: "frog",
              source: "8.8.8.8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].rules,
            expectedData,
            "it should add rule"
          );
        });
      });
      describe("vpcs.network_acls.rules.save", () => {
        it("should update a rule in place with all", () => {
          let state = newState();
          state.vpcs.acls.rules.save(
            {
              name: "frog",
              allow: false,
              inbound: true,
              source: "1.2.3.4",
              destination: "5.6.7.8",
              ruleProtocol: "all",
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          let expectedData = [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              action: "allow",
              source: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-ibm-outbound",
              destination: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "inbound",
              destination: "5.6.7.8",
              name: "frog",
              source: "1.2.3.4",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].rules,
            expectedData,
            "it should update rule"
          );
        });
        it("should update a rule in place with protocol", () => {
          let state = newState();
          state.vpcs.acls.rules.save(
            {
              name: "frog",
              allow: false,
              inbound: true,
              source: "1.2.3.4",
              destination: "5.6.7.8",
              ruleProtocol: "tcp",
              rule: {
                port_max: 8080,
                port_min: null,
              },
              port_max: 8080,
              port_min: null,
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          let expectedData = [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              action: "allow",
              source: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-ibm-outbound",
              destination: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "inbound",
              destination: "5.6.7.8",
              name: "frog",
              source: "1.2.3.4",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 1,
                port_max: 8080,
                source_port_min: 1,
                source_port_max: 65535,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: 8080,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].rules,
            expectedData,
            "it should update rule"
          );
        });
        it("should update a rule in place with only one change protocol", () => {
          let state = newState();
          state.vpcs.acls.rules.save(
            {
              name: "allow-all-outbound",
              allow: true,
              inbound: false,
              source: "10.0.0.0/8",
              destination: "0.0.0.0/0",
              ruleProtocol: "tcp",
              rule: {
                port_max: 8080,
                port_min: null,
              },
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          let expectedData = [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              action: "allow",
              source: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-ibm-outbound",
              destination: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "outbound",
              destination: "0.0.0.0/0",
              name: "allow-all-outbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 1,
                port_max: 8080,
                source_port_min: 1,
                source_port_max: 65535,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].rules,
            expectedData,
            "it should update rule"
          );
        });
        it("should update a rule in place with protocol and change port values to numbers from string", () => {
          let state = newState();
          state.vpcs.acls.rules.save(
            {
              name: "frog",
              allow: false,
              inbound: true,
              source: "1.2.3.4",
              destination: "5.6.7.8",
              ruleProtocol: "tcp",
              rule: {
                port_max: "8080",
                port_min: null,
              },
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          let expectedData = [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              action: "allow",
              source: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-ibm-outbound",
              destination: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "deny",
              direction: "inbound",
              destination: "5.6.7.8",
              name: "frog",
              source: "1.2.3.4",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: 1,
                port_max: 8080,
                source_port_min: 1,
                source_port_max: 65535,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].rules,
            expectedData,
            "it should update rule"
          );
        });
      });
      describe("vpcs.network_acls.rules.delete", () => {
        it("should delete an acl rule", () => {
          let state = newState();
          state.vpcs.acls.rules.delete(
            {},
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-network-outbound" },
            }
          );
          let expectedData = [
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              action: "allow",
              source: "10.0.0.0/8",
              direction: "outbound",
              name: "allow-ibm-outbound",
              destination: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
          ];
          assert.deepEqual(
            state.store.json.vpcs[0].acls[0].rules,
            expectedData,
            "it should add rule"
          );
        });
      });
    });
  });
  describe("dynamic subnet addressing", () => {
    it("should update a subnet tier in place and update address prefixes when using dynamic subnet addressing", () => {
      let vpcState = newState();
      let expectedData = [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.0/22",
          name: "management-zone-1",
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.0.0/22",
          name: "management-zone-2",
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.0.0/22",
          name: "management-zone-3",
        },
      ];
      vpcState.vpcs.subnetTiers.save(
        {
          name: "frog",
          zones: 2,
        },
        {
          vpc_name: "management",
          data: { name: "vsi" },
          craig: {
            store: {
              json: {
                vpcs: [
                  {
                    name: "management",
                    publicGateways: [],
                  },
                ],
              },
            },
          },
        }
      );
      let expectedSubnets = [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.0/29",
          name: "frog-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
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
          zone: 2,
          cidr: "10.20.0.0/29",
          name: "frog-zone-2",
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
          cidr: "10.30.0.0/29",
          name: "vpe-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
      ];
      let expectedWorkloadPrefixes = [
        {
          vpc: "workload",
          zone: 1,
          name: "workload-zone-1",
          cidr: "10.40.0.0/22",
        },
        {
          vpc: "workload",
          zone: 2,
          name: "workload-zone-2",
          cidr: "10.50.0.0/22",
        },
        {
          vpc: "workload",
          zone: 3,
          name: "workload-zone-3",
          cidr: "10.60.0.0/22",
        },
      ];
      assert.deepEqual(
        vpcState.store.json.vpcs[0].address_prefixes,
        expectedData,
        "it should change subnets"
      );
      assert.deepEqual(
        vpcState.store.json.vpcs[1].address_prefixes,
        expectedWorkloadPrefixes,
        "it should change subnets"
      );
      assert.deepEqual(
        vpcState.store.json.vpcs[0].subnets,
        expectedSubnets,
        "it should change subnets"
      );
    });
    it("should update address prefixes when changing from scalable to not scalable", () => {
      let vpcState = newState();
      let expectedData = [
        {
          name: "vsi-zone-1",
          cidr: "10.10.0.0/29",
          zone: 1,
          vpc: "management",
        },
        {
          name: "vpn-zone-1",
          cidr: "10.10.0.16/28",
          zone: 1,
          vpc: "management",
        },
        {
          name: "vsi-zone-2",
          cidr: "10.20.0.0/29",
          zone: 2,
          vpc: "management",
        },
        {
          name: "vsi-zone-3",
          cidr: "10.30.0.0/29",
          zone: 3,
          vpc: "management",
        },
        {
          name: "vpe-zone-1",
          cidr: "10.10.0.48/29",
          zone: 1,
          vpc: "management",
        },
        {
          name: "vpe-zone-2",
          cidr: "10.20.0.16/29",
          zone: 2,
          vpc: "management",
        },
        {
          name: "vpe-zone-3",
          cidr: "10.30.0.16/29",
          zone: 3,
          vpc: "management",
        },
      ];
      vpcState.options.save(
        { dynamic_subnets: false },
        {
          data: {
            name: undefined,
            dynamic_subnets: true,
          },
        }
      );
      let expectedWorkloadPrefixes = [
        { name: "vsi-zone-1", cidr: "10.40.0.0/28", zone: 1, vpc: "workload" },
        { name: "vsi-zone-2", cidr: "10.50.0.0/28", zone: 2, vpc: "workload" },
        { name: "vsi-zone-3", cidr: "10.60.0.0/28", zone: 3, vpc: "workload" },
        { name: "vpe-zone-1", cidr: "10.40.0.32/29", zone: 1, vpc: "workload" },
        { name: "vpe-zone-2", cidr: "10.50.0.32/29", zone: 2, vpc: "workload" },
        { name: "vpe-zone-3", cidr: "10.60.0.32/29", zone: 3, vpc: "workload" },
      ];
      assert.deepEqual(
        vpcState.store.json.vpcs[0].address_prefixes,
        expectedData,
        "it should change subnets"
      );
      assert.deepEqual(
        vpcState.store.json.vpcs[1].address_prefixes,
        expectedWorkloadPrefixes,
        "it should change subnets"
      );
    });
    it("should have correct cidr for subnets on update in vpc other than the first", () => {
      let incorrectData = require("../data-files/craig-subnet-scaling-broken.json");
      let state = newState();
      let expectedData = [
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.0.0/28",
          name: "vsi-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: true,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.0.0/28",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: true,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.0.0/28",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: true,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.0.32/29",
          name: "vpe-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
          acl_name: "workload",
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.0.32/29",
          name: "vpe-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
          acl_name: "workload",
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.0.32/29",
          name: "vpe-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
          acl_name: "workload",
        },
      ];
      state.store.json = incorrectData;
      state.update();
      assert.deepEqual(
        state.store.json.vpcs[1].subnets,
        expectedData,
        "it should return correct subnets"
      );
    });
    it("should delete dynamically addressed subnet tiers the first", () => {
      let incorrectData = require("../data-files/craig-subnet-scaling-broken.json");
      let state = newState();
      let expectedData = [
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.0.0/28",
          name: "vsi-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: true,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.0.0/28",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: true,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.0.0/28",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: true,
          has_prefix: false,
        },
      ];
      state.store.json = incorrectData;
      state.update();
      state.vpcs.subnetTiers.delete(
        {},
        {
          data: {
            name: "vpe",
          },
          vpc_name: "workload",
        }
      );
      assert.deepEqual(
        state.store.json.vpcs[1].subnets,
        expectedData,
        "it should return correct subnets"
      );
    });
  });
  describe("acl shcema", () => {
    let craig = newState();
    it("should hide use data when vpc does not use data", () => {
      assert.isTrue(
        craig.vpcs.acls.use_data.hideWhen(
          {},
          {
            vpc_name: "vpc",
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "iac",
                  },
                  vpcs: [
                    {
                      name: "vpc",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be hidden"
      );
    });
    it("should return correct text", () => {
      assert.deepEqual(
        craig.vpcs.acls.name.helperText(
          { name: "test" },
          {
            vpc_name: "vpc",
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "iac",
                  },
                },
              },
            },
          }
        ),
        "iac-vpc-test-acl",
        "it should return correct text"
      );
    });
    it("should return correct text when use data", () => {
      assert.deepEqual(
        craig.vpcs.acls.name.helperText(
          { name: "test", use_data: true },
          {
            vpc_name: "vpc",
            craig: {
              store: {
                json: {
                  _options: {
                    prefix: "iac",
                  },
                },
              },
            },
          }
        ),
        "test",
        "it should return correct text"
      );
    });
    it("should set data when changing rule protocol", () => {
      let data = { ruleProtocol: "all" };
      craig.vpcs.acls.rules.ruleProtocol.onInputChange(data);
      assert.deepEqual(
        data,
        {
          rule: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            type: null,
            code: null,
          },
          ruleProtocol: "all",
          tcp: {
            port_min: null,
            port_max: null,
            source_port_max: null,
            source_port_min: null,
          },
          udp: {
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            port_max: null,
          },
          icmp: {
            type: null,
            code: null,
          },
        },
        "it should return data"
      );
    });
    it("should render value for each type when present on sub rule but not main", () => {
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: "null",
          },
        }),
        "",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: "null",
          },
          type: "1234",
        }),
        "1234",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.code.onRender({
          icmp: {
            code: "null",
          },
        }),
        "",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.type.onRender({
          icmp: {
            type: null,
          },
          type: "443",
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.code.onRender({
          icmp: {
            code: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.code.onRender({
          icmp: {},
          code: "443",
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.port_max.onRender({
          tcp: {
            port_max: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.port_min.onRender({
          tcp: {
            port_min: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.source_port_max.onRender({
          tcp: {
            source_port_max: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.source_port_min.onRender({
          tcp: {
            source_port_min: "443",
          },
        }),
        "443",
        "it should set sub rule"
      );
      assert.deepEqual(
        craig.vpcs.acls.rules.source_port_min.onRender({
          tcp: {
            source_port_min: null,
          },
          source_port_min: "443",
        }),
        "443",
        "it should set sub rule"
      );
    });
    it("should set rule data on input change", () => {
      let data = {
        ruleProtocol: "all",
      };
      craig.vpcs.acls.rules.ruleProtocol.onInputChange(data);
      assert.deepEqual(
        data,
        {
          rule: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            type: null,
            code: null,
          },
          ruleProtocol: "all",
          tcp: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
          },
          udp: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
          },
          icmp: {
            type: null,
            code: null,
          },
        },
        "it should set rule"
      );
    });
    it("should render all as rule protocol", () => {
      assert.deepEqual(
        "ALL",
        craig.vpcs.acls.rules.ruleProtocol.onRender({ ruleProtocol: "all" }),
        "it should return protocol"
      );
    });
    it("should render TCP as rule protocol", () => {
      assert.deepEqual(
        "TCP",
        craig.vpcs.acls.rules.ruleProtocol.onRender({ ruleProtocol: "tcp" }),
        "it should return protocol"
      );
    });
    it("should render empty string as rule protocol", () => {
      assert.deepEqual(
        "",
        craig.vpcs.acls.rules.ruleProtocol.onRender({ ruleProtocol: "" }),
        "it should return protocol"
      );
    });
    it("should return invalid for object when no source", () => {
      assert.isTrue(
        craig.vpcs.acls.rules.source.invalid({}),
        "it should be true"
      );
    });
    it("should return invalid for object when no destination", () => {
      assert.isTrue(
        craig.vpcs.acls.rules.destination.invalid({}),
        "it should be true"
      );
    });
  });
});
