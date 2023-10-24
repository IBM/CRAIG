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
  describe("classic_gateways.init", () => {
    it("should initialize classic gateways", () => {
      let craig = newState();
      assert.deepEqual(
        craig.store.json.classic_gateways,
        [],
        "it should initialize value"
      );
    });
  });
  describe("classic_gateways.onStoreUpdate", () => {
    it("should update classic gateway public vlan when deleted", () => {
      let craig = newState();
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
      let craig = newState();
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
      craig.classic_vlans.delete(
        {},
        {
          data: {
            name: "vsrx-public",
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
          private_vlan: "vsrx-private",
          public_vlan: null,
          ssh_key: "example-classic",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        },
      ]);
    });
    it("should update classic gateway ssh key when deleted", () => {
      let craig = newState();
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
      craig.classic_ssh_keys.delete(
        {},
        {
          data: {
            name: "example-classic",
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
          private_vlan: "vsrx-private",
          public_vlan: "vsrx-public",
          ssh_key: null,
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          hadr: false,
        },
      ]);
    });
  });
  describe("classic_gateways.create", () => {
    it("should create a new classic gateway", () => {
      let craig = newState();
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
    it("should save a classic gateway", () => {
      let craig = newState();
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
  });
  describe("classic_gateways.delete", () => {
    it("should delete a classic gateway", () => {
      let craig = newState();
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
});
