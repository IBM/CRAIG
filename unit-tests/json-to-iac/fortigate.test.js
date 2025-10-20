const { assert } = require("chai");
const {
  formatFortigate,
  fortigateTf,
} = require("../../client/src/lib/json-to-iac/fortigate");
const slzNetwork = require("../data-files/slz-network.json");

describe("fortigate", () => {
  describe("formatFortigate", () => {
    it("should return correct formatted info", () => {
      let actualData = formatFortigate(
        {
          name: "fortigate",
          primary_subnet: "vsi-zone-1",
          secondary_subnet: "vsi-zone-2",
          security_groups: ["management-vpe-sg"],
          vpc: "management",
          resource_group: "slz-management-rg",
          profile: "cx2-4x8",
          ssh_keys: ["slz-ssh-key"],
          zone: "1",
        },
        slzNetwork,
      );
      let expectedData = `
data "template_file" "fortigate_vnf_userdata" {
  template = <<TEMPLATE
config system global
set hostname FGT-IBM
end
config system interface
edit port1
set alias untrust
set allowaccess https ssh ping
next
edit port2
set alias trust
set allowaccess https ssh ping
next
end
  TEMPLATE
}

resource "random_string" "fortigate_random_suffix" {
  length           = 4
  special          = true
  override_special = ""
  min_lower        = 4
}

resource "ibm_is_image" "fortigate_vnf_custom_image" {
  href             = "cos://us-geo/fortinet/fortigate_byol_742_b2571_GA.qcow2"
  name             = "\${var.prefix}-fortigate-custom-image-\${random_string.fortigate_random_suffix.result}"
  operating_system = "ubuntu-18-04-amd64"
  timeouts {
    create = "30m"
    delete = "10m"
  }
}

resource "ibm_is_volume" "fortigate_vnf_log_volume" {
  name    = "\${var.prefix}-fortigate-logdisk-\${random_string.fortigate_random_suffix.result}"
  profile = "10iops-tier"
  zone    = "\${var.region}-1"
}

resource "ibm_is_instance" "fortigate_fortigate_vnf_vsi" {
  name           = "\${var.prefix}-fortigate-vnf-vsi"
  resource_group = ibm_resource_group.slz_management_rg.id
  image          = ibm_is_image.fortigate_vnf_custom_image.id
  profile        = "cx2-4x8"
  vpc            = module.management_vpc.id
  zone           = "\${var.region}-1"
  user_data      = data.template_file.fortigate_vnf_userdata.rendered
  primary_network_interface {
    name   = "\${var.prefix}-fortigate-port1-\${random_string.fortigate_random_suffix.result}"
    subnet = module.management_vpc.subnet_vsi_zone_1_id
    security_groups = [
      module.management_vpc.management_vpe_sg_id
    ]
  }
  network_interfaces {
    name   = "\${var.prefix}-fortigate-port2-\${random_string.fortigate_random_suffix.result}"
    subnet = module.management_vpc.subnet_vsi_zone_2_id
    security_groups = [
      module.management_vpc.management_vpe_sg_id
    ]
  }
  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]
  volumes = [
    ibm_is_volume.fortigate_vnf_log_volume.id
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data",
      );
    });
  });
  describe("fortigateTf", () => {
    it("should return correct terraform", () => {
      slzNetwork.fortigate_vnf = [
        {
          name: "fortigate",
          primary_subnet: "vsi-zone-1",
          secondary_subnet: "vsi-zone-2",
          security_groups: ["management-vpe-sg"],
          vpc: "management",
          resource_group: "slz-management-rg",
          profile: "cx2-4x8",
          ssh_keys: ["slz-ssh-key"],
          zone: "1",
        },
      ];
      let actualData = fortigateTf(slzNetwork);
      let expectedData = `##############################################################################
# Fortigate Fortigate Gateway
##############################################################################

data "template_file" "fortigate_vnf_userdata" {
  template = <<TEMPLATE
config system global
set hostname FGT-IBM
end
config system interface
edit port1
set alias untrust
set allowaccess https ssh ping
next
edit port2
set alias trust
set allowaccess https ssh ping
next
end
  TEMPLATE
}

resource "random_string" "fortigate_random_suffix" {
  length           = 4
  special          = true
  override_special = ""
  min_lower        = 4
}

resource "ibm_is_image" "fortigate_vnf_custom_image" {
  href             = "cos://us-geo/fortinet/fortigate_byol_742_b2571_GA.qcow2"
  name             = "\${var.prefix}-fortigate-custom-image-\${random_string.fortigate_random_suffix.result}"
  operating_system = "ubuntu-18-04-amd64"
  timeouts {
    create = "30m"
    delete = "10m"
  }
}

resource "ibm_is_volume" "fortigate_vnf_log_volume" {
  name    = "\${var.prefix}-fortigate-logdisk-\${random_string.fortigate_random_suffix.result}"
  profile = "10iops-tier"
  zone    = "\${var.region}-1"
}

resource "ibm_is_instance" "fortigate_fortigate_vnf_vsi" {
  name           = "\${var.prefix}-fortigate-vnf-vsi"
  resource_group = ibm_resource_group.slz_management_rg.id
  image          = ibm_is_image.fortigate_vnf_custom_image.id
  profile        = "cx2-4x8"
  vpc            = module.management_vpc.id
  zone           = "\${var.region}-1"
  user_data      = data.template_file.fortigate_vnf_userdata.rendered
  primary_network_interface {
    name   = "\${var.prefix}-fortigate-port1-\${random_string.fortigate_random_suffix.result}"
    subnet = module.management_vpc.subnet_vsi_zone_1_id
    security_groups = [
      module.management_vpc.management_vpe_sg_id
    ]
  }
  network_interfaces {
    name   = "\${var.prefix}-fortigate-port2-\${random_string.fortigate_random_suffix.result}"
    subnet = module.management_vpc.subnet_vsi_zone_2_id
    security_groups = [
      module.management_vpc.management_vpe_sg_id
    ]
  }
  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]
  volumes = [
    ibm_is_volume.fortigate_vnf_log_volume.id
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data",
      );
    });
    it("should return correct terraform with imported subnets", () => {
      slzNetwork.vpcs[0].subnets[0].use_data = true;
      slzNetwork.vpcs[0].subnets[2].use_data = true;
      slzNetwork.fortigate_vnf = [
        {
          name: "fortigate",
          primary_subnet: "vsi-zone-1",
          secondary_subnet: "vsi-zone-2",
          security_groups: ["management-vpe-sg"],
          vpc: "management",
          resource_group: "slz-management-rg",
          profile: "cx2-4x8",
          ssh_keys: ["slz-ssh-key"],
          zone: "1",
        },
      ];
      let actualData = fortigateTf(slzNetwork);
      delete slzNetwork.vpcs[0].subnets[0].use_data;
      delete slzNetwork.vpcs[0].subnets[2].use_data;
      let expectedData = `##############################################################################
# Fortigate Fortigate Gateway
##############################################################################

data "template_file" "fortigate_vnf_userdata" {
  template = <<TEMPLATE
config system global
set hostname FGT-IBM
end
config system interface
edit port1
set alias untrust
set allowaccess https ssh ping
next
edit port2
set alias trust
set allowaccess https ssh ping
next
end
  TEMPLATE
}

resource "random_string" "fortigate_random_suffix" {
  length           = 4
  special          = true
  override_special = ""
  min_lower        = 4
}

resource "ibm_is_image" "fortigate_vnf_custom_image" {
  href             = "cos://us-geo/fortinet/fortigate_byol_742_b2571_GA.qcow2"
  name             = "\${var.prefix}-fortigate-custom-image-\${random_string.fortigate_random_suffix.result}"
  operating_system = "ubuntu-18-04-amd64"
  timeouts {
    create = "30m"
    delete = "10m"
  }
}

resource "ibm_is_volume" "fortigate_vnf_log_volume" {
  name    = "\${var.prefix}-fortigate-logdisk-\${random_string.fortigate_random_suffix.result}"
  profile = "10iops-tier"
  zone    = "\${var.region}-1"
}

resource "ibm_is_instance" "fortigate_fortigate_vnf_vsi" {
  name           = "\${var.prefix}-fortigate-vnf-vsi"
  resource_group = ibm_resource_group.slz_management_rg.id
  image          = ibm_is_image.fortigate_vnf_custom_image.id
  profile        = "cx2-4x8"
  vpc            = module.management_vpc.id
  zone           = "\${var.region}-1"
  user_data      = data.template_file.fortigate_vnf_userdata.rendered
  primary_network_interface {
    name   = "\${var.prefix}-fortigate-port1-\${random_string.fortigate_random_suffix.result}"
    subnet = module.management_vpc.import_vsi_zone_1_id
    security_groups = [
      module.management_vpc.management_vpe_sg_id
    ]
  }
  network_interfaces {
    name   = "\${var.prefix}-fortigate-port2-\${random_string.fortigate_random_suffix.result}"
    subnet = module.management_vpc.import_vsi_zone_2_id
    security_groups = [
      module.management_vpc.management_vpe_sg_id
    ]
  }
  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]
  volumes = [
    ibm_is_volume.fortigate_vnf_log_volume.id
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data",
      );
    });
  });
});
