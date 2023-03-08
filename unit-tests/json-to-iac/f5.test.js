const { assert } = require("chai");
const {
  f5ImageLocals,
  f5CloudInitYaml,
  f5TemplateLocals,
  f5TemplateUserData,
  formatF5Vsi,
  f5Tf,
} = require("../../client/src/lib/json-to-iac/f5");
const slzNetwork = require("../data-files/f5-nw.json");

describe("f5 big ip", () => {
  describe("f5ImageLocals", () => {
    it("should create a map of f5 images as a local variable", () => {
      let expectedData = `##############################################################################
# F5 Image IDs
##############################################################################

locals {
  # use the public image if the name is found
  # List of public images found in F5 schematics documentation
  # (https://github.com/f5devcentral/ibmcloud_schematics_bigip_multinic_public_images)
  public_image_map = {
    f5-bigip-15-1-5-1-0-0-14-all-1slot = {
      "eu-de"    = "r010-b14deae9-43fd-4850-b89d-5d6485d61acb"
      "jp-tok"   = "r022-cfdb6280-c200-4261-af3a-a8d44bbd18ba"
      "br-sao"   = "r042-3915f0e3-aadc-4fc9-95a8-840f8cb163de"
      "au-syd"   = "r026-ed57accf-b3d4-4ca9-a6a6-e0a63ee1aba4"
      "us-south" = "r006-c9f07041-bb56-4492-b25c-5f407ebea358"
      "eu-gb"    = "r018-6dce329f-a6eb-4146-ba3e-5560afc84aa1"
      "jp-osa"   = "r034-4ecc10ff-3dc7-42fb-9cae-189fb559dd61"
      "us-east"  = "r014-87371e4c-3645-4579-857c-7e02fe5e9ff4"
      "ca-tor"   = "r038-0840034f-5d05-4a6d-bdae-123628f1d323"
    }
    f5-bigip-15-1-5-1-0-0-14-ltm-1slot = {
      "eu-de"    = "r010-efad005b-4deb-45a8-b1c5-5b3cea55e7e3"
      "jp-tok"   = "r022-35126a90-aec2-4934-a628-d1ce90bcf68a"
      "br-sao"   = "r042-978cecaf-7f2a-44bc-bffd-ddcf6ce56b11"
      "au-syd"   = "r026-429369e1-d917-4d9c-8a8c-3a8606e26a72"
      "us-south" = "r006-afe3c555-e8ba-4448-9983-151a14edf868"
      "eu-gb"    = "r018-f2083d86-6f25-42d6-b66a-d5ed2a0108d2"
      "jp-osa"   = "r034-edd01010-b7ee-411c-9158-d41960bf9def"
      "us-east"  = "r014-41db5a03-ab7f-4bf7-95c2-8edbeea0e3af"
      "ca-tor"   = "r038-f5d750b1-61dc-4fa5-98d3-a790417f07dd"
    }
    f5-bigip-16-1-2-2-0-0-28-ltm-1slot = {
      "eu-de"    = "r010-c90f3597-d03e-4ce6-8efa-870c782952cd"
      "jp-tok"   = "r022-0da3fc1b-c243-4702-87cc-b5a7f5e1f035"
      "br-sao"   = "r042-0649e2fc-0d27-4950-99a8-1d968bc72dd5"
      "au-syd"   = "r026-9de34b46-fc95-4940-a074-e45ac986c761"
      "us-south" = "r006-863f431b-f4e2-4d8c-a358-07746a146ea1"
      "eu-gb"    = "r018-a88026c2-89b4-43d6-8688-f28ac259627d"
      "jp-osa"   = "r034-585692ec-9508-4a41-bcc3-3a94b31ad161"
      "us-east"  = "r014-b675ae9f-109d-4499-9639-2fbc7b1d55e9"
      "ca-tor"   = "r038-56cc321b-1920-443e-a400-c58905c8f46c"
    }
    f5-bigip-16-1-2-2-0-0-28-all-1slot = {
      "eu-de"    = "r010-af6fa90b-ea18-48af-bfb9-a3605d60224d"
      "jp-tok"   = "r022-d2bffe3c-084e-43ae-b331-ec82b15af705"
      "br-sao"   = "r042-2dcd1226-5dd9-4b8d-89c5-5ba4f162b966"
      "au-syd"   = "r026-1f8b30f1-af86-433d-861c-7ff36d69176b"
      "us-south" = "r006-1c0242c4-a99c-4d27-ad2c-4003a7fea131"
      "eu-gb"    = "r018-d33e87cb-0342-41e2-8e29-2b0db4a5881f"
      "jp-osa"   = "r034-1b04698d-9935-4477-8f72-958c7f08c85f"
      "us-east"  = "r014-015d6b06-611e-4e1a-9284-551ed3832182"
      "ca-tor"   = "r038-b7a44268-e95f-425b-99ac-6ec5fc2c4cdc"
    }
  }
}

##############################################################################
`;
      let actualData = f5ImageLocals();
      assert.deepEqual(actualData, expectedData, "it should create data");
    });
  });
  describe("f5CloudInitYaml", () => {
    it("should return the correct yaml", () => {
      let expectedData = `#cloud-config
chpasswd:
  expire: false
  list: |
    admin:\${tmos_admin_password}
tmos_dhcpv4_tmm:
  enabled: true
  rd_enabled: false
  icontrollx_trusted_sources: false
  inject_routes: true
  configsync_interface: \${configsync_interface}
  default_route_interface: \${default_route_interface}
  dhcp_timeout: 120
  dhcpv4_options:
    mgmt:
      host-name: \${hostname}
      domain-name: \${domain}
    '\${default_route_interface}':
      routers: \${default_route_gateway}
  do_enabled: true 
  do_declaration: \${do_local_declaration}
  do_declaration_url: \${do_declaration_url}
  as3_enabled: true
  as3_declaration_url: \${as3_declaration_url}
  ts_enabled: true
  ts_declaration_url: \${ts_declaration_url}
  phone_home_url: \${phone_home_url}
  phone_home_url_verify_tls: false
  phone_home_url_metadata:
    template_source: \${template_source}
    template_version: \${template_version}
    zone: \${zone}
    vpc: \${vpc}
    app_id: \${app_id}
  tgactive_url: \${tgactive_url}
  tgstandby_url: \${tgstandby_url}
  tgrefresh_url: \${tgrefresh_url}
`;
      let actualData = f5CloudInitYaml();
      assert.deepEqual(actualData, expectedData, "it should create data");
    });
  });
  describe("f5TemplateLocals", () => {
    it("should return with null values", () => {
      let expectedData = `##############################################################################
# Template Data
##############################################################################

locals {
  do_byol_license      = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      byoLicense:
        class: License
        licenseType: regKey
        regKey: null
EOD
  do_regekypool        = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      poolLicense:
        class: License
        licenseType: licensePool
        bigIqHost: "null"
        bigIqUsername: "null"
        bigIqPassword: "null"
        licensePool: "null"
        reachable: false
        hypervisor: kvm
EOD
  do_utilitypool       = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      utilityLicense:
        class: License
        licenseType: licensePool
        bigIqHost: "null"
        bigIqUsername: "null"
        bigIqPassword: "null"
        licensePool: "null"
        skuKeyword1: "null"
        skuKeyword2: "null"
        unitOfMeasure: null
        reachable: false
        hypervisor: kvm
EOD
  template_file        = file("\${path.module}/f5_user_data.yaml")
  do_dec1              = var.license_type == "byol" ? chomp(local.do_byol_license) : "null"
  do_dec2              = var.license_type == "regkeypool" ? chomp(local.do_regekypool) : local.do_dec1
  do_local_declaration = var.license_type == "utilitypool" ? chomp(local.do_utilitypool) : local.do_dec2
}

##############################################################################
`;
      let actualData = f5TemplateLocals({});
      assert.deepEqual(actualData, expectedData, "it should create data");
    });
    it("should return with actual values with utilitypool", () => {
      let expectedData = `##############################################################################
# Template Data
##############################################################################

locals {
  do_byol_license      = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      byoLicense:
        class: License
        licenseType: regKey
        regKey: test
EOD
  do_regekypool        = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      poolLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        reachable: false
        hypervisor: kvm
EOD
  do_utilitypool       = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      utilityLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        skuKeyword1: key
        skuKeyword2: word
        unitOfMeasure: test
        reachable: false
        hypervisor: kvm
EOD
  template_file        = file("\${path.module}/f5_user_data.yaml")
  do_dec1              = "null"
  do_dec2              = local.do_dec1
  do_local_declaration = chomp(local.do_utilitypool)
}

##############################################################################
`;
      let actualData = f5TemplateLocals({
        license_unit_of_measure: "test",
        byol_license_basekey: "test",
        license_type: "utilitypool",
        license_host: "host",
        license_username: "username",
        license_password: "f5bigip",
        license_pool: "pool",
        license_sku_keyword_1: "key",
        license_sku_keyword_2: "word",
      });
      assert.deepEqual(actualData, expectedData, "it should create data");
    });
    it("should return with actual values with regkeypool", () => {
      let expectedData = `##############################################################################
# Template Data
##############################################################################

locals {
  do_byol_license      = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      byoLicense:
        class: License
        licenseType: regKey
        regKey: test
EOD
  do_regekypool        = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      poolLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        reachable: false
        hypervisor: kvm
EOD
  do_utilitypool       = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      utilityLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        skuKeyword1: key
        skuKeyword2: word
        unitOfMeasure: test
        reachable: false
        hypervisor: kvm
EOD
  template_file        = file("\${path.module}/f5_user_data.yaml")
  do_dec1              = "null"
  do_dec2              = chomp(local.do_regekypool)
  do_local_declaration = local.do_dec2
}

##############################################################################
`;
      let actualData = f5TemplateLocals({
        license_unit_of_measure: "test",
        byol_license_basekey: "test",
        license_type: "regkeypool",
        license_host: "host",
        license_username: "username",
        license_password: "f5bigip",
        license_pool: "pool",
        license_sku_keyword_1: "key",
        license_sku_keyword_2: "word",
      });
      assert.deepEqual(actualData, expectedData, "it should create data");
    });
    it("should return with actual values with byol", () => {
      let expectedData = `##############################################################################
# Template Data
##############################################################################

locals {
  do_byol_license      = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      byoLicense:
        class: License
        licenseType: regKey
        regKey: test
EOD
  do_regekypool        = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      poolLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        reachable: false
        hypervisor: kvm
EOD
  do_utilitypool       = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      utilityLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        skuKeyword1: key
        skuKeyword2: word
        unitOfMeasure: test
        reachable: false
        hypervisor: kvm
EOD
  template_file        = file("\${path.module}/f5_user_data.yaml")
  do_dec1              = chomp(local.do_byol_license)
  do_dec2              = local.do_dec1
  do_local_declaration = local.do_dec2
}

##############################################################################
`;
      let actualData = f5TemplateLocals({
        license_unit_of_measure: "test",
        byol_license_basekey: "test",
        license_type: "byol",
        license_host: "host",
        license_username: "username",
        license_password: "f5bigip",
        license_pool: "pool",
        license_sku_keyword_1: "key",
        license_sku_keyword_2: "word",
      });
      assert.deepEqual(actualData, expectedData, "it should create data");
    });
  });
  describe("f5TemplateUserData", () => {
    it("should return correct template data", () => {
      let expectedData = `
data "template_file" "user_data_f5_ve_01_zone_1" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "f5-ve-01"
    domain                  = "local"
    default_route_interface = "1.1"
    default_route_gateway   = "10.10.10.11"
    do_local_declaration    = local.do_local_declaration
    do_declaration_url      = "null"
    as3_declaration_url     = "null"
    ts_declaration_url      = "null"
    phone_home_url          = "null"
    tgactive_url            = ""
    tgstandby_url           = "null"
    tgrefresh_url           = "null"
    template_source         = "f5devcentral/ibmcloud_schematics_bigip_multinic_declared"
    template_version        = "20210201"
    zone                    = "us-south-1"
    vpc                     = ibm_is_vpc.management_vpc.id
    app_id                  = "null"
  }
}
`;
      let actualData = f5TemplateUserData(
        {
          hostname: "f5-ve-01",
          domain: "local",
          default_route_gateway_cidr: "10.10.10.10/24",
          zone: 1,
          vpc: "management",
        },
        {
          _options: {
            region: "us-south",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct template data with all values", () => {
      let expectedData = `
data "template_file" "user_data_f5_ve_01_zone_1" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "f5-ve-01"
    domain                  = "local"
    default_route_interface = "1.1"
    default_route_gateway   = "10.10.10.11"
    do_local_declaration    = local.do_local_declaration
    do_declaration_url      = "hi"
    as3_declaration_url     = "hi"
    ts_declaration_url      = "hi"
    phone_home_url          = "hi"
    tgactive_url            = "hi"
    tgstandby_url           = "hi"
    tgrefresh_url           = "hi"
    template_source         = "f5devcentral/ibmcloud_schematics_bigip_multinic_declared"
    template_version        = "hi"
    zone                    = "us-south-1"
    vpc                     = ibm_is_vpc.management_vpc.id
    app_id                  = "hi"
  }
}
`;
      let actualData = f5TemplateUserData(
        {
          hostname: "f5-ve-01",
          domain: "local",
          default_route_gateway_cidr: "10.10.10.10/24",
          zone: 1,
          vpc: "management",
          do_declaration_url: "hi",
          as3_declaration_url: "hi",
          ts_declaration_url: "hi",
          phone_home_url: "hi",
          tgactive_url: "hi",
          tgstandby_url: "hi",
          tgrefresh_url: "hi",
          template_version: "hi",
          app_id: "hi",
        },
        {
          _options: {
            region: "us-south",
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatF5Vsi", () => {
    let actualData = formatF5Vsi(
      {
        kms: "slz-kms",
        subnet: "f5-management-zone-1",
        vpc: "edge",
        resource_group: "slz-edge-rg",
        ssh_keys: ["slz-ssh-key"],
        security_groups: ["f5-management-sg"],
        encryption_key: "slz-vsi-volume-key",
        profile: "cx2-4x8",
        zone: 1,
        name: "f5-ve-01-zone-1",
        image: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
        network_interfaces: [
          {
            subnet: "f5-bastion-zone-1",
            security_groups: ["f5-bastion-sg"],
          },
          {
            subnet: "f5-external-zone-1",
            security_groups: ["f5-external-sg"],
          },
          {
            subnet: "f5-workload-zone-1",
            security_groups: ["f5-workload-sg"],
          },
        ],
      },
      slzNetwork
    );
    let expectedData = `
resource "ibm_is_instance" "f5_ve_01_zone_1" {
  name               = "f5-ve-01-zone-1"
  image              = local.public_image_map["f5-bigip-16-1-2-2-0-0-28-all-1slot"]["us-south"]
  profile            = "cx2-4x8"
  resource_group     = ibm_resource_group.slz_edge_rg.id
  vpc                = ibm_is_vpc.edge_vpc.id
  zone               = "us-south-1"
  tags               = ["slz","landing-zone"]
  user_data          = data.template_file.user_data_f5_ve_01_zone_1.rendered

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.edge_f5_management_zone_1.id
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_management_sg_sg.id
    ]
  }

  network_interfaces {
    subnet            = ibm_is_subnet.edge_f5_bastion_zone_1.id
    allow_ip_spoofing = true
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_bastion_sg_sg.id
    ]
  }

  network_interfaces {
    subnet            = ibm_is_subnet.edge_f5_external_zone_1.id
    allow_ip_spoofing = true
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_external_sg_sg.id
    ]
  }

  network_interfaces {
    subnet            = ibm_is_subnet.edge_f5_workload_zone_1.id
    allow_ip_spoofing = true
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_workload_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}
`;
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
  describe("f5Tf", () => {
    it("should return correct f5 vsi terraform", () => {
      let actualData = f5Tf(slzNetwork);
      let expectedData = `##############################################################################
# F5 Image IDs
##############################################################################

locals {
  # use the public image if the name is found
  # List of public images found in F5 schematics documentation
  # (https://github.com/f5devcentral/ibmcloud_schematics_bigip_multinic_public_images)
  public_image_map = {
    f5-bigip-15-1-5-1-0-0-14-all-1slot = {
      "eu-de"    = "r010-b14deae9-43fd-4850-b89d-5d6485d61acb"
      "jp-tok"   = "r022-cfdb6280-c200-4261-af3a-a8d44bbd18ba"
      "br-sao"   = "r042-3915f0e3-aadc-4fc9-95a8-840f8cb163de"
      "au-syd"   = "r026-ed57accf-b3d4-4ca9-a6a6-e0a63ee1aba4"
      "us-south" = "r006-c9f07041-bb56-4492-b25c-5f407ebea358"
      "eu-gb"    = "r018-6dce329f-a6eb-4146-ba3e-5560afc84aa1"
      "jp-osa"   = "r034-4ecc10ff-3dc7-42fb-9cae-189fb559dd61"
      "us-east"  = "r014-87371e4c-3645-4579-857c-7e02fe5e9ff4"
      "ca-tor"   = "r038-0840034f-5d05-4a6d-bdae-123628f1d323"
    }
    f5-bigip-15-1-5-1-0-0-14-ltm-1slot = {
      "eu-de"    = "r010-efad005b-4deb-45a8-b1c5-5b3cea55e7e3"
      "jp-tok"   = "r022-35126a90-aec2-4934-a628-d1ce90bcf68a"
      "br-sao"   = "r042-978cecaf-7f2a-44bc-bffd-ddcf6ce56b11"
      "au-syd"   = "r026-429369e1-d917-4d9c-8a8c-3a8606e26a72"
      "us-south" = "r006-afe3c555-e8ba-4448-9983-151a14edf868"
      "eu-gb"    = "r018-f2083d86-6f25-42d6-b66a-d5ed2a0108d2"
      "jp-osa"   = "r034-edd01010-b7ee-411c-9158-d41960bf9def"
      "us-east"  = "r014-41db5a03-ab7f-4bf7-95c2-8edbeea0e3af"
      "ca-tor"   = "r038-f5d750b1-61dc-4fa5-98d3-a790417f07dd"
    }
    f5-bigip-16-1-2-2-0-0-28-ltm-1slot = {
      "eu-de"    = "r010-c90f3597-d03e-4ce6-8efa-870c782952cd"
      "jp-tok"   = "r022-0da3fc1b-c243-4702-87cc-b5a7f5e1f035"
      "br-sao"   = "r042-0649e2fc-0d27-4950-99a8-1d968bc72dd5"
      "au-syd"   = "r026-9de34b46-fc95-4940-a074-e45ac986c761"
      "us-south" = "r006-863f431b-f4e2-4d8c-a358-07746a146ea1"
      "eu-gb"    = "r018-a88026c2-89b4-43d6-8688-f28ac259627d"
      "jp-osa"   = "r034-585692ec-9508-4a41-bcc3-3a94b31ad161"
      "us-east"  = "r014-b675ae9f-109d-4499-9639-2fbc7b1d55e9"
      "ca-tor"   = "r038-56cc321b-1920-443e-a400-c58905c8f46c"
    }
    f5-bigip-16-1-2-2-0-0-28-all-1slot = {
      "eu-de"    = "r010-af6fa90b-ea18-48af-bfb9-a3605d60224d"
      "jp-tok"   = "r022-d2bffe3c-084e-43ae-b331-ec82b15af705"
      "br-sao"   = "r042-2dcd1226-5dd9-4b8d-89c5-5ba4f162b966"
      "au-syd"   = "r026-1f8b30f1-af86-433d-861c-7ff36d69176b"
      "us-south" = "r006-1c0242c4-a99c-4d27-ad2c-4003a7fea131"
      "eu-gb"    = "r018-d33e87cb-0342-41e2-8e29-2b0db4a5881f"
      "jp-osa"   = "r034-1b04698d-9935-4477-8f72-958c7f08c85f"
      "us-east"  = "r014-015d6b06-611e-4e1a-9284-551ed3832182"
      "ca-tor"   = "r038-b7a44268-e95f-425b-99ac-6ec5fc2c4cdc"
    }
  }
}

##############################################################################

##############################################################################
# Template Data
##############################################################################

locals {
  do_byol_license      = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      byoLicense:
        class: License
        licenseType: regKey
        regKey: null
EOD
  do_regekypool        = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      poolLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        reachable: false
        hypervisor: kvm
EOD
  do_utilitypool       = <<EOD
    schemaVersion: 1.0.0
    class: Device
    async: true
    label: Cloudinit Onboarding
    Common:
      class: Tenant
      utilityLicense:
        class: License
        licenseType: licensePool
        bigIqHost: host
        bigIqUsername: username
        bigIqPassword: f5bigip
        licensePool: pool
        skuKeyword1: key
        skuKeyword2: word
        unitOfMeasure: null
        reachable: false
        hypervisor: kvm
EOD
  template_file        = file("\${path.module}/f5_user_data.yaml")
  do_dec1              = chomp(local.do_byol_license)
  do_dec2              = local.do_dec1
  do_local_declaration = local.do_dec2
}

##############################################################################

##############################################################################
# F5 Ve 0 1 Zone 1 VSI
##############################################################################

data "template_file" "user_data_f5_ve_01_zone_1" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "f5-ve-01"
    domain                  = "local"
    default_route_interface = "1.1"
    default_route_gateway   = "10.10.10.11"
    do_local_declaration    = local.do_local_declaration
    do_declaration_url      = "hi"
    as3_declaration_url     = "hi"
    ts_declaration_url      = "hi"
    phone_home_url          = "hi"
    tgactive_url            = "hi"
    tgstandby_url           = "hi"
    tgrefresh_url           = "hi"
    template_source         = "f5devcentral/ibmcloud_schematics_bigip_multinic_declared"
    template_version        = "hi"
    zone                    = "us-south-1"
    vpc                     = ibm_is_vpc.edge_vpc.id
    app_id                  = "hi"
  }
}

resource "ibm_is_instance" "f5_ve_01_zone_1" {
  name               = "f5-ve-01-zone-1"
  image              = local.public_image_map["f5-bigip-16-1-2-2-0-0-28-all-1slot"]["us-south"]
  profile            = "cx2-4x8"
  resource_group     = ibm_resource_group.slz_edge_rg.id
  vpc                = ibm_is_vpc.edge_vpc.id
  zone               = "us-south-1"
  tags               = ["slz","landing-zone"]
  user_data          = data.template_file.user_data_f5_ve_01_zone_1.rendered

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.edge_f5_management_zone_1.id
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_management_sg_sg.id
    ]
  }

  network_interfaces {
    subnet            = ibm_is_subnet.edge_f5_bastion_zone_1.id
    allow_ip_spoofing = true
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_bastion_sg_sg.id
    ]
  }

  network_interfaces {
    subnet            = ibm_is_subnet.edge_f5_external_zone_1.id
    allow_ip_spoofing = true
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_external_sg_sg.id
    ]
  }

  network_interfaces {
    subnet            = ibm_is_subnet.edge_f5_workload_zone_1.id
    allow_ip_spoofing = true
    security_groups = [
      ibm_is_security_group.edge_vpc_f5_workload_sg_sg.id
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
    it("should return empty string when no f5 vsi", () => {
      assert.deepEqual(
        f5Tf({
          f5_vsi: [],
        }),
        "",
        "it should return correct data"
      );
    });
  });
});
