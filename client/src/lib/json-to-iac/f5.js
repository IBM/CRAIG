const { snakeCase } = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");
const { composedZone, vpcRef, tfBlock } = require("./utils");
const { formatVsi } = require("./vsi");

/**
 * format f5 image locals
 * @returns {string} f5 image data as locals
 */
function f5ImageLocals() {
  return `##############################################################################
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
}

/**
 * create cloud init yaml for f5
 * @returns {string} cloud init yaml
 */
function f5CloudInitYaml() {
  return `#cloud-config
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
}

/**
 * create f5 template locals
 * @param {Object} template f5 template data
 * @param {string} template.byol_license_basekey Bring your own license registration key for the F5 BIG-IP instance
 * @param {string} template.license_unit_of_measure BIGIQ utility pool unit of measurement (ex. hourly)
 * @returns {string} terraform string
 */
function f5TemplateLocals(template) {
  return `##############################################################################
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
        regKey: ${template.byol_license_basekey || null}
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
        bigIqHost: \${var.license_host}
        bigIqUsername: \${var.license_username}
        bigIqPassword: \${var.license_password}
        licensePool: \${var.license_pool}
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
        bigIqHost: \${var.license_host}
        bigIqUsername: \${var.license_username}
        bigIqPassword: \${var.license_password}
        licensePool: \${var.license_pool}
        skuKeyword1: \${var.license_sku_keyword_1}
        skuKeyword2: \${var.license_sku_keyword_2}
        unitOfMeasure: ${template.license_unit_of_measure || null}
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
}

/**
 * create user data template for f5 instance
 * @param {Object} template
 * @param {string} template.hostname The F5 BIG-IP hostname
 * @param {string} template.domain The F5 BIG-IP domain name
 * @param {string} template.default_route_gateway_cidr instance cidr
 * @param {string} template.zone zone number
 * @param {string} template.vpc vpc name
 * @param {string} template.do_declaration_url URL to fetch the f5-declarative-onboarding declaration
 * @param {string} template.as3_declaration_url URL to fetch the f5-appsvcs-extension declaration
 * @param {string} template.ts_declaration_url URL to fetch the f5-telemetry-streaming declaration
 * @param {string} template.phone_home_url The web hook URL to POST status to when F5 BIG-IP onboarding completes
 * @param {string} template.tgactive_url The URL to POST L3 addresses when tgactive is triggered
 * @param {string} template.tgstandby_url The URL to POST L3 addresses when tgstandby is triggered
 * @param {string} template.tgrefresh_url The URL to POST L3 addresses when tgrefresh is triggered
 * @param {string} template.template_version The terraform template version for phone_home_url_metadata
 * @param {string} template.app_id The terraform application id for phone_home_url_metadata
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @returns {string} terraform formatted template file
 */
function f5TemplateUserData(template, config) {
  let gatewayCidr = template.default_route_gateway_cidr.split("/");
  return `
data "template_file" "user_data_${snakeCase(
    `${template.hostname} zone ${template.zone}`
  )}" {
  template = local.template_file
  vars = {
    tmos_admin_password     = var.tmos_admin_password
    configsync_interface    = "1.1"
    hostname                = "${template.hostname}"
    domain                  = "${template.domain}"
    default_route_interface = "1.1"
    default_route_gateway   = "${gatewayCidr[0].replace(/\d$/i, "1")}"
    do_local_declaration    = local.do_local_declaration
    do_declaration_url      = "${template.do_declaration_url || "null"}"
    as3_declaration_url     = "${template.as3_declaration_url || "null"}"
    ts_declaration_url      = "${template.ts_declaration_url || "null"}"
    phone_home_url          = "${template.phone_home_url || "null"}"
    tgactive_url            = "${template.tgactive_url || ""}"
    tgstandby_url           = "${template.tgstandby_url || "null"}"
    tgrefresh_url           = "${template.tgrefresh_url || "null"}"
    template_source         = "f5devcentral/ibmcloud_schematics_bigip_multinic_declared"
    template_version        = "${template.template_version || "20210201"}"
    zone                    = ${composedZone(config, template.zone)}
    vpc                     = ${vpcRef(template.vpc)}
    app_id                  = "${template.app_id || "null"}"
  }
}
`;
}

/**
 * format f5 vsi
 * @param {Object} vsi
 * @param {string} vsi.image
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @returns {string} terraform formatted string
 */
function formatF5Vsi(vsi, config) {
  vsi.user_data = `data.template_file.user_data_${snakeCase(
    vsi.name
  )}.rendered`;
  let tf = formatVsi(vsi, config).replace(
    new RegexButWithWords()
      .literal("data.ibm_is_image.")
      .negatedSet("\n")
      .oneOrMore()
      .look.ahead("\n")
      .done("g"),
    `local.public_image_id["${vsi.image}"]["${config._options.region}"]`
  );
  return tf;
}

/**
 * create f5 template data
 * @param {Object} config
 * @param {Array<Object>} config.f5_vsi
 * @param {string} config.f5_vsi.name
 * @param {Object} config.f5_vsi.template
 * @returns {string} terraform string data
 */
function f5Tf(config) {
  let tf = f5ImageLocals() + "\n" + f5TemplateLocals({}) + "\n";
  config.f5_vsi.forEach(instance => {
    let blockData =
      f5TemplateUserData(instance.template, config) +
      formatF5Vsi(instance, config);
    tf += tfBlock(`${instance.name} Vsi`, blockData);
  });
  return tf;
}

module.exports = {
  f5ImageLocals,
  f5CloudInitYaml,
  f5TemplateLocals,
  f5TemplateUserData,
  formatF5Vsi,
  f5Tf
};
