const { snakeCase, getObjectFromArray } = require("lazy-z");
const {
  jsonToTfPrint,
  kebabName,
  timeouts,
  rgIdRef,
  vpcRef,
  composedZone,
  tfRef,
  tfBlock,
} = require("./utils");

/**
 * format fortigate terraform
 * @param {*} gw
 * @returns {string} Terraform formatted string
 */
function formatFortigate(gw, config) {
  let randomSuffix = `-\${random_string.${snakeCase(
    gw.name
  )}_random_suffix.result}`;
  let securityGroups = gw.security_groups.map((sg) => {
    return `\${module.${snakeCase(gw.vpc)}_vpc.${snakeCase(sg)}_id}`;
  });
  return (
    jsonToTfPrint("data", "template_file", `${gw.name} vnf userdata`, {
      template: `\${<<TEMPLATE
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
  TEMPLATE}`,
    }) +
    jsonToTfPrint("resource", "random_string", `${gw.name} random suffix`, {
      length: 4,
      special: true,
      override_special: "",
      min_lower: 4,
    }) +
    jsonToTfPrint("resource", "ibm_is_image", `${gw.name} vnf custom image`, {
      href: "cos://us-geo/fortinet/fortigate_byol_742_b2571_GA.qcow2",
      name: kebabName([gw.name, "custom", "image"], randomSuffix),
      operating_system: "ubuntu-18-04-amd64",
      timeouts: timeouts("30m", null, "10m"),
    }) +
    jsonToTfPrint("resource", "ibm_is_volume", `${gw.name} vnf log volume`, {
      name: kebabName([gw.name, "logdisk"], randomSuffix),
      profile: "10iops-tier",
      zone: composedZone(gw.zone),
    }) +
    jsonToTfPrint(
      "resource",
      "ibm_is_instance",
      `${gw.name} fortigate vnf vsi`,
      {
        name: kebabName([gw.name, "vnf", "vsi"]),
        resource_group: rgIdRef(gw.resource_group, config),
        image: `\${ibm_is_image.${snakeCase(gw.name)}_vnf_custom_image.id}`,
        profile: gw.profile,
        vpc: vpcRef(gw.vpc, "id", true),
        zone: composedZone(gw.zone),
        user_data: `\${data.template_file.${gw.name}_vnf_userdata.rendered}`,
        primary_network_interface: [
          {
            name: kebabName([gw.name, "port1"], randomSuffix),
            subnet: `\${module.${snakeCase(gw.vpc)}_vpc.${snakeCase(
              gw.primary_subnet
            )}_id}`,
            security_groups: securityGroups,
          },
        ],
        network_interfaces: [
          {
            name: kebabName([gw.name, "port2"], randomSuffix),
            subnet: `\${module.${snakeCase(gw.vpc)}_vpc.${snakeCase(
              gw.secondary_subnet
            )}_id}`,
            security_groups: securityGroups,
          },
        ],
        keys: gw.ssh_keys.map((key) => {
          return tfRef(
            "ibm_is_ssh_key",
            key,
            "id",
            getObjectFromArray(config.ssh_keys, "name", key)?.use_data
          );
        }),
        volumes: [`\${ibm_is_volume.${snakeCase(gw.name)}_vnf_log_volume.id}`],
      }
    )
  );
}

/**
 * create terraform file for fortigate
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function fortigateTf(config) {
  let gwTf = "";
  (config.fortigate_vnf || []).forEach((gw) => {
    gwTf += tfBlock(
      gw.name + " Fortigate Gateway",
      formatFortigate(gw, config)
    );
  });
  return gwTf === "" ? null : gwTf;
}

module.exports = {
  formatFortigate,
  fortigateTf,
};
