const {
  snakeCase,
  getObjectFromArray,
  distinct,
  splat,
  transpose
} = require("lazy-z");
const { endComment } = require("./constants");
const {
  rgIdRef,
  buildTitleComment,
  jsonToTf,
  tfRef,
  vpcRef,
  composedZone,
  encryptionKeyRef,
  subnetRef
} = require("./utils");

/**
 * format vsi
 * @param {Object} vsi
 * @param {string} vsi.kms
 * @param {string} vsi.encryption_key
 * @param {string} vsi.image
 * @param {string} vsi.profile
 * @param {string} vsi.name
 * @param {Array<string>} vsi.security_groups
 * @param {Array<string>} vsi.ssh_keys
 * @param {string} vsi.subnet
 * @param {string} vsi.vpc
 * @param {number} vsi.index
 * @param {string} vsi.resource_group
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {string} config._options.prefix
 * @returns {string} terraform formatted vsi
 */
function formatVsi(vsi, config) {
  let zone = vsi.subnet.replace(/[^]+(?=\d$)/g, "");
  let vsiName = vsi.index
    ? `${config._options.prefix}-${snakeCase(vsi.vpc)}-${
        vsi.name
      }-vsi-zone-${zone}-${vsi.index}`
    : vsi.name;
  let allSgIds = [],
    allSshKeyIds = [],
    networkInterfaces = [];
  // add nework interfaces
  if (vsi.network_interfaces)
    vsi.network_interfaces.forEach(interface => {
      let nwInterface = {
        subnet: subnetRef(vsi.vpc, interface.subnet),
        allow_ip_spoofing: true,
        "*security_groups": []
      };
      interface.security_groups.forEach(group => {
        nwInterface["*security_groups"].push(
          tfRef(`ibm_is_security_group`, `${vsi.vpc} vpc ${group} sg`)
        );
      });
      networkInterfaces.push(nwInterface);
    });
  // add security groups
  vsi.security_groups.forEach(group => {
    allSgIds.push(tfRef(`ibm_is_security_group`, `${vsi.vpc} vpc ${group} sg`));
  });
  // add ssh keys
  vsi.ssh_keys.forEach(key => {
    allSshKeyIds.push(
      tfRef(
        `ibm_is_ssh_key`,
        key,
        "id",
        getObjectFromArray(config.ssh_keys, "name", key).use_data
      )
    );
  });
  let vsiValues = {
    name: `"${vsiName}"`,
    image: tfRef("ibm_is_image", vsi.image, "id", true),
    profile: `"${vsi.profile}"`,
    resource_group: rgIdRef(vsi.resource_group, config),
    vpc: vpcRef(vsi.vpc),
    zone: composedZone(config, zone),
    tags: true
  };
  if (vsi.user_data) {
    vsiValues.user_data = vsi.user_data;
  }
  vsiValues["*keys"] = allSshKeyIds;
  vsiValues._primary_network_interface = {
    subnet: subnetRef(vsi.vpc, vsi.subnet),
    "*security_groups": allSgIds
  };
  if (networkInterfaces.length > 0) {
    vsiValues["-network_interfaces"] = networkInterfaces;
  }
  vsiValues._boot_volume = {
    encryption: encryptionKeyRef(vsi.kms, vsi.encryption_key)
  };

  return jsonToTf(
    "ibm_is_instance",
    vsi.index
      ? `${vsi.vpc} vpc ${vsi.name} vsi ${zone} ${vsi.index}`
      : vsi.name,
    vsiValues,
    config
  );
}

/**
 * format vsi image data block
 * @param {string} imageName
 * @returns {string} terraform formatted code
 */
function formatVsiImage(imageName) {
  return jsonToTf(
    "ibm_is_image",
    imageName,
    {
      name: `"${imageName}"`
    },
    {},
    true
  );
}

/**
 * vsi terraform
 * @param {Object} config
 * @param {Array<Object>} config.vsi
 * @returns {string} terraform string
 */
function vsiTf(config) {
  let tf = buildTitleComment("image data", "sources");
  let allImagesNames = distinct(splat(config.vsi, "image"));
  allImagesNames.forEach(name => {
    tf += formatVsiImage(name);
  });
  tf += endComment + "\n\n";
  config.vsi.forEach(deployment => {
    tf += buildTitleComment(
      `${deployment.vpc} vpc`,
      `${deployment.name} deployment`
    );
    deployment.subnets.forEach(subnet => {
      for (let i = 0; i < deployment.vsi_per_subnet; i++) {
        let instance = {};
        transpose(deployment, instance);
        instance.subnet = subnet;
        instance.index = i + 1;
        tf += formatVsi(instance, config);
      }
    });
    tf += endComment + "\n\n";
  });
  return tf.replace(/\n\n$/g, "\n");
}

module.exports = {
  formatVsi,
  formatVsiImage,
  vsiTf
};
