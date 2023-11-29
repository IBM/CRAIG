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
    default_route_gateway   = cidrhost("10.5.30.0/24", 1)
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
    zone                    = "\${var.region}-1"
    vpc                     = module.management_vpc.id
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
          vpcs: [
            {
              cos: null,
              bucket: null,
              name: "management",
              resource_group: "edge-rg",
              classic_access: false,
              manual_address_prefix_management: true,
              default_network_acl_name: null,
              default_routing_table_name: null,
              default_security_group_name: null,
              address_prefixes: [
                {
                  vpc: "edge",
                  zone: 1,
                  cidr: "10.5.0.0/16",
                  name: "edge-zone-1",
                },
                {
                  vpc: "edge",
                  zone: 2,
                  cidr: "10.6.0.0/16",
                  name: "edge-zone-2",
                },
                {
                  vpc: "edge",
                  zone: 3,
                  cidr: "10.7.0.0/16",
                  name: "edge-zone-3",
                },
              ],
              acls: [
                {
                  name: "edge-acl",
                  vpc: "edge",
                  resource_group: "edge-rg",
                  rules: [
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-ibm-inbound",
                      source: "161.26.0.0/16",
                      acl: "edge-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-all-network-inbound",
                      source: "10.0.0.0/8",
                      acl: "edge-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "0.0.0.0/0",
                      direction: "outbound",
                      name: "allow-all-outbound",
                      source: "0.0.0.0/0",
                      acl: "edge-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                  ],
                },
                {
                  name: "f5-external-acl",
                  vpc: "edge",
                  resource_group: "edge-rg",
                  rules: [
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-ibm-inbound",
                      source: "161.26.0.0/16",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-all-network-inbound",
                      source: "10.0.0.0/8",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "0.0.0.0/0",
                      direction: "outbound",
                      name: "allow-all-outbound",
                      source: "0.0.0.0/0",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-f5-external-443-inbound",
                      source: "0.0.0.0/0",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: 443,
                        port_min: 443,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                  ],
                },
              ],
              subnets: [
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  cidr: "10.5.60.0/24",
                  name: "f5-bastion-zone-1",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.60.0/24",
                  name: "f5-bastion-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.60.0/24",
                  name: "f5-bastion-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "f5-external-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.40.0/24",
                  name: "f5-external-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "f5-external-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.40.0/24",
                  name: "f5-external-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "f5-external-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.40.0/24",
                  name: "f5-external-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.30.0/24",
                  name: "f5-management-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.30.0/24",
                  name: "f5-management-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.30.0/24",
                  name: "f5-management-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.50.0/24",
                  name: "f5-workload-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.50.0/24",
                  name: "f5-workload-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.50.0/24",
                  name: "f5-workload-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.70.0/24",
                  name: "vpe-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.70.0/24",
                  name: "vpe-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.70.0/24",
                  name: "vpe-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.10.0/24",
                  name: "vpn-1-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.10.0/24",
                  name: "vpn-1-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.10.0/24",
                  name: "vpn-1-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.20.0/24",
                  name: "vpn-2-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.20.0/24",
                  name: "vpn-2-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.20.0/24",
                  name: "vpn-2-zone-3",
                  public_gateway: false,
                },
              ],
              public_gateways: [],
            },
          ],
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
    default_route_gateway   = cidrhost("10.5.30.0/24", 1)
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
    zone                    = "\${var.region}-1"
    vpc                     = module.management_vpc.id
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
          vpcs: [
            {
              cos: null,
              bucket: null,
              name: "management",
              resource_group: "edge-rg",
              classic_access: false,
              manual_address_prefix_management: true,
              default_network_acl_name: null,
              default_routing_table_name: null,
              default_security_group_name: null,
              address_prefixes: [
                {
                  vpc: "edge",
                  zone: 1,
                  cidr: "10.5.0.0/16",
                  name: "edge-zone-1",
                },
                {
                  vpc: "edge",
                  zone: 2,
                  cidr: "10.6.0.0/16",
                  name: "edge-zone-2",
                },
                {
                  vpc: "edge",
                  zone: 3,
                  cidr: "10.7.0.0/16",
                  name: "edge-zone-3",
                },
              ],
              acls: [
                {
                  name: "edge-acl",
                  vpc: "edge",
                  resource_group: "edge-rg",
                  rules: [
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-ibm-inbound",
                      source: "161.26.0.0/16",
                      acl: "edge-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-all-network-inbound",
                      source: "10.0.0.0/8",
                      acl: "edge-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "0.0.0.0/0",
                      direction: "outbound",
                      name: "allow-all-outbound",
                      source: "0.0.0.0/0",
                      acl: "edge-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                  ],
                },
                {
                  name: "f5-external-acl",
                  vpc: "edge",
                  resource_group: "edge-rg",
                  rules: [
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-ibm-inbound",
                      source: "161.26.0.0/16",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-all-network-inbound",
                      source: "10.0.0.0/8",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "0.0.0.0/0",
                      direction: "outbound",
                      name: "allow-all-outbound",
                      source: "0.0.0.0/0",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-f5-external-443-inbound",
                      source: "0.0.0.0/0",
                      acl: "f5-external-acl",
                      vpc: "edge",
                      tcp: {
                        port_max: 443,
                        port_min: 443,
                        source_port_min: null,
                        source_port_max: null,
                      },
                      icmp: {
                        code: null,
                        type: null,
                      },
                      udp: {
                        port_max: null,
                        port_min: null,
                        source_port_min: null,
                        source_port_max: null,
                      },
                    },
                  ],
                },
              ],
              subnets: [
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  cidr: "10.5.60.0/24",
                  name: "f5-bastion-zone-1",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.60.0/24",
                  name: "f5-bastion-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.60.0/24",
                  name: "f5-bastion-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "f5-external-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.40.0/24",
                  name: "f5-external-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "f5-external-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.40.0/24",
                  name: "f5-external-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "f5-external-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.40.0/24",
                  name: "f5-external-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.30.0/24",
                  name: "f5-management-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.30.0/24",
                  name: "f5-management-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.30.0/24",
                  name: "f5-management-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.50.0/24",
                  name: "f5-workload-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.50.0/24",
                  name: "f5-workload-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.50.0/24",
                  name: "f5-workload-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.70.0/24",
                  name: "vpe-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.70.0/24",
                  name: "vpe-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.70.0/24",
                  name: "vpe-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.10.0/24",
                  name: "vpn-1-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.10.0/24",
                  name: "vpn-1-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.10.0/24",
                  name: "vpn-1-zone-3",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 1,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.5.20.0/24",
                  name: "vpn-2-zone-1",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 2,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.6.20.0/24",
                  name: "vpn-2-zone-2",
                  public_gateway: false,
                },
                {
                  vpc: "edge",
                  zone: 3,
                  network_acl: "edge-acl",
                  resource_group: "edge-rg",
                  has_prefix: true,
                  cidr: "10.7.20.0/24",
                  name: "vpn-2-zone-3",
                  public_gateway: false,
                },
              ],
              public_gateways: [],
            },
          ],
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("f5Tf", () => {
    it("should return correct f5 vsi terraform", () => {
      let actualData = f5Tf({ ...slzNetwork });
      let expectedData = `##############################################################################
# F5 Image IDs
##############################################################################

locals {
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
# F5 Ve 01 Zone 1 VSI
##############################################################################

data "template_file" "user_data_f5_ve_01_zone_1" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "f5-ve-01"
    domain                  = "local"
    default_route_interface = "1.1"
    default_route_gateway   = cidrhost("10.5.30.0/24", 1)
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
    zone                    = "\${var.region}-1"
    vpc                     = module.edge_vpc.id
    app_id                  = "hi"
  }
}

resource "ibm_is_instance" "f5_ve_01_zone_1" {
  name           = "f5-ve-01-zone-1"
  image          = local.public_image_map["f5-bigip-16-1-2-2-0-0-28-all-1slot"]["us-south"]
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_edge_rg.id
  vpc            = module.edge_vpc.id
  zone           = "\${var.region}-1"
  user_data      = data.template_file.user_data_f5_ve_01_zone_1.rendered
  tags = [
    "slz",
    "landing-zone"
  ]
  primary_network_interface {
    subnet = module.edge_vpc.f5_management_zone_1_id
    security_groups = [
      module.edge_vpc.f5_management_sg_id
    ]
  }
  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_bastion_zone_1_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_bastion_sg_id
    ]
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_external_zone_1_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_external_sg_id
    ]
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_workload_zone_1_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_workload_sg_id
    ]
  }
  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct f5 vsi terraform", () => {
      let actualData = f5Tf({
        _options: {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"],
          zones: 3,
          endpoints: "private",
          account_id: "",
          fs_cloud: true,
          enable_classic: false,
          dynamic_subnets: false,
          enable_power_vs: true,
          power_vs_zones: ["us-south"],
          craig_version: "1.7.0",
          template: "Power VS SAP Hana",
        },
        access_groups: [],
        appid: [],
        atracker: {
          enabled: true,
          type: "cos",
          name: "atracker",
          target_name: "atracker-cos",
          bucket: "atracker-bucket",
          add_route: true,
          cos_key: "cos-bind-key",
          locations: ["global", "us-south"],
        },
        cbr_rules: [],
        cbr_zones: [],
        clusters: [],
        dns: [],
        event_streams: [],
        f5_vsi: [
          {
            kms: "kms",
            subnet: "f5-management-zone-1",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-1",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-1",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-1",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 1,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
          {
            kms: "kms",
            subnet: "f5-management-zone-2",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-2",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-2",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-2",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 2,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
          {
            kms: "kms",
            subnet: "f5-management-zone-3",
            vpc: "edge",
            resource_group: "edge-rg",
            ssh_keys: ["ssh-key"],
            security_groups: ["f5-management-sg"],
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-3",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-3",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-3",
              },
            ],
            template: {
              hostname: "f5-ve-01",
              domain: "local",
              default_route_gateway_cidr: "10.10.10.10/24",
              zone: 3,
              vpc: "edge",
              do_declaration_url: "null",
              as3_declaration_url: "null",
              ts_declaration_url: "null",
              phone_home_url: "null",
              tgstandby_url: "null",
              tgrefresh_url: "null",
              tgactive_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              app_id: "null",
              license_type: "none",
              license_host: "null",
              license_username: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              tmos_admin_password: null,
            },
          },
        ],
        iam_account_settings: {
          enable: false,
          mfa: null,
          allowed_ip_addresses: null,
          include_history: false,
          if_match: null,
          max_sessions_per_identity: null,
          restrict_create_service_id: null,
          restrict_create_platform_apikey: null,
          session_expiration_in_seconds: null,
          session_invalidation_in_seconds: null,
        },
        icd: [],
        key_management: [
          {
            name: "kms",
            resource_group: "service-rg",
            use_hs_crypto: false,
            authorize_vpc_reader_role: true,
            use_data: false,
            keys: [
              {
                key_ring: "ring",
                name: "key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 1,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "atracker-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 1,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "vsi-volume-key",
                root_key: true,
                force_delete: true,
                endpoint: "public",
                rotation: 1,
                dual_auth_delete: false,
              },
              {
                key_ring: "ring",
                name: "roks-key",
                root_key: true,
                force_delete: null,
                endpoint: null,
                rotation: 1,
                dual_auth_delete: false,
              },
            ],
          },
        ],
        load_balancers: [],
        logdna: {
          enabled: false,
          plan: "lite",
          endpoints: "private",
          platform_logs: false,
          resource_group: "service-rg",
          cos: "atracker-cos",
          bucket: "atracker-bucket",
        },
        object_storage: [
          {
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "atracker-key",
                name: "atracker-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
            ],
            keys: [
              {
                name: "cos-bind-key",
                role: "Writer",
                enable_hmac: false,
                use_random_suffix: true,
              },
            ],
            name: "atracker-cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
            use_random_suffix: true,
            kms: "kms",
          },
          {
            buckets: [
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "management-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
              {
                endpoint: "public",
                force_delete: true,
                kms_key: "key",
                name: "workload-bucket",
                storage_class: "standard",
                use_random_suffix: true,
              },
              {
                force_delete: false,
                name: "edge-bucket",
                storage_class: "standard",
                kms_key: "key",
                endpoint: "public",
                use_random_suffix: true,
              },
            ],
            use_random_suffix: true,
            keys: [],
            name: "cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
            kms: "kms",
          },
        ],
        power: [
          {
            name: "secure-powervs",
            resource_group: "powervs-rg",
            zone: "us-south",
            ssh_keys: [
              {
                name: "power-ssh-key",
                public_key:
                  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC5Zx4PO/vXJ7ptTy84KuUcf7D4XKE20zErMHlnIefwcsGnfSacqqyGyZDpT/CedgtiHFNPBItzMYGpfqF9UZ2a0C3LfdWPt1JE4pHGHE2NoujGVhACSJKADFia6d2u6go1SP3aXmTFYlCWl/z6NJ2rq/Tz3jH5w3oc7QbS+awXzTz/Vw0AIgUJXVqCNWSy9kVnPwTI3dwBdc61ttfQzwAbJm0A2dduHex/Ztstx9pcPeFcULf/muVUjOeqJKCYqgJpO7TDEE4VEQQqj+qUrmWxP/7nMt1SAuxtX1Ey/8LPnu0WN43tVfEUSA58GrkT4YOLp5+N2jwVXd1twuOcyxkq9DM54JEyPe8JWTvgxPt24QzUWoAIPZ9zeLsdcC7DtgVzyR+6f2tmcEn+t/0XHxSOzkcOSRouuDdzEE7YOG9Co/zVLLEoWA7Qfz0ObuQ2ex8WRbTRSbDc7o2++VxPsh4zR9KKVRfzssCtLnRxoGHWTTBI/syUl8kQcy8TCNTDuHE= ay1man1@Aymans-MBP-WORK",
                use_data: false,
                resource_group: "powervs-rg",
                workspace: "secure-powervs",
                zone: "us-south",
              },
            ],
            network: [
              {
                name: "management",
                pi_network_type: "vlan",
                pi_cidr: "10.51.0.0/24",
                pi_dns: ["127.0.0.1"],
                pi_network_jumbo: false,
                workspace: "secure-powervs",
                zone: "us-south",
              },
              {
                name: "backup",
                pi_network_type: "vlan",
                pi_cidr: "10.52.0.0/24",
                pi_dns: ["127.0.0.1"],
                pi_network_jumbo: false,
                workspace: "secure-powervs",
                zone: "us-south",
                depends_on: [
                  "${ibm_pi_network.power_network_secure_powervs_management}",
                ],
              },
              {
                name: "sap",
                pi_network_type: "vlan",
                pi_cidr: "10.53.0.0/24",
                pi_dns: ["127.0.0.1"],
                pi_network_jumbo: false,
                workspace: "secure-powervs",
                zone: "us-south",
                depends_on: [
                  "${ibm_pi_network.power_network_secure_powervs_backup}",
                ],
              },
            ],
            cloud_connections: [],
            images: [
              {
                name: "RHEL8-SP4-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "3a1fd0fd-24df-44a1-919a-7041f9c74fc0",
              },
              {
                name: "RHEL8-SP4-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "a1e22955-749d-4b4a-aeba-d297d60fcb0b",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp4_sap}",
                ],
              },
              {
                name: "RHEL8-SP6-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "268144b8-6223-48e4-a26e-bdc8f71f6c60",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp4_sap_netweaver}",
                ],
              },
              {
                name: "RHEL8-SP6-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "658ba2a0-4add-40b9-a177-a28a856c26de",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp6_sap}",
                ],
              },
              {
                name: "SLES15-SP2-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "5d548cc2-e813-4c09-beb5-8f22b094905d",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_rhel8_sp6_sap_netweaver}",
                ],
              },
              {
                name: "SLES15-SP2-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "52579206-7efd-43ae-8417-ce5acac95d31",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp2_sap}",
                ],
              },
              {
                name: "SLES15-SP3-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "423bc6f6-bb0d-44c2-ad26-8705ae83f5ca",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp2_sap_netweaver}",
                ],
              },
              {
                name: "SLES15-SP3-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "1a62ac4a-83e7-4dee-a36f-983521f1826c",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp3_sap}",
                ],
              },
              {
                name: "SLES15-SP4-SAP",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "a6b8f8d5-86e0-4fb2-b335-2ce3f1a88612",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp3_sap_netweaver}",
                ],
              },
              {
                name: "SLES15-SP4-SAP-NETWEAVER",
                workspace: "secure-powervs",
                zone: "us-south",
                pi_image_id: "071e1eac-8aa2-4259-9c0e-5ec268f610e2",
                depends_on: [
                  "${ibm_pi_image.power_image_secure_powervs_sles15_sp4_sap}",
                ],
              },
            ],
            attachments: [
              {
                network: "management",
                workspace: "secure-powervs",
                zone: "us-south",
                connections: [],
              },
              {
                network: "backup",
                workspace: "secure-powervs",
                zone: "us-south",
                connections: [],
              },
              {
                network: "sap",
                workspace: "secure-powervs",
                zone: "us-south",
                connections: [],
              },
            ],
            imageNames: [
              "RHEL8-SP4-SAP",
              "RHEL8-SP4-SAP-NETWEAVER",
              "RHEL8-SP6-SAP",
              "RHEL8-SP6-SAP-NETWEAVER",
              "SLES15-SP2-SAP",
              "SLES15-SP2-SAP-NETWEAVER",
              "SLES15-SP3-SAP",
              "SLES15-SP3-SAP-NETWEAVER",
              "SLES15-SP4-SAP",
              "SLES15-SP4-SAP-NETWEAVER",
            ],
          },
        ],
        power_instances: [
          {
            name: "secure-file-share",
            workspace: "secure-powervs",
            image: "RHEL8-SP4-SAP",
            network: [
              {
                name: "backup",
                ip_address: "",
              },
              {
                name: "management",
                ip_address: "",
              },
            ],
            zone: "us-south",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier1",
            ssh_key: "power-ssh-key",
            pi_sys_type: "s922",
            pi_memory: "2",
            pi_processors: ".5",
            storage_option: "Storage Type",
            pi_storage_pool_affinity: false,
            sap: false,
          },
          {
            name: "sap-hana",
            workspace: "secure-powervs",
            image: "RHEL8-SP6-SAP",
            network: [
              {
                name: "backup",
                ip_address: "",
              },
              {
                name: "management",
                ip_address: "",
              },
              {
                name: "sap",
                ip_address: "",
              },
            ],
            zone: "us-south",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier3",
            ssh_key: "power-ssh-key",
            pi_sys_type: "e880",
            pi_memory: "256",
            pi_processors: "4",
            pi_affinity_volume: null,
            pi_affinity_instance: null,
            pi_anti_affinity_instance: null,
            pi_anti_affinity_volume: null,
            storage_option: "Storage Type",
            pi_storage_pool_affinity: false,
            sap: true,
            sap_profile: "ush1-4x256",
          },
          {
            name: "sap-netweaver",
            workspace: "secure-powervs",
            image: "RHEL8-SP6-SAP-NETWEAVER",
            network: [
              {
                name: "backup",
                ip_address: "",
              },
              {
                name: "management",
                ip_address: "",
              },
              {
                name: "sap",
                ip_address: "",
              },
            ],
            zone: "us-south",
            pi_health_status: "OK",
            pi_proc_type: "shared",
            pi_storage_type: "tier3",
            ssh_key: "power-ssh-key",
            pi_sys_type: "e880",
            pi_processors: "3",
            pi_memory: "50",
            storage_option: "Storage Type",
            pi_storage_pool_affinity: false,
            sap: false,
          },
        ],
        power_volumes: [
          {
            name: "sapmnt",
            workspace: "secure-powervs",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier3",
            attachments: ["sap-hana", "sap-netweaver"],
            zone: "us-south",
            pi_volume_size: "300",
          },
          {
            name: "trans",
            workspace: "secure-powervs",
            pi_volume_shareable: true,
            pi_replication_enabled: false,
            pi_volume_type: "tier3",
            attachments: ["sap-hana", "sap-netweaver"],
            zone: "us-south",
            pi_volume_size: "50",
          },
          {
            name: "sap-hana-sap-data-1",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-data-2",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-data-3",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-data-4",
            mount: "/hana/data",
            pi_volume_size: 71,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-1",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-2",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-3",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-log-4",
            mount: "/hana/log",
            pi_volume_size: 33,
            pi_volume_type: "tier1",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
          {
            name: "sap-hana-sap-shared",
            mount: "/hana/shared",
            pi_volume_size: 256,
            pi_volume_type: "tier3",
            workspace: "secure-powervs",
            sap: true,
            attachments: ["sap-hana"],
            zone: "us-south",
            storage_option: "Storage Type",
            affinity_type: null,
          },
        ],
        resource_groups: [
          {
            use_prefix: true,
            name: "service-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "workload-rg",
            use_data: false,
          },
          {
            use_data: false,
            use_prefix: true,
            name: "edge-rg",
          },
          {
            use_data: false,
            name: "powervs-rg",
            use_prefix: true,
          },
        ],
        routing_tables: [],
        scc: {
          credential_description: null,
          id: null,
          passphrase: null,
          name: "",
          location: "us",
          collector_description: null,
          is_public: false,
          scope_description: null,
          enable: false,
        },
        secrets_manager: [],
        security_groups: [
          {
            name: "f5-management-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-management-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            name: "f5-external-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "f5-external-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-inbound-443",
                source: "0.0.0.0/0",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            name: "f5-bastion-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "1-inbound-3023",
                source: "10.5.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "1-inbound-3080",
                source: "10.5.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "2-inbound-3023",
                source: "10.6.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "2-inbound-3080",
                source: "10.6.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "3-inbound-3023",
                source: "10.7.80.0/24",
                tcp: {
                  port_max: 3025,
                  port_min: 3023,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "f5-bastion-sg",
                vpc: "edge",
                direction: "inbound",
                name: "3-inbound-3080",
                source: "10.7.80.0/24",
                tcp: {
                  port_max: 3080,
                  port_min: 3080,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            name: "edge-vpe-sg",
            resource_group: "edge-rg",
            rules: [
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
              {
                sg: "edge-vpe-sg",
                vpc: "edge",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
              },
            ],
            vpc: "edge",
          },
          {
            vpc: "management",
            name: "management-vpe",
            resource_group: "management-rg",
            rules: [
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
            ],
          },
          {
            vpc: "workload",
            name: "workload-vpe",
            resource_group: "workload-rg",
            rules: [
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "workload",
                sg: "workload-vpe",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
            ],
          },
          {
            vpc: "management",
            name: "management-vsi",
            resource_group: "management-rg",
            rules: [
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "inbound",
                name: "allow-vpc-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-vpc-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-ibm-tcp-53-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 53,
                  port_min: 53,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-ibm-tcp-80-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 80,
                  port_min: 80,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
              {
                vpc: "management",
                sg: "management-vsi",
                direction: "outbound",
                name: "allow-ibm-tcp-443-outbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                icmp: {
                  type: null,
                  code: null,
                },
              },
            ],
          },
        ],
        ssh_keys: [
          {
            name: "ssh-key",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC5Zx4PO/vXJ7ptTy84KuUcf7D4XKE20zErMHlnIefwcsGnfSacqqyGyZDpT/CedgtiHFNPBItzMYGpfqF9UZ2a0C3LfdWPt1JE4pHGHE2NoujGVhACSJKADFia6d2u6go1SP3aXmTFYlCWl/z6NJ2rq/Tz3jH5w3oc7QbS+awXzTz/Vw0AIgUJXVqCNWSy9kVnPwTI3dwBdc61ttfQzwAbJm0A2dduHex/Ztstx9pcPeFcULf/muVUjOeqJKCYqgJpO7TDEE4VEQQqj+qUrmWxP/7nMt1SAuxtX1Ey/8LPnu0WN43tVfEUSA58GrkT4YOLp5+N2jwVXd1twuOcyxkq9DM54JEyPe8JWTvgxPt24QzUWoAIPZ9zeLsdcC7DtgVzyR+6f2tmcEn+t/0XHxSOzkcOSRouuDdzEE7YOG9Co/zVLLEoWA7Qfz0ObuQ2ex8WRbTRSbDc7o2++VxPsh4zR9KKVRfzssCtLnRxoGHWTTBI/syUl8kQcy8TCNTDuHE= ay1man1@Aymans-MBP-WORK",
            resource_group: "management-rg",
            use_data: false,
          },
        ],
        sysdig: {
          enabled: false,
          plan: "graduated-tier",
          resource_group: "service-rg",
        },
        teleport_vsi: [],
        transit_gateways: [
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
        virtual_private_endpoints: [
          {
            name: "management-cos",
            service: "cos",
            vpc: "management",
            resource_group: "management-rg",
            security_groups: ["management-vpe"],
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
          {
            name: "workload-cos",
            service: "cos",
            vpc: "workload",
            resource_group: "workload-rg",
            security_groups: ["workload-vpe"],
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
        ],
        vpcs: [
          {
            cos: "cos",
            bucket: "edge-bucket",
            name: "edge",
            resource_group: "edge-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_routing_table_name: null,
            default_security_group_name: null,
            address_prefixes: [
              {
                vpc: "edge",
                zone: 1,
                cidr: "10.5.0.0/16",
                name: "edge-zone-1",
              },
              {
                vpc: "edge",
                zone: 2,
                cidr: "10.6.0.0/16",
                name: "edge-zone-2",
              },
              {
                vpc: "edge",
                zone: 3,
                cidr: "10.7.0.0/16",
                name: "edge-zone-3",
              },
            ],
            acls: [
              {
                name: "edge-acl",
                vpc: "edge",
                resource_group: "edge-rg",
                rules: [
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    acl: "edge-acl",
                    vpc: "edge",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
              {
                name: "f5-external-acl",
                vpc: "edge",
                resource_group: "edge-rg",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-f5-external-443-inbound",
                    source: "0.0.0.0/0",
                    acl: "f5-external-acl",
                    vpc: "edge",
                    tcp: {
                      port_max: 443,
                      port_min: 443,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    icmp: {
                      code: null,
                      type: null,
                    },
                    udp: {
                      port_max: null,
                      port_min: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
            subnets: [
              {
                vpc: "edge",
                name: "f5-bastion-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-bastion-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-bastion-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.50.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-external-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.40.0/24",
                network_acl: "f5-external-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "f5-management-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.30.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpe-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.60.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-1-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.10.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-1",
                zone: 1,
                resource_group: "edge-rg",
                cidr: "10.5.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-2",
                zone: 2,
                resource_group: "edge-rg",
                cidr: "10.6.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
              {
                vpc: "edge",
                name: "vpn-2-zone-3",
                zone: 3,
                resource_group: "edge-rg",
                cidr: "10.7.20.0/24",
                network_acl: "edge-acl",
                public_gateway: false,
                has_prefix: true,
              },
            ],
            public_gateways: [],
            publicGateways: [],
          },
          {
            cos: "cos",
            bucket: "management-bucket",
            name: "management",
            resource_group: "management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            publicGateways: [],
            address_prefixes: [
              {
                name: "vsi-zone-1",
                cidr: "10.10.0.0/29",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.0.16/28",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vsi-zone-2",
                cidr: "10.20.0.0/29",
                zone: 2,
                vpc: "management",
              },
              {
                name: "vsi-zone-3",
                cidr: "10.30.0.0/29",
                zone: 3,
                vpc: "management",
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.0.48/29",
                zone: 1,
                vpc: "management",
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.0.16/29",
                zone: 2,
                vpc: "management",
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.0.16/29",
                zone: 3,
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.0.0/29",
                name: "vsi-zone-1",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.0.16/28",
                name: "vpn-zone-1",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 2,
                cidr: "10.20.0.0/29",
                name: "vsi-zone-2",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 3,
                cidr: "10.30.0.0/29",
                name: "vsi-zone-3",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 1,
                cidr: "10.10.0.48/29",
                name: "vpe-zone-1",
                resource_group: "management-rg",
                network_acl: "management",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 2,
                cidr: "10.20.0.16/29",
                name: "vpe-zone-2",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "management",
                zone: 3,
                cidr: "10.30.0.16/29",
                name: "vpe-zone-3",
                network_acl: "management",
                resource_group: "management-rg",
                public_gateway: false,
                has_prefix: false,
              },
            ],
            public_gateways: [],
            acls: [
              {
                resource_group: "management-rg",
                name: "management",
                vpc: "management",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "management",
                    vpc: "management",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    source: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-ibm-outbound",
                    destination: "161.26.0.0/16",
                    acl: "management",
                    vpc: "management",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "management",
                    vpc: "management",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    acl: "management",
                    vpc: "management",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
          },
          {
            cos: "cos",
            bucket: "workload-bucket",
            name: "workload",
            resource_group: "workload-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            publicGateways: [],
            address_prefixes: [
              {
                name: "vsi-zone-1",
                cidr: "10.40.0.0/28",
                zone: 1,
                vpc: "workload",
              },
              {
                name: "vsi-zone-2",
                cidr: "10.50.0.0/28",
                zone: 2,
                vpc: "workload",
              },
              {
                name: "vsi-zone-3",
                cidr: "10.60.0.0/28",
                zone: 3,
                vpc: "workload",
              },
              {
                name: "vpe-zone-1",
                cidr: "10.40.0.32/29",
                zone: 1,
                vpc: "workload",
              },
              {
                name: "vpe-zone-2",
                cidr: "10.50.0.32/29",
                zone: 2,
                vpc: "workload",
              },
              {
                name: "vpe-zone-3",
                cidr: "10.60.0.32/29",
                zone: 3,
                vpc: "workload",
              },
            ],
            subnets: [
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.40.0.0/28",
                name: "vsi-zone-1",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.50.0.0/28",
                name: "vsi-zone-2",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.60.0.0/28",
                name: "vsi-zone-3",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 1,
                cidr: "10.40.0.32/29",
                name: "vpe-zone-1",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 2,
                cidr: "10.50.0.32/29",
                name: "vpe-zone-2",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
              {
                vpc: "workload",
                zone: 3,
                cidr: "10.60.0.32/29",
                name: "vpe-zone-3",
                network_acl: "workload",
                resource_group: "workload-rg",
                public_gateway: false,
                has_prefix: false,
              },
            ],
            public_gateways: [],
            acls: [
              {
                resource_group: "workload-rg",
                name: "workload",
                vpc: "workload",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    acl: "workload",
                    vpc: "workload",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    source: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-ibm-outbound",
                    destination: "161.26.0.0/16",
                    acl: "workload",
                    vpc: "workload",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    acl: "workload",
                    vpc: "workload",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "outbound",
                    name: "allow-all-network-outbound",
                    source: "10.0.0.0/8",
                    acl: "workload",
                    vpc: "workload",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
          },
        ],
        vpn_gateways: [
          {
            name: "management-gateway",
            resource_group: "management-rg",
            subnet: "vpn-zone-1",
            vpc: "management",
          },
        ],
        vpn_servers: [],
        vsi: [
          {
            kms: "kms",
            encryption_key: "vsi-volume-key",
            image: "ibm-ubuntu-22-04-1-minimal-amd64-1",
            profile: "cx2-4x8",
            name: "management-server",
            security_groups: ["management-vsi"],
            ssh_keys: ["ssh-key"],
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc: "management",
            vsi_per_subnet: 2,
            resource_group: "management-rg",
            override_vsi_name: null,
            user_data: "",
            network_interfaces: [],
            volumes: [],
          },
        ],
        classic_ssh_keys: [],
        classic_vlans: [],
        classic_gateways: [],
      });
      let expectedData = `##############################################################################
# F5 Image IDs
##############################################################################

locals {
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
        bigIqHost: null
        bigIqUsername: null
        bigIqPassword: null
        licensePool: null
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
        bigIqHost: null
        bigIqUsername: null
        bigIqPassword: null
        licensePool: null
        skuKeyword1: null
        skuKeyword2: null
        unitOfMeasure: null
        reachable: false
        hypervisor: kvm
EOD
  template_file        = file("\${path.module}/f5_user_data.yaml")
  do_dec1              = "null"
  do_dec2              = local.do_dec1
  do_local_declaration = local.do_dec2
}

##############################################################################

##############################################################################
# F5 Zone 1 VSI
##############################################################################

data "template_file" "user_data_f5_zone_1" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "f5-ve-01"
    domain                  = "local"
    default_route_interface = "1.1"
    default_route_gateway   = cidrhost("10.5.30.0/24", 1)
    do_local_declaration    = local.do_local_declaration
    do_declaration_url      = "null"
    as3_declaration_url     = "null"
    ts_declaration_url      = "null"
    phone_home_url          = "null"
    tgactive_url            = "null"
    tgstandby_url           = "null"
    tgrefresh_url           = "null"
    template_source         = "f5devcentral/ibmcloud_schematics_bigip_multinic_declared"
    template_version        = "20210201"
    zone                    = "$\{var.region}-1"
    vpc                     = module.edge_vpc.id
    app_id                  = "null"
  }
}

resource "ibm_is_instance" "f5_zone_1" {
  name           = "f5-zone-1"
  image          = local.public_image_map["f5-bigip-15-1-5-1-0-0-14-all-1slot"]["us-south"]
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.edge_rg.id
  vpc            = module.edge_vpc.id
  zone           = "$\{var.region}-1"
  user_data      = data.template_file.user_data_f5_zone_1.rendered
  tags = [
    "hello",
    "world"
  ]
  primary_network_interface {
    subnet = module.edge_vpc.f5_management_zone_1_id
    security_groups = [
      module.edge_vpc.f5_management_sg_id
    ]
  }
  boot_volume {
    encryption = ibm_kms_key.kms_vsi_volume_key_key.crn
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_bastion_zone_1_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_bastion_sg_id
    ]
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_external_zone_1_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_external_sg_id
    ]
  }
  keys = [
    ibm_is_ssh_key.ssh_key.id
  ]
}

##############################################################################

##############################################################################
# F5 Zone 2 VSI
##############################################################################

data "template_file" "user_data_f5_zone_2" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "f5-ve-01"
    domain                  = "local"
    default_route_interface = "1.1"
    default_route_gateway   = cidrhost("10.5.30.0/24", 1)
    do_local_declaration    = local.do_local_declaration
    do_declaration_url      = "null"
    as3_declaration_url     = "null"
    ts_declaration_url      = "null"
    phone_home_url          = "null"
    tgactive_url            = "null"
    tgstandby_url           = "null"
    tgrefresh_url           = "null"
    template_source         = "f5devcentral/ibmcloud_schematics_bigip_multinic_declared"
    template_version        = "20210201"
    zone                    = "$\{var.region}-2"
    vpc                     = module.edge_vpc.id
    app_id                  = "null"
  }
}

resource "ibm_is_instance" "f5_zone_2" {
  name           = "f5-zone-2"
  image          = local.public_image_map["f5-bigip-15-1-5-1-0-0-14-all-1slot"]["us-south"]
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.edge_rg.id
  vpc            = module.edge_vpc.id
  zone           = "$\{var.region}-2"
  user_data      = data.template_file.user_data_f5_zone_2.rendered
  tags = [
    "hello",
    "world"
  ]
  primary_network_interface {
    subnet = module.edge_vpc.f5_management_zone_2_id
    security_groups = [
      module.edge_vpc.f5_management_sg_id
    ]
  }
  boot_volume {
    encryption = ibm_kms_key.kms_vsi_volume_key_key.crn
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_bastion_zone_2_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_bastion_sg_id
    ]
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_external_zone_2_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_external_sg_id
    ]
  }
  keys = [
    ibm_is_ssh_key.ssh_key.id
  ]
}

##############################################################################

##############################################################################
# F5 Zone 3 VSI
##############################################################################

data "template_file" "user_data_f5_zone_3" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "f5-ve-01"
    domain                  = "local"
    default_route_interface = "1.1"
    default_route_gateway   = cidrhost("10.5.30.0/24", 1)
    do_local_declaration    = local.do_local_declaration
    do_declaration_url      = "null"
    as3_declaration_url     = "null"
    ts_declaration_url      = "null"
    phone_home_url          = "null"
    tgactive_url            = "null"
    tgstandby_url           = "null"
    tgrefresh_url           = "null"
    template_source         = "f5devcentral/ibmcloud_schematics_bigip_multinic_declared"
    template_version        = "20210201"
    zone                    = "$\{var.region}-3"
    vpc                     = module.edge_vpc.id
    app_id                  = "null"
  }
}

resource "ibm_is_instance" "f5_zone_3" {
  name           = "f5-zone-3"
  image          = local.public_image_map["f5-bigip-15-1-5-1-0-0-14-all-1slot"]["us-south"]
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.edge_rg.id
  vpc            = module.edge_vpc.id
  zone           = "$\{var.region}-3"
  user_data      = data.template_file.user_data_f5_zone_3.rendered
  tags = [
    "hello",
    "world"
  ]
  primary_network_interface {
    subnet = module.edge_vpc.f5_management_zone_3_id
    security_groups = [
      module.edge_vpc.f5_management_sg_id
    ]
  }
  boot_volume {
    encryption = ibm_kms_key.kms_vsi_volume_key_key.crn
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_bastion_zone_3_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_bastion_sg_id
    ]
  }
  network_interfaces {
    subnet            = module.edge_vpc.f5_external_zone_3_id
    allow_ip_spoofing = true
    security_groups = [
      module.edge_vpc.f5_external_sg_id
    ]
  }
  keys = [
    ibm_is_ssh_key.ssh_key.id
  ]
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
