const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("transit_gateways", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("transit_gateways.init", () => {
    it("should initialize default transit gateway as an array", () => {
      assert.deepEqual(
        craig.store.json.transit_gateways,
        [
          {
            name: "transit-gateway",
            resource_group: "service-rg",
            global: false,
            connections: [
              {
                tgw: "transit-gateway",
                vpc: "management",
              },
              {
                tgw: "transit-gateway",
                vpc: "workload",
              },
            ],
          },
        ],
        "it should be equal"
      );
    });
  });
  describe("transit_gateways.onStoreUpdate", () => {
    it("should remove a connection when a vpc is deleted", () => {
      craig.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        craig.store.json.transit_gateways[0].connections,
        [{ tgw: "transit-gateway", vpc: "workload" }],
        "it should only have one connection"
      );
    });
    it("should remove a connection when a power vs workspace is deleted", () => {
      craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
      craig.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      craig.transit_gateways.save(
        {
          connections: [
            { tgw: "todd", vpc: "management" },
            { tgw: "todd", vpc: "workload" },
            { tgw: "transit-gateway", power: "toad" },
          ],
        },
        {
          data: {
            name: "transit-gateway",
          },
        }
      );
      craig.power.delete(
        {},
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.transit_gateways[0].connections,
        [
          { tgw: "transit-gateway", vpc: "management" },
          { tgw: "transit-gateway", vpc: "workload" },
        ],
        "it should only have correct connections"
      );
    });
    it("should remove a connection when a power vs workspace is not in an edge enabled zone", () => {
      craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
      craig.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      craig.transit_gateways.save(
        {
          connections: [
            { tgw: "todd", vpc: "management" },
            { tgw: "todd", vpc: "workload" },
            { tgw: "transit-gateway", power: "toad" },
          ],
        },
        {
          data: {
            name: "transit-gateway",
          },
        }
      );
      craig.power.save(
        {
          name: "toad",
          imageNames: ["7100-05-09"],
          zone: "dal13",
        },
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.transit_gateways[0].connections,
        [
          { tgw: "transit-gateway", vpc: "management" },
          { tgw: "transit-gateway", vpc: "workload" },
        ],
        "it should only have correct connections"
      );
    });
    it("should add a connection when crns is provided", () => {
      craig.transit_gateways.save(
        { name: "todd", resource_group: "management-rg", crns: ["crn"] },
        { data: { name: "transit-gateway" } }
      );

      assert.deepEqual(
        craig.store.json.transit_gateways[0].connections,
        [
          { tgw: "todd", vpc: "management" },
          { tgw: "todd", vpc: "workload" },
          { tgw: "todd", crn: "crn" },
        ],
        "it should have a crn connection"
      );
    });
    it("should add a connection when crns is provided and adding a second one", () => {
      craig.transit_gateways.save(
        { name: "todd", resource_group: "management-rg", crns: ["crn"] },
        { data: { name: "transit-gateway" } }
      );
      craig.transit_gateways.save(
        {
          name: "todd",
          resource_group: "management-rg",
          crns: ["crn", "crn2"],
        },
        { data: { name: "todd" } }
      );

      assert.deepEqual(
        craig.store.json.transit_gateways[0].connections,
        [
          { tgw: "todd", vpc: "management" },
          { tgw: "todd", vpc: "workload" },
          { tgw: "todd", crn: "crn" },
          { tgw: "todd", crn: "crn2" },
        ],
        "it should have a crn connection"
      );
    });
    it("should remove a crn connection when a crn is removed", () => {
      craig.transit_gateways.save(
        { name: "todd", resource_group: "management-rg", crns: ["crn"] },
        { data: { name: "transit-gateway" } }
      );
      craig.transit_gateways.save(
        {
          name: "todd",
          resource_group: "management-rg",
          crns: ["crn", "crn2"],
        },
        { data: { name: "todd" } }
      );

      craig.transit_gateways.save(
        {
          name: "todd",
          resource_group: "management-rg",
          crns: ["crn"],
        },
        { data: { name: "todd" } }
      );

      assert.deepEqual(
        craig.store.json.transit_gateways[0].connections,
        [
          { tgw: "todd", vpc: "management" },
          { tgw: "todd", vpc: "workload" },
          { tgw: "todd", crn: "crn" },
        ],
        "it should have a crn connection"
      );
    });
    it("should not remove crn connections", () => {
      craig.store.json.transit_gateways[0].connections[0].crn = "crn";
      delete craig.store.json.transit_gateways[0].connections[0].vpc;
      craig.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        craig.store.json.transit_gateways[0].connections,
        [
          { tgw: "transit-gateway", crn: "crn" },
          { tgw: "transit-gateway", vpc: "workload" },
        ],
        "it should only have one connection"
      );
    });
    it("should set resource group to null if deleted", () => {
      craig.resource_groups.delete({}, { data: { name: "service-rg" } });
      assert.deepEqual(
        craig.store.json.transit_gateways[0].resource_group,
        null,
        "it should be null"
      );
    });
  });
  describe("transit_gateways.create", () => {
    it("should create a new transit gateway", () => {
      craig.transit_gateways.create({
        use_data: true,
        name: "tg-test",
        resource_group: "management-rg",
        global: false,
        connections: [{ tgw: "tg-test", vpc: "management" }],
      });
      let expectedData = {
        use_data: true,
        name: "tg-test",
        resource_group: "management-rg",
        global: false,
        connections: [{ tgw: "tg-test", vpc: "management" }],
        gre_tunnels: [],
        prefix_filters: [],
      };
      assert.deepEqual(
        craig.store.json.transit_gateways[1],
        expectedData,
        "it should be second tg"
      );
    });
  });
  describe("transit_gateways.save", () => {
    it("should update transit gateway", () => {
      craig.transit_gateways.save(
        { name: "todd", resource_group: "management-rg" },
        { data: { name: "transit-gateway" } }
      );
      assert.deepEqual(
        craig.store.json.transit_gateways[0].name,
        "todd",
        "it should change name and rg"
      );
    });
  });
  describe("transit_gateways.delete", () => {
    it("should delete transit gateway", () => {
      craig.transit_gateways.delete({}, { data: { name: "transit-gateway" } });
      assert.deepEqual(
        craig.store.json.transit_gateways,
        [],
        "it should be empty"
      );
    });
  });
  describe("transit_gateways.schema", () => {
    describe("resource_groups", () => {
      describe("groups", () => {
        it("should return resource groups", () => {
          assert.deepEqual(
            craig.transit_gateways.resource_group.groups({}, { craig: craig }),
            ["service-rg", "management-rg", "workload-rg"],
            "it should return correct data"
          );
        });
        it("should not have invalid resource group when use data", () => {
          assert.isFalse(
            craig.transit_gateways.resource_group.invalid({ use_data: true }),
            "it should be invalid"
          );
        });
      });
      describe("hideWhen", () => {
        it("should return resource groups", () => {
          assert.isTrue(
            craig.transit_gateways.resource_group.hideWhen(
              { use_data: true },
              { craig: craig }
            ),
            "it should return correct data"
          );
        });
      });
    });
    describe("vpc_connections", () => {
      describe("groups", () => {
        it("should return groups", () => {
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.groups({}, { craig: craig }),
            ["management", "workload"],
            "it should return correct groups"
          );
        });
        it("should return groups when tgw is global and management is already attached to a different global transit gateway", () => {
          craig.transit_gateways.create({
            name: "transit-gateway2",
            resource_group: "service-rg",
            global: true,
            connections: [
              {
                tgw: "transit-gateway",
                vpc: "management",
              },
            ],
          });
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.groups(
              {
                global: true,
                connections: [],
              },
              {
                craig: craig,
                data: {
                  name: "transit-gateway",
                },
              }
            ),
            ["workload"],
            "it should return correct groups"
          );
        });
        it("should return groups when tgw is local and management is already attached to a different local transit gateway", () => {
          craig.transit_gateways.create({
            name: "transit-gateway2",
            resource_group: "service-rg",
            global: false,
            connections: [
              {
                tgw: "transit-gateway",
                vpc: "management",
              },
            ],
          });
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.groups(
              {
                global: false,
                connections: [],
              },
              {
                craig: craig,
                data: {
                  name: "transit-gateway",
                },
              }
            ),
            ["management", "workload"],
            "it should return correct groups"
          );
        });
        it("should return groups when tgw is local and management is already attached to a different local transit gateway in modal", () => {
          craig.transit_gateways.save(
            {
              connections: [
                {
                  tgw: "transit-gateway",
                  vpc: "management",
                },
              ],
            },
            { data: { name: "transit-gateway" } }
          );
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.groups(
              {
                global: false,
                connections: [],
              },
              {
                craig: craig,
                isModal: true,
              }
            ),
            ["management", "workload"],
            "it should return correct groups"
          );
        });
        it("should set connections on input change for global", () => {
          let data = {
            global: false,
          };
          craig.transit_gateways.global.onInputChange(data);
          assert.deepEqual(
            data,
            {
              connections: [],
              global: false,
            },
            "it should set data"
          );
        });
        it("should set connections when enabling classic connections", () => {
          let data = {
            classic: false,
            connections: [{ tgw: "transit-gateway", vpc: "vpc" }],
            name: "transit-gateway",
          };
          craig.transit_gateways.classic.onStateChange(data);
          assert.deepEqual(
            data,
            {
              classic: true,
              connections: [
                { tgw: "transit-gateway", vpc: "vpc" },
                { tgw: "transit-gateway", classic: true },
              ],
              name: "transit-gateway",
            },
            "it should add a classic connection"
          );
        });
        it("should set connections when disabling classic connections", () => {
          let data = {
            classic: true,
            connections: [
              { tgw: "transit-gateway", vpc: "vpc" },
              { tgw: "transit-gateway", classic: true },
            ],
            name: "transit-gateway",
          };
          craig.transit_gateways.classic.onStateChange(data);
          assert.deepEqual(
            data,
            {
              classic: false,
              connections: [{ tgw: "transit-gateway", vpc: "vpc" }],
              name: "transit-gateway",
            },
            "it should remove a classic connection"
          );
        });
        it("should have force update key for connections", () => {
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.forceUpdateKey({
              global: true,
            }),
            "true",
            "it should have correct force update key"
          );
          assert.deepEqual(
            craig.transit_gateways.power_connections.forceUpdateKey({
              global: true,
            }),
            "true",
            "it should have correct force update key"
          );
        });
      });
      describe("onRender", () => {
        it("should return string list of vpc values", () => {
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.onRender(
              {
                connections: [
                  {
                    tgw: "hi",
                    vpc: "toad",
                  },
                  {
                    tgw: "hi",
                    power: "yeah",
                  },
                ],
              },
              {
                craig: craig,
              }
            ),
            ["toad"],
            "it should return correct list"
          );
        });
      });
      describe("onStateChange", () => {
        it("should return correct data on state change", () => {
          let stateData = {
            name: "tgw",
            connections: [
              {
                tgw: "tgw",
                power: "power",
              },
            ],
            vpc_connections: ["frog"],
          };
          craig.transit_gateways.vpc_connections.onStateChange(stateData);
          assert.deepEqual(
            stateData,
            {
              connections: [
                { power: "power", tgw: "tgw" },
                {
                  vpc: "frog",
                  tgw: "tgw",
                },
              ],
              name: "tgw",
            },
            "it should return correct data"
          );
        });
      });
    });
    describe("power_connections", () => {
      describe("groups", () => {
        it("should return groups", () => {
          craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
          craig.power.create({
            name: "power",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.power.create({
            name: "power-also",
            zone: "dal13",
            images: [],
            imageNames: [],
          });
          assert.deepEqual(
            craig.transit_gateways.power_connections.groups(
              {},
              { craig: craig }
            ),
            ["power"],
            "it should return correct groups"
          );
        });
        it("should return groups when one power workspace is attached to a different transit gateway with the same global setting in modal", () => {
          craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
          craig.power.create({
            name: "power",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.power.create({
            name: "power-also",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.transit_gateways.create({
            name: "transit-gateway2",
            resource_group: "service-rg",
            global: false,
            connections: [
              {
                tgw: "transit-gateway",
                power: "power-also",
              },
            ],
          });
          assert.deepEqual(
            craig.transit_gateways.power_connections.groups(
              { global: false },
              { craig: craig, isModal: true }
            ),
            ["power", "power-also"],
            "it should return correct groups"
          );
        });
        it("should return groups when one power workspace is attached to a different transit gateway with the same global setting as form", () => {
          craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
          craig.power.create({
            name: "power",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.power.create({
            name: "power-also",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.transit_gateways.create({
            name: "transit-gateway2",
            resource_group: "service-rg",
            global: true,
            connections: [
              {
                tgw: "transit-gateway",
                power: "power-also",
              },
            ],
          });
          assert.deepEqual(
            craig.transit_gateways.power_connections.groups(
              { global: true },
              {
                craig: craig,
                data: {
                  name: "transit-gateway",
                },
              }
            ),
            ["power"],
            "it should return correct groups"
          );
        });
      });
      describe("onRender", () => {
        it("should return string list of vpc values", () => {
          assert.deepEqual(
            craig.transit_gateways.power_connections.onRender({
              connections: [
                {
                  tgw: "hi",
                  power: "toad",
                },
                {
                  tgw: "hi",
                  vpc: "frog",
                },
              ],
            }),
            ["toad"],
            "it should return correct list"
          );
        });
      });
      describe("onStateChange", () => {
        it("should return correct data on state change", () => {
          let stateData = {
            name: "tgw",
            connections: [
              {
                tgw: "tgw",
                vpc: "frog",
              },
              {
                tgw: "tgw",
                power: "power-also",
              },
            ],
            power_connections: ["power", "power-also"],
          };
          craig.transit_gateways.power_connections.onStateChange(stateData);
          assert.deepEqual(
            {
              connections: [
                {
                  vpc: "frog",
                  tgw: "tgw",
                },
                { power: "power", tgw: "tgw" },
                {
                  tgw: "tgw",
                  power: "power-also",
                },
              ],
              name: "tgw",
            },
            stateData,
            "it should return correct data"
          );
        });
      });
    });
    describe("crns", () => {
      describe("invalidText", () => {
        it("should return true when invalid crn in list", () => {
          assert.isTrue(
            craig.transit_gateways.crns.invalidText({
              crns: ["crn:v1:bluemix:public:abcdf", "mooseeeeeeeeeeeeeeeeee"],
            })
          );
          assert.isFalse(
            craig.transit_gateways.crns.invalidText({
              crns: undefined,
            })
          );
        });
      });
    });
  });
  describe("transit_gateways.gre_tunnels", () => {
    describe("transit_gateways.gre_tunnels.create", () => {
      it("should create a gre tunnel", () => {
        craig.update();
        craig.transit_gateways.gre_tunnels.create(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "transit-gateway",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.transit_gateways[0].gre_tunnels[0],
          {
            gateway: null,
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          "it should remove unfound gateway and create tunnel"
        );
      });
      it("should create a gre tunnel with gateway", () => {
        craig.classic_gateways.create({
          name: "gw",
          hostname: "gw-host",
          datacenter: "dal10",
          network_speed: "1000",
          private_network_only: false,
          tcp_monitoring: false,
          redundant_network: true,
          public_bandwidth: 5000,
          memory: 64,
          notes: "Notes",
          ipv6_enabled: false,
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vsrx-private",
          public_vlan: "vsrx-public",
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        });
        craig.transit_gateways.gre_tunnels.create(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "transit-gateway",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.transit_gateways[0].gre_tunnels[0],
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          "it should create tunnel"
        );
      });
    });
    describe("transit_gateways.gre_tunnels.save", () => {
      it("should update a gre tunnel with gateway", () => {
        craig.classic_gateways.create({
          name: "gw",
          hostname: "gw-host",
          datacenter: "dal10",
          network_speed: "1000",
          private_network_only: false,
          tcp_monitoring: false,
          redundant_network: true,
          public_bandwidth: 5000,
          memory: 64,
          notes: "Notes",
          ipv6_enabled: false,
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vsrx-private",
          public_vlan: "vsrx-public",
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        });
        craig.transit_gateways.gre_tunnels.create(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "transit-gateway",
            },
          }
        );
        craig.transit_gateways.gre_tunnels.save(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 2,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
            name: "frog",
          },
          {
            arrayParentName: "transit-gateway",
            data: {
              gateway: "gw",
            },
          }
        );
        craig.transit_gateways.gre_tunnels.save(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 2,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
            name: "frog",
          },
          {
            arrayParentName: "transit-gateway",
            data: {
              gateway: "gw",
              name: "frog",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.transit_gateways[0].gre_tunnels[0],
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 2,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
            name: "frog",
          },
          "it should create tunnel"
        );
      });
    });
    describe("transit_gateways.gre_tunnels.delete", () => {
      it("should delete a gre tunnel with gateway", () => {
        craig.classic_gateways.create({
          name: "gw",
          hostname: "gw-host",
          datacenter: "dal10",
          network_speed: "1000",
          private_network_only: false,
          tcp_monitoring: false,
          redundant_network: true,
          public_bandwidth: 5000,
          memory: 64,
          notes: "Notes",
          ipv6_enabled: false,
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vsrx-private",
          public_vlan: "vsrx-public",
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        });
        craig.transit_gateways.gre_tunnels.create(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "transit-gateway",
            },
          }
        );
        craig.transit_gateways.gre_tunnels.delete(
          {},
          {
            arrayParentName: "transit-gateway",
            data: {
              gateway: "gw",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.transit_gateways[0].gre_tunnels,
          [],
          "it should create tunnel"
        );
      });
      it("should delete a gre tunnel with name", () => {
        craig.classic_gateways.create({
          name: "gw",
          hostname: "gw-host",
          datacenter: "dal10",
          network_speed: "1000",
          private_network_only: false,
          tcp_monitoring: false,
          redundant_network: true,
          public_bandwidth: 5000,
          memory: 64,
          notes: "Notes",
          ipv6_enabled: false,
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vsrx-private",
          public_vlan: "vsrx-public",
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        });
        craig.transit_gateways.gre_tunnels.create(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            name: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "transit-gateway",
            },
          }
        );
        craig.transit_gateways.gre_tunnels.delete(
          {},
          {
            arrayParentName: "transit-gateway",
            data: {
              name: "gw",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.transit_gateways[0].gre_tunnels,
          [],
          "it should create tunnel"
        );
      });
      it("should delete a gre tunnel with null gateway", () => {
        craig.classic_gateways.create({
          name: "gw",
          hostname: "gw-host",
          datacenter: "dal10",
          network_speed: "1000",
          private_network_only: false,
          tcp_monitoring: false,
          redundant_network: true,
          public_bandwidth: 5000,
          memory: 64,
          notes: "Notes",
          ipv6_enabled: false,
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vsrx-private",
          public_vlan: "vsrx-public",
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        });
        craig.classic_gateways.create({
          name: "gw2",
          hostname: "gw-host",
          datacenter: "dal10",
          network_speed: "1000",
          private_network_only: false,
          tcp_monitoring: false,
          redundant_network: true,
          public_bandwidth: 5000,
          memory: 64,
          notes: "Notes",
          ipv6_enabled: false,
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vsrx-private",
          public_vlan: "vsrx-public",
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        });
        craig.transit_gateways.gre_tunnels.create(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            gateway: "gw",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "transit-gateway",
            },
          }
        );
        craig.transit_gateways.gre_tunnels.create(
          {
            tgw: "transit-gateway",
            remote_bgp_asn: 12345,
            zone: 1,
            gateway: "gw2",
            local_tunnel_ip: "1.2.3.4",
            remote_tunnel_ip: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "transit-gateway",
            },
          }
        );
        craig.classic_gateways.delete({}, { data: { name: "gw" } });
        craig.transit_gateways.gre_tunnels.delete(
          {},
          {
            arrayParentName: "transit-gateway",
            data: {
              gateway: null,
            },
          }
        );
        assert.deepEqual(
          craig.store.json.transit_gateways[0].gre_tunnels,
          [
            {
              gateway: "gw2",
              local_tunnel_ip: "1.2.3.4",
              remote_bgp_asn: 12345,
              remote_tunnel_ip: "1.2.3.4",
              tgw: "transit-gateway",
              zone: 1,
            },
          ],
          "it should create tunnel"
        );
      });
    });
    describe("transit_gateways.gre_tunnels.schema", () => {
      describe("transit_gateways.gre_tunnels.schema.local_tunnel_ip", () => {
        describe("transit_gateways.gre_tunnels.schema.local_tunnel_ip.invalid", () => {
          it("should return true if not an ipv4 address", () => {
            assert.isTrue(
              craig.transit_gateways.gre_tunnels.local_tunnel_ip.invalid({
                local_tunnel_ip: "aa",
              }),
              "it should be invalid"
            );
          });
          it("should return true if an ipv4 cidr address", () => {
            assert.isTrue(
              craig.transit_gateways.gre_tunnels.local_tunnel_ip.invalid({
                local_tunnel_ip: "10.10.10.10/10",
              }),
              "it should be invalid"
            );
          });
        });
        describe("transit_gateways.gre_tunnels.schema.local_tunnel_ip.invalidText", () => {
          it("should return invalid text", () => {
            assert.deepEqual(
              craig.transit_gateways.gre_tunnels.local_tunnel_ip.invalidText(),
              "Enter a valid IP address",
              "it should be invalid"
            );
          });
        });
      });
    });
  });
  describe("transit_gateways.prefix_filters.create", () => {
    it("should create a prefix filter", () => {
      craig.update();
      craig.transit_gateways.prefix_filters.create(
        {
          name: "my-cool-filter",
          tgw: "transit-gateway",
          connection_type: "vpc",
          target: "management",
          action: "permit",
          prefix: "10.10.10.10/10",
          le: 0,
          ge: 32,
        },
        {
          innerFormProps: {
            arrayParentName: "transit-gateway",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.transit_gateways[0].prefix_filters,
        [
          {
            name: "my-cool-filter",
            tgw: "transit-gateway",
            connection_type: "vpc",
            target: "management",
            action: "permit",
            prefix: "10.10.10.10/10",
            le: 0,
            ge: 32,
          },
        ],
        "it should create a gatway"
      );
    });
  });
  describe("transit_gateways.prefix_filters.save", () => {
    it("should create a prefix filter", () => {
      craig.update();
      craig.transit_gateways.prefix_filters.create(
        {
          name: "my-cool-filter",
          tgw: "transit-gateway",
          connection_type: "vpc",
          target: "management",
          action: "permit",
          prefix: "10.10.10.10/10",
          le: 0,
          ge: 32,
        },
        {
          innerFormProps: {
            arrayParentName: "transit-gateway",
          },
        }
      );
      craig.transit_gateways.prefix_filters.save(
        {
          name: "oops",
          tgw: "transit-gateway",
          connection_type: "vpc",
          target: "management",
          action: "permit",
          prefix: "10.10.10.10/10",
          le: 0,
          ge: 32,
        },
        {
          arrayParentName: "transit-gateway",

          data: {
            name: "my-cool-filter",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.transit_gateways[0].prefix_filters[0].name,
        "oops",
        "it should create a gatway"
      );
    });
  });
  describe("transit_gateways.prefix_filters.delete", () => {
    it("should create a prefix filter", () => {
      craig.update();
      craig.transit_gateways.prefix_filters.create(
        {
          name: "my-cool-filter",
          tgw: "transit-gateway",
          connection_type: "vpc",
          target: "management",
          action: "permit",
          prefix: "10.10.10.10/10",
          le: 0,
          ge: 32,
        },
        {
          innerFormProps: {
            arrayParentName: "transit-gateway",
          },
        }
      );
      craig.transit_gateways.prefix_filters.delete(
        {
          tgw: "transit-gateway",
          connection_type: "vpc",
          target: "management",
          action: "permit",
          prefix: "10.10.10.10/10",
          le: 0,
          ge: 32,
        },
        {
          arrayParentName: "transit-gateway",
          data: {
            name: "my-cool-filter",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.transit_gateways[0].prefix_filters,
        [],
        "it should create a gatway"
      );
    });
  });
  describe("transit_gateways.prefix_filters.shouldDisableSave", () => {
    it("should return true if a prefix filter has an invalid duplicate name", () => {
      craig.update();
      craig.transit_gateways.prefix_filters.create(
        {
          name: "my-cool-filter",
          tgw: "transit-gateway",
          connection_type: "vpc",
          target: "management",
          action: "permit",
          prefix: "10.10.10.10/10",
          le: 0,
          ge: 32,
        },
        {
          innerFormProps: {
            arrayParentName: "transit-gateway",
          },
        }
      );
      assert.isTrue(
        craig.transit_gateways.prefix_filters.name.invalid(
          { name: "my-cool-filter" },
          { arrayParentName: "transit-gateway", craig: craig }
        ),
        "it should return true"
      );
    });
  });
  describe("transit_gateways.prefix_filters.schema", () => {
    describe("transit_gateways.prefix_filters.connection_type", () => {
      describe("transit_gateways.prefix_filters.connection_type.invalid", () => {
        it("should return true if is null or empty string", () => {
          assert.isTrue(
            craig.transit_gateways.prefix_filters.connection_type.invalid({
              connection_type: "",
            }),
            "it should be invalid"
          );
        });
      });
      describe("transit_gateways.prefix_filters.connection_type.onStateChange", () => {
        it("should set target to empty string", () => {
          let data = {
            connection_type: "",
          };
          craig.transit_gateways.prefix_filters.connection_type.onStateChange(
            data
          ),
            assert.deepEqual(
              data,
              {
                connection_type: "",
                target: "",
              },
              "it should be invalid"
            );
        });
      });
    });
    describe("transit_gateways.prefix_filters.le", () => {
      describe("transit_gateways.prefix_filters.le.invalidText", () => {
        it("should return correct invalid text", () => {
          assert.deepEqual(
            craig.transit_gateways.prefix_filters.le.invalidText(),
            "Enter a whole number",
            "it should return correct text"
          );
        });
      });
      describe("transit_gateways.prefix_filters.le.invalid", () => {
        it("should return true when not a whole number", () => {
          assert.isTrue(
            craig.transit_gateways.prefix_filters.le.invalid({ le: "a" }),
            "it should return correct text"
          );
        });
        it("should return true when not a whole number", () => {
          assert.isTrue(
            craig.transit_gateways.prefix_filters.le.invalid({ le: "1a" }),
            "it should return correct text"
          );
        });
      });
    });
    describe("transit_gateways.prefix_filters.action", () => {
      describe("transit_gateways.prefix_filters.action.invalidText", () => {
        it("should return correct invalid text", () => {
          assert.deepEqual(
            craig.transit_gateways.prefix_filters.action.invalidText(),
            "Select an action",
            "it should return correct text"
          );
        });
      });
    });
    describe("transit_gateways.prefix_filters.prefix", () => {
      describe("transit_gateways.prefix_filters.prefix.invalid", () => {
        it("should return true when not a cidr block", () => {
          assert.isTrue(
            craig.transit_gateways.prefix_filters.prefix.invalid({
              prefix: "aaaa",
            }),
            "it should return correct text"
          );
        });
        it("should return true when not a cidr block", () => {
          assert.isTrue(
            craig.transit_gateways.prefix_filters.prefix.invalid({}),
            "it should return correct text"
          );
        });
        it("should return true when an ipv4 address but not a cidr block", () => {
          assert.isTrue(
            craig.transit_gateways.prefix_filters.prefix.invalid({
              prefix: "1.2.3.4",
            }),
            "it should return correct text"
          );
        });
      });
      describe("transit_gateways.prefix_filters.prefix.invalidText", () => {
        it("should return correct invalid text", () => {
          assert.deepEqual(
            craig.transit_gateways.prefix_filters.prefix.invalidText(),
            "Enter a valid IPV4 CIDR Block",
            "it should return correct text"
          );
        });
      });
    });
    describe("transit_gateways.prefix_filters.target", () => {
      describe("transit_gateways.prefix_filters.target.groups", () => {
        it("should return correct connection types for no connection type", () => {
          assert.deepEqual(
            craig.transit_gateways.prefix_filters.target.groups(
              { connection_type: "" },
              { craig: craig, arrayParentName: "transit-gateway" }
            ),
            [],
            "it should return valid connections"
          );
        });
        it("should return correct connection types for vpc", () => {
          craig.store.json.transit_gateways[0].connections.push({
            tgw: "transit-gateway",
            power: "toad",
          });
          assert.deepEqual(
            craig.transit_gateways.prefix_filters.target.groups(
              { connection_type: "VPC" },
              { craig: craig, arrayParentName: "transit-gateway" }
            ),
            ["management", "workload"],
            "it should return valid connections"
          );
        });
        it("should return correct connection types for gre", () => {
          craig.update();
          assert.deepEqual(
            craig.transit_gateways.prefix_filters.target.groups(
              { connection_type: "GRE Tunnel" },
              { craig: craig, arrayParentName: "transit-gateway" }
            ),
            [],
            "it should return valid connections"
          );
        });
        it("should return correct connection types for power", () => {
          craig.power.create({
            name: "toad",
            imageNames: ["7100-05-09"],
            zone: "dal10",
          });
          craig.store.json.transit_gateways[0].connections.push({
            tgw: "transit-gateway",
            power: "toad",
          });

          assert.deepEqual(
            craig.transit_gateways.prefix_filters.target.groups(
              { connection_type: "Power VS" },
              { craig: craig, arrayParentName: "transit-gateway" }
            ),
            ["toad"],
            "it should return valid connections"
          );
        });
      });
    });
  });
});
