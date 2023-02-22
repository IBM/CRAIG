const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { contains } = require("lazy-z");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("vpcs", () => {
  describe("vpcs.save", () => {
    it("should rename a vpc", () => {
      let state = new newState();
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
  });
  describe("vpcs.create", () => {
    it("should create a new vpc with a name and resource group", () => {
      let state = new newState();
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
        address_prefixes: [
          {
            vpc: null,
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vsi-zone-1",
          },
          {
            vpc: null,
            zone: 2,
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
          },
          {
            vpc: null,
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
          },
          {
            vpc: null,
            zone: 1,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-1",
          },
          {
            vpc: null,
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
          },
          {
            vpc: null,
            zone: 3,
            cidr: "10.20.30.0/24",
            name: "vpe-zone-3",
          },
          {
            vpc: null,
            zone: 1,
            cidr: "10.30.10.0/24",
            name: "vpn-zone-1",
          },
        ],
        subnets: [
          {
            vpc: null,
            zone: 1,
            cidr: "10.10.10.0/24",
            name: "vsi-zone-1",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: null,
            zone: 1,
            cidr: "10.10.30.0/24",
            name: "vpn-zone-1",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: null,
            zone: 2,
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: null,
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: null,
            zone: 1,
            cidr: "10.20.10.0/24",
            name: "vpe-zone-1",
            resource_group: "management-rg",
            network_acl: null,
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: null,
            zone: 2,
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: null,
            zone: 3,
            cidr: "10.20.30.0/24",
            name: "vpe-zone-3",
            network_acl: null,
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ],
        public_gateways: [],
        acls: [
          {
            resource_group: "management-rg",
            name: null,
            vpc: null,
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                acl: null,
                vpc: null,
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
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                acl: null,
                vpc: null,
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
              },
              {
                action: "allow",
                destination: "0.0.0.0/0",
                direction: "outbound",
                name: "allow-all-outbound",
                source: "0.0.0.0/0",
                acl: null,
                vpc: null,
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
              },
            ],
          },
        ],
      };
      let actualData = state.store.json.vpcs[2];
      assert.deepEqual(actualData, expectedData, "it should create new vpc");
    });
  });
  describe("vpcs.delete", () => {
    it("should delete a vpc from config", () => {
      let state = new newState();
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
              cidr: "10.50.20.0/24",
              name: "vsi-zone-2",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 3,
              cidr: "10.60.30.0/24",
              name: "vsi-zone-3",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 1,
              cidr: "10.20.10.0/24",
              name: "vpe-zone-1",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 2,
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "workload",
              zone: 3,
              cidr: "10.20.30.0/24",
              name: "vpe-zone-3",
              network_acl: "workload",
              resource_group: "workload-rg",
              public_gateway: false,
              has_prefix: true,
            },
          ],
          public_gateways: [],
          acls: [
            {
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
                },
                {
                  action: "allow",
                  destination: "0.0.0.0/0",
                  direction: "outbound",
                  name: "allow-all-outbound",
                  source: "0.0.0.0/0",
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
  describe("vpcs.subnets", () => {
    describe("vpcs.subnets.save", () => {
      it("should update a subnet in place", () => {
        let state = new newState();
        state.vpcs.subnets.save(
          {
            name: "frog",
          },
          {
            name: "management",
            subnet: { name: "vpn-zone-1" },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].name,
          "frog",
          "it should be frog"
        );
      });
      it("should update a subnet in place", () => {
        let state = new newState();
        state.vpcs.subnets.save(
          {
            name: "frog",
            acl_name: "",
          },
          {
            name: "management",
            subnet: { name: "vpn-zone-1" },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].acl_name,
          null,
          "it should be null"
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
            name: "management",
            subnet: {
              name: "vpn-zone-1",
            },
          }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].subnets[1].cidr,
          "1.2.3.4/32",
          "it should be frog"
        );
      });
    });
    describe("vpcs.subnets.delete", () => {
      it("should delete a subnet from a vpc", () => {
        let state = new newState();
        state.setUpdateCallback(() => {});
        state.vpcs.subnets.delete(
          {},
          {
            name: "management",
            subnet: {
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
  });
  describe("vpcs.subnetTiers", () => {
    describe("vpcs.subnetTiers.save", () => {
      it("should update a subnet tier in place", () => {
        let vpcState = newState();
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
            cidr: "10.10.20.0/24",
            name: "frog-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
          },
          {
            vpc_name: "management",
            tier: { name: "vsi" },
          }
        );

        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier in place with nacl and gateway", () => {
        let vpcState = newState();
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
            cidr: "10.10.20.0/24",
            name: "frog-zone-2",
            network_acl: "todd",
            resource_group: "management-rg",
            public_gateway: true,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
            tier: { name: "vsi" },
            config: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
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
            cidr: "10.10.20.0/24",
            name: "frog-zone-2",
            network_acl: "todd",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
            tier: { name: "vsi" },
            config: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
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
        let vpcState = newState();
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
            tier: { name: "vpn" },
          }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should update a subnet tier in place with additional zones and with no acl and 1 zone pgw", () => {
        let vpcState = newState();
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
            tier: { name: "vpn" },
            config: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
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
        let vpcState = newState();
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
            tier: { name: "vpn" },
            config: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
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
        let vpcState = newState();
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
            tier: { name: "f5-bastion" },
            config: {
              store: {
                json: {
                  vpcs: [
                    {
                      name: "management",
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
    });
    describe("vpcs.subnetTiers.create", () => {
      it("should add a subnet tier to vpc", () => {
        let vpcState = new newState();
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
        let vpcState = new newState();
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
        let vpcState = new newState();
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
            cidr: "10.10.20.0/24",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.10.30.0/24",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.20.10.0/24",
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
            cidr: "10.20.30.0/24",
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
    });
    describe("vpcs.subnetTiers.delete", () => {
      it("should delete a subnet tier", () => {
        let vpcState = new newState();
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
            cidr: "10.20.30.0/24",
            name: "vpe-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.40.0/24",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
        ];
        vpcState.vpcs.subnetTiers.delete(
          {},
          { vpc_name: "management", tier: { name: "vsi" } }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
        );
      });
      it("should delete a subnet tier and leave F5 subnets in place", () => {
        let vpcState = new newState();
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
            cidr: "10.20.30.0/24",
            name: "vpe-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.40.0/24",
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
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 1,
          },
          {
            cidr: "10.6.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-2",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 2,
          },
          {
            cidr: "10.7.60.0/24",
            has_prefix: true,
            name: "f5-bastion-zone-3",
            network_acl: "management",
            public_gateway: false,
            resource_group: "edge-rg",
            vpc: "edge",
            zone: 3,
          },
        ];
        vpcState.vpcs.subnetTiers.delete(
          { name: "vsi", zones: 3 },
          { vpc_name: "management", tier: { name: "vsi", zones: 3 } }
        );
        assert.deepEqual(
          vpcState.store.json.vpcs[0].subnets,
          expectedData,
          "it should change subnets"
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
          { data: { name: "management" }, arrayParentName: "management" }
        );
        let expectedData = [];
        assert.deepEqual(
          state.store.json.vpcs[0].acls,
          expectedData,
          "it should delete acl"
        );
      });
      it("should set subnet acls to null on delete", () => {
        let state = newState();
        state.vpcs.acls.delete(
          {},
          { data: { name: "management" }, arrayParentName: "management" }
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
              cidr: "10.10.20.0/24",
              name: "vsi-zone-2",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 3,
              cidr: "10.10.30.0/24",
              name: "vsi-zone-3",
              network_acl: null,
              resource_group: "management-rg",
              public_gateway: false,
              has_prefix: true,
            },
            {
              vpc: "management",
              zone: 1,
              cidr: "10.20.10.0/24",
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
              cidr: "10.20.30.0/24",
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
        state.vpcs.acls.save(
          { name: "new" },
          { data: { name: "management" }, arrayParentName: "management" }
        );
        assert.deepEqual(
          state.store.json.vpcs[0].acls[0].name,
          "new",
          "it should update acl"
        );
      });
      it("should update an acl with no name change", () => {
        let state = newState();
        state.vpcs.acls.save(
          { name: "management", resource_group: "workload-rg" },
          { data: { name: "management" }, arrayParentName: "management" }
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
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
            },
            {
              acl: "management",
              vpc: "management",
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
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
              data: { name: "allow-all-outbound" },
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
            },
            {
              vpc_name: "management",
              parent_name: "management",
              data: { name: "allow-all-outbound" },
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
                port_max: 8080,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
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
              data: { name: "allow-all-outbound" },
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
                port_min: null,
                port_max: 8080,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
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
              data: { name: "allow-all-outbound" },
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
                port_max: 8080,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
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
              data: { name: "allow-all-outbound" },
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
});
