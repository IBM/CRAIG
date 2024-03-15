const { assert } = require("chai");
const {
  formatClassicBareMetal,
  classicBareMetalTf,
} = require("../../client/src/lib/json-to-iac/classic-bare-metal");

describe("classic bare metal", () => {
  describe("formatClassicBareMetal", () => {
    it("should format a classic bare metal server", () => {
      let actualData = formatClassicBareMetal(
        {
          package_key_name: "test",
          process_key_name: "test",
          os_key_name: "test",
          memory: "256",
          name: "name",
          datacenter: "dal10",
          domain: "example.com",
          network_speed: "100",
          public_bandwidth: "500",
          private_network_only: false,
          private_vlan: "priv",
          public_vlan: "pub",
          disk_key_names: ["key-1", "key-2"],
        },
        {
          _options: {
            tags: ["hello", "world"],
          },
        }
      );
      let expectedData = `
resource "ibm_compute_bare_metal" "name" {
  package_key_name     = "test"
  process_key_name     = "test"
  os_key_name          = "test"
  memory               = "256"
  hostname             = "\${var.prefix}-name"
  domain               = "example.com"
  datacenter           = "dal10"
  network_speed        = "100"
  public_bandwidth     = "500"
  hourly_billing       = false
  private_network_only = false
  private_vlan_id      = ibm_network_vlan.classic_vlan_priv.id
  public_vlan_id       = ibm_network_vlan.classic_vlan_pub.id
  disk_key_names = [
    "key-1",
    "key-2"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct bare metal tf"
      );
    });
  });
  describe("classicBareMetalTf", () => {
    it("should format a classic bare metal server", () => {
      let actualData = classicBareMetalTf({
        classic_bare_metal: [
          {
            name: "test",
            domain: "test.com",
            datacenter: "dal10",
            os_key_name: "frog",
            package_key_name: "frog",
            process_key_name: "frog",
            private_network_only: false,
            private_vlan: "private-vlan",
            public_vlan: "public-vlan",
            disk_key_names: ["disk-key-1", "disk-key-2"],
          },
        ],
      });
      let expectedData = `##############################################################################
# Classic Bare Metal Servers
##############################################################################

resource "ibm_compute_bare_metal" "test" {
  package_key_name     = "frog"
  process_key_name     = "frog"
  os_key_name          = "frog"
  memory               = 64
  hostname             = "\${var.prefix}-test"
  domain               = "test.com"
  datacenter           = "dal10"
  network_speed        = 100
  public_bandwidth     = 500
  hourly_billing       = false
  private_network_only = false
  private_vlan_id      = ibm_network_vlan.classic_vlan_private_vlan.id
  public_vlan_id       = ibm_network_vlan.classic_vlan_public_vlan.id
  disk_key_names = [
    "disk-key-1",
    "disk-key-2"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct bare metal tf"
      );
    });
    it("should format a bare metal server", () => {
      let actualData = classicBareMetalTf({
        classic_bare_metal: [
          {
            name: "test",
            domain: "test.com",
            datacenter: "dal10",
            os_key_name: "frog",
            package_key_name: "frog",
            process_key_name: "frog",
            private_network_only: true,
            private_vlan: "private-vlan",
            disk_key_names: ["disk-key-1", "disk-key-2"],
          },
        ],
      });
      let expectedData = `##############################################################################
# Classic Bare Metal Servers
##############################################################################

resource "ibm_compute_bare_metal" "test" {
  package_key_name     = "frog"
  process_key_name     = "frog"
  os_key_name          = "frog"
  memory               = 64
  hostname             = "\${var.prefix}-test"
  domain               = "test.com"
  datacenter           = "dal10"
  network_speed        = 100
  hourly_billing       = false
  private_network_only = true
  private_vlan_id      = ibm_network_vlan.classic_vlan_private_vlan.id
  disk_key_names = [
    "disk-key-1",
    "disk-key-2"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct bare metal tf"
      );
    });
  });
});
