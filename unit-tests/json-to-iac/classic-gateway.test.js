const { assert } = require("chai");
const {
  formatNetworkGateway,
  classicGatewayTf,
} = require("../../client/src/lib/json-to-iac/classic-gateway");

describe("network gatway json to tf", () => {
  describe("formatNetworkGateway", () => {
    it("should return a network gateway with one member", () => {
      let actualData = formatNetworkGateway({
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
        private_vlan: "example-classic-private",
        public_vlan: "example-classic-public",
        ssh_key: "example-classic",
        disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
        hadr: false,
      });
      let expectedData = `
resource "ibm_network_gateway" "classic_gateway_gw" {
  name = "\${var.prefix}-gw"
  members {
    hostname             = "gw-host-1"
    datacenter           = "dal10"
    network_speed        = "1000"
    private_network_only = false
    tcp_monitoring       = false
    redundant_network    = true
    public_bandwidth     = 5000
    memory               = 64
    notes                = "Notes"
    ipv6_enabled         = false
    private_vlan         = ibm_network_vlan.classic_vlan_example_classic_private.id
    public_vlan          = ibm_network_vlan.classic_vlan_example_classic_public.id
    package_key_name     = "VIRTUAL_ROUTER_APPLIANCE_1_GPBS"
    os_key_name          = "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV"
    process_key_name     = "INTEL_XEON_4210_2_20"
    ssh_key_ids = [
      ibm_compute_ssh_key.classic_ssh_key_example_classic.id
    ]
    disk_key_names = [
      "HARD_DRIVE_2_00_TB_SATA_2"
    ]
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return properly formatted gw"
      );
    });
    it("should return a network gateway with two members", () => {
      let actualData = formatNetworkGateway({
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
        private_vlan: "example-classic-private",
        public_vlan: "example-classic-public",
        ssh_key: "example-classic",
        disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
        hadr: true,
      });
      let expectedData = `
resource "ibm_network_gateway" "classic_gateway_gw" {
  name = "\${var.prefix}-gw"
  members {
    hostname             = "gw-host-1"
    datacenter           = "dal10"
    network_speed        = "1000"
    private_network_only = false
    tcp_monitoring       = false
    redundant_network    = true
    public_bandwidth     = 5000
    memory               = 64
    notes                = "Notes"
    ipv6_enabled         = false
    private_vlan         = ibm_network_vlan.classic_vlan_example_classic_private.id
    public_vlan          = ibm_network_vlan.classic_vlan_example_classic_public.id
    package_key_name     = "VIRTUAL_ROUTER_APPLIANCE_1_GPBS"
    os_key_name          = "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV"
    process_key_name     = "INTEL_XEON_4210_2_20"
    ssh_key_ids = [
      ibm_compute_ssh_key.classic_ssh_key_example_classic.id
    ]
    disk_key_names = [
      "HARD_DRIVE_2_00_TB_SATA_2"
    ]
  }
  members {
    hostname             = "gw-host-2"
    datacenter           = "dal10"
    network_speed        = "1000"
    private_network_only = false
    tcp_monitoring       = false
    redundant_network    = true
    public_bandwidth     = 5000
    memory               = 64
    notes                = "Notes"
    ipv6_enabled         = false
    private_vlan         = ibm_network_vlan.classic_vlan_example_classic_private.id
    public_vlan          = ibm_network_vlan.classic_vlan_example_classic_public.id
    package_key_name     = "VIRTUAL_ROUTER_APPLIANCE_1_GPBS"
    os_key_name          = "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV"
    process_key_name     = "INTEL_XEON_4210_2_20"
    ssh_key_ids = [
      ibm_compute_ssh_key.classic_ssh_key_example_classic.id
    ]
    disk_key_names = [
      "HARD_DRIVE_2_00_TB_SATA_2"
    ]
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return properly formatted gw"
      );
    });
  });
  describe("classicGatewayTf", () => {
    it("should return null when no classic gw", () => {
      let actualData = classicGatewayTf({});
      let expectedData = null;
      assert.deepEqual(actualData, expectedData, "it should return null");
    });
    it("should return a network gateway tf file with two members", () => {
      let actualData = classicGatewayTf({
        classic_gateways: [
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
            private_vlan: "example-classic-private",
            public_vlan: "example-classic-public",
            ssh_key: "example-classic",
            disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
            hadr: true,
          },
        ],
      });
      let expectedData = `##############################################################################
# Gw Classic Gateway
##############################################################################

resource "ibm_network_gateway" "classic_gateway_gw" {
  name = "\${var.prefix}-gw"
  members {
    hostname             = "gw-host-1"
    datacenter           = "dal10"
    network_speed        = "1000"
    private_network_only = false
    tcp_monitoring       = false
    redundant_network    = true
    public_bandwidth     = 5000
    memory               = 64
    notes                = "Notes"
    ipv6_enabled         = false
    private_vlan         = ibm_network_vlan.classic_vlan_example_classic_private.id
    public_vlan          = ibm_network_vlan.classic_vlan_example_classic_public.id
    package_key_name     = "VIRTUAL_ROUTER_APPLIANCE_1_GPBS"
    os_key_name          = "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV"
    process_key_name     = "INTEL_XEON_4210_2_20"
    ssh_key_ids = [
      ibm_compute_ssh_key.classic_ssh_key_example_classic.id
    ]
    disk_key_names = [
      "HARD_DRIVE_2_00_TB_SATA_2"
    ]
  }
  members {
    hostname             = "gw-host-2"
    datacenter           = "dal10"
    network_speed        = "1000"
    private_network_only = false
    tcp_monitoring       = false
    redundant_network    = true
    public_bandwidth     = 5000
    memory               = 64
    notes                = "Notes"
    ipv6_enabled         = false
    private_vlan         = ibm_network_vlan.classic_vlan_example_classic_private.id
    public_vlan          = ibm_network_vlan.classic_vlan_example_classic_public.id
    package_key_name     = "VIRTUAL_ROUTER_APPLIANCE_1_GPBS"
    os_key_name          = "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV"
    process_key_name     = "INTEL_XEON_4210_2_20"
    ssh_key_ids = [
      ibm_compute_ssh_key.classic_ssh_key_example_classic.id
    ]
    disk_key_names = [
      "HARD_DRIVE_2_00_TB_SATA_2"
    ]
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return properly formatted gw"
      );
    });
  });
});
