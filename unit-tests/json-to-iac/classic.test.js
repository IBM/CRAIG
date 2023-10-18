const { assert } = require("chai");
const {
  formatClassicSshKey,
  formatClassicNetworkVlan,
  classicInfraTf,
} = require("../../client/src/lib/json-to-iac/classic");

describe("classic resources", () => {
  describe("formatClassicSshKey", () => {
    it("should return ssh key", () => {
      let expectedData = `
resource "ibm_compute_ssh_key" "classic_ssh_key_example_classic" {
  provider   = ibm.classic
  label      = "example-classic"
  public_key = var.classic_example_classic_public_key
}
`;
      let actualData = formatClassicSshKey({
        name: "example-classic",
        public_key: "1234",
        datacenter: "dal10",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct ssh key"
      );
    });
  });
  describe("formatClassicNetworkVlan", () => {
    it("should create a vlan", () => {
      let expectedData = `
resource "ibm_network_vlan" "classic_vlan_vsrx_public" {
  provider   = ibm.classic
  name       = "\${var.prefix}-vsrx-public"
  datacenter = "dal10"
  type       = "PUBLIC"
  tags = [
    "hello",
    "world"
  ]
}
`;
      let actualData = formatClassicNetworkVlan(
        {
          name: "vsrx-public",
          datacenter: "dal10",
          type: "PUBLIC",
        },
        {
          _options: {
            tags: ["hello", "world"],
          },
        }
      );

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct vlan"
      );
    });
  });
  describe("classicInfraTf", () => {
    it("should return correct classic vlans and ssh keys", () => {
      let actualData = classicInfraTf({
        _options: {
          tags: ["hello", "world"],
        },
        classic_ssh_keys: [
          {
            name: "example-classic",
            public_key: "1234",
            datacenter: "dal10",
          },
          {
            name: "example-classic1",
            public_key: "1234",
            datacenter: "dal10",
          },
          {
            name: "example-classic2",
            public_key: "1234",
            datacenter: "dal12",
          },
        ],
        classic_vlans: [
          {
            name: "vsrx-public",
            datacenter: "dal10",
            type: "PUBLIC",
          },
          {
            name: "vsrx-public1",
            datacenter: "dal10",
            type: "PUBLIC",
          },
          {
            name: "vsrx-public2",
            datacenter: "dal12",
            type: "PUBLIC",
          },
        ],
      });

      let expectedData = `##############################################################################
# Dal 10 SSH Keys
##############################################################################

resource "ibm_compute_ssh_key" "classic_ssh_key_example_classic" {
  provider   = ibm.classic
  label      = "example-classic"
  public_key = var.classic_example_classic_public_key
}

resource "ibm_compute_ssh_key" "classic_ssh_key_example_classic1" {
  provider   = ibm.classic
  label      = "example-classic1"
  public_key = var.classic_example_classic1_public_key
}

##############################################################################

##############################################################################
# Dal 10 VLANs
##############################################################################

resource "ibm_network_vlan" "classic_vlan_vsrx_public" {
  provider   = ibm.classic
  name       = "\${var.prefix}-vsrx-public"
  datacenter = "dal10"
  type       = "PUBLIC"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_network_vlan" "classic_vlan_vsrx_public1" {
  provider   = ibm.classic
  name       = "\${var.prefix}-vsrx-public1"
  datacenter = "dal10"
  type       = "PUBLIC"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# Dal 12 SSH Keys
##############################################################################

resource "ibm_compute_ssh_key" "classic_ssh_key_example_classic2" {
  provider   = ibm.classic
  label      = "example-classic2"
  public_key = var.classic_example_classic2_public_key
}

##############################################################################

##############################################################################
# Dal 12 VLANs
##############################################################################

resource "ibm_network_vlan" "classic_vlan_vsrx_public2" {
  provider   = ibm.classic
  name       = "\${var.prefix}-vsrx-public2"
  datacenter = "dal12"
  type       = "PUBLIC"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct vlan"
      );
    });
    it("should return correct ssh keys with no vlans", () => {
      let actualData = classicInfraTf({
        _options: {
          tags: ["hello", "world"],
        },
        classic_ssh_keys: [
          {
            name: "example-classic",
            public_key: "1234",
            datacenter: "dal10",
          },
          {
            name: "example-classic1",
            public_key: "1234",
            datacenter: "dal10",
          },
          {
            name: "example-classic2",
            public_key: "1234",
            datacenter: "dal12",
          },
        ],
        classic_vlans: [],
      });

      let expectedData = `##############################################################################
# Dal 10 SSH Keys
##############################################################################

resource "ibm_compute_ssh_key" "classic_ssh_key_example_classic" {
  provider   = ibm.classic
  label      = "example-classic"
  public_key = var.classic_example_classic_public_key
}

resource "ibm_compute_ssh_key" "classic_ssh_key_example_classic1" {
  provider   = ibm.classic
  label      = "example-classic1"
  public_key = var.classic_example_classic1_public_key
}

##############################################################################

##############################################################################
# Dal 12 SSH Keys
##############################################################################

resource "ibm_compute_ssh_key" "classic_ssh_key_example_classic2" {
  provider   = ibm.classic
  label      = "example-classic2"
  public_key = var.classic_example_classic2_public_key
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct vlan"
      );
    });
    it("should return correct classic vlans with no ssh keys", () => {
      let actualData = classicInfraTf({
        _options: {
          tags: ["hello", "world"],
        },
        classic_ssh_keys: [],
        classic_vlans: [
          {
            name: "vsrx-public",
            datacenter: "dal10",
            type: "PUBLIC",
          },
          {
            name: "vsrx-public1",
            datacenter: "dal10",
            type: "PUBLIC",
          },
          {
            name: "vsrx-public2",
            datacenter: "dal12",
            type: "PUBLIC",
          },
        ],
      });

      let expectedData = `##############################################################################
# Dal 10 VLANs
##############################################################################

resource "ibm_network_vlan" "classic_vlan_vsrx_public" {
  provider   = ibm.classic
  name       = "\${var.prefix}-vsrx-public"
  datacenter = "dal10"
  type       = "PUBLIC"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_network_vlan" "classic_vlan_vsrx_public1" {
  provider   = ibm.classic
  name       = "\${var.prefix}-vsrx-public1"
  datacenter = "dal10"
  type       = "PUBLIC"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# Dal 12 VLANs
##############################################################################

resource "ibm_network_vlan" "classic_vlan_vsrx_public2" {
  provider   = ibm.classic
  name       = "\${var.prefix}-vsrx-public2"
  datacenter = "dal12"
  type       = "PUBLIC"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct vlan"
      );
    });
  });
});
