const { state } = require("../../client/src/lib/state");
const { assert } = require("chai");

function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  store.classic_ssh_keys.create({
    name: "example-classic",
    public_key: "1234",
    datacenter: "dal10",
  });
  store.classic_vlans.create({
    name: "vsrx-public",
    datacenter: "dal10",
    type: "PUBLIC",
  });
  store.classic_vlans.create({
    name: "vsrx-private",
    datacenter: "dal10",
    type: "PRIVATE",
  });
  return store;
}

describe("classic gateways", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("classic_gateways.init", () => {
    it("should initialize classic gateways", () => {
      assert.deepEqual(
        craig.store.json.classic_gateways,
        [],
        "it should initialize value"
      );
    });
  });
  describe("classic_gateways.onStoreUpdate", () => {
    beforeEach(() => {
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
    });
    it("should update classic gateway public vlan when deleted", () => {
      craig.classic_vlans.delete(
        {},
        {
          data: {
            name: "vsrx-private",
          },
        }
      );
      assert.deepEqual(craig.store.json.classic_gateways, [
        {
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
          private_vlan: null,
          public_vlan: "vsrx-public",
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        },
      ]);
    });
    it("should update classic gateway private vlan when deleted", () => {
      craig.classic_vlans.delete(
        {},
        {
          data: {
            name: "vsrx-public",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.classic_gateways[0].public_vlan,
        null,
        "it should reset vlan"
      );
    });
    it("should update classic gateway ssh key when deleted", () => {
      craig.classic_ssh_keys.delete(
        {},
        {
          data: {
            name: "example-classic",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.classic_gateways[0].ssh_key,
        null,
        "it should reset ssh key"
      );
    });
  });
  describe("classic_gateways.create", () => {
    beforeEach(() => {
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
    });
    it("should create a new classic gateway", () => {
      assert.deepEqual(
        craig.store.json.classic_gateways,
        [
          {
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
          },
        ],
        "it should create gateway"
      );
    });
  });
  describe("classic_gateways.save", () => {
    beforeEach(() => {
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
    });
    it("should save a classic gateway", () => {
      craig.transit_gateways.gre_tunnels.create(
        {
          tgw: "transit-gateway",
          remote_bgp_asn: 12345,
          zone: 1,
          gateway: "no",
          local_tunnel_ip: "1.2.3.4",
          remote_tunnel_ip: "1.2.3.4",
        },
        {
          innerFormProps: {
            arrayParentName: "transit-gateway",
          },
        }
      );
      craig.classic_gateways.save(
        {
          name: "aaa",
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
        },
        {
          data: {
            name: "gw",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.classic_gateways,
        [
          {
            name: "aaa",
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
          },
        ],
        "it should save gateway"
      );
    });
    it("should save a classic gateway and update gre tunnels with new updated name", () => {
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
      craig.classic_gateways.save(
        {
          name: "aaa",
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
        },
        {
          data: {
            name: "gw",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.transit_gateways[0].gre_tunnels[0].gateway,
        "aaa",
        "it should update gateway name"
      );
      assert.deepEqual(
        craig.store.json.classic_gateways,
        [
          {
            name: "aaa",
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
          },
        ],
        "it should save gateway"
      );
    });
  });
  describe("classic_gateways.delete", () => {
    it("should delete a classic gateway", () => {
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
      craig.classic_gateways.delete({}, { data: { name: "gw" } });
      assert.deepEqual(
        craig.store.json.classic_gateways,
        [],
        "it should delete gateway"
      );
    });
  });
  describe("classic_gateways.schema", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    describe("classic_gateways.name", () => {
      it("should return correct helper text", () => {
        assert.deepEqual(
          craig.classic_gateways.name.helperText(
            { name: "frog" },
            {
              craig: craig,
            }
          ),
          "iac-gateway-frog",
          "it should return correct helper text"
        );
      });
    });
    describe("classic_gateways.domain", () => {
      it("should return false when domain is undefined", () => {
        assert.isTrue(
          craig.classic_gateways.domain.invalid({}),
          "it should be true"
        );
      });
    });
    describe("classic_gateways.datacenter", () => {
      it("should reset private vlan and public vlan when changing datacenter", () => {
        let data = {};
        craig.classic_gateways.datacenter.onStateChange(data);
        assert.deepEqual(
          data,
          { private_vlan: "", public_vlan: "" },
          "it should set to empty string"
        );
      });
    });
    describe("classic_gateways.ssh_key", () => {
      it("should return groups", () => {
        assert.deepEqual(
          craig.classic_gateways.ssh_key.groups({}, { craig: craig }),
          ["example-classic"],
          "it should return list of keys"
        );
      });
    });
    describe("classic_gateways.public_vlan", () => {
      it("should return groups", () => {
        assert.deepEqual(
          craig.classic_gateways.public_vlan.groups(
            { datacenter: "dal10" },
            { craig: craig }
          ),
          ["vsrx-public"],
          "it should return vlans"
        );
      });
      it("should hide when private_network_only", () => {
        assert.isTrue(
          craig.classic_gateways.public_vlan.hideWhen({
            private_network_only: true,
          }),
          "it should be hidden"
        );
      });
    });
    describe("classic_gateways.public_network_only", () => {
      it("should change state data when changing from false to true", () => {
        let data = {
          private_network_only: false,
        };
        craig.classic_gateways.private_network_only.onStateChange(data);
        assert.deepEqual(
          data,
          {
            private_network_only: true,
            public_vlan: "",
          },
          "it should set data"
        );
      });
      it("should change state data when changing from true to false", () => {
        let data = {
          private_network_only: true,
        };
        craig.classic_gateways.private_network_only.onStateChange(data);
        assert.deepEqual(
          data,
          {
            private_network_only: false,
          },
          "it should set data"
        );
      });
    });
  });
});
