const { assert } = require("chai");
const { formatVsi, formatVsiImage, vsiTf } = require("../../client/src/lib/json-to-iac/vsi");
const slzNetwork = require("../data-files/slz-network.json");

describe("virtual server", () => {
  describe("formatVsi", () => {
    it("should correctly format vsi", () => {
      let actualData = formatVsi(
        {
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          name: "management-server",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          index: 1,
          resource_group: "slz-management-rg",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should correctly format vsi with user data", () => {
      let actualData = formatVsi(
        {
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          name: "management-server",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          index: 1,
          resource_group: "slz-management-rg",
          user_data: '"test-user-data"',
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]
  user_data      = "test-user-data"

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should correctly format vsi with multiple keys and security groups and ssh key from data", () => {
      slzNetwork.ssh_keys.push({
        name: "slz-ssh-key2",
        use_data: true,
      });
      let actualData = formatVsi(
        {
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          name: "management-server",
          security_groups: ["management-vpe-sg", "management-vpe-sg2"],
          ssh_keys: ["slz-ssh-key", "slz-ssh-key2"],
          subnet: "vsi-zone-1",
          vpc: "management",
          index: 1,
          resource_group: "slz-management-rg",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id,
    data.ibm_is_ssh_key.slz_ssh_key2.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id,
      ibm_is_security_group.management_vpc_management_vpe_sg2_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatVsiImage", () => {
    it("it should create a vsi image data block", () => {
      let actualData = formatVsiImage("ibm-ubuntu-18-04-6-minimal-amd64-2");
      let expectedData = `
data "ibm_is_image" "ibm_ubuntu_18_04_6_minimal_amd64_2" {
  name = "ibm-ubuntu-18-04-6-minimal-amd64-2"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vsiTf", () => {
    it("should create vsi terraform", () => {
      let actualData = vsiTf(slzNetwork);
      let expectedData = `##############################################################################
# Image Data Sources
##############################################################################

data "ibm_is_image" "ibm_ubuntu_18_04_6_minimal_amd64_2" {
  name = "ibm-ubuntu-18-04-6-minimal-amd64-2"
}

##############################################################################

##############################################################################
# Management VPC Management Server Deployment
##############################################################################

resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_1_2" {
  name           = "slz-management-management-server-vsi-zone-1-2"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_2_1" {
  name           = "slz-management-management-server-vsi-zone-2-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-2"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_2.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_2_2" {
  name           = "slz-management-management-server-vsi-zone-2-2"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-2"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_2.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_3_1" {
  name           = "slz-management-management-server-vsi-zone-3-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-3"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_3.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_3_2" {
  name           = "slz-management-management-server-vsi-zone-3-2"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-3"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_3.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
