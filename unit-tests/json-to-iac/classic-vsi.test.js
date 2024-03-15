const { assert } = require("chai");
const {
  formatClassicVsi,
  classicVsiTf,
} = require("../../client/src/lib/json-to-iac/classic-vsi");

describe("classic vsi", () => {
  describe("formatClassicVsi", () => {
    it("should format a classic vsi", () => {
      let actualData = formatClassicVsi(
        {
          name: "name",
          datacenter: "dal10",
          domain: "example.com",
          cores: "12",
          memory: "256",
          image_id: "xyz1234",
          local_disk: true,
          network_speed: "100",
          private_network_only: false,
          private_vlan: "example-classic-private",
          public_vlan: "example-classic-public",
          private_security_groups: ["priv-sg"],
          public_security_groups: ["pub-sg"],
          ssh_keys: ["example-classic"],
        },
        {
          _options: {
            tags: ["hello", "world"],
          },
        }
      );
      let expectedData = `
resource "ibm_compute_vm_instance" "classic_vsi_name" {
  hostname             = "\${var.prefix}-name"
  datacenter           = "dal10"
  domain               = "example.com"
  cores                = 12
  memory               = 256
  image_id             = "xyz1234"
  local_disk           = true
  network_speed        = 100
  private_network_only = false
  private_vlan_id      = ibm_network_vlan.classic_vlan_example_classic_private.id
  public_vlan_id       = ibm_network_vlan.classic_vlan_example_classic_public.id
  public_security_group_ids = [
    ibm_security_group.classic_securtiy_group_pub_sg.id
  ]
  private_security_group_ids = [
    ibm_security_group.classic_securtiy_group_priv_sg.id
  ]
  ssh_key_ids = [
    ibm_compute_ssh_key.classic_ssh_key_example_classic.id
  ]
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct vsi"
      );
    });
  });
  describe("classicVsiTf", () => {
    it("should format a classic vsi", () => {
      let actualData = classicVsiTf({
        _options: {
          tags: ["hello", "world"],
        },
        classic_vsi: [
          {
            name: "name",
            datacenter: "dal10",
            domain: "example.com",
            cores: "12",
            memory: "256",
            image_id: "xyz1234",
            local_disk: true,
            network_speed: "100",
            private_network_only: false,
            private_vlan: "example-classic-private",
            public_vlan: "example-classic-public",
            private_security_groups: ["priv-sg"],
            public_security_groups: ["pub-sg"],
            ssh_keys: ["example-classic"],
          },
          {
            name: "name2",
            datacenter: "dal10",
            domain: "example.com",
            cores: "12",
            memory: "256",
            image_id: "xyz1234",
            local_disk: true,
            network_speed: "100",
            private_network_only: true,
            private_vlan: "example-classic-private",
            public_vlan: "example-classic-public",
            private_security_groups: ["priv-sg"],
            public_security_groups: ["pub-sg"],
            ssh_keys: ["example-classic"],
          },
        ],
      });
      let expectedData = `##############################################################################
# Classic VSI
##############################################################################

resource "ibm_compute_vm_instance" "classic_vsi_name" {
  hostname             = "\${var.prefix}-name"
  datacenter           = "dal10"
  domain               = "example.com"
  cores                = 12
  memory               = 256
  image_id             = "xyz1234"
  local_disk           = true
  network_speed        = 100
  private_network_only = false
  private_vlan_id      = ibm_network_vlan.classic_vlan_example_classic_private.id
  public_vlan_id       = ibm_network_vlan.classic_vlan_example_classic_public.id
  public_security_group_ids = [
    ibm_security_group.classic_securtiy_group_pub_sg.id
  ]
  private_security_group_ids = [
    ibm_security_group.classic_securtiy_group_priv_sg.id
  ]
  ssh_key_ids = [
    ibm_compute_ssh_key.classic_ssh_key_example_classic.id
  ]
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_compute_vm_instance" "classic_vsi_name2" {
  hostname             = "\${var.prefix}-name2"
  datacenter           = "dal10"
  domain               = "example.com"
  cores                = 12
  memory               = 256
  image_id             = "xyz1234"
  local_disk           = true
  network_speed        = 100
  private_network_only = true
  private_vlan_id      = ibm_network_vlan.classic_vlan_example_classic_private.id
  private_security_group_ids = [
    ibm_security_group.classic_securtiy_group_priv_sg.id
  ]
  ssh_key_ids = [
    ibm_compute_ssh_key.classic_ssh_key_example_classic.id
  ]
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
        "it should return correct vsi"
      );
    });
  });
});
